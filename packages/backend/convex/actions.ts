import type { ActionDetails } from "@lifelink/contracts/actions";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action as publicAction, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { audit } from "./lib/audit";
import {
  afterActionFailed,
  afterActionSucceeded,
  channelFor,
  rideRequestBody,
  settleTaskStatus,
} from "./lib/journey";
import {
  approveAction,
  assertNoReconciliation,
  currentVersionOf,
  prepareRetry,
  reviseAction,
  settleUnknownAttempt,
} from "./lib/lifecycle";
import type { Ambiguity } from "./lib/lifecycle";
import { requireOwned, requireOwner } from "./lib/session";
import { formatDay, formatTime } from "./lib/time";

const loadOwnedAction = async (
  ctx: MutationCtx,
  actionId: Doc<"actions">["_id"]
): Promise<{ action: Doc<"actions">; owner: Doc<"profiles"> }> => {
  const owner = await requireOwner(ctx);
  const action = requireOwned(await ctx.db.get(actionId), owner, "action");

  return { action, owner };
};

export const approve = mutation({
  args: {
    actionId: v.id("actions"),
    fingerprint: v.string(),
    method: v.union(
      v.literal("tap"),
      v.literal("keyboard"),
      v.literal("offline_queue")
    ),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const { action, owner } = await loadOwnedAction(ctx, args.actionId);

    await approveAction(ctx, owner, action, {
      fingerprint: args.fingerprint,
      method: args.method,
      version: args.version,
    });
    await settleTaskStatus(ctx, action.taskId);
    await ctx.scheduler.runAfter(0, internal.execution.run, {
      actionId: action._id,
    });
  },
});

const MAX_MESSAGES_TOGETHER = 20;

/**
 * One transaction approves the exact displayed messages, or none of them.
 * With a task, the set must be every message still waiting in that task;
 * without one, the messages may come from several separately prepared tasks.
 */
export const approveMessages = mutation({
  args: {
    messages: v.array(
      v.object({
        actionId: v.id("actions"),
        fingerprint: v.string(),
        version: v.number(),
      })
    ),
    method: v.union(v.literal("tap"), v.literal("keyboard")),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const requested = new Set(args.messages.map((item) => item.actionId));

    if (
      args.messages.length === 0 ||
      args.messages.length > MAX_MESSAGES_TOGETHER
    ) {
      throw new ConvexError("Choose between 1 and 20 messages to send.");
    }

    if (requested.size !== args.messages.length) {
      throw new ConvexError(
        "The messages changed. Review the remaining messages before sending all."
      );
    }

    if (args.taskId !== undefined) {
      const task = requireOwned(await ctx.db.get(args.taskId), owner, "task");

      if (task.kind !== "send_message") {
        throw new ConvexError("Choose between 1 and 20 messages to send.");
      }

      const taskActions = await ctx.db
        .query("actions")
        .withIndex("by_task", (index) => index.eq("taskId", task._id))
        .take(MAX_MESSAGES_TOGETHER + 1);

      const waiting = taskActions.filter(
        (item) => item.status === "awaiting_approval"
      );

      if (
        waiting.length !== requested.size ||
        waiting.some((item) => !requested.has(item._id))
      ) {
        throw new ConvexError(
          "The messages changed. Review the remaining messages before sending all."
        );
      }
    }

    const actions = await Promise.all(
      args.messages.map(async (message) =>
        requireOwned(await ctx.db.get(message.actionId), owner, "action")
      )
    );

    if (
      actions.some(
        (item) =>
          item.kind !== "send_message" ||
          (args.taskId !== undefined && item.taskId !== args.taskId)
      )
    ) {
      throw new ConvexError("Only messages can be sent together.");
    }

    for (const [index, action] of actions.entries()) {
      const message = args.messages[index];

      if (message === undefined) {
        continue;
      }

      // oxlint-disable-next-line eslint/no-await-in-loop -- all approvals and scheduled sends share this transaction and roll back together.
      await approveAction(ctx, owner, action, {
        fingerprint: message.fingerprint,
        method: args.method,
        version: message.version,
      });
      // oxlint-disable-next-line eslint/no-await-in-loop -- jobs are committed only if every approval succeeds.
      await ctx.scheduler.runAfter(0, internal.execution.run, {
        actionId: action._id,
      });
    }

    const taskIds = new Set(actions.map((item) => item.taskId));

    await Promise.all(
      [...taskIds].map(async (taskId) => await settleTaskStatus(ctx, taskId))
    );
  },
});

/** The person edits details. Consequential edits need a fresh approval. */
export const revise = mutation({
  args: {
    actionId: v.id("actions"),
    body: v.optional(v.string()),
    remindAt: v.optional(v.number()),
    shareWithCircle: v.optional(v.boolean()),
    subject: v.optional(v.string()),
    text: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { action } = await loadOwnedAction(ctx, args.actionId);
    const current = await currentVersionOf(ctx, action);
    const details: ActionDetails = { ...current.details };
    const changes: string[] = [];

    if (
      (details.kind === "send_message" ||
        details.kind === "email_draft" ||
        details.kind === "email_reply") &&
      args.body !== undefined
    ) {
      const body = args.body.trim();

      if (body.length === 0) {
        throw new ConvexError({
          code: "invalid",
          message: "The message cannot be empty.",
        });
      }

      details.body = body;
      changes.push("changed the words");
    }

    if (details.kind === "email_draft" && args.subject !== undefined) {
      details.subject = args.subject.trim();
      changes.push("changed the subject");
    }

    if (details.kind === "create_reminder") {
      if (args.title !== undefined) {
        details.title = args.title.trim() || details.title;
        changes.push("changed the reminder text");
      }

      if (args.remindAt !== undefined) {
        if (args.remindAt < Date.now()) {
          throw new ConvexError({
            code: "invalid",
            message: "Please choose a time that has not passed yet.",
          });
        }

        details.remindAt = args.remindAt;
        changes.push("changed the reminder time");
      }

      if (args.shareWithCircle !== undefined) {
        details.shareWithCircle = args.shareWithCircle;
        changes.push(
          args.shareWithCircle ? "chose to share it" : "chose not to share it"
        );
      }
    }

    if (details.kind === "family_update" && args.text !== undefined) {
      details.text = args.text.trim() || details.text;
      changes.push("changed the update");
    }

    if (changes.length === 0) {
      return { approvalInvalidated: false, version: action.currentVersion };
    }

    return await reviseAction(ctx, action, {
      ambiguities: current.ambiguities,
      details,
      proposedBy: "person",
      reason: `You ${changes.join(" and ")}.`,
    });
  },
});

/** Point a message at the chosen contact's preferred channel. */
const applyRecipient = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">,
  task: Doc<"tasks">,
  details: ActionDetails,
  value: string
): Promise<void> => {
  if (details.kind !== "send_message") {
    return;
  }

  const contactId = ctx.db.normalizeId("contacts", value);

  const contact =
    contactId === null
      ? null
      : requireOwned(await ctx.db.get(contactId), owner, "contact");

  const channel = contact === null ? null : channelFor(contact);

  if (contact === null || channel === null) {
    throw new ConvexError({
      code: "invalid",
      message: "That person has no way to be reached yet.",
    });
  }

  details.contactId = contact._id;
  details.contactName = contact.name;
  details.channel = channel.channel;
  details.address = channel.address;
  await ctx.db.patch(task._id, { contactId: contact._id });
};

const applyAppointment = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">,
  task: Doc<"tasks">,
  value: string
): Promise<void> => {
  const appointmentId = ctx.db.normalizeId("appointments", value);

  const appointment =
    appointmentId === null
      ? null
      : requireOwned(await ctx.db.get(appointmentId), owner, "appointment");

  if (appointment !== null) {
    await ctx.db.patch(task._id, {
      appointmentId: appointment._id,
      title: `Ride to ${appointment.title}`,
    });
  }
};

const applyPickup = (
  owner: Doc<"profiles">,
  details: ActionDetails,
  value: string
): void => {
  if (details.kind !== "confirm_arrangement") {
    return;
  }

  const pickupAt = Number(value);

  details.pickupAt = pickupAt;
  details.summary = `${details.contactName.split(" ")[0] ?? details.contactName} will drive you on ${formatDay(pickupAt, owner.timeZone)}, picking you up at ${formatTime(pickupAt, owner.timeZone)}.`;
};

/** Ride messages are written from the stored appointment, so rebuild the words after a change. */
const rebuildRideBody = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">,
  taskId: Doc<"tasks">["_id"],
  details: ActionDetails
): Promise<void> => {
  if (details.kind !== "send_message") {
    return;
  }

  const task = await ctx.db.get(taskId);

  if (task?.kind !== "ride_request" || task.appointmentId === null) {
    return;
  }

  const appointment = await ctx.db.get(task.appointmentId);
  const contactId = ctx.db.normalizeId("contacts", details.contactId);
  const contact = contactId === null ? null : await ctx.db.get(contactId);

  if (appointment !== null && contact !== null) {
    details.body = await rideRequestBody(ctx, owner, contact, appointment);
  }
};

/** Answer an open question (who, which appointment, what time). Produces a new version. */
export const resolveAmbiguity = mutation({
  args: { actionId: v.id("actions"), field: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const { action, owner } = await loadOwnedAction(ctx, args.actionId);
    const current = await currentVersionOf(ctx, action);

    const ambiguity = current.ambiguities.find(
      (item) => item.field === args.field
    );

    const option = ambiguity?.options.find(
      (candidate) => candidate.value === args.value
    );

    if (ambiguity === undefined || option === undefined) {
      throw new ConvexError({
        code: "invalid",
        message: "Please choose one of the options shown.",
      });
    }

    const task = await ctx.db.get(action.taskId);

    if (task === null) {
      throw new ConvexError({
        code: "not_found",
        message: "That task could not be found.",
      });
    }

    const ambiguities: Ambiguity[] = current.ambiguities.map((item) =>
      item.field === args.field ? { ...item, resolvedValue: args.value } : item
    );

    const details: ActionDetails = { ...current.details };

    if (args.field === "recipient") {
      await applyRecipient(ctx, owner, task, details, args.value);
    } else if (args.field === "appointment") {
      await applyAppointment(ctx, owner, task, args.value);
    } else if (args.field === "pickup") {
      applyPickup(owner, details, args.value);
    }

    await rebuildRideBody(ctx, owner, task._id, details);

    const result = await reviseAction(ctx, action, {
      ambiguities,
      details,
      proposedBy: "person",
      reason: `You answered: ${option.label}.`,
    });

    if (!ambiguities.some((item) => item.resolvedValue === null)) {
      await settleTaskStatus(ctx, task._id);
    }

    return result;
  },
});

export const cancel = mutation({
  args: { actionId: v.id("actions") },
  handler: async (ctx, args) => {
    const { action, owner } = await loadOwnedAction(ctx, args.actionId);

    assertNoReconciliation(action);

    if (
      action.status !== "awaiting_approval" &&
      action.status !== "approved" &&
      action.status !== "failed"
    ) {
      throw new ConvexError({
        code: "locked",
        message: "This has already started, so it can no longer be cancelled.",
      });
    }

    const now = Date.now();

    await ctx.db.patch(action._id, { status: "cancelled", updatedAt: now });

    if (action.stepId !== null) {
      await ctx.db.patch(action.stepId, {
        detail: "You cancelled this.",
        status: "skipped",
        updatedAt: now,
      });
    }

    const remaining = await ctx.db
      .query("actions")
      .withIndex("by_task", (index) => index.eq("taskId", action.taskId))
      .collect();

    const hasOtherWork = remaining.some((item) => item.status !== "cancelled");

    await (hasOtherWork
      ? settleTaskStatus(ctx, action.taskId)
      : ctx.db.patch(action.taskId, { status: "cancelled", updatedAt: now }));

    await audit(ctx, {
      actor: "person",
      detail: "Cancelled.",
      event: "action.cancelled",
      ownerId: owner._id,
      taskId: action.taskId,
    });
  },
});

/** Retry only work that definitely did not happen. */
export const retry = mutation({
  args: { actionId: v.id("actions") },
  handler: async (ctx, args) => {
    const { action, owner } = await loadOwnedAction(ctx, args.actionId);

    await prepareRetry(ctx, action);
    await settleTaskStatus(ctx, action.taskId);
    await audit(ctx, {
      actor: "person",
      detail: "Tried again.",
      event: "action.retry",
      ownerId: owner._id,
      taskId: action.taskId,
    });
    await ctx.scheduler.runAfter(0, internal.execution.run, {
      actionId: action._id,
    });
  },
});

/** Ask the provider whether an unknown attempt went through. */
export const checkOutcome = publicAction({
  args: { actionId: v.id("actions") },
  handler: async (
    ctx,
    args
  ): Promise<"cannot_tell" | "not_sent" | "went_through"> => {
    await ctx.runQuery(internal.ownership.assertOwnsUnknown, {
      actionId: args.actionId,
    });

    return await ctx.runAction(internal.execution.reconcile, {
      actionId: args.actionId,
    });
  },
});

/** When the provider cannot tell, the person can record what they found. */
export const markOutcome = mutation({
  args: { actionId: v.id("actions"), wentThrough: v.boolean() },
  handler: async (ctx, args) => {
    const { action } = await loadOwnedAction(ctx, args.actionId);

    await settleUnknownAttempt(
      ctx,
      action,
      args.wentThrough,
      args.wentThrough
        ? "You checked and confirmed it went through."
        : "You checked and found it did not go through."
    );

    const updated = await ctx.db.get(action._id);
    const version = await currentVersionOf(ctx, action);

    const message = await ctx.db
      .query("messages")
      .withIndex("by_action", (index) => index.eq("actionId", action._id))
      .first();

    if (message !== null) {
      await ctx.db.patch(message._id, {
        status: args.wentThrough ? "sent" : "failed",
        statusUpdatedAt: Date.now(),
      });
    }

    if (updated !== null) {
      await (args.wentThrough
        ? afterActionSucceeded(ctx, updated, version.details)
        : afterActionFailed(ctx, updated));
    }
  },
});

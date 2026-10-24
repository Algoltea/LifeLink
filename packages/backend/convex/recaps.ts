/**
 * Conversation recaps for text conversations with one contact: what was
 * agreed, what was only offered, what is unclear, and possible next steps.
 *
 * An offer is not an agreement, and nothing is "done" unless LifeLink's own
 * task records say so. Proposed steps are prepared through the same
 * server-side resolution as assistant proposals, then wait for the person's
 * approval of the exact version. Recaps are private to the owner, never use
 * their communication notes, and are never read by a family query.
 */
import { helpStyleKey, helpStyleOf } from "@lifelink/contracts/help-style";
import type { HelpStyle } from "@lifelink/contracts/help-style";
import { conversationRecapSchema } from "@lifelink/contracts/model-output";
import type { Proposal } from "@lifelink/contracts/model-output";
import {
  checkRecap,
  localRecap,
  recapRequest,
} from "@lifelink/contracts/recap";
import type { CheckedRecap, RecapLine } from "@lifelink/contracts/recap";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { decodeJson } from "./integrations/http";
import {
  openRouterConfigured,
  structuredCompletion,
} from "./integrations/openrouter";
import { signOff } from "./lib/journey";
import { applyProposal } from "./lib/proposals";
import { requireOwned, requireOwner } from "./lib/session";
import { DAY, isoWithOffset } from "./lib/time";
import { reserveCloudUse } from "./lib/usage";

const MAX_LINES = 20;
const DONE_WINDOW = 30 * DAY;

type Recap = Doc<"conversationRecaps">;

// Only words that really reached the other person count as something you said.
const SENT_STATUSES = new Set<Doc<"messages">["status"]>([
  "sent",
  "delivered",
  "read",
]);

interface Conversation {
  lastMessageId: Id<"messages">;
  lines: RecapLine[];
  mode: Recap["mode"];
}

const conversationWith = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">,
  contact: Doc<"contacts">
): Promise<Conversation | null> => {
  const recent = await ctx.db
    .query("messages")
    .withIndex("by_owner_contact", (index) =>
      index.eq("ownerId", owner._id).eq("contactId", contact._id)
    )
    .order("desc")
    .take(MAX_LINES * 2);

  const said = recent
    .filter(
      (message) =>
        message.body.trim().length > 0 &&
        (message.direction === "incoming" || SENT_STATUSES.has(message.status))
    )
    .slice(0, MAX_LINES)
    .toReversed();

  const newest = said.at(-1);

  if (newest === undefined) {
    return null;
  }

  return {
    lastMessageId: newest._id,
    lines: said.map((message, index) => ({
      body: message.body,
      from: message.direction === "incoming" ? "them" : "you",
      ref: `m${index + 1}`,
    })),
    mode: said.some((message) => message.mode === "simulated")
      ? "simulated"
      : "live",
  };
};

const recapStyleOf = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">
): Promise<Omit<HelpStyle, "notes">> => {
  const { notes: _private, ...style } = helpStyleOf(
    await ctx.db
      .query("preferences")
      .withIndex("by_profile", (index) => index.eq("profileId", owner._id))
      .unique()
  );

  return style;
};

const styleKeyOf = (style: Omit<HelpStyle, "notes">): string =>
  helpStyleKey({ ...style, notes: "" });

const contentOf = (recap: CheckedRecap) => ({
  agreements: recap.agreements,
  droppedCount: recap.droppedCount,
  offers: recap.offers,
  proposedSteps: recap.proposedSteps.map((step) => ({
    ...step,
    taskId: null,
  })),
  summary: recap.summary,
  unclear: recap.unclear,
});

const latestFor = async (
  ctx: QueryCtx,
  ownerId: Id<"profiles">,
  contactId: Id<"contacts">
): Promise<Recap | null> =>
  await ctx.db
    .query("conversationRecaps")
    .withIndex("by_owner_and_contact", (index) =>
      index.eq("ownerId", ownerId).eq("contactId", contactId)
    )
    .order("desc")
    .first();

/** Recap the recent conversation with one contact. Returns the recap to watch. */
export const request = mutation({
  args: {
    allowCloudAnalysis: v.optional(v.boolean()),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args): Promise<Id<"conversationRecaps">> => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const conversation = await conversationWith(ctx, owner, contact);

    if (conversation === null) {
      throw new ConvexError({
        code: "invalid",
        message: `There are no messages with ${contact.name} to recap yet.`,
      });
    }

    const wantsCloud = args.allowCloudAnalysis === true;
    const style = await recapStyleOf(ctx, owner);
    const styleKey = styleKeyOf(style);
    const latest = await latestFor(ctx, owner._id, contact._id);

    // The same messages and preferences give the same recap, unless the person now asks for more.
    const stillFits =
      latest !== null &&
      latest.status !== "failed" &&
      latest.lastMessageId === conversation.lastMessageId &&
      latest.helpStyleKey === styleKey &&
      (latest.method === "cloud" || !wantsCloud);

    if (latest !== null && stillFits) {
      return latest._id;
    }

    const practice = owner.demoMode || conversation.mode === "simulated";
    let localReason: Recap["localReason"] = null;

    if (!wantsCloud) {
      localReason = "chosen";
    } else if (practice) {
      localReason = "practice";
    } else if (!openRouterConfigured()) {
      localReason = "unavailable";
    } else if (!(await reserveCloudUse(ctx, owner._id, "recap"))) {
      localReason = "limit";
    }

    const useCloud = localReason === null;

    const recapId = await ctx.db.insert("conversationRecaps", {
      ...contentOf(
        localRecap(conversation.lines, {
          contactName: contact.name,
          signOff: signOff(owner),
        })
      ),
      cloudRequested: wantsCloud && !practice,
      contactId: contact._id,
      createdAt: Date.now(),
      helpStyleKey: styleKey,
      lastMessageId: conversation.lastMessageId,
      lines: conversation.lines,
      localReason,
      method: useCloud ? "cloud" : "local",
      mode: practice ? "simulated" : "live",
      model: useCloud ? "" : "local",
      ownerId: owner._id,
      status: useCloud ? "recapping" : "done",
    });

    if (useCloud) {
      await ctx.scheduler.runAfter(0, internal.recaps.run, { recapId });
    }

    return recapId;
  },
});

/** The latest recap with one contact, and what LifeLink's records show as done. Owner only. */
export const forContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const recap = await latestFor(ctx, owner._id, contact._id);

    if (recap === null) {
      return null;
    }

    const completed = await ctx.db
      .query("tasks")
      .withIndex("by_contact_status", (index) =>
        index.eq("contactId", contact._id).eq("status", "completed")
      )
      .order("desc")
      .take(20);

    return {
      done: completed
        .filter(
          (task) =>
            task.ownerId === owner._id &&
            task.updatedAt >= recap.createdAt - DONE_WINDOW
        )
        .slice(0, 5)
        .map((task) => ({
          id: task._id,
          mode: task.mode,
          title: task.title,
          updatedAt: task.updatedAt,
        })),
      recap,
    };
  },
});

export const runInput = internalQuery({
  args: { recapId: v.id("conversationRecaps") },
  handler: async (ctx, args) => {
    const recap = await ctx.db.get(args.recapId);
    const owner = recap === null ? null : await ctx.db.get(recap.ownerId);
    const contact = recap === null ? null : await ctx.db.get(recap.contactId);

    if (recap === null || owner === null || contact === null) {
      return null;
    }

    return {
      messages: recapRequest({
        contactName: contact.name,
        helpStyle: await recapStyleOf(ctx, owner),
        lines: recap.lines,
        name: owner.preferredName,
        now: isoWithOffset(Date.now(), owner.timeZone),
        signOff: signOff(owner),
        timeZone: owner.timeZone,
      }),
      status: recap.status,
    };
  },
});

export const run = internalAction({
  args: { recapId: v.id("conversationRecaps") },
  handler: async (ctx, args): Promise<void> => {
    const input = await ctx.runQuery(internal.recaps.runInput, args);

    if (input === null || input.status !== "recapping") {
      return;
    }

    const result = await structuredCompletion({
      messages: input.messages,
      schema: conversationRecapSchema,
      schemaName: "conversation_recap",
      tier: "fast",
    });

    await ctx.runMutation(internal.recaps.finish, {
      model: result.ok ? result.model : null,
      recapId: args.recapId,
      resultJson: result.ok ? JSON.stringify(result.value) : null,
    });
  },
});

const finishLocally = async (ctx: MutationCtx, recap: Recap): Promise<void> => {
  await ctx.db.patch(recap._id, {
    localReason: "failed",
    method: "local",
    model: "local",
    status: "done",
  });
};

/** Hold the model to the messages it read; on any failure, keep the local recap and say so. */
export const finish = internalMutation({
  args: {
    model: v.union(v.string(), v.null()),
    recapId: v.id("conversationRecaps"),
    resultJson: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const recap = await ctx.db.get(args.recapId);

    if (recap === null || recap.status !== "recapping") {
      return;
    }

    const decoded =
      args.resultJson === null
        ? null
        : decodeJson(conversationRecapSchema, args.resultJson);

    if (decoded === null || args.model === null) {
      await finishLocally(ctx, recap);

      return;
    }

    await ctx.db.patch(recap._id, {
      ...contentOf(checkRecap(decoded, recap.lines, Date.now())),
      model: args.model,
      status: "done",
    });
  },
});

const proposalFor = (
  step: Recap["proposedSteps"][number],
  contact: Doc<"contacts">,
  owner: Doc<"profiles">
): Proposal => ({
  appointmentId: null,
  dateTimeAsSaid: null,
  dateTimeIso:
    step.remindAt === null
      ? null
      : isoWithOffset(step.remindAt, owner.timeZone),
  groceryItems: [],
  intent: step.kind,
  messageDraft: step.messageDraft,
  recipients:
    step.kind === "send_message"
      ? [{ contactId: contact._id, nameAsSaid: contact.name }]
      : [],
  reminderTitle: step.reminderTitle,
});

/**
 * Prepare one proposed step for review. It is resolved against stored data
 * like any assistant proposal and waits for approval of its exact version.
 */
export const prepareStep = mutation({
  args: { index: v.number(), recapId: v.id("conversationRecaps") },
  handler: async (ctx, args): Promise<Id<"tasks">> => {
    const owner = await requireOwner(ctx);
    const recap = requireOwned(await ctx.db.get(args.recapId), owner, "recap");
    const step = recap.proposedSteps[args.index];

    if (step === undefined) {
      throw new ConvexError({
        code: "not_found",
        message: "That step could not be found.",
      });
    }

    if (step.taskId !== null) {
      return step.taskId;
    }

    if (recap.mode === "simulated" && !owner.demoMode) {
      throw new ConvexError({
        code: "practice_mode",
        message:
          "This recap was made in Practice mode. Make a new recap before preparing anything real.",
      });
    }

    const contact = requireOwned(
      await ctx.db.get(recap.contactId),
      owner,
      "contact"
    );

    const outcome = await applyProposal(
      ctx,
      owner,
      proposalFor(step, contact, owner),
      `From a recap of your conversation with ${contact.name}.`,
      "text",
      recap.model || "local recap"
    );

    if (outcome.taskId === null) {
      throw new ConvexError({ code: "invalid", message: outcome.message });
    }

    await ctx.db.patch(recap._id, {
      proposedSteps: recap.proposedSteps.map((item, index) =>
        index === args.index ? { ...item, taskId: outcome.taskId } : item
      ),
    });

    return outcome.taskId;
  },
});

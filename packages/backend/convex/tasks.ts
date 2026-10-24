import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { executionProblems } from "./lib/capabilities";
import { requireOwned, requireOwner } from "./lib/session";

const ACTIVE_STATUSES = new Set<Doc<"tasks">["status"]>([
  "needs_clarification",
  "awaiting_approval",
  "in_progress",
  "waiting_for_reply",
  "needs_attention",
]);

export const list = query({
  args: { include: v.union(v.literal("active"), v.literal("all")) },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_owner_updated", (index) => index.eq("ownerId", owner._id))
      .order("desc")
      .take(50);

    return args.include === "all"
      ? tasks
      : tasks.filter((task) => ACTIVE_STATUSES.has(task.status));
  },
});

/** Names of the trusted-circle members a family update would reach. */
const granteeNamesOf = async (
  ctx: QueryCtx,
  granteeIds: string[]
): Promise<string[]> => {
  const names = await Promise.all(
    granteeIds.map(async (granteeId) => {
      const grantId = ctx.db.normalizeId("sharingGrants", granteeId);
      const grant = grantId === null ? null : await ctx.db.get(grantId);
      const contact = grant === null ? null : await ctx.db.get(grant.contactId);

      return contact?.name ?? null;
    })
  );

  return names.flatMap((name) => (name === null ? [] : [name]));
};

const actionView = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">,
  action: Doc<"actions">
) => {
  const versions = await ctx.db
    .query("actionVersions")
    .withIndex("by_action_version", (index) => index.eq("actionId", action._id))
    .collect();

  const current =
    versions.find((version) => version.version === action.currentVersion) ??
    null;

  const approvals = await ctx.db
    .query("approvals")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .collect();

  const attempts = await ctx.db
    .query("executionAttempts")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .collect();

  const receipts = await ctx.db
    .query("providerReceipts")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .collect();

  const invalidated = approvals.filter(
    (approval) => approval.invalidatedAt !== null
  );

  const previous =
    versions
      .filter((version) => version.version < action.currentVersion)
      .toSorted((left, right) => right.version - left.version)[0] ?? null;

  const granteeNames =
    current?.details.kind === "family_update"
      ? await granteeNamesOf(ctx, current.details.granteeIds)
      : [];

  // The same checks approval runs, so the screen can explain a block before
  // the person presses approve instead of after.
  const blockers =
    action.status === "awaiting_approval" && current !== null
      ? await executionProblems(ctx, owner, current.details, action.mode)
      : [];

  return {
    action,
    attempts: attempts.map((attempt) => ({
      attemptNumber: attempt.attemptNumber,
      error: attempt.error,
      finishedAt: attempt.finishedAt,
      outcome: attempt.outcome,
      provider: attempt.provider,
      startedAt: attempt.startedAt,
      version: attempt.version,
    })),
    blockers,
    current,
    currentApproval:
      approvals.find(
        (approval) =>
          approval.version === action.currentVersion &&
          approval.invalidatedAt === null &&
          approval.fingerprint === current?.fingerprint
      ) ?? null,
    granteeNames,
    invalidatedApprovals: invalidated.map((approval) => ({
      reason: approval.invalidatedReason,
      version: approval.version,
    })),
    previous:
      previous === null
        ? null
        : {
            details: previous.details,
            proposedBy: previous.proposedBy,
            version: previous.version,
          },
    receipts,
    versionCount: versions.length,
  };
};

/** Everything needed to review and follow one task: steps, exact action details, approvals, attempts, receipts. */
export const detail = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const task = requireOwned(await ctx.db.get(args.taskId), owner, "task");

    const steps = await ctx.db
      .query("taskSteps")
      .withIndex("by_task", (index) => index.eq("taskId", task._id))
      .collect();

    const actions = await ctx.db
      .query("actions")
      .withIndex("by_task", (index) => index.eq("taskId", task._id))
      .collect();

    const views = await Promise.all(
      actions.map(async (action) => await actionView(ctx, owner, action))
    );

    const contact =
      task.contactId === null ? null : await ctx.db.get(task.contactId);

    const appointment =
      task.appointmentId === null ? null : await ctx.db.get(task.appointmentId);

    const threadMessages =
      contact === null
        ? []
        : await ctx.db
            .query("messages")
            .withIndex("by_owner_contact", (index) =>
              index
                .eq("ownerId", owner._id)
                .eq("contactId", contact._id)
                .gte("createdAt", task.createdAt - 60_000)
            )
            .order("desc")
            .take(20);

    return {
      actions: views,
      appointment,
      contact:
        contact === null
          ? null
          : {
              hue: contact.hue,
              id: contact._id,
              name: contact.name,
              relationship: contact.relationship,
            },
      messages: threadMessages.toReversed(),
      steps: steps.toSorted((left, right) => left.order - right.order),
      task,
      timeZone: owner.timeZone,
    };
  },
});

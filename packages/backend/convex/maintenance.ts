import type { Doc } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { audit } from "./lib/audit";
import { settleTaskStatus } from "./lib/journey";

const STALL_AFTER_MS = 10 * 60_000;

/** Mark one executing action's stalled attempt unknown. Returns whether anything changed. */
const markIfStalled = async (
  ctx: MutationCtx,
  action: Doc<"actions">,
  cutoff: number
): Promise<boolean> => {
  const attempts = await ctx.db
    .query("executionAttempts")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .collect();

  const stalled = attempts.find(
    (attempt) => attempt.outcome === "running" && attempt.startedAt < cutoff
  );

  if (stalled === undefined) {
    return false;
  }

  const now = Date.now();

  await ctx.db.patch(stalled._id, {
    error: "The attempt did not report back.",
    finishedAt: now,
    outcome: "unknown",
  });
  await ctx.db.patch(action._id, { status: "unknown", updatedAt: now });

  if (action.stepId !== null) {
    await ctx.db.patch(action.stepId, {
      detail: "We are not sure whether this went through.",
      status: "unknown",
      updatedAt: now,
    });
  }

  await settleTaskStatus(ctx, action.taskId);
  await audit(ctx, {
    actor: "system",
    detail: "Attempt stalled; marked unknown.",
    event: "action.stalled",
    ownerId: action.ownerId,
    taskId: action.taskId,
  });

  return true;
};

/** Running attempts older than ten minutes may or may not have reached the provider: mark them unknown. */
export const markStalledAttempts = internalMutation({
  args: {},
  handler: async (ctx): Promise<number> => {
    const cutoff = Date.now() - STALL_AFTER_MS;

    const executing = await ctx.db
      .query("actions")
      .withIndex("by_status", (index) => index.eq("status", "executing"))
      .take(100);

    const changed = await Promise.all(
      executing.map(async (action) => await markIfStalled(ctx, action, cutoff))
    );

    return changed.filter(Boolean).length;
  },
});

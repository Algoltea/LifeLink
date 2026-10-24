import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import { audit } from "./lib/audit";
import { requireOwned, requireOwner } from "./lib/session";
import { DAY } from "./lib/time";

export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const since = Date.now() - DAY;

    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_owner_time", (index) =>
        index.eq("ownerId", owner._id).gte("remindAt", since)
      )
      .take(30);

    return reminders.filter((reminder) => reminder.dismissedAt === null);
  },
});

/** Scheduled at the reminder time. Firing marks it due; the app shows and can read it aloud. */
export const fire = internalMutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.reminderId);

    if (
      reminder === null ||
      reminder.firedAt !== null ||
      reminder.dismissedAt !== null
    ) {
      return;
    }

    await ctx.db.patch(reminder._id, { firedAt: Date.now() });
    await audit(ctx, {
      actor: "system",
      detail: reminder.title,
      event: "reminder.fired",
      ownerId: reminder.ownerId,
    });
  },
});

export const dismiss = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const reminder = requireOwned(
      await ctx.db.get(args.reminderId),
      owner,
      "reminder"
    );

    if (reminder.scheduledJobId !== null && reminder.firedAt === null) {
      await ctx.scheduler.cancel(reminder.scheduledJobId);
    }

    await ctx.db.patch(reminder._id, { dismissedAt: Date.now() });
  },
});

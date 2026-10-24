import { redactCallQuote } from "@lifelink/contracts/call-screening";
import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireOwned, requireOwner } from "./lib/session";
import schema from "./schema";

const MAX_DURATION_MS = 30 * 60_000;
const MAX_CLOCK_SKEW_MS = 5 * 60_000;
const MAX_FLAGS = 20;
const MAX_ID_LENGTH = 100;
const MAX_QUOTE_LENGTH = 300;
const MAX_REASON_LENGTH = 140;
const RECENT_SUMMARY_LIMIT = 50;

const flagValidator = v.object({
  captionId: v.string(),
  id: v.string(),
  quote: v.string(),
  reason: v.string(),
  timeMs: v.number(),
});

const requireBoundedTime = (
  value: number,
  maximum: number,
  label: string
): void => {
  if (!Number.isFinite(value) || value < 0 || value > maximum) {
    throw new ConvexError({
      code: "invalid",
      message: `${label} must be a valid time between 0 and ${maximum} milliseconds.`,
    });
  }
};

const requireShortText = (
  value: string,
  maximum: number,
  label: string
): void => {
  if (value.trim().length === 0 || value.length > maximum) {
    throw new ConvexError({
      code: "invalid",
      message: `${label} must contain between 1 and ${maximum} characters.`,
    });
  }
};

const redactFlag = (
  flag: Doc<"scamCallSummaries">["flags"][number],
  durationMs: number
): Doc<"scamCallSummaries">["flags"][number] => {
  requireShortText(flag.id, MAX_ID_LENGTH, "Flag ID");
  requireShortText(flag.captionId, MAX_ID_LENGTH, "Caption ID");
  requireShortText(flag.quote, MAX_QUOTE_LENGTH, "Flag quote");
  requireShortText(flag.reason, MAX_REASON_LENGTH, "Flag reason");
  requireBoundedTime(flag.timeMs, durationMs, "Flag time");

  return {
    captionId: flag.captionId,
    id: flag.id,
    quote: redactCallQuote(flag.quote).slice(0, MAX_QUOTE_LENGTH),
    reason: redactCallQuote(flag.reason).slice(0, MAX_REASON_LENGTH),
    timeMs: flag.timeMs,
  };
};

/** Save only short, redacted flags; full captions and audio stay out of storage. */
export const save = mutation({
  args: {
    durationMs: v.number(),
    flags: v.array(flagValidator),
    interrupted: v.boolean(),
    practice: v.boolean(),
    sessionId: v.string(),
    startedAt: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"scamCallSummaries">> => {
    const owner = await requireOwner(ctx);
    requireShortText(args.sessionId, MAX_ID_LENGTH, "Session ID");

    const existing = await ctx.db
      .query("scamCallSummaries")
      .withIndex("by_owner_and_session", (index) =>
        index.eq("ownerId", owner._id).eq("sessionId", args.sessionId)
      )
      .unique();

    if (existing !== null) {
      return existing._id;
    }

    const now = Date.now();
    requireBoundedTime(args.startedAt, now + MAX_CLOCK_SKEW_MS, "Start time");
    requireBoundedTime(args.durationMs, MAX_DURATION_MS, "Call duration");

    if (args.flags.length > MAX_FLAGS) {
      throw new ConvexError({
        code: "invalid",
        message: `A call summary can contain at most ${MAX_FLAGS} flags.`,
      });
    }

    const flags = args.flags.map((flag) => redactFlag(flag, args.durationMs));

    return await ctx.db.insert("scamCallSummaries", {
      createdAt: now,
      durationMs: args.durationMs,
      flags,
      interrupted: args.interrupted,
      mode: owner.demoMode || args.practice ? "simulated" : "live",
      ownerId: owner._id,
      sessionId: args.sessionId,
      startedAt: args.startedAt,
    });
  },
  returns: v.id("scamCallSummaries"),
});

export const list = query({
  args: {},
  handler: async (ctx): Promise<Doc<"scamCallSummaries">[]> => {
    const owner = await requireOwner(ctx);

    return await ctx.db
      .query("scamCallSummaries")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .order("desc")
      .take(RECENT_SUMMARY_LIMIT);
  },
  returns: v.array(schema.doc("scamCallSummaries")),
});

export const get = query({
  args: { summaryId: v.id("scamCallSummaries") },
  handler: async (ctx, args): Promise<Doc<"scamCallSummaries">> => {
    const owner = await requireOwner(ctx);

    return requireOwned(
      await ctx.db.get(args.summaryId),
      owner,
      "call summary"
    );
  },
  returns: schema.doc("scamCallSummaries"),
});

export const remove = mutation({
  args: { summaryId: v.id("scamCallSummaries") },
  handler: async (ctx, args): Promise<null> => {
    const owner = await requireOwner(ctx);

    const summary = requireOwned(
      await ctx.db.get(args.summaryId),
      owner,
      "call summary"
    );

    await ctx.db.delete(summary._id);

    return null;
  },
  returns: v.null(),
});

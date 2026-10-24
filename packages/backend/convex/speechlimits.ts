import { ConvexError, v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { requireProfile } from "./lib/session";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const REQUESTS_PER_MINUTE = 10;
const CHARACTERS_PER_DAY = 100_000;
const CHARACTERS_PER_CHUNK = 600;

/** Reserve a speech chunk atomically before making a paid provider call. */
export const consume = internalMutation({
  args: { characters: v.number() },
  handler: async (ctx, { characters }): Promise<void> => {
    const profile = await requireProfile(ctx);

    if (
      !Number.isInteger(characters) ||
      characters < 1 ||
      characters > CHARACTERS_PER_CHUNK
    ) {
      throw new ConvexError({
        code: "invalid_speech_length",
        message: "Please read a shorter passage at a time.",
      });
    }

    const usage = await ctx.db
      .query("speechUsage")
      .withIndex("by_profile", (index) => index.eq("profileId", profile._id))
      .unique();

    const now = Date.now();

    const sameMinute =
      usage !== null && now - usage.minuteStartedAt < MINUTE_MS;

    const sameDay = usage !== null && now - usage.dayStartedAt < DAY_MS;
    const minuteRequests = sameMinute ? usage.minuteRequests : 0;
    const dayCharacters = sameDay ? usage.dayCharacters : 0;

    if (
      minuteRequests >= REQUESTS_PER_MINUTE ||
      dayCharacters + characters > CHARACTERS_PER_DAY
    ) {
      throw new ConvexError({
        code: "speech_limit",
        message:
          minuteRequests >= REQUESTS_PER_MINUTE
            ? "Read-aloud needs a short pause. Please try again in a minute."
            : "Today’s read-aloud limit has been reached. Please try again tomorrow.",
      });
    }

    const values = {
      dayCharacters: dayCharacters + characters,
      dayStartedAt: sameDay ? usage.dayStartedAt : now,
      minuteRequests: minuteRequests + 1,
      minuteStartedAt: sameMinute ? usage.minuteStartedAt : now,
      profileId: profile._id,
    };

    if (usage === null) {
      await ctx.db.insert("speechUsage", values);

      return;
    }

    await ctx.db.patch(usage._id, values);
  },
});

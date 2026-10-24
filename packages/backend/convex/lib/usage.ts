import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

type UsageKind = "explanation" | "recap";

const LIMITS: Record<UsageKind, { perDay: number; perMinute: number }> = {
  explanation: { perDay: 40, perMinute: 5 },
  recap: { perDay: 20, perMinute: 3 },
};

/**
 * Reserve one cloud-assistant reading before making the paid call. Returns
 * false at the limit, so the caller can fall back to a local reading and say
 * why, instead of failing.
 */
const reserveCloudUse = async (
  ctx: MutationCtx,
  profileId: Id<"profiles">,
  kind: UsageKind
): Promise<boolean> => {
  const usage = await ctx.db
    .query("assistantUsage")
    .withIndex("by_profile_and_kind", (index) =>
      index.eq("profileId", profileId).eq("kind", kind)
    )
    .unique();

  const now = Date.now();
  const sameMinute = usage !== null && now - usage.minuteStartedAt < MINUTE_MS;
  const sameDay = usage !== null && now - usage.dayStartedAt < DAY_MS;
  const minuteRequests = sameMinute ? usage.minuteRequests : 0;
  const dayRequests = sameDay ? usage.dayRequests : 0;
  const limit = LIMITS[kind];

  if (minuteRequests >= limit.perMinute || dayRequests >= limit.perDay) {
    return false;
  }

  const values = {
    dayRequests: dayRequests + 1,
    dayStartedAt: sameDay ? usage.dayStartedAt : now,
    kind,
    minuteRequests: minuteRequests + 1,
    minuteStartedAt: sameMinute ? usage.minuteStartedAt : now,
    profileId,
  };

  if (usage === null) {
    await ctx.db.insert("assistantUsage", values);

    return true;
  }

  await ctx.db.patch(usage._id, values);

  return true;
};

export { reserveCloudUse };

export type { UsageKind };

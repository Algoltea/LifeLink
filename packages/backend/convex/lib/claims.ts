import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

interface Claim {
  key: string;
  max: number;
  windowMs: number;
}

const MINUTE_MS = 60_000;

/** After a failed or refused fetch, the same place or feed waits this long. */
const RETRY_MS = 5 * MINUTE_MS;

/** Normal use needs a few fetches a minute at most; this stops scripted bursts. */
const PERSON_FETCHES_PER_MINUTE = 10;

const personClaim = (profileId: Id<"profiles">): Claim => ({
  key: `fetch-person:${profileId}`,
  max: PERSON_FETCHES_PER_MINUTE,
  windowMs: MINUTE_MS,
});

const onceUntilRetry = (key: string): Claim => ({
  key,
  max: 1,
  windowMs: RETRY_MS,
});

/**
 * Reserve outside fetches before making them, so concurrent refreshes and a
 * failing service cannot turn every page view into a request. All claims
 * pass or none are taken. Runs in one mutation, so concurrent callers are
 * serialized by Convex.
 */
const reserveFetch = async (
  ctx: MutationCtx,
  claims: readonly Claim[]
): Promise<boolean> => {
  const now = Date.now();

  const rows = await Promise.all(
    claims.map(
      async (claim) =>
        await ctx.db
          .query("fetchClaims")
          .withIndex("by_key", (index) => index.eq("key", claim.key))
          .first()
    )
  );

  const counts = claims.map((claim, index) => {
    const row = rows[index];

    return row && now - row.windowStartedAt < claim.windowMs ? row.count : 0;
  });

  if (claims.some((claim, index) => (counts[index] ?? 0) >= claim.max)) {
    return false;
  }

  await Promise.all(
    claims.map(async (claim, index) => {
      const row = rows[index];
      const count = counts[index] ?? 0;

      const values = {
        count: count + 1,
        key: claim.key,
        windowStartedAt: count === 0 || !row ? now : row.windowStartedAt,
      };

      await (row
        ? ctx.db.replace("fetchClaims", row._id, values)
        : ctx.db.insert("fetchClaims", values));
    })
  );

  return true;
};

export { onceUntilRetry, personClaim, reserveFetch };

export type { Claim };

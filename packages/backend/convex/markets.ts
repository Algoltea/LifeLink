/**
 * Market prices for Today. Prices are public, so one cached list serves
 * everyone, and the provider is asked at most every 15 minutes.
 */
import {
  inCatalogOrder,
  MARKET_INSTRUMENTS,
  MARKETS_REFRESH_MS,
} from "@lifelink/contracts/markets";
import type { MarketQuote } from "@lifelink/contracts/markets";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import type { ActionCtx, QueryCtx } from "./_generated/server";
import { dated, onceUntilRetry, personClaim, reserveFetch } from "./lib/claims";
import type { Dated } from "./lib/claims";
import { readQuote } from "./lib/markets";
import { requireProfile } from "./lib/session";
import schema from "./schema";

const cachedRow = async (ctx: QueryCtx): Promise<Doc<"marketsCache"> | null> =>
  await ctx.db.query("marketsCache").first();

export const quotes = query({
  args: {},
  handler: async (ctx) => {
    await requireProfile(ctx);

    const cached = await cachedRow(ctx);

    return {
      fetchedAt: cached?.fetchedAt ?? null,
      quotes: inCatalogOrder(cached?.quotes ?? []),
    };
  },
});

export const signedIn = internalQuery({
  args: {},
  handler: async (ctx): Promise<Id<"profiles">> => {
    const profile = await requireProfile(ctx);

    return profile._id;
  },
});

export const cached = internalQuery({
  args: {},
  handler: async (ctx) => await cachedRow(ctx),
});

export const store = internalMutation({
  args: {
    fetchedAt: v.number(),
    quotes: schema.tables.marketsCache.validator.fields.quotes,
  },
  handler: async (ctx, args) => {
    const existing = await cachedRow(ctx);

    await (existing === null
      ? ctx.db.insert("marketsCache", args)
      : ctx.db.replace("marketsCache", existing._id, args));
  },
});

/** One attempt every few minutes for everyone, and a per-person ceiling. */
export const claim = internalMutation({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args): Promise<boolean> =>
    await reserveFetch(ctx, [
      onceUntilRetry("markets"),
      personClaim(args.profileId),
    ]),
});

/**
 * Fresh prices. An instrument whose fetch fails keeps its last good price,
 * and when every fetch fails the whole list stays as it was.
 */
const ensureQuotes = async (
  ctx: Pick<ActionCtx, "runMutation" | "runQuery">,
  profileId: Id<"profiles">
): Promise<Dated<MarketQuote[]> | null> => {
  const existing: Doc<"marketsCache"> | null = await ctx.runQuery(
    internal.markets.cached,
    {}
  );

  const now = Date.now();

  const kept = dated(
    existing && existing.quotes.length > 0 ? existing.quotes : null,
    existing?.fetchedAt ?? now
  );

  if (existing !== null && now - existing.fetchedAt < MARKETS_REFRESH_MS) {
    return kept;
  }

  const claimed: boolean = await ctx.runMutation(internal.markets.claim, {
    profileId,
  });

  if (!claimed) {
    return kept;
  }

  const fetched = await Promise.all(
    MARKET_INSTRUMENTS.map(async (instrument) => {
      try {
        return await readQuote(instrument);
      } catch {
        return null;
      }
    })
  );

  const fresh = fetched.filter((quote) => quote !== null);

  if (fresh.length === 0) {
    return kept;
  }

  const freshIds = new Set(fresh.map((quote) => quote.id));

  const merged = inCatalogOrder([
    ...fresh,
    ...(existing?.quotes ?? []).filter((quote) => !freshIds.has(quote.id)),
  ]);

  await ctx.runMutation(internal.markets.store, {
    fetchedAt: now,
    quotes: merged,
  });

  return dated(merged, now);
};

/** Called by Today when its prices are missing or old. */
export const refresh = action({
  args: {},
  handler: async (ctx): Promise<{ available: boolean }> => {
    const profileId: Id<"profiles"> = await ctx.runQuery(
      internal.markets.signedIn,
      {}
    );

    const fresh = await ensureQuotes(ctx, profileId);

    return { available: fresh !== null };
  },
});

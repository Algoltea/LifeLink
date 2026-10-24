/**
 * Headlines for Today. Feeds are public, so one cached list per kind serves
 * everyone, and each feed is read at most every 30 minutes.
 */
import { NEWS_REFRESH_MS, NEWS_SOURCES } from "@lifelink/contracts/news";
import type { Headline, NewsKind } from "@lifelink/contracts/news";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import type { ActionCtx, QueryCtx } from "./_generated/server";
import { request } from "./integrations/http";
import { interleave, parseFeed } from "./lib/feeds";
import { requireProfile } from "./lib/session";
import schema from "./schema";

const STORED = 10;
const TIMEOUT_MS = 10_000;

const kindValidator = schema.tables.newsCache.validator.fields.kind;

const cachedFor = async (
  ctx: QueryCtx,
  kind: NewsKind
): Promise<Doc<"newsCache"> | null> =>
  await ctx.db
    .query("newsCache")
    .withIndex("by_kind", (index) => index.eq("kind", kind))
    .first();

export const headlines = query({
  args: { kind: kindValidator },
  handler: async (ctx, args) => {
    await requireProfile(ctx);

    const cached = await cachedFor(ctx, args.kind);

    return {
      fetchedAt: cached?.fetchedAt ?? null,
      headlines: cached?.headlines ?? [],
    };
  },
});

export const signedIn = internalQuery({
  args: {},
  handler: async (ctx): Promise<null> => {
    await requireProfile(ctx);

    return null;
  },
});

export const cached = internalQuery({
  args: { kind: kindValidator },
  handler: async (ctx, args) => await cachedFor(ctx, args.kind),
});

export const store = internalMutation({
  args: {
    fetchedAt: v.number(),
    headlines: schema.tables.newsCache.validator.fields.headlines,
    kind: kindValidator,
  },
  handler: async (ctx, args) => {
    const existing = await cachedFor(ctx, args.kind);

    await (existing === null
      ? ctx.db.insert("newsCache", args)
      : ctx.db.replace("newsCache", existing._id, args));
  },
});

const readSource = async (
  source: (typeof NEWS_SOURCES)[NewsKind][number]
): Promise<Headline[]> => {
  const outcome = await request({
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    method: "GET",
    timeoutMs: TIMEOUT_MS,
    url: source.feedUrl,
  });

  return outcome.kind === "ok" ? parseFeed(outcome.body, source) : [];
};

/**
 * Fresh headlines of one kind. When every feed fails, the last good list
 * stays. Shared with the assistant's news tool.
 */
const ensureHeadlines = async (
  ctx: ActionCtx,
  kind: NewsKind
): Promise<Headline[]> => {
  const existing: Doc<"newsCache"> | null = await ctx.runQuery(
    internal.news.cached,
    { kind }
  );

  const now = Date.now();

  if (existing !== null && now - existing.fetchedAt < NEWS_REFRESH_MS) {
    return existing.headlines;
  }

  const lists = await Promise.all(NEWS_SOURCES[kind].map(readSource));
  const fresh = interleave(lists, STORED);

  if (fresh.length === 0) {
    return existing?.headlines ?? [];
  }

  await ctx.runMutation(internal.news.store, {
    fetchedAt: now,
    headlines: fresh,
    kind,
  });

  return fresh;
};

/** Called by Today when its headlines are missing or old. */
export const refresh = action({
  args: { kind: kindValidator },
  handler: async (ctx, args): Promise<null> => {
    await ctx.runQuery(internal.news.signedIn, {});
    await ensureHeadlines(ctx, args.kind);

    return null;
  },
});

export { ensureHeadlines };

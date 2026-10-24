/**
 * Weather for the place each person saved in Settings. Forecasts are public
 * data, so one cached copy serves everyone with the same saved location, and
 * Open-Meteo is asked at most every 30 minutes per place.
 */
import { WEATHER_REFRESH_MS } from "@lifelink/contracts/weather";
import type { Forecast } from "@lifelink/contracts/weather";
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
import { requireProfile } from "./lib/session";
import {
  findPlace,
  locationKey,
  readForecast,
  sampleForecast,
} from "./lib/weather";
import type { SavedLocation } from "./lib/weather";
import schema from "./schema";

/** Postal codes are short everywhere; longer input is cut before searching. */
const MAX_POSTAL_CHARS = 16;

/** Typing and correcting a code needs a few lookups; this stops scripted ones. */
const LOOKUPS_PER_MINUTE = 10;

/** A place that was not found is searched again after this long. */
const NOT_FOUND_RETRY_MS = 6 * 60 * 60_000;

const cachedFor = async (
  ctx: QueryCtx,
  key: string
): Promise<Doc<"weatherCache"> | null> =>
  await ctx.db
    .query("weatherCache")
    .withIndex("by_location_key", (index) => index.eq("locationKey", key))
    .first();

/**
 * Today's view of the forecast. `today` is the person's local date
 * (YYYY-MM-DD), passed in because queries do not read the clock.
 */
export const forecast = query({
  args: { today: v.string() },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);
    const key = locationKey(profile);

    if (key === null) {
      return profile.demoMode
        ? {
            fetchedAt: null,
            forecast: sampleForecast(args.today),
            status: "practice" as const,
          }
        : { status: "no_location" as const };
    }

    const cached = await cachedFor(ctx, key);

    if (cached === null) {
      return { fetchedAt: null, status: "loading" as const };
    }

    if (cached.forecast === null) {
      return { fetchedAt: cached.fetchedAt, status: "not_found" as const };
    }

    return {
      fetchedAt: cached.fetchedAt,
      forecast: {
        ...cached.forecast,
        days: cached.forecast.days.filter((day) => day.date >= args.today),
      },
      status: "ready" as const,
    };
  },
});

interface Whose {
  location: SavedLocation;
  profileId: Id<"profiles">;
}

export const savedLocation = internalQuery({
  args: {},
  handler: async (ctx): Promise<Whose> => {
    const { _id, city, postalCode, timeZone } = await requireProfile(ctx);

    return { location: { city, postalCode, timeZone }, profileId: _id };
  },
});

/** The assistant's view: whose place, and whether practice weather applies. */
export const locationOf = internalQuery({
  args: { profileId: v.id("profiles") },
  handler: async (
    ctx,
    args
  ): Promise<(Whose & { demoMode: boolean }) | null> => {
    const profile = await ctx.db.get(args.profileId);

    if (profile === null) {
      return null;
    }

    const { city, demoMode, postalCode, timeZone } = profile;

    return {
      demoMode,
      location: { city, postalCode, timeZone },
      profileId: profile._id,
    };
  },
});

export const cached = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => await cachedFor(ctx, args.key),
});

export const store = internalMutation({
  args: {
    fetchedAt: v.number(),
    forecast: schema.tables.weatherCache.validator.fields.forecast,
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await cachedFor(ctx, args.key);

    const row = {
      fetchedAt: args.fetchedAt,
      forecast: args.forecast,
      locationKey: args.key,
    };

    await (existing === null
      ? ctx.db.insert("weatherCache", row)
      : ctx.db.replace("weatherCache", existing._id, row));
  },
});

/**
 * One attempt per place every few minutes, and a per-person ceiling across
 * places. The profile is passed in because the assistant runs without a
 * signed-in session.
 */
export const claim = internalMutation({
  args: { key: v.string(), profileId: v.id("profiles") },
  handler: async (ctx, args): Promise<boolean> =>
    await reserveFetch(ctx, [
      onceUntilRetry(`weather:${args.key}`),
      personClaim(args.profileId),
    ]),
});

/**
 * The forecast for a saved location, fetched when the cached copy is old.
 * A failed fetch keeps the last good forecast instead of erasing it, so
 * the answer carries when it was fetched. Shared with the assistant's tool.
 */
const ensureForecast = async (
  ctx: Pick<ActionCtx, "runMutation" | "runQuery">,
  { location, profileId }: Whose
): Promise<Dated<Forecast> | null> => {
  const key = locationKey(location);

  if (key === null) {
    return null;
  }

  const existing: Doc<"weatherCache"> | null = await ctx.runQuery(
    internal.weather.cached,
    { key }
  );

  const now = Date.now();
  const kept = dated(existing?.forecast ?? null, existing?.fetchedAt ?? now);

  const age =
    existing === null ? Number.POSITIVE_INFINITY : now - existing.fetchedAt;

  const freshFor =
    existing?.forecast === null ? NOT_FOUND_RETRY_MS : WEATHER_REFRESH_MS;

  if (existing !== null && age < freshFor) {
    return kept;
  }

  const claimed: boolean = await ctx.runMutation(internal.weather.claim, {
    key,
    profileId,
  });

  if (!claimed) {
    return kept;
  }

  try {
    const place = await findPlace(location);
    const fresh = place === null ? null : await readForecast(place);

    await ctx.runMutation(internal.weather.store, {
      fetchedAt: now,
      forecast: fresh,
      key,
    });

    return dated(fresh, now);
  } catch {
    return kept;
  }
};

export const claimLookup = internalMutation({
  args: { subject: v.string() },
  handler: async (ctx, args): Promise<boolean> =>
    await reserveFetch(ctx, [
      {
        key: `lookup:${args.subject}`,
        max: LOOKUPS_PER_MINUTE,
        windowMs: 60_000,
      },
    ]),
});

/**
 * Onboarding confirms a postal code before the profile exists, so this needs
 * only a signed-in account. It saves nothing; the caller keeps the answer.
 */
export const lookupPlace = action({
  args: { postalCode: v.string(), timeZone: v.string() },
  handler: async (
    ctx,
    args
  ): Promise<{ city: string; place: string } | null> => {
    const identity = await ctx.auth.getUserIdentity();
    const postalCode = args.postalCode.trim().slice(0, MAX_POSTAL_CHARS);

    if (identity === null || postalCode === "") {
      return null;
    }

    const allowed: boolean = await ctx.runMutation(
      internal.weather.claimLookup,
      {
        subject: identity.subject,
      }
    );

    if (!allowed) {
      return null;
    }

    try {
      const place = await findPlace({
        city: null,
        postalCode,
        timeZone: args.timeZone,
      });

      return place === null ? null : { city: place.city, place: place.name };
    } catch {
      return null;
    }
  },
});

/** Called by Today when its forecast is missing or old. */
export const refresh = action({
  args: {},
  handler: async (ctx): Promise<{ available: boolean }> => {
    const whose: Whose = await ctx.runQuery(internal.weather.savedLocation, {});
    const found = await ensureForecast(ctx, whose);

    return { available: found !== null };
  },
});

export { ensureForecast };

export type { Whose };

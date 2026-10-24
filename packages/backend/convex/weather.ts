/**
 * Weather for the place each person saved in Settings. Forecasts are public
 * data, so one cached copy serves everyone with the same saved location, and
 * Open-Meteo is asked at most every 30 minutes per place.
 */
import { WEATHER_REFRESH_MS } from "@lifelink/contracts/weather";
import type { Forecast } from "@lifelink/contracts/weather";
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
import { onceUntilRetry, personClaim, reserveFetch } from "./lib/claims";
import { requireProfile } from "./lib/session";
import {
  findPlace,
  locationKey,
  readForecast,
  sampleForecast,
} from "./lib/weather";
import type { SavedLocation } from "./lib/weather";
import schema from "./schema";

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

export const savedLocation = internalQuery({
  args: {},
  handler: async (ctx): Promise<SavedLocation> => {
    const { city, postalCode, timeZone } = await requireProfile(ctx);

    return { city, postalCode, timeZone };
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

/** One attempt per place every few minutes, and a per-person ceiling across places. */
export const claim = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const profile = await requireProfile(ctx);

    return await reserveFetch(ctx, [
      onceUntilRetry(`weather:${args.key}`),
      personClaim(profile._id),
    ]);
  },
});

/**
 * The forecast for a saved location, fetched when the cached copy is old.
 * A failed fetch keeps the last good forecast instead of erasing it.
 * Shared with the assistant's weather tool.
 */
const ensureForecast = async (
  ctx: ActionCtx,
  location: SavedLocation
): Promise<Forecast | null> => {
  const key = locationKey(location);

  if (key === null) {
    return null;
  }

  const existing: Doc<"weatherCache"> | null = await ctx.runQuery(
    internal.weather.cached,
    { key }
  );

  const now = Date.now();

  const age =
    existing === null ? Number.POSITIVE_INFINITY : now - existing.fetchedAt;

  const freshFor =
    existing?.forecast === null ? NOT_FOUND_RETRY_MS : WEATHER_REFRESH_MS;

  if (existing !== null && age < freshFor) {
    return existing.forecast;
  }

  const claimed: boolean = await ctx.runMutation(internal.weather.claim, {
    key,
  });

  if (!claimed) {
    return existing?.forecast ?? null;
  }

  try {
    const place = await findPlace(location);
    const fresh = place === null ? null : await readForecast(place);

    await ctx.runMutation(internal.weather.store, {
      fetchedAt: now,
      forecast: fresh,
      key,
    });

    return fresh;
  } catch {
    return existing?.forecast ?? null;
  }
};

/** Called by Today when its forecast is missing or old. */
export const refresh = action({
  args: {},
  handler: async (ctx): Promise<{ available: boolean }> => {
    const location: SavedLocation = await ctx.runQuery(
      internal.weather.savedLocation,
      {}
    );

    const found = await ensureForecast(ctx, location);

    return { available: found !== null };
  },
});

export { ensureForecast };

/**
 * Open-Meteo adapters: find a place from a saved postal code or city, then
 * read its 7-day forecast. Open-Meteo needs no key; its terms ask for a
 * visible credit, which the Today page shows.
 */
import type { Forecast, WeatherDay } from "@lifelink/contracts/weather";
import { z } from "zod";

import { decodeJson, request } from "../integrations/http";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_DAYS = 7;
const CANDIDATES = 10;
const TIMEOUT_MS = 10_000;

interface Place {
  latitude: number;
  longitude: number;
  name: string;
}

interface SavedLocation {
  city: string | null;
  postalCode: string | null;
  timeZone: string;
}

const geocodeSchema = z.object({
  results: z
    .array(
      z.object({
        admin1: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
        name: z.string(),
        timezone: z.string().optional(),
      })
    )
    .optional(),
});

const forecastSchema = z.object({
  current: z.object({
    is_day: z.number(),
    temperature_2m: z.number(),
    weather_code: z.number(),
  }),
  daily: z.object({
    precipitation_probability_max: z.array(z.number().nullable()).optional(),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
  }),
});

const clean = (value: string | null): string => value?.trim() ?? "";

/** One cache entry per distinct saved location, shared by everyone who saved it. */
const locationKey = (location: SavedLocation): string | null => {
  const postal = clean(location.postalCode).toUpperCase();
  const city = clean(location.city).toLowerCase();

  return postal || city ? `${postal}|${city}|${location.timeZone}` : null;
};

/**
 * Searches to try, most exact first. Full UK-style postcodes are not in the
 * index, so the outward part ("LS1" of "LS1 4AP") follows the whole code.
 */
const searchesFor = (location: SavedLocation): string[] => {
  const postal = clean(location.postalCode);
  const outward = postal.includes(" ") ? (postal.split(" ")[0] ?? "") : "";

  return [...new Set([postal, outward, clean(location.city)].filter(Boolean))];
};

const placeName = (name: string, region: string | undefined): string =>
  region && region !== name ? `${name}, ${region}` : name;

type Candidate = NonNullable<z.infer<typeof geocodeSchema>["results"]>[number];

const searchPlaces = async (search: string): Promise<Candidate[]> => {
  const url = `${GEOCODE_URL}?${new URLSearchParams({
    count: String(CANDIDATES),
    format: "json",
    language: "en",
    name: search,
  }).toString()}`;

  const outcome = await request({ method: "GET", timeoutMs: TIMEOUT_MS, url });

  const decoded =
    outcome.kind === "ok" ? decodeJson(geocodeSchema, outcome.body) : null;

  // A broken answer is a failure, not "no such place", so a good forecast is kept.
  if (decoded === null) {
    throw new Error("The weather service could not be reached.");
  }

  return decoded.results ?? [];
};

/**
 * Many towns share a name, and short postal codes match abroad. A result in
 * the saved time zone wins from any search; only when none matches does the
 * first result of the most exact search stand.
 */
const findPlace = async (location: SavedLocation): Promise<Place | null> => {
  const found: Candidate[][] = [];

  for (const search of searchesFor(location)) {
    // oxlint-disable-next-line no-await-in-loop -- searches run in order and stop at the first time zone match.
    const results = await searchPlaces(search);

    const local = results.find(
      (result) => result.timezone === location.timeZone
    );

    if (local) {
      return {
        latitude: local.latitude,
        longitude: local.longitude,
        name: placeName(local.name, local.admin1),
      };
    }

    found.push(results);
  }

  const [fallback] = found.find((results) => results.length > 0) ?? [];

  return fallback
    ? {
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        name: placeName(fallback.name, fallback.admin1),
      }
    : null;
};

const readForecast = async (place: Place): Promise<Forecast> => {
  const url = `${FORECAST_URL}?${new URLSearchParams({
    current: "temperature_2m,weather_code,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    forecast_days: String(FORECAST_DAYS),
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    timezone: "auto",
  }).toString()}`;

  const outcome = await request({ method: "GET", timeoutMs: TIMEOUT_MS, url });

  const data =
    outcome.kind === "ok" ? decodeJson(forecastSchema, outcome.body) : null;

  if (data === null) {
    throw new Error("The weather service could not be reached.");
  }

  const { daily } = data;

  const days = daily.time.flatMap((date, index): WeatherDay[] => {
    const code = daily.weather_code[index];
    const highC = daily.temperature_2m_max[index];
    const lowC = daily.temperature_2m_min[index];

    return code === undefined || highC === undefined || lowC === undefined
      ? []
      : [
          {
            code,
            date,
            highC,
            lowC,
            precipitationChance:
              daily.precipitation_probability_max?.[index] ?? null,
          },
        ];
  });

  return {
    current: {
      code: data.current.weather_code,
      isDay: data.current.is_day === 1,
      temperatureC: data.current.temperature_2m,
    },
    days,
    place: place.name,
  };
};

const SAMPLE_CODES = [1, 61, 2, 63, 0, 3, 1] as const;
const SAMPLE_HIGHS = [17, 12, 14, 12, 15, 13, 16] as const;
const SAMPLE_CHANCES = [5, 80, 20, 70, 0, 10, 5] as const;
const DAY_MS = 86_400_000;

/** Practice accounts without a saved place get a believable week. */
const sampleForecast = (today: string): Forecast => {
  const start = Date.parse(`${today}T12:00:00Z`);

  return {
    current: { code: 1, isDay: true, temperatureC: 14 },
    days: SAMPLE_CODES.map((code, index) => ({
      code,
      date: new Date(start + index * DAY_MS).toISOString().slice(0, 10),
      highC: SAMPLE_HIGHS[index] ?? 15,
      lowC: (SAMPLE_HIGHS[index] ?? 15) - 8,
      precipitationChance: SAMPLE_CHANCES[index] ?? 0,
    })),
    place: "Practice town",
  };
};

export { findPlace, locationKey, readForecast, sampleForecast, searchesFor };

export type { Place, SavedLocation };

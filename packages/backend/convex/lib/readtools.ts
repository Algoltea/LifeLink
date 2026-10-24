/**
 * Read-only assistant tools for weather and news. They reuse the same cached
 * functions as the Today page, so the chat and the page never disagree. They
 * read public data only and change nothing, so they need no approval.
 */
import { createTool } from "@convex-dev/agent";
import {
  describeWeather,
  toUnit,
  weatherAdvice,
} from "@lifelink/contracts/weather";
import type { Forecast } from "@lifelink/contracts/weather";
import { z } from "zod";

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { ensureHeadlines } from "../news";
import { ensureForecast } from "../weather";
import { dateKeyOf } from "./time";
import { sampleForecast } from "./weather";

const NEWS_FOR_CHAT = 5;

const weekdayOf = (date: string): string =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long" }).format(
    Date.parse(`${date}T12:00:00Z`)
  );

const both = (celsius: number) => ({
  celsius: toUnit(celsius, "celsius"),
  fahrenheit: toUnit(celsius, "fahrenheit"),
});

/** Plain values the model can read aloud, in both units. */
const forChat = (forecast: Forecast, practice: boolean) => ({
  days: forecast.days.map((day) => ({
    advice: weatherAdvice(day),
    chanceOfRainOrSnowPercent: day.precipitationChance,
    conditions: describeWeather(day.code).label,
    date: day.date,
    high: both(day.highC),
    low: both(day.lowC),
    weekday: weekdayOf(day.date),
  })),
  now: {
    conditions: describeWeather(forecast.current.code).label,
    temperature: both(forecast.current.temperatureC),
  },
  place: forecast.place,
  practice,
  status: "ok" as const,
});

const weatherTool = (ownerId: Id<"profiles">) =>
  createTool({
    description:
      "Get the weather where the person lives (the place saved in Settings): now and the next 7 days. Read-only.",
    execute: async (toolCtx) => {
      const whose = await toolCtx.runQuery(internal.weather.locationOf, {
        profileId: ownerId,
      });

      if (whose === null) {
        return { status: "unavailable" as const };
      }

      const hasPlace =
        Boolean(whose.location.postalCode?.trim()) ||
        Boolean(whose.location.city?.trim());

      if (!hasPlace) {
        return whose.demoMode
          ? forChat(
              sampleForecast(dateKeyOf(Date.now(), whose.location.timeZone)),
              true
            )
          : { status: "no_location" as const };
      }

      const forecast = await ensureForecast(toolCtx, whose);

      return forecast === null
        ? { status: "unavailable" as const }
        : forChat(forecast, false);
    },
    inputSchema: z.object({}),
  });

const newsTool = (ownerId: Id<"profiles">) =>
  createTool({
    description:
      'Get current news headlines. Use kind "good" for gentle, uplifting stories (the default) and "top" only when the person asks for the main or serious news. Read-only.',
    execute: async (toolCtx, input) => {
      const headlines = await ensureHeadlines(toolCtx, input.kind, ownerId);

      return headlines.length === 0
        ? { status: "unavailable" as const }
        : {
            headlines: headlines
              .slice(0, NEWS_FOR_CHAT)
              .map(({ source, title }) => ({ source, title })),
            status: "ok" as const,
          };
    },
    inputSchema: z.object({ kind: z.enum(["good", "top"]) }),
  });

export { newsTool, weatherTool };

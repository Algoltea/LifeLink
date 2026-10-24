"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import {
  describeWeather,
  toUnit,
  unitForRegion,
  WEATHER_REFRESH_MS,
  weatherAdvice,
} from "@lifelink/contracts/weather";
import type {
  Forecast,
  TemperatureUnit,
  WeatherDay,
} from "@lifelink/contracts/weather";
import { useAction, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useCallback, useState, useSyncExternalStore } from "react";

import { dayKey } from "@/lib/format";
import { subscribeToClock } from "@/lib/greeting";
import { useRefreshWhenStale } from "@/lib/refresh";

type WeatherState = FunctionReturnType<typeof api.weather.forecast>;

const noSubscription = (): (() => void) => () => {
  // The browser's locale does not change while the page is open.
};

const regionOf = (language: string): string | undefined => {
  try {
    return new Intl.Locale(language).maximize().region;
  } catch {
    return undefined;
  }
};

/** Fahrenheit where the browser's locale reads it, Celsius everywhere else. */
const useTemperatureUnit = (): TemperatureUnit =>
  useSyncExternalStore(
    noSubscription,
    () => unitForRegion(regionOf(navigator.language)),
    () => "celsius"
  );

const degrees = (celsius: number, unit: TemperatureUnit): string =>
  `${toUnit(celsius, unit)}°`;

/**
 * The forecast for the person's saved place. It asks the server to fetch
 * again when the cached copy is missing or older than 30 minutes; the server
 * decides whether a fetch is really needed.
 */
interface WeatherView {
  state: WeatherState | undefined;
  /** The last refresh found nothing to show. */
  unavailable: boolean;
}

const useWeather = (timeZone: string): WeatherView => {
  const today = useSyncExternalStore(
    subscribeToClock,
    () => dayKey(Date.now(), timeZone),
    () => dayKey(Date.now(), timeZone)
  );

  const state = useQuery(api.weather.forecast, { today });
  const refreshAction = useAction(api.weather.refresh);
  const [unavailable, setUnavailable] = useState(false);
  const status = state?.status;

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const { available } = await refreshAction({});

      setUnavailable(!available);
    } catch {
      // The last forecast, if any, stays on screen.
      setUnavailable(true);
    }
  }, [refreshAction]);

  useRefreshWhenStale({
    enabled:
      status === "loading" || status === "ready" || status === "not_found",
    fetchedAt:
      state === undefined || !("fetchedAt" in state)
        ? undefined
        : (state.fetchedAt ?? null),
    maxAgeMs: WEATHER_REFRESH_MS,
    refresh,
  });

  return { state, unavailable };
};

const forecastOf = (state: WeatherState | undefined): Forecast | null =>
  state?.status === "ready" || state?.status === "practice"
    ? state.forecast
    : null;

/** One sentence for "Read my day aloud". */
const spokenWeather = (forecast: Forecast, unit: TemperatureUnit): string => {
  const now = describeWeather(forecast.current.code).label.toLowerCase();
  const [today] = forecast.days;
  const advice = today ? weatherAdvice(today) : null;

  const range = today
    ? ` Today's high is ${toUnit(today.highC, unit)} and the low is ${toUnit(today.lowC, unit)}.`
    : "";

  return `It is ${toUnit(forecast.current.temperatureC, unit)} degrees and ${now}.${range}${advice ? ` ${advice}.` : ""}`;
};

const dayFor = (
  forecast: Forecast | null,
  key: string
): WeatherDay | undefined => forecast?.days.find((day) => day.date === key);

export {
  dayFor,
  degrees,
  forecastOf,
  spokenWeather,
  useTemperatureUnit,
  useWeather,
};

export type { WeatherState };

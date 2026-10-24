import { describe, expect, it } from "vitest";

import {
  describeWeather,
  toUnit,
  unitForRegion,
  weatherAdvice,
} from "./weather";
import type { WeatherDay } from "./weather";

const day = (overrides: Partial<WeatherDay> = {}): WeatherDay => ({
  code: 0,
  date: "2026-10-27",
  highC: 15,
  lowC: 8,
  precipitationChance: 0,
  ...overrides,
});

describe("weather words", () => {
  it("names known codes and falls back for unknown ones", () => {
    expect(describeWeather(63)).toStrictEqual({ kind: "rain", label: "Rain" });
    expect(describeWeather(1234).label).toBe("Mixed weather");
  });

  it("stays quiet on an ordinary day", () => {
    expect(weatherAdvice(day())).toBeNull();
    expect(weatherAdvice(day({ code: 3 }))).toBeNull();
  });

  it("warns about rain only when it is likely", () => {
    expect(weatherAdvice(day({ code: 61, precipitationChance: 70 }))).toBe(
      "Rain likely, take a coat"
    );
    expect(
      weatherAdvice(day({ code: 61, precipitationChance: 20 }))
    ).toBeNull();
    expect(weatherAdvice(day({ code: 61, precipitationChance: null }))).toBe(
      "Rain likely, take a coat"
    );
  });

  it("warns about storms, snow, ice, and heat", () => {
    expect(weatherAdvice(day({ code: 95, precipitationChance: 80 }))).toBe(
      "Storms likely"
    );
    expect(weatherAdvice(day({ code: 73, precipitationChance: 90 }))).toMatch(
      /^Snow likely/u
    );
    expect(weatherAdvice(day({ lowC: -2 }))).toBe("Freezing, watch for ice");
    expect(weatherAdvice(day({ highC: 35 }))).toBe("Very hot, drink water");
  });

  it("reads Fahrenheit only where people use it", () => {
    expect(unitForRegion("US")).toBe("fahrenheit");
    expect(unitForRegion("gb")).toBe("celsius");
    expect(unitForRegion()).toBe("celsius");
    expect(toUnit(20, "fahrenheit")).toBe(68);
    expect(toUnit(11.6, "celsius")).toBe(12);
  });
});

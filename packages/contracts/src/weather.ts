/**
 * Weather words shared by the Today page and the assistant, so both describe
 * the same forecast the same way. Temperatures travel in Celsius; each reader
 * converts for display.
 */

type WeatherKind =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

interface WeatherDay {
  /** Days are local to the place, as YYYY-MM-DD. */
  readonly date: string;
  readonly code: number;
  readonly highC: number;
  readonly lowC: number;
  /** Highest chance of rain or snow that day, 0–100; null when unknown. */
  readonly precipitationChance: number | null;
}

interface WeatherNow {
  readonly code: number;
  readonly isDay: boolean;
  readonly temperatureC: number;
}

interface Forecast {
  readonly current: WeatherNow;
  readonly days: WeatherDay[];
  readonly place: string;
}

/** Forecasts older than this are fetched again when someone opens Today. */
const WEATHER_REFRESH_MS = 30 * 60_000;

/** WMO weather interpretation codes, as Open-Meteo reports them. */
const CODE_WORDS: ReadonlyMap<number, { kind: WeatherKind; label: string }> =
  new Map([
    [0, { kind: "clear", label: "Clear" }],
    [1, { kind: "clear", label: "Mostly clear" }],
    [2, { kind: "partly_cloudy", label: "Partly cloudy" }],
    [3, { kind: "cloudy", label: "Cloudy" }],
    [45, { kind: "fog", label: "Fog" }],
    [48, { kind: "fog", label: "Icy fog" }],
    [51, { kind: "rain", label: "Light drizzle" }],
    [53, { kind: "rain", label: "Drizzle" }],
    [55, { kind: "rain", label: "Heavy drizzle" }],
    [56, { kind: "rain", label: "Freezing drizzle" }],
    [57, { kind: "rain", label: "Freezing drizzle" }],
    [61, { kind: "rain", label: "Light rain" }],
    [63, { kind: "rain", label: "Rain" }],
    [65, { kind: "rain", label: "Heavy rain" }],
    [66, { kind: "rain", label: "Freezing rain" }],
    [67, { kind: "rain", label: "Freezing rain" }],
    [71, { kind: "snow", label: "Light snow" }],
    [73, { kind: "snow", label: "Snow" }],
    [75, { kind: "snow", label: "Heavy snow" }],
    [77, { kind: "snow", label: "Snow grains" }],
    [80, { kind: "rain", label: "Light showers" }],
    [81, { kind: "rain", label: "Showers" }],
    [82, { kind: "rain", label: "Heavy showers" }],
    [85, { kind: "snow", label: "Snow showers" }],
    [86, { kind: "snow", label: "Heavy snow showers" }],
    [95, { kind: "storm", label: "Thunderstorms" }],
    [96, { kind: "storm", label: "Thunderstorms with hail" }],
    [99, { kind: "storm", label: "Thunderstorms with hail" }],
  ]);

const UNKNOWN = { kind: "cloudy", label: "Mixed weather" } as const;

const describeWeather = (code: number): { kind: WeatherKind; label: string } =>
  CODE_WORDS.get(code) ?? UNKNOWN;

const LIKELY_PERCENT = 50;
const HOT_C = 32;
const FREEZING_C = 0;

/**
 * A short warning only when the weather should change someone's plans;
 * null on an ordinary day so the interface can stay quiet.
 */
const weatherAdvice = (day: WeatherDay): string | null => {
  const { kind } = describeWeather(day.code);
  const likely = (day.precipitationChance ?? 100) >= LIKELY_PERCENT;

  if (kind === "storm" && likely) {
    return "Storms likely";
  }

  if (kind === "snow" && likely) {
    return "Snow likely, take care outside";
  }

  if (kind === "rain" && likely) {
    return "Rain likely, take a coat";
  }

  if (day.lowC <= FREEZING_C) {
    return "Freezing, watch for ice";
  }

  if (day.highC >= HOT_C) {
    return "Very hot, drink water";
  }

  return null;
};

/** Regions that read temperatures in Fahrenheit. */
const FAHRENHEIT_REGIONS = new Set(["BS", "BZ", "KY", "LR", "PW", "US"]);

type TemperatureUnit = "celsius" | "fahrenheit";

const unitForRegion = (region?: string | null): TemperatureUnit =>
  region && FAHRENHEIT_REGIONS.has(region.toUpperCase())
    ? "fahrenheit"
    : "celsius";

const toUnit = (celsius: number, unit: TemperatureUnit): number =>
  Math.round(unit === "fahrenheit" ? (celsius * 9) / 5 + 32 : celsius);

export {
  describeWeather,
  toUnit,
  unitForRegion,
  WEATHER_REFRESH_MS,
  weatherAdvice,
};

export type { Forecast, TemperatureUnit, WeatherDay, WeatherKind, WeatherNow };

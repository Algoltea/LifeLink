"use client";

import { Popover } from "@base-ui/react/popover";
import { describeWeather, weatherAdvice } from "@lifelink/contracts/weather";
import type {
  Forecast,
  TemperatureUnit,
  WeatherKind,
} from "@lifelink/contracts/weather";
import { cn } from "@lifelink/ui/lib/utils";
import {
  ChevronDownIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  MapPinIcon,
  MoonIcon,
  SunIcon,
  XIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { degrees } from "@/lib/weather";
import type { WeatherState } from "@/lib/weather";

const ICONS: Record<WeatherKind, LucideIcon> = {
  clear: SunIcon,
  cloudy: CloudIcon,
  fog: CloudFogIcon,
  partly_cloudy: CloudSunIcon,
  rain: CloudRainIcon,
  snow: CloudSnowIcon,
  storm: CloudLightningIcon,
};

const WeatherIcon = ({
  className,
  code,
  night = false,
}: {
  className?: string;
  code: number;
  night?: boolean;
}) => {
  const { kind } = describeWeather(code);
  const Icon = night && kind === "clear" ? MoonIcon : ICONS[kind];

  return <Icon aria-hidden="true" className={cn("shrink-0", className)} />;
};

const weekday = (date: string, index: number): string =>
  index === 0
    ? "Today"
    : new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        weekday: "short",
      }).format(Date.parse(`${date}T12:00:00Z`));

const WeekForecast = ({
  forecast,
  practice,
  unit,
}: {
  forecast: Forecast;
  practice: boolean;
  unit: TemperatureUnit;
}) => (
  <>
    <ul className="flex flex-col">
      {forecast.days.map((day, index) => {
        const advice = weatherAdvice(day);
        const { label } = describeWeather(day.code);

        return (
          <li
            className="border-rule flex items-center gap-3 border-t py-2.5 first:border-t-0"
            key={day.date}
          >
            <span className="text-body w-14 shrink-0 font-semibold">
              {weekday(day.date, index)}
            </span>
            <WeatherIcon
              className="text-muted-foreground size-5"
              code={day.code}
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-label">{advice ?? label}</span>
            </span>
            <span className="num text-label shrink-0">
              <span className="sr-only">High </span>
              {degrees(day.highC, unit)}
              <span className="text-muted-foreground">
                {" / "}
                <span className="sr-only">low </span>
                {degrees(day.lowC, unit)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
    <p className="text-muted-foreground text-sm">
      {practice ? "Sample weather for practice. " : ""}
      Weather data from{" "}
      <a
        className="underline"
        href="https://open-meteo.com/"
        rel="noopener noreferrer"
        target="_blank"
      >
        Open-Meteo
      </a>
    </p>
  </>
);

const SettingsLink = ({ children }: { children: string }) => (
  <Link
    className="text-muted-foreground hover:text-foreground text-label min-h-control inline-flex items-center gap-2 underline"
    href="/settings#profile"
  >
    <MapPinIcon aria-hidden="true" className="size-5" />
    {children}
  </Link>
);

/** Today's weather in the header; the week opens in a light popover. */
const WeatherChip = ({
  state,
  unavailable,
  unit,
}: {
  state: WeatherState | undefined;
  /** The last refresh found nothing to show. */
  unavailable: boolean;
  unit: TemperatureUnit;
}) => {
  if (state === undefined || state.status === "loading") {
    return (
      <p className="text-muted-foreground text-label min-h-control flex items-center">
        {unavailable
          ? "Weather is not available right now."
          : "Loading weather…"}
      </p>
    );
  }

  if (state.status === "no_location") {
    return <SettingsLink>Add your postal code for weather</SettingsLink>;
  }

  if (state.status === "not_found") {
    return (
      <SettingsLink>
        We could not find your town. Check it in Settings
      </SettingsLink>
    );
  }

  const { forecast } = state;
  const [today] = forecast.days;
  const { label } = describeWeather(forecast.current.code);

  return (
    <Popover.Root>
      <Popover.Trigger className="border-border bg-surface hover:border-control hover:bg-parchment data-[popup-open]:border-control text-label min-h-control inline-flex items-center gap-2.5 rounded-full border px-4 font-medium transition-colors">
        <WeatherIcon
          className="size-5"
          code={forecast.current.code}
          night={!forecast.current.isDay}
        />
        <span className="num font-semibold">
          {degrees(forecast.current.temperatureC, unit)}
        </span>
        <span>{label}</span>
        {today ? (
          <span className="text-muted-foreground num hidden sm:inline">
            · H {degrees(today.highC, unit)} L {degrees(today.lowC, unit)}
          </span>
        ) : null}
        <span className="sr-only">. Show the week’s weather</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="text-muted-foreground size-4"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="end" className="z-50" sideOffset={8}>
          <Popover.Popup className="motion-pop border-border bg-raised text-foreground flex w-[min(22rem,calc(100vw-2rem))] origin-[var(--transform-origin)] flex-col gap-3 rounded-xl border p-5 shadow-[0_1px_2px_rgb(45_33_24/0.05),0_12px_32px_rgb(45_33_24/0.12)] outline-none">
            <div className="flex items-start justify-between gap-3">
              <Popover.Title className="text-body font-semibold">
                Weather in {forecast.place}
              </Popover.Title>
              <Popover.Close
                aria-label="Close"
                className="hover:bg-neutral-wash size-control -m-2 inline-flex shrink-0 items-center justify-center rounded-md"
              >
                <XIcon aria-hidden="true" className="size-5" />
              </Popover.Close>
            </div>
            <WeekForecast
              forecast={forecast}
              practice={state.status === "practice"}
              unit={unit}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { WeatherChip, WeatherIcon };

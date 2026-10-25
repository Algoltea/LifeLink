"use client";

import { Popover } from "@base-ui/react/popover";
import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { describeWeather } from "@lifelink/contracts/weather";
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
  MoonIcon,
  SunIcon,
  XIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLocale, useMessages } from "@/i18n/locale";
import { adviceFor, degrees, weatherLabel } from "@/lib/weather";
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

const weekday = (
  date: string,
  index: number,
  today: string,
  locale: InterfaceLocale
): string =>
  index === 0
    ? today
    : new Intl.DateTimeFormat(intlLocaleOf(locale), {
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
}) => {
  const locale = useLocale();
  const t = useMessages();

  return (
    <>
      {/* One shared day column, as wide as the longest day word in any language. */}
      <ul className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] gap-x-3">
        {forecast.days.map((day, index) => {
          const advice = adviceFor(day, locale);
          const label = weatherLabel(day.code, locale);

          return (
            <li
              className="border-rule col-span-full grid grid-cols-subgrid items-center border-t py-2.5 first:border-t-0"
              key={day.date}
            >
              <span className="text-body min-w-14 font-semibold">
                {weekday(day.date, index, t.format.today, locale)}
              </span>
              <WeatherIcon
                className="text-muted-foreground size-5"
                code={day.code}
              />
              <span className="flex min-w-0 flex-col">
                <span className="text-label">{advice ?? label}</span>
              </span>
              <span className="num text-label">
                <span className="sr-only">{t.weather.high}</span>
                {degrees(day.highC, unit)}
                <span className="text-muted-foreground">
                  {" / "}
                  <span className="sr-only">{t.weather.low}</span>
                  {degrees(day.lowC, unit)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-muted-foreground text-sm">
        {practice ? t.weather.practiceSample : ""}
        {t.weather.dataFrom}
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
};

/** Today's weather in the header; the week opens in a light popover. */
const WeatherChip = ({
  state,
  unit,
}: {
  state: WeatherState | undefined;
  unit: TemperatureUnit;
}) => {
  const locale = useLocale();
  const t = useMessages();

  // The week list asks for a missing place; the header waits quietly for weather.
  if (state?.status !== "ready" && state?.status !== "practice") {
    return null;
  }

  const { forecast } = state;
  const [today] = forecast.days;
  const label = weatherLabel(forecast.current.code, locale);

  return (
    <>
      <span aria-hidden="true" className="text-muted-foreground text-label">
        ·
      </span>
      <Popover.Root>
        {/* Text-sized to sit in the date line; the full row height keeps a large tap target. */}
        <Popover.Trigger className="group/weather text-muted-foreground hover:text-foreground data-[popup-open]:text-foreground text-label min-h-control -mx-1 inline-flex items-center gap-1.5 rounded-md px-1 transition-colors">
          <WeatherIcon
            className="size-4"
            code={forecast.current.code}
            night={!forecast.current.isDay}
          />
          <span className="num">
            {degrees(forecast.current.temperatureC, unit)}
          </span>
          <span>{label}</span>
          {today ? (
            <span className="num hidden sm:inline">
              {t.weather.highLow(
                degrees(today.highC, unit),
                degrees(today.lowC, unit)
              )}
            </span>
          ) : null}
          <span className="sr-only">{t.weather.showWeek}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className="size-4 transition-transform group-data-[popup-open]/weather:rotate-180 motion-reduce:transition-none"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner align="end" className="z-50" sideOffset={8}>
            <Popover.Popup className="motion-pop border-border bg-raised text-foreground flex w-[min(22rem,calc(100vw-2rem))] origin-[var(--transform-origin)] flex-col gap-3 rounded-xl border p-5 shadow-[0_1px_2px_rgb(45_33_24/0.05),0_12px_32px_rgb(45_33_24/0.12)] outline-none">
              <div className="flex items-start justify-between gap-3">
                <Popover.Title className="text-body font-semibold">
                  {t.weather.weatherIn(forecast.place)}
                </Popover.Title>
                <Popover.Close
                  aria-label={t.weather.closeWeek}
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
    </>
  );
};

export { WeatherChip, WeatherIcon };

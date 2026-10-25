"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { useLocale, useMessages } from "@/i18n/locale";
import { formatDay } from "@/lib/format";
import { subscribeToClock, useGreeting } from "@/lib/greeting";

const serverDate = (): string => "";

/**
 * The day in one line with weather and market prices, then the same greeting
 * as Ask's first screen. The h1
 * takes focus after navigation so screen reader and keyboard users land here.
 */
const TodayHeader = ({
  lines,
  markets,
  preferredName,
  spoken,
  timeZone,
  weather,
}: {
  lines: string[];
  /** Beside the weather on the date line; wraps to its own line when narrow. */
  markets: ReactNode;
  preferredName: string;
  /** Read after the day's lines: weather and messages. Empty parts are skipped. */
  spoken: string[];
  timeZone: string;
  weather: ReactNode;
}) => {
  const locale = useLocale();
  const heading = useRef<HTMLHeadingElement>(null);

  const greeting = useGreeting(timeZone);
  const t = useMessages();

  const date = useSyncExternalStore(
    subscribeToClock,
    () => formatDay(Date.now(), timeZone, locale),
    serverDate
  );

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  const name = preferredName.trim();
  const salutation = name ? `${greeting}, ${name}` : greeting;

  return (
    <header className="flex shrink-0 flex-col gap-3">
      {/* The full width, so market prices have room beside the weather. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {date ? (
          <p className="text-muted-foreground text-label">{date}</p>
        ) : null}
        {weather}
        {markets}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex max-w-3xl min-w-0 flex-col gap-1">
          <h1
            className="text-page-title font-semibold tracking-tight outline-none"
            ref={heading}
            tabIndex={-1}
          >
            <span className="sr-only">{t.today.titlePrefix}</span>
            {salutation}
          </h1>
          <p className="text-muted-foreground text-body max-w-prose pt-1">
            {lines.join(" ")}
          </p>
        </div>
        {/* Beside the briefing, not under it, so the day's overview stays short. */}
        <ReadAloudButton
          label={t.today.readMyDay}
          text={[`${salutation}.`, ...lines, ...spoken]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    </header>
  );
};

export { TodayHeader };

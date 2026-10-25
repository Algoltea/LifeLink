"use client";

import { intlLocaleOf } from "@lifelink/contracts/locale";
import { cn } from "@lifelink/ui/lib/utils";
import type { ComponentProps } from "react";
import { useMemo } from "react";

import { useLocale, useMessages } from "@/i18n/locale";

/** The zones most people here pick, shown first so they don't scroll the full list. */
const COMMON_ZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
] as const;

interface ZoneOption {
  label: string;
  value: string;
}

/** "America/New_York" → "New York · Eastern Time", so nobody has to know zone codes. */
const zoneLabel = (zone: string, locale: string): string => {
  const city = zone.split("/").at(-1)?.replaceAll("_", " ") ?? zone;

  try {
    const generic = new Intl.DateTimeFormat(locale, {
      timeZone: zone,
      timeZoneName: "longGeneric",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;

    return generic ? `${city} · ${generic}` : city;
  } catch {
    return city;
  }
};

const allZones = (): string[] => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return [...COMMON_ZONES];
  }
};

/**
 * A plain dropdown of time zones with readable names. The current value is
 * always offered, even when the browser's list doesn't include it.
 */
const TimeZoneSelect = ({
  className,
  current,
  ...props
}: Omit<ComponentProps<"select">, "children"> & { current: string }) => {
  const locale = useLocale();
  const { timeZone: words } = useMessages().appExtras;

  const { common, rest } = useMemo(() => {
    const intlLocale = intlLocaleOf(locale);
    const commonSet = new Set<string>(COMMON_ZONES);
    const others = new Set(allZones().filter((zone) => !commonSet.has(zone)));

    if (current && !commonSet.has(current)) {
      others.add(current);
    }

    const toOption = (zone: string): ZoneOption => ({
      label: zoneLabel(zone, intlLocale),
      value: zone,
    });

    return {
      common: COMMON_ZONES.map(toOption),
      rest: [...others]
        .map(toOption)
        .toSorted((a, b) => a.label.localeCompare(b.label, intlLocale)),
    };
  }, [current, locale]);

  return (
    <select
      className={cn(
        "border-control bg-raised text-foreground hover:border-foreground min-h-control w-full min-w-0 rounded-md border px-4 py-2 text-base transition-colors",
        className
      )}
      {...props}
    >
      <optgroup label={words.common}>
        {common.map((zone) => (
          <option key={zone.value} value={zone.value}>
            {zone.label}
          </option>
        ))}
      </optgroup>
      <optgroup label={words.all}>
        {rest.map((zone) => (
          <option key={zone.value} value={zone.value}>
            {zone.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
};

export { TimeZoneSelect };

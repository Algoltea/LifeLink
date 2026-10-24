/** Dates and times in the person's own time zone and language, in words where recency matters. */

import { currentIntlLocale, currentMessages } from "@/i18n/locale";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const formatTime = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat(currentIntlLocale(), {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(timestamp);

const formatDay = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat(currentIntlLocale(), {
    day: "numeric",
    month: "long",
    timeZone,
    weekday: "long",
  }).format(timestamp);

const formatShortDay = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat(currentIntlLocale(), {
    day: "numeric",
    month: "short",
    timeZone,
    weekday: "short",
  }).format(timestamp);

const formatWhen = (timestamp: number, timeZone: string): string =>
  currentMessages().format.at(
    formatDay(timestamp, timeZone),
    formatTime(timestamp, timeZone)
  );

const dayKey = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(timestamp);

/** "Today", "Tomorrow", or the weekday and date. */
const relativeDay = (
  timestamp: number,
  timeZone: string,
  now = Date.now()
): string => {
  const key = dayKey(timestamp, timeZone);
  const words = currentMessages().format;

  if (key === dayKey(now, timeZone)) {
    return words.today;
  }

  if (key === dayKey(now + DAY, timeZone)) {
    return words.tomorrow;
  }

  if (key === dayKey(now - DAY, timeZone)) {
    return words.yesterday;
  }

  return formatDay(timestamp, timeZone);
};

/** "Just now", "12 minutes ago", "Yesterday at 4:10 PM". */
const ago = (timestamp: number, timeZone: string, now = Date.now()): string => {
  const elapsed = now - timestamp;
  const words = currentMessages().format;

  if (elapsed < MINUTE) {
    return words.justNow;
  }

  if (elapsed < HOUR) {
    return words.minutesAgo(Math.round(elapsed / MINUTE));
  }

  if (elapsed < 6 * HOUR) {
    return words.hoursAgo(Math.round(elapsed / HOUR));
  }

  return words.at(
    relativeDay(timestamp, timeZone, now),
    formatTime(timestamp, timeZone)
  );
};

const money = (cents: number): string =>
  new Intl.NumberFormat(currentIntlLocale(), {
    currency: "USD",
    style: "currency",
  }).format(cents / 100);

/** For <input type="datetime-local">: the wall-clock value in the person's zone. */
const toLocalInputValue = (timestamp: number, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(timestamp);

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((item) => item.type === type)?.value ?? "00";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
};

/** Inverse of toLocalInputValue: a wall-clock value in the zone back to a timestamp. */
const fromLocalInputValue = (
  value: string,
  timeZone: string
): number | null => {
  const asUtc = Date.parse(`${value}:00Z`);

  if (Number.isNaN(asUtc)) {
    return null;
  }

  const shown = Date.parse(`${toLocalInputValue(asUtc, timeZone)}:00Z`);

  return asUtc - (shown - asUtc);
};

export {
  DAY,
  HOUR,
  MINUTE,
  ago,
  dayKey,
  formatDay,
  formatShortDay,
  formatTime,
  formatWhen,
  fromLocalInputValue,
  money,
  relativeDay,
  toLocalInputValue,
};

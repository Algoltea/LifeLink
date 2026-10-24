const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const formatWhen = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    timeZone,
    weekday: "long",
  }).format(timestamp);

const formatDay = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone,
    weekday: "long",
  }).format(timestamp);

const formatTime = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(timestamp);

/** YYYY-MM-DD in the person's own time zone. */
const dateKeyOf = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(timestamp);

/** Minutes between UTC and the zone at the given instant (negative west of UTC). */
const zoneOffsetMinutes = (timestamp: number, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(timestamp);

  const valueOf = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const asUtc = Date.UTC(
    valueOf("year"),
    valueOf("month") - 1,
    valueOf("day"),
    valueOf("hour"),
    valueOf("minute"),
    valueOf("second")
  );

  return Math.round((asUtc - timestamp) / MINUTE);
};

/** Start of the person's local day, as a UTC timestamp. */
const startOfLocalDay = (timestamp: number, timeZone: string): number => {
  const [year, month, day] = dateKeyOf(timestamp, timeZone)
    .split("-")
    .map(Number);

  const midnightUtc = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);

  return midnightUtc - zoneOffsetMinutes(midnightUtc, timeZone) * MINUTE;
};

/** Parse an ISO 8601 string that carries an explicit offset; anything else is rejected. */
const parseAbsoluteIso = (iso: string | null): number | null => {
  if (iso === null || !/(?:Z|[+-]\d{2}:\d{2})$/u.test(iso.trim())) {
    return null;
  }

  const parsed = Date.parse(iso);

  return Number.isNaN(parsed) ? null : parsed;
};

export {
  DAY,
  HOUR,
  MINUTE,
  dateKeyOf,
  formatDay,
  formatTime,
  formatWhen,
  parseAbsoluteIso,
  startOfLocalDay,
  zoneOffsetMinutes,
};

/** "YYYY-MM-DDTHH:MM:SS" wall-clock time in the zone, for APIs that take a local time plus zone name. */
const localDateTimeIn = (timestamp: number, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(timestamp);

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((item) => item.type === type)?.value ?? "00";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}`;
};

/** ISO 8601 with the zone's numeric offset, e.g. 2026-11-03T10:30:00-05:00, for model context. */
const isoWithOffset = (timestamp: number, timeZone: string): string => {
  const offset = zoneOffsetMinutes(timestamp, timeZone);
  const sign = offset < 0 ? "-" : "+";
  const absolute = Math.abs(offset);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");

  return `${localDateTimeIn(timestamp, timeZone)}${sign}${hours}:${minutes}`;
};

/** True when the runtime recognises the IANA zone (aliases included). */
const isValidTimeZone = (zone: string): boolean => {
  if (zone === "UTC") {
    return true;
  }

  try {
    return (
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).resolvedOptions()
        .timeZone.length > 0
    );
  } catch {
    return false;
  }
};

export { isValidTimeZone, isoWithOffset, localDateTimeIn };

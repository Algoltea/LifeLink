import { interfaceLocales } from "@lifelink/contracts/locale";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import {
  ago,
  formatDay,
  formatShortDay,
  formatTime,
  formatWhen,
  money,
  relativeDay,
} from "./format";

const TIMESTAMP = Date.UTC(2026, 9, 24, 16, 35);
const TIME_ZONE = "America/New_York";

describe("locale-aware dates and amounts", () => {
  beforeEach(() => {
    vi.stubGlobal("document", { documentElement: { lang: "en" } });
    vi.stubGlobal("localStorage", { setItem: vi.fn<Storage["setItem"]>() });
    setLocale("en");
  });

  afterEach(() => {
    setLocale("en");
    vi.unstubAllGlobals();
  });

  it.each(interfaceLocales)(
    "formats explicit $id dates, time and USD regardless of the active language",
    ({ id, intl }) => {
      setLocale(id === "en" ? "ko" : "en");

      const day = new Intl.DateTimeFormat(intl, {
        day: "numeric",
        month: "long",
        timeZone: TIME_ZONE,
        weekday: "long",
      }).format(TIMESTAMP);

      const time = new Intl.DateTimeFormat(intl, {
        hour: "numeric",
        minute: "2-digit",
        timeZone: TIME_ZONE,
      }).format(TIMESTAMP);

      expect({
        day: formatDay(TIMESTAMP, TIME_ZONE, id),
        shortDay: formatShortDay(TIMESTAMP, TIME_ZONE, id),
        time: formatTime(TIMESTAMP, TIME_ZONE, id),
        when: formatWhen(TIMESTAMP, TIME_ZONE, id),
      }).toStrictEqual({
        day,
        shortDay: new Intl.DateTimeFormat(intl, {
          day: "numeric",
          month: "short",
          timeZone: TIME_ZONE,
          weekday: "short",
        }).format(TIMESTAMP),
        time,
        when: messagesFor(id).format.at(day, time),
      });
      expect(money(123_456, id)).toBe(
        new Intl.NumberFormat(intl, {
          currency: "USD",
          style: "currency",
        }).format(1234.56)
      );
      expect({
        ago: ago(TIMESTAMP - 120_000, TIME_ZONE, TIMESTAMP, id),
        day: relativeDay(TIMESTAMP, TIME_ZONE, TIMESTAMP, id),
      }).toStrictEqual({
        ago: messagesFor(id).format.minutesAgo(2),
        day: messagesFor(id).format.today,
      });

      setLocale(id);
      expect(formatWhen(TIMESTAMP, TIME_ZONE)).toBe(
        formatWhen(TIMESTAMP, TIME_ZONE, id)
      );
      expect(money(123_456)).toBe(money(123_456, id));
    }
  );
});

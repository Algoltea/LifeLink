import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { useSyncExternalStore } from "react";

import { messagesFor, useLocale } from "@/i18n/locale";
import { MINUTE } from "@/lib/format";

const AFTERNOON_HOUR = 12;
const EVENING_HOUR = 18;

/** The hour in the person's own time zone, so greetings match the times LifeLink lists. */
const hourIn = (timeZone: string): number =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone,
    }).format(Date.now())
  );

const greetingIn = (timeZone: string, locale: InterfaceLocale): string => {
  const hour = hourIn(timeZone);
  const words = messagesFor(locale).greeting;

  if (hour < AFTERNOON_HOUR) {
    return words.morning;
  }

  return hour < EVENING_HOUR ? words.afternoon : words.evening;
};

// Today and Ask are often left open all day, so wording follows the clock.
const subscribeToClock = (onChange: () => void) => {
  const timer = globalThis.setInterval(onChange, MINUTE);

  return () => globalThis.clearInterval(timer);
};

const serverGreeting = (locale: InterfaceLocale): string =>
  messagesFor(locale).greeting.hello;

/** One greeting for Today and Ask, so the two screens never disagree. */
const useGreeting = (timeZone: string): string => {
  // Read so the greeting follows a language change, not only the clock.
  const locale = useLocale();

  return useSyncExternalStore(
    subscribeToClock,
    () => greetingIn(timeZone, locale),
    () => serverGreeting(locale)
  );
};

export { subscribeToClock, useGreeting };

import { useSyncExternalStore } from "react";

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

const greetingIn = (timeZone: string): string => {
  const hour = hourIn(timeZone);

  if (hour < AFTERNOON_HOUR) {
    return "Good morning";
  }

  return hour < EVENING_HOUR ? "Good afternoon" : "Good evening";
};

// Today and Ask are often left open all day, so wording follows the clock.
const subscribeToClock = (onChange: () => void) => {
  const timer = globalThis.setInterval(onChange, MINUTE);

  return () => globalThis.clearInterval(timer);
};

const serverGreeting = (): string => "Hello";

/** One greeting for Today and Ask, so the two screens never disagree. */
const useGreeting = (timeZone: string): string =>
  useSyncExternalStore(
    subscribeToClock,
    () => greetingIn(timeZone),
    serverGreeting
  );

export { subscribeToClock, useGreeting };

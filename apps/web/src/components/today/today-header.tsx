"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { formatDay } from "@/lib/format";
import { subscribeToClock, useGreeting } from "@/lib/greeting";

const serverDate = (): string => "";

/**
 * The same greeting as Ask's first screen, then the day in one line. The h1
 * takes focus after navigation so screen reader and keyboard users land here.
 */
const TodayHeader = ({
  lines,
  preferredName,
  timeZone,
}: {
  lines: string[];
  preferredName: string;
  timeZone: string;
}) => {
  const heading = useRef<HTMLHeadingElement>(null);

  const greeting = useGreeting(timeZone);

  const date = useSyncExternalStore(
    subscribeToClock,
    () => formatDay(Date.now(), timeZone),
    serverDate
  );

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  const name = preferredName.trim();
  const salutation = name ? `${greeting}, ${name}` : greeting;

  return (
    <header className="flex flex-col gap-4">
      <div className="flex max-w-3xl min-w-0 flex-col gap-1">
        {date ? (
          <p className="text-muted-foreground text-label">{date}</p>
        ) : null}
        <h1
          className="text-page-title font-semibold tracking-tight outline-none sm:text-[2.222rem] sm:leading-tight"
          ref={heading}
          tabIndex={-1}
        >
          <span className="sr-only">Today: </span>
          {salutation}
        </h1>
        <p className="text-muted-foreground text-body max-w-prose pt-1">
          {lines.join(" ")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ReadAloudButton
          label="Read my day aloud"
          text={[`${salutation}.`, ...lines].join(" ")}
        />
      </div>
    </header>
  );
};

export { TodayHeader };

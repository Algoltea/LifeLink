"use client";

import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { DAY, formatTime, relativeDay } from "@/lib/format";

const RECENT_DAYS = 6;
const HUE_TURN = 360;

/** Inbox time, the way mail apps say it: "9:40 AM", "Yesterday", "Thu", "Oct 19". */
const listTime = (
  timestamp: number,
  timeZone: string,
  now = Date.now()
): string => {
  const day = relativeDay(timestamp, timeZone, now);

  if (day === "Today") {
    return formatTime(timestamp, timeZone);
  }

  if (day === "Yesterday") {
    return day;
  }

  const recent = now - timestamp < RECENT_DAYS * DAY && timestamp <= now;

  return new Intl.DateTimeFormat(
    "en-US",
    recent
      ? { timeZone, weekday: "short" }
      : { day: "numeric", month: "short", timeZone }
  ).format(timestamp);
};

/** A steady tint per sender, so the same sender always looks the same. */
const hueFor = (address: string): number => {
  let hash = 0;

  for (const character of address.toLowerCase()) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % HUE_TURN;
  }

  return hash;
};

/** A secondary section that stays out of the way until the person opens it. */
const Disclosure = ({
  children,
  defaultOpen = false,
  icon,
  labelId,
  note,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  icon: ReactNode;
  labelId: string;
  note: ReactNode;
  title: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section aria-labelledby={labelId} className="border-rule border-b">
      <details
        className="group"
        onToggle={(event) => setOpen(event.currentTarget.open)}
        open={open}
      >
        <summary className="hover:bg-parchment flex min-h-16 cursor-pointer list-none items-center gap-3.5 rounded-md px-1 py-2 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="text-muted-foreground flex w-6 shrink-0 [&_svg]:size-5"
          >
            {icon}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body font-semibold" id={labelId}>
              {title}
            </span>
            <span className="text-muted-foreground text-label">{note}</span>
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="flex flex-col gap-3 pr-1 pb-5 pl-[2.625rem]">
          {children}
        </div>
      </details>
    </section>
  );
};

/** Reserves the inbox rows' real shape while mail loads; only the label is announced. */
const InboxSkeleton = ({ label, rows }: { label: string; rows: number }) => (
  <div
    aria-busy="true"
    aria-label={label}
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- it holds block skeletons, and <output> allows only phrasing content.
    role="status"
  >
    <div aria-hidden="true" className="flex flex-col gap-1">
      {Array.from({ length: rows }, (_unused, index) => (
        <div className="flex gap-3.5 px-3 py-3.5" key={index}>
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-7 items-center justify-between gap-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="flex h-6 items-center">
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <div className="flex h-6 items-center">
              <Skeleton className="h-3.5 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Reserves the reader's header, toolbar, and first paragraphs while an email opens. */
const ReaderSkeleton = ({ label }: { label: string }) => (
  <div
    aria-busy="true"
    aria-label={label}
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- it holds block skeletons, and <output> allows only phrasing content.
    role="status"
  >
    <div aria-hidden="true" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-3/4" />
      <div className="flex items-center gap-3.5">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3.5 w-64" />
        </div>
      </div>
      <div className="border-rule flex flex-wrap gap-2 border-b py-4">
        {["w-28", "w-36", "w-48"].map((width) => (
          <Skeleton className={cn("min-h-control", width)} key={width} />
        ))}
      </div>
      <div className="flex max-w-prose flex-col gap-3 pt-2">
        {["w-full", "w-11/12", "w-full", "w-2/3"].map((width, index) => (
          <Skeleton className={cn("h-4", width)} key={`${width}-${index}`} />
        ))}
      </div>
    </div>
  </div>
);

export { Disclosure, InboxSkeleton, ReaderSkeleton, hueFor, listTime };

"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { cn } from "@lifelink/ui/lib/utils";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar } from "@/components/app/bits";
import { listTime } from "@/components/email/email-bits";
import { WeatherIcon } from "@/components/today/weather";
import {
  formatShortDay,
  formatTime,
  formatWhen,
  relativeDay,
} from "@/lib/format";

type FamilyMessage = FunctionReturnType<
  typeof api.today.summary
>["messages"][number];

interface WeekRow {
  at: number;
  id: string;
  sub: string;
  title: string;
  /** Appointments only; reminders stay quiet. */
  weather?: {
    advice: string | null;
    code: number;
    high: string;
    label: string;
  };
}

/** A side list's heading and rows, inset to line up with the rows like Email and Documents. */
const SideSection = ({
  children,
  headingId,
  title,
}: {
  children: ReactNode;
  headingId: string;
  title: string;
}) => (
  <section aria-labelledby={headingId} className="flex flex-col">
    <h2 className="text-section px-3 pb-3 font-semibold" id={headingId}>
      {title}
    </h2>
    {children}
  </section>
);

const SideEmpty = ({ children }: { children: ReactNode }) => (
  <p className="text-muted-foreground text-body px-3 py-1">{children}</p>
);

/** "Today", "Tomorrow", then the short weekday. */
const dayLabel = (timestamp: number, timeZone: string): string => {
  const day = relativeDay(timestamp, timeZone);

  return day === "Today" || day === "Tomorrow"
    ? day
    : (formatShortDay(timestamp, timeZone).split(",")[0] ?? day);
};

/** Appointments and reminders in the same row rhythm as the family list. */
const WeekList = ({
  prompt,
  rows,
  timeZone,
}: {
  /** A first row that asks for something, such as a postal code. */
  prompt?: ReactNode;
  rows: WeekRow[];
  timeZone: string;
}) => (
  <SideSection headingId="week-heading" title="This week">
    {prompt}
    {rows.length === 0 ? (
      <SideEmpty>Nothing booked this week.</SideEmpty>
    ) : (
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li className="flex items-center gap-3.5 px-3 py-3.5" key={row.id}>
            <time
              className="flex w-20 shrink-0 flex-col"
              dateTime={new Date(row.at).toISOString()}
              title={formatWhen(row.at, timeZone)}
            >
              <span className="text-muted-foreground text-label">
                {dayLabel(row.at, timeZone)}
              </span>
              <span className="num text-body font-semibold">
                <span className="sr-only">, </span>
                {formatTime(row.at, timeZone)}
              </span>
            </time>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body font-semibold">
                <span className="sr-only">, </span>
                {row.title}
              </span>
              <span className="text-muted-foreground text-label truncate">
                <span className="sr-only">, </span>
                {row.sub}
              </span>
              {row.weather ? (
                <span
                  className={cn(
                    "text-label flex items-center gap-1.5",
                    row.weather.advice
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="sr-only">
                    , weather: {row.weather.label}, high{" "}
                  </span>
                  <WeatherIcon className="size-4" code={row.weather.code} />
                  <span className="num">{row.weather.high}</span>
                  {row.weather.advice ? (
                    <span className="truncate">· {row.weather.advice}</span>
                  ) : null}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    )}
  </SideSection>
);

/** One row per person, newest first, the way the Messages list shows conversations. */
const latestPerPerson = (messages: FamilyMessage[]): FamilyMessage[] => {
  const seen = new Set<string>();

  return messages
    .toSorted((left, right) => right.createdAt - left.createdAt)
    .filter((message) => {
      if (seen.has(message.contactId)) {
        return false;
      }

      seen.add(message.contactId);

      return true;
    });
};

const FamilyList = ({
  messages,
  timeZone,
}: {
  messages: FamilyMessage[];
  timeZone: string;
}) => {
  // Pictures and relationships come from the contact list, which other screens already load.
  const contacts = useQuery(api.contacts.list);
  const rows = latestPerPerson(messages);

  return (
    <SideSection headingId="family-heading" title="From family">
      {rows.length === 0 ? (
        <SideEmpty>No new messages in the last two days.</SideEmpty>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((message) => {
            const contact = contacts?.find(
              (candidate) => candidate._id === message.contactId
            );

            return (
              <li key={message.id}>
                <Link
                  className="text-foreground hover:bg-parchment flex min-w-0 items-center gap-3.5 rounded-lg px-3 py-3.5 transition-colors"
                  // SAFETY: a stored contact id, and /messages/[contactId] is a real route.
                  href={`/messages/${message.contactId}` as Route}
                >
                  <Avatar
                    hue={message.contactHue}
                    name={message.contactName}
                    src={contact?.avatarUrl}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="text-body truncate font-semibold">
                          {message.contactName}
                        </span>
                        {contact?.relationship ? (
                          <span className="text-muted-foreground text-label shrink-[2] truncate">
                            <span className="sr-only">, </span>
                            {contact.relationship}
                          </span>
                        ) : null}
                      </span>
                      <time
                        className="text-muted-foreground shrink-0 text-sm whitespace-nowrap"
                        dateTime={new Date(message.createdAt).toISOString()}
                        title={formatWhen(message.createdAt, timeZone)}
                      >
                        <span className="sr-only">, </span>
                        {listTime(message.createdAt, timeZone)}
                      </time>
                    </span>
                    <span className="text-muted-foreground text-label truncate">
                      <span className="sr-only">, </span>
                      {message.body.trim() || "New message"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </SideSection>
  );
};

export { FamilyList, WeekList };

export type { WeekRow };

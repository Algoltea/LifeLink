"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { cn } from "@lifelink/ui/lib/utils";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronRightIcon, MapPinIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar } from "@/components/app/bits";
import { listTime } from "@/components/email/email-bits";
import { WeatherIcon } from "@/components/today/weather";
import { useLocale, messagesFor, useMessages } from "@/i18n/locale";
import {
  formatShortDay,
  formatTime,
  formatWhen,
  relativeDay,
} from "@/lib/format";
import type { WeatherState } from "@/lib/weather";

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

/** Rows in a Today group, inset so their text lines up with the headings. */
const PANEL_ROW =
  "text-foreground hover:bg-parchment flex min-w-0 items-center gap-3.5 -mx-3 rounded-lg px-3 py-2.5 transition-colors";

/** One Today group: a heading, its link to the full page, and its rows, flat like News. */
const TodayPanel = ({
  action,
  children,
  headingId,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  headingId: string;
  title: string;
}) => (
  <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-2">
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <h2 className="text-section font-semibold" id={headingId}>
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

/** The link to a part's full page, such as "All email". */
const AllLink = ({ children, href }: { children: string; href: Route }) => (
  <Link
    className="text-accent-foreground text-label min-h-control inline-flex items-center gap-1 font-medium"
    href={href}
  >
    {children}
    <ChevronRightIcon aria-hidden="true" className="size-5" />
  </Link>
);

const SideEmpty = ({ children }: { children: ReactNode }) => (
  <p className="text-muted-foreground text-body py-1">{children}</p>
);

/**
 * The first row of the week list when weather has no place to use. It lives
 * there, not in the header, because the weather matters most next to plans.
 */
const LocationPrompt = ({ state }: { state: WeatherState | undefined }) => {
  const t = useMessages().today;

  if (state?.status !== "no_location" && state?.status !== "not_found") {
    return null;
  }

  const missing = state.status === "no_location";

  return (
    <Link className={PANEL_ROW} href="/settings#profile">
      <MapPinIcon
        aria-hidden="true"
        className="text-muted-foreground size-5 shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body font-semibold">
          {missing ? t.seeWeather : t.couldNotFindTown}
        </span>
        <span className="text-muted-foreground text-label">
          <span className="sr-only">. </span>
          {missing ? t.addPostalCode : t.checkPostalCode}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-accent-foreground text-label inline-flex shrink-0 items-center gap-0.5 font-medium"
      >
        {missing ? t.steps.locationAction : t.check}
        <ChevronRightIcon className="size-4" />
      </span>
    </Link>
  );
};

/** "Today", "Tomorrow", then the short weekday. */
const dayLabel = (
  timestamp: number,
  timeZone: string,
  locale: InterfaceLocale
): string => {
  const day = relativeDay(timestamp, timeZone, undefined, locale);
  const words = messagesFor(locale).format;

  return day === words.today || day === words.tomorrow
    ? day
    : (formatShortDay(timestamp, timeZone, locale).split(",")[0] ?? day);
};

/** Appointments and reminders in the same row rhythm as the family list. */
const WeekList = ({
  rows,
  timeZone,
  weather,
}: {
  rows: WeekRow[];
  timeZone: string;
  weather: WeatherState | undefined;
}) => {
  const locale = useLocale();
  const t = useMessages();

  return (
    <TodayPanel headingId="week-heading" title={t.today.yourWeek}>
      <LocationPrompt state={weather} />
      {rows.length === 0 ? (
        <SideEmpty>{t.today.nothingBooked}</SideEmpty>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((row) => (
            <li className="flex items-center gap-3.5 py-2.5" key={row.id}>
              <time
                className="flex w-20 shrink-0 flex-col"
                dateTime={new Date(row.at).toISOString()}
                title={formatWhen(row.at, timeZone, locale)}
              >
                <span className="text-muted-foreground text-label">
                  {dayLabel(row.at, timeZone, locale)}
                </span>
                <span className="num text-body font-semibold">
                  <span className="sr-only">, </span>
                  {formatTime(row.at, timeZone, locale)}
                </span>
              </time>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body font-semibold">
                  <span className="sr-only">, </span>
                  {row.title}
                </span>
                <span className="text-muted-foreground text-label wrap-anywhere">
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
                      {t.today.weatherPrefix}
                      {row.weather.label}
                      {t.today.weatherHigh}
                    </span>
                    <WeatherIcon className="size-4" code={row.weather.code} />
                    <span className="num">{row.weather.high}</span>
                    {row.weather.advice ? (
                      <span>· {row.weather.advice}</span>
                    ) : null}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </TodayPanel>
  );
};

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
  const locale = useLocale();
  // Pictures and relationships come from the contact list, which other screens already load.
  const contacts = useQuery(api.contacts.list);
  const t = useMessages();
  const rows = latestPerPerson(messages);

  return (
    <TodayPanel
      action={<AllLink href="/messages">{t.today.allMessages}</AllLink>}
      headingId="messages-heading"
      title={t.today.messages}
    >
      {rows.length === 0 ? (
        <SideEmpty>{t.today.noMessages}</SideEmpty>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((message) => {
            const contact = contacts?.find(
              (candidate) => candidate._id === message.contactId
            );

            return (
              <li key={message.id}>
                <Link
                  className={PANEL_ROW}
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
                        title={formatWhen(message.createdAt, timeZone, locale)}
                      >
                        <span className="sr-only">, </span>
                        {listTime(
                          message.createdAt,
                          timeZone,
                          undefined,
                          locale
                        )}
                      </time>
                    </span>
                    <span className="text-muted-foreground text-label truncate">
                      <span className="sr-only">, </span>
                      {message.body.trim() || t.today.newMessage}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </TodayPanel>
  );
};

export { AllLink, FamilyList, PANEL_ROW, TodayPanel, WeekList };

export type { WeekRow };

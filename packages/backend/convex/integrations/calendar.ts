/**
 * Calendar events through Composio. Google events carry a private extended
 * property with the attempt's idempotency key so an uncertain create can be
 * looked up instead of guessed.
 */
import { z } from "zod";

import { localDateTimeIn } from "../lib/time";
import { executeTool } from "./composio";
import type { ToolOutcome } from "./composio";
import type { Reconciled } from "./mail";

interface CalendarAccount {
  connectedAccountId: string;
  provider: "google_calendar" | "outlook";
  userId: string;
}

interface NewEvent {
  endsAt: number;
  idempotencyKey: string;
  location: string | null;
  startsAt: number;
  timeZone: string;
  title: string;
}

const KEY_PROPERTY = "lifelinkKey";

const createEvent = async (
  account: CalendarAccount,
  event: NewEvent
): Promise<ToolOutcome> => {
  if (account.provider === "google_calendar") {
    return await executeTool(
      "GOOGLECALENDAR_CREATE_EVENT",
      account.userId,
      account.connectedAccountId,
      {
        calendar_id: "primary",
        create_meeting_room: false,
        end_datetime: localDateTimeIn(event.endsAt, event.timeZone),
        extended_properties: {
          private: { [KEY_PROPERTY]: event.idempotencyKey },
        },
        location: event.location ?? "",
        start_datetime: localDateTimeIn(event.startsAt, event.timeZone),
        summary: event.title,
        timezone: event.timeZone,
      }
    );
  }

  return await executeTool(
    "OUTLOOK_CALENDAR_CREATE_EVENT",
    account.userId,
    account.connectedAccountId,
    {
      body: `Added by LifeLink (${event.idempotencyKey}).`,
      end_datetime: localDateTimeIn(event.endsAt, event.timeZone),
      location: event.location ?? "",
      start_datetime: localDateTimeIn(event.startsAt, event.timeZone),
      subject: event.title,
      time_zone: event.timeZone,
    }
  );
};

const eventsSchema = z
  .object({ items: z.array(z.object({ id: z.string() }).loose()).optional() })
  .loose();

const findEvent = async (
  account: CalendarAccount,
  idempotencyKey: string
): Promise<Reconciled> => {
  if (account.provider !== "google_calendar") {
    return "cannot_tell";
  }

  const outcome = await executeTool(
    "GOOGLECALENDAR_EVENTS_LIST",
    account.userId,
    account.connectedAccountId,
    {
      calendarId: "primary",
      privateExtendedProperty: `${KEY_PROPERTY}=${idempotencyKey}`,
    }
  );

  if (outcome.kind !== "ok") {
    return "cannot_tell";
  }

  const parsed = eventsSchema.safeParse(outcome.data);

  if (!parsed.success) {
    return "cannot_tell";
  }

  return (parsed.data.items ?? []).length > 0 ? "found" : "not_found";
};

const upcomingSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            end: z
              .object({ dateTime: z.string().optional() })
              .loose()
              .optional(),
            id: z.string(),
            location: z.string().optional(),
            start: z
              .object({
                date: z.string().optional(),
                dateTime: z.string().optional(),
              })
              .loose()
              .optional(),
            summary: z.string().optional(),
          })
          .loose()
      )
      .optional(),
  })
  .loose();

interface UpcomingEvent {
  endsAt: number | null;
  id: string;
  location: string | null;
  startsAt: number;
  title: string;
}

const listUpcomingEvents = async (
  account: CalendarAccount,
  fromMs: number,
  toMs: number
): Promise<UpcomingEvent[]> => {
  if (account.provider !== "google_calendar") {
    return [];
  }

  const outcome = await executeTool(
    "GOOGLECALENDAR_EVENTS_LIST",
    account.userId,
    account.connectedAccountId,
    {
      calendarId: "primary",
      maxResults: 20,
      orderBy: "startTime",
      singleEvents: true,
      timeMax: new Date(toMs).toISOString(),
      timeMin: new Date(fromMs).toISOString(),
    }
  );

  if (outcome.kind !== "ok") {
    return [];
  }

  const parsed = upcomingSchema.safeParse(outcome.data);

  if (!parsed.success) {
    return [];
  }

  return (parsed.data.items ?? []).flatMap((item) => {
    const startsAt = Date.parse(item.start?.dateTime ?? item.start?.date ?? "");

    if (Number.isNaN(startsAt)) {
      return [];
    }

    const endsAt = Date.parse(item.end?.dateTime ?? "");

    return [
      {
        endsAt: Number.isNaN(endsAt) ? null : endsAt,
        id: item.id,
        location: item.location ?? null,
        startsAt,
        title: item.summary ?? "Event",
      },
    ];
  });
};

export { createEvent, findEvent, listUpcomingEvents };

export type { CalendarAccount, NewEvent, UpcomingEvent };

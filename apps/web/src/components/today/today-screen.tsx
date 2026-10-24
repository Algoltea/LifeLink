"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { describeWeather, weatherAdvice } from "@lifelink/contracts/weather";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { BellRingIcon } from "lucide-react";
import { useState } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import {
  GettingStarted,
  showsGettingStarted,
  useStepsHidden,
} from "@/components/today/getting-started";
import { LatestEmail } from "@/components/today/latest-email";
import { NewsCard } from "@/components/today/news-card";
import {
  FamilyList,
  TodayPanel,
  WeekList,
} from "@/components/today/side-lists";
import type { WeekRow } from "@/components/today/side-lists";
import { TodayHeader } from "@/components/today/today-header";
import { WeatherChip } from "@/components/today/weather";
import { Composer } from "@/components/voice/composer";
import { messageOf } from "@/lib/errors";
import { dayKey, formatTime, relativeDay } from "@/lib/format";
import {
  dayFor,
  degrees,
  forecastOf,
  spokenWeather,
  useTemperatureUnit,
  useWeather,
} from "@/lib/weather";

type TodaySummary = FunctionReturnType<typeof api.today.summary>;

/** Appointments and reminders form the short overview on Today. */
const currentBriefing = (summary: TodaySummary): string[] => {
  const lines: string[] = [];

  const [next] = summary.appointments;

  if (next) {
    const day = relativeDay(next.startsAt, summary.timeZone);

    const when =
      day === "Today" || day === "Tomorrow" ? day.toLowerCase() : `on ${day}`;

    lines.push(
      `Your next appointment is ${next.title} ${when} at ${formatTime(next.startsAt, summary.timeZone)}.`
    );
  } else {
    lines.push("You have no appointments scheduled this week.");
  }

  if (summary.dueReminders.length > 0) {
    lines.push(
      `${summary.dueReminders.length} ${summary.dueReminders.length === 1 ? "reminder is" : "reminders are"} due.`
    );
  }

  return lines;
};

/** Who wrote in the last two days, by first name, the same people as the Messages list. */
const spokenMessages = (messages: TodaySummary["messages"]): string => {
  const names = [
    ...new Set(
      messages.map((message) => message.contactName.split(" ")[0] ?? "")
    ),
  ].filter(Boolean);

  return names.length === 0
    ? ""
    : `You have messages from ${new Intl.ListFormat("en-US", { type: "conjunction" }).format(names)} in the last two days.`;
};

const DueReminder = ({
  reminder,
}: {
  reminder: { _id: Id<"reminders">; title: string };
}) => {
  const dismiss = useMutation(api.reminders.dismiss);
  const [busy, setBusy] = useState(false);
  const [dismissError, setDismissError] = useState<string | null>(null);

  return (
    <div className="border-border bg-warning-wash flex flex-col gap-4 rounded-xl border px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-3 text-lg leading-7 font-semibold">
          <BellRingIcon aria-hidden="true" className="size-5 shrink-0" />
          {reminder.title}
        </p>
        <div className="flex flex-wrap gap-3">
          <ReadAloudButton text={reminder.title} />
          <Button
            aria-busy={busy}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setDismissError(null);

              try {
                await dismiss({ reminderId: reminder._id });
              } catch (error) {
                setDismissError(
                  messageOf(error instanceof Error ? error : null)
                );
              }

              setBusy(false);
            }}
            variant="outline"
          >
            {busy ? "Saving…" : "Done"}
          </Button>
        </div>
      </div>
      {dismissError ? (
        <ErrorNote>{dismissError} Press Done to try again.</ErrorNote>
      ) : null}
    </div>
  );
};

const TodayContent = ({
  stepsHidden,
  summary,
}: {
  stepsHidden: boolean;
  summary: TodaySummary;
}) => {
  const { timeZone } = summary;
  const weather = useWeather(timeZone);
  const unit = useTemperatureUnit();
  const forecast = forecastOf(weather);
  const lines = currentBriefing(summary);

  // Practice accounts arrive with sample data, so the first-run steps are for real accounts only.
  const welcome =
    !summary.demoMode &&
    showsGettingStarted(summary.gettingStarted, stepsHidden);

  const week: WeekRow[] = [
    ...summary.appointments.map((appointment): WeekRow => {
      const day = dayFor(forecast, dayKey(appointment.startsAt, timeZone));

      return {
        at: appointment.startsAt,
        id: appointment._id,
        sub:
          appointment.rideStatus === "confirmed" && appointment.driverName
            ? `Ride with ${appointment.driverName.split(" ")[0] ?? appointment.driverName}, confirmed`
            : (appointment.location ?? "Appointment"),
        title: appointment.title,
        weather: day
          ? {
              advice: weatherAdvice(day),
              code: day.code,
              high: degrees(day.highC, unit),
              label: describeWeather(day.code).label,
            }
          : undefined,
      };
    }),
    ...summary.upcomingReminders.map((reminder) => ({
      at: reminder.remindAt,
      id: reminder._id,
      sub: "Reminder",
      title: reminder.title,
    })),
  ].toSorted((left, right) => left.at - right.at);

  return (
    <>
      <TodayHeader
        lines={lines}
        preferredName={summary.preferredName}
        spoken={[
          forecast ? spokenWeather(forecast, unit) : "",
          spokenMessages(summary.messages),
        ]}
        timeZone={timeZone}
        weather={<WeatherChip state={weather} unit={unit} />}
      />

      {summary.dueReminders.map((reminder) => (
        <DueReminder key={reminder._id} reminder={reminder} />
      ))}

      {/* Groups sit further apart than the rows inside them. One column on a phone, in the same order. */}
      <div className="flex flex-col gap-10">
        {welcome ? <GettingStarted progress={summary.gettingStarted} /> : null}
        {/* Side by side on a wide screen; the wide gap stands in for panel edges. */}
        <div className="grid items-start gap-x-12 gap-y-10 @min-[56rem]/content:grid-cols-2">
          <WeekList rows={week} timeZone={timeZone} weather={weather} />
          <TodayPanel headingId="messages-heading" title="Messages">
            <FamilyList messages={summary.messages} timeZone={timeZone} />
            <LatestEmail timeZone={timeZone} />
          </TodayPanel>
        </div>
        <NewsCard />
        <Composer />
      </div>
    </>
  );
};

const TodayScreen = () => {
  const summary = useQuery(api.today.summary);
  const stepsHidden = useStepsHidden();

  if (summary === undefined) {
    return (
      <>
        <PageHeader
          className="[&>div]:w-full"
          subline={
            <LoadingRows
              label="Loading your briefing"
              layout="briefing"
              className="w-full"
            />
          }
          title="Today"
        />
        <LoadingRows layout="today" label="Loading today" rows={5} />
      </>
    );
  }

  return <TodayContent stepsHidden={stepsHidden} summary={summary} />;
};

export { TodayScreen };

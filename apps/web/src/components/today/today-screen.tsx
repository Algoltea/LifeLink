"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { BellRingIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import {
  GettingStarted,
  showsGettingStarted,
  useStepsHidden,
} from "@/components/today/getting-started";
import { LatestEmail } from "@/components/today/latest-email";
import { MarketTicker } from "@/components/today/markets";
import { NewsCard } from "@/components/today/news-card";
import { FamilyList, WeekList } from "@/components/today/side-lists";
import type { WeekRow } from "@/components/today/side-lists";
import { TodayHeader } from "@/components/today/today-header";
import { TodayWorkspace } from "@/components/today/today-workspace";
import { WeatherChip } from "@/components/today/weather";
import { Composer } from "@/components/voice/composer";
import { useLocale, messagesFor, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { dayKey, formatTime, relativeDay } from "@/lib/format";
import {
  adviceFor,
  dayFor,
  degrees,
  forecastOf,
  spokenWeather,
  useTemperatureUnit,
  useWeather,
  weatherLabel,
} from "@/lib/weather";

type TodaySummary = FunctionReturnType<typeof api.today.summary>;

/** Appointments and reminders form the short overview on Today. */
const currentBriefing = (
  summary: TodaySummary,
  locale: InterfaceLocale
): string[] => {
  const lines: string[] = [];
  const { format, today } = messagesFor(locale);

  const [next] = summary.appointments;

  if (next) {
    const day = relativeDay(next.startsAt, summary.timeZone, undefined, locale);
    let when = today.onDay(day);

    if (day === format.today) {
      when = today.todayLower;
    } else if (day === format.tomorrow) {
      when = today.tomorrowLower;
    }

    lines.push(
      today.nextAppointment(
        next.title,
        when,
        formatTime(next.startsAt, summary.timeZone, locale)
      )
    );
  } else {
    lines.push(today.noAppointments);
  }

  if (summary.dueReminders.length > 0) {
    lines.push(today.remindersDue(summary.dueReminders.length));
  }

  return lines;
};

/** Who wrote in the last two days, by first name, the same people as the Messages list. */
const spokenMessages = (
  messages: TodaySummary["messages"],
  locale: InterfaceLocale
): string => {
  const names = [
    ...new Set(
      messages.map((message) => message.contactName.split(" ")[0] ?? "")
    ),
  ].filter(Boolean);

  return names.length === 0
    ? ""
    : messagesFor(locale).today.messagesFrom(
        new Intl.ListFormat(intlLocaleOf(locale), {
          type: "conjunction",
        }).format(names)
      );
};

const DueReminder = ({
  reminder,
}: {
  reminder: { _id: Id<"reminders">; title: string };
}) => {
  const dismiss = useMutation(api.reminders.dismiss);
  const t = useMessages();
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
            {busy ? t.common.saving : t.common.done}
          </Button>
        </div>
      </div>
      {dismissError ? (
        <ErrorNote>{t.today.dismissFailed(dismissError)}</ErrorNote>
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
  const locale = useLocale();
  const { timeZone } = summary;
  const weather = useWeather(timeZone);
  const unit = useTemperatureUnit();
  const forecast = forecastOf(weather);
  const t = useMessages();
  const router = useRouter();
  const lines = currentBriefing(summary, locale);

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
            ? t.today.rideConfirmed(
                appointment.driverName.split(" ")[0] ?? appointment.driverName
              )
            : (appointment.location ?? t.today.appointment),
        title: appointment.title,
        weather: day
          ? {
              advice: adviceFor(day, locale),
              code: day.code,
              high: degrees(day.highC, unit),
              label: weatherLabel(day.code, locale),
            }
          : undefined,
      };
    }),
    ...summary.upcomingReminders.map((reminder) => ({
      at: reminder.remindAt,
      id: reminder._id,
      sub: t.today.reminder,
      title: reminder.title,
    })),
  ].toSorted((left, right) => left.at - right.at);

  return (
    <TodayWorkspace
      composer={
        // Today and Ask share the current conversation, so Ask shows the answer as it arrives.
        <Composer compact onSubmitted={() => router.push("/ask")} />
      }
    >
      <TodayHeader
        lines={lines}
        markets={<MarketTicker timeZone={timeZone} />}
        preferredName={summary.preferredName}
        spoken={[
          forecast ? spokenWeather(forecast, unit, locale) : "",
          spokenMessages(summary.messages, locale),
        ]}
        timeZone={timeZone}
        weather={<WeatherChip state={weather} unit={unit} />}
      />

      {summary.dueReminders.map((reminder) => (
        <DueReminder key={reminder._id} reminder={reminder} />
      ))}

      {welcome ? <GettingStarted progress={summary.gettingStarted} /> : null}

      {/* Three columns on a wide screen so the whole day fits one view: plans, then email and people, then news. Messages sit under the short email list so they show without scrolling past a long week. One column on a phone, in the same order. */}
      <div className="grid shrink-0 items-start gap-x-6 gap-y-6 @min-[36rem]/content:grid-cols-2 @min-[52rem]/content:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
        <WeekList rows={week} timeZone={timeZone} weather={weather} />
        <div className="flex min-w-0 flex-col gap-5">
          <LatestEmail timeZone={timeZone} />
          <FamilyList messages={summary.messages} timeZone={timeZone} />
        </div>
        <NewsCard className="@min-[36rem]/content:col-span-2 @min-[52rem]/content:col-span-1" />
      </div>
    </TodayWorkspace>
  );
};

const TodayScreen = () => {
  const summary = useQuery(api.today.summary);
  const stepsHidden = useStepsHidden();
  const t = useMessages();

  if (summary === undefined) {
    return <LoadingRows layout="today" label={t.today.loadingToday} rows={5} />;
  }

  return <TodayContent stepsHidden={stepsHidden} summary={summary} />;
};

export { TodayScreen };

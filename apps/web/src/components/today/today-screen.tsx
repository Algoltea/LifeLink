"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { BellRingIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, ErrorNote, LoadingRows } from "@/components/app/states";
import { TaskPanel } from "@/components/tasks/task-panel";
import {
  GettingStarted,
  showsGettingStarted,
  useStepsHidden,
} from "@/components/today/getting-started";
import { FamilyList, WeekList } from "@/components/today/side-lists";
import type { WeekRow } from "@/components/today/side-lists";
import { TodayHeader } from "@/components/today/today-header";
import { Composer } from "@/components/voice/composer";
import { messageOf } from "@/lib/errors";
import { formatTime, relativeDay } from "@/lib/format";

type TodaySummary = FunctionReturnType<typeof api.today.summary>;

/** Live facts use the same query as the review list, so a morning snapshot cannot contradict it. */
const currentBriefing = (summary: TodaySummary): string[] => {
  const waiting = summary.waitingOnYou.length;

  const lines = [
    waiting > 0
      ? `${waiting} ${waiting === 1 ? "request needs" : "requests need"} your review.`
      : "Nothing needs your review right now.",
  ];

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

  const { timeZone } = summary;
  const lines = currentBriefing(summary);
  const tasks = [...summary.waitingOnYou, ...summary.progressing].slice(0, 3);

  // Practice accounts arrive with sample data, so the first-run steps are for real accounts only.
  const welcome =
    !summary.demoMode &&
    showsGettingStarted(summary.gettingStarted, stepsHidden);

  // With nothing to review, the welcome steps already point to Ask.
  const showReview = !welcome || tasks.length > 0;

  const week: WeekRow[] = [
    ...summary.appointments.map((appointment) => ({
      at: appointment.startsAt,
      id: appointment._id,
      sub:
        appointment.rideStatus === "confirmed" && appointment.driverName
          ? `Ride with ${appointment.driverName.split(" ")[0] ?? appointment.driverName}, confirmed`
          : (appointment.location ?? "Appointment"),
      title: appointment.title,
    })),
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
        timeZone={timeZone}
      />

      {summary.dueReminders.map((reminder) => (
        <DueReminder key={reminder._id} reminder={reminder} />
      ))}

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {welcome ? (
            <GettingStarted progress={summary.gettingStarted} />
          ) : null}
          {showReview ? (
            <h2 className="text-section font-semibold">Needs your review</h2>
          ) : null}
          {showReview && tasks.length === 0 ? (
            <EmptyNote
              action={
                <Link className="text-lg font-semibold underline" href="/ask">
                  Ask LifeLink
                </Link>
              }
            >
              Nothing is waiting for you. When you ask for something, it will
              appear here for you to review.
            </EmptyNote>
          ) : null}
          {tasks.map((task) => (
            <TaskPanel key={task._id} taskId={task._id} />
          ))}
          <Composer />
        </div>
        <aside className="flex flex-col gap-8">
          <WeekList rows={week} timeZone={timeZone} />
          <FamilyList messages={summary.messages} timeZone={timeZone} />
        </aside>
      </div>
    </>
  );
};

export { TodayScreen };

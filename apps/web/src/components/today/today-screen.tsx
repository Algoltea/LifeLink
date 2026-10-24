"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { BellRingIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect } from "react";

import { Avatar, ModePill, ReadAloudButton } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { TaskPanel } from "@/components/tasks/task-panel";
import { Composer } from "@/components/voice/composer";
import { ago, formatShortDay, formatTime, relativeDay } from "@/lib/format";

interface WeekRow {
  at: number;
  id: string;
  sub: string;
  title: string;
}

const TodayScreen = () => {
  const summary = useQuery(api.today.summary);
  const ensureBriefing = useMutation(api.briefings.ensureToday);
  const dismiss = useMutation(api.reminders.dismiss);

  useEffect(() => {
    void ensureBriefing({});
  }, [ensureBriefing]);

  if (summary === undefined) {
    return (
      <>
        <PageHeader title="Today" />
        <LoadingRows label="Loading today" rows={5} />
      </>
    );
  }

  const { timeZone } = summary;
  const { briefing } = summary;
  const fact = briefing?.greetingFact ?? "";
  const tasks = [...summary.waitingOnYou, ...summary.progressing].slice(0, 3);

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
      <PageHeader
        subline={
          <span className="flex max-w-prose flex-col gap-3 text-lg leading-7">
            <span className="text-foreground">
              {fact || `Here's your day, ${summary.preferredName}.`}
            </span>
            {briefing?.lines.length ? (
              <span>{briefing.lines.join(" ")}</span>
            ) : null}
            {briefing ? (
              <span className="flex flex-wrap items-center gap-3 text-base">
                {briefing.source === "model"
                  ? "Written by LifeLink from your schedule."
                  : "Put together from your schedule."}
                <ModePill mode={briefing.mode} />
                <ReadAloudButton
                  label="Read my day aloud"
                  text={[fact, ...briefing.lines].join(" ")}
                />
              </span>
            ) : null}
          </span>
        }
        title="Today"
      />

      {summary.dueReminders.map((reminder) => (
        <div
          className="border-border bg-warning-wash flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4"
          key={reminder._id}
          role="alert"
        >
          <p className="flex items-center gap-3 text-lg leading-7 font-semibold">
            <BellRingIcon
              aria-hidden="true"
              className="text-foreground size-5 shrink-0"
            />
            {reminder.title}
          </p>
          <div className="flex gap-3">
            <ReadAloudButton text={reminder.title} />
            <Button
              onClick={() => {
                void dismiss({ reminderId: reminder._id });
              }}
              variant="outline"
            >
              Done
            </Button>
          </div>
        </div>
      ))}

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <h2 className="text-2xl leading-8 font-semibold">
            Needs your review
          </h2>
          {tasks.length === 0 ? (
            <EmptyNote
              action={
                <Link className="text-lg font-semibold underline" href="/ask">
                  Ask LifeLink
                </Link>
              }
            >
              Nothing is waiting for you. When you ask for something, it will
              appear here for you to check.
            </EmptyNote>
          ) : (
            tasks.map((task) => <TaskPanel key={task._id} taskId={task._id} />)
          )}
          <Composer />
        </div>
        <aside className="flex flex-col gap-8">
          <section aria-labelledby="week-heading" className="flex flex-col">
            <h2
              className="pb-3 text-2xl leading-8 font-semibold"
              id="week-heading"
            >
              This week
            </h2>
            {week.length === 0 ? (
              <p className="border-rule text-muted-foreground border-t py-4 text-lg">
                Nothing booked this week.
              </p>
            ) : (
              <ul>
                {week.map((row) => (
                  <li
                    className="border-rule flex gap-4 border-t py-4"
                    key={row.id}
                  >
                    <span className="flex w-24 shrink-0 flex-col gap-1">
                      <span className="text-muted-foreground text-base">
                        {relativeDay(row.at, timeZone) === "Today"
                          ? "Today"
                          : formatShortDay(row.at, timeZone).split(",")[0]}
                      </span>
                      <span className="num text-base font-semibold">
                        {formatTime(row.at, timeZone)}
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-lg font-bold">{row.title}</span>
                      <span className="text-muted-foreground text-base">
                        {row.sub}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="family-heading" className="flex flex-col">
            <h2
              className="pb-3 text-2xl leading-8 font-semibold"
              id="family-heading"
            >
              From family
            </h2>
            {summary.messages.length === 0 ? (
              <p className="border-rule text-muted-foreground border-t py-4 text-lg">
                No new messages in the last two days.
              </p>
            ) : (
              <ul>
                {summary.messages.map((message) => (
                  <li className="border-rule border-t" key={message.id}>
                    <Link
                      className="hover:bg-surface flex gap-3 py-4"
                      // SAFETY: a stored contact id, and /messages/[contactId] is a real route.
                      href={`/messages/${message.contactId}` as Route}
                    >
                      <Avatar
                        hue={message.contactHue}
                        name={message.contactName}
                        size="sm"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-lg font-bold">
                            {message.contactName.split(" ")[0]}
                          </span>
                          <span className="text-muted-foreground text-base">
                            {ago(message.createdAt, timeZone)}
                          </span>
                        </span>
                        <span className="line-clamp-2 text-lg leading-7">
                          {message.body}
                        </span>
                        <span className="self-start">
                          <ModePill mode={message.mode} />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
};

export { TodayScreen };

"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Pill } from "@lifelink/ui/components/pill";
import { useQuery } from "convex/react";
import type { Route } from "next";
import Link from "next/link";

import { LoadingRows } from "@/components/app/states";
import { formatDay, formatTime } from "@/lib/format";

import { ActionReview } from "./action-review";
import { JourneyGauge } from "./journey-gauge";

type TaskStatusWords = Partial<Record<Doc<"tasks">["status"], string>>;

const STATUS_PILL: TaskStatusWords = {
  awaiting_approval: "Your turn",
  in_progress: "Working on it",
  needs_attention: "Needs a look",
  needs_clarification: "A question for you",
  waiting_for_reply: "Waiting for a reply",
};

/** One task on Today: what it is, the journey gauge, and the decision in place. */
const TaskPanel = ({ taskId }: { taskId: Id<"tasks"> }) => {
  const detail = useQuery(api.tasks.detail, { taskId });

  if (detail === undefined) {
    return <LoadingRows label="Loading request details" layout="task-panel" />;
  }

  if (detail === null) {
    return null;
  }

  const { appointment, task, timeZone } = detail;

  const focus =
    detail.actions.find((view) => view.action.status === "awaiting_approval") ??
    detail.actions.find(
      (view) =>
        view.action.status === "unknown" || view.action.status === "failed"
    ) ??
    null;

  const showGauge = detail.steps.length > 1;

  return (
    <section
      aria-labelledby={`task-${task._id}`}
      className="motion-enter bg-surface flex flex-col gap-6 rounded-xl px-5 py-6 sm:px-7 sm:py-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold" id={`task-${task._id}`}>
            <Link
              className="inline-flex min-h-12 items-center hover:underline"
              // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
              href={`/tasks/${task._id}` as Route}
            >
              {task.title}
            </Link>
          </h2>
          {appointment ? (
            <p className="text-muted-foreground text-lg">
              {formatDay(appointment.startsAt, timeZone)} at{" "}
              {formatTime(appointment.startsAt, timeZone)}
              {appointment.location ? ` · ${appointment.location}` : ""}
            </p>
          ) : null}
        </div>
        <Pill className="bg-primary text-primary-foreground">
          {STATUS_PILL[task.status] ?? "In progress"}
        </Pill>
      </div>
      {focus ? (
        <ActionReview
          hue={detail.contact?.hue ?? 30}
          timeZone={timeZone}
          view={focus}
        />
      ) : (
        <p className="text-lg">
          {task.status === "waiting_for_reply"
            ? "Your message was sent. We'll show the answer as soon as it arrives."
            : "Nothing needs you right now."}{" "}
          <Link
            className="font-semibold underline"
            // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
            href={`/tasks/${task._id}` as Route}
          >
            See the details
          </Link>
        </p>
      )}
      {showGauge ? (
        <details className="border-rule border-t pt-2" open={!focus}>
          <summary className="min-h-control cursor-pointer content-center text-base font-semibold">
            Progress and next steps
          </summary>
          <div className="pt-4">
            <JourneyGauge steps={detail.steps} />
          </div>
        </details>
      ) : null}
    </section>
  );
};

export { TaskPanel };

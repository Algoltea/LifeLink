"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Pill } from "@lifelink/ui/components/pill";
import { useQuery } from "convex/react";
import type { Route } from "next";
import Link from "next/link";

import { LoadingRows } from "@/components/app/states";
import { useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { formatWhen } from "@/lib/format";

import { ActionReview } from "./action-review";
import { JourneyGauge } from "./journey-gauge";

/** One task on Today: what it is, the journey gauge, and the decision in place. */
const TaskPanel = ({ taskId }: { taskId: Id<"tasks"> }) => {
  const detail = useQuery(api.tasks.detail, { taskId });
  const t = useMessages().tasks;

  if (detail === undefined) {
    return <LoadingRows label={t.loadingRequest} layout="task-panel" />;
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
              {translateServerMessage(task.title)}
            </Link>
          </h2>
          {appointment ? (
            <p className="text-muted-foreground text-lg">
              {formatWhen(appointment.startsAt, timeZone)}
              {appointment.location ? ` · ${appointment.location}` : ""}
            </p>
          ) : null}
        </div>
        <Pill className="bg-primary text-primary-foreground">
          {t.status[task.status] ?? t.inProgress}
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
            ? t.sentWaiting
            : t.nothingNeedsYou}{" "}
          <Link
            className="font-semibold underline"
            // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
            href={`/tasks/${task._id}` as Route}
          >
            {t.seeDetails}
          </Link>
        </p>
      )}
      {showGauge ? (
        <details className="border-rule border-t pt-2" open={!focus}>
          <summary className="min-h-control cursor-pointer content-center text-base font-semibold">
            {t.progressAndNext}
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

"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ModePill, ReadAloudButton } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { currentMessages, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { messageOf } from "@/lib/errors";
import { ago, formatDay, formatTime } from "@/lib/format";

import { ActionReview } from "./action-review";
import type { ActionView, TaskDetail } from "./action-review";
import { spokenDetails } from "./details-view";
import { JourneyGauge } from "./journey-gauge";

const LINK_PATTERN = /\b(?:https?:\/\/|www\.)/iu;

/** The action that needs the person now, or the most recent one. */
const focusOf = (actions: ActionView[]): ActionView | null => {
  const needsYou = actions.find(
    (view) => view.action.status === "awaiting_approval"
  );

  const troubled = actions.find(
    (view) =>
      view.action.status === "unknown" || view.action.status === "failed"
  );

  return (
    needsYou ??
    troubled ??
    actions.toSorted(
      (left, right) => right.action.updatedAt - left.action.updatedAt
    )[0] ??
    null
  );
};

interface Heading {
  subline: string;
  title: string;
}

const headingFor = (focus: ActionView | null, detail: TaskDetail): Heading => {
  const kind = focus?.current?.details.kind;
  const awaiting = focus?.action.status === "awaiting_approval";
  const { tasks } = currentMessages();
  const t = tasks.heading;
  const who = detail.contact?.name.split(" ")[0] ?? tasks.them;
  const title = translateServerMessage(detail.task.title);

  if (awaiting && kind === "send_message") {
    return { subline: t.sendSubline(who), title: t.sendTitle };
  }

  if (awaiting && kind === "confirm_arrangement") {
    return { subline: t.confirmSubline(who), title: t.confirmTitle };
  }

  if (awaiting) {
    return { subline: t.approveSubline, title: t.approveTitle };
  }

  if (detail.task.status === "waiting_for_reply") {
    return { subline: t.waitingSubline(who), title: t.waitingTitle(who) };
  }

  if (detail.task.status === "completed") {
    return { subline: t.completedSubline, title };
  }

  return { subline: t.standsSubline, title };
};

/** What the backend checked, stated from the stored facts, never assumed. */
const ChecksPanel = ({
  detail,
  focus,
}: {
  detail: TaskDetail;
  focus: ActionView | null;
}) => {
  const details = focus?.current?.details;
  const t = useMessages().tasks;
  const checks: string[] = [];

  if (detail.contact !== null) {
    checks.push(
      t.checks.contact(
        detail.contact.name,
        detail.contact.relationship.toLowerCase() || t.checks.trusted
      )
    );
  }

  if (detail.appointment !== null) {
    checks.push(
      t.checks.appointment(
        detail.appointment.title,
        formatDay(detail.appointment.startsAt, detail.timeZone),
        formatTime(detail.appointment.startsAt, detail.timeZone)
      )
    );
  }

  if (details?.kind === "send_message") {
    checks.push(
      LINK_PATTERN.test(details.body) ? t.checks.hasLink : t.checks.noLinks
    );
  }

  if (
    focus?.current !== null &&
    focus?.current !== undefined &&
    focus.current.ambiguities.every((item) => item.resolvedValue !== null)
  ) {
    checks.push(t.checks.nothingUnclear);
  }

  if (checks.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="checked-heading"
      className="bg-surface flex flex-col gap-4 rounded-xl px-6 py-6"
    >
      <h2 className="text-2xl font-semibold" id="checked-heading">
        {t.checkedForYou}
      </h2>
      <ul className="flex flex-col gap-3">
        {checks.map((check) => (
          <li className="flex gap-3 text-lg leading-snug" key={check}>
            <CheckIcon
              aria-hidden="true"
              className="text-accent-foreground mt-1 size-5 shrink-0"
              strokeWidth={2.6}
            />
            {check}
          </li>
        ))}
      </ul>
    </section>
  );
};

/** Sent and received messages look different: a send is a receipt, a reply is the other person's words. */
const Conversation = ({ detail }: { detail: TaskDetail }) => {
  const interpret = useMutation(api.replies.interpretManually);
  const waitStep = detail.steps.find((step) => step.kind === "await_reply");

  const replies = detail.messages.filter(
    (message) => message.direction === "incoming"
  );

  const unclear = waitStep?.status === "waiting" && replies.length > 0;
  const words = useMessages();
  const t = words.tasks;
  const who = detail.contact?.name.split(" ")[0] ?? t.they;

  if (detail.messages.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="conversation-heading"
      className="flex flex-col gap-4"
    >
      <h2 className="text-2xl font-semibold" id="conversation-heading">
        {t.messages}
      </h2>
      <ol className="flex flex-col gap-3">
        {detail.messages.map((message) => (
          <li
            className={
              message.direction === "incoming"
                ? "border-border bg-raised flex flex-col gap-1 rounded-xl border px-5 py-4"
                : "bg-surface flex flex-col gap-1 rounded-xl px-5 py-4"
            }
            key={message._id}
          >
            <span className="text-muted-foreground flex flex-wrap items-center gap-2 text-base">
              {message.direction === "incoming" ? t.replied(who) : t.youSent} ·{" "}
              {ago(message.createdAt, detail.timeZone)}
              {message.direction === "outgoing"
                ? ` · ${words.threads.status[message.status].toLowerCase()}`
                : ""}
              <ModePill mode={message.mode} />
            </span>
            <p className="text-xl leading-snug">{message.body}</p>
          </li>
        ))}
      </ol>
      {unclear ? (
        <div className="bg-surface flex flex-col gap-3 rounded-xl px-5 py-4">
          <p className="text-lg">{t.unclearReply(who)}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                try {
                  await interpret({ accepted: true, taskId: detail.task._id });
                } catch (error) {
                  toast.error(messageOf(error instanceof Error ? error : null));
                }
              }}
              variant="outline"
            >
              {t.whoCan(who)}
            </Button>
            <Button
              onClick={async () => {
                try {
                  await interpret({ accepted: false, taskId: detail.task._id });
                } catch (error) {
                  toast.error(messageOf(error instanceof Error ? error : null));
                }
              }}
              variant="outline"
            >
              {t.whoCannot(who)}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

const TaskScreen = ({ taskId }: { taskId: string }) => {
  // SAFETY: the id comes from a LifeLink link; the query validates it and rejects anything not owned by this person.
  const detail = useQuery(api.tasks.detail, { taskId: taskId as Id<"tasks"> });
  const words = useMessages();
  const t = words.tasks;

  if (detail === undefined) {
    return <LoadingRows layout="task" label={t.loadingDetails} rows={4} />;
  }

  if (detail === null) {
    return (
      <EmptyNote
        action={
          <Link className="text-lg font-semibold underline" href="/">
            {t.backToToday}
          </Link>
        }
      >
        {t.notFound}
      </EmptyNote>
    );
  }

  const focus = focusOf(detail.actions);
  const heading = headingFor(focus, detail);
  const hue = detail.contact?.hue ?? 30;

  const others = detail.actions.filter(
    (view) => view !== focus && view.action.status === "awaiting_approval"
  );

  return (
    <>
      <nav aria-label={t.breadcrumb} className="text-muted-foreground text-lg">
        <Link className="underline-offset-4 hover:underline" href="/">
          {words.today.title}
        </Link>
        <span aria-hidden="true"> › </span>
        <span>{translateServerMessage(detail.task.title)}</span>
      </nav>
      <PageHeader
        actions={
          <ReadAloudButton
            text={[
              `${heading.title}. ${heading.subline}`,
              focus?.current
                ? spokenDetails(focus.current.details, detail.timeZone)
                : "",
            ].join(" ")}
          />
        }
        subline={heading.subline}
        title={heading.title}
      />
      <div className="grid items-start gap-9 @min-[56rem]/content:grid-cols-[minmax(0,1fr)_22.5rem]">
        <div className="flex min-w-0 flex-col gap-8">
          {focus === null ? (
            <EmptyNote>{t.nothingToApprove}</EmptyNote>
          ) : (
            <ActionReview hue={hue} timeZone={detail.timeZone} view={focus} />
          )}
          {others.map((view) => (
            <section
              className="border-rule flex flex-col gap-4 border-t pt-8"
              key={view.action._id}
            >
              <h2 className="text-2xl font-semibold">{t.alsoWaiting}</h2>
              <ActionReview hue={hue} timeZone={detail.timeZone} view={view} />
            </section>
          ))}
          <Conversation detail={detail} />
        </div>
        <aside className="flex flex-col gap-8">
          <ChecksPanel detail={detail} focus={focus} />
          <section
            aria-labelledby="progress-heading"
            className="flex flex-col gap-4"
          >
            <h2 className="text-2xl font-semibold" id="progress-heading">
              {detail.task.status === "completed" ? t.howItWent : t.stepByStep}
            </h2>
            <JourneyGauge orientation="vertical" steps={detail.steps} />
          </section>
        </aside>
      </div>
    </>
  );
};

export { TaskScreen };

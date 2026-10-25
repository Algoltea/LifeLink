"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { useEffect, useId, useRef, useState } from "react";
import { z } from "zod";

import { useOffline } from "@/components/app/offline-queue";
import { usePresentationDemo } from "@/components/app/presentation-demo";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { useLocale, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { messageOf } from "@/lib/errors";

import { ActionReview } from "./action-review";
import { taskBlockerText } from "./presentation-copy";

type TaskReview = NonNullable<
  FunctionReturnType<typeof api.assistant.taskReview>
>;

type ReviewView = TaskReview["actions"][number];

/** Only what sending together reads, so the panel can be exercised on its own. */
interface SendableMessage {
  action: Pick<ReviewView["action"], "_id">;
  current: Pick<
    NonNullable<ReviewView["current"]>,
    "details" | "fingerprint" | "version"
  > | null;
}

/** Tool output supplies identity only; the server supplies the current version. */
const InlineActionReview = ({
  actionId,
  onEditingChange,
}: {
  actionId: string;
  onEditingChange?: (editing: boolean) => void;
}) => {
  const review = useQuery(api.assistant.actionReview, { actionId });
  const headingId = useId();
  const t = useMessages().tasks;
  const locale = useLocale();

  if (review === undefined) {
    return <LoadingRows layout="review" label={t.loadingLatest} rows={2} />;
  }

  if (review === null) {
    return <p className="text-muted-foreground text-lg">{t.detailsGone}</p>;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="border-border bg-raised overflow-hidden rounded-2xl border"
    >
      <h3
        className="border-border bg-parchment border-b px-5 py-3.5 text-lg font-semibold"
        id={headingId}
      >
        {translateServerMessage(review.title, locale)}
      </h3>
      <div className="p-5">
        <ActionReview
          hue={review.hue}
          timeZone={review.timeZone}
          view={review.view}
          onEditingChange={onEditingChange}
        />
      </div>
    </section>
  );
};

const isUnresolved = (view: ReviewView): boolean =>
  !view.current ||
  view.blockers.length > 0 ||
  view.current.ambiguities.some((item) => item.resolvedValue === null);

const contactNameOf = (view: ReviewView): string =>
  view.current?.details.kind === "send_message"
    ? view.current.details.contactName
    : "";

const approvalErrorData = z.object({
  code: z.string().optional(),
  message: z.string(),
});

/** Map known mode errors before localization; preserve normal error handling. */
const approvalFailureText = (
  cause: unknown,
  presentationDemo: boolean,
  locale: InterfaceLocale
): string => {
  const error = cause instanceof Error ? cause : null;

  if (!presentationDemo || error === null) {
    return messageOf(error);
  }

  let original = error.message;

  if (error instanceof ConvexError) {
    const parsed = approvalErrorData.safeParse(error.data);

    if (parsed.success) {
      original = parsed.data.message;
    }
  }

  const presented = taskBlockerText(original, presentationDemo, locale);

  return presented === translateServerMessage(original, locale)
    ? messageOf(error)
    : presented;
};

/**
 * Lists every waiting message in one place, then approves exactly that set in
 * a single transaction. The summary is the review; sending is one more press.
 */
const SendAllPanel = ({
  blocked,
  busy,
  hasEdits,
  onBusyChange,
  practice,
  taskId,
  waiting,
}: {
  blocked: boolean;
  busy: boolean;
  hasEdits: boolean;
  onBusyChange: (busy: boolean) => void;
  practice: boolean;
  taskId?: TaskReview["task"]["_id"];
  waiting: SendableMessage[];
}) => {
  const approveAll = useMutation(api.actions.approveMessages);
  const presentationDemo = usePresentationDemo();
  const locale = useLocale();
  const { online } = useOffline();
  const [reviewing, setReviewing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const summaryHeading = useRef<HTMLHeadingElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  const summaryId = useId();
  const messages = useMessages();
  const t = messages.tasks.sendAll;
  const count = waiting.length;
  const ready = online && !blocked && !hasEdits;
  const presentation = presentationDemo && practice;

  const copy = presentation
    ? {
        confirm: `Approve all ${count}`,
        finishEdits: "Save or cancel your changes before approving all.",
        intro: "Review each person's message together.",
        reconnect: "Reconnect to approve all messages.",
        resolveFirst:
          "Some messages need your answer first. You can still approve ready messages one at a time.",
        review: `Review all ${count}`,
        sending: "Approving…",
        summaryHint:
          "Approval records these messages in LifeLink. Nothing is sent outside LifeLink.",
        summaryTitle: `Approve these ${count} messages?`,
      }
    : {
        ...t,
        confirm: (practice ? t.practiceConfirm : t.confirm)(count),
        review: (practice ? t.practiceReview : t.review)(count),
        summaryTitle: t.summaryTitle(count),
      };

  useEffect(() => {
    if (reviewing) {
      summaryHeading.current?.focus();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      reviewButton.current?.focus();
    }
  }, [reviewing]);

  const sendAll = async (method: "keyboard" | "tap") => {
    onBusyChange(true);
    setFailure(null);

    try {
      await approveAll({
        messages: waiting.flatMap((view) =>
          view.current
            ? [
                {
                  actionId: view.action._id,
                  fingerprint: view.current.fingerprint,
                  version: view.current.version,
                },
              ]
            : []
        ),
        method,
        taskId,
      });
    } catch (error) {
      setFailure(approvalFailureText(error, presentationDemo, locale));
    }

    onBusyChange(false);
  };

  return (
    <div className="bg-parchment flex flex-col gap-3 rounded-xl p-4">
      {reviewing ? (
        <section aria-labelledby={summaryId} className="flex flex-col gap-3">
          <h3
            className="text-lg font-semibold outline-none"
            id={summaryId}
            ref={summaryHeading}
            tabIndex={-1}
          >
            {copy.summaryTitle}
          </h3>
          <p className="text-base">{copy.summaryHint}</p>
          <ul className="flex flex-col gap-2">
            {waiting.map((view) =>
              view.current?.details.kind === "send_message" ? (
                <li
                  className="border-border bg-raised rounded-lg border p-3"
                  key={view.action._id}
                >
                  <p className="font-semibold">
                    {t.recipient(
                      view.current.details.contactName,
                      messages.threads.channels[view.current.details.channel]
                    )}
                  </p>
                  <p className="text-base wrap-anywhere whitespace-pre-wrap">
                    {view.current.details.body}
                  </p>
                </li>
              ) : null
            )}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button
              aria-busy={busy}
              disabled={busy || !ready}
              onClick={async (event) => {
                await sendAll(event.detail === 0 ? "keyboard" : "tap");
              }}
            >
              {busy ? copy.sending : copy.confirm}
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                returnFocus.current = true;
                setReviewing(false);
              }}
              variant="outline"
            >
              {t.back}
            </Button>
          </div>
        </section>
      ) : (
        <>
          <p className="text-base">{copy.intro}</p>
          <Button
            className="self-start"
            disabled={busy || !ready}
            onClick={() => {
              setFailure(null);
              setReviewing(true);
            }}
            ref={reviewButton}
          >
            {copy.review}
          </Button>
        </>
      )}
      {hasEdits ? <p>{copy.finishEdits}</p> : null}
      {blocked ? <p>{copy.resolveFirst}</p> : null}
      {online ? null : <p>{copy.reconnect}</p>}
      {failure ? <ErrorNote>{failure}</ErrorNote> : null}
    </div>
  );
};

/** All reviews use the same reactive snapshot as the bulk approval. */
const InlineTaskReview = ({ taskId }: { taskId: string }) => {
  const detail = useQuery(api.assistant.taskReview, { taskId });
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const t = useMessages().tasks;
  const locale = useLocale();

  if (detail === undefined) {
    return <LoadingRows layout="review" label={t.loadingLatest} rows={2} />;
  }

  if (detail === null || detail.actions.length === 0) {
    return (
      <p className="text-muted-foreground text-lg">
        {t.nothingToApproveRequest}
      </p>
    );
  }

  const sorted = detail.actions.toSorted(
    (left, right) =>
      (left.recipientRelationship ?? "").localeCompare(
        right.recipientRelationship ?? "",
        locale,
        { sensitivity: "base" }
      ) || contactNameOf(left).localeCompare(contactNameOf(right), locale)
  );

  const waiting = sorted.filter(
    (view) => view.action.status === "awaiting_approval"
  );

  const canSendTogether =
    detail.task.kind === "send_message" && waiting.length > 1;

  return (
    <fieldset disabled={busy} className="flex min-w-0 flex-col gap-4">
      <legend className="mb-3 text-lg font-semibold">
        {translateServerMessage(detail.task.title, locale)}
      </legend>
      {sorted.map((view) => (
        <section
          className="border-border bg-raised rounded-2xl border p-5"
          key={view.action._id}
        >
          <h3 className="mb-3 text-lg font-semibold">
            {view.recipientRelationship
              ? `${view.recipientRelationship}: `
              : ""}
            {contactNameOf(view) ||
              translateServerMessage(detail.task.title, locale)}
          </h3>
          <ActionReview
            hue={detail.contact?.hue ?? 30}
            timeZone={detail.timeZone}
            view={view}
            onEditingChange={(value) =>
              setEditing((current) => ({
                ...current,
                [view.action._id]: value,
              }))
            }
          />
        </section>
      ))}
      {canSendTogether ? (
        <SendAllPanel
          blocked={waiting.some(isUnresolved)}
          busy={busy}
          hasEdits={waiting.some((view) => editing[view.action._id])}
          onBusyChange={setBusy}
          practice={detail.task.mode === "simulated"}
          taskId={detail.task._id}
          waiting={waiting}
        />
      ) : null}
    </fieldset>
  );
};

/**
 * One reply can prepare each person's message as its own request. Offer to
 * send those together after the last card, using fresh server state.
 */
const InlineSendAll = ({
  actionIds,
  editing,
}: {
  actionIds: string[];
  editing: boolean;
}) => {
  const views = useQuery(api.assistant.actionReviews, { actionIds });
  const [busy, setBusy] = useState(false);

  const waiting = (views ?? []).filter(
    (view) =>
      view.action.kind === "send_message" &&
      view.action.status === "awaiting_approval"
  );

  if (waiting.length < 2) {
    return null;
  }

  return (
    <SendAllPanel
      blocked={waiting.some(isUnresolved)}
      busy={busy}
      hasEdits={editing}
      onBusyChange={setBusy}
      practice={waiting.some((view) => view.action.mode === "simulated")}
      waiting={waiting}
    />
  );
};

export { InlineActionReview, InlineSendAll, InlineTaskReview, SendAllPanel };

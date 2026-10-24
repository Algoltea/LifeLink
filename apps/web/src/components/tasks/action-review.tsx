"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { ActionDetails } from "@lifelink/contracts/actions";
import { Button } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { Switch } from "@lifelink/ui/components/switch";
import { Textarea } from "@lifelink/ui/components/textarea";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  CircleHelpIcon,
  HistoryIcon,
  LoaderIcon,
  SendIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { toast } from "sonner";

import { ModePill } from "@/components/app/bits";
import { useOffline } from "@/components/app/offline-queue";
import { currentMessages, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { messageOf } from "@/lib/errors";

import { DetailsView } from "./details-view";

type TaskDetail = NonNullable<FunctionReturnType<typeof api.tasks.detail>>;

type ActionView = TaskDetail["actions"][number];

type Ambiguity = NonNullable<ActionView["current"]>["ambiguities"][number];

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const CancelActionButton = ({ view }: { view: ActionView }) => {
  const cancel = useMutation(api.actions.cancel);
  const [busy, setBusy] = useState(false);
  const t = useMessages().tasks;

  return (
    <Button
      aria-busy={busy}
      disabled={busy}
      onClick={async () => {
        setBusy(true);

        try {
          await cancel({ actionId: view.action._id });
        } catch (error) {
          toast.error(errorText(error));
        }

        setBusy(false);
      }}
      variant="ghost"
    >
      {busy ? t.cancelling : t.cancelRequest}
    </Button>
  );
};

/** Answer an open question before anything can be approved. */
const Question = ({
  ambiguity,
  onAnswer,
}: {
  ambiguity: Ambiguity;
  onAnswer: (value: string) => void;
}) => (
  <fieldset className="border-foreground bg-raised flex flex-col gap-3 rounded-xl border-2 px-6 py-5">
    <legend className="flex items-center gap-2 px-1 text-xl font-semibold">
      <CircleHelpIcon aria-hidden="true" className="size-6" />
      {translateServerMessage(ambiguity.question)}
    </legend>
    <div className="flex flex-col gap-2">
      {ambiguity.options.map((option) => (
        <Button
          className="justify-start text-left"
          key={option.value}
          onClick={() => onAnswer(option.value)}
          size="lg"
          variant="outline"
        >
          {translateServerMessage(option.label)}
        </Button>
      ))}
    </div>
  </fieldset>
);

const OutcomeConfirmation = ({
  busy,
  confirming,
  error,
  onConfirm,
  view,
}: {
  busy: boolean;
  confirming: boolean;
  error: string | null;
  onConfirm: (wentThrough: boolean) => Promise<void>;
  view: ActionView;
}) => {
  const unknownSpectrumSend =
    view.action.mode === "live" && view.attempts.at(-1)?.provider === "photon";

  const t = useMessages().tasks;

  return (
    <div className="border-warning-edge flex flex-col gap-3 border-t pt-3">
      <p className="text-lg">
        {unknownSpectrumSend ? t.spectrumUnknown : t.couldNotTell}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={confirming}
          disabled={busy}
          onClick={() => onConfirm(true)}
          variant="outline"
        >
          {t.itArrived}
        </Button>
        {unknownSpectrumSend ? null : (
          <Button
            aria-busy={confirming}
            disabled={busy}
            onClick={() => onConfirm(false)}
            variant="outline"
          >
            {t.itDidNotArrive}
          </Button>
        )}
      </div>
      {confirming ? (
        <output className="text-base">{t.savingOutcome}</output>
      ) : null}
      {error ? (
        <p className="text-negative text-base" role="alert">
          {t.outcomeError(error)}
        </p>
      ) : null}
    </div>
  );
};

const ShoppingHistory = ({ view }: { view: ActionView }) => {
  const receipt = view.receipts.at(-1);
  const lastAttempt = view.attempts.at(-1);
  const { status } = view.action;
  const t = useMessages().tasks;

  return (
    <div className="flex flex-col items-start gap-3">
      {receipt ? (
        <div className="bg-surface flex flex-col gap-2 rounded-xl px-5 py-4">
          <p className="flex flex-wrap items-center gap-3 text-xl font-semibold">
            {t.recordedOutcome} <ModePill mode={receipt.mode} />
          </p>
          <p className="text-lg">{translateServerMessage(receipt.summary)}</p>
        </div>
      ) : null}
      {lastAttempt?.error ? (
        <p className="text-muted-foreground text-lg">
          {translateServerMessage(lastAttempt.error)}
        </p>
      ) : null}
      {status === "approved" || status === "failed" ? (
        <CancelActionButton view={view} />
      ) : null}
    </div>
  );
};

const Outcome = ({ view }: { view: ActionView }) => {
  const retry = useMutation(api.actions.retry);
  const checkOutcome = useAction(api.actions.checkOutcome);
  const markOutcome = useMutation(api.actions.markOutcome);
  const [checking, setChecking] = useState(false);
  const [cannotTell, setCannotTell] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);
  const { status } = view.action;
  const receipt = view.receipts.at(-1);
  const lastAttempt = view.attempts.at(-1);
  const t = useMessages().tasks;

  const confirmOutcome = async (wentThrough: boolean): Promise<void> => {
    setConfirming(true);
    setOutcomeError(null);

    try {
      await markOutcome({ actionId: view.action._id, wentThrough });
    } catch (error) {
      setOutcomeError(errorText(error));
    }

    setConfirming(false);
  };

  if (view.action.kind === "grocery_handoff") {
    return <ShoppingHistory view={view} />;
  }

  if (status === "executing" || status === "approved") {
    return (
      <div className="flex flex-col items-start gap-3">
        <output className="flex items-center gap-3 text-lg">
          <LoaderIcon
            aria-hidden="true"
            className="size-6 animate-spin motion-reduce:animate-none"
          />
          {status === "approved" ? t.approvedWaiting : t.workingNow}
        </output>
        {status === "approved" ? <CancelActionButton view={view} /> : null}
      </div>
    );
  }

  if (status === "succeeded" && receipt) {
    return (
      <output className="bg-accent text-accent-foreground flex flex-col gap-2 rounded-xl px-5 py-4">
        <span className="flex flex-wrap items-center gap-3 text-xl font-semibold">
          {t.done} <ModePill mode={receipt.mode} />
        </span>
        <span className="text-lg">
          {translateServerMessage(receipt.summary)}
        </span>
        {receipt.url ? (
          <a
            className="text-lg font-semibold underline"
            href={receipt.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t.openReceipt}
          </a>
        ) : null}
      </output>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="bg-negative-wash text-negative flex flex-col gap-3 rounded-xl px-5 py-4"
        role="alert"
      >
        <p className="text-xl font-semibold">{t.didNotGoThrough}</p>
        {lastAttempt?.error ? (
          <p className="text-lg">{translateServerMessage(lastAttempt.error)}</p>
        ) : null}
        <p className="text-base">{t.nothingWasSent}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={async () => {
              try {
                await retry({ actionId: view.action._id });
              } catch (error) {
                toast.error(errorText(error));
              }
            }}
            variant="outline"
          >
            {currentMessages().common.tryAgain}
          </Button>
          <CancelActionButton view={view} />
        </div>
      </div>
    );
  }

  if (status === "unknown") {
    return (
      <div
        className="border-warning-edge bg-warning-wash text-warning flex flex-col gap-3 rounded-xl border px-5 py-4"
        role="alert"
      >
        <p className="text-xl font-semibold">{t.notSure}</p>
        <p className="text-lg">{t.notSureDetail}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            aria-busy={checking}
            disabled={checking || confirming}
            onClick={async () => {
              setChecking(true);

              try {
                const verdict = await checkOutcome({
                  actionId: view.action._id,
                });

                if (verdict === "cannot_tell") {
                  setCannotTell(true);
                } else {
                  toast.success(
                    verdict === "went_through"
                      ? t.wentThrough
                      : t.wentNotThrough
                  );
                }
              } catch (error) {
                toast.error(errorText(error));
              }

              setChecking(false);
            }}
            variant="outline"
          >
            {checking ? t.checking : t.checkNow}
          </Button>
        </div>
        {cannotTell ? (
          <OutcomeConfirmation
            busy={confirming || checking}
            confirming={confirming}
            error={outcomeError}
            onConfirm={confirmOutcome}
            view={view}
          />
        ) : null}
      </div>
    );
  }

  if (status === "cancelled") {
    return <p className="text-muted-foreground text-lg">{t.cancelled}</p>;
  }

  return null;
};

/** Rewrite a message or draft. Saving creates a new version, which needs a fresh approval. */
const WordsEditor = ({
  actionId,
  canSave,
  initialBody,
  onDone,
  version,
}: {
  actionId: ActionView["action"]["_id"];
  initialBody: string;
  canSave: boolean;
  onDone: () => void;
  version: number;
}) => {
  const revise = useMutation(api.assistant.reviseWords);
  const [draft, setDraft] = useState(initialBody);
  const [editingVersion, setEditingVersion] = useState(version);
  const [saving, setSaving] = useState(false);
  const editId = useId();
  const editor = useRef<HTMLTextAreaElement>(null);
  const outdated = editingVersion !== version;
  const words = useMessages();
  const t = words.tasks;

  useEffect(() => {
    editor.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {canSave ? null : (
        <output className="text-muted-foreground text-base">
          {t.noLongerEditable}
        </output>
      )}
      {outdated && canSave ? (
        <div
          className="bg-warning-wash text-warning flex flex-col gap-3 rounded-xl p-4"
          aria-live="polite"
        >
          <p>{t.detailsChanged}</p>
          <details>
            <summary className="min-h-control cursor-pointer content-center font-semibold">
              {t.latestWording}
            </summary>
            <p className="text-body wrap-anywhere whitespace-pre-wrap">
              {initialBody}
            </p>
          </details>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setEditingVersion(version)}
              variant="outline"
            >
              {t.keepMyEdits}
            </Button>
            <Button
              onClick={() => {
                setDraft(initialBody);
                setEditingVersion(version);
              }}
              variant="ghost"
            >
              {t.useLatestWords}
            </Button>
          </div>
        </div>
      ) : null}
      <Label htmlFor={editId}>{t.messageText}</Label>
      <Textarea
        className="text-body min-h-40 leading-relaxed"
        disabled={saving}
        id={editId}
        onChange={(event) => setDraft(event.target.value)}
        rows={5}
        ref={editor}
        value={draft}
      />
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={saving}
          disabled={saving || !canSave || outdated || draft.trim().length === 0}
          onClick={async () => {
            setSaving(true);

            try {
              const result = await revise({
                actionId,
                body: draft,
                version: editingVersion,
              });

              onDone();

              if (result.approvalInvalidated) {
                toast(t.savedApproveAgain);
              } else {
                toast.success(t.changesSaved);
              }
            } catch (error) {
              toast.error(errorText(error));
            }

            setSaving(false);
          }}
        >
          {saving ? words.common.saving : words.contactForm.saveChanges}
        </Button>
        <Button disabled={saving} onClick={onDone} variant="ghost">
          {t.cancelEditing}
        </Button>
      </div>
    </div>
  );
};

/** For a reminder awaiting approval: whether the trusted circle may see it. Changing it asks for a fresh approval. */
const ReminderSharing = ({
  actionId,
  shared,
}: {
  actionId: ActionView["action"]["_id"];
  shared: boolean;
}) => {
  const revise = useMutation(api.actions.revise);
  const [saving, setSaving] = useState(false);
  const t = useMessages().tasks;

  return (
    <div className="bg-surface flex items-center justify-between gap-4 rounded-xl px-5 py-4">
      <div className="flex flex-col">
        <span className="text-lg font-semibold">{t.reminderShare}</span>
        <span className="text-muted-foreground text-base">
          {t.reminderShareHint}
        </span>
      </div>
      <Switch
        aria-label={t.reminderShareAria}
        checked={shared}
        disabled={saving}
        onCheckedChange={async (checked) => {
          setSaving(true);

          try {
            await revise({ actionId, shareWithCircle: checked });
          } catch (error) {
            toast.error(errorText(error));
          }

          setSaving(false);
        }}
      />
    </div>
  );
};

/** The version before the latest change, folded away until asked for. */
const PreviousVersion = ({
  details,
  granteeNames,
  hue,
  timeZone,
}: {
  details: ActionDetails;
  granteeNames: string[];
  hue: number;
  timeZone: string;
}) => {
  const [showPrevious, setShowPrevious] = useState(false);
  const t = useMessages().tasks;

  return (
    <div
      className={cn(
        "border-control rounded-xl border-[1.5px] border-dashed",
        showPrevious && "pb-4"
      )}
    >
      <button
        aria-expanded={showPrevious}
        className="hover:bg-neutral-wash flex min-h-14 w-full items-center gap-3 rounded-xl px-5 text-left text-lg font-semibold transition-colors"
        onClick={() => setShowPrevious(!showPrevious)}
        type="button"
      >
        <HistoryIcon aria-hidden="true" className="text-brass-ink size-5" />
        {showPrevious ? t.earlierVersionHide : t.earlierVersionShow}
      </button>
      {showPrevious ? (
        <div className="px-5">
          <DetailsView
            details={details}
            granteeNames={granteeNames}
            hue={hue}
            timeZone={timeZone}
          />
        </div>
      ) : null}
    </div>
  );
};

type Version = NonNullable<ActionView["current"]>;

/** Approve (or queue the approval when offline), change the words, or decline. */
const ApprovalBar = ({
  current,
  editable,
  onEdit,
  questionOpen,
  view,
}: {
  current: Version;
  editable: boolean;
  onEdit: () => void;
  questionOpen: boolean;
  view: ActionView;
}) => {
  const approve = useMutation(api.actions.approve);
  const cancel = useMutation(api.actions.cancel);
  const { online, queueApproval } = useOffline();
  const [pending, setPending] = useState<"approve" | "cancel" | null>(null);
  const blockedId = useId();
  const busy = pending !== null;
  const { kind } = current.details;
  const retired = kind === "grocery_handoff";
  // Older servers and cached offline data predate `blockers`.
  const blockers: readonly string[] = view.blockers ?? [];
  const blocked = !retired && blockers.length > 0;
  const t = useMessages().tasks;

  const onApprove = async (
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    // A click with detail 0 came from the keyboard (Enter or Space).
    const method = event.detail === 0 ? "keyboard" : "tap";

    if (!online) {
      const saved = queueApproval({
        actionId: view.action._id,
        fingerprint: current.fingerprint,
        label: t.approve[kind],
        version: current.version,
      });

      if (!saved) {
        toast.error(t.offlineApprovalFailed);

        return;
      }

      toast(t.offlineApprovalSaved);

      return;
    }

    setPending("approve");

    try {
      await approve({
        actionId: view.action._id,
        fingerprint: current.fingerprint,
        method,
        version: current.version,
      });
    } catch (error) {
      toast.error(errorText(error));
    }

    setPending(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          aria-busy={busy}
          aria-describedby={blocked ? blockedId : undefined}
          disabled={busy || questionOpen || retired || blocked}
          onClick={onApprove}
          size="lg"
        >
          {kind === "send_message" ? <SendIcon /> : null}
          {pending === "approve" ? t.approving : t.approve[kind]}
        </Button>
        {editable ? (
          <Button disabled={busy} onClick={onEdit} size="lg" variant="outline">
            {t.changeWords}
          </Button>
        ) : null}
        <Button
          aria-busy={pending === "cancel"}
          className="underline"
          disabled={busy}
          onClick={async () => {
            setPending("cancel");

            try {
              await cancel({ actionId: view.action._id });
            } catch (error) {
              toast.error(errorText(error));
            }

            setPending(null);
          }}
          size="lg"
          variant="ghost"
        >
          {pending === "cancel" ? t.cancelling : t.cancelRequest}
        </Button>
      </div>
      {blocked ? (
        <div
          className="border-warning-edge bg-warning-wash flex flex-col gap-2 rounded-xl border px-5 py-4"
          id={blockedId}
        >
          <p className="text-lg leading-7">
            {blockers
              .map((blocker) => translateServerMessage(blocker))
              .join(" ")}
          </p>
          {blockers.some((blocker) => blocker.includes("Trusted circle")) ? (
            <Link
              className="text-foreground min-h-control inline-flex items-center self-start underline underline-offset-4"
              href="/circle"
            >
              {t.goToCircle}
            </Link>
          ) : null}
        </div>
      ) : null}
      {retired ? (
        <p className="text-muted-foreground text-base">{t.shoppingRetired}</p>
      ) : (
        <p className="text-muted-foreground text-base">
          {questionOpen ? t.answerFirst : t.askAgainIfChanged}
        </p>
      )}
    </div>
  );
};

/**
 * Review an action exactly as it will happen, answer any open question,
 * change it (which asks for a fresh approval), and approve.
 */
const ReviewVersion = ({
  hue,
  timeZone,
  view,
}: {
  hue: number;
  timeZone: string;
  view: ActionView;
}) => {
  const resolve = useMutation(api.actions.resolveAmbiguity);
  const [editing, setEditing] = useState(false);
  const { current } = view;
  const statusLine = useRef<HTMLParagraphElement>(null);
  const hadFocus = useRef(false);
  const t = useMessages().tasks;

  const previous = useRef({
    editing,
    status: view.action.status,
    version: current?.version,
  });

  useEffect(() => {
    const changed =
      previous.current.version !== current?.version ||
      previous.current.status !== view.action.status ||
      previous.current.editing !== editing;

    previous.current = {
      editing,
      status: view.action.status,
      version: current?.version,
    };

    if (changed && hadFocus.current && !editing) {
      statusLine.current?.focus({ preventScroll: true });
    }
  }, [current?.version, view.action.status, editing]);

  if (current === null) {
    return null;
  }

  const { details } = current;
  const retired = details.kind === "grocery_handoff";

  const open = current.ambiguities.find(
    (ambiguity) => ambiguity.resolvedValue === null
  );

  const awaiting = view.action.status === "awaiting_approval";
  const canApprove = awaiting && !retired;

  const body =
    details.kind === "send_message" || details.kind === "email_draft"
      ? details.body
      : null;

  const reapproval =
    canApprove &&
    view.invalidatedApprovals.some((item) => item.version < current.version);

  return (
    <div
      className="flex flex-col gap-5"
      onBlurCapture={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          hadFocus.current = false;
        }
      }}
      onFocusCapture={() => {
        hadFocus.current = true;
      }}
    >
      <p
        className="text-muted-foreground text-base outline-none"
        ref={statusLine}
        tabIndex={-1}
      >
        {t.version(current.version, t.reviewStatus[view.action.status])}
      </p>
      {reapproval ? (
        <output className="bg-warning-wash text-warning block rounded-xl px-5 py-3 text-lg">
          {t.approveAgain}
        </output>
      ) : null}
      {view.action.mode === "simulated" && !retired ? (
        <p className="text-simulated flex flex-wrap items-center gap-3 text-base">
          <ModePill mode="simulated" />
          {t.practiceApproval}
        </p>
      ) : null}

      <DetailsView
        bodyEditor={
          editing && body !== null ? (
            <WordsEditor
              actionId={view.action._id}
              canSave={awaiting}
              initialBody={body}
              onDone={() => setEditing(false)}
              version={current.version}
            />
          ) : undefined
        }
        details={details}
        granteeNames={view.granteeNames}
        hue={hue}
        timeZone={timeZone}
      />

      {details.kind === "create_reminder" && awaiting ? (
        <ReminderSharing
          actionId={view.action._id}
          shared={details.shareWithCircle}
        />
      ) : null}

      {open && canApprove ? (
        <Question
          ambiguity={open}
          onAnswer={async (value) => {
            try {
              await resolve({
                actionId: view.action._id,
                field: open.field,
                value,
              });
            } catch (error) {
              toast.error(errorText(error));
            }
          }}
        />
      ) : null}

      {awaiting && !editing ? (
        <ApprovalBar
          current={current}
          editable={body !== null}
          onEdit={() => setEditing(true)}
          questionOpen={open !== undefined}
          view={view}
        />
      ) : null}

      <Outcome view={view} />

      {view.previous ? (
        <PreviousVersion
          details={view.previous.details}
          granteeNames={view.granteeNames}
          hue={hue}
          timeZone={timeZone}
        />
      ) : null}
    </div>
  );
};

/** Keep in-progress edits available when a newer server version arrives. */
const ActionReview = (props: {
  hue: number;
  timeZone: string;
  view: ActionView;
}) => <ReviewVersion {...props} key={props.view.action._id} />;

export { ActionReview };

export type { ActionView, TaskDetail };

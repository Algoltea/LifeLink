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
import { messageOf } from "@/lib/errors";

import { DetailsView } from "./details-view";

type TaskDetail = NonNullable<FunctionReturnType<typeof api.tasks.detail>>;

type ActionView = TaskDetail["actions"][number];

type Ambiguity = NonNullable<ActionView["current"]>["ambiguities"][number];

const REVIEW_STATUS: Record<ActionView["action"]["status"], string> = {
  approved: "Approved",
  awaiting_approval: "Review these details",
  cancelled: "Cancelled",
  executing: "In progress",
  failed: "Did not go through",
  succeeded: "Completed",
  unknown: "Outcome not confirmed",
};

const APPROVE_WORDS: Record<ActionDetails["kind"], string> = {
  calendar_event: "Approve and add it",
  confirm_arrangement: "Confirm the ride",
  create_reminder: "Save the reminder",
  drive_note: "Approve and save it",
  email_draft: "Approve and save the draft",
  family_update: "Share the update",
  grocery_handoff: "Approve request",
  send_message: "Approve and send",
};

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const CancelActionButton = ({ view }: { view: ActionView }) => {
  const cancel = useMutation(api.actions.cancel);
  const [busy, setBusy] = useState(false);

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
      {busy ? "Cancelling…" : "Cancel this request"}
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
      {ambiguity.question}
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
          {option.label}
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

  return (
    <div className="border-warning-edge flex flex-col gap-3 border-t pt-3">
      <p className="text-lg">
        {unknownSpectrumSend
          ? "We still cannot confirm this message. Ask the person whether it arrived. If it has not arrived yet, it may still arrive later; LifeLink will keep its status uncertain."
          : "We couldn’t tell from here. Please check (for example, ask the person) and tell us:"}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={confirming}
          disabled={busy}
          onClick={() => onConfirm(true)}
          variant="outline"
        >
          It arrived
        </Button>
        {unknownSpectrumSend ? null : (
          <Button
            aria-busy={confirming}
            disabled={busy}
            onClick={() => onConfirm(false)}
            variant="outline"
          >
            It didn’t arrive
          </Button>
        )}
      </div>
      {confirming ? (
        <output className="text-base">Saving what happened…</output>
      ) : null}
      {error ? (
        <p className="text-negative text-base" role="alert">
          {error} Please try again.
        </p>
      ) : null}
    </div>
  );
};

const ShoppingHistory = ({ view }: { view: ActionView }) => {
  const receipt = view.receipts.at(-1);
  const lastAttempt = view.attempts.at(-1);
  const { status } = view.action;

  return (
    <div className="flex flex-col items-start gap-3">
      {receipt ? (
        <div className="bg-surface flex flex-col gap-2 rounded-xl px-5 py-4">
          <p className="flex flex-wrap items-center gap-3 text-xl font-semibold">
            Recorded outcome <ModePill mode={receipt.mode} />
          </p>
          <p className="text-lg">{receipt.summary}</p>
        </div>
      ) : null}
      {lastAttempt?.error ? (
        <p className="text-muted-foreground text-lg">{lastAttempt.error}</p>
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
          {status === "approved"
            ? "Approved. Waiting to start…"
            : "Working on it now…"}
        </output>
        {status === "approved" ? <CancelActionButton view={view} /> : null}
      </div>
    );
  }

  if (status === "succeeded" && receipt) {
    return (
      <output className="bg-accent text-accent-foreground flex flex-col gap-2 rounded-xl px-5 py-4">
        <span className="flex flex-wrap items-center gap-3 text-xl font-semibold">
          Done <ModePill mode={receipt.mode} />
        </span>
        <span className="text-lg">{receipt.summary}</span>
        {receipt.url ? (
          <a
            className="text-lg font-semibold underline"
            href={receipt.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open the receipt
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
        <p className="text-xl font-semibold">This didn’t go through.</p>
        {lastAttempt?.error ? (
          <p className="text-lg">{lastAttempt.error}</p>
        ) : null}
        <p className="text-base">
          Nothing was sent, so it’s safe to try again.
        </p>
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
            Try again
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
        <p className="text-xl font-semibold">
          We’re not sure this went through.
        </p>
        <p className="text-lg">
          The service did not confirm what happened. LifeLink keeps this marked
          as uncertain so it cannot be mistaken for a safe retry.
        </p>
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
                      ? "It went through."
                      : "It didn't go through. You can try again."
                  );
                }
              } catch (error) {
                toast.error(errorText(error));
              }

              setChecking(false);
            }}
            variant="outline"
          >
            {checking ? "Checking…" : "Check now"}
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
    return (
      <p className="text-muted-foreground text-lg">
        You cancelled this. Nothing was sent.
      </p>
    );
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

  useEffect(() => {
    editor.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {canSave ? null : (
        <output className="text-muted-foreground text-base">
          This request can no longer be edited. Your unsaved words are kept here
          so you can copy them.
        </output>
      )}
      {outdated && canSave ? (
        <div
          className="bg-warning-wash text-warning flex flex-col gap-3 rounded-xl p-4"
          aria-live="polite"
        >
          <p>
            The details changed while you were editing. Your edits are kept
            here. Compare them with the latest wording before saving.
          </p>
          <details>
            <summary className="min-h-control cursor-pointer content-center font-semibold">
              See the latest wording
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
              Keep my edits
            </Button>
            <Button
              onClick={() => {
                setDraft(initialBody);
                setEditingVersion(version);
              }}
              variant="ghost"
            >
              Use the latest words
            </Button>
          </div>
        </div>
      ) : null}
      <Label htmlFor={editId}>Message text</Label>
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
                toast(
                  "Saved. Because the words changed, please approve again."
                );
              } else {
                toast.success(
                  "Changes saved. Review the updated message before approving."
                );
              }
            } catch (error) {
              toast.error(errorText(error));
            }

            setSaving(false);
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button disabled={saving} onClick={onDone} variant="ghost">
          Cancel editing
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

  return (
    <div className="bg-surface flex items-center justify-between gap-4 rounded-xl px-5 py-4">
      <div className="flex flex-col">
        <span className="text-lg font-semibold">
          Let my trusted circle see this reminder
        </span>
        <span className="text-muted-foreground text-base">
          Only people you share reminders with.
        </span>
      </div>
      <Switch
        aria-label="Share this reminder with my trusted circle"
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
        {showPrevious ? "Hide the earlier version" : "Show the earlier version"}
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

  const onApprove = async (
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    // A click with detail 0 came from the keyboard (Enter or Space).
    const method = event.detail === 0 ? "keyboard" : "tap";

    if (!online) {
      const saved = queueApproval({
        actionId: view.action._id,
        fingerprint: current.fingerprint,
        label: APPROVE_WORDS[kind],
        version: current.version,
      });

      if (!saved) {
        toast.error(
          "This approval could not be saved offline. Please approve again when connected."
        );

        return;
      }

      toast(
        "Saved for when you're back online. LifeLink will check everything again before it's sent."
      );

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
          {pending === "approve" ? "Approving…" : APPROVE_WORDS[kind]}
        </Button>
        {editable ? (
          <Button disabled={busy} onClick={onEdit} size="lg" variant="outline">
            Change the words
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
          {pending === "cancel" ? "Cancelling…" : "Cancel this request"}
        </Button>
      </div>
      {blocked ? (
        <div
          className="border-warning-edge bg-warning-wash flex flex-col gap-2 rounded-xl border px-5 py-4"
          id={blockedId}
        >
          <p className="text-lg leading-7">{blockers.join(" ")}</p>
          {blockers.some((blocker) => blocker.includes("Trusted circle")) ? (
            <Link
              className="text-foreground min-h-control inline-flex items-center self-start underline underline-offset-4"
              href="/circle"
            >
              Go to Trusted circle
            </Link>
          ) : null}
        </div>
      ) : null}
      {retired ? (
        <p className="text-muted-foreground text-base">
          Shopping requests can no longer be approved.
        </p>
      ) : (
        <p className="text-muted-foreground text-base">
          {questionOpen
            ? "Answer the question above first."
            : "If anything changes after you approve, like the time or who it goes to, LifeLink will ask you again."}
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
        Version {current.version} · {REVIEW_STATUS[view.action.status]}
      </p>
      {reapproval ? (
        <output className="bg-warning-wash text-warning block rounded-xl px-5 py-3 text-lg">
          Something changed after you approved, so please look it over and
          approve again.
        </output>
      ) : null}
      {view.action.mode === "simulated" && !retired ? (
        <p className="text-simulated flex flex-wrap items-center gap-3 text-base">
          <ModePill mode="simulated" /> Practice mode: approving shows what
          would happen; nothing real is sent.
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

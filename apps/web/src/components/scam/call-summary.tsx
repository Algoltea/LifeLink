"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import type { CallCaption, CallFlag } from "@lifelink/contracts/call-screening";
import { Button } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation } from "convex/react";
import {
  ChevronDownIcon,
  LockKeyholeIcon,
  MicOffIcon,
  ShieldCheckIcon,
  ShieldQuestionIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { usePreferences } from "@/components/app/preferences";
import { useLocale } from "@/i18n/locale";
import { ago } from "@/lib/format";

import {
  callTime,
  callFlagReason,
  useCallScreeningMessages,
} from "./call-screening-parts";
import { TrustedPeople } from "./trusted-people";

interface CallSummaryValue {
  /** In-memory captions from the call that just ended; never saved. */
  captions?: CallCaption[];
  /** Some speech was never checked for warning signs. */
  checkIncomplete?: boolean;
  durationMs: number;
  flags: CallFlag[];
  /** Absent on summaries saved before word counts existed. */
  heardWords?: number;
  interrupted: boolean;
  practice: boolean;
  startedAt: number;
}

type Outcome = "flagged" | "clear" | "silent" | "unchecked";

type CallMessages = ReturnType<typeof useCallScreeningMessages>;

const outcomeOf = (summary: CallSummaryValue): Outcome => {
  if (summary.flags.length > 0) {
    return "flagged";
  }

  // Older summaries have no count to judge by, so they never read as silent.
  if (summary.heardWords === 0) {
    return "silent";
  }

  return summary.checkIncomplete === true ? "unchecked" : "clear";
};

const silentCopy = (
  messages: CallMessages,
  practice: boolean
): { body: string; title: string } =>
  practice
    ? { body: messages.practiceSilentBody, title: messages.practiceSilentTitle }
    : { body: messages.silentBody, title: messages.silentTitle };

const outcomeSpeech = (
  messages: CallMessages,
  summary: CallSummaryValue,
  outcome: Outcome
): string[] => {
  if (outcome === "flagged") {
    return [
      `${messages.potentialScam} ${messages.flaggedTitle(summary.flags.length)}.`,
      ...summary.flags.map((flag) => callFlagReason(flag.reason, messages)),
      messages.flaggedAdvice,
    ];
  }

  if (outcome === "silent") {
    const { body, title } = silentCopy(messages, summary.practice);

    return summary.practice
      ? [`${title}.`, body]
      : [`${title}.`, body, `${messages.retryTitle}:`, ...messages.retrySteps];
  }

  if (outcome === "unchecked") {
    return [
      `${messages.uncheckedTitle}.`,
      messages.uncheckedBody,
      messages.callbackAdvice,
    ];
  }

  return [
    `${messages.clearTitle}.`,
    messages.heardText(summary.heardWords),
    `${messages.cannotConfirm} ${messages.callbackAdvice}`,
  ];
};

const spokenSummary = (
  messages: CallMessages,
  summary: CallSummaryValue,
  outcome: Outcome
): string =>
  [
    summary.practice ? `${messages.practiceCall}.` : "",
    ...outcomeSpeech(messages, summary, outcome),
    summary.interrupted ? messages.interrupted : "",
    outcome === "flagged" && summary.checkIncomplete === true
      ? messages.partlyChecked
      : "",
  ]
    .filter(Boolean)
    .join(" ");

const ResultPanel = ({
  onScreenAgain,
  outcome,
  saving,
  summary,
}: {
  onScreenAgain?: () => void;
  outcome: Outcome;
  saving: boolean;
  summary: CallSummaryValue;
}) => {
  const messages = useCallScreeningMessages();

  const icon = {
    clear: (
      <ShieldCheckIcon
        aria-hidden="true"
        className="text-muted-foreground mt-0.5 size-7 shrink-0"
      />
    ),
    flagged: (
      <TriangleAlertIcon
        aria-hidden="true"
        className="text-warning mt-0.5 size-7 shrink-0"
      />
    ),
    silent: (
      <MicOffIcon
        aria-hidden="true"
        className="text-muted-foreground mt-0.5 size-7 shrink-0"
      />
    ),
    unchecked: (
      <ShieldQuestionIcon
        aria-hidden="true"
        className="text-muted-foreground mt-0.5 size-7 shrink-0"
      />
    ),
  }[outcome];

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-5 sm:p-6",
        outcome === "flagged"
          ? "border-warning-edge bg-warning-wash"
          : "border-rule bg-parchment"
      )}
    >
      <div className="flex items-start gap-3.5">
        {icon}
        <div className="flex min-w-0 flex-col gap-2">
          {outcome === "flagged" ? (
            <>
              <h3 className="text-section font-semibold">
                {messages.flaggedTitle(summary.flags.length)}
              </h3>
              <p className="max-w-prose text-lg">
                {summary.practice
                  ? messages.practiceFlaggedBody
                  : messages.flaggedBody}
              </p>
              <p className="max-w-prose text-lg font-semibold">
                {messages.flaggedAdvice}
              </p>
            </>
          ) : null}
          {outcome === "clear" ? (
            <>
              <h3 className="text-section font-semibold">
                {messages.clearTitle}
              </h3>
              <p className="max-w-prose text-lg">
                {messages.heardText(summary.heardWords)}
              </p>
              <p className="text-muted-foreground max-w-prose text-lg">
                {messages.cannotConfirm} {messages.callbackAdvice}
              </p>
            </>
          ) : null}
          {outcome === "unchecked" ? (
            <>
              <h3 className="text-section font-semibold">
                {messages.uncheckedTitle}
              </h3>
              <p className="max-w-prose text-lg">{messages.uncheckedBody}</p>
              <p className="text-muted-foreground max-w-prose text-lg">
                {messages.callbackAdvice}
              </p>
            </>
          ) : null}
          {outcome === "flagged" && summary.checkIncomplete === true ? (
            <p className="text-warning max-w-prose text-lg">
              {messages.partlyChecked}
            </p>
          ) : null}
          {outcome === "silent" ? (
            <>
              <h3 className="text-section font-semibold">
                {silentCopy(messages, summary.practice).title}
              </h3>
              <p className="max-w-prose text-lg">
                {silentCopy(messages, summary.practice).body}
              </p>
            </>
          ) : null}
          {summary.interrupted ? (
            <p className="text-warning max-w-prose text-lg">
              {messages.interrupted}
            </p>
          ) : null}
        </div>
      </div>
      {outcome === "silent" && !summary.practice ? (
        <div className="flex flex-col gap-2 sm:pl-[2.6rem]">
          <h4 className="text-xl font-semibold">{messages.retryTitle}</h4>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
            {messages.retrySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {outcome === "silent" && onScreenAgain ? (
          <Button disabled={saving} onClick={onScreenAgain} size="lg">
            {messages.screenAnotherCall}
          </Button>
        ) : null}
        <ReadAloudButton
          label={messages.readResult}
          text={spokenSummary(messages, summary, outcome)}
          variant="ghost"
        />
      </div>
    </section>
  );
};

const FlagList = ({ flags }: { flags: CallFlag[] }) => {
  const messages = useCallScreeningMessages();

  return (
    <section className="bg-parchment flex min-w-0 flex-col gap-3 rounded-xl p-5 sm:p-6">
      <h3 className="text-section font-semibold">{messages.flagged}</h3>
      <p className="text-muted-foreground text-body">{messages.quoteNotice}</p>
      <ul>
        {flags.map((flag) => (
          <li
            className="border-rule grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border-t py-4"
            key={flag.id}
          >
            <span className="text-accent-ink num font-semibold">
              {callTime(flag.timeMs)}
            </span>
            <div className="min-w-0 space-y-1.5">
              <h4 className="text-xl font-semibold">
                {callFlagReason(flag.reason, messages)}
              </h4>
              <blockquote className="pl-3 break-words">
                “{flag.quote}”
              </blockquote>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const HeardCaptions = ({
  captions,
  practice,
}: {
  captions: CallCaption[];
  practice: boolean;
}) => {
  const messages = useCallScreeningMessages();

  return (
    <details className="group border-rule border-t pt-4">
      <summary className="min-h-control flex list-none flex-wrap items-center gap-x-3 gap-y-1 [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 shrink-0 -rotate-90 transition-transform group-open:rotate-0"
        />
        <span className="font-semibold">{messages.heard}</span>
        <span className="text-muted-foreground text-body">
          {messages.captionsNotSaved}
        </span>
      </summary>
      <p className="text-muted-foreground text-body mt-2">
        {practice ? messages.practiceCaptionSource : messages.mixedVoices}
      </p>
      <section
        aria-label={messages.heard}
        className="mt-3 flex max-h-[28rem] flex-col gap-3 overflow-y-auto overscroll-contain pr-2"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll the captions.
        tabIndex={0}
      >
        {captions.map((caption) => (
          <div className="flex gap-4" key={caption.id}>
            <span className="text-muted-foreground num w-14 shrink-0 font-semibold">
              {callTime(caption.timeMs)}
            </span>
            <p
              className={cn(
                "min-w-0 break-words",
                caption.flagId !== undefined && "font-semibold"
              )}
            >
              {caption.speaker === "unknown" ? null : (
                <span className="text-muted-foreground font-semibold">
                  {caption.speaker === "caller"
                    ? messages.caller
                    : messages.you}
                  :{" "}
                </span>
              )}
              {caption.text}
            </p>
          </div>
        ))}
      </section>
    </details>
  );
};

/** Saving and deleting stay beside the privacy note, out of the way of the result. */
const SummaryFooter = ({
  onDeleted,
  onRetry,
  saveError,
  saving,
  summaryId,
}: {
  onDeleted: () => void;
  onRetry?: () => Promise<void>;
  saveError: boolean;
  saving: boolean;
  summaryId: Id<"scamCallSummaries"> | null;
}) => {
  const messages = useCallScreeningMessages();
  const remove = useMutation(api.callscreening.remove);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const deleteLabel =
    summaryId === null && !saving ? messages.discard : messages.delete;

  return (
    <footer className="border-rule flex flex-col gap-3 border-t pt-5">
      {saving ? <output className="text-body">{messages.saving}</output> : null}
      {saveError ? (
        <div className="text-negative text-body space-y-3" role="alert">
          <p>{messages.saveError}</p>
          <Button onClick={onRetry} variant="outline">
            {messages.retrySave}
          </Button>
        </div>
      ) : null}
      {deleteError ? (
        <p className="text-negative text-body" role="alert">
          {messages.deleteError}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-muted-foreground text-body flex max-w-prose items-start gap-2">
          <LockKeyholeIcon
            aria-hidden="true"
            className="mt-1 size-4 shrink-0"
          />
          {summaryId === null ? messages.summaryStorage : messages.summarySaved}
        </p>
        <Button
          disabled={saving || deleting}
          onClick={async () => {
            if (summaryId === null) {
              onDeleted();

              return;
            }

            setDeleting(true);
            setDeleteError(false);

            try {
              await remove({ summaryId });
              onDeleted();
            } catch {
              setDeleteError(true);
              setDeleting(false);
            }
          }}
          variant="ghost"
        >
          <Trash2Icon aria-hidden="true" />
          {deleting ? messages.deleting : deleteLabel}
        </Button>
      </div>
    </footer>
  );
};

const CallSummary = ({
  summary,
  summaryId,
  saving = false,
  saveError = false,
  onRetry,
  onBack,
  backLabel,
}: {
  summary: CallSummaryValue;
  summaryId: Id<"scamCallSummaries"> | null;
  saving?: boolean;
  saveError?: boolean;
  onRetry?: () => Promise<void>;
  onBack: () => void;
  /** Without a label, leaving the summary starts another screening. */
  backLabel?: string;
}) => {
  const messages = useCallScreeningMessages();
  const locale = useLocale();
  const { me } = usePreferences();
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, []);

  const outcome = outcomeOf(summary);
  const screensAgain = backLabel === undefined;
  const captions = summary.captions ?? [];

  const trusted = (
    <section className="flex min-w-0 flex-col gap-3">
      <h3 className="text-section font-semibold">{messages.askTrusted}</h3>
      <TrustedPeople practiceCall={summary.practice} />
    </section>
  );

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2
            className="text-mobile-title sm:text-page-title font-semibold tracking-tight outline-none"
            ref={title}
            tabIndex={-1}
          >
            {summary.practice ? messages.practiceSummary : messages.summary}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={summary.practice ? "simulated" : "neutral"}>
              {summary.practice ? messages.practice : messages.liveCall}
            </Pill>
            <p className="text-muted-foreground text-lg">
              <span className="num">{callTime(summary.durationMs)}</span> ·{" "}
              {ago(
                summary.startedAt,
                me?.profile?.timeZone ?? "America/New_York",
                undefined,
                locale
              )}
            </p>
          </div>
        </div>
        {outcome === "silent" && screensAgain ? null : (
          <Button disabled={saving} onClick={onBack} variant="outline">
            {backLabel ?? messages.screenAnotherCall}
          </Button>
        )}
      </header>
      <p className="text-muted-foreground text-body">
        {messages.languageLimit}
      </p>
      <ResultPanel
        onScreenAgain={screensAgain ? onBack : undefined}
        outcome={outcome}
        saving={saving}
        summary={summary}
      />
      {outcome === "flagged" ? (
        <div className="grid min-w-0 items-start gap-8 @4xl/content:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {trusted}
          <FlagList flags={summary.flags} />
        </div>
      ) : null}
      {outcome === "clear" || outcome === "unchecked" ? (
        <div className="max-w-2xl">{trusted}</div>
      ) : null}
      {captions.length > 0 ? (
        <HeardCaptions captions={captions} practice={summary.practice} />
      ) : null}
      <SummaryFooter
        onDeleted={onBack}
        onRetry={onRetry}
        saveError={saveError}
        saving={saving}
        summaryId={summaryId}
      />
    </section>
  );
};

export { CallSummary, outcomeOf };

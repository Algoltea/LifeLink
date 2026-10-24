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
import { ago } from "@/lib/format";

import { callTime } from "./call-screening-parts";
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

const PRACTICE_HELP_MESSAGE =
  "I tried LifeLink’s practice scam call. Could we talk about what to do if a call like that happens?";

const CALL_HELP_MESSAGE =
  "I just had a phone call that I’m not sure about. Could you help me check whether it was real before I share anything or send money?";

const CALLBACK_ADVICE =
  "If anything felt off, hang up and call back on a number you trust.";

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

const OUTCOME_LABELS: Record<Outcome, string> = {
  clear: "No warning signs picked up",
  flagged: "Warning signs picked up",
  silent: "Nothing was heard",
  unchecked: "Not fully checked",
};

const UNCHECKED_TEXT =
  "Some of what was said couldn’t be checked for warning signs, so this summary may miss them.";

const PARTLY_CHECKED_TEXT =
  "Part of this call couldn’t be checked, so there may be more warning signs.";

const INTERRUPTED_TEXT =
  "The connection stopped during this check. Only the parts LifeLink heard were checked.";

const RETRY_STEPS = [
  "Put the phone call on speakerphone.",
  "Keep the phone close to this device.",
  "Start call screening again before you answer.",
] as const;

const silentCopy = (practice: boolean): { body: string; title: string } =>
  practice
    ? {
        body: "The practice call ended before any words played, so there was nothing to check.",
        title: "Practice stopped early",
      }
    : {
        body: "No speech reached LifeLink, so it couldn’t check this call for warning signs.",
        title: "LifeLink didn’t hear the call",
      };

const heardText = (heardWords: number | undefined): string => {
  if (heardWords === undefined) {
    return "Nothing LifeLink heard matched a request scammers commonly make.";
  }

  const words = heardWords === 1 ? "1 word" : `about ${heardWords} words`;

  return `LifeLink heard ${words}. None of them matched a request scammers commonly make.`;
};

const flaggedTitle = (count: number): string =>
  count === 1 ? "1 warning sign heard" : `${count} warning signs heard`;

const outcomeSpeech = (
  summary: CallSummaryValue,
  outcome: Outcome
): string[] => {
  if (outcome === "flagged") {
    return [
      `Potential scam. ${flaggedTitle(summary.flags.length)}.`,
      ...summary.flags.map((flag) => flag.reason),
      "Don’t share codes or send money. Hang up and call back on a number you already trust.",
    ];
  }

  if (outcome === "silent") {
    const { body, title } = silentCopy(summary.practice);

    return summary.practice
      ? [`${title}.`, body]
      : [`${title}.`, body, "To try again:", ...RETRY_STEPS];
  }

  if (outcome === "unchecked") {
    return [
      "LifeLink couldn’t fully check this call.",
      UNCHECKED_TEXT,
      CALLBACK_ADVICE,
    ];
  }

  return [
    "No warning signs heard.",
    heardText(summary.heardWords),
    `This can’t confirm who called. ${CALLBACK_ADVICE}`,
  ];
};

const spokenSummary = (summary: CallSummaryValue, outcome: Outcome): string =>
  [
    summary.practice ? "Practice call." : "",
    ...outcomeSpeech(summary, outcome),
    summary.interrupted ? INTERRUPTED_TEXT : "",
    outcome === "flagged" && summary.checkIncomplete === true
      ? PARTLY_CHECKED_TEXT
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
                {flaggedTitle(summary.flags.length)}
              </h3>
              <p className="max-w-prose text-lg">
                {summary.practice
                  ? "The practice caller asked for things scammers often ask for."
                  : "The caller asked for things scammers often ask for."}
              </p>
              <p className="max-w-prose text-lg font-semibold">
                Don’t share codes or send money. Hang up and call back on a
                number you already trust.
              </p>
            </>
          ) : null}
          {outcome === "clear" ? (
            <>
              <h3 className="text-section font-semibold">
                No warning signs heard
              </h3>
              <p className="max-w-prose text-lg">
                {heardText(summary.heardWords)}
              </p>
              <p className="text-muted-foreground max-w-prose text-lg">
                This can’t confirm who called. {CALLBACK_ADVICE}
              </p>
            </>
          ) : null}
          {outcome === "unchecked" ? (
            <>
              <h3 className="text-section font-semibold">
                LifeLink couldn’t fully check this call
              </h3>
              <p className="max-w-prose text-lg">{UNCHECKED_TEXT}</p>
              <p className="text-muted-foreground max-w-prose text-lg">
                {CALLBACK_ADVICE}
              </p>
            </>
          ) : null}
          {outcome === "flagged" && summary.checkIncomplete === true ? (
            <p className="text-warning max-w-prose text-lg">
              {PARTLY_CHECKED_TEXT}
            </p>
          ) : null}
          {outcome === "silent" ? (
            <>
              <h3 className="text-section font-semibold">
                {silentCopy(summary.practice).title}
              </h3>
              <p className="max-w-prose text-lg">
                {silentCopy(summary.practice).body}
              </p>
            </>
          ) : null}
          {summary.interrupted ? (
            <p className="text-warning max-w-prose text-lg">
              {INTERRUPTED_TEXT}
            </p>
          ) : null}
        </div>
      </div>
      {outcome === "silent" && !summary.practice ? (
        <div className="flex flex-col gap-2 sm:pl-[2.6rem]">
          <h4 className="text-xl font-semibold">To try again</h4>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
            {RETRY_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {outcome === "silent" && onScreenAgain ? (
          <Button disabled={saving} onClick={onScreenAgain} size="lg">
            Screen another call
          </Button>
        ) : null}
        <ReadAloudButton
          label="Read the result aloud"
          text={spokenSummary(summary, outcome)}
          variant="ghost"
        />
      </div>
    </section>
  );
};

const FlagList = ({ flags }: { flags: CallFlag[] }) => (
  <section className="bg-parchment flex min-w-0 flex-col gap-3 rounded-xl p-5 sm:p-6">
    <h3 className="text-section font-semibold">What LifeLink flagged</h3>
    <p className="text-muted-foreground text-body">
      Quotes may have mistakes. Long numbers are hidden.
    </p>
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
            <h4 className="text-xl font-semibold">{flag.reason}</h4>
            <blockquote className="pl-3 break-words">“{flag.quote}”</blockquote>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

const HeardCaptions = ({
  captions,
  practice,
}: {
  captions: CallCaption[];
  practice: boolean;
}) => (
  <details className="group border-rule border-t pt-4">
    <summary className="min-h-control flex list-none flex-wrap items-center gap-x-3 gap-y-1 [&::-webkit-details-marker]:hidden">
      <ChevronDownIcon
        aria-hidden="true"
        className="size-5 shrink-0 -rotate-90 transition-transform group-open:rotate-0"
      />
      <span className="font-semibold">What LifeLink heard</span>
      <span className="text-muted-foreground text-body">
        Shown until you leave this page. Not saved.
      </span>
    </summary>
    <p className="text-muted-foreground text-body mt-2">
      {practice
        ? "These are the practice call’s scripted words."
        : "Both voices are mixed together and may have mistakes."}
    </p>
    <section
      aria-label="What LifeLink heard"
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
                {caption.speaker === "caller" ? "Caller: " : "You: "}
              </span>
            )}
            {caption.text}
          </p>
        </div>
      ))}
    </section>
  </details>
);

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
  const remove = useMutation(api.callscreening.remove);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const deleteLabel =
    summaryId === null && !saving ? "Discard summary" : "Delete summary";

  return (
    <footer className="border-rule flex flex-col gap-3 border-t pt-5">
      {saving ? (
        <output className="text-body">Saving your summary…</output>
      ) : null}
      {saveError ? (
        <div className="text-negative text-body space-y-3" role="alert">
          <p>
            The summary could not be saved. Keep this page open and try again.
          </p>
          <Button onClick={onRetry} variant="outline">
            Try saving again
          </Button>
        </div>
      ) : null}
      {deleteError ? (
        <p className="text-negative text-body" role="alert">
          The summary could not be deleted. Try again.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-muted-foreground text-body flex max-w-prose items-start gap-2">
          <LockKeyholeIcon
            aria-hidden="true"
            className="mt-1 size-4 shrink-0"
          />
          {summaryId === null
            ? "Only a short summary is saved to Earlier checks. No audio or captions are kept."
            : "Saved in Earlier checks as a short summary. No audio or captions are kept."}
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
          {deleting ? "Deleting…" : deleteLabel}
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
      <h3 className="text-section font-semibold">Ask someone you trust</h3>
      <TrustedPeople
        message={summary.practice ? PRACTICE_HELP_MESSAGE : CALL_HELP_MESSAGE}
      />
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
            {summary.practice ? "Practice call summary" : "Call summary"}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={summary.practice ? "simulated" : "neutral"}>
              {summary.practice ? "Practice" : "Live call"}
            </Pill>
            <p className="text-muted-foreground text-lg">
              <span className="num">{callTime(summary.durationMs)}</span> ·{" "}
              {ago(
                summary.startedAt,
                me?.profile?.timeZone ?? "America/New_York"
              )}
            </p>
          </div>
        </div>
        {outcome === "silent" && screensAgain ? null : (
          <Button disabled={saving} onClick={onBack} variant="outline">
            {backLabel ?? "Screen another call"}
          </Button>
        )}
      </header>
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

export { CallSummary, OUTCOME_LABELS, outcomeOf };

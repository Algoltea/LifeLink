"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { useQuery } from "convex/react";
import {
  AudioLinesIcon,
  ChevronRightIcon,
  MicIcon,
  PhoneIcon,
  PlayIcon,
  SquareIcon,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

import { usePreferences } from "@/components/app/preferences";
import { usePresentationDemo } from "@/components/app/presentation-demo";
import { useLocale } from "@/i18n/locale";
import { ago } from "@/lib/format";

import {
  CallAlert,
  CallCaptions,
  CallPrivacy,
  CallWarningGuide,
  callTime,
  useCallScreeningMessages,
} from "./call-screening-parts";
import { CallSummary, outcomeOf } from "./call-summary";
import { TrustedPeople } from "./trusted-people";
import { useCallScreening } from "./use-call-screening";
import type { CallState } from "./use-call-screening";

const CallLanding = ({
  start,
}: {
  start: (practice: boolean) => Promise<void>;
}) => {
  const messages = useCallScreeningMessages();
  const presentationDemo = usePresentationDemo();
  const { me } = usePreferences();
  const integrations = useQuery(api.status.integrations);
  const [consent, setConsent] = useState(false);
  const consentId = useId();
  const practiceMode = me?.profile?.demoMode === true;

  const configured =
    integrations?.integrations.some(
      (item) => item.id === "gemini_live" && item.configured
    ) === true;

  return (
    <section
      className="flex min-w-0 flex-col gap-5"
      aria-labelledby="call-screening-title"
    >
      <div>
        <h2 className="text-section font-semibold" id="call-screening-title">
          {messages.listenTitle}
        </h2>
        <p className="text-muted-foreground text-label mt-2">
          {messages.intro}
        </p>
      </div>
      {presentationDemo ? null : (
        <>
          <ol className="text-body marker:text-accent-ink list-decimal space-y-3 pl-6 marker:font-semibold">
            <li>{messages.speakerStep}</li>
            <li>{messages.startStep}</li>
            <li>{messages.openStep}</li>
          </ol>
          <p className="text-muted-foreground text-label">
            {messages.otherDevice}
          </p>
        </>
      )}
      <p className="text-muted-foreground text-label">
        {messages.languageLimit}
      </p>
      <CallPrivacy practice={presentationDemo} />
      {!practiceMode && !presentationDemo && configured ? (
        <label
          className="text-label min-h-control flex cursor-pointer items-start gap-3"
          htmlFor={consentId}
        >
          <input
            checked={consent}
            className="accent-primary mt-1 size-5 shrink-0"
            id={consentId}
            onChange={(event) => setConsent(event.target.checked)}
            type="checkbox"
          />
          <span>{messages.consent}</span>
        </label>
      ) : null}
      <Button
        className="min-h-control w-full whitespace-normal"
        disabled={
          !consent ||
          practiceMode ||
          presentationDemo ||
          !configured ||
          !me?.profile
        }
        onClick={() => start(false)}
      >
        <MicIcon aria-hidden="true" />
        {messages.start}
      </Button>
      {practiceMode || presentationDemo ? (
        <p className="text-muted-foreground text-label">
          {messages.practiceMode}
        </p>
      ) : null}
      {!practiceMode &&
      !presentationDemo &&
      integrations !== undefined &&
      !configured ? (
        <p className="text-muted-foreground text-label">
          {messages.notConfigured}
        </p>
      ) : null}
      <Button
        className="min-h-control self-center underline underline-offset-4"
        onClick={() => start(true)}
        variant="ghost"
      >
        <PlayIcon aria-hidden="true" />
        {messages.tryPractice}
      </Button>
      <p className="text-muted-foreground text-label">
        {messages.practiceSaved}
      </p>
    </section>
  );
};

const listeningTitle = (
  messages: ReturnType<typeof useCallScreeningMessages>,
  status: string,
  practice: boolean
): string => {
  if (status === "connecting") {
    return messages.gettingReady;
  }

  if (practice && status === "listening") {
    return messages.practicePlaying;
  }

  return status === "listening" ? messages.listening : messages.stopped;
};

const callStopLabel = (
  messages: ReturnType<typeof useCallScreeningMessages>,
  failed: boolean,
  practice: boolean
): string => {
  if (failed) {
    return messages.finishSave;
  }

  return practice ? messages.stopPractice : messages.stopListening;
};

const callErrorText = (
  messages: ReturnType<typeof useCallScreeningMessages>,
  permissionDenied: boolean,
  empty: boolean
): string => {
  if (permissionDenied) {
    return messages.permissionDenied;
  }

  if (empty) {
    return messages.startError;
  }

  return messages.connectionError;
};

const CallEnded = ({
  onBack,
  onRetry,
  state,
}: {
  onBack: () => void;
  onRetry: () => Promise<void>;
  state: CallState;
}) => {
  const messages = useCallScreeningMessages();

  return (
    <div className="space-y-5">
      {state.checking ? (
        <output className="text-body">{messages.checkingLastPart}</output>
      ) : null}
      {state.notice ? (
        <output className="text-body">{messages.timeLimit}</output>
      ) : null}
      <CallSummary
        onBack={onBack}
        onRetry={onRetry}
        saveError={state.saveError}
        saving={state.saving || state.checking}
        summary={state}
        summaryId={state.summaryId}
      />
    </div>
  );
};

const CallScreening = ({
  onActiveChange,
}: {
  onActiveChange: (active: boolean) => void;
}) => {
  const messages = useCallScreeningMessages();
  const presentationDemo = usePresentationDemo();

  const { state, start, finish, reset, toggleMute, retrySave } =
    useCallScreening();

  const active = state.status !== "idle";

  useEffect(() => {
    onActiveChange(active);
  }, [active, onActiveChange]);

  if (state.status === "idle") {
    return <CallLanding start={start} />;
  }

  if (state.status === "ended") {
    return <CallEnded onBack={reset} onRetry={retrySave} state={state} />;
  }

  const lastFlag = state.flags.at(-1);
  const listening = state.status === "listening";

  const failed =
    state.status === "error" || state.status === "permission-denied";

  const stopLabel = callStopLabel(messages, failed, state.practice);

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <div className="border-rule bg-background sticky top-0 z-10 flex items-center gap-3 border-b py-4 sm:gap-5">
        <AudioLinesIcon
          aria-hidden="true"
          className="text-positive hidden size-10 shrink-0 sm:block"
        />
        <div className="min-w-0 flex-1">
          <h2 className="sm:text-section text-xl font-semibold">
            {listeningTitle(messages, state.status, state.practice)}
          </h2>
          <p className="text-muted-foreground text-body">
            {state.practice && !presentationDemo
              ? `${messages.practice} · `
              : ""}
            {callTime(state.durationMs)}
            {listening && !lastFlag ? messages.noWarningsYet : ""}
          </p>
        </div>
        <Button
          className="min-h-control shrink-0"
          onClick={() => (state.status === "connecting" ? reset() : finish())}
          size="lg"
          variant="secondary"
        >
          <SquareIcon aria-hidden="true" className="fill-current" />
          <span className="sm:hidden">
            {failed ? messages.finish : messages.stop}
          </span>
          <span className="hidden sm:inline">{stopLabel}</span>
        </Button>
      </div>
      {failed ? (
        <div className="text-body flex flex-col gap-4" role="alert">
          <p>
            {callErrorText(
              messages,
              state.status === "permission-denied",
              state.captions.length === 0 && state.durationMs === 0
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => start(state.practice, state.status === "error")}
            >
              {messages.startAgain}
            </Button>
            <Button onClick={() => start(true)} variant="outline">
              {messages.tryPractice}
            </Button>
            <Button onClick={reset} variant="ghost">
              {messages.checkMessage}
            </Button>
          </div>
        </div>
      ) : null}
      {state.practice && !presentationDemo ? (
        <p className="text-body">
          <Pill tone="neutral">{messages.practice}</Pill>{" "}
          {messages.practiceExplanation}
        </p>
      ) : null}
      {lastFlag ? (
        <CallAlert
          key={lastFlag.id}
          flag={lastFlag}
          onMute={toggleMute}
          state={state}
        />
      ) : null}
      {state.inputPaused ? (
        <output className="text-muted-foreground text-body">
          {messages.paused}
        </output>
      ) : null}
      {state.checksUnavailable ? (
        <output className="text-body">{messages.checksUnavailable}</output>
      ) : null}
      {state.alertStatus === "unavailable" && !lastFlag ? (
        <output className="text-body">{messages.soundUnavailable}</output>
      ) : null}
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        {lastFlag ? (
          <aside className="order-first flex flex-col gap-4 xl:order-last">
            <h2 className="text-section font-semibold">
              {messages.askTrusted}
            </h2>
            <p className="text-muted-foreground text-body">
              {messages.hangUpFirst}
            </p>
            <TrustedPeople practiceCall={state.practice} />
          </aside>
        ) : null}
        <CallCaptions
          captions={state.captions}
          flags={state.flags}
          practice={state.practice}
        />
        {lastFlag ? null : <CallWarningGuide />}
      </div>
      <CallPrivacy practice={state.practice} />
    </section>
  );
};

/** Call summaries remain separate from message records for older clients. */
const CallHistory = () => {
  const locale = useLocale();
  const summaries = useQuery(api.callscreening.list);
  const messages = useCallScreeningMessages();
  const { me } = usePreferences();

  const [selected, setSelected] = useState<Id<"scamCallSummaries"> | null>(
    null
  );

  const current = summaries?.find((summary) => summary._id === selected);

  if (summaries === undefined || summaries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {current ? (
        <CallSummary
          backLabel={messages.close}
          onBack={() => setSelected(null)}
          summary={{ ...current, practice: current.mode === "simulated" }}
          summaryId={current._id}
        />
      ) : null}
      <ul aria-label={messages.earlierAria}>
        {summaries.map((summary) => (
          <li className="border-rule border-t" key={summary._id}>
            <button
              className="hover:bg-surface min-h-control flex w-full items-center gap-4 rounded-md px-2 py-4 text-left"
              onClick={() => setSelected(summary._id)}
              type="button"
            >
              <PhoneIcon
                aria-hidden="true"
                className="text-muted-foreground size-6 shrink-0"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body font-semibold">
                  {summary.mode === "simulated"
                    ? messages.practiceCall
                    : messages.phoneCall}{" "}
                  · {callTime(summary.durationMs)}
                </span>
                <span className="text-muted-foreground text-body">
                  {
                    messages.outcomeLabels[
                      outcomeOf({
                        ...summary,
                        practice: summary.mode === "simulated",
                      })
                    ]
                  }{" "}
                  ·{" "}
                  {ago(
                    summary.createdAt,
                    me?.profile?.timeZone ?? "America/New_York",
                    undefined,
                    locale
                  )}
                </span>
              </span>
              <span className="text-body hidden font-medium sm:inline">
                {messages.review}
              </span>
              <ChevronRightIcon
                aria-hidden="true"
                className="size-5 shrink-0"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { CallHistory, CallScreening };

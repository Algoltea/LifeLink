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
import { ago } from "@/lib/format";

import {
  CallAlert,
  CallCaptions,
  CallPrivacy,
  CallWarningGuide,
  callTime,
} from "./call-screening-parts";
import { CallSummary, OUTCOME_LABELS, outcomeOf } from "./call-summary";
import { TrustedPeople } from "./trusted-people";
import { useCallScreening } from "./use-call-screening";
import type { CallState } from "./use-call-screening";

const CallLanding = ({
  start,
}: {
  start: (practice: boolean) => Promise<void>;
}) => {
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
          Listen to a call
        </h2>
        <p className="text-muted-foreground text-label mt-2">
          LifeLink shows the call’s words on screen, has AI check them for scam
          warning signs, and warns you out loud if it finds one.
        </p>
      </div>
      <ol className="text-body marker:text-accent-ink list-decimal space-y-3 pl-6 marker:font-semibold">
        <li>Put the call on speaker near this device.</li>
        <li>Press Start listening and allow the microphone.</li>
        <li>Keep this screen open while you talk.</li>
      </ol>
      <p className="text-muted-foreground text-label">
        If your phone cannot use the microphone during a call, open LifeLink on
        another device.
      </p>
      <CallPrivacy />
      {!practiceMode && configured ? (
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
          <span>
            I understand the call’s sound and words will be sent to cloud AI
            services while this check is on.
          </span>
        </label>
      ) : null}
      <Button
        className="min-h-control w-full whitespace-normal"
        disabled={!consent || practiceMode || !configured || !me?.profile}
        onClick={() => start(false)}
      >
        <MicIcon aria-hidden="true" />
        Start listening
      </Button>
      {practiceMode ? (
        <p className="text-muted-foreground text-label">
          Practice mode is on. Try the made-up call below without a microphone.
        </p>
      ) : null}
      {!practiceMode && integrations !== undefined && !configured ? (
        <p className="text-muted-foreground text-label">
          Live call checks are not set up yet. You can try a practice call or
          type the caller’s words.
        </p>
      ) : null}
      <Button
        className="min-h-control self-center underline underline-offset-4"
        onClick={() => start(true)}
        variant="ghost"
      >
        <PlayIcon aria-hidden="true" />
        Try a practice call
      </Button>
      <p className="text-muted-foreground text-label">
        The practice call uses no microphone or cloud AI. Its short summary is
        saved in Earlier checks.
      </p>
    </section>
  );
};

const listeningTitle = (status: string, practice: boolean): string => {
  if (status === "connecting") {
    return "Getting ready…";
  }

  if (practice && status === "listening") {
    return "Practice call playing";
  }

  return status === "listening"
    ? "LifeLink is listening"
    : "Listening has stopped";
};

const callStopLabel = (failed: boolean, practice: boolean): string => {
  if (failed) {
    return "Finish and save summary";
  }

  return practice ? "Stop practice call" : "Stop listening";
};

const callErrorText = (permissionDenied: boolean, empty: boolean): string => {
  if (permissionDenied) {
    return "Microphone access was not allowed. Allow the microphone in your browser’s site settings, then try again. You can also try a practice call.";
  }

  if (empty) {
    return "LifeLink could not start listening. Try again, or try a practice call.";
  }

  return "The listening connection stopped. Your captions are still here. Press Start again to keep listening, or Finish to save a summary.";
};

const CallEnded = ({
  onBack,
  onRetry,
  state,
}: {
  onBack: () => void;
  onRetry: () => Promise<void>;
  state: CallState;
}) => (
  <div className="space-y-5">
    {state.checking ? (
      <output className="text-body">
        Checking the last part of the call for warning signs…
      </output>
    ) : null}
    {state.notice ? (
      <output className="text-body">{state.notice}</output>
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

const CallScreening = ({
  onActiveChange,
}: {
  onActiveChange: (active: boolean) => void;
}) => {
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

  const stopLabel = callStopLabel(failed, state.practice);

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <div className="border-rule bg-background sticky top-0 z-10 flex items-center gap-3 border-b py-4 sm:gap-5">
        <AudioLinesIcon
          aria-hidden="true"
          className="text-positive hidden size-10 shrink-0 sm:block"
        />
        <div className="min-w-0 flex-1">
          <h2 className="sm:text-section text-xl font-semibold">
            {listeningTitle(state.status, state.practice)}
          </h2>
          <p className="text-muted-foreground text-body">
            {state.practice ? "Practice · " : ""}
            {callTime(state.durationMs)}
            {listening && !lastFlag
              ? " · No warning signs picked up so far"
              : ""}
          </p>
        </div>
        <Button
          className="min-h-control shrink-0"
          onClick={() => (state.status === "connecting" ? reset() : finish())}
          size="lg"
          variant="secondary"
        >
          <SquareIcon aria-hidden="true" className="fill-current" />
          <span className="sm:hidden">{failed ? "Finish" : "Stop"}</span>
          <span className="hidden sm:inline">{stopLabel}</span>
        </Button>
      </div>
      {failed ? (
        <div className="text-body flex flex-col gap-4" role="alert">
          <p>
            {callErrorText(
              state.status === "permission-denied",
              state.captions.length === 0 && state.durationMs === 0
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => start(state.practice, state.status === "error")}
            >
              Start again
            </Button>
            <Button onClick={() => start(true)} variant="outline">
              Try a practice call
            </Button>
            <Button onClick={reset} variant="ghost">
              Check a message
            </Button>
          </div>
        </div>
      ) : null}
      {state.practice ? (
        <p className="text-body">
          <Pill tone="neutral">Practice</Pill> This is a made-up call. No
          microphone or cloud AI is used.
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
          Listening pauses while the alert plays so it won’t hear its own
          warning.
        </output>
      ) : null}
      {state.checksUnavailable ? (
        <output className="text-body">
          Warning-sign checks aren’t available right now. The call’s words still
          appear below.
        </output>
      ) : null}
      {state.alertStatus === "unavailable" && !lastFlag ? (
        <output className="text-body">
          Sound is unavailable. Warning signs will still appear on screen.
        </output>
      ) : null}
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        {lastFlag ? (
          <aside className="order-first flex flex-col gap-4 xl:order-last">
            <h2 className="text-section font-semibold">
              Ask someone you trust
            </h2>
            <p className="text-muted-foreground text-body">
              It’s fine to say “I’ll call you back” and hang up first.
            </p>
            <TrustedPeople
              message={
                state.practice
                  ? "I tried LifeLink’s practice scam call. Could we talk about what to do if a call like that happens?"
                  : undefined
              }
            />
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
  const summaries = useQuery(api.callscreening.list);
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
          backLabel="Close"
          onBack={() => setSelected(null)}
          summary={{ ...current, practice: current.mode === "simulated" }}
          summaryId={current._id}
        />
      ) : null}
      <ul aria-label="Earlier call checks">
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
                    ? "Practice call"
                    : "Phone call"}{" "}
                  · {callTime(summary.durationMs)}
                </span>
                <span className="text-muted-foreground text-body">
                  {
                    OUTCOME_LABELS[
                      outcomeOf({
                        ...summary,
                        practice: summary.mode === "simulated",
                      })
                    ]
                  }{" "}
                  ·{" "}
                  {ago(
                    summary.createdAt,
                    me?.profile?.timeZone ?? "America/New_York"
                  )}
                </span>
              </span>
              <span className="text-body hidden font-medium sm:inline">
                Review
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

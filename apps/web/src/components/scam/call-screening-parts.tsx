"use client";

import {
  CALL_WARNING_REASONS,
  callWarningKinds,
} from "@lifelink/contracts/call-screening";
import type { CallCaption, CallFlag } from "@lifelink/contracts/call-screening";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import {
  AlertTriangleIcon,
  LockKeyholeIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { usePresentationDemo } from "@/components/app/presentation-demo";
import { messagesFor, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";

import type { CallState } from "./use-call-screening";

/** Presentation wording only; the call's practice state still controls execution. */
const useCallScreeningMessages = (): Messages["callScreening"] => {
  const messages = useMessages().callScreening;
  const presentationDemo = usePresentationDemo();

  if (!presentationDemo) {
    return messages;
  }

  return {
    ...messages,
    intro: "Review a call’s words and the warning signs to look for.",
    languageLimit:
      "Local text checks rely on English patterns; translating the interface does not expand their detection coverage. The call’s words and spoken alert are in English. Captions and quoted words stay in their original language.",
    notConfigured: "Live call checks are unavailable for this account.",
    permissionDenied:
      "Microphone access was not allowed. You can review the call below without a microphone.",
    practiceCall: messages.phoneCall,
    practiceCaptionSource: messages.captionsNotSaved,
    practiceFlaggedBody: "These words include requests scammers often make.",
    practiceHeard: messages.captions,
    practiceMode: "Live call checks are unavailable for this account.",
    practicePlaying: "Call screening in progress",
    practiceSaved: messages.practicePrivacy,
    practiceSilentBody:
      "This check ended before any words appeared, so there was nothing to check.",
    practiceSilentTitle: "Check stopped early",
    practiceSummary: messages.summary,
    practiceVoices: messages.captionsNotSaved,
    startError: "This call check could not start. Try again.",
    stopPractice: messages.stop,
    tryPractice: "Review a call",
  };
};

const callFlagReason = (
  reason: string,
  messages: Messages["callScreening"]
): string => {
  const en = messagesFor("en").callScreening;

  const reasons = new Map([
    [en.moneyReason, messages.moneyReason],
    [en.credentialsReason, messages.credentialsReason],
    [en.remoteReason, messages.remoteReason],
    [en.secrecyReason, messages.secrecyReason],
    ...callWarningKinds.map(
      (kind) =>
        [CALL_WARNING_REASONS[kind], messages.warningReasons[kind]] as const
    ),
  ]);

  return reasons.get(reason) ?? reason;
};

const callTime = (milliseconds: number): string => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const CallPrivacy = ({ practice = false }: { practice?: boolean }) => {
  const messages = useCallScreeningMessages();

  return (
    <p className="text-muted-foreground text-label flex items-start gap-2">
      <LockKeyholeIcon aria-hidden="true" className="mt-1 size-4 shrink-0" />
      {practice ? messages.practicePrivacy : messages.privacy}
    </p>
  );
};

const CallAlert = ({
  flag,
  state,
  onMute,
}: {
  flag: CallFlag;
  state: CallState;
  onMute: () => void;
}) => {
  const messages = useCallScreeningMessages();
  const headline = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headline.current?.focus();
  }, []);

  let soundLabel = messages.alertReady;

  if (state.muted) {
    soundLabel = messages.alertOff;
  } else if (state.alertStatus === "playing") {
    soundLabel = messages.alertPlaying;
  } else if (state.alertStatus === "played") {
    soundLabel = messages.alertPlayed;
  } else if (state.alertStatus === "unavailable") {
    soundLabel = messages.alertUnavailable;
  }

  return (
    <section className="border-negative/35 bg-negative-wash flex flex-col gap-5 rounded-2xl border-2 p-5 sm:gap-6 sm:p-8">
      <div className="flex flex-wrap items-start gap-4 sm:gap-6">
        <div className="bg-negative text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-full sm:size-20">
          <AlertTriangleIcon aria-hidden="true" className="size-8 sm:size-11" />
        </div>
        <div
          className="order-3 w-full min-w-0 sm:order-none sm:w-auto sm:flex-1"
          role="alert"
        >
          <h2
            className="text-negative text-[1.778rem] leading-tight font-bold tracking-tight outline-none sm:text-[2.223rem]"
            ref={headline}
            tabIndex={-1}
          >
            {messages.scamWarning}
          </h2>
          <p className="mt-2 text-xl leading-relaxed font-medium sm:text-2xl">
            {messages.protect}
          </p>
        </div>
        <div className="ml-auto flex max-w-full flex-col items-end gap-2">
          <span className="text-negative text-body flex items-center gap-2 font-semibold">
            <Volume2Icon aria-hidden="true" className="size-5 shrink-0" />
            {soundLabel}
          </span>
          <Button aria-pressed={state.muted} onClick={onMute} variant="outline">
            {state.muted ? (
              <Volume2Icon aria-hidden="true" />
            ) : (
              <VolumeXIcon aria-hidden="true" />
            )}
            {state.muted ? messages.unmute : messages.mute}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:pl-[5.778rem]">
        <p className="text-muted-foreground text-body font-medium">
          {state.practice ? messages.practiceHeard : messages.heard} ·{" "}
          {callTime(flag.timeMs)}{" "}
          {state.practice ? messages.practiceTime : messages.callTime}
        </p>
        <h3 className="text-xl font-semibold">
          {callFlagReason(flag.reason, messages)}
        </h3>
        <blockquote className="text-body pl-5 leading-relaxed break-words">
          “{flag.quote}”
        </blockquote>
      </div>
    </section>
  );
};

const CallCaptions = ({
  captions,
  flags,
  practice,
}: {
  captions: CallCaption[];
  flags: CallFlag[];
  practice: boolean;
}) => {
  const messages = useCallScreeningMessages();
  const [bigger, setBigger] = useState(true);
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-section font-semibold" id={titleId}>
          {practice ? messages.practiceCaptions : messages.callCaptions}
        </h2>
        <div aria-label={messages.captionSize} className="flex flex-wrap gap-1">
          <Button
            aria-pressed={!bigger}
            onClick={() => setBigger(false)}
            variant={bigger ? "ghost" : "outline"}
          >
            {messages.smaller}
          </Button>
          <Button
            aria-pressed={bigger}
            onClick={() => setBigger(true)}
            variant={bigger ? "outline" : "ghost"}
          >
            {messages.bigger}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-body">
        {practice ? messages.practiceVoices : messages.mixedVoices}
      </p>
      <p className="text-muted-foreground text-body">
        {messages.languageLimit}
      </p>
      <div
        aria-label={messages.captions}
        aria-live="polite"
        aria-relevant="additions text"
        // One shared speaker column: never narrower than its longest word, so
        // "Anrufende Person" wraps instead of running into the caption.
        className="grid max-h-[32rem] grid-cols-[fit-content(8rem)_minmax(0,1fr)] content-start gap-y-3 overflow-y-auto overscroll-contain"
        role="log"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll the caption log.
        tabIndex={0}
      >
        {captions.length === 0 ? (
          <p className="text-muted-foreground col-span-full py-5 text-xl">
            {messages.captionsEmpty}
          </p>
        ) : null}
        {captions.map((caption) => {
          const flag = flags.find((item) => item.captionId === caption.id);

          const label =
            caption.speaker === "caller" ? messages.caller : messages.you;

          return (
            <div
              className={cn(
                "col-span-full grid grid-cols-subgrid gap-x-4 rounded-lg px-2 py-3 sm:px-4",
                flag && "bg-negative-wash"
              )}
              key={caption.id}
            >
              {caption.speaker === "unknown" ? null : (
                <span className="text-muted-foreground text-body min-w-16 pt-1 font-semibold sm:min-w-20">
                  {label}
                </span>
              )}
              <div
                className={cn(
                  "min-w-0",
                  caption.speaker === "unknown" && "col-span-full"
                )}
              >
                <p
                  className={cn(
                    "leading-relaxed break-words",
                    bigger ? "text-2xl" : "text-body",
                    flag && "font-semibold"
                  )}
                >
                  {caption.text}
                  {caption.final ? "" : "…"}
                </p>
                <p
                  className={cn(
                    "text-body mt-1",
                    flag
                      ? "text-negative font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {callTime(caption.timeMs)}
                  {flag
                    ? ` · ${messages.warningSign} · ${callFlagReason(flag.reason, messages)}`
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const CallWarningGuide = () => {
  const messages = useCallScreeningMessages();

  return (
    <aside className="text-body flex flex-col gap-4 leading-relaxed">
      <h2 className="text-xl font-semibold">{messages.guideTitle}</h2>
      <ul className="marker:text-accent-ink list-disc space-y-3 pl-5">
        <li>{messages.codes}</li>
        <li>{messages.money}</li>
        <li>{messages.remote}</li>
        <li>{messages.urgency}</li>
      </ul>
      <p className="border-rule border-t pt-4">{messages.guideCaution}</p>
    </aside>
  );
};

export {
  CallAlert,
  CallCaptions,
  CallPrivacy,
  CallWarningGuide,
  callTime,
  callFlagReason,
  useCallScreeningMessages,
};

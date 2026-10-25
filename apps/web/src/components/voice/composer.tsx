"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowUpIcon,
  LoaderCircleIcon,
  MicIcon,
  SquareIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { useOffline } from "@/components/app/offline-queue";
import { usePreferences } from "@/components/app/preferences";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { useBrowserCapability } from "@/lib/browser-capability";
import { messageOf } from "@/lib/errors";

import { dictationAvailable, startDictation } from "./dictation";
import {
  MicrophoneError,
  prepareAudio,
  startLiveSession,
} from "./live-session";
import type { AudioRig, LiveHandle } from "./live-session";

interface Caption {
  id: number;
  text: string;
  who: "assistant" | "you";
}

type VoiceState = "connecting" | "dictating" | "idle" | "live";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const voiceHintFor = (
  voice: VoiceState,
  available: boolean,
  t: Messages["voice"]
): string => {
  if (!available) {
    return t.unavailable;
  }

  if (voice === "dictating") {
    return t.listening;
  }

  if (voice === "live" || voice === "connecting") {
    return t.talking;
  }

  return t.speakHint;
};

/**
 * Speak or type. Typed and spoken requests both go to the same backend
 * mutation and come back as proposals to review; nothing is sent from here.
 */
interface ComposerProps {
  className?: string;
  draft?: string;
  onDraftChange?: (text: string) => void;
  onSubmitted?: () => void;
  threadId?: string;
}

const ComposerSession = ({
  className,
  draft,
  onDraftChange,
  onSubmitted,
  threadId,
}: ComposerProps & { threadId: string }) => {
  const locale = useLocale();
  const t = useMessages().voice;
  const submit = useMutation(api.assistant.submitRequest);
  const createLive = useAction(api.voice.createLiveSession);
  const status = useQuery(api.status.integrations);
  const { online, queueRequest } = useOffline();
  const { preferences } = usePreferences();
  const [localText, setLocalText] = useState("");
  const text = draft ?? localText;
  const setText = onDraftChange ?? setLocalText;
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const canDictate = useBrowserCapability(dictationAvailable);
  const live = useRef<LiveHandle | null>(null);
  // The microphone while a live session is still connecting; Stop and unmount release it.
  const pendingRig = useRef<AudioRig | null>(null);
  // Ends a microphone request still waiting on the browser's permission prompt.
  const voiceAbort = useRef<AbortController | null>(null);
  const dictation = useRef<{ stop: () => void } | null>(null);
  const captionId = useRef(0);
  const inputId = useId();
  const hintId = useId();
  const pending = useRef(false);
  const voiceRun = useRef(0);
  const mounted = useRef(true);

  const liveConfigured =
    status?.integrations.some(
      (item) => item.id === "gemini_live" && item.configured
    ) ?? false;

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      voiceRun.current += 1;
      voiceAbort.current?.abort();
      pendingRig.current?.release();
      live.current?.stop();
      dictation.current?.stop();
    };
  }, []);

  const send = async (
    request: string,
    channel: "text" | "voice"
  ): Promise<boolean> => {
    const trimmed = request.trim();

    if (trimmed.length === 0 || pending.current || !mounted.current) {
      return false;
    }

    setSubmissionError(null);

    if (!online) {
      if (!queueRequest(trimmed, threadId)) {
        setSubmissionError(t.offlineFailed);

        return false;
      }

      toast(t.savedOffline);
      onSubmitted?.();

      return true;
    }

    pending.current = true;
    setSubmitting(true);

    try {
      await submit({ channel, text: trimmed, threadId });
      onSubmitted?.();
      pending.current = false;
      setSubmitting(false);

      return true;
    } catch (error) {
      setSubmissionError(errorText(error));
      pending.current = false;
      setSubmitting(false);

      return false;
    }
  };

  const addCaption = (who: Caption["who"], piece: string): void => {
    setCaptions((existing) => {
      const last = existing.at(-1);

      if (last?.who === who) {
        return [
          ...existing.slice(0, -1),
          { ...last, text: `${last.text}${piece}` },
        ];
      }

      captionId.current += 1;

      return [
        ...existing.slice(-7),
        { id: captionId.current, text: piece.trimStart(), who },
      ];
    });
  };

  const stopVoice = (): void => {
    voiceRun.current += 1;
    voiceAbort.current?.abort();
    voiceAbort.current = null;
    pendingRig.current?.release();
    pendingRig.current = null;
    live.current?.stop();
    live.current = null;
    dictation.current?.stop();
    dictation.current = null;
    setVoice("idle");
    setSpeaking(false);
  };

  const startVoice = async (): Promise<void> => {
    setVoiceError(null);

    if (liveConfigured && online) {
      voiceRun.current += 1;
      const run = voiceRun.current;
      setVoice("connecting");
      setCaptions([]);

      // Stop, a newer attempt, or leaving the page ends this one.
      const cancelled = (): boolean =>
        !mounted.current || voiceRun.current !== run;

      let rig: AudioRig | null = null;

      try {
        // The microphone comes first, while the press still counts as a gesture.
        const controller = new AbortController();

        voiceAbort.current = controller;
        rig = await prepareAudio(controller.signal);

        if (cancelled()) {
          rig.release();

          return;
        }

        pendingRig.current = rig;
        const session = await createLive({});

        if (cancelled()) {
          rig.release();

          return;
        }

        const handle = await startLiveSession(
          rig,
          session.token,
          session.model,
          {
            // Callbacks from an attempt that already ended must not touch the current one.
            onCaption: (who, piece) => {
              if (!cancelled()) {
                addCaption(who, piece);
              }
            },
            onClosed: (reason) => {
              if (cancelled()) {
                return;
              }

              if (reason) {
                toast(reason);
              }

              stopVoice();
            },
            onRequest: async (request) =>
              (await send(request, "voice")) ? t.prepared : t.prepareFailed,
            onSpeaking: (now) => {
              if (!cancelled()) {
                setSpeaking(now);
              }
            },
          }
        );

        // The session owns the microphone from here.
        if (pendingRig.current === rig) {
          pendingRig.current = null;
        }

        if (cancelled()) {
          handle.stop();

          return;
        }

        live.current = handle;
        setVoice("live");
      } catch (error) {
        // Releasing twice is harmless; this covers a failed token call.
        rig?.release();

        if (pendingRig.current === rig) {
          pendingRig.current = null;
        }

        // A late failure from an attempt already ended must not touch a newer one.
        if (cancelled()) {
          return;
        }

        stopVoice();
        setVoiceError(
          error instanceof MicrophoneError
            ? error.message
            : t.startFailed(errorText(error))
        );
      }

      return;
    }

    if (canDictate) {
      dictation.current = startDictation(
        (heard) => setText(heard),
        (problem) => {
          dictation.current = null;
          setVoice("idle");

          if (problem) {
            setVoiceError(problem);
          }
        },
        locale
      );
      setVoice(dictation.current === null ? "idle" : "dictating");
    }
  };

  const voiceAvailable = (liveConfigured && online) || canDictate;
  const listening = voice !== "idle";

  const voiceHint = voiceHintFor(voice, voiceAvailable, t);

  return (
    <div className={cn("@container/composer flex flex-col gap-4", className)}>
      <form
        className="border-border bg-raised has-[textarea:focus-visible]:border-control flex flex-col gap-2 rounded-3xl border p-3 pl-5 shadow-[0_1px_2px_rgb(45_33_24/0.04),0_8px_24px_rgb(45_33_24/0.06)] transition-[border-color]"
        onSubmit={async (event) => {
          event.preventDefault();

          if (await send(text, "text")) {
            setText("");
          }
        }}
      >
        <label className="sr-only" htmlFor={inputId}>
          {t.inputLabel}
        </label>
        <textarea
          aria-describedby={hintId}
          className="placeholder:text-muted-foreground field-sizing-content max-h-48 min-h-12 w-full resize-none overflow-y-auto bg-transparent pt-1 text-lg leading-relaxed outline-none"
          disabled={submitting}
          id={inputId}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={t.placeholder}
          rows={1}
          value={text}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            aria-pressed={listening}
            className={cn(
              "border-border text-label hover:bg-parchment min-h-control -ml-2 inline-flex items-center gap-2 rounded-full border px-4 font-medium transition-[background-color,border-color,color] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
              listening &&
                "bg-foreground text-background hover:bg-foreground/85 border-transparent"
            )}
            disabled={!voiceAvailable}
            onClick={() => {
              if (listening) {
                stopVoice();
              } else {
                void startVoice();
              }
            }}
            type="button"
          >
            {listening ? (
              <SquareIcon
                aria-hidden="true"
                className="size-4"
                fill="currentColor"
              />
            ) : (
              <MicIcon aria-hidden="true" className="size-5" />
            )}
            {listening ? t.stop : t.speak}
          </button>
          <Button
            aria-busy={submitting}
            aria-label={submitting ? t.sending : t.send}
            className="ml-auto rounded-full disabled:border-transparent"
            disabled={submitting || text.trim().length === 0}
            size="icon"
            type="submit"
          >
            {submitting ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="motion-safe:animate-spin"
              />
            ) : (
              <ArrowUpIcon aria-hidden="true" />
            )}
          </Button>
        </div>
      </form>
      <p
        className="text-muted-foreground text-label -mt-2 text-center"
        id={hintId}
      >
        {voiceHint}
      </p>
      {submissionError ? (
        <ErrorNote>
          {submissionError} {t.retry}
        </ErrorNote>
      ) : null}
      {voiceError ? <ErrorNote>{voiceError}</ErrorNote> : null}
      {listening && preferences.captions && captions.length > 0 ? (
        <section
          aria-label={t.captions}
          aria-live="polite"
          className="bg-surface flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl px-5 py-4"
        >
          {captions.map((caption) => (
            <p
              className={cn(
                "text-xl leading-snug",
                caption.who === "you"
                  ? "text-muted-foreground"
                  : "font-semibold"
              )}
              key={caption.id}
            >
              <span className="sr-only">
                {caption.who === "you" ? t.youSaid : t.lifeLinkSaid}
              </span>
              {caption.text}
            </p>
          ))}
          {speaking ? (
            <p className="text-muted-foreground text-base">{t.speaking}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

/** Prepare a stable, owned thread before typing or starting a voice session. */
const Composer = (props: ComposerProps) => {
  const t = useMessages().voice;

  const selectedThread = useQuery(
    api.assistant.myThread,
    props.threadId ? "skip" : {}
  );

  const ensureConversation = useMutation(api.assistant.ensureConversation);
  const { me } = usePreferences();
  const [openingError, setOpeningError] = useState<string | null>(null);
  const threadId = props.threadId ?? selectedThread;
  const profileId = me?.profile?._id;

  useEffect(() => {
    if (threadId !== null || !profileId) {
      return;
    }

    const prepare = async (): Promise<void> => {
      try {
        await ensureConversation({});
      } catch (error) {
        setOpeningError(errorText(error));
      }
    };

    void prepare();
  }, [threadId, ensureConversation, profileId]);

  if (openingError && !threadId) {
    return (
      <ErrorNote
        onRetry={async () => {
          setOpeningError(null);

          try {
            await ensureConversation({});
          } catch (error) {
            setOpeningError(errorText(error));
          }
        }}
      >
        {openingError}
      </ErrorNote>
    );
  }

  if (!threadId || !profileId) {
    return <LoadingRows layout="composer" label={t.opening} rows={1} />;
  }

  return (
    <ComposerSession
      {...props}
      key={`${profileId}:${threadId}`}
      threadId={threadId}
    />
  );
};

export { Composer };

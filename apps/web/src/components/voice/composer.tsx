"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import { MicIcon, SquareIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { useOffline } from "@/components/app/offline-queue";
import { usePreferences } from "@/components/app/preferences";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { useBrowserCapability } from "@/lib/browser-capability";
import { messageOf } from "@/lib/errors";

import { dictationAvailable, startDictation } from "./dictation";
import { startLiveSession } from "./live-session";
import type { LiveHandle } from "./live-session";

interface Caption {
  id: number;
  text: string;
  who: "assistant" | "you";
}

type VoiceState = "connecting" | "dictating" | "idle" | "live";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const voiceHintFor = (voice: VoiceState, available: boolean): string => {
  if (!available) {
    return "Voice isn't available in this browser, so please type. Nothing is sent until you approve it.";
  }

  if (voice === "dictating") {
    return "Listening. Your words will appear in the box; press Ask when they look right.";
  }

  if (voice === "live" || voice === "connecting") {
    return "Talking with LifeLink. Anything it prepares appears on screen for you to approve.";
  }

  return "Press the microphone button to speak. Nothing is sent until you approve it.";
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
  const submit = useMutation(api.assistant.submitRequest);
  const createLive = useAction(api.voice.createLiveSession);
  const status = useQuery(api.status.integrations);
  const { online, queueRequest } = useOffline();
  const { preferences } = usePreferences();
  const [localText, setLocalText] = useState("");
  const text = draft ?? localText;
  const setText = onDraftChange ?? setLocalText;
  const [submitting, setSubmitting] = useState(false);
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const canDictate = useBrowserCapability(dictationAvailable);
  const live = useRef<LiveHandle | null>(null);
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

    if (!online) {
      if (!queueRequest(trimmed, threadId)) {
        toast.error(
          "This request could not be saved offline. Your words are still here. Please try again when connected."
        );

        return false;
      }

      toast("Saved. LifeLink will look at this when you're back online.");
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
      toast.error(errorText(error));
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
    live.current?.stop();
    live.current = null;
    dictation.current?.stop();
    dictation.current = null;
    setVoice("idle");
    setSpeaking(false);
  };

  const startVoice = async (): Promise<void> => {
    if (liveConfigured && online) {
      voiceRun.current += 1;
      const run = voiceRun.current;
      setVoice("connecting");
      setCaptions([]);

      try {
        const session = await createLive({});

        if (!mounted.current || voiceRun.current !== run) {
          return;
        }

        const handle = await startLiveSession(session.token, session.model, {
          onCaption: addCaption,
          onClosed: (reason) => {
            if (reason) {
              toast(reason);
            }

            stopVoice();
          },
          onRequest: async (request) =>
            (await send(request, "voice"))
              ? "Prepared. It is on the screen now; nothing happens until it is approved there."
              : "That could not be prepared. Please ask them to try again or type it.",
          onSpeaking: setSpeaking,
        });

        if (!mounted.current || voiceRun.current !== run) {
          handle.stop();

          return;
        }

        live.current = handle;
        setVoice("live");
      } catch (error) {
        stopVoice();
        toast.error(
          `Voice didn't start: ${errorText(error)} You can type instead.`
        );
      }

      return;
    }

    if (canDictate) {
      dictation.current = startDictation(
        (heard) => setText(heard),
        () => {
          dictation.current = null;
          setVoice("idle");
        }
      );
      setVoice(dictation.current === null ? "idle" : "dictating");
    }
  };

  const voiceAvailable = (liveConfigured && online) || canDictate;
  const listening = voice !== "idle";

  const voiceHint = voiceHintFor(voice, voiceAvailable);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form
        className="border-control bg-raised grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-2xl border-[1.5px] p-3 sm:gap-x-5 sm:p-4"
        onSubmit={async (event) => {
          event.preventDefault();

          if (await send(text, "text")) {
            setText("");
          }
        }}
      >
        <button
          aria-label={listening ? "Stop listening" : "Speak to LifeLink"}
          aria-pressed={listening}
          className={cn(
            "border-brass bg-primary text-primary-foreground hover:bg-primary-hover disabled:hover:bg-primary flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,transform] active:scale-95 disabled:opacity-50 sm:size-16",
            listening && "bg-foreground hover:bg-foreground/85"
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
              className="size-6"
              fill="currentColor"
            />
          ) : (
            <MicIcon aria-hidden="true" className="size-7" />
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label className="sr-only" htmlFor={inputId}>
            What would you like help with?
          </label>
          <textarea
            aria-describedby={hintId}
            className="placeholder:text-muted-foreground field-sizing-content max-h-32 min-h-12 w-full resize-none overflow-y-auto bg-transparent text-base leading-snug outline-none sm:text-lg"
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
            placeholder="Type your message…"
            rows={1}
            value={text}
          />
        </div>
        <Button
          aria-busy={submitting}
          className="px-4 sm:px-6"
          disabled={submitting || text.trim().length === 0}
          type="submit"
        >
          {submitting ? "Sending…" : "Ask"}
        </Button>
        <p className="text-muted-foreground col-span-3 text-base" id={hintId}>
          {voiceHint}
        </p>
      </form>
      {listening && preferences.captions && captions.length > 0 ? (
        <section
          aria-label="Captions"
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
                {caption.who === "you" ? "You said: " : "LifeLink said: "}
              </span>
              {caption.text}
            </p>
          ))}
          {speaking ? (
            <p className="text-muted-foreground text-base">
              LifeLink is speaking…
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

/** Prepare a stable, owned thread before typing or starting a voice session. */
const Composer = (props: ComposerProps) => {
  const selectedThread = useQuery(
    api.assistant.myThread,
    props.threadId ? "skip" : {}
  );

  const createConversation = useMutation(api.assistant.newConversation);
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
        await createConversation({});
      } catch (error) {
        setOpeningError(errorText(error));
      }
    };

    void prepare();
  }, [threadId, createConversation, profileId]);

  if (openingError && !threadId) {
    return (
      <ErrorNote
        onRetry={async () => {
          setOpeningError(null);

          try {
            await createConversation({});
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
    return <LoadingRows label="Opening a place for your message" rows={1} />;
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

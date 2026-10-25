"use client";

/**
 * Voice typing with Gemini Live: a silent session that only transcribes. The
 * words go into a text box as the person speaks; nothing is sent from here.
 * The microphone opens straight from the Speak press, before any network
 * call, so Safari keeps the audio running.
 */
import { api } from "@lifelink/backend/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { currentMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

import {
  MicrophoneError,
  prepareAudio,
  startLiveSession,
} from "./live-session";
import type { LiveCallbacks, LiveHandle } from "./live-session";

type VoiceTypingState = "connecting" | "idle" | "listening";

interface VoiceTyping {
  /** Gemini Live is set up and the device is online. */
  available: boolean;
  /** True from the press until the session ends. */
  listening: boolean;
  state: VoiceTypingState;
  stop: () => void;
  toggle: () => void;
}

/** An open microphone, ready to connect to a session; release gives it back. */
interface Microphone {
  connect: (
    token: string,
    model: string,
    callbacks: LiveCallbacks
  ) => Promise<LiveHandle>;
  release: () => void;
}

interface VoiceTransport {
  open: (signal: AbortSignal) => Promise<Microphone>;
}

/** Gemini Live in silent mode: the model's audio is never played. */
const LIVE_TRANSPORT: VoiceTransport = {
  open: async (signal) => {
    const rig = await prepareAudio(signal);

    return {
      connect: async (token, model, callbacks) =>
        await startLiveSession(rig, token, model, callbacks, { silent: true }),
      release: rig.release,
    };
  },
};

/** A microphone problem is already in plain words; anything else uses the server's message. */
const problemOf = (error: Error | null): string =>
  error instanceof MicrophoneError ? error.message : messageOf(error);

const subscribeOnline = (update: () => void): (() => void) => {
  globalThis.addEventListener("online", update);
  globalThis.addEventListener("offline", update);

  return () => {
    globalThis.removeEventListener("online", update);
    globalThis.removeEventListener("offline", update);
  };
};

/** The browser's own online flag; voice typing needs a live connection. */
const useOnline = (): boolean =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );

/** Gemini Live is configured for this deployment. */
const useLiveConfigured = (): boolean => {
  const status = useQuery(api.status.integrations);

  return (
    status?.integrations.some(
      (item) => item.id === "gemini_live" && item.configured
    ) ?? false
  );
};

/**
 * `onWords` receives everything heard in this session so far, each time it
 * changes. The caller decides where the words go, after anything typed.
 */
const useVoiceTyping = (
  onWords: (words: string) => void,
  transport: VoiceTransport = LIVE_TRANSPORT
): VoiceTyping => {
  const createSession = useAction(api.voice.createVoiceTypingSession);
  const configured = useLiveConfigured();
  const online = useOnline();
  const [state, setState] = useState<VoiceTypingState>("idle");
  const handle = useRef<LiveHandle | null>(null);
  // The microphone while the session is still connecting; Stop and unmount release it.
  const pendingRig = useRef<Microphone | null>(null);
  const abort = useRef<AbortController | null>(null);
  const run = useRef(0);
  const latestOnWords = useRef(onWords);

  useEffect(() => {
    latestOnWords.current = onWords;
  }, [onWords]);

  const release = (): void => {
    run.current += 1;
    abort.current?.abort();
    abort.current = null;
    pendingRig.current?.release();
    pendingRig.current = null;
    handle.current?.stop();
    handle.current = null;
  };

  const stop = (): void => {
    release();
    setState("idle");
  };

  // Leaving the page ends the session and gives the microphone back.
  useEffect(
    () => () => {
      run.current += 1;
      abort.current?.abort();
      pendingRig.current?.release();
      handle.current?.stop();
    },
    []
  );

  const start = async (): Promise<void> => {
    run.current += 1;
    const thisRun = run.current;
    // Stop, a newer attempt, or leaving the page ends this one.
    const cancelled = (): boolean => run.current !== thisRun;
    const controller = new AbortController();
    let heard = "";
    let rig: Microphone | null = null;

    abort.current = controller;
    setState("connecting");

    try {
      // The microphone comes first, while the press still counts as a gesture.
      rig = await transport.open(controller.signal);

      if (cancelled()) {
        rig.release();

        return;
      }

      pendingRig.current = rig;
      const credentials = await createSession({});

      if (cancelled()) {
        rig.release();

        return;
      }

      const connected = await rig.connect(
        credentials.token,
        credentials.model,
        {
          onCaption: (who, piece) => {
            if (who !== "you" || cancelled()) {
              return;
            }

            // Input transcripts arrive as pieces, with their own spacing.
            heard += piece;
            latestOnWords.current(heard.trim());
          },
          onClosed: () => {
            if (cancelled()) {
              return;
            }

            stop();
            toast.error(currentMessages().voice.dictationStopped);
          },
          // The voice-typing token has no tools, so nothing is ever requested.
          onRequest: async () => await Promise.resolve(""),
          onSpeaking: () => {
            // Silent sessions never play audio.
          },
        }
      );

      // The session owns the microphone from here.
      if (pendingRig.current === rig) {
        pendingRig.current = null;
      }

      if (cancelled()) {
        connected.stop();

        return;
      }

      abort.current = null;
      handle.current = connected;
      setState("listening");
    } catch (error) {
      // Releasing twice is harmless; this covers a failed token call.
      rig?.release();

      if (pendingRig.current === rig) {
        pendingRig.current = null;
      }

      if (cancelled()) {
        return;
      }

      stop();
      toast.error(problemOf(error instanceof Error ? error : null));
    }
  };

  return {
    available: configured && online,
    listening: state !== "idle",
    state,
    stop,
    toggle: () => {
      if (state === "idle") {
        void start();
      } else {
        stop();
      }
    },
  };
};

export { useLiveConfigured, useVoiceTyping };

export type { Microphone, VoiceTransport, VoiceTyping };

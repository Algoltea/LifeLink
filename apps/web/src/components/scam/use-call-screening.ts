"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import {
  detectCallFlags,
  finalizeCallCaptions,
  PRACTICE_CALL_DURATION_MS,
  PRACTICE_CALL_SCRIPT,
  redactCallQuote,
  upsertCallCaption,
} from "@lifelink/contracts/call-screening";
import type { CallCaption, CallFlag } from "@lifelink/contracts/call-screening";
import { useAction, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { startCallScreeningSession } from "@/components/voice/live-session";
import type { CallScreeningHandle } from "@/components/voice/live-session";

import { createCallAlertAudio } from "./call-alert-audio";
import type { CallAlertAudio } from "./call-alert-audio";

const MAX_CALL_MS = 30 * 60_000;
const MAX_CAPTIONS = 120;
const ALERT_TAIL_MS = 900;

type CallStatus =
  | "idle"
  | "connecting"
  | "permission-denied"
  | "listening"
  | "error"
  | "ended";

type AlertStatus = "ready" | "playing" | "played" | "unavailable";

interface CallState {
  alertStatus: AlertStatus;
  captions: CallCaption[];
  durationMs: number;
  flags: CallFlag[];
  inputPaused: boolean;
  interrupted: boolean;
  muted: boolean;
  notice: string | null;
  practice: boolean;
  saveError: boolean;
  saving: boolean;
  sessionId: string;
  startedAt: number;
  status: CallStatus;
  summaryId: Id<"scamCallSummaries"> | null;
}

const emptyCall = (): CallState => ({
  alertStatus: "ready",
  captions: [],
  durationMs: 0,
  flags: [],
  inputPaused: false,
  interrupted: false,
  muted: false,
  notice: null,
  practice: false,
  saveError: false,
  saving: false,
  sessionId: "",
  startedAt: 0,
  status: "idle",
  summaryId: null,
});

/** Owns microphone, timers and alert playback for precisely one mounted screen. */
const useCallScreening = () => {
  const createSession = useAction(api.voice.createCallScreeningSession);
  const save = useMutation(api.callscreening.save);
  const [state, setState] = useState<CallState>(emptyCall);
  const current = useRef(state);
  const handle = useRef<CallScreeningHandle | null>(null);
  const audio = useRef<CallAlertAudio | null>(null);
  const abort = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tail = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const finishing = useRef(false);
  const clock = useRef<{ started: number; offset: number } | null>(null);

  const patch = (changes: Partial<CallState>): void => {
    current.current = { ...current.current, ...changes };

    if (mounted.current) {
      setState(current.current);
    }
  };

  const release = (): void => {
    generation.current += 1;
    abort.current?.abort();
    abort.current = null;
    handle.current?.stop();
    handle.current = null;
    audio.current?.close();
    audio.current = null;

    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }

    if (tail.current !== null) {
      clearTimeout(tail.current);
      tail.current = null;
    }
  };

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      generation.current += 1;
      abort.current?.abort();
      handle.current?.stop();
      audio.current?.close();

      if (timer.current !== null) {
        clearInterval(timer.current);
      }

      if (tail.current !== null) {
        clearTimeout(tail.current);
      }
    };
  }, []);

  const resumeInputAfterAlert = (): void => {
    const run = generation.current;

    if (tail.current !== null) {
      clearTimeout(tail.current);
    }

    tail.current = setTimeout(() => {
      if (
        run === generation.current &&
        current.current.status === "listening"
      ) {
        handle.current?.setInputMuted(false);
        patch({ inputPaused: false });
      }
    }, ALERT_TAIL_MS);
  };

  const playAlert = async (): Promise<void> => {
    if (current.current.muted || current.current.alertStatus === "playing") {
      return;
    }

    const run = generation.current;

    if (tail.current !== null) {
      clearTimeout(tail.current);
      tail.current = null;
    }

    handle.current?.setInputMuted(true);
    patch({ alertStatus: "playing", inputPaused: !current.current.practice });

    const played = await audio.current?.play(() => {
      if (run === generation.current) {
        patch({ alertStatus: "played" });
        resumeInputAfterAlert();
      }
    });

    if (run !== generation.current) {
      return;
    }

    if (!played) {
      patch({ alertStatus: "unavailable" });
      resumeInputAfterAlert();
    }
  };

  const receive = (incoming: CallCaption): void => {
    const caption = {
      ...incoming,
      timeMs: Math.min(MAX_CALL_MS, Math.max(0, incoming.timeMs)),
    };

    const fresh = detectCallFlags(caption).filter(
      (flag) =>
        !current.current.flags.some(
          (existing) => existing.reason === flag.reason
        )
    );

    const flags = [
      ...current.current.flags,
      ...fresh.map((flag) => ({
        ...flag,
        quote: redactCallQuote(flag.quote).slice(0, 300),
      })),
    ].slice(0, 20);

    const flagged = flags.find((flag) => flag.captionId === caption.id);

    const safeCaption: CallCaption = {
      ...caption,
      text: redactCallQuote(caption.text),
    };

    if (flagged) {
      safeCaption.flagId = flagged.id;
    }

    patch({
      captions: upsertCallCaption(current.current.captions, safeCaption).slice(
        -MAX_CAPTIONS
      ),
      durationMs: Math.min(
        MAX_CALL_MS,
        Math.max(current.current.durationMs, caption.timeMs)
      ),
      flags,
    });

    if (fresh.length > 0) {
      void playAlert();
    }
  };

  const saveSummary = async (): Promise<void> => {
    const snapshot = current.current;

    if (snapshot.saving || snapshot.summaryId !== null) {
      return;
    }

    patch({ saveError: false, saving: true });

    try {
      const summaryId = await save({
        durationMs: snapshot.durationMs,
        flags: snapshot.flags,
        interrupted: snapshot.interrupted,
        practice: snapshot.practice,
        sessionId: snapshot.sessionId,
        startedAt: snapshot.startedAt,
      });

      if (current.current.sessionId === snapshot.sessionId) {
        patch({ saving: false, summaryId });
      }
    } catch {
      if (current.current.sessionId === snapshot.sessionId) {
        patch({ saveError: true, saving: false });
      }
    }
  };

  const finish = (notice: string | null = null): void => {
    if (finishing.current || current.current.status === "ended") {
      return;
    }

    finishing.current = true;
    // Finalize the displayed fragment before shutting down; do not play a new alert.
    const snapshot = current.current;
    const flags = [...snapshot.flags];

    for (const caption of finalizeCallCaptions(snapshot.captions)) {
      for (const flag of detectCallFlags(caption)) {
        if (!flags.some((existing) => existing.reason === flag.reason)) {
          flags.push({
            ...flag,
            quote: redactCallQuote(flag.quote).slice(0, 300),
          });
        }
      }
    }

    const elapsed =
      clock.current === null
        ? snapshot.durationMs
        : clock.current.offset + performance.now() - clock.current.started;

    const durationMs = Math.min(
      MAX_CALL_MS,
      Math.max(
        snapshot.durationMs,
        Math.round(elapsed),
        ...flags.map((flag) => flag.timeMs)
      )
    );

    release();
    patch({
      captions: [],
      durationMs,
      flags: flags.slice(0, 20),
      inputPaused: false,
      notice,
      status: "ended",
    });
    void saveSummary();
  };

  const start = async (
    practice: boolean,
    continueCall = false
  ): Promise<void> => {
    const previous = current.current;
    release();
    finishing.current = false;
    clock.current = null;

    const run = generation.current;
    const durationOffset = continueCall ? previous.durationMs : 0;

    const resumedAlertStatus =
      previous.alertStatus === "playing" ? "played" : previous.alertStatus;

    patch({
      ...(continueCall ? previous : emptyCall()),
      alertStatus: continueCall ? resumedAlertStatus : "ready",
      inputPaused: false,
      notice: null,
      practice,
      sessionId: continueCall ? previous.sessionId : crypto.randomUUID(),
      startedAt: continueCall ? previous.startedAt : Date.now(),
      status: "connecting",
    });

    try {
      audio.current = createCallAlertAudio();
      await audio.current.ready;
    } catch {
      if (run === generation.current) {
        patch({ alertStatus: "unavailable" });
      }
    }

    if (run !== generation.current || !mounted.current) {
      return;
    }

    if (!practice) {
      const controller = new AbortController();
      abort.current = controller;

      try {
        const credentials = await createSession({});

        if (run !== generation.current) {
          return;
        }

        const connected = await startCallScreeningSession(
          credentials.token,
          credentials.model,
          {
            onCaption: (caption) => {
              if (run === generation.current && !current.current.inputPaused) {
                receive({
                  ...caption,
                  id: `${run}-${caption.id}`,
                  timeMs: durationOffset + caption.timeMs,
                });
              }
            },
            onClosed: () => {
              if (run === generation.current) {
                release();
                patch({
                  inputPaused: false,
                  interrupted: true,
                  status: "error",
                });
              }
            },
          },
          { signal: controller.signal }
        );

        if (run !== generation.current) {
          connected.stop();

          return;
        }

        handle.current = connected;
      } catch (error) {
        if (run !== generation.current) {
          return;
        }

        const denied =
          error instanceof DOMException &&
          (error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError");

        release();
        patch({
          interrupted: !denied,
          status: denied ? "permission-denied" : "error",
        });

        return;
      }
    }

    patch({ status: "listening" });
    const clockStarted = performance.now();
    clock.current = { offset: durationOffset, started: clockStarted };
    let scriptIndex = 0;
    timer.current = setInterval(() => {
      if (run !== generation.current) {
        return;
      }

      const durationMs = Math.min(
        MAX_CALL_MS,
        durationOffset + Math.round(performance.now() - clockStarted)
      );

      patch({ durationMs });

      if (practice) {
        let caption = PRACTICE_CALL_SCRIPT[scriptIndex];

        while (caption && caption.timeMs <= durationMs) {
          receive(caption);
          scriptIndex += 1;
          caption = PRACTICE_CALL_SCRIPT[scriptIndex];
        }

        if (durationMs >= PRACTICE_CALL_DURATION_MS) {
          finish();
        }
      } else if (durationMs >= MAX_CALL_MS) {
        finish(
          "The check stopped after 30 minutes. Here is the summary so far."
        );
      }
    }, 1000);
  };

  const toggleMute = (): void => {
    const muted = !current.current.muted;
    patch({ muted });

    if (muted) {
      audio.current?.stop();

      if (current.current.alertStatus === "playing") {
        patch({ alertStatus: "played" });
        resumeInputAfterAlert();
      }
    } else if (current.current.flags.length > 0) {
      void playAlert();
    }
  };

  const reset = (): void => {
    release();
    patch(emptyCall());
  };

  return { finish, reset, retrySave: saveSummary, start, state, toggleMute };
};

export { useCallScreening };

export type { CallState };

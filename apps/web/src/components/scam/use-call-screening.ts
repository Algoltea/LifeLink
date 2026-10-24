"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import {
  callFlagsFromSigns,
  callTranscriptWindow,
  countCallWords,
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
const CHECK_INTERVAL_MS = 10_000;
const FINAL_CHECK_TIMEOUT_MS = 12_000;

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
  /** The last cloud check is running after the call ended. */
  checking: boolean;
  /** Some speech was never checked; saved so the summary can't read as clear. */
  checkIncomplete: boolean;
  checksUnavailable: boolean;
  durationMs: number;
  flags: CallFlag[];
  heardWords: number;
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
  checkIncomplete: false,
  checking: false,
  checksUnavailable: false,
  durationMs: 0,
  flags: [],
  heardWords: 0,
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

/** One call's cloud checks: the running request and the last transcript checked. */
interface CheckTracker {
  active: Promise<boolean> | null;
  at: number;
  checkedText: string;
  /** Some unchecked speech scrolled out of the window before a check covered it. */
  missed: boolean;
  /** First line still waiting since the last failed check. */
  pendingSince: string | null;
}

const newTracker = (): CheckTracker => ({
  active: null,
  at: 0,
  checkedText: "",
  missed: false,
  pendingSince: null,
});

/** Remembers where unchecked speech began, so losing it can be noticed later. */
const markPending = (tracker: CheckTracker, transcript: string): void => {
  if (tracker.pendingSince === null) {
    tracker.pendingSince = transcript.split("\n")[0] ?? "";
  }
};

/** A continued call keeps what it heard so far; a new call starts empty. */
const startingState = (
  previous: CallState,
  practice: boolean,
  continueCall: boolean
): CallState => {
  if (!continueCall) {
    return {
      ...emptyCall(),
      practice,
      sessionId: crypto.randomUUID(),
      startedAt: Date.now(),
      status: "connecting",
    };
  }

  return {
    ...previous,
    alertStatus:
      previous.alertStatus === "playing" ? "played" : previous.alertStatus,
    inputPaused: false,
    notice: null,
    practice,
    status: "connecting",
  };
};

/** Owns microphone, timers and alert playback for precisely one mounted screen. */
const useCallScreening = () => {
  const createSession = useAction(api.voice.createCallScreeningSession);
  const analyze = useAction(api.callscreening.analyze);
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
  // Words per caption; the rolling caption buffer drops old segments.
  const wordCounts = useRef(new Map<string, number>());
  // Replaced for each new call, so an old call's late check can't touch it.
  const checks = useRef<CheckTracker>(newTracker());

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

    const previous = current.current.captions.find(
      (existing) => existing.id === caption.id
    );

    if (!previous?.final || caption.final) {
      wordCounts.current.set(caption.id, countCallWords(caption.text));
    }

    let heardWords = 0;

    for (const words of wordCounts.current.values()) {
      heardWords += words;
    }

    const safeCaption: CallCaption = {
      ...caption,
      text: redactCallQuote(caption.text),
    };

    patch({
      captions: upsertCallCaption(current.current.captions, safeCaption).slice(
        -MAX_CAPTIONS
      ),
      durationMs: Math.min(
        MAX_CALL_MS,
        Math.max(current.current.durationMs, caption.timeMs)
      ),
      heardWords,
    });
  };

  /** Adds new warning signs to the call, with the spoken alert while listening. */
  const addFlags = (incoming: readonly CallFlag[]): void => {
    const fresh = incoming.filter(
      (flag) =>
        !current.current.flags.some(
          (existing) => existing.reason === flag.reason
        )
    );

    if (fresh.length === 0) {
      return;
    }

    const flags = [
      ...current.current.flags,
      ...fresh.map((flag) => ({
        ...flag,
        quote: redactCallQuote(flag.quote).slice(0, 300),
      })),
    ].slice(0, 20);

    const captions = current.current.captions.map((caption) => {
      const flag = fresh.find((item) => item.captionId === caption.id);

      return flag === undefined || caption.flagId !== undefined
        ? caption
        : { ...caption, flagId: flag.id };
    });

    patch({ captions, flags });

    if (current.current.status === "listening") {
      void playAlert();
    }
  };

  const runCheck = async (
    tracker: CheckTracker,
    sessionId: string,
    transcript: string
  ): Promise<boolean> => {
    let result: Awaited<ReturnType<typeof analyze>>;

    try {
      result = await analyze({ transcript });
    } catch {
      // Unchecked words stay unchecked, so the next tick retries them.
      tracker.active = null;
      markPending(tracker, transcript);

      return false;
    }

    tracker.active = null;

    if (result.status === "checked") {
      // Words that left the window while checks failed were never checked.
      if (
        tracker.pendingSince !== null &&
        !transcript.includes(tracker.pendingSince)
      ) {
        tracker.missed = true;
      }

      tracker.pendingSince = null;
    } else {
      markPending(tracker, transcript);
    }

    // Late results never reach another call or a summary that already saved.
    const accepting =
      checks.current === tracker &&
      current.current.sessionId === sessionId &&
      (current.current.status !== "ended" || current.current.checking);

    if (!accepting) {
      return false;
    }

    if (result.status === "unavailable") {
      patch({ checksUnavailable: true });
    }

    addFlags(
      callFlagsFromSigns(
        result.signs,
        current.current.captions,
        current.current.flags
      )
    );

    if (result.status === "checked") {
      tracker.checkedText = transcript;
    }

    return result.status === "checked";
  };

  /** Checks the newest captions in the cloud, one request at a time per call. */
  const checkCall = (given?: CheckTracker): Promise<boolean> => {
    const tracker = given ?? checks.current;
    tracker.at = performance.now();
    tracker.active = runCheck(
      tracker,
      current.current.sessionId,
      callTranscriptWindow(current.current.captions)
    );

    return tracker.active;
  };

  const uncheckedText = (): boolean => {
    const transcript = callTranscriptWindow(current.current.captions);

    return transcript.length > 0 && transcript !== checks.current.checkedText;
  };

  const checkDue = (): boolean =>
    checks.current.active === null &&
    !current.current.checksUnavailable &&
    performance.now() - checks.current.at >= CHECK_INTERVAL_MS &&
    uncheckedText();

  const saveSummary = async (): Promise<void> => {
    const snapshot = current.current;

    if (snapshot.saving || snapshot.summaryId !== null) {
      return;
    }

    patch({ saveError: false, saving: true });

    try {
      const summaryId = await save({
        checkIncomplete: snapshot.checkIncomplete,
        durationMs: snapshot.durationMs,
        flags: snapshot.flags,
        heardWords: snapshot.heardWords,
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

  /** Waits for a running check, then checks any words it didn't cover. */
  const finalCheck = async (): Promise<void> => {
    const tracker = checks.current;

    if (tracker.active !== null) {
      await tracker.active;
    }

    // A timed-out final check must not start a request for a newer call.
    const stillFinishing =
      checks.current === tracker && current.current.checking;

    if (
      stillFinishing &&
      uncheckedText() &&
      !current.current.checksUnavailable
    ) {
      await checkCall(tracker);
    }
  };

  /** The summary saves only after the end of the call is checked or times out. */
  const checkThenSave = async (): Promise<void> => {
    const { practice, sessionId } = current.current;

    if (!practice && !current.current.checksUnavailable) {
      patch({ checking: true });
      await Promise.race([
        finalCheck(),
        // oxlint-disable-next-line promise/avoid-new -- a timer is the only way to stop waiting on a slow check.
        new Promise<void>((resolve) => {
          setTimeout(resolve, FINAL_CHECK_TIMEOUT_MS);
        }),
      ]);

      if (current.current.sessionId !== sessionId) {
        return;
      }

      patch({ checking: false });
    }

    patch({
      checkIncomplete:
        !practice &&
        current.current.heardWords > 0 &&
        (current.current.checksUnavailable ||
          checks.current.missed ||
          uncheckedText()),
    });
    await saveSummary();
  };

  const finish = (notice: string | null = null): void => {
    if (finishing.current || current.current.status === "ended") {
      return;
    }

    finishing.current = true;
    // Finalize the displayed fragment before shutting down; do not play a new alert.
    const snapshot = current.current;
    const { flags } = snapshot;

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
    // Captions stay in memory for the summary page and are never saved.
    patch({
      captions: finalizeCallCaptions(snapshot.captions),
      durationMs,
      flags: flags.slice(0, 20),
      inputPaused: false,
      notice,
      status: "ended",
    });
    void checkThenSave();
  };

  const start = async (
    practice: boolean,
    continueCall = false
  ): Promise<void> => {
    const previous = current.current;
    release();
    finishing.current = false;
    clock.current = null;

    if (!continueCall) {
      wordCounts.current.clear();
      checks.current = newTracker();
    }

    const run = generation.current;
    const durationOffset = continueCall ? previous.durationMs : 0;

    patch(startingState(previous, practice, continueCall));

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
          const { warning, ...line } = caption;
          receive(line);

          if (warning !== undefined) {
            addFlags(
              callFlagsFromSigns(
                [{ kind: warning, quote: line.text }],
                current.current.captions,
                current.current.flags
              )
            );
          }

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
      } else if (checkDue()) {
        void checkCall();
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

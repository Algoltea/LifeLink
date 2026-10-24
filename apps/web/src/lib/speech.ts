"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { SpeechVoice } from "@lifelink/contracts/speech";
import { useAction } from "convex/react";
import { useCallback, useEffect, useId, useState } from "react";

import { usePreferences } from "@/components/app/preferences";

import { messageOf } from "./errors";

// Must match the server's per-request bound. Larger passages are read sequentially.
const SPEECH_CHUNK_CHARACTERS = 600;
const MAX_PASSAGE_CHARACTERS = 24_000;
const PLAYBACK_TIMEOUT_MS = 5 * 60_000;

type SpeechStatus = "idle" | "loading" | "ready" | "speaking";

interface SpeechSession {
  audio: HTMLAudioElement;
  controller: AbortController;
  owner: string;
  rate: number;
  reportError: (message: string) => void;
  resume: (() => Promise<void>) | null;
  text: string;
  update: (status: SpeechStatus) => void;
  voice: SpeechVoice | null;
}

let currentSession: SpeechSession | null = null;

/** Stop only this control's audio on unmount; starting another reader replaces it. */
const stopSpeaking = (owner?: string): void => {
  if (
    currentSession === null ||
    (owner !== undefined && currentSession.owner !== owner)
  ) {
    return;
  }

  const previous = currentSession;
  currentSession = null;
  previous.controller.abort();
  previous.update("idle");
};

const speechChunks = (text: string): string[] => {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > SPEECH_CHUNK_CHARACTERS) {
    const section = remaining.slice(0, SPEECH_CHUNK_CHARACTERS);

    const sentenceEnd = Math.max(
      section.lastIndexOf(". "),
      section.lastIndexOf("? "),
      section.lastIndexOf("! "),
      section.lastIndexOf("\n")
    );

    let end = sentenceEnd + 1;

    if (end < SPEECH_CHUNK_CHARACTERS / 2) {
      end = section.lastIndexOf(" ");
    }

    if (end < SPEECH_CHUNK_CHARACTERS / 2) {
      end = SPEECH_CHUNK_CHARACTERS;
    }

    // Keep a Unicode surrogate pair together when a long word crosses the limit.
    if ((remaining.codePointAt(end - 1) ?? 0) > 0xff_ff) {
      end -= 1;
    }

    chunks.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
};

const playbackRate = (rate: number): number =>
  Number.isFinite(rate) ? Math.min(1.5, Math.max(0.5, rate)) : 0.9;

const playAudio = async (
  bytes: ArrayBuffer,
  session: SpeechSession
): Promise<void> => {
  const { signal } = session.controller;

  if (signal.aborted) {
    return;
  }

  const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
  const { audio } = session;
  audio.src = url;
  audio.playbackRate = playbackRate(session.rate);
  let resolvePlayback: (() => void) | null = null;
  let rejectPlayback: ((error: Error) => void) | null = null;

  // Adapt media events without Promise.withResolvers, which Safari before 17.4 lacks.
  // eslint-disable-next-line promise/avoid-new
  const finished = new Promise<void>((resolve, reject) => {
    resolvePlayback = resolve;
    rejectPlayback = reject;
  });

  const finishPlayback = (): void => resolvePlayback?.();

  const failPlayback = (error: Error): void => rejectPlayback?.(error);

  const failAudio = (): void =>
    failPlayback(
      new Error("This audio could not be played. Please try again.")
    );

  audio.addEventListener("ended", finishPlayback, { once: true });
  audio.addEventListener("error", failAudio, { once: true });
  signal.addEventListener("abort", finishPlayback, { once: true });

  const timer = setTimeout(
    () =>
      failPlayback(
        new Error("Audio playback stopped responding. Please try again.")
      ),
    PLAYBACK_TIMEOUT_MS
  );

  const startPlayback = async (): Promise<void> => {
    try {
      await audio.play();

      if (!signal.aborted) {
        session.resume = null;
        session.update("speaking");
      }
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        // Keep this audio so a fresh user gesture can play it without another paid request.
        session.resume = startPlayback;
        session.update("ready");

        return;
      }

      failPlayback(
        error instanceof Error
          ? error
          : new Error("This audio could not be played. Please try again.")
      );
    }
  };

  try {
    await Promise.race([startPlayback(), finished]);
    await finished;
  } finally {
    session.resume = null;
    clearTimeout(timer);
    audio.removeEventListener("ended", finishPlayback);
    audio.removeEventListener("error", failAudio);
    signal.removeEventListener("abort", finishPlayback);
    finishPlayback();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(url);
  }
};

/** A manual button can take over audio prepared by automatic read-aloud. */
const resumeSpeech = async (
  owner: string,
  text: string,
  rate: number,
  voice: SpeechVoice | null,
  update: (status: SpeechStatus) => void,
  reportError: (message: string) => void
): Promise<boolean> => {
  const session = currentSession;

  if (
    session?.resume === null ||
    session === null ||
    session.text !== text ||
    session.voice !== voice
  ) {
    return false;
  }

  session.update("idle");
  session.owner = owner;
  session.rate = rate;
  session.reportError = reportError;
  session.audio.playbackRate = playbackRate(rate);
  session.update = update;
  update("ready");
  await session.resume();

  return true;
};

type SpeechGenerator = (args: {
  text: string;
  voice?: SpeechVoice;
}) => Promise<{ audio: ArrayBuffer }>;

const readPassage = async (
  session: SpeechSession,
  text: string,
  synthesize: SpeechGenerator
): Promise<void> => {
  const { signal } = session.controller;
  currentSession = session;

  try {
    for (const textChunk of speechChunks(text)) {
      if (signal.aborted) {
        return;
      }

      session.update("loading");

      // Generate only the next chunk so stopping avoids extra provider requests.
      // eslint-disable-next-line no-await-in-loop
      const result = await synthesize({
        text: textChunk,
        voice: session.voice ?? undefined,
      });

      // Convex actions cannot be cancelled after dispatch. Never play a stale result.
      if (signal.aborted) {
        return;
      }

      // Audio must finish before another chunk starts; never overlap readers.
      // eslint-disable-next-line no-await-in-loop
      await playAudio(result.audio, session);
    }
  } catch (error) {
    if (!signal.aborted) {
      session.reportError(
        messageOf(
          error instanceof Error ? error : null,
          "Read-aloud is unavailable. Please try again."
        )
      );
    }
  } finally {
    if (currentSession === session) {
      currentSession = null;
      session.update("idle");
    }
  }
};

/** Shared authenticated ElevenLabs read-aloud, with no browser-synthesis fallback. */
const useSpeech = (voiceOverride?: SpeechVoice | null) => {
  const synthesize = useAction(api.voice.synthesizeSpeech);
  const { preferences } = usePreferences();

  const voice =
    voiceOverride === undefined ? preferences.speechVoice : voiceOverride;

  const owner = useId();
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const stop = useCallback(() => stopSpeaking(owner), [owner]);

  // Prepared audio belongs to the voice that generated it, including before play.
  useEffect(() => {
    if (currentSession?.owner === owner && currentSession.voice !== voice) {
      stop();
    }

    return stop;
  }, [owner, stop, voice]);

  const read = useCallback(
    async (text: string, rate: number): Promise<void> => {
      setError(null);

      if (await resumeSpeech(owner, text, rate, voice, setStatus, setError)) {
        return;
      }

      stopSpeaking();

      if (text.trim().length === 0) {
        return;
      }

      if (text.length > MAX_PASSAGE_CHARACTERS) {
        setError(
          "That passage is too long to read at once. Please choose a shorter section."
        );

        return;
      }

      if (!("Audio" in globalThis)) {
        setError(
          "This browser cannot play audio. You can still read the text here."
        );

        return;
      }

      const session: SpeechSession = {
        audio: new Audio(),
        controller: new AbortController(),
        owner,
        rate,
        reportError: setError,
        resume: null,
        text,
        update: setStatus,
        voice,
      };

      await readPassage(session, text, synthesize);
    },
    [owner, synthesize, voice]
  );

  return { error, read, status, stop };
};

export { useSpeech };

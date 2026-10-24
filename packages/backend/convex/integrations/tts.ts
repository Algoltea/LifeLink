import { isSpeechVoice } from "@lifelink/contracts/speech";
import type { SpeechVoice } from "@lifelink/contracts/speech";

import { readEnv, readEnvOr } from "../lib/env";

const SPEECH_ENDPOINT = "https://openrouter.ai/api/v1/audio/speech";
const MAX_SPEECH_CHARACTERS = 600;
const MAX_AUDIO_BYTES = 900 * 1024;
const SPEECH_TIMEOUT_MS = 45_000;

// Verified against OpenRouter's public speech catalog on 2026-10-24.
const SPEECH_MODELS = new Set([
  "elevenlabs/eleven-v4",
  "elevenlabs/eleven-v4-turbo",
  "elevenlabs/eleven-v3",
  "elevenlabs/eleven-v3-conversational",
  "elevenlabs/eleven-flash-v2.5",
  "elevenlabs/eleven-turbo-v2.5",
  "elevenlabs/eleven-multilingual-v2",
  "elevenlabs/eleven-turbo-v2",
  "elevenlabs/eleven-flash-v2",
]);

interface SpeechAudio {
  audio: ArrayBuffer;
  contentType: "audio/mpeg";
  model: string;
}

type SpeechResult =
  | { ok: true; value: SpeechAudio }
  | { ok: false; error: string };

const speechConfigurationError = (voice?: SpeechVoice): string | null => {
  if (readEnv("OPENROUTER_API_KEY") === null) {
    return "Read-aloud is not set up yet. An OpenRouter key is needed.";
  }

  if (
    !SPEECH_MODELS.has(
      readEnvOr("OPENROUTER_TTS_MODEL", "elevenlabs/eleven-v4-turbo")
    )
  ) {
    return "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.";
  }

  if (!isSpeechVoice(voice ?? readEnvOr("OPENROUTER_TTS_VOICE", "sarah"))) {
    return "The configured read-aloud voice is not supported. Please check the speech settings.";
  }

  return null;
};

/** Bound the stream while reading; never buffer an unchecked provider response. */
const readAudio = async (response: Response): Promise<ArrayBuffer> => {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Read-aloud returned no audio. Please try again.");
  }

  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      // A stream reader must be consumed in order to enforce the cumulative byte bound.
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      length += value.byteLength;

      if (length > MAX_AUDIO_BYTES) {
        throw new Error(
          "That audio was too large. Please read a shorter section."
        );
      }

      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }

  if (length === 0) {
    throw new Error("Read-aloud returned no audio. Please try again.");
  }

  const audio = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    audio.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return audio.buffer;
};

/** ElevenLabs synthesis through OpenRouter only. No direct vendor or browser fallback. */
const synthesizeSpeech = async (
  text: string,
  voice?: SpeechVoice
): Promise<SpeechResult> => {
  const input = text.trim();

  if (input.length === 0 || input.length > MAX_SPEECH_CHARACTERS) {
    return {
      error: `Choose between 1 and ${MAX_SPEECH_CHARACTERS} characters to read.`,
      ok: false,
    };
  }

  const configurationError = speechConfigurationError(voice);
  const apiKey = readEnv("OPENROUTER_API_KEY");

  if (configurationError !== null || apiKey === null) {
    return {
      error: configurationError ?? "Read-aloud is not set up yet.",
      ok: false,
    };
  }

  const model = readEnvOr("OPENROUTER_TTS_MODEL", "elevenlabs/eleven-v4-turbo");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SPEECH_TIMEOUT_MS);

  try {
    const response = await fetch(SPEECH_ENDPOINT, {
      body: JSON.stringify({
        input,
        model,
        response_format: "mp3",
        voice: voice ?? readEnvOr("OPENROUTER_TTS_VOICE", "sarah"),
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": readEnvOr("SITE_URL", "http://localhost:3001"),
        "X-OpenRouter-Title": "LifeLink",
      },
      method: "POST",
      redirect: "error",
      signal: controller.signal,
    });

    if (!response.ok) {
      await response.body?.cancel();

      return {
        error: `Read-aloud is unavailable (${response.status}). Please try again later.`,
        ok: false,
      };
    }

    if (
      response.headers.get("Content-Type")?.split(";")[0]?.trim() !==
      "audio/mpeg"
    ) {
      await response.body?.cancel();

      return {
        error:
          "Read-aloud returned an unexpected audio format. Please try again later.",
        ok: false,
      };
    }

    return {
      ok: true,
      value: {
        audio: await readAudio(response),
        contentType: "audio/mpeg",
        model,
      },
    };
  } catch {
    return {
      error: controller.signal.aborted
        ? "Read-aloud took too long. Please try again."
        : "The audio could not be loaded. Please try again.",
      ok: false,
    };
  } finally {
    clearTimeout(timer);
  }
};

export { MAX_SPEECH_CHARACTERS, speechConfigurationError, synthesizeSpeech };

export type { SpeechAudio };

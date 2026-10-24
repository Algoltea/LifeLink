/**
 * Gemini Live with server-held credentials. The long-lived GEMINI_API_KEY
 * stays in Convex; the browser receives a one-use ephemeral token locked to
 * the configured model, system instruction, and the single tool below.
 * Tool calls only submit a request into the normal review pipeline.
 */
import { z } from "zod";

import { readEnv, readEnvOr } from "../lib/env";
import { decodeJson, describeRejection, request } from "./http";

const TOKEN_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/auth_tokens";

const liveModel = (): string =>
  readEnvOr("GEMINI_LIVE_MODEL", "gemini-3.8-live");

const SUBMIT_TOOL = {
  description:
    "Submit what the person wants done (send a message, ask for a ride, set a reminder, make a grocery list, check a message for scams). The app prepares it for the person to review on screen; nothing is sent until they approve.",
  name: "submit_request",
  parameters: {
    properties: {
      request: {
        description: "The person's request in their own words.",
        type: "STRING",
      },
    },
    required: ["request"],
    type: "OBJECT",
  },
};

const systemInstructionFor = (preferredName: string): string =>
  [
    `You are a calm, warm voice assistant for ${preferredName}, an older adult.`,
    "Speak in short, plain sentences. Never rush. Confirm what you heard.",
    "When they want something done, call submit_request with their words, then say it is ready to review on screen.",
    "You cannot send, buy, or change settings yourself, and you never claim something was sent.",
    "Never ask for passwords, bank details, or codes.",
  ].join(" ");

const tokenSchema = z.object({ name: z.string() }).loose();

type LiveTokenResult =
  | { error: string; ok: false }
  | { expiresAt: number; model: string; ok: true; token: string };

const createLiveToken = async (
  preferredName: string
): Promise<LiveTokenResult> => {
  const apiKey = readEnv("GEMINI_API_KEY");

  if (apiKey === null) {
    return {
      error: "Voice conversation is not set up yet (no Gemini API key).",
      ok: false,
    };
  }

  const now = Date.now();
  const expiresAt = now + 30 * 60_000;
  const model = liveModel();

  const outcome = await request({
    body: JSON.stringify({
      expireTime: new Date(expiresAt).toISOString(),
      liveConnectConstraints: {
        config: {
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          responseModalities: ["AUDIO"],
          sessionResumption: {},
          systemInstruction: {
            parts: [{ text: systemInstructionFor(preferredName) }],
          },
          tools: [{ functionDeclarations: [SUBMIT_TOOL] }],
        },
        model: `models/${model}`,
      },
      newSessionExpireTime: new Date(now + 60_000).toISOString(),
      uses: 1,
    }),
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    method: "POST",
    url: TOKEN_ENDPOINT,
  });

  if (outcome.kind === "uncertain") {
    return { error: outcome.reason, ok: false };
  }

  if (outcome.kind === "rejected") {
    return {
      error: describeRejection(outcome.status, outcome.body),
      ok: false,
    };
  }

  const parsed = decodeJson(tokenSchema, outcome.body);

  return parsed === null
    ? { error: "The voice service's answer could not be read.", ok: false }
    : { expiresAt, model, ok: true, token: parsed.name };
};

export { SUBMIT_TOOL, createLiveToken, liveModel, systemInstructionFor };

export type { LiveTokenResult };

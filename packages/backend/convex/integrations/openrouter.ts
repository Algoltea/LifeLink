/**
 * OpenRouter chat completions with GLM/Gemini and JSON-schema structured
 * output. Model identifiers come from the deployment environment so they can
 * change without code changes. Output is always re-validated with zod.
 */
import { z } from "zod";

import { readEnv, readEnvOr } from "../lib/env";
import { decodeJson, describeRejection, request } from "./http";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// Scam checks (calls, new email, the check form) use their own model.
type ModelTier = "fast" | "main" | "scam";

interface ContentText {
  text: string;
  type: "text";
}

interface ContentImage {
  image_url: { detail: "auto"; url: string };
  type: "image_url";
}

interface ChatMessage {
  content: string | (ContentImage | ContentText)[];
  role: "system" | "user" | "assistant";
}

interface StructuredRequest<Output> {
  messages: ChatMessage[];
  schema: z.ZodType<Output>;
  schemaName: string;
  tier: ModelTier;
  /** Reasoning effort; low unless a check needs more care. */
  effort?: "low" | "medium";
}

interface CompletionBody {
  messages: ChatMessage[];
  model: string;
  provider: { require_parameters: boolean };
  reasoning: { effort: "low" | "medium" };
  response_format: {
    json_schema: { name: string; schema: unknown; strict: boolean };
    type: "json_schema";
  };
  temperature?: number;
}

type StructuredResult<Output> =
  | { error: string; ok: false }
  | { model: string; ok: true; value: Output };

const completionSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().nullable() }),
      })
    )
    .min(1),
  error: z.object({ message: z.string() }).optional(),
  model: z.string().optional(),
});

const MODEL_SETTINGS: Record<ModelTier, { env: string; fallback: string }> = {
  fast: { env: "OPENROUTER_FAST_MODEL", fallback: "z-ai/glm-5.3-flash" },
  main: { env: "OPENROUTER_MODEL", fallback: "google/gemini-4-argon" },
  scam: { env: "OPENROUTER_SCAM_MODEL", fallback: "openai/gpt-6-luna" },
};

const modelFor = (tier: ModelTier): string =>
  readEnvOr(MODEL_SETTINGS[tier].env, MODEL_SETTINGS[tier].fallback);

const openRouterConfigured = (): boolean =>
  readEnv("OPENROUTER_API_KEY") !== null;

const structuredCompletion = async <Output>(
  input: StructuredRequest<Output>
): Promise<StructuredResult<Output>> => {
  const apiKey = readEnv("OPENROUTER_API_KEY");

  if (apiKey === null) {
    return {
      error: "The assistant is not set up yet (no OpenRouter key).",
      ok: false,
    };
  }

  const model = modelFor(input.tier);
  const jsonSchema = z.toJSONSchema(input.schema, { target: "draft-7" });

  const body: CompletionBody = {
    messages: input.messages,
    model,
    provider: { require_parameters: true },
    reasoning: { effort: input.effort ?? "low" },
    response_format: {
      json_schema: {
        name: input.schemaName,
        schema: jsonSchema,
        strict: true,
      },
      type: "json_schema",
    },
  };

  // Luna rejects temperature, and require_parameters would then find no provider.
  if (input.tier !== "scam") {
    body.temperature = 0.2;
  }

  const outcome = await request({
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": readEnvOr("SITE_URL", "http://localhost:3001"),
      "X-OpenRouter-Title": "LifeLink",
    },
    method: "POST",
    timeoutMs: 45_000,
    url: ENDPOINT,
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

  const completion = decodeJson(completionSchema, outcome.body);

  if (completion === null) {
    return { error: "The assistant's answer could not be read.", ok: false };
  }

  if (completion.error) {
    return { error: completion.error.message, ok: false };
  }

  const content = completion.choices[0]?.message.content ?? "";
  const parsed = decodeJson(input.schema, content);

  if (parsed === null) {
    return {
      error: "The assistant's answer did not match what was expected.",
      ok: false,
    };
  }

  return { model: completion.model ?? model, ok: true, value: parsed };
};

export { modelFor, openRouterConfigured, structuredCompletion };

export type { ChatMessage, ModelTier, StructuredResult };

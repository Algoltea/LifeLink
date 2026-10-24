/**
 * OpenRouter chat completions with GLM/Gemini and JSON-schema structured
 * output. Model identifiers come from the deployment environment so they can
 * change without code changes. Output is always re-validated with zod.
 */
import { z } from "zod";

import { readEnv, readEnvOr } from "../lib/env";
import { decodeJson, describeRejection, request } from "./http";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

type ModelTier = "fast" | "main";

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

const modelFor = (tier: ModelTier): string =>
  tier === "main"
    ? readEnvOr("OPENROUTER_MODEL", "google/gemini-4-argon")
    : readEnvOr("OPENROUTER_FAST_MODEL", "z-ai/glm-5.3-flash");

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

  const outcome = await request({
    body: JSON.stringify({
      messages: input.messages,
      model,
      provider: { require_parameters: true },
      reasoning: { effort: "low" },
      response_format: {
        json_schema: {
          name: input.schemaName,
          schema: jsonSchema,
          strict: true,
        },
        type: "json_schema",
      },
      temperature: 0.2,
    }),
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

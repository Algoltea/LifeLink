/**
 * Composio REST v3.1 adapter (fetch only, so it runs in the default Convex
 * runtime). Each person's accounts are linked under their profile id as the
 * Composio user id. Tool slugs and argument names were checked against
 * docs.composio.dev/toolkits/{gmail,outlook,googlecalendar,googledrive} in October 2026.
 */
import { z } from "zod";

import { constantTimeEqual, hmacSha256Base64 } from "../lib/crypto";
import { readEnv } from "../lib/env";
import { decodeJson, describeRejection, request } from "./http";
import type { HttpOutcome, JsonObject } from "./http";

const BASE_URL = "https://backend.composio.dev/api/v3.1";

const composioKey = (): string | null => readEnv("COMPOSIO_API_KEY");

const authConfigsSchema = z.record(z.string(), z.string());

/** Toolkit slug to auth config id, as written by `bun run dev:setup`. */
const authConfigFor = (toolkit: string): string | null => {
  const raw = readEnv("COMPOSIO_AUTH_CONFIGS");

  if (raw === null) {
    return null;
  }

  return decodeJson(authConfigsSchema, raw)?.[toolkit] ?? null;
};

const call = async (
  method: "DELETE" | "GET" | "POST",
  path: string,
  body?: JsonObject
): Promise<HttpOutcome> => {
  const apiKey = composioKey();

  if (apiKey === null) {
    return {
      body: "Composio is not configured.",
      kind: "rejected",
      status: 401,
    };
  }

  return await request({
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    method,
    timeoutMs: 30_000,
    url: `${BASE_URL}${path}`,
  });
};

const linkResponseSchema = z.object({
  connected_account_id: z.string(),
  redirect_url: z.string(),
});

type LinkResult =
  | { error: string; ok: false }
  | { connectedAccountId: string; ok: true; redirectUrl: string };

const linkAccount = async (
  userId: string,
  toolkit: string,
  callbackUrl: string
): Promise<LinkResult> => {
  const authConfigId = authConfigFor(toolkit);

  if (authConfigId === null) {
    return {
      error: `No Composio auth config for ${toolkit}. Run bun run dev:setup and enable it.`,
      ok: false,
    };
  }

  const outcome = await call("POST", "/connected_accounts/link", {
    auth_config_id: authConfigId,
    callback_url: callbackUrl,
    user_id: userId,
  });

  if (outcome.kind !== "ok") {
    return {
      error:
        outcome.kind === "rejected"
          ? describeRejection(outcome.status, outcome.body)
          : outcome.reason,
      ok: false,
    };
  }

  const parsed = decodeJson(linkResponseSchema, outcome.body);

  return parsed === null
    ? { error: "Composio's answer could not be read.", ok: false }
    : {
        connectedAccountId: parsed.connected_account_id,
        ok: true,
        redirectUrl: parsed.redirect_url,
      };
};

const connectedAccountSchema = z.object({
  id: z.string(),
  state: z
    .object({
      val: z.object({ displayName: z.string().optional() }).loose().optional(),
    })
    .loose()
    .optional(),
  status: z.string(),
  toolkit: z.object({ slug: z.string() }).loose().optional(),
  user_id: z.string().optional(),
});

type ConnectedAccount = z.infer<typeof connectedAccountSchema>;

const getConnectedAccount = async (
  id: string
): Promise<ConnectedAccount | null> => {
  const outcome = await call(
    "GET",
    `/connected_accounts/${encodeURIComponent(id)}`
  );

  return outcome.kind === "ok"
    ? decodeJson(connectedAccountSchema, outcome.body)
    : null;
};

const revokeConnectedAccount = async (id: string): Promise<boolean> => {
  const outcome = await call(
    "POST",
    `/connected_accounts/${encodeURIComponent(id)}/revoke`,
    {}
  );

  return outcome.kind === "ok";
};

const executeResponseSchema = z.object({
  data: z.unknown(),
  error: z.string().nullable().optional(),
  log_id: z.string().optional(),
  successful: z.boolean(),
});

type ToolOutcome =
  | {
      data: z.infer<typeof executeResponseSchema>["data"];
      kind: "ok";
      logId: string | null;
    }
  | { error: string; kind: "rejected" }
  | { error: string; kind: "uncertain" };

/**
 * Execute a tool for one person's connected account. Composio has no
 * idempotency key, so a timeout is "uncertain" and callers must reconcile.
 */
const executeTool = async (
  slug: string,
  userId: string,
  connectedAccountId: string,
  toolArguments: JsonObject
): Promise<ToolOutcome> => {
  const outcome = await call("POST", `/tools/execute/${slug}`, {
    arguments: toolArguments,
    connected_account_id: connectedAccountId,
    user_id: userId,
  });

  if (outcome.kind === "uncertain") {
    return { error: outcome.reason, kind: "uncertain" };
  }

  if (outcome.kind === "rejected") {
    return {
      error: describeRejection(outcome.status, outcome.body),
      kind: "rejected",
    };
  }

  const parsed = decodeJson(executeResponseSchema, outcome.body);

  if (parsed === null) {
    return { error: "Composio's answer could not be read.", kind: "uncertain" };
  }

  if (!parsed.successful) {
    return {
      error: parsed.error ?? "The service reported a failure.",
      kind: "rejected",
    };
  }

  return { data: parsed.data, kind: "ok", logId: parsed.log_id ?? null };
};

const upsertTrigger = async (
  slug: string,
  userId: string,
  connectedAccountId: string,
  triggerConfig: JsonObject
): Promise<boolean> => {
  const outcome = await call("POST", `/trigger_instances/${slug}/upsert`, {
    connected_account_id: connectedAccountId,
    trigger_config: triggerConfig,
    user_id: userId,
  });

  return outcome.kind === "ok";
};

// ── Webhook verification (Standard Webhooks headers; secret used as raw UTF-8) ──

const WEBHOOK_TOLERANCE_SECONDS = 300;

interface WebhookHeaders {
  id: string | null;
  signature: string | null;
  timestamp: string | null;
}

type WebhookCheck = { ok: false; reason: string } | { ok: true };

/** Verify `v1,<base64>` signatures over `${id}.${timestamp}.${rawBody}`. */
const verifyStandardWebhook = async (
  secretBytes: Uint8Array<ArrayBuffer>,
  headers: WebhookHeaders,
  rawBody: string,
  nowSeconds: number
): Promise<WebhookCheck> => {
  if (
    headers.id === null ||
    headers.signature === null ||
    headers.timestamp === null
  ) {
    return { ok: false, reason: "missing signature headers" };
  }

  const timestamp = Number(headers.timestamp);

  if (
    !Number.isFinite(timestamp) ||
    Math.abs(nowSeconds - timestamp) > WEBHOOK_TOLERANCE_SECONDS
  ) {
    return { ok: false, reason: "timestamp outside tolerance" };
  }

  const expected = await hmacSha256Base64(
    secretBytes,
    `${headers.id}.${headers.timestamp}.${rawBody}`
  );

  const matches = headers.signature
    .split(" ")
    .some((candidate) =>
      constantTimeEqual(candidate.replace(/^v1,/u, ""), expected)
    );

  return matches ? { ok: true } : { ok: false, reason: "signature mismatch" };
};

const composioWebhookSchema = z.object({
  data: z.record(z.string(), z.unknown()).optional(),
  id: z.string(),
  metadata: z
    .object({
      connected_account_id: z.string().optional(),
      log_id: z.string().optional(),
      trigger_slug: z.string().optional(),
      user_id: z.string().optional(),
    })
    .loose()
    .optional(),
  type: z.string(),
});

type ComposioWebhook = z.infer<typeof composioWebhookSchema>;

export {
  authConfigFor,
  composioKey,
  composioWebhookSchema,
  executeTool,
  getConnectedAccount,
  linkAccount,
  revokeConnectedAccount,
  upsertTrigger,
  verifyStandardWebhook,
};

export type { ComposioWebhook, ConnectedAccount, ToolOutcome, WebhookCheck };

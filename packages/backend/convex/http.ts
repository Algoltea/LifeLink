import { httpRouter } from "convex/server";
import { z } from "zod";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import {
  composioWebhookSchema,
  verifyStandardWebhook,
} from "./integrations/composio";
import { bridgeMessageSchema } from "./integrations/discord";
import { decodeJson } from "./integrations/http";
import { splitSender } from "./integrations/mail";
import {
  conversationFromMessage,
  photonEventSchema,
  verifyPhotonWebhook,
} from "./integrations/photon";
import {
  telegramUpdateSchema,
  webhookSecret as telegramWebhookSecret,
} from "./integrations/telegram";
import { constantTimeEqual, hmacSha256Base64 } from "./lib/crypto";
import { readEnv, readEnvOr } from "./lib/env";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

const MAX_BODY_BYTES = 256 * 1024;
const BRIDGE_TOLERANCE_SECONDS = 300;

const tooLarge = (request: Request): boolean =>
  Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES;

const standardHeaders = (request: Request) => ({
  id: request.headers.get("webhook-id"),
  signature: request.headers.get("webhook-signature"),
  timestamp: request.headers.get("webhook-timestamp"),
});

// ── Composio triggers ─────────────────────────────────────────────────────

const triggerMailSchema = z
  .object({
    body: z.string().optional(),
    bodyPreview: z.string().optional(),
    from: z
      .object({
        emailAddress: z
          .object({
            address: z.string().optional(),
            name: z.string().optional(),
          })
          .loose(),
      })
      .loose()
      .optional(),
    id: z.string().optional(),
    message_id: z.string().optional(),
    message_text: z.string().optional(),
    message_timestamp: z.string().optional(),
    receivedDateTime: z.string().optional(),
    sender: z.string().optional(),
    subject: z.string().nullable().optional(),
    thread_id: z.string().optional(),
  })
  .loose();

interface TriggerMail {
  bodyText: string;
  fromAddress: string;
  fromName: string | null;
  providerMessageId: string;
  providerThreadId: string | null;
  receivedAt: number;
  subject: string;
}

const MAX_MAIL_BODY = 20_000;

/** Map a Gmail or Outlook new-message payload to stored mail fields; null when it has no message id. */
const mailFromTrigger = (
  fields: z.infer<typeof triggerMailSchema>
): TriggerMail | null => {
  const messageId = fields.message_id ?? fields.id ?? null;

  if (messageId === null) {
    return null;
  }

  const outlookFrom = fields.from?.emailAddress;

  const sender =
    outlookFrom === undefined
      ? splitSender(fields.sender ?? "")
      : { address: outlookFrom.address ?? "", name: outlookFrom.name ?? null };

  const body = fields.message_text ?? fields.body ?? fields.bodyPreview ?? "";

  const received = Date.parse(
    fields.message_timestamp ?? fields.receivedDateTime ?? ""
  );

  return {
    bodyText: body.slice(0, MAX_MAIL_BODY),
    fromAddress: sender.address,
    fromName: sender.name,
    providerMessageId: messageId,
    providerThreadId: fields.thread_id ?? null,
    receivedAt: Number.isNaN(received) ? Date.now() : received,
    subject: fields.subject ?? "(no subject)",
  };
};

http.route({
  handler: httpAction(async (ctx, request) => {
    const secret = readEnv("COMPOSIO_WEBHOOK_SECRET");

    if (secret === null) {
      return new Response("Webhook secret not configured", { status: 503 });
    }

    if (tooLarge(request)) {
      return new Response("Payload too large", { status: 413 });
    }

    const raw = await request.text();

    const check = await verifyStandardWebhook(
      new TextEncoder().encode(secret),
      standardHeaders(request),
      raw,
      Math.floor(Date.now() / 1000)
    );

    if (!check.ok) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = decodeJson(composioWebhookSchema, raw);

    if (event === null) {
      return new Response("Unreadable event", { status: 400 });
    }

    const fields = triggerMailSchema.safeParse(event.data ?? {});

    await ctx.runMutation(internal.webhooks.composioEvent, {
      connectedAccountId: event.metadata?.connected_account_id ?? null,
      eventId: request.headers.get("webhook-id") ?? event.id,
      mail: fields.success ? mailFromTrigger(fields.data) : null,
      payload: JSON.stringify({
        metadata: event.metadata ?? null,
        type: event.type,
      }),
      triggerSlug: event.metadata?.trigger_slug ?? null,
      type: event.type,
    });

    return new Response(null, { status: 204 });
  }),
  method: "POST",
  path: "/webhooks/composio",
});

// ── Photon (iMessage) ─────────────────────────────────────────────────────

http.route({
  handler: httpAction(async (ctx, request) => {
    const secret = readEnv("SPECTRUM_WEBHOOK_SECRET");

    if (secret === null) {
      return new Response("Webhook secret not configured", { status: 503 });
    }

    if (tooLarge(request)) {
      return new Response("Payload too large", { status: 413 });
    }

    const raw = await request.text();

    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return new Response("Payload too large", { status: 413 });
    }

    const valid = await verifyPhotonWebhook(
      secret,
      {
        signature: request.headers.get("X-Spectrum-Signature"),
        timestamp: request.headers.get("X-Spectrum-Timestamp"),
      },
      raw,
      Math.floor(Date.now() / 1000)
    );

    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = decodeJson(photonEventSchema, raw);

    if (event === null) {
      return new Response("Unreadable event", { status: 400 });
    }

    const projectId = readEnv("SPECTRUM_PROJECT_ID");

    if (projectId === null) {
      return new Response("Project not configured", { status: 503 });
    }

    const { message, space } = event;

    if (
      space.id !== message.space.id ||
      space.platform !== message.space.platform ||
      space.type !== message.space.type ||
      space.phone !== message.space.phone
    ) {
      return new Response("Inconsistent conversation", { status: 400 });
    }

    await ctx.runMutation(internal.webhooks.photonEvent, {
      conversation: conversationFromMessage(message, projectId),
      eventId: `${projectId}:${message.id}`,
      messageId: message.id,
      payload: JSON.stringify({
        contentType: message.content.type,
        id: message.id,
        type: event.event,
      }),
      projectId,
      text:
        message.content.type === "text" ? (message.content.text ?? null) : null,
      type: event.event,
    });

    return new Response(null, { status: 204 });
  }),
  method: "POST",
  path: "/webhooks/photon",
});

// ── Discord Gateway bridge ────────────────────────────────────────────────

http.route({
  handler: httpAction(async (ctx, request) => {
    const secret = readEnv("BRIDGE_SHARED_SECRET");

    if (secret === null) {
      return new Response("Bridge secret not configured", { status: 503 });
    }

    if (tooLarge(request)) {
      return new Response("Payload too large", { status: 413 });
    }

    const raw = await request.text();
    const timestamp = request.headers.get("x-bridge-timestamp") ?? "";
    const signature = request.headers.get("x-bridge-signature") ?? "";
    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));

    if (!Number.isFinite(age) || age > BRIDGE_TOLERANCE_SECONDS) {
      return new Response("Stale request", { status: 401 });
    }

    const expected = await hmacSha256Base64(
      new TextEncoder().encode(secret),
      `${timestamp}.${raw}`
    );

    if (!constantTimeEqual(signature, expected)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const message = decodeJson(bridgeMessageSchema, raw);

    if (message === null) {
      return new Response("Unreadable message", { status: 400 });
    }

    const result = await ctx.runMutation(internal.webhooks.discordMessage, {
      authorId: message.authorId,
      content: message.content,
      messageId: message.messageId,
      payload: JSON.stringify({
        attachments: message.attachmentCount,
        channelId: message.channelId,
        sentAt: message.sentAt,
      }),
    });

    return Response.json({ result });
  }),
  method: "POST",
  path: "/bridge/discord",
});

// ── Telegram Bot API webhook ──────────────────────────────────────────────

http.route({
  handler: httpAction(async (ctx, request) => {
    const secret = telegramWebhookSecret();

    if (secret === null) {
      return new Response("Telegram webhook not configured", { status: 503 });
    }

    // Telegram echoes the secret set with setWebhook; anything else is not Telegram.
    const presented =
      request.headers.get("x-telegram-bot-api-secret-token") ?? "";

    if (!constantTimeEqual(presented, secret)) {
      return new Response("Invalid secret", { status: 401 });
    }

    if (tooLarge(request)) {
      return new Response("Payload too large", { status: 413 });
    }

    const update = decodeJson(telegramUpdateSchema, await request.text());
    const message = update?.message;

    // Answer 200 for updates LifeLink doesn't read, or Telegram retries them forever.
    if (update === null || message === undefined) {
      return Response.json({ result: "ignored" });
    }

    const result = await ctx.runMutation(internal.webhooks.telegramUpdate, {
      chatId: String(message.chat.id),
      chatType: message.chat.type,
      firstName: message.from?.first_name ?? null,
      fromBot: message.from?.is_bot === true,
      hasPhoto: (message.photo?.length ?? 0) > 0,
      messageId: String(message.message_id),
      // Only routing facts are stored; message text lives in the message row.
      payload: JSON.stringify({
        chatType: message.chat.type,
        date: message.date,
        hasPhoto: (message.photo?.length ?? 0) > 0,
      }),
      text: message.text ?? message.caption ?? "",
      updateId: String(update.update_id),
      username: message.from?.username ?? null,
    });

    return Response.json({ result });
  }),
  method: "POST",
  path: "/webhooks/telegram",
});

// ── Permission-checked photo delivery ─────────────────────────────────────

const corsHeaders = (): Headers =>
  new Headers({
    "Access-Control-Allow-Headers": "Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Origin": readEnvOr(
      "SITE_URL",
      "http://localhost:3001"
    ),
    Vary: "Origin",
  });

http.route({
  handler: httpAction(async () => {
    const headers = corsHeaders();

    return await Promise.resolve(new Response(null, { headers, status: 204 }));
  }),
  method: "OPTIONS",
  path: "/files/photo",
});

http.route({
  handler: httpAction(async (ctx, request) => {
    const identity = await ctx.auth.getUserIdentity();
    const photoId = new URL(request.url).searchParams.get("id") ?? "";

    if (identity === null) {
      return new Response("Sign in required", {
        headers: corsHeaders(),
        status: 401,
      });
    }

    const allowed = await ctx.runQuery(internal.photos.authorizeDownload, {
      authUserId: identity.subject,
      photoId,
    });

    if (allowed === null) {
      return new Response("Not found", { headers: corsHeaders(), status: 404 });
    }

    const blob = await ctx.storage.get(allowed.storageId);

    if (blob === null) {
      return new Response("Not found", { headers: corsHeaders(), status: 404 });
    }

    const headers = corsHeaders();

    headers.set("Cache-Control", "private, no-store");
    headers.set("Content-Type", allowed.contentType);
    headers.set("X-Content-Type-Options", "nosniff");

    return new Response(blob, { headers, status: 200 });
  }),
  method: "GET",
  path: "/files/photo",
});

export default http;

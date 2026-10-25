/**
 * Discord REST v10 adapter for direct messages. Sends use `nonce` with
 * `enforce_nonce`, which Discord de-duplicates for a few minutes; beyond that
 * window, uncertain sends are reconciled by reading the DM channel.
 * Incoming direct messages arrive from the local Gateway bridge.
 */
import { z } from "zod";

import { readEnv } from "../lib/env";
import { decodeJson, describeRejection, request } from "./http";

const BASE_URL = "https://discord.com/api/v10";

const botToken = (): string | null => readEnv("DISCORD_BOT_TOKEN");

type DiscordResult =
  | { error: string; kind: "rejected" }
  | { error: string; kind: "uncertain" }
  | { id: string; kind: "ok" };

const idSchema = z.object({ id: z.string() }).loose();

const openDmChannel = async (
  token: string,
  recipientId: string
): Promise<DiscordResult> => {
  const outcome = await request({
    body: JSON.stringify({ recipient_id: recipientId }),
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${BASE_URL}/users/@me/channels`,
  });

  if (outcome.kind === "uncertain") {
    return { error: outcome.reason, kind: "uncertain" };
  }

  if (outcome.kind === "rejected") {
    const hint =
      outcome.status === 403
        ? " The person may need to share a server with the bot or message it first."
        : "";

    return {
      error: `${describeRejection(outcome.status, outcome.body)}${hint}`,
      kind: "rejected",
    };
  }

  const parsed = decodeJson(idSchema, outcome.body);

  return parsed === null
    ? { error: "Discord's answer could not be read.", kind: "uncertain" }
    : { id: parsed.id, kind: "ok" };
};

/** Discord nonces are at most 25 characters; derive a stable one from the idempotency key. */
const nonceFor = async (idempotencyKey: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(idempotencyKey)
  );

  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 25);
};

interface DiscordPhoto {
  bytes: ArrayBuffer;
  contentType: string;
}

const sendDirectMessage = async (
  token: string,
  channelId: string,
  content: string,
  idempotencyKey: string,
  photos: DiscordPhoto[]
): Promise<DiscordResult> => {
  const payload = {
    attachments: photos.map((_photo, index) => ({
      filename: `photo-${index + 1}.jpg`,
      id: index,
    })),
    content,
    enforce_nonce: true,
    nonce: await nonceFor(idempotencyKey),
  };

  const form = new FormData();

  form.append("payload_json", JSON.stringify(payload));

  for (const [index, photo] of photos.entries()) {
    form.append(
      `files[${index}]`,
      new Blob([photo.bytes], { type: photo.contentType }),
      `photo-${index + 1}.jpg`
    );
  }

  const outcome = await request({
    body: form,
    headers: { Authorization: `Bot ${token}` },
    method: "POST",
    timeoutMs: 45_000,
    url: `${BASE_URL}/channels/${channelId}/messages`,
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

  const parsed = decodeJson(idSchema, outcome.body);

  return parsed === null
    ? { error: "Discord's answer could not be read.", kind: "uncertain" }
    : { id: parsed.id, kind: "ok" };
};

const recentSchema = z.array(
  z
    .object({
      author: z.object({ bot: z.boolean().optional(), id: z.string() }).loose(),
      content: z.string(),
      id: z.string(),
      nonce: z.union([z.string(), z.number()]).nullish(),
      timestamp: z.string(),
    })
    .loose()
);

type DiscordLookup =
  | { found: false }
  | { found: true; id: string }
  | { found: null };

const RECONCILIATION_PAGE_SIZE = 50;
const MAX_RECONCILIATION_PAGES = 5;

const lookupPage = (
  messages: z.infer<typeof recentSchema>,
  content: string,
  sinceMs: number,
  expectedNonce: string
): DiscordLookup | null => {
  const timestamps = messages.map((message) => Date.parse(message.timestamp));

  if (timestamps.some((timestamp) => !Number.isFinite(timestamp))) {
    return { found: null };
  }

  const recentBotMessages = messages.filter(
    (message, index) =>
      message.author.bot === true && (timestamps[index] ?? 0) >= sinceMs
  );

  const matches = recentBotMessages.filter(
    (message) => String(message.nonce) === expectedNonce
  );

  const [match] = matches;

  if (match !== undefined) {
    return matches.length === 1 && match.content === content
      ? { found: true, id: match.id }
      : { found: null };
  }

  // Discord's message nonce is optional. Missing identity cannot prove absence.
  if (
    recentBotMessages.some(
      (message) => message.nonce === null || message.nonce === undefined
    )
  ) {
    return { found: null };
  }

  if (
    messages.length < RECONCILIATION_PAGE_SIZE ||
    timestamps.some((timestamp) => timestamp < sinceMs)
  ) {
    return { found: false };
  }

  return null;
};

/** Reconcile only a message bearing the same stable nonce as this action's send. */
const findSentMessage = async (
  token: string,
  channelId: string,
  content: string,
  sinceMs: number,
  idempotencyKey: string
): Promise<DiscordLookup> => {
  const expectedNonce = await nonceFor(idempotencyKey);

  let before: string | null = null;

  for (let page = 0; page < MAX_RECONCILIATION_PAGES; page += 1) {
    const cursor =
      before === null ? "" : `&before=${encodeURIComponent(before)}`;

    // oxlint-disable-next-line no-await-in-loop -- Each page needs the preceding page's oldest message ID.
    const outcome = await request({
      headers: { Authorization: `Bot ${token}` },
      method: "GET",
      url: `${BASE_URL}/channels/${channelId}/messages?limit=${RECONCILIATION_PAGE_SIZE}${cursor}`,
    });

    if (outcome.kind !== "ok") {
      return { found: null };
    }

    const messages = decodeJson(recentSchema, outcome.body);

    if (messages === null) {
      return { found: null };
    }

    const result = lookupPage(messages, content, sinceMs, expectedNonce);

    if (result !== null) {
      return result;
    }

    const next = messages.at(-1)?.id;

    if (next === undefined || next === before) {
      return { found: null };
    }

    before = next;
  }

  // A bounded or interrupted history scan cannot establish that a send failed.
  return { found: null };
};

const validateDiscord = async (token: string): Promise<boolean> => {
  const outcome = await request({
    headers: { Authorization: `Bot ${token}` },
    method: "GET",
    url: `${BASE_URL}/users/@me`,
  });

  return outcome.kind === "ok";
};

/** Payload the local Gateway bridge forwards for each direct message. */
const bridgeMessageSchema = z.object({
  attachmentCount: z.number(),
  authorId: z.string(),
  channelId: z.string(),
  content: z.string(),
  messageId: z.string(),
  sentAt: z.string(),
});

type BridgeMessage = z.infer<typeof bridgeMessageSchema>;

export {
  botToken,
  bridgeMessageSchema,
  findSentMessage,
  openDmChannel,
  sendDirectMessage,
  validateDiscord,
};

export type { BridgeMessage, DiscordPhoto, DiscordResult };

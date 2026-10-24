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
      timestamp: z.string(),
    })
    .loose()
);

type DiscordLookup =
  | { found: false }
  | { found: true; id: string }
  | { found: null };

/** After an uncertain send, look for the exact text sent by the bot since the attempt began. */
const findSentMessage = async (
  token: string,
  channelId: string,
  content: string,
  sinceMs: number
): Promise<DiscordLookup> => {
  const outcome = await request({
    headers: { Authorization: `Bot ${token}` },
    method: "GET",
    url: `${BASE_URL}/channels/${channelId}/messages?limit=50`,
  });

  if (outcome.kind !== "ok") {
    return { found: null };
  }

  const messages = decodeJson(recentSchema, outcome.body);

  if (messages === null) {
    return { found: null };
  }

  const match = messages.find(
    (message) =>
      message.author.bot === true &&
      message.content === content &&
      Date.parse(message.timestamp) >= sinceMs - 60_000
  );

  return match === undefined ? { found: false } : { found: true, id: match.id };
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

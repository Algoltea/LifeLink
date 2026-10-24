/**
 * Telegram Bot API adapter. The token is part of every request URL, so URLs
 * never leave this file: errors are built from Telegram's own description,
 * which does not echo the token.
 *
 * Telegram has no idempotency key and a bot cannot read its chat history, so
 * an uncertain send stays unknown until the person confirms what happened.
 */
import { z } from "zod";

import { readEnv } from "../lib/env";
import { decodeJson, request } from "./http";

const API = "https://api.telegram.org";

/** A photo caption is limited by Telegram; longer messages must be sent without photos. */
const TELEGRAM_CAPTION_LIMIT = 1024;
const TELEGRAM_TEXT_LIMIT = 4096;

const botToken = (): string | null => readEnv("TELEGRAM_BOT_TOKEN");

const botUsername = (): string | null =>
  readEnv("TELEGRAM_BOT_USERNAME")?.replace(/^@/u, "") ?? null;

const webhookSecret = (): string | null => readEnv("TELEGRAM_WEBHOOK_SECRET");

const methodUrl = (token: string, method: string): string =>
  `${API}/bot${token}/${method}`;

type TelegramResult =
  | { error: string; kind: "rejected" }
  | { error: string; kind: "uncertain" }
  | { id: string; kind: "ok" };

const errorSchema = z
  .object({ description: z.string().optional(), error_code: z.number() })
  .loose();

const sentSchema = z
  .object({
    ok: z.literal(true),
    result: z.union([
      z.object({ message_id: z.number() }).loose(),
      z.array(z.object({ message_id: z.number() }).loose()),
    ]),
  })
  .loose();

/** Telegram's own words for a refusal, with a plain hint for the common cases. */
const describeRefusal = (status: number, body: string): string => {
  const parsed = decodeJson(errorSchema, body);
  const description = parsed?.description?.slice(0, 200) ?? "";

  if (status === 403) {
    return "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.";
  }

  if (status === 429) {
    return "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.";
  }

  return description
    ? `Telegram refused the message (${status}): ${description}`
    : `Telegram refused the message (${status}).`;
};

interface TelegramPhoto {
  bytes: ArrayBuffer;
  contentType: string;
}

const firstMessageId = (body: string): string | null => {
  const parsed = decodeJson(sentSchema, body);

  if (parsed === null) {
    return null;
  }

  const first = Array.isArray(parsed.result) ? parsed.result[0] : parsed.result;

  return first === undefined ? null : String(first.message_id);
};

/** Text alone, one photo with a caption, or an album with the caption on its first photo: always one request. */
const sendTelegramMessage = async (
  token: string,
  chatId: string,
  text: string,
  photos: TelegramPhoto[]
): Promise<TelegramResult> => {
  let outcome: Awaited<ReturnType<typeof request>>;

  if (photos.length === 0) {
    outcome = await request({
      body: JSON.stringify({ chat_id: chatId, text }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      url: methodUrl(token, "sendMessage"),
    });
  } else {
    const single = photos.length === 1;
    const form = new FormData();

    form.append("chat_id", chatId);

    for (const [index, photo] of photos.entries()) {
      form.append(
        single ? "photo" : `photo${index}`,
        new Blob([photo.bytes], { type: photo.contentType }),
        `photo-${index + 1}.jpg`
      );
    }

    if (single) {
      form.append("caption", text);
    } else {
      const media: { caption?: string; media: string; type: "photo" }[] =
        photos.map((_photo, index) => ({
          media: `attach://photo${index}`,
          type: "photo",
        }));

      // The album's caption rides on its first photo.
      if (media[0] !== undefined) {
        media[0].caption = text;
      }

      form.append("media", JSON.stringify(media));
    }

    outcome = await request({
      body: form,
      method: "POST",
      timeoutMs: 45_000,
      url: methodUrl(token, single ? "sendPhoto" : "sendMediaGroup"),
    });
  }

  if (outcome.kind === "uncertain") {
    return { error: outcome.reason, kind: "uncertain" };
  }

  if (outcome.kind === "rejected") {
    return {
      error: describeRefusal(outcome.status, outcome.body),
      kind: "rejected",
    };
  }

  const id = firstMessageId(outcome.body);

  return id === null
    ? { error: "Telegram's answer could not be read.", kind: "uncertain" }
    : { id, kind: "ok" };
};

/** A short service notice (link confirmations). Best effort: failures are only reported. */
const sendTelegramNotice = async (
  token: string,
  chatId: string,
  text: string
): Promise<boolean> => {
  const outcome = await request({
    body: JSON.stringify({ chat_id: chatId, text }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    url: methodUrl(token, "sendMessage"),
  });

  return outcome.kind === "ok";
};

/** The parts of a Telegram update LifeLink reads. Everything else is ignored. */
const telegramUpdateSchema = z
  .object({
    message: z
      .object({
        caption: z.string().optional(),
        chat: z.object({ id: z.number(), type: z.string() }).loose(),
        date: z.number(),
        from: z
          .object({
            first_name: z.string().optional(),
            id: z.number(),
            is_bot: z.boolean().optional(),
            language_code: z.string().optional(),
            username: z.string().optional(),
          })
          .loose()
          .optional(),
        message_id: z.number(),
        photo: z.array(z.unknown()).optional(),
        text: z.string().optional(),
      })
      .loose()
      .optional(),
    update_id: z.number(),
  })
  .loose();

type TelegramUpdate = z.infer<typeof telegramUpdateSchema>;

/** Start-link codes use Telegram's deep-link alphabet. */
const START_CODE_PATTERN = /^\/start(?:@\w+)?\s+(?<code>[\w-]{16,64})\s*$/u;

const startCodeOf = (text: string): string | null =>
  START_CODE_PATTERN.exec(text.trim())?.groups?.code ?? null;

export {
  botToken,
  botUsername,
  sendTelegramMessage,
  sendTelegramNotice,
  startCodeOf,
  TELEGRAM_CAPTION_LIMIT,
  TELEGRAM_TEXT_LIMIT,
  telegramUpdateSchema,
  webhookSecret,
};

export type { TelegramPhoto, TelegramResult, TelegramUpdate };

import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { audit } from "./audit";

type ReaderCtx = MutationCtx | QueryCtx;

/** Telegram usernames: 5–32 letters, digits, or underscores, starting with a letter. */
const USERNAME_PATTERN = /^[a-z]\w{4,31}$/iu;
const USERNAME_PREFIX = /^(?:https?:\/\/)?(?:t\.me\/|telegram\.me\/)?@?/iu;

/** "@Sam_A", "t.me/Sam_A", or "Sam_A" become "sam_a"; usernames ignore case. */
const normalizeTelegramUsername = (raw: string): string => {
  const username = raw.trim().replace(USERNAME_PREFIX, "").toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    throw new ConvexError({
      code: "invalid",
      message:
        "A Telegram username has 5 to 32 letters, numbers, or underscores, like @sam_alvarez. Leave it blank to link with a one-time link instead.",
    });
  }

  return username;
};

const telegramLinkOf = async (
  ctx: ReaderCtx,
  contactId: Id<"contacts">
): Promise<Doc<"telegramLinks"> | null> =>
  await ctx.db
    .query("telegramLinks")
    .withIndex("by_contact", (index) => index.eq("contactId", contactId))
    .unique();

/**
 * The Telegram chat this contact proved is theirs, by opening their one-time
 * link or by starting the bot from the username saved for them. Only this
 * chat may be saved as, or sent to as, their Telegram address.
 */
const verifiedTelegramChat = async (
  ctx: ReaderCtx,
  contactId: Id<"contacts">
): Promise<string | null> => {
  const link = await telegramLinkOf(ctx, contactId);

  return link?.chatId ?? null;
};

/** Channels with the Telegram chat set as given, honouring "prefer Telegram". */
const withTelegramChannel = (
  channels: Doc<"contacts">["channels"],
  chatId: string | null,
  preferTelegram: boolean
): Doc<"contacts">["channels"] => {
  const others = channels.filter((channel) => channel.channel !== "telegram");

  if (chatId === null) {
    return others;
  }

  const preferred =
    preferTelegram || !others.some((channel) => channel.preferred);

  return [
    ...others.map((channel) => ({
      ...channel,
      preferred: preferred ? false : channel.preferred,
    })),
    { address: chatId, channel: "telegram" as const, preferred },
  ];
};

/** Bind a proven chat to the contact its link belongs to. */
const bindTelegramChat = async (
  ctx: MutationCtx,
  link: Doc<"telegramLinks">,
  chat: { chatId: string; firstName: string | null; username: string | null }
): Promise<Doc<"contacts"> | null> => {
  const contact = await ctx.db.get(link.contactId);

  if (contact === null) {
    return null;
  }

  // Codes are single-use, and a bound username stops matching new chats.
  await ctx.db.patch(link._id, {
    chatId: chat.chatId,
    code: null,
    codeExpiresAt: null,
    expectedUsername: null,
    firstName: chat.firstName,
    linkedAt: Date.now(),
    username: chat.username,
  });
  await ctx.db.patch(contact._id, {
    channels: withTelegramChannel(
      contact.channels,
      chat.chatId,
      link.preferred === true
    ),
  });
  await audit(ctx, {
    actor: "provider",
    detail: `${contact.name} linked their Telegram.`,
    event: "contact.telegram_linked",
    ownerId: link.ownerId,
  });

  return contact;
};

/** What the contact form asks for: a username to wait for, and whether Telegram is preferred. */
interface TelegramChoice {
  preferred: boolean;
  username: string | null;
}

/**
 * Apply the form's Telegram choice. A linked chat is kept while the username
 * still matches (or none is given); a new username drops the old chat until
 * that person starts the bot. `null` removes Telegram entirely.
 */
const applyTelegramChoice = async (
  ctx: MutationCtx,
  contact: Doc<"contacts">,
  choice: TelegramChoice | null
): Promise<void> => {
  const link = await telegramLinkOf(ctx, contact._id);

  if (choice === null) {
    if (link !== null) {
      await ctx.db.delete(link._id);
    }

    await ctx.db.patch(contact._id, {
      channels: withTelegramChannel(contact.channels, null, false),
    });

    return;
  }

  const username =
    choice.username === null || choice.username.trim() === ""
      ? null
      : normalizeTelegramUsername(choice.username);

  const keepsChat =
    link?.chatId !== null &&
    link?.chatId !== undefined &&
    (username === null || link.username?.toLowerCase() === username);

  const chatId = keepsChat ? (link?.chatId ?? null) : null;

  await (link === null
    ? ctx.db.insert("telegramLinks", {
        chatId: null,
        code: null,
        codeExpiresAt: null,
        contactId: contact._id,
        createdAt: Date.now(),
        expectedUsername: username,
        firstName: null,
        linkedAt: null,
        ownerId: contact.ownerId,
        preferred: choice.preferred,
        username: null,
      })
    : ctx.db.patch(link._id, {
        chatId,
        expectedUsername: keepsChat ? null : username,
        firstName: keepsChat ? link.firstName : null,
        linkedAt: keepsChat ? link.linkedAt : null,
        preferred: choice.preferred,
        username: keepsChat ? link.username : null,
      }));

  await ctx.db.patch(contact._id, {
    channels: withTelegramChannel(contact.channels, chatId, choice.preferred),
  });
};

export {
  applyTelegramChoice,
  bindTelegramChat,
  normalizeTelegramUsername,
  telegramLinkOf,
  verifiedTelegramChat,
};

export type { TelegramChoice };

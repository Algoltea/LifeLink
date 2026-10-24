/**
 * Incoming provider events. Every event is authenticated by the HTTP route,
 * recorded once under a provider-scoped dedupe key, then processed. A repeat
 * delivery returns early. Incoming content is data: it can add a message or
 * an email, never approve, confirm, spend, or change permissions.
 */
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { startCodeOf } from "./integrations/telegram";
import { readEnv } from "./lib/env";
import {
  acceptImessageConversation,
  conversationValidator,
} from "./lib/imessage";
import { recordIncoming } from "./lib/incoming";
import { bindTelegramChat } from "./lib/telegram";

const MAX_PAYLOAD = 4000;
const START_COMMAND = /^\/start\b/u;

type Provider = "composio" | "discord" | "photon" | "telegram";

/** Insert the event once. Returns null when the same event was already recorded. */
const recordEvent = async (
  ctx: MutationCtx,
  provider: Provider,
  dedupeKey: string,
  eventType: string,
  payload: string
): Promise<Id<"incomingEvents"> | null> => {
  const existing = await ctx.db
    .query("incomingEvents")
    .withIndex("by_dedupe_key", (index) =>
      index.eq("provider", provider).eq("dedupeKey", dedupeKey)
    )
    .first();

  if (existing !== null) {
    return null;
  }

  return await ctx.db.insert("incomingEvents", {
    dedupeKey,
    error: null,
    eventType,
    mode: "live",
    ownerId: null,
    payload: payload.slice(0, MAX_PAYLOAD),
    processedAt: null,
    provider,
    receivedAt: Date.now(),
    status: "pending",
    verified: true,
  });
};

const settle = async (
  ctx: MutationCtx,
  eventId: Id<"incomingEvents">,
  status: "failed" | "ignored" | "processed",
  ownerId: Id<"profiles"> | null,
  error: string | null = null
): Promise<void> => {
  await ctx.db.patch(eventId, {
    error,
    ownerId,
    processedAt: Date.now(),
    status,
  });
};

/**
 * Find the contacts whose channel address matches. A shared iMessage line or
 * bot can serve several households, so when more than one person has this
 * contact, the one with an open ride task waiting for them wins, then the most
 * recent conversation. (Linear scan: fine for household-scale deployments.)
 */
const routeToContact = async (
  ctx: MutationCtx,
  channel: "discord" | "imessage" | "telegram",
  address: string
): Promise<Doc<"contacts"> | null> => {
  const normalized = address.trim().toLowerCase();

  const everyone = await ctx.db.query("contacts").collect();

  const contacts = everyone.filter((contact) =>
    contact.channels.some(
      (item) =>
        item.channel === channel &&
        item.address.trim().toLowerCase() === normalized
    )
  );

  if (contacts.length <= 1) {
    return contacts[0] ?? null;
  }

  const candidates = await Promise.all(
    contacts.map(async (contact) => {
      const waiting = await ctx.db
        .query("tasks")
        .withIndex("by_contact_status", (index) =>
          index.eq("contactId", contact._id).eq("status", "waiting_for_reply")
        )
        .first();

      const lastMessage = await ctx.db
        .query("messages")
        .withIndex("by_owner_contact", (index) =>
          index.eq("ownerId", contact.ownerId).eq("contactId", contact._id)
        )
        .order("desc")
        .first();

      return {
        contact,
        last: lastMessage?.createdAt ?? 0,
        waiting: waiting !== null,
      };
    })
  );

  const ranked = candidates.toSorted(
    (left, right) =>
      Number(right.waiting) - Number(left.waiting) || right.last - left.last
  );

  return ranked[0]?.contact ?? null;
};

// ── Composio ──────────────────────────────────────────────────────────────

const mailArgs = v.object({
  bodyText: v.string(),
  fromAddress: v.string(),
  fromName: v.union(v.string(), v.null()),
  providerMessageId: v.string(),
  providerThreadId: v.union(v.string(), v.null()),
  receivedAt: v.number(),
  subject: v.string(),
});

export const composioEvent = internalMutation({
  args: {
    connectedAccountId: v.union(v.string(), v.null()),
    eventId: v.string(),
    mail: v.union(mailArgs, v.null()),
    payload: v.string(),
    triggerSlug: v.union(v.string(), v.null()),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await recordEvent(
      ctx,
      "composio",
      args.eventId,
      args.triggerSlug ?? args.type,
      args.payload
    );

    if (eventId === null) {
      return "duplicate";
    }

    const connection =
      args.connectedAccountId === null
        ? null
        : await ctx.db
            .query("connections")
            .withIndex("by_external_account", (index) =>
              index.eq("externalAccountId", args.connectedAccountId)
            )
            .first();

    if (connection === null) {
      await settle(
        ctx,
        eventId,
        "ignored",
        null,
        "No connection matches this event."
      );

      return "ignored";
    }

    if (args.type === "composio.connected_account.expired") {
      await ctx.db.patch(connection._id, {
        lastError: "The provider asked to reconnect.",
        status: "expired",
        updatedAt: Date.now(),
      });
      await settle(ctx, eventId, "processed", connection.ownerId);

      return "processed";
    }

    if (args.type !== "composio.trigger.message" || args.mail === null) {
      await settle(ctx, eventId, "ignored", connection.ownerId);

      return "ignored";
    }

    await ctx.scheduler.runAfter(0, internal.emails.storeFromTrigger, {
      connectionId: connection._id,
      mail: args.mail,
    });
    await settle(ctx, eventId, "processed", connection.ownerId);

    return "processed";
  },
});

// ── Photon (iMessage) ─────────────────────────────────────────────────────

export const photonEvent = internalMutation({
  args: {
    conversation: v.union(conversationValidator, v.null()),
    eventId: v.string(),
    messageId: v.string(),
    payload: v.string(),
    projectId: v.string(),
    text: v.union(v.string(), v.null()),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await recordEvent(
      ctx,
      "photon",
      args.eventId,
      args.type,
      args.payload
    );

    if (eventId === null) {
      return "duplicate";
    }

    if (args.projectId !== readEnv("SPECTRUM_PROJECT_ID")) {
      await settle(ctx, eventId, "ignored", null);

      return "ignored";
    }

    if (
      args.type !== "messages" ||
      args.conversation === null ||
      args.conversation.projectId !== args.projectId ||
      args.conversation.messageId !== args.messageId
    ) {
      await settle(ctx, eventId, "ignored", null);

      return "ignored";
    }

    const enrollment = await acceptImessageConversation(ctx, args.conversation);

    if (enrollment === null) {
      await settle(
        ctx,
        eventId,
        "ignored",
        null,
        "The conversation does not match an enrolled iMessage contact."
      );

      return "ignored";
    }

    if (args.text !== null) {
      await recordIncoming(ctx, {
        body: args.text,
        channel: "imessage",
        contactId: enrollment.contactId,
        mode: "live",
        ownerId: enrollment.ownerId,
        photoIds: [],
        providerMessageId: `photon:${args.messageId}`,
      });
    }

    await settle(ctx, eventId, "processed", enrollment.ownerId);

    return "processed";
  },
});

// ── Discord (forwarded by the local Gateway bridge) ───────────────────────

export const discordMessage = internalMutation({
  args: {
    authorId: v.string(),
    content: v.string(),
    messageId: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await recordEvent(
      ctx,
      "discord",
      args.messageId,
      "MESSAGE_CREATE",
      args.payload
    );

    if (eventId === null) {
      return "duplicate";
    }

    const contact = await routeToContact(ctx, "discord", args.authorId);

    if (contact === null || args.content.trim().length === 0) {
      await settle(
        ctx,
        eventId,
        "ignored",
        null,
        contact === null
          ? "The sender is not in anyone's contacts."
          : "Empty message."
      );

      return "ignored";
    }

    await recordIncoming(ctx, {
      body: args.content,
      channel: "discord",
      contactId: contact._id,
      mode: "live",
      ownerId: contact.ownerId,
      photoIds: [],
      providerMessageId: `discord:${args.messageId}`,
    });
    await settle(ctx, eventId, "processed", contact.ownerId);

    return "processed";
  },
});

// ── Telegram (webhook, secret-token checked by the HTTP route) ────────────

const notifyTelegram = async (
  ctx: MutationCtx,
  chatId: string,
  text: string
): Promise<void> => {
  await ctx.scheduler.runAfter(0, internal.telegram.notify, { chatId, text });
};

interface TelegramChat {
  chatId: string;
  firstName: string | null;
  username: string | null;
}

/** `/start <code>`: the one contact the code was made for, or null when unknown or expired. */
const linkByCode = async (
  ctx: MutationCtx,
  code: string,
  chat: TelegramChat
): Promise<Doc<"telegramLinks"> | null> => {
  const link = await ctx.db
    .query("telegramLinks")
    .withIndex("by_code", (index) => index.eq("code", code))
    .unique();

  if (
    link === null ||
    link.codeExpiresAt === null ||
    link.codeExpiresAt < Date.now()
  ) {
    return null;
  }

  return (await bindTelegramChat(ctx, link, chat)) === null ? null : link;
};

/** Contacts saved with this chat's Telegram username and not linked yet. Telegram verifies usernames. */
const linkByUsername = async (
  ctx: MutationCtx,
  chat: TelegramChat
): Promise<Doc<"telegramLinks">[]> => {
  if (chat.username === null) {
    return [];
  }

  const waiting = await ctx.db
    .query("telegramLinks")
    .withIndex("by_expected_username", (index) =>
      index.eq("expectedUsername", chat.username?.toLowerCase())
    )
    .collect();

  const bound: Doc<"telegramLinks">[] = [];

  for (const link of waiting.filter((item) => item.chatId === null)) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- each binding patches its own contact, in order.
    if ((await bindTelegramChat(ctx, link, chat)) !== null) {
      bound.push(link);
    }
  }

  return bound;
};

const connectedNotice = async (
  ctx: MutationCtx,
  links: Doc<"telegramLinks">[]
): Promise<string> => {
  const owners = await Promise.all(
    links.map(async (link) => await ctx.db.get(link.ownerId))
  );

  const names = [
    ...new Set(owners.flatMap((owner) => (owner ? [owner.preferredName] : []))),
  ];

  return `You're connected. Messages from ${names.join(" and ") || "your family member"} will arrive here, and your replies go back to them.`;
};

/** A bare `/start` from a chat nobody is waiting for: explain how to get connected. */
const startHelp = (chat: TelegramChat, alreadyLinked: boolean): string => {
  if (alreadyLinked) {
    return "You're already connected. Anything you send here goes to your family member in LifeLink.";
  }

  const username = chat.username === null ? "" : ` @${chat.username}`;

  return `Hi${chat.firstName ? ` ${chat.firstName}` : ""}! To connect, ask your family member to add your Telegram username${username} in LifeLink, or to send you their LifeLink link. Then tap Start again.`;
};

/** Link this chat by code and by username. Returns what got linked, or null for a dead code. */
const linkTelegramChat = async (
  ctx: MutationCtx,
  text: string,
  chat: TelegramChat
): Promise<Doc<"telegramLinks">[] | null> => {
  const code = START_COMMAND.test(text.trim()) ? startCodeOf(text) : null;
  const bound: Doc<"telegramLinks">[] = [];

  if (code !== null) {
    const link = await linkByCode(ctx, code, chat);

    if (link === null) {
      return null;
    }

    bound.push(link);
  }

  bound.push(...(await linkByUsername(ctx, chat)));

  if (bound.length > 0) {
    await notifyTelegram(ctx, chat.chatId, await connectedNotice(ctx, bound));
  }

  return bound;
};

export const telegramUpdate = internalMutation({
  args: {
    chatId: v.string(),
    chatType: v.string(),
    firstName: v.union(v.string(), v.null()),
    fromBot: v.boolean(),
    hasPhoto: v.boolean(),
    messageId: v.string(),
    payload: v.string(),
    text: v.string(),
    updateId: v.string(),
    username: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const eventId = await recordEvent(
      ctx,
      "telegram",
      args.updateId,
      "message",
      args.payload
    );

    if (eventId === null) {
      return "duplicate";
    }

    // Only one-to-one chats with real people; groups and bots never reach a household.
    if (args.chatType !== "private" || args.fromBot) {
      await settle(ctx, eventId, "ignored", null, "Not a private chat.");

      return "ignored";
    }

    const chat = {
      chatId: args.chatId,
      firstName: args.firstName,
      username: args.username,
    };

    const bound = await linkTelegramChat(ctx, args.text, chat);

    if (bound === null) {
      await notifyTelegram(
        ctx,
        args.chatId,
        "This link has expired or was already used. Ask the person who uses LifeLink to send you a new one."
      );
      await settle(ctx, eventId, "ignored", null, "Unknown or expired link.");

      return "ignored";
    }

    const contact = await routeToContact(ctx, "telegram", args.chatId);

    // `/start` is only ever a way in, never a message to the family.
    if (START_COMMAND.test(args.text.trim())) {
      if (bound.length === 0) {
        await notifyTelegram(
          ctx,
          args.chatId,
          startHelp(chat, contact !== null)
        );
      }

      await settle(
        ctx,
        eventId,
        bound.length > 0 ? "processed" : "ignored",
        bound[0]?.ownerId ?? contact?.ownerId ?? null
      );

      return bound.length > 0 ? "processed" : "ignored";
    }

    const body =
      args.text.trim() ||
      (args.hasPhoto ? "(Sent a photo. Open Telegram to see it.)" : "");

    if (contact === null || body.length === 0) {
      await settle(
        ctx,
        eventId,
        "ignored",
        null,
        contact === null
          ? "The chat is not linked to anyone's contact."
          : "Empty message."
      );

      return "ignored";
    }

    await recordIncoming(ctx, {
      body,
      channel: "telegram",
      contactId: contact._id,
      mode: "live",
      ownerId: contact.ownerId,
      photoIds: [],
      providerMessageId: `telegram:${args.chatId}:${args.messageId}`,
    });
    await settle(ctx, eventId, "processed", contact.ownerId);

    return "processed";
  },
});

/**
 * Linking a contact to Telegram. The owner shares a one-time link; when the
 * contact taps Start, Telegram sends `/start <code>` to the webhook, which
 * binds that chat to this contact (see webhooks.telegramUpdate).
 */
import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalAction, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import {
  botToken,
  botUsername,
  sendTelegramNotice,
  webhookSecret,
} from "./integrations/telegram";
import { audit } from "./lib/audit";
import { developerConfigured } from "./lib/capabilities";
import { requireOwned, requireOwner } from "./lib/session";

const LINK_LIFETIME_MS = 3 * 24 * 60 * 60 * 1000;

/** Sending needs the token; linking and replies also need the webhook and the bot's name. */
const linkingReady = (): boolean =>
  developerConfigured("telegram") &&
  botUsername() !== null &&
  webhookSecret() !== null;

/** 18 random bytes as base64url: 24 characters, valid in a Telegram start link. */
const newCode = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(18));

  return btoa(String.fromCodePoint(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const linkOf = async (
  ctx: MutationCtx,
  contactId: Doc<"contacts">["_id"]
): Promise<Doc<"telegramLinks"> | null> =>
  await ctx.db
    .query("telegramLinks")
    .withIndex("by_contact", (index) => index.eq("contactId", contactId))
    .unique();

export const status = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_contact", (index) => index.eq("contactId", contact._id))
      .unique();

    const username = botUsername();

    // Linked means the contact still uses the verified chat; removing it in the form unlinks.
    const linked =
      link?.chatId !== null &&
      link?.chatId !== undefined &&
      contact.channels.some(
        (channel) =>
          channel.channel === "telegram" && channel.address === link.chatId
      );

    const pending =
      link?.code !== null &&
      link?.code !== undefined &&
      link.codeExpiresAt !== null &&
      link.codeExpiresAt > Date.now() &&
      username !== null;

    return {
      botUrl: username === null ? null : `https://t.me/${username}`,
      configured: linkingReady(),
      expectedUsername: link?.expectedUsername ?? null,
      linked: linked
        ? {
            firstName: link.firstName,
            linkedAt: link.linkedAt,
            username: link.username,
          }
        : null,
      pending: pending
        ? {
            expiresAt: link.codeExpiresAt,
            url: `https://t.me/${username}?start=${link.code}`,
          }
        : null,
    };
  },
});

/** A fresh one-time link. Any earlier unused link for this person stops working. */
export const createLink = mutation({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    if (!linkingReady()) {
      throw new ConvexError({
        code: "blocked",
        message:
          "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.",
      });
    }

    const code = newCode();
    const codeExpiresAt = Date.now() + LINK_LIFETIME_MS;
    const existing = await linkOf(ctx, contact._id);

    await (existing === null
      ? ctx.db.insert("telegramLinks", {
          chatId: null,
          code,
          codeExpiresAt,
          contactId: contact._id,
          createdAt: Date.now(),
          expectedUsername: null,
          firstName: null,
          linkedAt: null,
          ownerId: owner._id,
          preferred: false,
          username: null,
        })
      : ctx.db.patch(existing._id, { code, codeExpiresAt }));

    await audit(ctx, {
      actor: "person",
      detail: `Made a Telegram link for ${contact.name}.`,
      event: "contact.telegram_link_created",
      ownerId: owner._id,
    });
  },
});

/** Forget the linked chat. LifeLink stops sending to it and ignores its messages. */
export const unlink = mutation({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const existing = await linkOf(ctx, contact._id);

    if (existing !== null) {
      await ctx.db.delete(existing._id);
    }

    await ctx.db.patch(contact._id, {
      channels: contact.channels.filter(
        (channel) => channel.channel !== "telegram"
      ),
    });
    await audit(ctx, {
      actor: "person",
      detail: `Unlinked ${contact.name}'s Telegram.`,
      event: "contact.telegram_unlinked",
      ownerId: owner._id,
    });
  },
});

/** Short service replies (link confirmed or expired). Never used for approved messages. */
export const notify = internalAction({
  args: { chatId: v.string(), text: v.string() },
  handler: async (_ctx, args): Promise<void> => {
    const token = botToken();

    if (token !== null) {
      await sendTelegramNotice(token, args.chatId, args.text);
    }
  },
});

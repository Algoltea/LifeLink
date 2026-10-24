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
import { readEnv } from "./lib/env";
import {
  acceptImessageConversation,
  conversationValidator,
} from "./lib/imessage";
import { recordIncoming } from "./lib/incoming";

const MAX_PAYLOAD = 4000;

type Provider = "composio" | "discord" | "photon";

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
  channel: "discord" | "imessage",
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

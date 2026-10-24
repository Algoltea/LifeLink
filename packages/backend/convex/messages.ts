import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { recordIncoming } from "./lib/incoming";
import { channelFor, createTask, firstName } from "./lib/journey";
import { createAction } from "./lib/lifecycle";
import { requireOwned, requireOwner, requireProfile } from "./lib/session";

const MAX_PHOTOS = 4;

/** Display-only: shown with the review, never part of what is approved. */
export const SUGGESTION_RATIONALE =
  "Started from a suggested reply. You can change every word before approving it.";

const startedFromValidator = v.optional(v.literal("suggestion"));

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

/** People with their last message and how many messages to them await approval, for the Messages list. */
export const threads = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .collect();

    return await Promise.all(
      contacts.map(async (contact) => {
        const last = await ctx.db
          .query("messages")
          .withIndex("by_owner_contact", (index) =>
            index.eq("ownerId", owner._id).eq("contactId", contact._id)
          )
          .order("desc")
          .first();

        const pending = await ctx.db
          .query("tasks")
          .withIndex("by_contact_status", (index) =>
            index.eq("contactId", contact._id).eq("status", "awaiting_approval")
          )
          .collect();

        return {
          channel: channelFor(contact)?.channel ?? null,
          contact: {
            avatarUrl: contact.avatarId
              ? await ctx.storage.getUrl(contact.avatarId)
              : null,
            hue: contact.hue,
            id: contact._id,
            name: contact.name,
            relationship: contact.relationship,
            trusted: contact.trusted,
          },
          last,
          waiting: pending.filter((task) => task.ownerId === owner._id).length,
        };
      })
    );
  },
});

export const thread = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_owner_contact", (index) =>
        index.eq("ownerId", owner._id).eq("contactId", contact._id)
      )
      .order("desc")
      .take(60);

    const pending = await ctx.db
      .query("tasks")
      .withIndex("by_contact_status", (index) =>
        index.eq("contactId", contact._id).eq("status", "awaiting_approval")
      )
      .collect();

    return {
      contact: {
        ...contact,
        avatarUrl: contact.avatarId
          ? await ctx.storage.getUrl(contact.avatarId)
          : null,
      },
      messages: messages.toReversed(),
      pendingTaskIds: pending
        .filter((task) => task.ownerId === owner._id)
        .map((task) => task._id),
    };
  },
});

export const generatePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireProfile(ctx);

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Record an uploaded photo; the content type is checked from storage metadata,
 * not trusted from the client. A refused file is deleted and null returned.
 */
export const registerPhoto = mutation({
  args: {
    caption: v.union(v.string(), v.null()),
    contactId: v.union(v.id("contacts"), v.null()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<Id<"photos"> | null> => {
    const owner = await requireOwner(ctx);

    if (args.contactId !== null) {
      requireOwned(await ctx.db.get(args.contactId), owner, "contact");
    }

    const metadata = await ctx.db.system.get("_storage", args.storageId);

    // Returning rather than throwing keeps the delete: a thrown error would roll it back.
    if (
      metadata === null ||
      !ALLOWED_PHOTO_TYPES.has(metadata.contentType ?? "")
    ) {
      if (metadata !== null) {
        await ctx.storage.delete(args.storageId);
      }

      return null;
    }

    return await ctx.db.insert("photos", {
      caption: args.caption,
      contactId: args.contactId,
      contentType: metadata.contentType ?? "image/jpeg",
      createdAt: Date.now(),
      ownerId: owner._id,
      sharedWithCircle: false,
      storageId: args.storageId,
      uploadedByProfileId: owner._id,
    });
  },
});

/** Compose a message directly. It becomes a draft that the person reviews and approves before it is sent. */
export const draft = mutation({
  args: {
    body: v.string(),
    contactId: v.id("contacts"),
    photoIds: v.array(v.id("photos")),
    startedFrom: startedFromValidator,
  },
  handler: async (ctx, args): Promise<Id<"tasks">> => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const channel = channelFor(contact);
    const body = args.body.trim();

    if (channel === null) {
      throw new Error(
        `${contact.name} has no way to be reached yet. Add one under Trusted circle.`
      );
    }

    if (body.length === 0 && args.photoIds.length === 0) {
      throw new Error("Write a few words or add a photo first.");
    }

    if (args.photoIds.length > MAX_PHOTOS) {
      throw new Error(`You can send up to ${MAX_PHOTOS} photos at once.`);
    }

    const photos = await Promise.all(
      args.photoIds.map(async (photoId) =>
        requireOwned(await ctx.db.get(photoId), owner, "photo")
      )
    );

    const mode = owner.demoMode ? "simulated" : "live";

    const { stepIds, taskId } = await createTask(ctx, {
      appointmentId: null,
      contactId: contact._id,
      kind: "send_message",
      mode,
      origin: "text",
      ownerId: owner._id,
      request: body,
      steps: [
        { kind: "send_message", label: `Message ${firstName(contact.name)}` },
      ],
      title: `Message to ${contact.name}`,
    });

    await createAction(ctx, {
      ambiguities: [],
      details: {
        address: channel.address,
        body,
        channel: channel.channel,
        contactId: contact._id,
        contactName: contact.name,
        kind: "send_message",
        photoIds: photos.map((photo) => photo.storageId),
      },
      mode,
      ownerId: owner._id,
      proposedBy: "person",
      rationale:
        args.startedFrom === "suggestion" ? SUGGESTION_RATIONALE : null,
      stepId: stepIds[0] ?? null,
      taskId,
    });

    return taskId;
  },
});

export const receive = internalMutation({
  args: {
    body: v.string(),
    channel: v.union(
      v.literal("imessage"),
      v.literal("discord"),
      v.literal("telegram"),
      v.literal("email"),
      v.literal("in_app")
    ),
    contactId: v.id("contacts"),
    mode: v.union(v.literal("live"), v.literal("simulated")),
    ownerId: v.id("profiles"),
    providerMessageId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) =>
    await recordIncoming(ctx, { ...args, photoIds: [] }),
});

/** A family member replies in the app. Their reply arrives in the owner's thread as an incoming message. */
export const replyInApp = mutation({
  args: { body: v.string(), ownerId: v.id("profiles") },
  handler: async (ctx, args) => {
    const viewer = await requireProfile(ctx);

    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_linked_profile", (index) =>
        index.eq("linkedProfileId", viewer._id)
      )
      .filter((row) => row.eq(row.field("ownerId"), args.ownerId))
      .first();

    const body = args.body.trim();

    if (contact === null) {
      throw new Error("You are not connected with this person.");
    }

    if (body.length === 0) {
      throw new Error("Please write your reply first.");
    }

    const owner = await ctx.db.get(args.ownerId);

    await recordIncoming(ctx, {
      body,
      channel: "in_app",
      contactId: contact._id,
      mode: owner?.demoMode ? "simulated" : "live",
      ownerId: args.ownerId,
      photoIds: [],
      providerMessageId: `in_app:${viewer._id}:${Date.now()}`,
    });
  },
});

/** For a family member: their in-app conversation with someone who connected with them. */
export const inAppThreadWith = query({
  args: { ownerId: v.id("profiles") },
  handler: async (ctx, args) => {
    const viewer = await requireProfile(ctx);

    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_linked_profile", (index) =>
        index.eq("linkedProfileId", viewer._id)
      )
      .filter((row) => row.eq(row.field("ownerId"), args.ownerId))
      .first();

    if (contact === null) {
      return null;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_owner_contact", (index) =>
        index.eq("ownerId", args.ownerId).eq("contactId", contact._id)
      )
      .order("desc")
      .take(40);

    return messages
      .filter(
        (message) =>
          message.channel === "in_app" &&
          (message.direction === "incoming" || message.status === "sent")
      )
      .toReversed()
      .map((message) => ({
        body: message.body,
        createdAt: message.createdAt,
        fromMe: message.direction === "incoming",
        hasPhotos: message.photoIds.length > 0,
        id: message._id,
        mode: message.mode,
      }));
  },
});

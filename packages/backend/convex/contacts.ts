import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { audit } from "./lib/audit";
import { requireOwned, requireOwner, requireProfile } from "./lib/session";

const channelValidator = v.object({
  address: v.string(),
  channel: v.union(
    v.literal("imessage"),
    v.literal("discord"),
    v.literal("email"),
    v.literal("in_app")
  ),
  preferred: v.boolean(),
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,}$/u;
const DISCORD_ID_PATTERN = /^\d{15,21}$/u;

/** Normalise and check each address so a recipient is always exact. */
const cleanChannels = (
  channels: {
    address: string;
    channel: "discord" | "email" | "imessage" | "in_app";
    preferred: boolean;
  }[]
): {
  address: string;
  channel: "discord" | "email" | "imessage" | "in_app";
  preferred: boolean;
}[] => {
  const cleaned = channels.map((channel) => {
    const address = channel.address.trim();

    if (channel.channel === "email" && !EMAIL_PATTERN.test(address)) {
      throw new ConvexError({
        code: "invalid",
        message: `"${address}" is not an email address.`,
      });
    }

    if (
      channel.channel === "imessage" &&
      !(PHONE_PATTERN.test(address) || EMAIL_PATTERN.test(address))
    ) {
      throw new ConvexError({
        code: "invalid",
        message: "iMessage needs a phone number or an Apple ID email.",
      });
    }

    if (channel.channel === "discord" && !DISCORD_ID_PATTERN.test(address)) {
      throw new ConvexError({
        code: "invalid",
        message:
          "Discord needs the person's numeric user ID (in Discord: Settings, Advanced, Developer Mode, then Copy User ID).",
      });
    }

    const normalized =
      channel.channel === "imessage" && PHONE_PATTERN.test(address)
        ? address.replaceAll(/[\s().-]/gu, "")
        : address;

    return {
      address: normalized,
      channel: channel.channel,
      preferred: channel.preferred,
    };
  });

  if (cleaned.filter((channel) => channel.preferred).length > 1) {
    throw new ConvexError({
      code: "invalid",
      message: "Choose one preferred way to reach them.",
    });
  }

  return cleaned;
};

const hueFor = (name: string): number => {
  let hash = 0;

  for (const character of name) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 360;
  }

  return hash;
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireProfile(ctx);

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (index) => index.eq("ownerId", profile._id))
      .collect();

    return contacts.toSorted(
      (left, right) =>
        Number(right.trusted) - Number(left.trusted) ||
        left.name.localeCompare(right.name)
    );
  },
});

export const create = mutation({
  args: {
    channels: v.array(channelValidator),
    name: v.string(),
    relationship: v.string(),
    trusted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const name = args.name.trim();

    if (name.length === 0) {
      throw new ConvexError({
        code: "invalid",
        message: "Please enter their name.",
      });
    }

    const contactId = await ctx.db.insert("contacts", {
      channels: cleanChannels(args.channels),
      createdAt: Date.now(),
      hue: hueFor(name),
      linkedProfileId: null,
      name,
      ownerId: owner._id,
      relationship: args.relationship.trim(),
      sample: false,
      trusted: args.trusted,
    });

    await audit(ctx, {
      actor: "person",
      detail: `Added ${name}.`,
      event: "contact.created",
      ownerId: owner._id,
    });

    return contactId;
  },
});

export const update = mutation({
  args: {
    channels: v.array(channelValidator),
    contactId: v.id("contacts"),
    name: v.string(),
    relationship: v.string(),
    trusted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    await ctx.db.patch(contact._id, {
      channels: cleanChannels(args.channels),
      name: args.name.trim() || contact.name,
      relationship: args.relationship.trim(),
      trusted: args.trusted,
    });
    await audit(ctx, {
      actor: "person",
      detail: `Updated ${contact.name}.`,
      event: "contact.updated",
      ownerId: owner._id,
    });
  },
});

export const remove = mutation({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const grants = await ctx.db
      .query("sharingGrants")
      .withIndex("by_contact", (index) => index.eq("contactId", contact._id))
      .collect();

    const now = Date.now();

    // Removing someone also ends anything shared with them.
    await Promise.all(
      grants
        .filter((grant) => grant.revokedAt === null)
        .map(
          async (grant) =>
            await ctx.db.patch(grant._id, { revokedAt: now, updatedAt: now })
        )
    );

    await ctx.db.delete(contact._id);
    await audit(ctx, {
      actor: "person",
      detail: `Removed ${contact.name} and ended their sharing.`,
      event: "contact.removed",
      ownerId: owner._id,
    });
  },
});

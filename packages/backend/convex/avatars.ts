"use node";

import { MAX_AVATAR_BYTES } from "@lifelink/contracts/avatar";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { AVATAR_CONTENT_TYPE, normalizeAvatar } from "./lib/avatarimage";

/**
 * Save a contact's picture. The bytes come straight to the server rather than
 * through an upload URL, so nothing unchecked is ever stored: the size is
 * capped, the image is re-encoded here, and only the result is kept.
 */
export const save = action({
  args: { contactId: v.id("contacts"), image: v.bytes() },
  handler: async (ctx, args): Promise<{ saved: boolean }> => {
    // Confirms the caller owns this contact before spending any work on the image.
    await ctx.runQuery(internal.contacts.avatarTarget, {
      contactId: args.contactId,
    });

    if (args.image.byteLength > MAX_AVATAR_BYTES) {
      return { saved: false };
    }

    const normalized = await normalizeAvatar(args.image);

    if (normalized === null) {
      return { saved: false };
    }

    const storageId = await ctx.storage.store(
      new Blob([normalized], { type: AVATAR_CONTENT_TYPE })
    );

    try {
      await ctx.runMutation(internal.contacts.attachAvatar, {
        contactId: args.contactId,
        storageId,
      });
    } catch (error) {
      // The contact went away mid-save; don't leave the picture behind.
      await ctx.storage.delete(storageId);
      throw error;
    }

    return { saved: true };
  },
});

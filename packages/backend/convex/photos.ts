import { v } from "convex/values";

import { internalQuery, mutation, query } from "./_generated/server";
import { grantAllows } from "./lib/permissions";
import { requireOwned, requireOwner } from "./lib/session";

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);

    const photos = await ctx.db
      .query("photos")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .order("desc")
      .take(48);

    return photos.map((photo) => ({
      caption: photo.caption,
      createdAt: photo.createdAt,
      id: photo._id,
      sharedWithCircle: photo.sharedWithCircle,
    }));
  },
});

export const setShared = mutation({
  args: { photoId: v.id("photos"), shared: v.boolean() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const photo = requireOwned(await ctx.db.get(args.photoId), owner, "photo");

    await ctx.db.patch(photo._id, { sharedWithCircle: args.shared });
  },
});

/**
 * Authorise one photo download for the HTTP file route: the owner, or a
 * family member with a live photos.view grant for a photo the owner shared.
 */
export const authorizeDownload = internalQuery({
  args: { authUserId: v.string(), photoId: v.string() },
  handler: async (ctx, args) => {
    const photoId = ctx.db.normalizeId("photos", args.photoId);
    const photo = photoId === null ? null : await ctx.db.get(photoId);

    const viewer = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (index) =>
        index.eq("authUserId", args.authUserId)
      )
      .unique();

    if (photo === null || viewer === null) {
      return null;
    }

    if (photo.ownerId === viewer._id) {
      return { contentType: photo.contentType, storageId: photo.storageId };
    }

    if (!photo.sharedWithCircle) {
      return null;
    }

    const now = Date.now();

    const grants = await ctx.db
      .query("sharingGrants")
      .withIndex("by_grantee", (index) =>
        index.eq("granteeProfileId", viewer._id)
      )
      .collect();

    const allowed = grants.some(
      (grant) =>
        grant.ownerId === photo.ownerId &&
        grantAllows(grant, "photos.view", now)
    );

    return allowed
      ? { contentType: photo.contentType, storageId: photo.storageId }
      : null;
  },
});

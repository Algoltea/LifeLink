import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ReaderCtx = MutationCtx | QueryCtx;

const authUserIdOf = async (ctx: ReaderCtx): Promise<string | null> => {
  const identity = await ctx.auth.getUserIdentity();

  return identity?.subject ?? null;
};

const findProfile = async (ctx: ReaderCtx): Promise<Doc<"profiles"> | null> => {
  const authUserId = await authUserIdOf(ctx);

  if (authUserId === null) {
    return null;
  }

  return await ctx.db
    .query("profiles")
    .withIndex("by_auth_user", (index) => index.eq("authUserId", authUserId))
    .unique();
};

/** The signed-in person's profile, or a clear error the interface can show. */
const requireProfile = async (ctx: ReaderCtx): Promise<Doc<"profiles">> => {
  const profile = await findProfile(ctx);

  if (profile === null) {
    throw new ConvexError({
      code: "not_signed_in",
      message: "Please sign in again to continue.",
    });
  }

  return profile;
};

/** Only the account owner may act; family members get read access through grants. */
const requireOwner = async (ctx: ReaderCtx): Promise<Doc<"profiles">> => {
  const profile = await requireProfile(ctx);

  if (profile.role !== "owner") {
    throw new ConvexError({
      code: "owner_only",
      message: "Only the account owner can do this.",
    });
  }

  return profile;
};

/** Load a row and confirm it belongs to the owner; never reveal other people's rows. */
const requireOwned = <Row extends { ownerId: Id<"profiles"> }>(
  row: Row | null,
  owner: Doc<"profiles">,
  noun: string
): Row => {
  if (row === null || row.ownerId !== owner._id) {
    throw new ConvexError({
      code: "not_found",
      message: `That ${noun} could not be found.`,
    });
  }

  return row;
};

export {
  authUserIdOf,
  findProfile,
  requireOwned,
  requireOwner,
  requireProfile,
};

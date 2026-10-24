import type { SharingScope } from "@lifelink/contracts/sharing";
import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ReaderCtx = MutationCtx | QueryCtx;

/** A grant counts only when accepted, not revoked, not expired, and naming the scope. */
const grantAllows = (
  grant: Doc<"sharingGrants">,
  scope: SharingScope,
  now: number
): boolean =>
  grant.acceptedAt !== null &&
  grant.revokedAt === null &&
  (grant.expiresAt === null || grant.expiresAt > now) &&
  grant.scopes.includes(scope);

const grantIsLive = (grant: Doc<"sharingGrants">, now: number): boolean =>
  grant.acceptedAt !== null &&
  grant.revokedAt === null &&
  (grant.expiresAt === null || grant.expiresAt > now);

const grantsForViewer = async (
  ctx: ReaderCtx,
  viewer: Doc<"profiles">,
  ownerId: Id<"profiles">
): Promise<Doc<"sharingGrants">[]> => {
  const grants = await ctx.db
    .query("sharingGrants")
    .withIndex("by_grantee", (index) =>
      index.eq("granteeProfileId", viewer._id)
    )
    .collect();

  return grants.filter((grant) => grant.ownerId === ownerId);
};

/**
 * Check that `viewer` may see `ownerId`'s data for `scope`. Owners always may.
 * Re-evaluated on every query, so a revoked grant stops access immediately.
 */
const viewerMay = async (
  ctx: ReaderCtx,
  viewer: Doc<"profiles">,
  ownerId: Id<"profiles">,
  scope: SharingScope
): Promise<boolean> => {
  if (viewer._id === ownerId) {
    return true;
  }

  const now = Date.now();
  const grants = await grantsForViewer(ctx, viewer, ownerId);

  return grants.some((grant) => grantAllows(grant, scope, now));
};

const requireViewerMay = async (
  ctx: ReaderCtx,
  viewer: Doc<"profiles">,
  ownerId: Id<"profiles">,
  scope: SharingScope
): Promise<void> => {
  const allowed = await viewerMay(ctx, viewer, ownerId, scope);

  if (!allowed) {
    throw new ConvexError({
      code: "not_shared",
      message: "This has not been shared with you, or sharing was turned off.",
    });
  }
};

/** Active grants of an owner that include `scope`: who may receive a family update. */
const activeGrantsWithScope = async (
  ctx: ReaderCtx,
  ownerId: Id<"profiles">,
  scope: SharingScope
): Promise<Doc<"sharingGrants">[]> => {
  const now = Date.now();

  const grants = await ctx.db
    .query("sharingGrants")
    .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
    .collect();

  return grants.filter((grant) => grantAllows(grant, scope, now));
};

export {
  activeGrantsWithScope,
  grantAllows,
  grantIsLive,
  requireViewerMay,
  viewerMay,
};

import { sharingScopeIds } from "@lifelink/contracts/sharing";
import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { audit } from "./lib/audit";
import { grantIsLive } from "./lib/permissions";
import { requireOwned, requireOwner, requireProfile } from "./lib/session";
import { DAY } from "./lib/time";

const scopeValidator = v.union(
  v.literal("appointments.view"),
  v.literal("reminders.view"),
  v.literal("rides.view"),
  v.literal("photos.view"),
  v.literal("scam_alerts.view"),
  v.literal("groceries.view")
);

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_LENGTH = 10;
const INVITE_VALID_DAYS = 14;

const sha256Hex = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const newInviteCode = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(INVITE_LENGTH));

  const characters = [...bytes].map(
    (byte) => INVITE_ALPHABET[byte % INVITE_ALPHABET.length] ?? "A"
  );

  return `${characters.slice(0, 5).join("")}-${characters.slice(5).join("")}`;
};

const normalizeCode = (code: string): string =>
  code.toUpperCase().replaceAll(/[^A-Z0-9]/gu, "");

/** Everyone the owner shares with, and exactly what each person can see. */
export const listGrants = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);

    const grants = await ctx.db
      .query("sharingGrants")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .collect();

    const now = Date.now();

    return await Promise.all(
      grants.map(async (grant) => {
        const contact = await ctx.db.get(grant.contactId);
        let state: "active" | "expired" | "invited" | "revoked" = "active";

        if (grant.revokedAt !== null) {
          state = "revoked";
        } else if (grant.expiresAt !== null && grant.expiresAt <= now) {
          state = "expired";
        } else if (grant.acceptedAt === null) {
          state = "invited";
        }

        return {
          acceptedAt: grant.acceptedAt,
          contactName: contact?.name ?? "Removed contact",
          createdAt: grant.createdAt,
          expiresAt: grant.expiresAt,
          id: grant._id,
          scopes: grant.scopes,
          state,
        };
      })
    );
  },
});

/** Create an invitation with specific scopes. The code is shown once; only its hash is stored. */
export const createInvite = mutation({
  args: {
    contactId: v.id("contacts"),
    expiresInDays: v.union(v.number(), v.null()),
    scopes: v.array(scopeValidator),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    if (args.scopes.length === 0) {
      throw new ConvexError({
        code: "invalid",
        message: "Choose at least one thing to share.",
      });
    }

    const scopes = sharingScopeIds.filter((scope) =>
      args.scopes.includes(scope)
    );

    const code = newInviteCode();
    const now = Date.now();

    const grantId = await ctx.db.insert("sharingGrants", {
      acceptedAt: null,
      contactId: contact._id,
      createdAt: now,
      expiresAt:
        args.expiresInDays === null
          ? null
          : now + Math.max(1, args.expiresInDays) * DAY,
      granteeProfileId: null,
      inviteCodeHash: await sha256Hex(normalizeCode(code)),
      ownerId: owner._id,
      revokedAt: null,
      scopes,
      updatedAt: now,
    });

    await audit(ctx, {
      actor: "person",
      detail: `Invited ${contact.name} to see: ${scopes.join(", ")}.`,
      event: "sharing.invited",
      ownerId: owner._id,
    });

    return { code, grantId, validUntil: now + INVITE_VALID_DAYS * DAY };
  },
});

export const updateScopes = mutation({
  args: { grantId: v.id("sharingGrants"), scopes: v.array(scopeValidator) },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const grant = requireOwned(
      await ctx.db.get(args.grantId),
      owner,
      "sharing"
    );

    if (grant.revokedAt !== null) {
      throw new ConvexError({
        code: "revoked",
        message: "This sharing has ended. Send a new invitation instead.",
      });
    }

    const scopes = sharingScopeIds.filter((scope) =>
      args.scopes.includes(scope)
    );

    await ctx.db.patch(grant._id, { scopes, updatedAt: Date.now() });
    await audit(ctx, {
      actor: "person",
      detail: `Sharing now covers: ${scopes.join(", ") || "nothing"}.`,
      event: "sharing.updated",
      ownerId: owner._id,
    });
  },
});

export const revoke = mutation({
  args: { grantId: v.id("sharingGrants") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const grant = requireOwned(
      await ctx.db.get(args.grantId),
      owner,
      "sharing"
    );

    if (grant.revokedAt !== null) {
      return;
    }

    const now = Date.now();

    await ctx.db.patch(grant._id, { revokedAt: now, updatedAt: now });
    await audit(ctx, {
      actor: "person",
      detail: "Stopped sharing.",
      event: "sharing.revoked",
      ownerId: owner._id,
    });
  },
});

/** A family member redeems an invitation code. */
export const acceptInvite = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const viewer = await requireProfile(ctx);
    const hash = await sha256Hex(normalizeCode(args.code));

    const grant = await ctx.db
      .query("sharingGrants")
      .withIndex("by_invite_code", (index) => index.eq("inviteCodeHash", hash))
      .unique();

    const now = Date.now();

    const usable =
      grant !== null &&
      grant.revokedAt === null &&
      grant.acceptedAt === null &&
      grant.createdAt + INVITE_VALID_DAYS * DAY > now &&
      (grant.expiresAt === null || grant.expiresAt > now);

    if (!usable) {
      throw new ConvexError({
        code: "invalid_code",
        message:
          "That code did not work. It may have been used already, expired, or been cancelled.",
      });
    }

    if (grant.ownerId === viewer._id) {
      throw new ConvexError({
        code: "invalid_code",
        message: "That is your own invitation.",
      });
    }

    await ctx.db.patch(grant._id, {
      acceptedAt: now,
      granteeProfileId: viewer._id,
      updatedAt: now,
    });
    await ctx.db.patch(grant.contactId, { linkedProfileId: viewer._id });
    await audit(ctx, {
      actor: "family",
      detail: `${viewer.displayName} accepted the invitation.`,
      event: "sharing.accepted",
      ownerId: grant.ownerId,
    });

    return grant.ownerId;
  },
});

/** For a family member: the people who share with them and what each shares. */
export const sharedWithMe = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireProfile(ctx);

    const grants = await ctx.db
      .query("sharingGrants")
      .withIndex("by_grantee", (index) =>
        index.eq("granteeProfileId", viewer._id)
      )
      .collect();

    const now = Date.now();
    const live = grants.filter((grant) => grantIsLive(grant, now));

    return await Promise.all(
      live.map(async (grant) => {
        const owner = await ctx.db.get(grant.ownerId);

        return {
          expiresAt: grant.expiresAt,
          grantId: grant._id,
          ownerId: grant.ownerId,
          ownerName: owner?.preferredName ?? "Someone",
          scopes: grant.scopes,
        };
      })
    );
  },
});

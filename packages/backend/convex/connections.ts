/**
 * Each person connects their own accounts here. The developer's credentials
 * and auth configs come from `bun run dev:setup`; this module never sees a
 * person's password. Capabilities are shown exactly as the catalog states.
 */
import {
  connectionDefinitions,
  findConnectionDefinition,
} from "@lifelink/contracts/integrations";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  authConfigFor,
  getConnectedAccount,
  linkAccount,
  revokeConnectedAccount,
  upsertTrigger,
} from "./integrations/composio";
import type { ConnectedAccount } from "./integrations/composio";
import type { JsonObject } from "./integrations/http";
import { instacartKey, nearbyRetailers } from "./integrations/instacart";
import { developerConfigured } from "./lib/capabilities";
import { demoModeAllowed, readEnvOr } from "./lib/env";
import { requireOwned, requireOwner } from "./lib/session";

/** New-mail triggers registered after a mailbox connects, with their config. */
const mailTriggerFor = (
  provider: string
): { config: JsonObject; slug: string } | null => {
  if (provider === "gmail") {
    return { config: { labelIds: "INBOX" }, slug: "GMAIL_NEW_GMAIL_MESSAGE" };
  }

  return provider === "outlook"
    ? { config: {}, slug: "OUTLOOK_MESSAGE_TRIGGER" }
    : null;
};

/** Why a returned account cannot be accepted for this person and toolkit, or null when it can. */
const accountRejection = (
  account: ConnectedAccount | null,
  toolkit: string,
  ownerId: string
): string | null => {
  if (account === null) {
    return "We could not confirm the connection.";
  }

  const toolkitMatches = account.toolkit?.slug?.toLowerCase() === toolkit;

  const userMatches =
    account.user_id === undefined || account.user_id === ownerId;

  if (account.status !== "ACTIVE" || !toolkitMatches || !userMatches) {
    return `The connection is ${account.status.toLowerCase()}.`;
  }

  return null;
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);

    const rows = await ctx.db
      .query("connections")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .collect();

    return {
      demoMode: owner.demoMode,
      demoModeAllowed: demoModeAllowed(),
      providers: connectionDefinitions.map((definition) => {
        const developerReady =
          developerConfigured(definition.developerIntegration) &&
          (definition.composioToolkit === undefined ||
            definition.connectStyle !== "oauth" ||
            authConfigFor(definition.composioToolkit) !== null);

        const row =
          rows.find(
            (candidate) =>
              candidate.provider === definition.id &&
              candidate.status !== "revoked"
          ) ?? null;

        return {
          accountLabel: row?.accountLabel ?? null,
          connectionId: row?._id ?? null,
          definition,
          developerReady,
          lastError: row?.lastError ?? null,
          mode: row?.mode ?? null,
          status: row?.status ?? null,
        };
      }),
    };
  },
});

export const ownerFromAuth = internalQuery({
  args: {},
  handler: async (
    ctx
  ): Promise<{ id: Id<"profiles">; demoMode: boolean } | null> => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (index) =>
        index.eq("authUserId", identity.subject)
      )
      .unique();

    return profile?.role === "owner"
      ? { demoMode: profile.demoMode, id: profile._id }
      : null;
  },
});

export const recordPending = internalMutation({
  args: {
    externalAttemptId: v.string(),
    ownerId: v.id("profiles"),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_owner_provider", (index) =>
        index.eq("ownerId", args.ownerId).eq("provider", args.provider)
      )
      .first();

    const values = {
      lastError: null,
      mode: "live" as const,
      pendingAttemptId: args.externalAttemptId,
      status:
        existing?.status === "active"
          ? ("active" as const)
          : ("pending" as const),
      updatedAt: Date.now(),
    };

    await (existing === null
      ? ctx.db.insert("connections", {
          ...values,
          accountLabel: null,
          connectedAt: null,
          externalAccountId: null,
          ownerId: args.ownerId,
          provider: args.provider,
        })
      : ctx.db.patch(existing._id, values));
  },
});

/** Start an OAuth connection. The browser goes to the provider's own consent screen. */
export const start = action({
  args: { provider: v.string() },
  handler: async (ctx, args): Promise<{ redirectUrl: string }> => {
    const owner = await ctx.runQuery(internal.connections.ownerFromAuth, {});
    const definition = findConnectionDefinition(args.provider);

    if (owner === null) {
      throw new ConvexError({
        code: "not_signed_in",
        message: "Please sign in again.",
      });
    }

    if (
      definition?.composioToolkit === undefined ||
      definition.connectStyle !== "oauth"
    ) {
      throw new ConvexError({
        code: "invalid",
        message: "This service does not use a personal sign-in.",
      });
    }

    if (!developerConfigured("composio")) {
      throw new ConvexError({
        code: "not_configured",
        message:
          "Connections are not set up for this app yet. Run bun run dev:setup.",
      });
    }

    const callbackUrl = `${readEnvOr("SITE_URL", "http://localhost:3001")}/connections/callback?provider=${encodeURIComponent(definition.id)}`;

    const linked = await linkAccount(
      owner.id,
      definition.composioToolkit,
      callbackUrl
    );

    if (!linked.ok) {
      throw new ConvexError({ code: "provider_error", message: linked.error });
    }

    await ctx.runMutation(internal.connections.recordPending, {
      externalAttemptId: linked.connectedAccountId,
      ownerId: owner.id,
      provider: definition.id,
    });

    return { redirectUrl: linked.redirectUrl };
  },
});

export const pendingFor = internalQuery({
  args: { ownerId: v.id("profiles"), provider: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("connections")
      .withIndex("by_owner_provider", (index) =>
        index.eq("ownerId", args.ownerId).eq("provider", args.provider)
      )
      .first(),
});

export const markResult = internalMutation({
  args: {
    accountLabel: v.union(v.string(), v.null()),
    connectionId: v.id("connections"),
    error: v.union(v.string(), v.null()),
    externalAccountId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.connectionId, {
      accountLabel: args.accountLabel,
      connectedAt: args.error === null ? now : null,
      externalAccountId: args.externalAccountId,
      lastError: args.error,
      pendingAttemptId: null,
      status: args.error === null ? "active" : "error",
      updatedAt: now,
    });
  },
});

/**
 * Finish after the provider redirects back. Callback query parameters are not
 * proof of ownership, so the account is re-read from Composio and must match
 * the attempt this person started and the expected toolkit.
 */
export const complete = action({
  args: { connectedAccountId: v.string(), provider: v.string() },
  handler: async (ctx, args): Promise<{ ok: boolean; message: string }> => {
    const owner = await ctx.runQuery(internal.connections.ownerFromAuth, {});
    const definition = findConnectionDefinition(args.provider);

    if (owner === null || definition?.composioToolkit === undefined) {
      return { message: "Please sign in again.", ok: false };
    }

    const pending = await ctx.runQuery(internal.connections.pendingFor, {
      ownerId: owner.id,
      provider: definition.id,
    });

    if (
      pending === null ||
      pending.pendingAttemptId !== args.connectedAccountId
    ) {
      return {
        message:
          "This connection was not started from your account. Please try connecting again.",
        ok: false,
      };
    }

    const account = await getConnectedAccount(args.connectedAccountId);

    const rejection = accountRejection(
      account,
      definition.composioToolkit,
      owner.id
    );

    if (account === null || rejection !== null) {
      await ctx.runMutation(internal.connections.markResult, {
        accountLabel: null,
        connectionId: pending._id,
        error: rejection,
        externalAccountId: null,
      });

      return {
        message: "The connection did not finish. You can try again.",
        ok: false,
      };
    }

    await ctx.runMutation(internal.connections.markResult, {
      accountLabel: account.state?.val?.displayName ?? definition.label,
      connectionId: pending._id,
      error: null,
      externalAccountId: account.id,
    });

    const trigger = mailTriggerFor(definition.id);

    if (trigger !== null) {
      await upsertTrigger(trigger.slug, owner.id, account.id, trigger.config);
    }

    return { message: `${definition.label} is connected.`, ok: true };
  },
});

export const externalIdFor = internalQuery({
  args: { connectionId: v.id("connections"), ownerId: v.id("profiles") },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);

    return connection === null || connection.ownerId !== args.ownerId
      ? null
      : connection;
  },
});

export const markRevoked = internalMutation({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      pendingAttemptId: null,
      status: "revoked",
      updatedAt: Date.now(),
    });
  },
});

/** Disconnect: revoke at the provider, then stop using it here. Approved work re-checks this before running. */
export const disconnect = action({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, args): Promise<void> => {
    const owner = await ctx.runQuery(internal.connections.ownerFromAuth, {});

    if (owner === null) {
      throw new ConvexError({
        code: "not_signed_in",
        message: "Please sign in again.",
      });
    }

    const connection = await ctx.runQuery(internal.connections.externalIdFor, {
      connectionId: args.connectionId,
      ownerId: owner.id,
    });

    if (connection === null) {
      throw new ConvexError({
        code: "not_found",
        message: "That connection could not be found.",
      });
    }

    if (connection.mode === "live" && connection.externalAccountId !== null) {
      await revokeConnectedAccount(connection.externalAccountId);
    }

    await ctx.runMutation(internal.connections.markRevoked, {
      connectionId: connection._id,
    });
  },
});

/** Practice mode only: a practice connection, clearly labelled, that never reaches a provider. */
export const connectPractice = mutation({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const definition = findConnectionDefinition(args.provider);

    if (
      !owner.demoMode ||
      definition === undefined ||
      definition.connectStyle !== "oauth"
    ) {
      throw new ConvexError({
        code: "invalid",
        message: "Practice connections are only available in practice mode.",
      });
    }

    const existing = await ctx.db
      .query("connections")
      .withIndex("by_owner_provider", (index) =>
        index.eq("ownerId", owner._id).eq("provider", definition.id)
      )
      .first();

    if (existing !== null) {
      requireOwned(existing, owner, "connection");
      await ctx.db.patch(existing._id, {
        accountLabel: "Practice account",
        mode: "simulated",
        status: "active",
        updatedAt: Date.now(),
      });

      return existing._id;
    }

    return await ctx.db.insert("connections", {
      accountLabel: "Practice account",
      connectedAt: Date.now(),
      externalAccountId: null,
      lastError: null,
      mode: "simulated",
      ownerId: owner._id,
      pendingAttemptId: null,
      provider: definition.id,
      status: "active",
      updatedAt: Date.now(),
    });
  },
});

export const postalCodeFor = internalQuery({
  args: { ownerId: v.id("profiles") },
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.ownerId);

    return owner?.postalCode ?? null;
  },
});

/** Stores near the person's ZIP code, read-only from Instacart. */
export const instacartStores = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{ stores: string[] | null; reason: string | null }> => {
    const owner = await ctx.runQuery(internal.connections.ownerFromAuth, {});

    if (owner === null) {
      return { reason: "Please sign in again.", stores: null };
    }

    const apiKey = instacartKey();

    const postalCode = await ctx.runQuery(internal.connections.postalCodeFor, {
      ownerId: owner.id,
    });

    if (apiKey === null) {
      return { reason: "Instacart is not set up for this app.", stores: null };
    }

    if (postalCode === null) {
      return {
        reason: "Add your ZIP code in Settings to see nearby stores.",
        stores: null,
      };
    }

    const stores = await nearbyRetailers(apiKey, postalCode);

    return stores === null
      ? { reason: "Instacart did not answer. Try again later.", stores: null }
      : { reason: null, stores };
  },
});

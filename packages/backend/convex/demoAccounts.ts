/** Operator-only presentation accounts. Auth, profile and samples commit together. */
import { connectionDefinitions } from "@lifelink/contracts/integrations";
import { ConvexError, v } from "convex/values";
import { z } from "zod";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { createAuth } from "./auth";
import { audit } from "./lib/audit";
import { isValidTimeZone } from "./lib/time";
import { preferencesOf } from "./profiles";

const DEFAULT_DISPLAY_NAME = "LifeLink Demo";

interface ExistingAccount {
  authUserId: string;
  passwordHash: string;
  profileId: Id<"profiles">;
}

interface AccountResult {
  created: boolean;
  demoMode: true;
  displayName: string;
  email: string;
  passwordChanged: false;
  presentationDemo: true;
  profileId: Id<"profiles">;
  timeZone: string;
}

const accountFor = async (
  ctx: QueryCtx | MutationCtx,
  email: string
): Promise<ExistingAccount | null> => {
  const auth = await createAuth(ctx).$context;

  const existing = await auth.internalAdapter.findUserByEmail(email, {
    includeAccounts: true,
  });

  if (existing === null) {
    return null;
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_auth_user", (index) =>
      index.eq("authUserId", existing.user.id)
    )
    .unique();

  if (
    !profile?.presentationDemo ||
    !profile.demoMode ||
    profile.role !== "owner"
  ) {
    throw new ConvexError({
      code: "email_in_use",
      message:
        "That email belongs to an existing account. Choose a new email for the presentation account.",
    });
  }

  const credential = existing.accounts.find(
    (account) => account.providerId === "credential"
  );

  if (!credential?.password) {
    throw new ConvexError({
      code: "missing_credential",
      message:
        "This presentation account has no password credential. Its credentials were not changed.",
    });
  }

  return {
    authUserId: existing.user.id,
    passwordHash: credential.password,
    profileId: profile._id,
  };
};

/** Password hashes never leave the internal function boundary. */
export const existing = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<ExistingAccount | null> =>
    await accountFor(ctx, args.email),
});

const accountResult = (
  profile: Doc<"profiles">,
  email: string,
  created: boolean
): AccountResult => ({
  created,
  demoMode: true,
  displayName: profile.displayName,
  email,
  passwordChanged: false,
  presentationDemo: true,
  profileId: profile._id,
  timeZone: profile.timeZone,
});

const connectSamples = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">
): Promise<void> => {
  for (const definition of connectionDefinitions) {
    if (
      definition.connectStyle !== "oauth" ||
      !definition.capabilities.some(
        (capability) => capability.status === "available"
      )
    ) {
      continue;
    }

    // No provider identifiers or tokens: these connections can only simulate.
    // oxlint-disable-next-line eslint/no-await-in-loop -- seed a small, fixed provider catalog in one transaction.
    await ctx.db.insert("connections", {
      accountLabel: owner.displayName,
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
  }
};

/** Compare-and-create in one transaction, including Better Auth component writes. */
export const provision = internalMutation({
  args: {
    displayName: v.string(),
    email: v.string(),
    expectedAuthUserId: v.union(v.string(), v.null()),
    passwordHash: v.string(),
    timeZone: v.string(),
  },
  handler: async (ctx, args): Promise<AccountResult> => {
    const previous = await accountFor(ctx, args.email);

    if (previous !== null) {
      if (
        previous.authUserId !== args.expectedAuthUserId ||
        previous.passwordHash !== args.passwordHash
      ) {
        throw new ConvexError({
          code: "account_changed",
          message:
            "The account changed during setup. Run setup again with its current password.",
        });
      }

      const profile = await ctx.db.get(previous.profileId);

      if (profile === null) {
        throw new Error("The presentation profile disappeared during setup.");
      }

      await preferencesOf(ctx, profile);
      await ctx.runMutation(internal.demo.seed, { ownerId: profile._id });

      return accountResult(profile, args.email, false);
    }

    if (args.expectedAuthUserId !== null) {
      throw new ConvexError({
        code: "account_changed",
        message: "The account changed during setup. Run setup again.",
      });
    }

    const auth = await createAuth(ctx).$context;

    const user = await auth.internalAdapter.createUser({
      email: args.email,
      emailVerified: false,
      name: args.displayName,
    });

    await auth.internalAdapter.linkAccount({
      accountId: user.id,
      password: args.passwordHash,
      providerId: "credential",
      userId: user.id,
    });

    const profileId = await ctx.db.insert("profiles", {
      assistantThreadId: null,
      authUserId: user.id,
      city: null,
      createdAt: Date.now(),
      demoMode: true,
      displayName: args.displayName,
      postalCode: null,
      preferredName:
        args.displayName === DEFAULT_DISPLAY_NAME
          ? DEFAULT_DISPLAY_NAME
          : (args.displayName.split(" ")[0] ?? args.displayName),
      presentationDemo: true,
      role: "owner",
      signOffName: null,
      timeZone: args.timeZone,
    });

    const profile = await ctx.db.get(profileId);

    if (profile === null) {
      throw new Error("The presentation profile could not be created.");
    }

    await preferencesOf(ctx, profile);
    await connectSamples(ctx, profile);
    await ctx.runMutation(internal.demo.seed, { ownerId: profileId });
    await audit(ctx, {
      actor: "system",
      detail:
        "Operator created a presentation account with sample data and simulated execution locked on.",
      event: "profile.presentation_demo_created",
      ownerId: profileId,
    });

    return accountResult(profile, args.email, true);
  },
});

/** Convex CLI/dashboard operators only; never exposed as a public signup API. */
export const create = internalAction({
  args: {
    displayName: v.optional(v.string()),
    email: v.string(),
    password: v.string(),
    timeZone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AccountResult> => {
    const email = args.email.trim().toLowerCase();
    const displayName = args.displayName?.trim() ?? DEFAULT_DISPLAY_NAME;
    const timeZone = args.timeZone ?? "America/New_York";

    if (
      !z.email().safeParse(email).success ||
      displayName.length < 2 ||
      !isValidTimeZone(timeZone)
    ) {
      throw new ConvexError({
        code: "invalid",
        message: "Provide a valid email, display name, and time zone.",
      });
    }

    const auth = await createAuth(ctx).$context;
    const { minPasswordLength, maxPasswordLength } = auth.password.config;

    if (
      args.password.length < minPasswordLength ||
      args.password.length > maxPasswordLength
    ) {
      throw new ConvexError({
        code: "invalid_password",
        message: `Use a password between ${minPasswordLength} and ${maxPasswordLength} characters.`,
      });
    }

    const previous: ExistingAccount | null = await ctx.runQuery(
      internal.demoAccounts.existing,
      { email }
    );

    if (
      previous !== null &&
      !(await auth.password.verify({
        hash: previous.passwordHash,
        password: args.password,
      }))
    ) {
      throw new ConvexError({
        code: "invalid_password",
        message:
          "The password does not match this presentation account. Its credentials were not changed.",
      });
    }

    // Hash outside the mutation; creation and seeding remain one atomic commit.
    const passwordHash =
      previous?.passwordHash ?? (await auth.password.hash(args.password));

    return await ctx.runMutation(internal.demoAccounts.provision, {
      displayName,
      email,
      expectedAuthUserId: previous?.authUserId ?? null,
      passwordHash,
      timeZone,
    });
  },
});

/** Automatic safety notes in the owner's mailbox, separate from approval-bound replies. */
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { MailAccount } from "./integrations/mail";
import {
  createWarningDraft,
  warningDraftId,
  warningRecipient,
} from "./integrations/mailWarnings";
import { ownerLocale } from "./lib/locale";
import { scamWarningMessage } from "./lib/scamWarningMessages";

export const queueWarningDraft = async (
  ctx: MutationCtx,
  emailId: Id<"emails">
): Promise<void> => {
  const email = await ctx.db.get(emailId);

  if (
    email?.mode !== "live" ||
    !email.scamWarningMailboxId ||
    email.scamWarningDraft !== undefined ||
    email.scamCheck?.verdict !== "likely_scam"
  ) {
    return;
  }

  await ctx.db.patch(emailId, {
    scamWarningDraft: {
      draftId: null,
      status: "queued",
      updatedAt: Date.now(),
    },
  });
  await ctx.scheduler.runAfter(0, internal.emailWarnings.create, { emailId });
};

const warningMailboxMatches = (
  connection: Doc<"connections"> | null,
  email: Doc<"emails">
): boolean =>
  connection !== null &&
  connection.ownerId === email.ownerId &&
  connection.provider === email.provider &&
  connection.mode === "live" &&
  connection.status === "active" &&
  connection.externalAccountId === email.scamWarningMailboxId;

const eligibleWarning = async (
  ctx: QueryCtx,
  emailId: Id<"emails">
): Promise<{ account: MailAccount; email: Doc<"emails"> } | null> => {
  const email = await ctx.db.get(emailId);

  if (
    email?.mode !== "live" ||
    email.connectionId === null ||
    !email.scamWarningMailboxId ||
    email.scamWarningDraft?.status !== "queued" ||
    email.scamCheck?.verdict !== "likely_scam"
  ) {
    return null;
  }

  const owner = await ctx.db.get(email.ownerId);
  const connection = await ctx.db.get(email.connectionId);
  const review = await ctx.db.get(email.scamCheck.reviewId);

  if (
    owner === null ||
    owner.role !== "owner" ||
    owner.demoMode ||
    !warningMailboxMatches(connection, email) ||
    review?.automatic !== true ||
    review.status !== "done" ||
    review.mode !== "live" ||
    review.ownerId !== email.ownerId ||
    review.emailId !== email._id ||
    review.verdict !== "likely_scam"
  ) {
    return null;
  }

  return {
    account: {
      connectedAccountId: email.scamWarningMailboxId,
      provider: email.provider,
      userId: email.ownerId,
    },
    email,
  };
};

export const mailbox = internalQuery({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args): Promise<MailAccount | null> => {
    const input = await eligibleWarning(ctx, args.emailId);

    return input?.account ?? null;
  },
});

interface WarningClaim {
  account: MailAccount;
  mail: { body: string; subject: string; threadId: string | null };
}

export const claim = internalMutation({
  args: { accountId: v.string(), emailId: v.id("emails") },
  handler: async (ctx, args): Promise<WarningClaim | null> => {
    const input = await eligibleWarning(ctx, args.emailId);

    if (input === null || input.account.connectedAccountId !== args.accountId) {
      return null;
    }

    // Claim before the external write. A crash or timeout must never authorize a second draft.
    await ctx.db.patch(args.emailId, {
      scamWarningDraft: {
        draftId: null,
        status: "unknown",
        updatedAt: Date.now(),
      },
    });
    const locale = await ownerLocale(ctx, input.email.ownerId);

    return {
      account: input.account,
      mail: {
        ...scamWarningMessage(locale, input.email.subject),
        threadId: input.email.providerThreadId,
      },
    };
  },
});

export const finish = internalMutation({
  args: {
    draftId: v.union(v.string(), v.null()),
    emailId: v.id("emails"),
    fromStatus: v.union(v.literal("queued"), v.literal("unknown")),
    status: v.union(
      v.literal("created"),
      v.literal("failed"),
      v.literal("unknown"),
      v.literal("skipped")
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const email = await ctx.db.get(args.emailId);

    if (email?.scamWarningDraft?.status !== args.fromStatus) {
      return;
    }

    await ctx.db.patch(email._id, {
      scamWarningDraft: {
        draftId: args.draftId,
        status: args.status,
        updatedAt: Date.now(),
      },
    });
  },
});

export const create = internalAction({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args): Promise<void> => {
    const account: MailAccount | null = await ctx.runQuery(
      internal.emailWarnings.mailbox,
      args
    );

    if (account === null) {
      await ctx.runMutation(internal.emailWarnings.finish, {
        ...args,
        draftId: null,
        fromStatus: "queued",
        status: "skipped",
      });

      return;
    }

    const ownAddress =
      account.provider === "gmail" ? await warningRecipient(account) : null;

    if (account.provider === "gmail" && ownAddress === null) {
      await ctx.runMutation(internal.emailWarnings.finish, {
        ...args,
        draftId: null,
        fromStatus: "queued",
        status: "failed",
      });

      return;
    }

    // Recheck the account after the profile lookup, immediately before creating the draft.
    const claimed: WarningClaim | null = await ctx.runMutation(
      internal.emailWarnings.claim,
      {
        ...args,
        accountId: account.connectedAccountId,
      }
    );

    if (claimed === null) {
      await ctx.runMutation(internal.emailWarnings.finish, {
        ...args,
        draftId: null,
        fromStatus: "queued",
        status: "skipped",
      });

      return;
    }

    const outcome = await createWarningDraft(
      claimed.account,
      claimed.mail,
      ownAddress
    );

    const draftId = outcome.kind === "ok" ? warningDraftId(outcome) : null;
    let status: "created" | "failed" | "unknown" = "unknown";

    if (outcome.kind === "rejected") {
      status = "failed";
    } else if (draftId !== null) {
      status = "created";
    }

    await ctx.runMutation(internal.emailWarnings.finish, {
      ...args,
      draftId,
      fromStatus: "unknown",
      status,
    });
  },
});

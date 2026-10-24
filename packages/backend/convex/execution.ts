/**
 * Execution of approved actions. Convex validates; adapters perform.
 *
 * run:       begin (re-validate, open attempt) → adapter → complete
 * reconcile: for an unknown outcome, ask the provider what happened before
 *            anything is retried.
 */
import type { ActionDetails } from "@lifelink/contracts/actions";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalAction, internalMutation } from "./_generated/server";
import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { createEvent, findEvent } from "./integrations/calendar";
import {
  botToken,
  findSentMessage,
  openDmChannel,
  sendDirectMessage,
} from "./integrations/discord";
import type { DiscordPhoto } from "./integrations/discord";
import { findNote, saveNote } from "./integrations/drive";
import { createDraft, findMail, sendMail } from "./integrations/mail";
import type { MailAccount, OutgoingMail } from "./integrations/mail";
import { photonConfig } from "./integrations/photon";
import type { PhotonResult } from "./integrations/photon";
import { activeMailbox, INSTACART_RETIRED_REASON } from "./lib/capabilities";
import {
  photonReconciliationValidator,
  photonRouteValidator,
  readyImessageRoute,
} from "./lib/imessage";
import type { PhotonRoute } from "./lib/imessage";
import {
  afterActionFailed,
  afterActionSucceeded,
  applyLocalEffect,
  isLocalKind,
} from "./lib/journey";
import {
  beginAttempt,
  finishAttempt,
  settleUnknownAttempt,
} from "./lib/lifecycle";
import type { AttemptResult } from "./lib/lifecycle";

const attemptResultValidator = v.union(
  v.object({ error: v.string(), kind: v.literal("failed_safe") }),
  v.object({ error: v.string(), kind: v.literal("unknown") }),
  v.object({
    kind: v.literal("succeeded"),
    reference: v.union(v.string(), v.null()),
    summary: v.string(),
    url: v.union(v.string(), v.null()),
  })
);

const providerFor = (
  details: ActionDetails,
  mode: "live" | "simulated"
): string => {
  if (mode === "simulated") {
    return "simulated";
  }

  switch (details.kind) {
    case "send_message": {
      return {
        discord: "discord",
        email: "composio",
        imessage: "photon",
        in_app: "lifelink",
      }[details.channel];
    }

    case "email_draft":
    case "calendar_event":
    case "drive_note": {
      return "composio";
    }

    case "grocery_handoff": {
      return "instacart";
    }

    default: {
      return "lifelink";
    }
  }
};

/** Message rows mirror send attempts so the thread shows honest delivery status. */
const upsertOutgoingMessage = async (
  ctx: MutationCtx,
  action: Doc<"actions">,
  details: Extract<ActionDetails, { kind: "send_message" }>,
  status: Doc<"messages">["status"],
  providerMessageId: string | null
): Promise<void> => {
  const existing = await ctx.db
    .query("messages")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .first();

  const now = Date.now();

  if (existing !== null) {
    await ctx.db.patch(existing._id, {
      body: details.body,
      providerMessageId: providerMessageId ?? existing.providerMessageId,
      status,
      statusUpdatedAt: now,
    });

    return;
  }

  const contactId = ctx.db.normalizeId("contacts", details.contactId);

  if (contactId === null) {
    return;
  }

  const photoIds = details.photoIds.flatMap((photoId) => {
    const id = ctx.db.system.normalizeId("_storage", photoId);

    return id === null ? [] : [id];
  });

  await ctx.db.insert("messages", {
    actionId: action._id,
    body: details.body,
    channel: details.channel,
    contactId,
    createdAt: now,
    direction: "outgoing",
    mode: action.mode,
    ownerId: action.ownerId,
    photoIds,
    providerMessageId,
    status,
    statusUpdatedAt: now,
    taskId: action.taskId,
  });
};

type ReaderCtx = MutationCtx | QueryCtx;

interface CachedHandle {
  conversationId: string | null;
  externalUserId: string | null;
}

/** Only Discord uses the global recipient handle cache. */
const cachedHandleFor = async (
  ctx: ReaderCtx,
  details: ActionDetails
): Promise<CachedHandle> => {
  if (details.kind !== "send_message" || details.channel !== "discord") {
    return { conversationId: null, externalUserId: null };
  }

  const handle = await ctx.db
    .query("providerHandles")
    .withIndex("by_provider_handle", (index) =>
      index.eq("provider", "discord").eq("handle", details.address)
    )
    .unique();

  return {
    conversationId: handle?.conversationId ?? null,
    externalUserId: handle?.externalUserId ?? null,
  };
};

/** The connected mailbox, calendar, or Drive an action uses, if any. */
const mailboxFor = async (
  ctx: ReaderCtx,
  details: ActionDetails,
  ownerId: Id<"profiles">
): Promise<MailAccount | null> => {
  const usesConnection =
    details.kind === "email_draft" ||
    details.kind === "calendar_event" ||
    details.kind === "drive_note";

  const usesMailbox =
    usesConnection ||
    (details.kind === "send_message" && details.channel === "email");

  if (!usesMailbox) {
    return null;
  }

  const connectionId = usesConnection
    ? ctx.db.normalizeId("connections", details.connectionId)
    : null;

  const connection =
    connectionId === null
      ? await activeMailbox(ctx, ownerId)
      : await ctx.db.get(connectionId);

  if (!connection?.externalAccountId) {
    return null;
  }

  return {
    connectedAccountId: connection.externalAccountId,
    provider: connection.provider === "outlook" ? "outlook" : "gmail",
    userId: ownerId,
  };
};

const storageIdsOf = (
  ctx: MutationCtx,
  details: ActionDetails
): Id<"_storage">[] =>
  details.kind === "send_message"
    ? details.photoIds.flatMap((photoId) => {
        const id = ctx.db.system.normalizeId("_storage", photoId);

        return id === null ? [] : [id];
      })
    : [];

interface StartedAttempt {
  attemptId: Id<"executionAttempts">;
  cachedConversationId: string | null;
  cachedExternalUserId: string | null;
  details: ActionDetails;
  idempotencyKey: string;
  mailbox: MailAccount | null;
  mode: "live" | "simulated";
  ok: true;
  ownerId: Id<"profiles">;
  photonRoute: PhotonRoute | null;
  photoStorageIds: Id<"_storage">[];
  postalCode: string | null;
  startedAt: number;
  timeZone: string;
}

export const begin = internalMutation({
  args: { actionId: v.id("actions") },
  handler: async (
    ctx,
    args
  ): Promise<StartedAttempt | { ok: false; reason: string }> => {
    const action = await ctx.db.get(args.actionId);

    if (action === null) {
      return { ok: false, reason: "The action no longer exists." };
    }

    const versions = await ctx.db
      .query("actionVersions")
      .withIndex("by_action_version", (index) =>
        index.eq("actionId", action._id).eq("version", action.currentVersion)
      )
      .unique();

    if (versions === null) {
      return { ok: false, reason: "The action is missing its details." };
    }

    const started = await beginAttempt(
      ctx,
      args.actionId,
      providerFor(versions.details, action.mode)
    );

    if (!started.ok) {
      const refreshed = await ctx.db.get(args.actionId);

      if (refreshed !== null) {
        await afterActionFailed(ctx, refreshed);
      }

      return started;
    }

    const { details } = started;

    if (details.kind === "send_message") {
      await upsertOutgoingMessage(ctx, action, details, "sending", null);
    }

    let photonRoute: PhotonRoute | null = null;

    if (
      started.mode === "live" &&
      details.kind === "send_message" &&
      details.channel === "imessage"
    ) {
      photonRoute = await readyImessageRoute(
        ctx,
        started.owner._id,
        details.contactId,
        details.address
      );

      if (photonRoute === null) {
        const reason =
          "iMessage is not ready for this contact. Complete their shared-line setup before sending.";

        const failed = await finishAttempt(ctx, started.attemptId, {
          error: reason,
          kind: "failed_safe",
        });

        await upsertOutgoingMessage(ctx, failed, details, "failed", null);
        await afterActionFailed(ctx, failed);

        return { ok: false, reason };
      }

      // Commit the exact identity with the attempt before an action can call Photon.
      await ctx.db.patch(started.attemptId, { photonRoute });
    }

    const cached = await cachedHandleFor(ctx, details);

    const mailbox =
      started.mode === "live"
        ? await mailboxFor(ctx, details, started.owner._id)
        : null;

    return {
      attemptId: started.attemptId,
      cachedConversationId: cached.conversationId,
      cachedExternalUserId: cached.externalUserId,
      details,
      idempotencyKey: started.idempotencyKey,
      mailbox,
      mode: started.mode,
      ok: true,
      ownerId: started.owner._id,
      photoStorageIds: storageIdsOf(ctx, details),
      photonRoute,
      postalCode: started.owner.postalCode,
      startedAt: Date.now(),
      timeZone: started.owner.timeZone,
    };
  },
});

/** In-app effects (reminders, confirmations, family updates) happen atomically with their receipt. */
export const completeLocal = internalMutation({
  args: { attemptId: v.id("executionAttempts") },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    const action = attempt === null ? null : await ctx.db.get(attempt.actionId);
    const owner = action === null ? null : await ctx.db.get(action.ownerId);

    if (
      attempt === null ||
      action === null ||
      owner === null ||
      attempt.outcome !== "running"
    ) {
      return;
    }

    const version = await ctx.db
      .query("actionVersions")
      .withIndex("by_action_version", (index) =>
        index.eq("actionId", action._id).eq("version", attempt.version)
      )
      .unique();

    if (version === null) {
      return;
    }

    const summary = await applyLocalEffect(ctx, action, version.details, owner);

    const updated = await finishAttempt(ctx, attempt._id, {
      kind: "succeeded",
      reference: null,
      summary,
      url: null,
    });

    await afterActionSucceeded(ctx, updated, version.details);
  },
});

export const complete = internalMutation({
  args: {
    attemptId: v.id("executionAttempts"),
    handleCache: v.union(
      v.object({
        conversationId: v.string(),
        externalUserId: v.string(),
        handle: v.string(),
        provider: v.literal("discord"),
      }),
      v.null()
    ),
    result: attemptResultValidator,
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);

    // A late or repeated completion must not overwrite the first recorded outcome.
    if (attempt === null || attempt.outcome !== "running") {
      return;
    }

    if (args.handleCache !== null) {
      const cache = args.handleCache;

      const existing = await ctx.db
        .query("providerHandles")
        .withIndex("by_provider_handle", (index) =>
          index.eq("provider", cache.provider).eq("handle", cache.handle)
        )
        .unique();

      await (existing === null
        ? ctx.db.insert("providerHandles", {
            conversationId: cache.conversationId,
            externalUserId: cache.externalUserId,
            handle: cache.handle,
            provider: cache.provider,
            updatedAt: Date.now(),
          })
        : ctx.db.patch(existing._id, {
            conversationId: cache.conversationId,
            externalUserId: cache.externalUserId,
            updatedAt: Date.now(),
          }));
    }

    const action = await finishAttempt(ctx, args.attemptId, args.result);

    const version = await ctx.db
      .query("actionVersions")
      .withIndex("by_action_version", (index) =>
        index.eq("actionId", action._id).eq("version", attempt.version)
      )
      .unique();

    if (version === null) {
      return;
    }

    const { details } = version;

    if (details.kind === "send_message") {
      const status = {
        failed_safe: "failed",
        succeeded: "sent",
        unknown: "unknown",
      } as const;

      await upsertOutgoingMessage(
        ctx,
        action,
        details,
        status[args.result.kind],
        args.result.kind === "succeeded" ? args.result.reference : null
      );
    }

    if (
      details.kind === "grocery_handoff" &&
      args.result.kind === "succeeded" &&
      args.result.url !== null
    ) {
      const listId = ctx.db.normalizeId("groceryLists", details.listId);

      if (listId !== null) {
        await ctx.db.patch(listId, {
          lastHandoff: {
            at: Date.now(),
            mode: action.mode,
            url: args.result.url,
          },
        });
      }
    }

    await (args.result.kind === "succeeded"
      ? afterActionSucceeded(ctx, action, details)
      : afterActionFailed(ctx, action));
  },
});

// ── Adapters ──────────────────────────────────────────────────────────────

interface HandleCache {
  conversationId: string;
  externalUserId: string;
  handle: string;
  provider: "discord";
}

interface PerformResult {
  handleCache: HandleCache | null;
  result: AttemptResult;
}

const fromPhoton = (result: PhotonResult, summary: string): AttemptResult => {
  if (result.kind === "ok") {
    return { kind: "succeeded", reference: result.id, summary, url: null };
  }

  return result.kind === "rejected"
    ? { error: result.error, kind: "failed_safe" }
    : { error: result.error, kind: "unknown" };
};

const loadPhotos = async (
  ctx: ActionCtx,
  photoIds: Id<"_storage">[]
): Promise<DiscordPhoto[]> => {
  const loaded = await Promise.all(
    photoIds.map(async (photoId): Promise<DiscordPhoto | null> => {
      const blob = await ctx.storage.get(photoId);

      return blob === null
        ? null
        : {
            bytes: await blob.arrayBuffer(),
            contentType: blob.type || "image/jpeg",
          };
    })
  );

  return loaded.flatMap((photo) => (photo === null ? [] : [photo]));
};

const sendViaPhoton = async (
  ctx: ActionCtx,
  start: StartedAttempt,
  details: Extract<ActionDetails, { kind: "send_message" }>
): Promise<PerformResult> => {
  const config = photonConfig();
  const route = start.photonRoute;

  if (config === null) {
    return {
      handleCache: null,
      result: {
        error: "iMessage is not set up for this app.",
        kind: "failed_safe",
      },
    };
  }

  if (route === null || config.projectId !== route.projectId) {
    return {
      handleCache: null,
      result: {
        error:
          "The approved iMessage route is no longer available. Review the contact's shared-line setup before sending.",
        kind: "failed_safe",
      },
    };
  }

  const sent: PhotonResult = await ctx.runAction(
    internal.integrations.photonruntime.send,
    {
      body: details.body,
      idempotencyKey: start.idempotencyKey,
      photoStorageIds: start.photoStorageIds,
      route,
    }
  );

  return {
    handleCache: null,
    result: fromPhoton(
      sent,
      `Photon accepted the iMessage to ${details.contactName} for delivery.`
    ),
  };
};

const sendViaDiscord = async (
  ctx: ActionCtx,
  start: StartedAttempt,
  details: Extract<ActionDetails, { kind: "send_message" }>
): Promise<PerformResult> => {
  const token = botToken();

  if (token === null) {
    return {
      handleCache: null,
      result: {
        error: "Discord is not set up for this app.",
        kind: "failed_safe",
      },
    };
  }

  let channelId = start.cachedConversationId;

  if (channelId === null) {
    const channel = await openDmChannel(token, details.address);

    if (channel.kind !== "ok") {
      return {
        handleCache: null,
        result: { error: channel.error, kind: "failed_safe" },
      };
    }

    channelId = channel.id;
  }

  const handleCache: HandleCache = {
    conversationId: channelId,
    externalUserId: details.address,
    handle: details.address,
    provider: "discord",
  };

  const photos = await loadPhotos(ctx, start.photoStorageIds);

  const sent = await sendDirectMessage(
    token,
    channelId,
    details.body,
    start.idempotencyKey,
    photos
  );

  if (sent.kind === "ok") {
    return {
      handleCache,
      result: {
        kind: "succeeded",
        reference: sent.id,
        summary: `Discord delivered the message to ${details.contactName}'s inbox.`,
        url: null,
      },
    };
  }

  return {
    handleCache,
    result:
      sent.kind === "rejected"
        ? { error: sent.error, kind: "failed_safe" }
        : { error: sent.error, kind: "unknown" },
  };
};

const fromTool = (
  outcome: Awaited<ReturnType<typeof sendMail>>,
  summary: string
): AttemptResult => {
  if (outcome.kind === "ok") {
    return { kind: "succeeded", reference: outcome.logId, summary, url: null };
  }

  return outcome.kind === "rejected"
    ? { error: outcome.error, kind: "failed_safe" }
    : { error: outcome.error, kind: "unknown" };
};

const mailOf = (details: ActionDetails): OutgoingMail | null => {
  if (details.kind === "email_draft") {
    return {
      body: details.body,
      subject: details.subject,
      threadId: details.replyToMessageId,
      to: details.to,
    };
  }

  if (details.kind === "send_message" && details.channel === "email") {
    return {
      body: details.body,
      subject: "A note from LifeLink",
      threadId: null,
      to: details.address,
    };
  }

  return null;
};

const performLive = async (
  ctx: ActionCtx,
  start: StartedAttempt
): Promise<PerformResult> => {
  const { details } = start;

  switch (details.kind) {
    case "send_message": {
      if (details.channel === "imessage") {
        return await sendViaPhoton(ctx, start, details);
      }

      if (details.channel === "discord") {
        return await sendViaDiscord(ctx, start, details);
      }

      if (details.channel === "in_app") {
        // Delivery is the message row itself, visible to the linked family member.
        return {
          handleCache: null,
          result: {
            kind: "succeeded",
            reference: null,
            summary: `Delivered in LifeLink to ${details.contactName}.`,
            url: null,
          },
        };
      }

      const mail = mailOf(details);

      if (start.mailbox === null || mail === null) {
        return {
          handleCache: null,
          result: {
            error: "No connected mailbox to send from.",
            kind: "failed_safe",
          },
        };
      }

      return {
        handleCache: null,
        result: fromTool(
          await sendMail(start.mailbox, mail),
          `Email sent to ${details.contactName}.`
        ),
      };
    }

    case "email_draft": {
      const mail = mailOf(details);

      if (start.mailbox === null || mail === null) {
        return {
          handleCache: null,
          result: {
            error: "That mailbox is no longer connected.",
            kind: "failed_safe",
          },
        };
      }

      const where = details.provider === "gmail" ? "Gmail" : "Outlook";

      return {
        handleCache: null,
        result: fromTool(
          await createDraft(start.mailbox, mail),
          `Draft saved in your ${where} Drafts folder. It has not been sent.`
        ),
      };
    }

    case "calendar_event": {
      if (start.mailbox === null) {
        return {
          handleCache: null,
          result: {
            error: "That calendar is no longer connected.",
            kind: "failed_safe",
          },
        };
      }

      const outcome = await createEvent(
        {
          connectedAccountId: start.mailbox.connectedAccountId,
          provider: details.provider,
          userId: start.ownerId,
        },
        {
          endsAt: details.endsAt,
          idempotencyKey: start.idempotencyKey,
          location: details.location,
          startsAt: details.startsAt,
          timeZone: start.timeZone,
          title: details.title,
        }
      );

      return {
        handleCache: null,
        result: fromTool(outcome, "Added to your calendar."),
      };
    }

    case "drive_note": {
      if (start.mailbox === null) {
        return {
          handleCache: null,
          result: {
            error: "That Google Drive is no longer connected.",
            kind: "failed_safe",
          },
        };
      }

      const saved = await saveNote(
        {
          connectedAccountId: start.mailbox.connectedAccountId,
          userId: start.ownerId,
        },
        { body: details.body, title: details.title }
      );

      const result = fromTool(
        saved.outcome,
        "Saved the notes in your Google Drive."
      );

      return {
        handleCache: null,
        result:
          result.kind === "succeeded" ? { ...result, url: saved.url } : result,
      };
    }

    case "grocery_handoff": {
      return {
        handleCache: null,
        result: { error: INSTACART_RETIRED_REASON, kind: "failed_safe" },
      };
    }

    default: {
      return {
        handleCache: null,
        result: {
          error: "This kind of action runs inside the app.",
          kind: "failed_safe",
        },
      };
    }
  }
};

/** Practice mode: clearly simulated outcomes, never presented as real deliveries. */
const performSimulated = (start: StartedAttempt): PerformResult => {
  const { details } = start;

  const simulated = (summary: string): PerformResult => ({
    handleCache: null,
    result: {
      kind: "succeeded",
      reference: `sim_${start.attemptId}`,
      summary: `Practice: ${summary}`,
      url: null,
    },
  });

  switch (details.kind) {
    case "send_message": {
      return simulated(
        `the message to ${details.contactName} was not really sent. A practice reply will arrive shortly.`
      );
    }

    case "email_draft": {
      return simulated("no draft was saved in your real mailbox.");
    }

    case "calendar_event": {
      return simulated("nothing was added to your real calendar.");
    }

    case "drive_note": {
      return simulated("nothing was saved in your real Google Drive.");
    }

    case "grocery_handoff": {
      return {
        handleCache: null,
        result: { error: INSTACART_RETIRED_REASON, kind: "failed_safe" },
      };
    }

    default: {
      return simulated("done.");
    }
  }
};

export const run = internalAction({
  args: { actionId: v.id("actions") },
  handler: async (ctx, args): Promise<void> => {
    const start = await ctx.runMutation(internal.execution.begin, {
      actionId: args.actionId,
    });

    if (!start.ok) {
      return;
    }

    if (isLocalKind(start.details.kind)) {
      await ctx.runMutation(internal.execution.completeLocal, {
        attemptId: start.attemptId,
      });

      return;
    }

    let performed: PerformResult;

    try {
      performed =
        start.mode === "simulated"
          ? performSimulated(start)
          : await performLive(ctx, start);
    } catch (error) {
      // An exception after a provider call may have happened; treat as unknown, never as a safe failure.
      performed = {
        handleCache: null,
        result: {
          error:
            error instanceof Error ? error.message : "Something went wrong.",
          kind: "unknown",
        },
      };
    }

    await ctx.runMutation(internal.execution.complete, {
      attemptId: start.attemptId,
      handleCache: performed.handleCache,
      result: performed.result,
    });
  },
});

// ── Reconciliation of unknown outcomes ────────────────────────────────────

interface UnknownContext {
  conversationId: string | null;
  details: ActionDetails;
  externalUserId: string | null;
  idempotencyKey: string;
  mailbox: MailAccount | null;
  photonRoute: PhotonRoute | null;
  reconciliation: {
    actionId: Id<"actions">;
    attemptId: Id<"executionAttempts">;
    token: string;
  };
  startedAt: number;
}

// Expiry only releases the local check. It never proves a remote send stopped.
const RECONCILIATION_TIMEOUT_MS = 2 * 60 * 1000;

type ReconciliationIdentity = UnknownContext["reconciliation"];

const matchingReconciliation = (
  action: Doc<"actions"> | null,
  identity: ReconciliationIdentity
): action is Doc<"actions"> & {
  reconciliation: NonNullable<Doc<"actions">["reconciliation"]>;
} =>
  action !== null &&
  action.reconciliation?.token === identity.token &&
  action.reconciliation.attemptId === identity.attemptId;

/** Retain uncertainty across an abandoned dispatch, including after lease recovery. */
const expireReconciliation = async (
  ctx: MutationCtx,
  action: Doc<"actions">
): Promise<void> => {
  if (action.reconciliation?.phase === "dispatching") {
    const attempt = await ctx.db.get(action.reconciliation.attemptId);

    if (attempt?.outcome === "unknown") {
      await ctx.db.patch(attempt._id, { photonReconciliationUncertain: true });
    }
  }

  await ctx.db.patch(action._id, { reconciliation: undefined });
};

export const expireReconciliationClaim = internalMutation({
  args: photonReconciliationValidator.fields,
  handler: async (ctx, args) => {
    const action = await ctx.db.get(args.actionId);

    if (
      matchingReconciliation(action, args) &&
      action.reconciliation.expiresAt <= Date.now()
    ) {
      await expireReconciliation(ctx, action);
    }
  },
});

export const releaseReconciliation = internalMutation({
  args: {
    ...photonReconciliationValidator.fields,
    providerFinished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const action = await ctx.db.get(args.actionId);

    if (!matchingReconciliation(action, args)) {
      return;
    }

    // A rejected runAction promise need not stop SDK work. Keep the claim until
    // expiry records a durable uncertainty fence; do not unlock another resend.
    if (
      action.reconciliation.phase === "dispatching" &&
      !args.providerFinished
    ) {
      return;
    }

    await ctx.db.patch(action._id, { reconciliation: undefined });
  },
});

const samePhotonRoute = (first: PhotonRoute, second: PhotonRoute): boolean =>
  first.projectId === second.projectId &&
  first.senderId === second.senderId &&
  first.spaceId === second.spaceId &&
  first.peerUserId === second.peerUserId;

/** A retry may use the captured route only while that same enrollment is still ready. */
const reconcilablePhotonRoute = async (
  ctx: QueryCtx,
  action: Doc<"actions">,
  attempt: Doc<"executionAttempts">,
  details: ActionDetails
): Promise<PhotonRoute | null> => {
  const captured = attempt.photonRoute;

  if (
    captured === undefined ||
    action.mode !== "live" ||
    attempt.mode !== "live" ||
    attempt.provider !== "photon" ||
    attempt.photonReconciliationUncertain === true ||
    action.currentVersion !== attempt.version ||
    details.kind !== "send_message" ||
    details.channel !== "imessage"
  ) {
    return null;
  }

  const current = await readyImessageRoute(
    ctx,
    action.ownerId,
    details.contactId,
    details.address
  );

  return current !== null && samePhotonRoute(current, captured)
    ? captured
    : null;
};

export const claimReconciliation = internalMutation({
  args: { actionId: v.id("actions"), token: v.string() },
  handler: async (ctx, args): Promise<UnknownContext | null> => {
    const action = await ctx.db.get(args.actionId);

    if (action === null || action.status !== "unknown") {
      return null;
    }

    if (action.reconciliation !== undefined) {
      if (action.reconciliation.expiresAt > Date.now()) {
        return null;
      }

      await expireReconciliation(ctx, action);
    }

    const attempts = await ctx.db
      .query("executionAttempts")
      .withIndex("by_action", (index) => index.eq("actionId", action._id))
      .collect();

    const attempt = attempts.find((item) => item.outcome === "unknown");

    const version = await ctx.db
      .query("actionVersions")
      .withIndex("by_action_version", (index) =>
        index.eq("actionId", action._id).eq("version", attempt?.version ?? -1)
      )
      .unique();

    const owner = await ctx.db.get(action.ownerId);

    if (
      attempt === undefined ||
      version === null ||
      owner === null ||
      action.currentVersion !== attempt.version ||
      version.fingerprint !== attempt.fingerprint
    ) {
      return null;
    }

    const cached = await cachedHandleFor(ctx, version.details);

    const reconciliation = {
      actionId: action._id,
      attemptId: attempt._id,
      token: args.token,
    };

    const expiresAt = Date.now() + RECONCILIATION_TIMEOUT_MS;

    await ctx.db.patch(action._id, {
      reconciliation: {
        attemptId: attempt._id,
        expiresAt,
        phase: "claimed",
        token: args.token,
      },
    });
    await ctx.scheduler.runAt(
      expiresAt,
      internal.execution.expireReconciliationClaim,
      reconciliation
    );

    return {
      conversationId: cached.conversationId,
      details: version.details,
      externalUserId: cached.externalUserId,
      idempotencyKey: attempt.idempotencyKey,
      mailbox: await mailboxFor(ctx, version.details, owner._id),
      photonRoute: await reconcilablePhotonRoute(
        ctx,
        action,
        attempt,
        version.details
      ),
      reconciliation,
      startedAt: attempt.startedAt,
    };
  },
});

/** The Node sender must win this transition immediately before its visible write. */
export const authorizePhotonReconciliation = internalMutation({
  args: {
    ...photonReconciliationValidator.fields,
    body: v.string(),
    idempotencyKey: v.string(),
    route: photonRouteValidator,
  },
  handler: async (ctx, args): Promise<boolean> => {
    const action = await ctx.db.get(args.actionId);

    if (
      !matchingReconciliation(action, args) ||
      action.status !== "unknown" ||
      action.reconciliation.phase !== "claimed" ||
      action.reconciliation.expiresAt <= Date.now()
    ) {
      return false;
    }

    const attempt = await ctx.db.get(args.attemptId);

    const version = await ctx.db
      .query("actionVersions")
      .withIndex("by_action_version", (index) =>
        index.eq("actionId", action._id).eq("version", action.currentVersion)
      )
      .unique();

    if (
      attempt === null ||
      attempt.actionId !== action._id ||
      attempt.outcome !== "unknown" ||
      version === null ||
      version.fingerprint !== attempt.fingerprint ||
      attempt.idempotencyKey !== args.idempotencyKey ||
      version.details.kind !== "send_message" ||
      version.details.channel !== "imessage" ||
      version.details.body !== args.body ||
      version.details.photoIds.length > 0
    ) {
      return false;
    }

    const route = await reconcilablePhotonRoute(
      ctx,
      action,
      attempt,
      version.details
    );

    if (route === null || !samePhotonRoute(route, args.route)) {
      return false;
    }

    const approvals = await ctx.db
      .query("approvals")
      .withIndex("by_action", (index) =>
        index.eq("actionId", action._id).eq("version", version.version)
      )
      .collect();

    if (
      !approvals.some(
        (approval) =>
          approval.invalidatedAt === null &&
          approval.fingerprint === version.fingerprint
      )
    ) {
      return false;
    }

    const expiresAt = Date.now() + RECONCILIATION_TIMEOUT_MS;

    await ctx.db.patch(action._id, {
      reconciliation: {
        ...action.reconciliation,
        expiresAt,
        phase: "dispatching",
      },
    });
    await ctx.scheduler.runAt(
      expiresAt,
      internal.execution.expireReconciliationClaim,
      {
        actionId: action._id,
        attemptId: attempt._id,
        token: args.token,
      }
    );

    return true;
  },
});

export const settleFromReconcile = internalMutation({
  args: {
    ...photonReconciliationValidator.fields,
    summary: v.string(),
    wentThrough: v.boolean(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const action = await ctx.db.get(args.actionId);

    if (
      !matchingReconciliation(action, args) ||
      action.status !== "unknown" ||
      action.reconciliation.expiresAt <= Date.now()
    ) {
      return false;
    }

    const attempt = await ctx.db.get(args.attemptId);

    if (
      attempt === null ||
      attempt.actionId !== action._id ||
      attempt.outcome !== "unknown" ||
      attempt.version !== action.currentVersion ||
      (attempt.provider === "photon" &&
        action.reconciliation.phase !== "dispatching")
    ) {
      return false;
    }

    const version = await ctx.db
      .query("actionVersions")
      .withIndex("by_action_version", (index) =>
        index.eq("actionId", action._id).eq("version", action.currentVersion)
      )
      .unique();

    if (version === null || version.fingerprint !== attempt.fingerprint) {
      return false;
    }

    await settleUnknownAttempt(
      ctx,
      action,
      args.wentThrough,
      args.summary,
      args.token
    );

    const updated = await ctx.db.get(args.actionId);

    if (updated === null) {
      throw new Error("The reconciled action no longer exists.");
    }

    if (version.details.kind === "send_message") {
      await upsertOutgoingMessage(
        ctx,
        updated,
        version.details,
        args.wentThrough ? "sent" : "failed",
        null
      );
    }

    await (args.wentThrough
      ? afterActionSucceeded(ctx, updated, version.details)
      : afterActionFailed(ctx, updated));

    return true;
  },
});

type ReconcileVerdict = "cannot_tell" | "not_sent" | "went_through";

interface Reconciliation {
  summary: string;
  verdict: ReconcileVerdict;
}

const CANNOT_TELL: Reconciliation = { summary: "", verdict: "cannot_tell" };

/** Stable clientMessageId deduplicates the exact approved write across invocations. */
const reconcilePhoton = async (
  ctx: ActionCtx,
  context: UnknownContext,
  body: string
): Promise<Reconciliation> => {
  const config = photonConfig();
  const route = context.photonRoute;

  if (
    config === null ||
    route === null ||
    config.projectId !== route.projectId
  ) {
    return CANNOT_TELL;
  }

  const resent: PhotonResult = await ctx.runAction(
    internal.integrations.photonruntime.send,
    {
      body,
      idempotencyKey: context.idempotencyKey,
      photoStorageIds: [],
      reconciliation: context.reconciliation,
      route,
    }
  );

  if (resent.kind === "ok") {
    return {
      summary: resent.replayed
        ? "Photon confirmed it accepted the earlier iMessage for delivery."
        : "Photon accepted the iMessage for delivery under the same approval.",
      verdict: "went_through",
    };
  }

  // A refusal now does not establish what happened to the original timed-out send.
  return CANNOT_TELL;
};

const reconcileDiscord = async (
  context: UnknownContext,
  body: string
): Promise<Reconciliation> => {
  const token = botToken();

  if (token === null || context.conversationId === null) {
    return CANNOT_TELL;
  }

  const lookup = await findSentMessage(
    token,
    context.conversationId,
    body,
    context.startedAt
  );

  if (lookup.found === null) {
    return CANNOT_TELL;
  }

  return lookup.found
    ? {
        summary: "Found the message in the Discord conversation.",
        verdict: "went_through",
      }
    : {
        summary:
          "The message is not in the Discord conversation, so it did not go through.",
        verdict: "not_sent",
      };
};

const reconcileMail = async (
  context: UnknownContext,
  mailbox: MailAccount
): Promise<Reconciliation> => {
  const mail = mailOf(context.details);

  if (mail === null) {
    return CANNOT_TELL;
  }

  const found = await findMail(
    mailbox,
    mail,
    context.startedAt,
    context.details.kind === "email_draft" ? "drafts" : "sent"
  );

  if (found === "cannot_tell") {
    return CANNOT_TELL;
  }

  return found === "found"
    ? { summary: "Found it in your mailbox.", verdict: "went_through" }
    : {
        summary: "It is not in your mailbox, so it did not go through.",
        verdict: "not_sent",
      };
};

const reconcileCalendar = async (
  context: UnknownContext,
  mailbox: MailAccount,
  provider: "google_calendar" | "outlook"
): Promise<Reconciliation> => {
  const found = await findEvent(
    {
      connectedAccountId: mailbox.connectedAccountId,
      provider,
      userId: mailbox.userId,
    },
    context.idempotencyKey
  );

  if (found === "cannot_tell") {
    return CANNOT_TELL;
  }

  return found === "found"
    ? { summary: "Found the event on your calendar.", verdict: "went_through" }
    : { summary: "The event is not on your calendar.", verdict: "not_sent" };
};

const reconcileDrive = async (
  context: UnknownContext,
  mailbox: MailAccount,
  title: string
): Promise<Reconciliation> => {
  const found = await findNote(
    { connectedAccountId: mailbox.connectedAccountId, userId: mailbox.userId },
    title,
    context.startedAt
  );

  if (found === "cannot_tell") {
    return CANNOT_TELL;
  }

  return found === "found"
    ? {
        summary: "Found the notes in your Google Drive.",
        verdict: "went_through",
      }
    : {
        summary: "The notes are not in your Google Drive.",
        verdict: "not_sent",
      };
};

/** Ask the provider what happened to an uncertain attempt. */
const reconcileWithProvider = async (
  ctx: ActionCtx,
  context: UnknownContext
): Promise<Reconciliation> => {
  const { details, mailbox } = context;

  if (details.kind === "send_message" && details.channel === "imessage") {
    // Replaying only the text cannot confirm whether every photo was accepted.
    if (details.photoIds.length > 0) {
      return CANNOT_TELL;
    }

    return await reconcilePhoton(ctx, context, details.body);
  }

  if (details.kind === "send_message" && details.channel === "discord") {
    return await reconcileDiscord(context, details.body);
  }

  if (mailbox === null) {
    return CANNOT_TELL;
  }

  if (details.kind === "calendar_event") {
    return await reconcileCalendar(context, mailbox, details.provider);
  }

  if (details.kind === "drive_note") {
    return await reconcileDrive(context, mailbox, details.title);
  }

  const isMail =
    details.kind === "email_draft" ||
    (details.kind === "send_message" && details.channel === "email");

  return isMail ? await reconcileMail(context, mailbox) : CANNOT_TELL;
};

export const reconcile = internalAction({
  args: { actionId: v.id("actions") },
  handler: async (ctx, args): Promise<ReconcileVerdict> => {
    const context: UnknownContext | null = await ctx.runMutation(
      internal.execution.claimReconciliation,
      { actionId: args.actionId, token: crypto.randomUUID() }
    );

    if (context === null) {
      return "cannot_tell";
    }

    let providerFinished = false;

    try {
      const { summary, verdict } = await reconcileWithProvider(ctx, context);

      providerFinished = true;

      if (verdict === "cannot_tell") {
        return verdict;
      }

      const settled: boolean = await ctx.runMutation(
        internal.execution.settleFromReconcile,
        {
          ...context.reconciliation,
          summary,
          wentThrough: verdict === "went_through",
        }
      );

      return settled ? verdict : "cannot_tell";
    } catch {
      return "cannot_tell";
    } finally {
      await ctx.runMutation(internal.execution.releaseReconciliation, {
        ...context.reconciliation,
        providerFinished,
      });
    }
  },
});

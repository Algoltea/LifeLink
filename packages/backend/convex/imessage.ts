import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import type { ActionCtx, MutationCtx } from "./_generated/server";
import { ensureSharedAssignment, photonConfig } from "./integrations/photon";
import type {
  PhotonAssignment,
  PhotonConfig,
  PhotonConversationResult,
} from "./integrations/photon";
import { audit } from "./lib/audit";
import { developerConfigured } from "./lib/capabilities";
import { readEnv } from "./lib/env";
import {
  acceptImessageConversation,
  contactImessageHandle,
  conversationValidator,
  currentEnrollmentContact,
} from "./lib/imessage";
import { requireOwned, requireOwner } from "./lib/session";

const PHONE_HANDLE = /^\+[1-9]\d{6,14}$/u;
const EMAIL_HANDLE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const REGISTRATION_TIMEOUT_MS = 60_000;

interface RegistrationInput {
  enrollmentId: Id<"imessageEnrollments">;
  generation: number;
  handle: string;
  projectId: string;
}

interface RefreshInput extends RegistrationInput {
  assignment: PhotonAssignment;
}

const registrationIdentity = (
  owner: Doc<"profiles">,
  contact: Doc<"contacts">
) => {
  if (owner.demoMode || contact.sample) {
    throw new ConvexError({
      code: "practice_mode",
      message:
        "Turn off practice mode and choose a real contact before setting up iMessage.",
    });
  }

  const projectId = readEnv("SPECTRUM_PROJECT_ID");

  if (projectId === null || !developerConfigured("photon")) {
    throw new ConvexError({
      code: "not_configured",
      message: "iMessage is not configured for this app yet.",
    });
  }

  const handle = contactImessageHandle(contact);

  if (
    handle === null ||
    !(PHONE_HANDLE.test(handle) || EMAIL_HANDLE.test(handle))
  ) {
    throw new ConvexError({
      code: "invalid_handle",
      message:
        "Enter their iMessage number with + and the country code, or their exact Apple-account email.",
    });
  }

  return { handle, projectId };
};

const assertEnrollmentAvailable = async (
  ctx: MutationCtx,
  existing: Doc<"imessageEnrollments"> | null,
  contact: Doc<"contacts">
): Promise<void> => {
  if (existing === null) {
    return;
  }

  if (existing.ownerId !== contact.ownerId) {
    throw new ConvexError({
      code: "address_in_use",
      message:
        "This iMessage address is already linked to another LifeLink account. Use another way to reach this person.",
    });
  }

  if (existing.contactId === contact._id) {
    return;
  }

  const previousContact = await ctx.db.get(existing.contactId);

  if (
    previousContact !== null &&
    contactImessageHandle(previousContact) === existing.handle
  ) {
    throw new ConvexError({
      code: "address_in_use",
      message:
        "This iMessage address is already linked to another contact in your circle.",
    });
  }
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const projectId = readEnv("SPECTRUM_PROJECT_ID");

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .collect();

    const enrollments = await ctx.db
      .query("imessageEnrollments")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .collect();

    return {
      configured: developerConfigured("photon"),
      contacts: contacts.flatMap((contact) => {
        const handle = contactImessageHandle(contact);

        if (handle === null) {
          return [];
        }

        const enrollment = enrollments.find(
          (item) =>
            item.protocol === "spectrum" &&
            item.projectId === projectId &&
            item.contactId === contact._id &&
            item.handle === handle
        );

        return [
          {
            assignedNumber: enrollment?.assignedNumber ?? null,
            contactId: contact._id,
            error: enrollment?.error ?? null,
            handle,
            status: enrollment?.status ?? ("not_registered" as const),
          },
        ];
      }),
      practiceMode: owner.demoMode,
    };
  },
});

export const beginRegistration = internalMutation({
  args: { confirmedHandle: v.string(), contactId: v.id("contacts") },
  handler: async (ctx, args): Promise<RegistrationInput | null> => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const { handle, projectId } = registrationIdentity(owner, contact);

    if (handle !== args.confirmedHandle) {
      throw new ConvexError({
        code: "contact_changed",
        message:
          "This contact’s iMessage address changed. Review it again before registering.",
      });
    }

    const existing = await ctx.db
      .query("imessageEnrollments")
      .withIndex("by_project_handle", (index) =>
        index.eq("projectId", projectId).eq("handle", handle)
      )
      .unique();

    await assertEnrollmentAvailable(ctx, existing, contact);

    const now = Date.now();
    const sameContact = existing?.contactId === contact._id;

    if (
      existing !== null &&
      sameContact &&
      existing.protocol === "spectrum" &&
      (existing.status === "waiting" ||
        (existing.status === "ready" && existing.agentUserId === "shared"))
    ) {
      return null;
    }

    if (
      existing !== null &&
      sameContact &&
      existing.protocol === "spectrum" &&
      existing.status === "registering" &&
      now - existing.updatedAt < REGISTRATION_TIMEOUT_MS
    ) {
      return null;
    }

    const generation = (existing?.generation ?? 0) + 1;

    const values = {
      agentUserId: null,
      assignedNumber: null,
      assignmentCreatedAt: null,
      assignmentId: null,
      contactId: contact._id,
      error: null,
      generation,
      handle,
      lastIncomingAt: null,
      lastIncomingId: null,
      ownerId: owner._id,
      peerUserId: null,
      projectId,
      protocol: "spectrum" as const,
      spaceId: null,
      status: "registering" as const,
      updatedAt: now,
    };

    const enrollmentId =
      existing === null
        ? await ctx.db.insert("imessageEnrollments", {
            ...values,
            createdAt: now,
          })
        : existing._id;

    if (existing !== null) {
      await ctx.db.patch(existing._id, values);
    }

    await ctx.scheduler.runAfter(
      REGISTRATION_TIMEOUT_MS,
      internal.imessage.expireRegistration,
      { enrollmentId, generation }
    );

    await audit(ctx, {
      actor: "person",
      detail: `Requested shared iMessage setup for ${contact.name}. No invitation or message was sent.`,
      event: "imessage.registration_requested",
      ownerId: owner._id,
    });

    return { enrollmentId, generation, handle, projectId };
  },
});

export const expireRegistration = internalMutation({
  args: { enrollmentId: v.id("imessageEnrollments"), generation: v.number() },
  handler: async (ctx, args): Promise<void> => {
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (
      enrollment === null ||
      enrollment.generation !== args.generation ||
      enrollment.status !== "registering"
    ) {
      return;
    }

    await ctx.db.patch(enrollment._id, {
      error:
        "Setup did not finish. Try again; any existing Photon registration will be reused.",
      status: "failed",
      updatedAt: Date.now(),
    });
  },
});

export const registrationAllowed = internalQuery({
  args: {
    enrollmentId: v.id("imessageEnrollments"),
    generation: v.number(),
    handle: v.string(),
    projectId: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const owner = await requireOwner(ctx);
    const enrollment = await ctx.db.get(args.enrollmentId);

    return (
      enrollment !== null &&
      enrollment.ownerId === owner._id &&
      enrollment.status === "registering" &&
      enrollment.generation === args.generation &&
      enrollment.handle === args.handle &&
      enrollment.projectId === args.projectId &&
      developerConfigured("photon") &&
      (await currentEnrollmentContact(ctx, enrollment)) !== null
    );
  },
});

export const finishRegistration = internalMutation({
  args: {
    assignedNumber: v.union(v.string(), v.null()),
    assignmentCreatedAt: v.union(v.number(), v.null()),
    assignmentId: v.union(v.string(), v.null()),
    enrollmentId: v.id("imessageEnrollments"),
    error: v.union(v.string(), v.null()),
    generation: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (
      enrollment === null ||
      enrollment.generation !== args.generation ||
      enrollment.status !== "registering"
    ) {
      return;
    }

    await ctx.db.patch(enrollment._id, {
      assignedNumber: args.assignedNumber,
      assignmentCreatedAt: args.assignmentCreatedAt,
      assignmentId: args.assignmentId,
      error: args.error,
      status: args.error === null ? "waiting" : "failed",
      updatedAt: Date.now(),
    });
  },
});

export const refreshInput = internalQuery({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args): Promise<RefreshInput> => {
    const owner = await requireOwner(ctx);

    const contact = requireOwned(
      await ctx.db.get(args.contactId),
      owner,
      "contact"
    );

    const handle = contactImessageHandle(contact);
    const projectId = readEnv("SPECTRUM_PROJECT_ID");

    const enrollment =
      projectId === null || handle === null
        ? null
        : await ctx.db
            .query("imessageEnrollments")
            .withIndex("by_project_handle", (index) =>
              index.eq("projectId", projectId).eq("handle", handle)
            )
            .unique();

    if (
      enrollment === null ||
      enrollment.ownerId !== owner._id ||
      enrollment.contactId !== contact._id ||
      enrollment.assignmentId === null ||
      enrollment.assignedNumber === null ||
      enrollment.assignmentCreatedAt === null ||
      (await currentEnrollmentContact(ctx, enrollment)) === null
    ) {
      throw new ConvexError({
        code: "not_registered",
        message:
          "Set up iMessage for this contact outside practice mode first.",
      });
    }

    return {
      assignment: {
        assignedNumber: enrollment.assignedNumber,
        assignmentId: enrollment.assignmentId,
        createdAt: enrollment.assignmentCreatedAt,
        handle: enrollment.handle,
        projectId: enrollment.projectId,
      },
      enrollmentId: enrollment._id,
      generation: enrollment.generation,
      handle: enrollment.handle,
      projectId: enrollment.projectId,
    };
  },
});

export const finishRefresh = internalMutation({
  args: {
    conversation: v.union(conversationValidator, v.null()),
    enrollmentId: v.id("imessageEnrollments"),
    error: v.union(v.string(), v.null()),
    generation: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (
      enrollment === null ||
      enrollment.generation !== args.generation ||
      (await currentEnrollmentContact(ctx, enrollment)) === null
    ) {
      return;
    }

    if (
      args.conversation !== null &&
      args.conversation.projectId === enrollment.projectId &&
      args.conversation.handle === enrollment.handle
    ) {
      await acceptImessageConversation(ctx, args.conversation);

      return;
    }

    await ctx.db.patch(enrollment._id, {
      error: args.error,
      updatedAt: Date.now(),
    });
  },
});

const refreshConversation = async (
  ctx: ActionCtx,
  contactId: Id<"contacts">,
  config: PhotonConfig
): Promise<void> => {
  const input: RefreshInput = await ctx.runQuery(
    internal.imessage.refreshInput,
    { contactId }
  );

  if (input.projectId !== config.projectId) {
    throw new ConvexError({
      code: "project_changed",
      message: "iMessage configuration changed. Set up this contact again.",
    });
  }

  const result: PhotonConversationResult = await ctx.runAction(
    internal.integrations.photonruntime.conversation,
    { assignment: input.assignment }
  );

  await ctx.runMutation(internal.imessage.finishRefresh, {
    conversation: result.kind === "ok" ? result.conversation : null,
    enrollmentId: input.enrollmentId,
    error: result.kind === "ok" ? null : result.error,
    generation: input.generation,
  });

  if (result.kind !== "ok") {
    throw new ConvexError({
      code: "provider_unavailable",
      message: result.error,
    });
  }
};

export const register = action({
  args: { confirmedHandle: v.string(), contactId: v.id("contacts") },
  handler: async (ctx, args): Promise<null> => {
    const input: RegistrationInput | null = await ctx.runMutation(
      internal.imessage.beginRegistration,
      args
    );

    if (input === null) {
      return null;
    }

    const config = photonConfig();

    if (config === null || config.projectId !== input.projectId) {
      throw new ConvexError({
        code: "not_configured",
        message: "iMessage configuration changed. Try again.",
      });
    }

    const allowed: boolean = await ctx.runQuery(
      internal.imessage.registrationAllowed,
      input
    );

    if (!allowed) {
      return null;
    }

    const result = await ensureSharedAssignment(config, input.handle);

    await ctx.runMutation(internal.imessage.finishRegistration, {
      assignedNumber:
        result.kind === "ok" ? result.assignment.assignedNumber : null,
      assignmentCreatedAt:
        result.kind === "ok" ? result.assignment.createdAt : null,
      assignmentId:
        result.kind === "ok" ? result.assignment.assignmentId : null,
      enrollmentId: input.enrollmentId,
      error: result.kind === "ok" ? null : result.error,
      generation: input.generation,
    });

    if (result.kind !== "ok") {
      throw new ConvexError({
        code: "registration_failed",
        message: result.error,
      });
    }

    await refreshConversation(ctx, args.contactId, config);

    return null;
  },
});

export const refresh = action({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args): Promise<null> => {
    const config = photonConfig();

    if (config === null) {
      throw new ConvexError({
        code: "not_configured",
        message: "iMessage is not configured for this app yet.",
      });
    }

    await refreshConversation(ctx, args.contactId, config);

    return null;
  },
});

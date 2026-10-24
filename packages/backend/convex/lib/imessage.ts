import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { PhotonConversation } from "../integrations/photon";
import { readEnv } from "./env";

type ReaderCtx = MutationCtx | QueryCtx;

interface PhotonRoute {
  peerUserId: string;
  projectId: string;
  senderId: string;
  spaceId: string;
}

const photonRouteValidator = v.object({
  peerUserId: v.string(),
  projectId: v.string(),
  senderId: v.string(),
  spaceId: v.string(),
});

const photonReconciliationValidator = v.object({
  actionId: v.id("actions"),
  attemptId: v.id("executionAttempts"),
  token: v.string(),
});

const conversationValidator = v.object({
  agentHandle: v.string(),
  handle: v.string(),
  messageId: v.string(),
  peerUserId: v.string(),
  projectId: v.string(),
  receivedAt: v.number(),
  senderId: v.string(),
  spaceId: v.string(),
});

const contactImessageHandle = (contact: Doc<"contacts">): string | null =>
  contact.channels
    .find((channel) => channel.channel === "imessage")
    ?.address.trim() ?? null;

const currentEnrollmentContact = async (
  ctx: ReaderCtx,
  enrollment: Doc<"imessageEnrollments">
): Promise<Doc<"contacts"> | null> => {
  const contact = await ctx.db.get(enrollment.contactId);
  const owner = await ctx.db.get(enrollment.ownerId);

  if (
    enrollment.protocol !== "spectrum" ||
    contact === null ||
    contact.ownerId !== enrollment.ownerId ||
    contact.sample ||
    contactImessageHandle(contact) !== enrollment.handle ||
    owner === null ||
    owner.role !== "owner" ||
    owner.demoMode ||
    enrollment.projectId !== readEnv("SPECTRUM_PROJECT_ID")
  ) {
    return null;
  }

  return contact;
};

const readyImessageRoute = async (
  ctx: ReaderCtx,
  ownerId: Id<"profiles">,
  contactId: string,
  address: string
): Promise<PhotonRoute | null> => {
  const projectId = readEnv("SPECTRUM_PROJECT_ID");

  if (projectId === null) {
    return null;
  }

  const enrollment = await ctx.db
    .query("imessageEnrollments")
    .withIndex("by_project_handle", (index) =>
      index.eq("projectId", projectId).eq("handle", address.trim())
    )
    .unique();

  if (
    enrollment === null ||
    enrollment.ownerId !== ownerId ||
    enrollment.contactId !== contactId ||
    enrollment.status !== "ready" ||
    enrollment.agentUserId !== "shared" ||
    enrollment.peerUserId !== enrollment.handle ||
    enrollment.spaceId === null ||
    (await currentEnrollmentContact(ctx, enrollment)) === null
  ) {
    return null;
  }

  return {
    peerUserId: enrollment.peerUserId,
    projectId,
    senderId: enrollment.agentUserId,
    spaceId: enrollment.spaceId,
  };
};

/** Bind a provider-verified direct conversation to one explicitly enrolled contact. */
const acceptImessageConversation = async (
  ctx: MutationCtx,
  conversation: PhotonConversation
): Promise<Doc<"imessageEnrollments"> | null> => {
  const enrollment = await ctx.db
    .query("imessageEnrollments")
    .withIndex("by_project_handle", (index) =>
      index
        .eq("projectId", conversation.projectId)
        .eq("handle", conversation.handle)
    )
    .unique();

  if (
    enrollment === null ||
    enrollment.assignmentId === null ||
    conversation.agentHandle !== "shared" ||
    conversation.senderId !== "shared" ||
    conversation.peerUserId !== enrollment.handle ||
    enrollment.assignmentCreatedAt === null ||
    conversation.receivedAt < enrollment.assignmentCreatedAt ||
    !Number.isFinite(conversation.receivedAt) ||
    conversation.senderId === conversation.peerUserId ||
    (enrollment.status !== "waiting" && enrollment.status !== "ready") ||
    (await currentEnrollmentContact(ctx, enrollment)) === null
  ) {
    return null;
  }

  // Older deliveries must not replace a more recently verified route.
  if (
    enrollment.lastIncomingAt === null ||
    conversation.receivedAt >= enrollment.lastIncomingAt
  ) {
    await ctx.db.patch(enrollment._id, {
      agentUserId: conversation.senderId,
      error: null,
      lastIncomingAt: conversation.receivedAt,
      lastIncomingId: conversation.messageId,
      peerUserId: conversation.peerUserId,
      spaceId: conversation.spaceId,
      status: "ready",
      updatedAt: Date.now(),
    });
  }

  return enrollment;
};

export {
  acceptImessageConversation,
  contactImessageHandle,
  conversationValidator,
  currentEnrollmentContact,
  photonReconciliationValidator,
  photonRouteValidator,
  readyImessageRoute,
};

export type { PhotonRoute };

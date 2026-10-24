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

/**
 * Sent once, above the first message in a new iMessage conversation, so the
 * recipient knows who this number is (and iOS can suggest saving it). Only the
 * recipient sees it: LifeLink's own thread and review show the message alone.
 */
const imessageIntroduction = (ownerName: string): string =>
  [
    `LifeLink: This conversation is connected to ${ownerName}'s LifeLink account. Messages from this number are sent on ${ownerName}'s behalf, and your replies go directly to ${ownerName}. Save this number as "LifeLink" to recognize future messages.`,
    "",
    `Message from ${ownerName}:`,
  ].join("\n");

/** What actually goes out: the introduction, when there is one, then the approved words unchanged. */
const withIntroduction = (introduction: string | null, body: string): string =>
  introduction === null ? body : `${introduction}\n${body}`;

/** The ready conversation behind this send, while it still needs its introduction. */
const enrollmentNeedingIntroduction = async (
  ctx: ReaderCtx,
  ownerId: Id<"profiles">,
  contactId: string,
  address: string
): Promise<Doc<"imessageEnrollments"> | null> => {
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

  const needsIntroduction =
    enrollment !== null &&
    enrollment.ownerId === ownerId &&
    enrollment.contactId === contactId &&
    !enrollment.introducedAt;

  return needsIntroduction ? enrollment : null;
};

/** Once a send that carried the introduction is confirmed, later messages go without it. */
const markIntroduced = async (
  ctx: MutationCtx,
  attempt: Doc<"executionAttempts">
): Promise<void> => {
  const enrollmentId = attempt.imessageIntroduction?.enrollmentId;

  const enrollment =
    enrollmentId === undefined ? null : await ctx.db.get(enrollmentId);

  if (enrollment !== null && !enrollment.introducedAt) {
    await ctx.db.patch(enrollment._id, { introducedAt: Date.now() });
  }
};

export {
  acceptImessageConversation,
  contactImessageHandle,
  conversationValidator,
  currentEnrollmentContact,
  enrollmentNeedingIntroduction,
  imessageIntroduction,
  markIntroduced,
  photonReconciliationValidator,
  photonRouteValidator,
  readyImessageRoute,
  withIntroduction,
};

export type { PhotonRoute };

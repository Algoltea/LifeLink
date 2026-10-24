import type { Id } from "../convex/_generated/dataModel";
import type { PhotonConversation } from "../convex/integrations/photon";
import type { Backend } from "./harness";

const PROJECT_ID = "10000000-0000-4000-8000-000000000001";
const CONTACT_HANDLE = "+15555550142";
const ASSIGNED_NUMBER = "+15555550999";

const conversationForContact = (): PhotonConversation => ({
  agentHandle: "shared",
  handle: CONTACT_HANDLE,
  messageId: "spc-msg-first",
  peerUserId: CONTACT_HANDLE,
  projectId: PROJECT_ID,
  receivedAt: 2000,
  senderId: "shared",
  spaceId: "any;-;+15555550142",
});

const enrollContact = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  contactId: Id<"contacts">
): Promise<Id<"imessageEnrollments">> =>
  await backend.run(
    async (ctx) =>
      await ctx.db.insert("imessageEnrollments", {
        agentUserId: null,
        assignedNumber: ASSIGNED_NUMBER,
        assignmentCreatedAt: 1000,
        assignmentId: "10000000-0000-4000-8000-000000000002",
        contactId,
        createdAt: Date.now(),
        error: null,
        generation: 1,
        handle: CONTACT_HANDLE,
        lastIncomingAt: null,
        lastIncomingId: null,
        ownerId,
        peerUserId: null,
        projectId: PROJECT_ID,
        protocol: "spectrum",
        spaceId: null,
        status: "waiting",
        updatedAt: Date.now(),
      })
  );

export {
  ASSIGNED_NUMBER,
  CONTACT_HANDLE,
  conversationForContact,
  enrollContact,
  PROJECT_ID,
};

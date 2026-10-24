import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { audit } from "./audit";

interface Incoming {
  body: string;
  channel: Doc<"messages">["channel"];
  contactId: Id<"contacts">;
  mode: "live" | "simulated";
  ownerId: Id<"profiles">;
  photoIds: Id<"_storage">[];
  providerMessageId: string | null;
}

/**
 * Store an incoming message once (de-duplicated by provider id) and, when a
 * ride task is waiting for this person, ask the classifier to read it.
 * An incoming message can never approve, confirm, or spend anything.
 */
const recordIncoming = async (
  ctx: MutationCtx,
  incoming: Incoming
): Promise<Id<"messages"> | null> => {
  if (incoming.providerMessageId !== null) {
    const duplicate = await ctx.db
      .query("messages")
      .withIndex("by_provider_message", (index) =>
        index.eq("providerMessageId", incoming.providerMessageId)
      )
      .first();

    if (duplicate !== null) {
      return null;
    }
  }

  const now = Date.now();

  const messageId = await ctx.db.insert("messages", {
    actionId: null,
    body: incoming.body.slice(0, 4000),
    channel: incoming.channel,
    contactId: incoming.contactId,
    createdAt: now,
    direction: "incoming",
    mode: incoming.mode,
    ownerId: incoming.ownerId,
    photoIds: incoming.photoIds,
    providerMessageId: incoming.providerMessageId,
    status: "received",
    statusUpdatedAt: now,
    taskId: null,
  });

  const waiting = await ctx.db
    .query("tasks")
    .withIndex("by_contact_status", (index) =>
      index
        .eq("contactId", incoming.contactId)
        .eq("status", "waiting_for_reply")
    )
    .collect();

  const task = waiting.find(
    (candidate) =>
      candidate.ownerId === incoming.ownerId &&
      candidate.kind === "ride_request"
  );

  if (task !== undefined) {
    await ctx.db.patch(messageId, { taskId: task._id });
    await ctx.scheduler.runAfter(0, internal.replies.classifyReply, {
      messageId,
      taskId: task._id,
    });
  }

  await audit(ctx, {
    actor: "provider",
    detail: `New ${incoming.channel} message received.`,
    event: "message.received",
    ownerId: incoming.ownerId,
    taskId: task?._id ?? null,
  });

  return messageId;
};

export { recordIncoming };

export type { Incoming };

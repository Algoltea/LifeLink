"use node";

// Explicit external references make Convex install the SDK's dynamic gRPC peers.
import "@grpc/grpc-js";
import "nice-grpc";
import "nice-grpc-common";
import {
  createGrpcClient,
  IMessageError,
  NotFoundError,
} from "@photon-ai/advanced-imessage/grpc";
import type {
  AttachmentInput,
  Chat,
  Message,
  MessageListFilter,
  SendOptions,
} from "@photon-ai/advanced-imessage/grpc";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import {
  photonReconciliationValidator,
  photonRouteValidator,
} from "../lib/imessage";
import type { PhotonRoute } from "../lib/imessage";
import { issueSharedToken, photonConfig } from "./photon";
import type {
  PhotonConversationResult,
  PhotonAssignment,
  PhotonFailure,
  PhotonResult,
} from "./photon";

type SendReceipt = Pick<Message, "guid" | "sendErrorCode">;

type IncomingMessage = Pick<
  Message,
  "chatGuids" | "dateCreated" | "guid" | "isFromMe" | "sender"
>;

interface PhotonClient {
  attachments: {
    upload: (
      input: AttachmentInput
    ) => Promise<{ attachment: { guid: string } }>;
  };
  chats: { get: (id: string) => Promise<Pick<Chat, "participants">> };
  close: () => Promise<void>;
  messages: {
    listInChat: (
      id: string,
      filter: MessageListFilter
    ) => Promise<{
      messages: readonly IncomingMessage[];
      nextPageToken?: string;
    }>;
    sendAttachment: (
      chat: string,
      attachment: string,
      options: SendOptions
    ) => Promise<SendReceipt>;
    sendText: (
      chat: string,
      text: string,
      options: SendOptions
    ) => Promise<SendReceipt>;
  };
}

/** A narrow transport boundary shared by Node actions and offline adapter checks. */
export const photonTransport = {
  createClient: (token: string): PhotonClient =>
    createGrpcClient({
      address: "imessage.spectrum.photon.codes:443",
      autoIdempotency: true,
      retry: false,
      timeout: 25_000,
      tls: true,
      token,
    }),
};

export type { PhotonClient };

const SAFE_REFUSALS = new Set([
  "unauthenticated",
  "tokenExpired",
  "tokenBlocked",
  "unauthorized",
  "dailyLimitExceeded",
  "recipientLimitExceeded",
  "uploadRateExceeded",
  "contentDuplicateExceeded",
  "burstRateExceeded",
  "newContactThrottled",
  "recipientCoolingDown",
  "recipientLocked",
  "sendReceiveRatioExceeded",
  "invalidArgument",
  "preconditionFailed",
  "operationNotSupported",
  "attachmentNotReady",
  "privateApiUnavailable",
  "chatNotFound",
  "attachmentNotFound",
]);

// oxlint-disable-next-line anti-slop/no-unknown-parameters -- SDK exception boundary; only typed, documented refusal codes are trusted below.
const sdkFailure = (error: unknown): PhotonFailure => ({
  error:
    "Spectrum could not confirm this iMessage request. Review its outcome before retrying.",
  kind:
    error instanceof IMessageError && SAFE_REFUSALS.has(error.code)
      ? "rejected"
      : "uncertain",
});

const clientForProject = async (
  projectId: string
): Promise<{ client: PhotonClient; kind: "ok" } | PhotonFailure> => {
  const config = photonConfig();

  if (config === null || config.projectId !== projectId) {
    return {
      error: "iMessage configuration changed. Review this contact's setup.",
      kind: "rejected",
    };
  }

  const token = await issueSharedToken(config);

  if (token.kind !== "ok") {
    return token;
  }

  return {
    client: photonTransport.createClient(token.token),
    kind: "ok",
  };
};

const sendResult = async (
  send: () => Promise<SendReceipt>,
  key: string
): Promise<PhotonResult> => {
  try {
    const message = await send();

    return message.guid && message.sendErrorCode === 0
      ? { id: message.guid, kind: "ok", replayed: false }
      : {
          error:
            "Spectrum returned an incomplete or unsuccessful send receipt.",
          kind: "uncertain",
        };
  } catch (error) {
    // The published 2.3.0 SDK documents this as proof the original send succeeded.
    // The synthetic reference identifies our operation; it is not a provider message GUID.
    if (error instanceof IMessageError && error.code === "duplicateMessage") {
      return { id: `spectrum-client:${key}`, kind: "ok", replayed: true };
    }

    return sdkFailure(error);
  }
};

const validSend = (route: PhotonRoute, key: string, body: string): boolean =>
  route.senderId === "shared" &&
  route.peerUserId.length > 0 &&
  route.spaceId.length > 0 &&
  key.length > 0 &&
  body.trim().length > 0;

const matchingIncoming = (
  message: IncomingMessage,
  assignment: PhotonAssignment,
  spaceId: string
): boolean =>
  !message.isFromMe &&
  message.sender?.address === assignment.handle &&
  message.chatGuids.includes(spaceId) &&
  Number.isFinite(message.dateCreated.getTime()) &&
  message.dateCreated.getTime() >= assignment.createdAt;

export const send = internalAction({
  args: {
    body: v.string(),
    idempotencyKey: v.string(),
    photoStorageIds: v.array(v.id("_storage")),
    reconciliation: v.optional(photonReconciliationValidator),
    route: photonRouteValidator,
  },
  handler: async (ctx, args): Promise<PhotonResult> => {
    if (!validSend(args.route, args.idempotencyKey, args.body)) {
      return {
        error: "The approved shared iMessage route is unavailable.",
        kind: "rejected",
      };
    }

    // Load every approved image before any visible send, so missing files cannot be omitted.
    const photos = await Promise.all(
      args.photoStorageIds.map(async (id) => await ctx.storage.get(id))
    );

    if (photos.some((photo) => photo === null)) {
      return {
        error:
          "An approved photo is no longer available. Review this message again.",
        kind: "rejected",
      };
    }

    let client: PhotonClient | null = null;
    let sentAny = false;

    try {
      const connected = await clientForProject(args.route.projectId);

      if (connected.kind !== "ok") {
        return connected;
      }

      ({ client } = connected);
      // A captured provider chat must still identify the exact approved recipient.
      const chat = await client.chats.get(args.route.spaceId);

      if (
        chat.participants.length !== 1 ||
        chat.participants[0]?.address !== args.route.peerUserId
      ) {
        return {
          error: "The iMessage conversation no longer matches this contact.",
          kind: "rejected",
        };
      }

      const availablePhotos = photos.flatMap((photo) =>
        photo === null ? [] : [photo]
      );

      if (args.reconciliation !== undefined) {
        const authorized: boolean =
          availablePhotos.length === 0 &&
          (await ctx.runMutation(
            internal.execution.authorizePhotonReconciliation,
            {
              ...args.reconciliation,
              body: args.body,
              idempotencyKey: args.idempotencyKey,
              route: args.route,
            }
          ));

        if (!authorized) {
          return {
            error: "This iMessage outcome check is no longer authorized.",
            kind: "uncertain",
          };
        }
      }

      for (const [index, photo] of availablePhotos.entries()) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- Photos must arrive in approval order.
        const bytes = new Uint8Array(await photo.arrayBuffer());
        const extension = photo.type === "image/png" ? "png" : "jpg";

        // oxlint-disable-next-line eslint/no-await-in-loop -- Upload precedes its own idempotent send.
        const upload = await client.attachments.upload({
          data: bytes,
          fileName: `photo-${index}.${extension}`,
        });

        const key = `${args.idempotencyKey}:photo:${index}`;
        const transport = client;

        // oxlint-disable-next-line eslint/no-await-in-loop -- Preserve the approved photo order.
        const result = await sendResult(
          async () =>
            await transport.messages.sendAttachment(
              args.route.spaceId,
              upload.attachment.guid,
              { clientMessageId: key }
            ),
          key
        );

        if (result.kind !== "ok") {
          return sentAny ? { ...result, kind: "uncertain" } : result;
        }

        sentAny = true;
      }

      const transport = client;

      const result = await sendResult(
        async () =>
          await transport.messages.sendText(args.route.spaceId, args.body, {
            clientMessageId: args.idempotencyKey,
          }),
        args.idempotencyKey
      );

      return result.kind !== "ok" && sentAny
        ? { ...result, kind: "uncertain" }
        : result;
    } catch (error) {
      const failure = sdkFailure(error);

      return sentAny ? { ...failure, kind: "uncertain" } : failure;
    } finally {
      // A close failure must never overwrite a known send receipt.
      try {
        await client?.close();
      } catch {
        /* No additional sends or retries during cleanup. */
      }
    }
  },
});

export const conversation = internalAction({
  args: {
    assignment: v.object({
      assignedNumber: v.string(),
      assignmentId: v.string(),
      createdAt: v.number(),
      handle: v.string(),
      projectId: v.string(),
    }),
  },
  handler: async (_ctx, { assignment }): Promise<PhotonConversationResult> => {
    let client: PhotonClient | null = null;

    try {
      const connected = await clientForProject(assignment.projectId);

      if (connected.kind !== "ok") {
        return connected;
      }

      ({ client } = connected);
      // Stable's documented deterministic DM GUID; this lookup does not create a chat.
      const spaceId = `any;-;${assignment.handle}`;
      let pageToken: string | undefined;
      const seen = new Set<string>();

      for (let page = 0; page < 20; page += 1) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- The next read uses the previous page's opaque cursor.
        const result = await client.messages.listInChat(spaceId, {
          after: new Date(assignment.createdAt),
          isFromMe: false,
          pageSize: 100,
          pageToken,
        });

        const message = result.messages.find((candidate) =>
          matchingIncoming(candidate, assignment, spaceId)
        );

        if (message !== undefined) {
          return {
            conversation: {
              agentHandle: "shared",
              handle: assignment.handle,
              messageId: message.guid,
              peerUserId: assignment.handle,
              projectId: assignment.projectId,
              receivedAt: message.dateCreated.getTime(),
              senderId: "shared",
              spaceId,
            },
            kind: "ok",
          };
        }

        if (!result.nextPageToken) {
          return { conversation: null, kind: "ok" };
        }

        if (seen.has(result.nextPageToken)) {
          break;
        }

        seen.add(result.nextPageToken);
        pageToken = result.nextPageToken;
      }

      return {
        error:
          "Spectrum's conversation lookup did not finish within its page limit.",
        kind: "uncertain",
      };
    } catch (error) {
      if (error instanceof NotFoundError && error.code === "chatNotFound") {
        return { conversation: null, kind: "ok" };
      }

      return sdkFailure(error);
    } finally {
      try {
        await client?.close();
      } catch {
        /* Read results remain valid if transport cleanup fails. */
      }
    }
  },
});

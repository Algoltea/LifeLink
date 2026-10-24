/** Spectrum Stable management and signed inbound events. Sends run in photonruntime. */
import { z } from "zod";

import { constantTimeEqual } from "../lib/crypto";
import { readEnv } from "../lib/env";
import { decodeJson, request } from "./http";
import type { HttpOutcome } from "./http";

const BASE_URL = "https://spectrum.photon.codes";
const MAX_PAGES = 20;
const PAGE_SIZE = 200;

const handleSchema = z.union([
  z.string().regex(/^\+[1-9]\d{6,14}$/u),
  z.email().max(254),
]);

const timestampSchema = z.iso.datetime({ offset: true });

interface PhotonConfig {
  projectId: string;
  projectSecret: string;
}

const photonConfig = (): PhotonConfig | null => {
  const projectId = readEnv("SPECTRUM_PROJECT_ID");
  const projectSecret = readEnv("SPECTRUM_PROJECT_SECRET");

  return projectId === null ||
    projectSecret === null ||
    !z.uuid().safeParse(projectId).success
    ? null
    : { projectId, projectSecret };
};

const spectrumAuthorization = (config: PhotonConfig): string => {
  const bytes = new TextEncoder().encode(
    `${config.projectId}:${config.projectSecret}`
  );

  return `Basic ${btoa(Array.from(bytes, (byte) => String.fromCodePoint(byte)).join(""))}`;
};

const spectrumRequest = async (
  config: PhotonConfig,
  path: string,
  method: "GET" | "POST" = "GET"
): Promise<HttpOutcome> =>
  await request({
    headers: { Authorization: spectrumAuthorization(config) },
    method,
    url: `${BASE_URL}/projects/${encodeURIComponent(config.projectId)}${path}`,
  });

interface PhotonFailure {
  error: string;
  kind: "rejected" | "uncertain";
}

type PhotonResult =
  | PhotonFailure
  | { id: string; kind: "ok"; replayed: boolean };

const failureOf = (
  outcome: Exclude<HttpOutcome, { kind: "ok" }>
): PhotonFailure =>
  outcome.kind === "rejected" && outcome.status !== 409
    ? {
        error: `Spectrum refused the request (${outcome.status}).`,
        kind: "rejected",
      }
    : {
        error:
          "Spectrum's response could not be confirmed. Reconcile before retrying.",
        kind: "uncertain",
      };

interface PhotonAssignment {
  assignedNumber: string;
  assignmentId: string;
  createdAt: number;
  handle: string;
  projectId: string;
}

type PhotonAssignmentResult =
  | { assignment: PhotonAssignment; kind: "ok" }
  | PhotonFailure;

const registeredUserSchema = z.object({
  assignedPhoneNumber: z.string().min(1),
  createdAt: timestampSchema,
  id: z.string().min(1),
  phoneNumber: z.string().min(1),
  projectId: z.string().min(1),
  type: z.enum(["shared", "dedicated"]),
});

const usersPageSchema = z.object({
  data: z.object({
    total: z.number().int().nonnegative(),
    users: z.array(registeredUserSchema),
  }),
  succeed: z.literal(true),
});

/** Read only: never recreate, update, invite, or consume a slot for dashboard users. */
const ensureSharedAssignment = async (
  config: PhotonConfig,
  handle: string
): Promise<PhotonAssignmentResult> => {
  const exactHandle = handle.trim();

  if (!handleSchema.safeParse(exactHandle).success) {
    return {
      error: "Enter the exact iMessage email or an E.164 phone number.",
      kind: "rejected",
    };
  }

  let match: PhotonAssignment | null = null;
  const seen = new Set<string>();

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const query = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(pageIndex * PAGE_SIZE),
      type: "shared",
    });

    // oxlint-disable-next-line eslint/no-await-in-loop -- Pagination must finish before a unique match is trusted.
    const outcome = await spectrumRequest(config, `/users/?${query}`);

    if (outcome.kind !== "ok") {
      return failureOf(outcome);
    }

    const page = decodeJson(usersPageSchema, outcome.body);

    if (page === null) {
      return {
        error: "Spectrum's registered-user list could not be verified.",
        kind: "uncertain",
      };
    }

    for (const user of page.data.users) {
      if (seen.has(user.id)) {
        return {
          error: "Spectrum returned an inconsistent registered-user list.",
          kind: "uncertain",
        };
      }

      seen.add(user.id);

      // email is contact metadata, not proof that the address is allowlisted.
      if (
        user.type !== "shared" ||
        user.projectId !== config.projectId ||
        user.phoneNumber !== exactHandle
      ) {
        continue;
      }

      if (match !== null) {
        return {
          error: "Spectrum returned ambiguous shared-line users.",
          kind: "rejected",
        };
      }

      match = {
        assignedNumber: user.assignedPhoneNumber,
        assignmentId: user.id,
        createdAt: Date.parse(user.createdAt),
        handle: exactHandle,
        projectId: config.projectId,
      };
    }

    if ((pageIndex + 1) * PAGE_SIZE >= page.data.total) {
      return match === null
        ? {
            error:
              "This exact iMessage address is not a registered shared-line user in this Spectrum project. Check the existing dashboard user; LifeLink has not created or changed any users.",
            kind: "rejected",
          }
        : { assignment: match, kind: "ok" };
    }

    if (page.data.users.length !== PAGE_SIZE) {
      break;
    }
  }

  return {
    error:
      "Spectrum's registered-user lookup did not finish within its page limit.",
    kind: "uncertain",
  };
};

const validatePhoton = async (config: PhotonConfig): Promise<boolean> => {
  const outcome = await spectrumRequest(config, "/webhooks/");

  return (
    outcome.kind === "ok" &&
    decodeJson(
      z.object({
        data: z.array(z.object({ id: z.string(), webhookUrl: z.url() })),
        succeed: z.literal(true),
      }),
      outcome.body
    ) !== null
  );
};

const sharedTokenSchema = z.object({
  data: z.object({
    expiresIn: z.number().positive(),
    token: z.string().min(1),
    type: z.literal("shared"),
  }),
  succeed: z.literal(true),
});

const issueSharedToken = async (
  config: PhotonConfig
): Promise<{ kind: "ok"; token: string } | PhotonFailure> => {
  const outcome = await spectrumRequest(config, "/imessage/tokens", "POST");

  if (outcome.kind !== "ok") {
    return failureOf(outcome);
  }

  const result = decodeJson(sharedTokenSchema, outcome.body);

  return result === null
    ? {
        error: "Spectrum did not return credentials for a shared line.",
        kind: "rejected",
      }
    : { kind: "ok", token: result.data.token };
};

const spaceSchema = z.object({
  id: z.string().min(1),
  phone: z.string().min(1),
  platform: z.string().min(1),
  type: z.string(),
});

const messageSchema = z.object({
  content: z
    .object({ text: z.string().optional(), type: z.string().min(1) })
    .loose(),
  direction: z.literal("inbound"),
  id: z.string().min(1),
  platform: z.string().min(1),
  sender: z.object({ id: z.string().min(1), platform: z.string().min(1) }),
  space: spaceSchema,
  timestamp: timestampSchema,
});

const photonEventSchema = z.object({
  event: z.literal("messages"),
  message: messageSchema,
  space: spaceSchema,
});

type PhotonEvent = z.infer<typeof photonEventSchema>;

interface PhotonConversation {
  agentHandle: string;
  handle: string;
  messageId: string;
  peerUserId: string;
  projectId: string;
  receivedAt: number;
  senderId: string;
  spaceId: string;
}

type PhotonConversationResult =
  | { conversation: PhotonConversation | null; kind: "ok" }
  | PhotonFailure;

/** Only verified shared-pool direct iMessage snapshots can establish a contact route. */
const conversationFromMessage = (
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Untrusted webhook boundary, validated before routing.
  message: unknown,
  projectId: string
): PhotonConversation | null => {
  const parsed = messageSchema.safeParse(message);

  if (!parsed.success) {
    return null;
  }

  const snapshot = parsed.data;

  if (
    snapshot.platform.toLowerCase() !== "imessage" ||
    snapshot.space.platform.toLowerCase() !== "imessage" ||
    snapshot.sender.platform.toLowerCase() !== "imessage" ||
    snapshot.space.type !== "dm" ||
    snapshot.space.phone !== "shared" ||
    !handleSchema.safeParse(snapshot.sender.id).success
  ) {
    return null;
  }

  // Read/typing/reaction events must not enroll contacts or start a reply journey.
  if (
    snapshot.content.type !== "text" &&
    snapshot.content.type !== "attachment"
  ) {
    return null;
  }

  return {
    agentHandle: "shared",
    handle: snapshot.sender.id,
    messageId: snapshot.id,
    peerUserId: snapshot.sender.id,
    projectId,
    receivedAt: Date.parse(snapshot.timestamp),
    senderId: "shared",
    spaceId: snapshot.space.id,
  };
};

const verifyPhotonWebhook = async (
  secret: string,
  headers: { signature: string | null; timestamp: string | null },
  raw: string,
  now: number
): Promise<boolean> => {
  const { signature, timestamp } = headers;

  if (
    timestamp === null ||
    signature === null ||
    !/^\d+$/u.test(timestamp) ||
    !/^v0=[a-f0-9]{64}$/u.test(signature) ||
    Math.abs(now - Number(timestamp)) > 300
  ) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`v0:${timestamp}:${raw}`)
  );

  const expected = `v0=${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;

  return constantTimeEqual(expected, signature);
};

export {
  conversationFromMessage,
  ensureSharedAssignment,
  issueSharedToken,
  photonConfig,
  photonEventSchema,
  validatePhoton,
  verifyPhotonWebhook,
};

export type {
  PhotonAssignment,
  PhotonAssignmentResult,
  PhotonConfig,
  PhotonConversation,
  PhotonConversationResult,
  PhotonEvent,
  PhotonFailure,
  PhotonResult,
};

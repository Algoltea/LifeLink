import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { internal } from "../convex/_generated/api";
import {
  conversationFromMessage,
  ensureSharedAssignment,
  photonEventSchema,
} from "../convex/integrations/photon";
import type {
  PhotonAssignment,
  PhotonConfig,
  PhotonConversation,
} from "../convex/integrations/photon";
import { photonTransport } from "../convex/integrations/photonruntime";
import type { PhotonClient } from "../convex/integrations/photonruntime";
import { newBackend } from "./harness";

const sdk = {
  close: vi.fn<PhotonClient["close"]>(),
  getChat: vi.fn<PhotonClient["chats"]["get"]>(),
  listInChat: vi.fn<PhotonClient["messages"]["listInChat"]>(),
  sendAttachment: vi.fn<PhotonClient["messages"]["sendAttachment"]>(),
  sendText: vi.fn<PhotonClient["messages"]["sendText"]>(),
  upload: vi.fn<PhotonClient["attachments"]["upload"]>(),
};

const config: PhotonConfig = {
  projectId: "10000000-0000-4000-8000-000000000001",
  projectSecret: "test-only-project-secret",
};

const assignedAt = "2026-10-24T12:00:00.000Z";
const receivedAt = "2026-10-24T12:01:00.000Z";
const idempotencyKey = "assignment:CaseSensitive/+_=".padEnd(255, "k");

const assignment: PhotonAssignment = {
  assignedNumber: "+15555550199",
  assignmentId: "10000000-0000-4000-8000-000000000002",
  createdAt: Date.parse(assignedAt),
  handle: "+15555550142",
  projectId: config.projectId,
};

const providerUser = {
  assignedPhoneNumber: assignment.assignedNumber,
  createdAt: assignedAt,
  id: assignment.assignmentId,
  phoneNumber: assignment.handle,
  projectId: config.projectId,
  type: "shared",
};

const space = {
  id: `any;-;${assignment.handle}`,
  phone: "shared",
  platform: "iMessage",
  type: "dm",
};

const message = {
  content: {
    text: "Private incoming text must not become routing metadata.",
    type: "text",
  },
  direction: "inbound",
  id: "spc-msg-test",
  platform: "iMessage",
  sender: { id: assignment.handle, platform: "iMessage" },
  space,
  timestamp: receivedAt,
};

const conversation: PhotonConversation = {
  agentHandle: "shared",
  handle: assignment.handle,
  messageId: message.id,
  peerUserId: assignment.handle,
  projectId: config.projectId,
  receivedAt: Date.parse(receivedAt),
  senderId: "shared",
  spaceId: space.id,
};

const nativeMessage = {
  chatGuids: [space.id],
  dateCreated: new Date(receivedAt),
  guid: message.id,
  isFromMe: false,
  sender: { address: assignment.handle, service: "iMessage" as const },
};

const invalidRoutingMessages = [
  {
    name: "a message on another platform",
    value: { ...message, platform: "sms" },
  },
  {
    name: "a space on another platform",
    value: { ...message, space: { ...space, platform: "sms" } },
  },
  {
    name: "a sender on another platform",
    value: { ...message, sender: { ...message.sender, platform: "sms" } },
  },
  { name: "an outgoing message", value: { ...message, direction: "outbound" } },
  { name: "a read receipt", value: { ...message, content: { type: "read" } } },
  {
    name: "a group conversation",
    value: { ...message, space: { ...space, type: "group" } },
  },
  {
    name: "a dedicated line",
    value: {
      ...message,
      space: { ...space, phone: assignment.assignedNumber },
    },
  },
  { name: "a missing sender", value: { ...message, sender: undefined } },
  {
    name: "an invalid timestamp",
    value: { ...message, timestamp: "not-a-timestamp" },
  },
  {
    name: "a missing space identity",
    value: { ...message, space: { ...space, id: "" } },
  },
  {
    name: "a missing human identity",
    value: { ...message, sender: { ...message.sender, id: "" } },
  },
];

const fetchMock = vi.fn<typeof fetch>();

const pageOf = (users: (typeof providerUser)[], total = users.length) =>
  Response.json({ data: { total, users }, succeed: true });

const readConversation = async (value = assignment) =>
  await newBackend().action(internal.integrations.photonruntime.conversation, {
    assignment: value,
  });

const tokenResponse = () =>
  Response.json({
    data: {
      expiresIn: 3600,
      token: "test-only-transport-token",
      type: "shared",
    },
    succeed: true,
  });

describe("Spectrum Stable adapter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(photonTransport, "createClient").mockReturnValue({
      attachments: { upload: sdk.upload },
      chats: { get: sdk.getChat },
      close: sdk.close,
      messages: {
        listInChat: sdk.listInChat,
        sendAttachment: sdk.sendAttachment,
        sendText: sdk.sendText,
      },
    });
    vi.stubEnv("SPECTRUM_PROJECT_ID", config.projectId);
    vi.stubEnv("SPECTRUM_PROJECT_SECRET", config.projectSecret);
    fetchMock.mockImplementation((url) =>
      String(url).endsWith("/imessage/tokens")
        ? Promise.resolve(tokenResponse())
        : Promise.reject(new Error("Unexpected provider call"))
    );
    vi.stubGlobal("fetch", fetchMock);
    sdk.getChat.mockResolvedValue({
      participants: [{ address: assignment.handle, service: "iMessage" }],
    });
    sdk.close.mockResolvedValue();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("reuses only an exact active shared user without creating or inviting anyone", async () => {
    fetchMock.mockResolvedValueOnce(
      pageOf([
        { ...providerUser, id: "other", phoneNumber: "+15555550143" },
        providerUser,
      ])
    );
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toStrictEqual({ assignment, kind: "ok" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe(
      `https://spectrum.photon.codes/projects/${config.projectId}/users/?limit=200&offset=0&type=shared`
    );
    expect(options?.method).toBe("GET");
    expect(new Headers(options?.headers).get("Authorization")).toBe(
      `Basic ${btoa(`${config.projectId}:${config.projectSecret}`)}`
    );
  });

  it("finishes the bounded listing even after finding a match", async () => {
    const first = Array.from({ length: 200 }, (_, index) => ({
      ...providerUser,
      id: `user-${index}`,
      phoneNumber: `+1555556${String(index).padStart(4, "0")}`,
    }));

    first[0] = providerUser;
    fetchMock
      .mockResolvedValueOnce(pageOf(first, 201))
      .mockResolvedValueOnce(
        pageOf(
          [{ ...providerUser, id: "last", phoneNumber: "+15555550143" }],
          201
        )
      );
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "ok" });
    expect(
      new URL(String(fetchMock.mock.calls[1]?.[0])).searchParams.get("offset")
    ).toBe("200");
  });

  it("rejects ambiguous shared users without a POST", async () => {
    fetchMock.mockResolvedValueOnce(
      pageOf([providerUser, { ...providerUser, id: "different-user" }])
    );
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "rejected" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([assignment.handle, "Mixed.Case+Tag@Example.COM"])(
    "does not create an unregistered handle %s",
    async (handle) => {
      fetchMock.mockResolvedValueOnce(pageOf([]));
      await expect(
        ensureSharedAssignment(config, handle)
      ).resolves.toMatchObject({ kind: "rejected" });
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("GET");
    }
  );

  it("does not interpret contact email metadata as the registered handle", async () => {
    fetchMock.mockResolvedValueOnce(
      pageOf([
        {
          ...providerUser,
          email: "person@example.com",
        },
      ])
    );
    await expect(
      ensureSharedAssignment(config, "person@example.com")
    ).resolves.toMatchObject({ kind: "rejected" });
  });

  it.each(["not a handle", "5551234", ""])(
    "rejects invalid handles before a request: %s",
    async (handle) => {
      await expect(
        ensureSharedAssignment(config, handle)
      ).resolves.toMatchObject({ kind: "rejected" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it.each([
    { projectId: "another-project" },
    { type: "dedicated" },
    { phoneNumber: "+15555550143" },
  ])("does not reuse a mismatched registration %j", async (mismatch) => {
    fetchMock.mockResolvedValueOnce(pageOf([{ ...providerUser, ...mismatch }]));
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "rejected" });
  });

  it("does not reuse a user when a later listing page fails", async () => {
    const users = Array.from({ length: 200 }, (_, index) => ({
      ...providerUser,
      id: `user-${index}`,
      phoneNumber: `+1555556${String(index).padStart(4, "0")}`,
    }));

    users[0] = providerUser;
    fetchMock
      .mockResolvedValueOnce(pageOf(users, 201))
      .mockResolvedValueOnce(
        new Response("private provider details", { status: 503 })
      );
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "uncertain" });
  });

  it("stops an inconsistent empty listing without creating", async () => {
    fetchMock.mockResolvedValueOnce(pageOf([], 201));
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "uncertain" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("bounds a repeated listing without creating", async () => {
    fetchMock.mockResolvedValueOnce(pageOf([providerUser, providerUser]));
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "uncertain" });
  });

  it.each([408, 500, 503])(
    "leaves HTTP %s uncertain without a write",
    async (status) => {
      fetchMock.mockResolvedValueOnce(
        new Response("private details", { status })
      );
      await expect(
        ensureSharedAssignment(config, assignment.handle)
      ).resolves.toMatchObject({ kind: "uncertain" });
      expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("GET");
    }
  );

  it("leaves a dropped read response uncertain without retrying", async () => {
    fetchMock.mockRejectedValueOnce(new Error("private details"));
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "uncertain" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    { data: [], succeed: true },
    { data: { total: 1, users: [providerUser] }, succeed: false },
    {
      data: { total: 1, users: [{ ...providerUser, createdAt: "invalid" }] },
      succeed: true,
    },
  ])("does not trust malformed provider records %j", async (body) => {
    fetchMock.mockResolvedValueOnce(Response.json(body));
    await expect(
      ensureSharedAssignment(config, assignment.handle)
    ).resolves.toMatchObject({ kind: "uncertain" });
  });

  it("extracts only routing metadata from a received human message", () => {
    expect(conversationFromMessage(message, config.projectId)).toStrictEqual(
      conversation
    );
  });

  it.each(invalidRoutingMessages)("rejects $name", ({ value }) => {
    expect(conversationFromMessage(value, config.projectId)).toBeNull();
  });

  it("reads incoming messages through the SDK using the registration timestamp", async () => {
    sdk.listInChat.mockResolvedValueOnce({ messages: [nativeMessage] });
    await expect(readConversation()).resolves.toStrictEqual({
      conversation,
      kind: "ok",
    });
    expect(sdk.listInChat).toHaveBeenCalledExactlyOnceWith(space.id, {
      after: new Date(assignedAt),
      isFromMe: false,
      pageSize: 100,
      pageToken: undefined,
    });
    expect(sdk.close).toHaveBeenCalledOnce();
  });

  it("follows an empty message page with a continuation token", async () => {
    sdk.listInChat
      .mockResolvedValueOnce({ messages: [], nextPageToken: "next" })
      .mockResolvedValueOnce({ messages: [nativeMessage] });
    await expect(readConversation()).resolves.toMatchObject({
      conversation,
      kind: "ok",
    });
    expect(sdk.listInChat.mock.calls[1]?.[1]?.pageToken).toBe("next");
  });

  it("returns no conversation when the listing is exhausted", async () => {
    sdk.listInChat.mockResolvedValueOnce({ messages: [] });
    await expect(readConversation()).resolves.toStrictEqual({
      conversation: null,
      kind: "ok",
    });
  });

  it.each([
    { isFromMe: true },
    { sender: { address: "+15555550143", service: "iMessage" as const } },
    { chatGuids: ["another-space"] },
    { dateCreated: new Date(Date.parse(assignedAt) - 1) },
  ])("does not bind a mismatched SDK snapshot %j", async (mismatch) => {
    sdk.listInChat.mockResolvedValueOnce({
      messages: [{ ...nativeMessage, ...mismatch }],
    });
    await expect(readConversation()).resolves.toStrictEqual({
      conversation: null,
      kind: "ok",
    });
  });

  it("accepts a message at the exact registration creation time", async () => {
    sdk.listInChat.mockResolvedValueOnce({
      messages: [{ ...nativeMessage, dateCreated: new Date(assignedAt) }],
    });
    await expect(readConversation()).resolves.toMatchObject({
      conversation: { receivedAt: Date.parse(assignedAt) },
      kind: "ok",
    });
  });

  it("continues past unrelated messages to a later matching page", async () => {
    sdk.listInChat
      .mockResolvedValueOnce({
        messages: [
          {
            ...nativeMessage,
            sender: { address: "+15555550143", service: "iMessage" as const },
          },
        ],
        nextPageToken: "next",
      })
      .mockResolvedValueOnce({ messages: [nativeMessage] });
    await expect(readConversation()).resolves.toMatchObject({
      conversation,
      kind: "ok",
    });
  });

  it("bounds pagination when every message page is empty", async () => {
    sdk.listInChat.mockImplementation((_spaceId, options) =>
      Promise.resolve({
        messages: [],
        nextPageToken: String(Number(options.pageToken ?? "0") + 1),
      })
    );
    await expect(readConversation()).resolves.toMatchObject({
      kind: "uncertain",
    });
    expect(sdk.listInChat).toHaveBeenCalledTimes(20);
  });

  it("bounds a repeated message continuation token", async () => {
    sdk.listInChat.mockResolvedValue({ messages: [], nextPageToken: "same" });
    await expect(readConversation()).resolves.toMatchObject({
      kind: "uncertain",
    });
    expect(sdk.listInChat).toHaveBeenCalledTimes(2);
  });

  it("does not report an empty conversation after a later page fails", async () => {
    sdk.listInChat
      .mockResolvedValueOnce({ messages: [], nextPageToken: "next" })
      .mockRejectedValueOnce(new Error("private details"));
    await expect(readConversation()).resolves.toMatchObject({
      kind: "uncertain",
    });
  });

  it("parses the received message and retains its Stable routing fields", () => {
    expect(
      photonEventSchema.parse({ event: "messages", message, space })
    ).toStrictEqual({ event: "messages", message, space });
  });

  it.each(["sent", "delivered", "failed"])(
    "rejects unsupported Beta %s webhook envelopes",
    (status) => {
      expect(
        photonEventSchema.safeParse({
          data: {
            object: { id: "message", status },
            projectId: config.projectId,
          },
          id: "event",
          type: `message.${status}`,
        }).success
      ).toBeFalsy();
    }
  );

  it("sends text with the captured shared route and preserves the full key", async () => {
    sdk.sendText.mockResolvedValueOnce({
      guid: "native-guid",
      sendErrorCode: 0,
    });
    await expect(
      newBackend().action(internal.integrations.photonruntime.send, {
        body: "Exact approved text",
        idempotencyKey,
        photoStorageIds: [],
        route: {
          peerUserId: assignment.handle,
          projectId: config.projectId,
          senderId: "shared",
          spaceId: space.id,
        },
      })
    ).resolves.toStrictEqual({
      id: "native-guid",
      kind: "ok",
      replayed: false,
    });
    expect(sdk.sendText).toHaveBeenCalledExactlyOnceWith(
      space.id,
      "Exact approved text",
      { clientMessageId: idempotencyKey }
    );
  });

  it("keeps a successful response without a message ID uncertain", async () => {
    sdk.sendText.mockResolvedValueOnce({ guid: "", sendErrorCode: 0 });
    await expect(
      newBackend().action(internal.integrations.photonruntime.send, {
        body: "Approved text",
        idempotencyKey,
        photoStorageIds: [],
        route: {
          peerUserId: assignment.handle,
          projectId: config.projectId,
          senderId: "shared",
          spaceId: space.id,
        },
      })
    ).resolves.toMatchObject({ kind: "uncertain" });
  });

  it.each([401, 403, 422])(
    "sanitizes HTTP %s provider failures",
    async (status) => {
      fetchMock.mockResolvedValueOnce(
        new Response("private details and credentials", { status })
      );
      const result = await ensureSharedAssignment(config, assignment.handle);
      expect(result).toStrictEqual({
        error: `Spectrum refused the request (${status}).`,
        kind: "rejected",
      });
    }
  );
});

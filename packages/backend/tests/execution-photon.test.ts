import { IMessageError } from "@photon-ai/advanced-imessage/grpc";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { photonTransport } from "../convex/integrations/photonruntime";
import type { PhotonClient } from "../convex/integrations/photonruntime";
import { imessageIntroduction, withIntroduction } from "../convex/lib/imessage";
import type { PhotonRoute } from "../convex/lib/imessage";
import { newBackend, onlyAction, ownerWithContact } from "./harness";
import type { Backend, Person } from "./harness";

const PROJECT_ID = "10000000-0000-4000-8000-000000000001";
const BODY = "Hello from the shared line";

// The first message in each new conversation carries LifeLink's introduction.
const FIRST_TEXT = withIntroduction(imessageIntroduction("Ruth Alvarez"), BODY);
const fetchMock = vi.fn<typeof fetch>();

const sdk = {
  close: vi.fn<PhotonClient["close"]>(),
  getChat: vi.fn<PhotonClient["chats"]["get"]>(),
  listInChat: vi.fn<PhotonClient["messages"]["listInChat"]>(),
  sendAttachment: vi.fn<PhotonClient["messages"]["sendAttachment"]>(),
  sendText: vi.fn<PhotonClient["messages"]["sendText"]>(),
  upload: vi.fn<PhotonClient["attachments"]["upload"]>(),
};

const ROUTE: PhotonRoute = {
  peerUserId: "+15555550142",
  projectId: PROJECT_ID,
  senderId: "shared",
  spaceId: "any;-;+15555550142",
};

const enroll = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  contactId: Id<"contacts">,
  route: PhotonRoute
): Promise<Id<"imessageEnrollments">> =>
  await backend.run(async (ctx) => {
    const contact = await ctx.db.get(contactId);

    const handle = contact?.channels.find(
      (channel) => channel.channel === "imessage"
    )?.address;

    if (handle === undefined) {
      throw new Error("The test contact needs an iMessage address.");
    }

    return await ctx.db.insert("imessageEnrollments", {
      agentUserId: route.senderId,
      assignedNumber: "+15555550000",
      assignmentCreatedAt: Date.now(),
      assignmentId: `assignment:${contactId}`,
      contactId,
      createdAt: Date.now(),
      error: null,
      generation: 1,
      handle,
      lastIncomingAt: Date.now(),
      lastIncomingId: `incoming:${contactId}`,
      ownerId,
      peerUserId: route.peerUserId,
      projectId: route.projectId,
      protocol: "spectrum",
      spaceId: route.spaceId,
      status: "ready",
      updatedAt: Date.now(),
    });
  });

const approveMessage = async (
  owner: Person,
  contactId: Id<"contacts">,
  photoIds: Id<"photos">[] = []
): Promise<Id<"actions">> => {
  const taskId = await owner.mutation(api.messages.draft, {
    body: BODY,
    contactId,
    photoIds,
  });

  const { current, view } = await onlyAction(owner, taskId);

  await owner.mutation(api.actions.approve, {
    actionId: view.action._id,
    fingerprint: current.fingerprint,
    method: "tap",
    version: current.version,
  });

  return view.action._id;
};

const addPhoto = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  contactId: Id<"contacts">
): Promise<Id<"photos">> => {
  const storageId = await backend.run(
    async (ctx) =>
      await ctx.storage.store(new Blob(["test-photo"], { type: "image/jpeg" }))
  );

  return await backend.run(
    async (ctx) =>
      await ctx.db.insert("photos", {
        caption: null,
        contactId,
        contentType: "image/jpeg",
        createdAt: Date.now(),
        ownerId,
        sharedWithCircle: false,
        storageId,
        uploadedByProfileId: ownerId,
      })
  );
};

const unknownAttempt = async (withPhoto = false) => {
  const backend = newBackend();
  const { contactId, owner, ownerId } = await ownerWithContact(backend, false);
  const enrollmentId = await enroll(backend, ownerId, contactId, ROUTE);

  const photoIds = withPhoto
    ? [await addPhoto(backend, ownerId, contactId)]
    : [];

  const actionId = await approveMessage(owner, contactId, photoIds);
  const start = await backend.mutation(internal.execution.begin, { actionId });

  if (!start.ok) {
    throw new Error(start.reason);
  }

  await backend.mutation(internal.execution.complete, {
    attemptId: start.attemptId,
    handleCache: null,
    result: { error: "Provider response timed out.", kind: "unknown" },
  });

  return { actionId, backend, contactId, enrollmentId, ownerId, start };
};

describe("Photon execution uses the approved contact's shared-line route", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.stubEnv("SPECTRUM_PROJECT_SECRET", "test-api-key");
    vi.stubEnv("SPECTRUM_PROJECT_ID", PROJECT_ID);
    fetchMock.mockImplementation((url) => {
      if (!String(url).endsWith("/imessage/tokens")) {
        throw new Error("Unexpected provider call");
      }

      return Promise.resolve(
        Response.json({
          data: { expiresIn: 3600, token: "test-only-token", type: "shared" },
          succeed: true,
        })
      );
    });
    sdk.getChat.mockImplementation((spaceId: string) =>
      Promise.resolve({
        participants: [
          {
            address: spaceId.slice("any;-;".length),
            service: "iMessage" as const,
          },
        ],
      })
    );
    sdk.close.mockResolvedValue();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("persists distinct contact routes before sending texts and photos and ignores global handles", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    const secondContactId = await owner.mutation(api.contacts.create, {
      channels: [
        { address: "+15555550143", channel: "imessage", preferred: true },
      ],
      name: "Linda Alvarez",
      relationship: "Daughter",
      trusted: true,
    });

    const secondRoute: PhotonRoute = {
      peerUserId: "+15555550143",
      projectId: PROJECT_ID,
      senderId: "shared",
      spaceId: "any;-;+15555550143",
    };

    await enroll(backend, ownerId, contactId, ROUTE);
    await enroll(backend, ownerId, secondContactId, secondRoute);

    const staleHandleId = await backend.run(
      async (ctx) =>
        await ctx.db.insert("providerHandles", {
          conversationId: "obsolete-global-space",
          externalUserId: "obsolete-global-user",
          handle: "+15555550142",
          provider: "photon",
          updatedAt: 1,
        })
    );

    const photoId = await addPhoto(backend, ownerId, contactId);
    const firstActionId = await approveMessage(owner, contactId, [photoId]);
    const secondActionId = await approveMessage(owner, secondContactId);

    const capturedRoutes: (PhotonRoute | undefined)[] = [];

    const capture = async (actionId: Id<"actions">) => {
      const attempt = await backend.run(
        async (ctx) =>
          await ctx.db
            .query("executionAttempts")
            .withIndex("by_action", (index) => index.eq("actionId", actionId))
            .unique()
      );

      capturedRoutes.push(attempt?.photonRoute);
    };

    sdk.upload.mockImplementation(async () => {
      await capture(firstActionId);

      return { attachment: { guid: "test-attachment" } };
    });
    sdk.sendAttachment.mockImplementation(async () => {
      await capture(firstActionId);

      return { guid: "test-photo-message", sendErrorCode: 0 };
    });
    sdk.sendText.mockImplementation(async (spaceId: string) => {
      await capture(spaceId === ROUTE.spaceId ? firstActionId : secondActionId);

      return { guid: "test-message", sendErrorCode: 0 };
    });

    await backend.action(internal.execution.run, { actionId: firstActionId });
    await backend.action(internal.execution.run, { actionId: secondActionId });

    expect(capturedRoutes).toStrictEqual([ROUTE, ROUTE, ROUTE, secondRoute]);
    expect(sdk.sendAttachment).toHaveBeenCalledExactlyOnceWith(
      ROUTE.spaceId,
      "test-attachment",
      { clientMessageId: `${firstActionId}:v1:photo:0` }
    );
    expect(sdk.sendText.mock.calls).toStrictEqual([
      [ROUTE.spaceId, FIRST_TEXT, { clientMessageId: `${firstActionId}:v1` }],
      [
        secondRoute.spaceId,
        FIRST_TEXT,
        { clientMessageId: `${secondActionId}:v1` },
      ],
    ]);

    const handles = await backend.run(
      async (ctx) => await ctx.db.query("providerHandles").collect()
    );

    expect(handles).toMatchObject([
      {
        _id: staleHandleId,
        conversationId: "obsolete-global-space",
        externalUserId: "obsolete-global-user",
        updatedAt: 1,
      },
    ]);
  });

  it.each(["waiting", "missing"] as const)(
    "makes no provider call when the route is %s",
    async (state) => {
      const backend = newBackend();

      const { contactId, owner, ownerId } = await ownerWithContact(
        backend,
        false
      );

      const enrollmentId = await enroll(backend, ownerId, contactId, ROUTE);
      const actionId = await approveMessage(owner, contactId);

      await backend.run(async (ctx) => {
        await (state === "missing"
          ? ctx.db.delete(enrollmentId)
          : ctx.db.patch(enrollmentId, { status: state }));
      });
      await backend.action(internal.execution.run, { actionId });

      const result = await backend.run(async (ctx) => ({
        action: await ctx.db.get(actionId),
        attempts: await ctx.db
          .query("executionAttempts")
          .withIndex("by_action", (index) => index.eq("actionId", actionId))
          .collect(),
      }));

      expect(result.action?.status).toBe("failed");
      expect(result.attempts).toStrictEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("introduces LifeLink once per conversation, only to the recipient", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await enroll(backend, ownerId, contactId, ROUTE);
    sdk.sendText.mockResolvedValue({ guid: "test-message", sendErrorCode: 0 });

    const firstActionId = await approveMessage(owner, contactId);

    await backend.action(internal.execution.run, { actionId: firstActionId });

    const secondActionId = await approveMessage(owner, contactId);

    await backend.action(internal.execution.run, { actionId: secondActionId });

    expect(sdk.sendText.mock.calls.map((call) => call[1])).toStrictEqual([
      FIRST_TEXT,
      BODY,
    ]);

    // LifeLink's own thread keeps the approved words alone.
    const outgoing = await backend.run(
      async (ctx) =>
        await ctx.db
          .query("messages")
          .filter((query) => query.eq(query.field("direction"), "outgoing"))
          .collect()
    );

    expect(outgoing.map((message) => message.body)).toStrictEqual([BODY, BODY]);
  });

  it("writes the introduction in the contact's language, else the owner's", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await enroll(backend, ownerId, contactId, ROUTE);
    sdk.sendText.mockResolvedValue({ guid: "test-message", sendErrorCode: 0 });
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });

    const actionId = await approveMessage(owner, contactId);

    await backend.action(internal.execution.run, { actionId });

    expect(sdk.sendText.mock.calls.map((call) => call[1])).toStrictEqual([
      withIntroduction(imessageIntroduction("Ruth Alvarez", "es"), BODY),
    ]);
    expect(sdk.sendText.mock.calls[0]?.[1]).toContain(
      "Esta conversación está conectada a la cuenta de LifeLink de Ruth Alvarez."
    );
  });

  it("keeps a contact's own language over the owner's", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await enroll(backend, ownerId, contactId, ROUTE);
    sdk.sendText.mockResolvedValue({ guid: "test-message", sendErrorCode: 0 });
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });
    await backend.run(async (ctx) => {
      await ctx.db.patch(contactId, { language: "en" });
    });

    const actionId = await approveMessage(owner, contactId);

    await backend.action(internal.execution.run, { actionId });

    expect(sdk.sendText.mock.calls.map((call) => call[1])).toStrictEqual([
      FIRST_TEXT,
    ]);
  });

  it("replays the captured Spanish introduction without changing approved words or fingerprints", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await enroll(backend, ownerId, contactId, ROUTE);
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });
    const actionId = await approveMessage(owner, contactId);

    const approved = await backend.run(async (ctx) => ({
      approvals: await ctx.db.query("approvals").collect(),
      versions: await ctx.db.query("actionVersions").collect(),
    }));

    const start = await backend.mutation(internal.execution.begin, {
      actionId,
    });

    if (!start.ok) {
      throw new Error(start.reason);
    }

    expect(start.imessageIntroduction).toBe(
      imessageIntroduction("Ruth Alvarez", "es")
    );
    await backend.mutation(internal.execution.complete, {
      attemptId: start.attemptId,
      handleCache: null,
      result: { error: "Provider response timed out.", kind: "unknown" },
    });
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "en",
    });
    sdk.sendText.mockResolvedValue({
      guid: "spanish-replay",
      sendErrorCode: 0,
    });

    await expect(
      backend.action(internal.execution.reconcile, { actionId })
    ).resolves.toBe("went_through");
    expect(sdk.sendText).toHaveBeenCalledExactlyOnceWith(
      ROUTE.spaceId,
      withIntroduction(imessageIntroduction("Ruth Alvarez", "es"), BODY),
      { clientMessageId: start.idempotencyKey }
    );

    const after = await backend.run(async (ctx) => ({
      approvals: await ctx.db.query("approvals").collect(),
      versions: await ctx.db.query("actionVersions").collect(),
    }));

    expect(after).toStrictEqual(approved);

    const outgoing = await backend.run(
      async (ctx) => await ctx.db.query("messages").collect()
    );

    expect(outgoing).toMatchObject([{ body: BODY, direction: "outgoing" }]);
  });

  it("reconciles with the captured sender, space and original idempotency key", async () => {
    const { actionId, backend, start } = await unknownAttempt();

    sdk.sendText.mockRejectedValueOnce(
      new IMessageError("duplicate", {
        code: "duplicateMessage",
        grpcCode: 6,
        retryable: false,
      })
    );

    await expect(
      backend.action(internal.execution.reconcile, { actionId })
    ).resolves.toBe("went_through");
    // The replay repeats the attempt's exact text, introduction included.
    expect(sdk.sendText).toHaveBeenCalledExactlyOnceWith(
      ROUTE.spaceId,
      FIRST_TEXT,
      { clientMessageId: start.idempotencyKey }
    );

    const receipt = await backend.run(
      async (ctx) =>
        await ctx.db
          .query("providerReceipts")
          .withIndex("by_action", (index) => index.eq("actionId", actionId))
          .unique()
    );

    expect(receipt?.summary).toBe(
      "Photon confirmed it accepted the earlier iMessage for delivery."
    );
  });

  it("does not treat a text-only replay as confirmation of an uncertain photo send", async () => {
    const { actionId, backend } = await unknownAttempt(true);

    await expect(
      backend.action(internal.execution.reconcile, { actionId })
    ).resolves.toBe("cannot_tell");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { agentUserId: "replacement-sender" },
    { spaceId: "replacement-space" },
    { peerUserId: "replacement-peer" },
    { projectId: "replacement-project" },
    { status: "waiting" as const },
  ])("does not resend after the enrollment changes: %j", async (change) => {
    const { actionId, backend, enrollmentId } = await unknownAttempt();

    await backend.run(async (ctx) => {
      await ctx.db.patch(enrollmentId, change);
    });

    await expect(
      backend.action(internal.execution.reconcile, { actionId })
    ).resolves.toBe("cannot_tell");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["practice", "address", "removed", "config", "legacy"] as const)(
    "does not resend when the current context is unsafe: %s",
    async (change) => {
      const { actionId, backend, contactId, ownerId, start } =
        await unknownAttempt();

      await backend.run(async (ctx) => {
        if (change === "practice") {
          await ctx.db.patch(ownerId, { demoMode: true });
        } else if (change === "address") {
          await ctx.db.patch(contactId, {
            channels: [
              { address: "+15555550199", channel: "imessage", preferred: true },
            ],
          });
        } else if (change === "removed") {
          await ctx.db.delete(contactId);
        } else if (change === "legacy") {
          await ctx.db.patch(start.attemptId, { photonRoute: undefined });
        }
      });

      if (change === "config") {
        vi.stubEnv("SPECTRUM_PROJECT_ID", "another-project");
      }

      await expect(
        backend.action(internal.execution.reconcile, { actionId })
      ).resolves.toBe("cannot_tell");
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { photonTransport } from "../convex/integrations/photonruntime";
import {
  acceptImessageConversation,
  readyImessageRoute,
} from "../convex/lib/imessage";
import { newBackend, ownerWithContact, signUp } from "./harness";
import {
  ASSIGNED_NUMBER,
  CONTACT_HANDLE,
  conversationForContact,
  enrollContact,
  PROJECT_ID,
} from "./imessage-harness";

describe("shared iMessage enrollment", () => {
  beforeEach(() => {
    vi.spyOn(photonTransport, "createClient").mockReturnValue({
      attachments: {
        upload: () => Promise.reject(new Error("Unexpected upload")),
      },
      chats: { get: () => Promise.reject(new Error("Unexpected chat lookup")) },
      close: () => Promise.resolve(),
      messages: {
        listInChat: () => Promise.resolve({ messages: [] }),
        sendAttachment: () => Promise.reject(new Error("Unexpected send")),
        sendText: () => Promise.reject(new Error("Unexpected send")),
      },
    });
    vi.stubEnv("SPECTRUM_PROJECT_SECRET", "test-only-key");
    vi.stubEnv("SPECTRUM_PROJECT_ID", PROJECT_ID);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("blocks real registration in practice mode without calling Photon", async () => {
    const backend = newBackend();
    const { owner, contactId } = await ownerWithContact(backend, true);

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Unexpected network call"));

    await expect(
      owner.action(api.imessage.register, {
        confirmedHandle: CONTACT_HANDLE,
        contactId,
      })
    ).rejects.toThrow("Turn off practice mode");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows only the owner to register their own contact", async () => {
    const backend = newBackend();
    const { contactId } = await ownerWithContact(backend, false);

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    const family = await signUp(backend, {
      demo: false,
      name: "Family Member",
      role: "family",
      subject: "family-member",
    });

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Unexpected network call"));

    await expect(
      other.person.action(api.imessage.register, {
        confirmedHandle: CONTACT_HANDLE,
        contactId,
      })
    ).rejects.toThrow("could not be found");
    await expect(
      family.person.action(api.imessage.register, {
        confirmedHandle: CONTACT_HANDLE,
        contactId,
      })
    ).rejects.toThrow("Only the account owner");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps concurrent registration attempts on one local enrollment", async () => {
    const backend = newBackend();
    const { owner, contactId } = await ownerWithContact(backend, false);

    const first = await owner.mutation(internal.imessage.beginRegistration, {
      confirmedHandle: CONTACT_HANDLE,
      contactId,
    });

    const second = await owner.mutation(internal.imessage.beginRegistration, {
      confirmedHandle: CONTACT_HANDLE,
      contactId,
    });

    expect(first).not.toBeNull();
    expect(second).toBeNull();

    const enrollments = await backend.run(
      async (ctx) => await ctx.db.query("imessageEnrollments").collect()
    );

    expect(enrollments).toHaveLength(1);
  });

  it("does not let another household take over the same shared conversation", async () => {
    const backend = newBackend();
    const { ownerId, contactId } = await ownerWithContact(backend, false);

    await enrollContact(backend, ownerId, contactId);

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    const duplicate = await other.person.mutation(api.contacts.create, {
      channels: [
        { address: CONTACT_HANDLE, channel: "imessage", preferred: true },
      ],
      name: "Sam",
      relationship: "Friend",
      trusted: true,
    });

    await expect(
      other.person.mutation(internal.imessage.beginRegistration, {
        confirmedHandle: CONTACT_HANDLE,
        contactId: duplicate,
      })
    ).rejects.toThrow("already linked to another LifeLink account");
  });

  it("recovers an interrupted registration without an old timeout clearing the retry", async () => {
    const backend = newBackend();
    const { owner, contactId } = await ownerWithContact(backend, false);

    const first = await owner.mutation(internal.imessage.beginRegistration, {
      confirmedHandle: CONTACT_HANDLE,
      contactId,
    });

    if (first === null) {
      throw new Error("Expected registration input");
    }

    await backend.mutation(internal.imessage.expireRegistration, {
      enrollmentId: first.enrollmentId,
      generation: first.generation,
    });

    const expired = await owner.query(api.imessage.list, {});

    expect(expired.contacts[0]?.status).toBe("failed");

    const retried = await owner.mutation(internal.imessage.beginRegistration, {
      confirmedHandle: CONTACT_HANDLE,
      contactId,
    });

    expect(retried).toMatchObject({
      enrollmentId: first.enrollmentId,
      generation: first.generation + 1,
    });

    await backend.mutation(internal.imessage.expireRegistration, {
      enrollmentId: first.enrollmentId,
      generation: first.generation,
    });

    const current = await owner.query(api.imessage.list, {});

    expect(current.contacts[0]?.status).toBe("registering");
  });

  it("reuses a dashboard assignment and becomes ready only after the first message", async () => {
    const backend = newBackend();
    const { owner, contactId } = await ownerWithContact(backend, false);

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((input) => {
        const url = new URL(String(input));

        if (url.pathname.endsWith("/users/")) {
          return Promise.resolve(
            Response.json({
              data: {
                total: 1,
                users: [
                  {
                    assignedPhoneNumber: ASSIGNED_NUMBER,
                    createdAt: new Date(1000).toISOString(),
                    id: "10000000-0000-4000-8000-000000000002",
                    phoneNumber: CONTACT_HANDLE,
                    projectId: PROJECT_ID,
                    type: "shared",
                  },
                ],
              },
              succeed: true,
            })
          );
        }

        if (url.pathname.endsWith("/imessage/tokens")) {
          return Promise.resolve(
            Response.json({
              data: {
                expiresIn: 3600,
                token: "test-only-token",
                type: "shared",
              },
              succeed: true,
            })
          );
        }

        throw new Error("Unexpected provider endpoint");
      });

    await owner.action(api.imessage.register, {
      confirmedHandle: CONTACT_HANDLE,
      contactId,
    });

    const waiting = await owner.query(api.imessage.list, {});

    expect(waiting.contacts[0]).toMatchObject({
      assignedNumber: ASSIGNED_NUMBER,
      status: "waiting",
    });
    expect(
      fetchMock.mock.calls.every(
        ([url, options]) =>
          options?.method === "GET" || String(url).endsWith("/imessage/tokens")
      )
    ).toBeTruthy();

    const event = conversationForContact();

    await backend.run(
      async (ctx) => await acceptImessageConversation(ctx, event)
    );

    const ready = await owner.query(api.imessage.list, {});

    expect(ready.contacts[0]?.status).toBe("ready");
  });

  it("rejects the wrong assigned line, project, or a message older than the assignment", async () => {
    const backend = newBackend();
    const { ownerId, contactId } = await ownerWithContact(backend, false);

    await enrollContact(backend, ownerId, contactId);

    const mismatches = [
      { ...conversationForContact(), agentHandle: "+15555550001" },
      { ...conversationForContact(), projectId: "pho_prj_other" },
      { ...conversationForContact(), receivedAt: 999 },
    ];

    const results = await Promise.all(
      mismatches.map(
        async (conversation) =>
          await backend.run(
            async (ctx) => await acceptImessageConversation(ctx, conversation)
          )
      )
    );

    expect(results).toStrictEqual([null, null, null]);
    await expect(
      backend.run(
        async (ctx) =>
          await readyImessageRoute(ctx, ownerId, contactId, CONTACT_HANDLE)
      )
    ).resolves.toBeNull();
  });

  it("invalidates routing when the contact changes address or is removed", async () => {
    const backend = newBackend();

    const { owner, ownerId, contactId } = await ownerWithContact(
      backend,
      false
    );

    await enrollContact(backend, ownerId, contactId);
    await backend.run(
      async (ctx) =>
        await acceptImessageConversation(ctx, conversationForContact())
    );

    await expect(
      backend.run(
        async (ctx) =>
          await readyImessageRoute(ctx, ownerId, contactId, CONTACT_HANDLE)
      )
    ).resolves.toMatchObject({
      senderId: "shared",
      spaceId: "any;-;+15555550142",
    });

    await owner.mutation(api.contacts.update, {
      channels: [
        { address: "+15555550143", channel: "imessage", preferred: true },
      ],
      contactId,
      name: "Sam",
      relationship: "Son",
      trusted: true,
    });

    await expect(
      backend.run(
        async (ctx) =>
          await readyImessageRoute(ctx, ownerId, contactId, CONTACT_HANDLE)
      )
    ).resolves.toBeNull();

    await owner.mutation(api.contacts.remove, { contactId });

    await expect(
      backend.run(
        async (ctx) =>
          await acceptImessageConversation(ctx, conversationForContact())
      )
    ).resolves.toBeNull();
  });
});

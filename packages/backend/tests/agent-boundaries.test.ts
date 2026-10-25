import { register } from "@convex-dev/agent/test";
import type { Proposal } from "@lifelink/contracts/model-output";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { DAY, newBackend, ownerWithContact, signUp } from "./harness";
import type { Backend } from "./harness";

const messageProposal = (nameAsSaid = "Sam"): Proposal => ({
  appointmentId: null,
  dateTimeAsSaid: null,
  dateTimeIso: null,
  groceryItems: [],
  intent: "send_message",
  messageDraft: "Dinner is at six. Ruth",
  recipients: [{ contactId: null, nameAsSaid }],
  reminderTitle: null,
});

const propose = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  proposal: Proposal & { approved?: boolean; ownerId?: Id<"profiles"> }
) =>
  await backend.mutation(internal.assistant.applyProposalForOwner, {
    channel: "text",
    model: "test",
    ownerId,
    proposalJson: JSON.stringify(proposal),
    request: "Tell Sam dinner is at six.",
  });

describe("agent authorization and proposal boundaries", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("OPENROUTER_API_KEY", "");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("denies other owners and family access to conversations, streams, submission, and selection", async () => {
    const backend = newBackend();
    register(backend);
    const { owner } = await ownerWithContact(backend, false);
    const threadId = await owner.mutation(api.assistant.ensureConversation, {});

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    const family = await signUp(backend, {
      demo: false,
      name: "Family Viewer",
      role: "family",
      subject: "family-viewer",
    });

    for (const person of [other.person, family.person, backend]) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- exercise each distinct identity boundary.
      await expect(
        person.query(api.assistant.listThreadMessages, {
          paginationOpts: { cursor: null, numItems: 10 },
          streamArgs: { kind: "list", startOrder: 0 },
          threadId,
        })
      ).rejects.toThrow(/not_found|owner_only|not_signed_in/u);
      // oxlint-disable-next-line eslint/no-await-in-loop -- exercise each distinct identity boundary.
      await expect(
        person.mutation(api.assistant.submitRequest, {
          channel: "text",
          text: "Read the private history",
          threadId,
        })
      ).rejects.toThrow(/not_found|owner_only|not_signed_in/u);
      // oxlint-disable-next-line eslint/no-await-in-loop -- exercise each distinct identity boundary.
      await expect(
        person.mutation(api.assistant.selectConversation, { threadId })
      ).rejects.toThrow(/not_found|owner_only|not_signed_in/u);
    }
  });

  it("keeps delayed replies in the initiating thread and reuses empty conversations", async () => {
    const backend = newBackend();
    register(backend);
    const { owner } = await ownerWithContact(backend, false);
    const first = await owner.mutation(api.assistant.ensureConversation, {});
    await expect(
      owner.mutation(api.assistant.newConversation, {})
    ).resolves.toBe(first);
    await owner.mutation(api.assistant.submitRequest, {
      channel: "text",
      text: "First private question",
      threadId: first,
    });
    const second = await owner.mutation(api.assistant.newConversation, {});
    expect(second).not.toBe(first);
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    await expect(owner.query(api.assistant.myThread, {})).resolves.toBe(second);

    const original = await owner.query(api.assistant.listThreadMessages, {
      paginationOpts: { cursor: null, numItems: 20 },
      threadId: first,
    });

    const selected = await owner.query(api.assistant.listThreadMessages, {
      paginationOpts: { cursor: null, numItems: 20 },
      threadId: second,
    });

    expect({
      originalRoles: original.page.map((message) => message.role),
      selectedMessages: selected.page,
    }).toStrictEqual({
      originalRoles: ["user", "assistant"],
      selectedMessages: [],
    });
    await expect(
      owner.query(api.assistant.listConversationHistory, {
        paginationOpts: { cursor: null, numItems: 20 },
      })
    ).resolves.toMatchObject({
      page: expect.arrayContaining([
        expect.objectContaining({
          hasMessages: true,
          threadId: first,
          title: "First private question",
        }),
        expect.objectContaining({ hasMessages: false, threadId: second }),
      ]),
    });
  });

  it("rejects a foreign legacy thread pointer even when copied into the owner's profile", async () => {
    const backend = newBackend();
    register(backend);
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    const threadId = await other.person.mutation(
      api.assistant.ensureConversation,
      {}
    );

    await backend.run(
      async (ctx) =>
        await ctx.db.patch(ownerId, { assistantThreadId: threadId })
    );
    await expect(owner.query(api.assistant.myThread, {})).resolves.toBeNull();
    await expect(
      owner.query(api.assistant.listThreadMessages, {
        paginationOpts: { cursor: null, numItems: 10 },
        threadId,
      })
    ).rejects.toThrow(/not_found/u);
  });

  it("rejects model authority fields and foreign or untrusted recipient ids without creating actions", async () => {
    const backend = newBackend();

    const { owner, ownerId, contactId } = await ownerWithContact(
      backend,
      false
    );

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    const foreign = await other.person.mutation(api.contacts.create, {
      channels: [
        { address: "foreign@example.com", channel: "email", preferred: true },
      ],
      name: "Foreign Person",
      relationship: "Friend",
      trusted: true,
    });

    await backend.run(
      async (ctx) => await ctx.db.patch(contactId, { trusted: false })
    );

    const authority = await propose(backend, ownerId, {
      ...messageProposal(),
      approved: true,
      ownerId: other.id,
    });

    const foreignResult = await propose(backend, ownerId, {
      ...messageProposal(),
      recipients: [{ contactId: foreign, nameAsSaid: "Foreign Person" }],
    });

    const untrusted = await propose(backend, ownerId, messageProposal());
    expect([
      authority.taskId,
      foreignResult.taskId,
      untrusted.taskId,
    ]).toStrictEqual([null, null, null]);
    await expect(
      owner.query(api.tasks.list, { include: "all" })
    ).resolves.toHaveLength(0);
  });

  it("creates review state without execution and denies another owner access to the review", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const result = await propose(backend, ownerId, messageProposal());

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    if (result.actionId === null || result.taskId === null) {
      throw new Error("Expected one proposed action");
    }

    const review = await owner.query(api.assistant.actionReview, {
      actionId: result.actionId,
    });

    expect(review?.view.action.status).toBe("awaiting_approval");
    expect(review?.view.attempts).toHaveLength(0);
    await expect(
      other.person.query(api.assistant.actionReview, {
        actionId: result.actionId,
      })
    ).resolves.toBeNull();
    await expect(
      other.person.query(api.assistant.taskActionIds, {
        taskId: result.taskId,
      })
    ).resolves.toStrictEqual([]);
    await expect(
      other.person.mutation(api.assistant.reviseWords, {
        actionId: result.actionId,
        body: "Changed",
        version: 1,
      })
    ).rejects.toThrow(/not_found/u);
  });

  it.each([
    null,
    "tomorrow morning",
    "2026-99-99T10:00:00-04:00",
    new Date(Date.now() - DAY).toISOString(),
  ])(
    "does not create a reminder from invalid or past date %s",
    async (dateTimeIso) => {
      const backend = newBackend();
      const { ownerId } = await ownerWithContact(backend, false);

      const result = await propose(backend, ownerId, {
        ...messageProposal(),
        dateTimeIso,
        intent: "create_reminder",
        reminderTitle: "Call Sam",
      });

      expect(result.taskId).toBeNull();
    }
  );
});

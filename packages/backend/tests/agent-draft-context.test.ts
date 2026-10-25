import { saveMessage } from "@convex-dev/agent";
import { register } from "@convex-dev/agent/test";
import { PRIVATE_INBOX_OPTIONS } from "@lifelink/contracts/inbox-chat";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, components, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { newBackend, ownerWithContact, signUp } from "./harness";
import type { Backend } from "./harness";

const draft = (number: string) =>
  JSON.stringify({
    appointmentId: null,
    dateTimeAsSaid: null,
    dateTimeIso: null,
    groceryItems: [],
    intent: "send_message",
    messageDraft: `Hi Sam, please meet me at ${number} River Road. Thanks! Ruth`,
    recipients: [{ contactId: null, nameAsSaid: "Sam" }],
    reminderTitle: null,
  });

const save = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  threadId: string,
  text: string,
  role: "assistant" | "user" = "user"
) =>
  await backend.run(
    async (ctx) =>
      await saveMessage(ctx, components.agent, {
        message: { content: text, role },
        threadId,
        userId: ownerId,
      })
  );

const prepare = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  threadId: string,
  promptMessageId: string,
  number = "8123"
) =>
  await backend.mutation(internal.assistant.applyProposalForOwner, {
    channel: "text",
    draftContext: { promptMessageId, threadId },
    model: "test",
    ownerId,
    proposalJson: draft(number),
    request: "Make it friendlier",
  });

describe("numeric draft details from owned conversation context", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("preserves a user-authored address on a follow-up in the same conversation", async () => {
    const backend = newBackend();
    register(backend);
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const threadId = await owner.mutation(api.assistant.ensureConversation, {});
    await save(
      backend,
      ownerId,
      threadId,
      "Tell Sam to meet me at 8123 River Road"
    );
    const prompt = await save(backend, ownerId, threadId, "Make it friendlier");
    const result = await prepare(backend, ownerId, threadId, prompt.messageId);

    const invented = await prepare(
      backend,
      ownerId,
      threadId,
      prompt.messageId,
      "9234"
    );

    expect(result.taskId).not.toBeNull();
    expect(invented.taskId).toBeNull();
  });

  it.each(["assistant", "unrelated", "later", "invented"] as const)(
    "rejects numbers supported only by %s context",
    async (source) => {
      const backend = newBackend();
      register(backend);
      const { owner, ownerId } = await ownerWithContact(backend, false);

      const threadId = await owner.mutation(
        api.assistant.ensureConversation,
        {}
      );

      if (source === "assistant") {
        await save(
          backend,
          ownerId,
          threadId,
          "Meet at 8123 River Road",
          "assistant"
        );
      }

      if (source === "unrelated") {
        await owner.mutation(api.assistant.submitRequest, {
          channel: "text",
          text: "Meet at 8123 River Road",
          threadId,
        });
      }

      const activeThread =
        source === "unrelated"
          ? await owner.mutation(api.assistant.newConversation, {})
          : threadId;

      const prompt = await save(
        backend,
        ownerId,
        activeThread,
        "Make it friendlier"
      );

      if (source === "later") {
        await save(backend, ownerId, activeThread, "Meet at 8123 River Road");
      }

      const result = await prepare(
        backend,
        ownerId,
        activeThread,
        prompt.messageId
      );

      expect(result.taskId).toBeNull();
    }
  );

  it("does not accept another owner's thread or a foreign prompt", async () => {
    const backend = newBackend();
    register(backend);
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const ownThread = await owner.mutation(
      api.assistant.ensureConversation,
      {}
    );

    const ownPrompt = await save(
      backend,
      ownerId,
      ownThread,
      "Make it friendlier"
    );

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    const otherThread = await other.person.mutation(
      api.assistant.ensureConversation,
      {}
    );

    await save(backend, other.id, otherThread, "Meet at 8123 River Road");

    const foreignPrompt = await save(
      backend,
      other.id,
      otherThread,
      "Make it friendlier"
    );

    await expect(
      prepare(backend, ownerId, otherThread, foreignPrompt.messageId)
    ).rejects.toThrow(/not_found/u);
    await expect(
      prepare(backend, ownerId, ownThread, foreignPrompt.messageId)
    ).rejects.toThrow(/not_found/u);

    const result = await prepare(
      backend,
      ownerId,
      ownThread,
      ownPrompt.messageId
    );

    expect(result.taskId).toBeNull();
  });

  it("rejects a mismatched prompt from another conversation of the same owner", async () => {
    const backend = newBackend();
    register(backend);
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const first = await owner.mutation(api.assistant.submitRequest, {
      channel: "text",
      text: "Meet at 8123 River Road",
    });

    const second = await owner.mutation(api.assistant.newConversation, {});
    const prompt = await save(backend, ownerId, second, "Make it friendlier");

    await expect(
      prepare(backend, ownerId, first, prompt.messageId)
    ).rejects.toThrow(/not_found/u);
  });

  it("does not use private inbox summary data as user-authored draft context", async () => {
    const backend = newBackend();
    register(backend);
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const threadId = await owner.mutation(api.assistant.ensureConversation, {});
    await backend.run(
      async (ctx) =>
        await saveMessage(ctx, components.agent, {
          message: {
            content: "Meet at 8123 River Road",
            providerOptions: PRIVATE_INBOX_OPTIONS,
            role: "user",
          },
          threadId,
          userId: ownerId,
        })
    );
    const prompt = await save(backend, ownerId, threadId, "Make it friendlier");
    const result = await prepare(backend, ownerId, threadId, prompt.messageId);

    expect(result.taskId).toBeNull();
  });

  it("rejects a forged latest request even when its prompt id is owned", async () => {
    const backend = newBackend();
    register(backend);
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const threadId = await owner.mutation(api.assistant.ensureConversation, {});

    const prompt = await save(
      backend,
      ownerId,
      threadId,
      "Original stored request"
    );

    await expect(
      prepare(backend, ownerId, threadId, prompt.messageId)
    ).rejects.toThrow(/not_found/u);
  });
});

import { docsToModelMessages } from "@convex-dev/agent";
import type { AgentComponent } from "@convex-dev/agent";
import { register } from "@convex-dev/agent/test";
import { withoutPrivateInboxSummaries } from "@lifelink/contracts/inbox-chat";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, components } from "../convex/_generated/api";
import { connectFamily, newBackend, signUp } from "./harness";
import type { Backend } from "./harness";

const agentComponent: AgentComponent = components.agent;
const fetchMock = vi.fn<typeof fetch>();

const setup = async () => {
  const backend = newBackend();
  register(backend);

  const { id, person } = await signUp(backend, {
    demo: false,
    name: "Ruth",
    role: "owner",
    subject: "email-chat-owner",
  });

  const threadId = await person.mutation(api.assistant.newConversation, {});
  await backend.run(async (ctx) => {
    await ctx.db.insert("emails", {
      actionNeeded: null,
      bodyText: "Please reply to confirm dinner.",
      connectionId: null,
      fromAddress: "sam@example.com",
      fromName: "Sam",
      mode: "live",
      ownerId: id,
      provider: "gmail",
      providerMessageId: "chat-email",
      providerThreadId: null,
      receivedAt: 1000,
      selectedForReview: false,
      subject: "Dinner plans",
      summary: null,
      suspicious: null,
    });
  });
  await person.mutation(api.emails.checkRecent, {});

  return { backend, owner: person, ownerId: id, threadId };
};

const messagesIn = async (backend: Backend, threadId: string) =>
  await backend.run(
    async (ctx) =>
      await ctx.runQuery(agentComponent.messages.listMessagesByThreadId, {
        order: "asc",
        paginationOpts: { cursor: null, numItems: 20 },
        threadId,
      })
  );

describe("Ask email-summary preset", () => {
  beforeEach(() => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(new Response("Unavailable", { status: 503 }));
  });
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("saves the preset request and complete local summary in the actual conversation", async () => {
    const { backend, owner, threadId } = await setup();
    await owner.action(api.assistant.summarizeInbox, {
      allowCloudAnalysis: false,
      threadId,
    });
    const messages = await messagesIn(backend, threadId);
    const history = await owner.query(api.assistant.listConversations, {});
    expect(messages.page.map((message) => message.message?.role)).toStrictEqual(
      ["user", "assistant"]
    );
    expect(messages.page[1]?.text).toContain("Dinner plans — Sam");
    expect(messages.page[1]?.text).toContain("May need a reply");
    expect(history[0]).toMatchObject({ hasMessages: true, threadId });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the summary selected when delayed automatic composer setup runs again", async () => {
    const { owner, threadId } = await setup();
    await owner.action(api.assistant.summarizeInbox, {
      allowCloudAnalysis: false,
      threadId,
    });

    const prepared = await Promise.all([
      owner.mutation(api.assistant.ensureConversation, {}),
      owner.mutation(api.assistant.ensureConversation, {}),
    ]);

    expect(prepared).toStrictEqual([threadId, threadId]);
    await expect(owner.query(api.assistant.myThread, {})).resolves.toBe(
      threadId
    );

    const transcript = await owner.query(api.assistant.listThreadMessages, {
      paginationOpts: { cursor: null, numItems: 30 },
      threadId,
    });

    expect(
      transcript.page.some((message) => message.text.includes("Dinner plans"))
    ).toBeTruthy();

    const newThread = await owner.mutation(api.assistant.newConversation, {});

    expect(newThread).not.toBe(threadId);
  });

  it("returns the saved structured summary to render the same card after reloading history", async () => {
    const { owner, threadId } = await setup();
    await owner.action(api.assistant.summarizeInbox, {
      allowCloudAnalysis: false,
      threadId,
    });

    const transcript = await owner.query(api.assistant.listThreadMessages, {
      paginationOpts: { cursor: null, numItems: 30 },
      threadId,
    });

    expect(
      transcript.page.find((message) => message.role === "assistant")?.metadata
    ).toMatchObject({
      inboxSummary: {
        items: [{ category: "reply", sender: "Sam", subject: "Dinner plans" }],
        method: "local",
      },
    });
    expect(
      transcript.page.find((message) => message.role === "user")?.metadata
    ).toBeNull();
  });

  it("checks imported emails before grouping them without first visiting Email", async () => {
    const { backend, owner, ownerId, threadId } = await setup();
    await backend.run(async (ctx) => {
      const emails = await ctx.db
        .query("emails")
        .withIndex("by_owner_received", (index) => index.eq("ownerId", ownerId))
        .collect();

      await Promise.all(
        emails.map(
          async (email) =>
            await ctx.db.patch(email._id, {
              scamCheck: undefined,
              suspicious: null,
            })
        )
      );
    });
    await owner.action(api.assistant.summarizeInbox, {
      allowCloudAnalysis: false,
      threadId,
    });

    const messages = await messagesIn(backend, threadId);

    expect(messages.page[1]?.text).toContain("May need a reply");
    expect(messages.page[1]?.text).not.toContain("check has not finished");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps saved email data out of later general assistant model context", async () => {
    const { backend, owner, threadId } = await setup();
    await owner.action(api.assistant.summarizeInbox, {
      allowCloudAnalysis: false,
      threadId,
    });
    const messages = await messagesIn(backend, threadId);
    const modelMessages = docsToModelMessages(messages.page);
    expect(modelMessages).toHaveLength(2);
    expect(withoutPrivateInboxSummaries(modelMessages)).toStrictEqual([]);
  });

  it("keeps an in-flight summary in the initiating chat when the owner switches conversations", async () => {
    const { backend, owner, threadId } = await setup();
    let nextThreadId: string | null = null;
    fetchMock.mockImplementationOnce(async () => {
      nextThreadId = await owner.mutation(api.assistant.newConversation, {});

      return new Response("Unavailable", { status: 503 });
    });
    await owner.action(api.assistant.summarizeInbox, {
      allowCloudAnalysis: true,
      threadId,
    });
    const original = await messagesIn(backend, threadId);
    expect(original.page[1]?.text).toContain("Dinner plans — Sam");
    expect(original.page[1]?.text).toContain("provider may have received");
    await expect(owner.query(api.assistant.myThread, {})).resolves.toBe(
      nextThreadId
    );
  });

  it("denies another owner's thread and prevents family members from running the preset", async () => {
    const { backend, owner, threadId } = await setup();

    const { person: stranger } = await signUp(backend, {
      demo: false,
      name: "Other",
      role: "owner",
      subject: "other-owner",
    });

    const { family } = await connectFamily(backend, owner, [
      "scam_alerts.view",
    ]);

    await expect(
      stranger.action(api.assistant.summarizeInbox, {
        allowCloudAnalysis: true,
        threadId,
      })
    ).rejects.toThrow(/could not be found/u);
    await expect(
      family.action(api.assistant.summarizeInbox, {
        allowCloudAnalysis: false,
        threadId,
      })
    ).rejects.toThrow(/Only the account owner/u);
    expect(fetchMock).not.toHaveBeenCalled();
    const messages = await messagesIn(backend, threadId);
    expect(messages.page).toStrictEqual([]);
  });
});

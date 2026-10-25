import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { executeTool } from "../convex/integrations/composio";
import { sendReply } from "../convex/integrations/mail";
import { newBackend, onlyAction, signUp } from "./harness";
import type { Backend } from "./harness";

const practiceOwner = async (backend: Backend) => {
  const { id, person } = await signUp(backend, {
    demo: true,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

  return { owner: person, ownerId: id };
};

const addEmail = async (
  backend: Backend,
  ownerId: Id<"profiles">
): Promise<Id<"emails">> =>
  await backend.run(
    async (ctx) =>
      await ctx.db.insert("emails", {
        actionNeeded: null,
        bodyText: "Are you free for dinner on Sunday?",
        connectionId: null,
        fromAddress: "Sam@Example.com",
        fromName: "Sam",
        mode: "simulated",
        ownerId,
        provider: "gmail",
        providerMessageId: "message-7",
        providerThreadId: "thread-7",
        receivedAt: Date.now(),
        selectedForReview: false,
        subject: "Dinner",
        summary: null,
        suspicious: null,
      })
  );

describe("replying to an email from LifeLink", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("prepares a reply in the same conversation and sends it only after approval", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await practiceOwner(backend);
    const emailId = await addEmail(backend, ownerId);

    const taskId = await owner.mutation(api.emails.sendReply, {
      body: "  Sunday works. See you then!  ",
      emailId,
    });

    const { current, detail, view } = await onlyAction(owner, taskId);

    expect(current.details).toStrictEqual({
      body: "Sunday works. See you then!",
      connectionId: "",
      inReplyToMessageId: "message-7",
      kind: "email_reply",
      provider: "gmail",
      subject: "Re: Dinner",
      threadId: "thread-7",
      to: "Sam@Example.com",
    });
    expect(detail.steps.map((step) => step.label)).toStrictEqual([
      "Send the reply",
    ]);
    expect(view.action.status).toBe("awaiting_approval");

    await owner.mutation(api.actions.approve, {
      actionId: view.action._id,
      fingerprint: current.fingerprint,
      method: "keyboard",
      version: current.version,
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);

    const done = await onlyAction(owner, taskId);

    expect(done.view.action.status).toBe("succeeded");
    expect(done.detail.task.status).toBe("completed");
  });

  it("still saves a draft when the person asks for one", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await practiceOwner(backend);
    const emailId = await addEmail(backend, ownerId);

    const taskId = await owner.mutation(api.emails.draftReply, {
      body: "Let me check my calendar.",
      emailId,
    });

    const { current } = await onlyAction(owner, taskId);

    expect(current.details).toMatchObject({
      kind: "email_draft",
      replyToMessageId: "thread-7",
      subject: "Re: Dinner",
    });
  });

  it("voids the approval when the words change", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await practiceOwner(backend);
    const emailId = await addEmail(backend, ownerId);

    const taskId = await owner.mutation(api.emails.sendReply, {
      body: "Sunday works.",
      emailId,
    });

    const first = await onlyAction(owner, taskId);

    await owner.mutation(api.actions.revise, {
      actionId: first.view.action._id,
      body: "Saturday works better.",
    });

    await expect(
      owner.mutation(api.actions.approve, {
        actionId: first.view.action._id,
        fingerprint: first.current.fingerprint,
        method: "tap",
        version: first.current.version,
      })
    ).rejects.toThrow("The details changed since you looked.");
  });

  it("refuses an empty reply", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await practiceOwner(backend);
    const emailId = await addEmail(backend, ownerId);

    await expect(
      owner.mutation(api.emails.sendReply, { body: "   ", emailId })
    ).rejects.toThrow("Write your reply first.");
  });
});

describe("the provider reply call", () => {
  const execute = vi.fn<typeof executeTool>();

  const mail = {
    body: "Sunday works.",
    subject: "Re: Dinner",
    threadId: "thread-7",
    to: "sam@example.com",
  };

  const gmail = {
    connectedAccountId: "mail-account",
    provider: "gmail" as const,
    userId: "owner",
  };

  beforeEach(() => {
    execute.mockResolvedValue({ data: {}, kind: "ok", logId: "log-1" });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("replies inside the Gmail thread without changing the subject", async () => {
    await sendReply(gmail, mail, "message-7", execute);

    expect(execute).toHaveBeenCalledExactlyOnceWith(
      "GMAIL_REPLY_TO_THREAD",
      "owner",
      "mail-account",
      {
        include_signature: false,
        is_html: false,
        message_body: "Sunday works.",
        recipient_email: "sam@example.com",
        thread_id: "thread-7",
      }
    );
  });

  it("sends a new Gmail email when there is no thread to reply in", async () => {
    await sendReply(gmail, { ...mail, threadId: null }, "message-7", execute);

    expect(execute).toHaveBeenCalledExactlyOnceWith(
      "GMAIL_SEND_EMAIL",
      "owner",
      "mail-account",
      expect.objectContaining({
        body: "Sunday works.",
        recipient_email: "sam@example.com",
        subject: "Re: Dinner",
      })
    );
  });

  it("replies to the original Outlook message", async () => {
    await sendReply(
      { ...gmail, provider: "outlook" },
      mail,
      "message-7",
      execute
    );

    expect(execute).toHaveBeenCalledExactlyOnceWith(
      "OUTLOOK_REPLY_EMAIL",
      "owner",
      "mail-account",
      { comment: "Sunday works.", is_html: false, message_id: "message-7" }
    );
  });
});

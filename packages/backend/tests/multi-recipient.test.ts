import { register } from "@convex-dev/agent/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { newBackend, ownerWithContact } from "./harness";
import type { Backend } from "./harness";

const requireTask = (taskId: Id<"tasks"> | null): Id<"tasks"> => {
  if (taskId === null) {
    throw new Error("Expected a prepared task");
  }

  return taskId;
};

const propose = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  names: string[]
) =>
  await backend.mutation(internal.assistant.applyProposalForOwner, {
    channel: "text",
    model: "test",
    ownerId,
    proposalJson: JSON.stringify({
      appointmentId: null,
      dateTimeAsSaid: null,
      dateTimeIso: null,
      groceryItems: [],
      intent: "send_message",
      messageDraft: "Dinner is at six!",
      recipients: names.map((nameAsSaid) => ({ contactId: null, nameAsSaid })),
      reminderTitle: null,
    }),
    request: `Tell ${names.join(" and ")} that dinner is at six!`,
  });

const family = async () => {
  const backend = newBackend();
  const context = await ownerWithContact(backend, false);

  const daughterId = await context.owner.mutation(api.contacts.create, {
    channels: [
      { address: "linda@example.com", channel: "email", preferred: true },
    ],
    name: "Linda Alvarez",
    relationship: "Daughter",
    trusted: true,
  });

  await context.owner.mutation(api.contacts.create, {
    channels: [
      { address: "123456789012345678", channel: "discord", preferred: true },
    ],
    name: "Alex Alvarez",
    relationship: "Grandson",
    trusted: true,
  });

  return { backend, daughterId, ...context };
};

describe("multi-recipient messages", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it.each(["Sam and Linda", "all my kids", "Sam Alvarez, Linda Alvarez"])(
    "prepares the full Practice request for %s through Ask LifeLink",
    async (recipients) => {
      const { backend, owner, ownerId } = await family();
      register(backend);
      vi.stubEnv("OPENROUTER_API_KEY", "");
      await backend.run(
        async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
      );
      await owner.mutation(api.assistant.submitRequest, {
        channel: "text",
        text: `Tell ${recipients} that dinner is at six`,
      });
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      const tasks = await owner.query(api.tasks.list, { include: "all" });
      const [task] = tasks;

      if (!task) {
        throw new Error("No message task was prepared");
      }

      const detail = await owner.query(api.tasks.detail, { taskId: task._id });
      expect(detail.actions).toHaveLength(2);
      expect(
        detail.actions.every(
          (view) => view.action.status === "awaiting_approval"
        )
      ).toBeTruthy();
    }
  );

  it.each([
    ["Friend", "my friends"],
    ["Friend", "all of my friends"],
    ["Friend", "both my friends"],
    ["Friend", "all my friend"],
    ["Neighbor", "my neighbors"],
    ["Caregiver", "my caregivers"],
    ["Family friend", "my family friends"],
    ["Buddy", "my buddies"],
    ["Coach", "my coaches"],
  ])("expands saved %s categories for %s", async (relationship, phrase) => {
    const { backend, owner, ownerId, contactId, daughterId } = await family();
    await backend.run(async (ctx) => {
      await ctx.db.patch(contactId, { relationship });
      await ctx.db.patch(daughterId, { relationship });
    });
    await owner.mutation(api.contacts.create, {
      channels: [
        { address: "untrusted@example.com", channel: "email", preferred: true },
      ],
      name: "Untrusted contact",
      relationship,
      trusted: false,
    });
    const result = await propose(backend, ownerId, [phrase, "Sam"]);

    const detail = await owner.query(api.tasks.detail, {
      taskId: requireTask(result.taskId),
    });

    expect(detail.actions.map((view) => view.current?.details)).toStrictEqual([
      expect.objectContaining({ channel: "imessage", contactId }),
      expect.objectContaining({ channel: "email", contactId: daughterId }),
    ]);
  });

  it.each([
    ["Father", "my dad"],
    ["Dad", "my father"],
    ["Mom", "my mother"],
    ["Grandmother", "my grandma"],
  ])(
    "matches a contact saved as %s when asked for %s",
    async (relationship, phrase) => {
      const { backend, owner, ownerId, daughterId } = await family();
      await backend.run(
        async (ctx) => await ctx.db.patch(daughterId, { relationship })
      );
      const result = await propose(backend, ownerId, [phrase]);

      const detail = await owner.query(api.tasks.detail, {
        taskId: requireTask(result.taskId),
      });

      expect(detail.actions.map((view) => view.current?.details)).toStrictEqual(
        [expect.objectContaining({ contactId: daughterId })]
      );
    }
  );

  it("keeps a singular friend request ambiguous when several friends match", async () => {
    const { backend, ownerId, contactId, daughterId } = await family();
    await backend.run(async (ctx) => {
      await ctx.db.patch(contactId, { relationship: "Friend" });
      await ctx.db.patch(daughterId, { relationship: "Friend" });
    });
    const result = await propose(backend, ownerId, ["my friend"]);
    expect(result.taskId).toBeNull();
    expect(result.message).toContain("Which person");
  });

  it("prepares the quoted friends request from Ask without changing the quoted words", async () => {
    const { backend, owner, ownerId, contactId, daughterId } = await family();
    register(backend);
    vi.stubEnv("OPENROUTER_API_KEY", "");
    await backend.run(async (ctx) => {
      await ctx.db.patch(ownerId, { demoMode: true });
      await ctx.db.patch(contactId, { relationship: "Friend" });
      await ctx.db.patch(daughterId, { relationship: "Friend" });
    });
    await owner.mutation(api.assistant.submitRequest, {
      channel: "text",
      text: 'can you message my friends "relationship message test"',
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const [task] = await owner.query(api.tasks.list, { include: "all" });

    if (!task) {
      throw new Error("Missing friends task");
    }

    const detail = await owner.query(api.tasks.detail, { taskId: task._id });
    expect(detail.actions).toHaveLength(2);

    for (const view of detail.actions) {
      expect(view.current?.details).toMatchObject({
        body: "relationship message test",
      });
      expect(view.action.status).toBe("awaiting_approval");
      expect(view.attempts).toHaveLength(0);
    }
  });

  it("prepares all named recipients on their preferred channels and exposes the whole task for review", async () => {
    const { backend, owner, ownerId } = await family();
    const result = await propose(backend, ownerId, ["Sam", "Linda"]);
    expect(result.actionId).toBeNull();
    expect(result.taskId).not.toBeNull();

    const detail = await owner.query(api.tasks.detail, {
      taskId: requireTask(result.taskId),
    });

    expect(detail.actions.map((view) => view.current?.details)).toStrictEqual([
      expect.objectContaining({
        body: "Dinner is at six!",
        channel: "imessage",
        contactName: "Sam Alvarez",
      }),
      expect.objectContaining({
        body: "Dinner is at six!",
        channel: "email",
        contactName: "Linda Alvarez",
      }),
    ]);
    expect(
      detail.actions.every(
        (view) =>
          view.action.status === "awaiting_approval" &&
          view.attempts.length === 0
      )
    ).toBeTruthy();
    await expect(
      owner.query(api.assistant.taskActionIds, {
        taskId: requireTask(result.taskId),
      })
    ).resolves.toHaveLength(2);
  });

  it("expands kids and grandkids by relationship and deduplicates overlapping requests", async () => {
    const { backend, owner, ownerId } = await family();

    const result = await propose(backend, ownerId, [
      "all my kids",
      "my grandkids",
      "Sam",
    ]);

    const detail = await owner.query(api.tasks.detail, {
      taskId: requireTask(result.taskId),
    });

    expect(detail.actions).toHaveLength(3);
    expect(detail.steps).toHaveLength(3);
    expect(detail.task.contactId).toBeNull();
  });

  it("does not confuse grandchildren with children or include untrusted contacts", async () => {
    const { backend, owner, ownerId, daughterId } = await family();
    await backend.run(
      async (ctx) => await ctx.db.patch(daughterId, { trusted: false })
    );
    const result = await propose(backend, ownerId, ["my children"]);

    const detail = await owner.query(api.tasks.detail, {
      taskId: requireTask(result.taskId),
    });

    expect(detail.actions).toHaveLength(1);
    expect(detail.actions[0]?.current?.details).toMatchObject({
      contactName: "Sam Alvarez",
    });
  });

  it("prepares nothing if any requested name is unknown or ambiguous", async () => {
    const { backend, owner, ownerId } = await family();
    const missing = await propose(backend, ownerId, ["Sam", "Unknown"]);
    expect(missing.taskId).toBeNull();
    await owner.mutation(api.contacts.create, {
      channels: [
        { address: "sam@example.com", channel: "email", preferred: true },
      ],
      name: "Sam Rivera",
      relationship: "Friend",
      trusted: true,
    });
    const result = await propose(backend, ownerId, ["Linda", "Sam"]);
    expect(result.taskId).toBeNull();
    expect(result.message).toContain("Which person");
    await expect(
      owner.query(api.tasks.list, { include: "all" })
    ).resolves.toHaveLength(0);
  });

  it("does not silently omit a family member without a route", async () => {
    const { backend, ownerId, daughterId } = await family();
    await backend.run(
      async (ctx) => await ctx.db.patch(daughterId, { channels: [] })
    );
    const result = await propose(backend, ownerId, ["all my kids"]);
    expect(result.taskId).toBeNull();
    expect(result.message).toContain("Linda Alvarez has no saved way");
  });

  it("keeps other recipients active when one message is cancelled and completes approved sends independently", async () => {
    const { backend, owner, ownerId } = await family();
    await backend.run(
      async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
    );
    const result = await propose(backend, ownerId, ["Sam", "Linda"]);
    const taskId = requireTask(result.taskId);
    const detail = await owner.query(api.tasks.detail, { taskId });
    const [first, second] = detail.actions;

    if (!first || !second?.current) {
      throw new Error("Missing reviews");
    }

    await owner.mutation(api.actions.cancel, { actionId: first.action._id });
    const afterCancel = await owner.query(api.tasks.detail, { taskId });
    expect(afterCancel.task.status).toBe("awaiting_approval");
    await owner.mutation(api.actions.approve, {
      actionId: second.action._id,
      fingerprint: second.current.fingerprint,
      method: "tap",
      version: second.current.version,
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const finished = await owner.query(api.tasks.detail, { taskId });
    expect(finished.task.status).toBe("completed");
    expect(finished.actions.map((view) => view.action.status)).toStrictEqual([
      "cancelled",
      "succeeded",
    ]);
    expect(finished.actions[0]?.attempts).toHaveLength(0);
    expect(finished.actions[1]?.attempts).toHaveLength(1);
  });

  it("approves all displayed messages with separate receipts and rejects a repeated click", async () => {
    const { backend, owner, ownerId } = await family();
    await backend.run(
      async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
    );
    const result = await propose(backend, ownerId, ["Sam", "Linda"]);
    const taskId = requireTask(result.taskId);
    const detail = await owner.query(api.tasks.detail, { taskId });

    const messages = detail.actions.flatMap((view) =>
      view.current
        ? [
            {
              actionId: view.action._id,
              fingerprint: view.current.fingerprint,
              version: view.current.version,
            },
          ]
        : []
    );

    await owner.mutation(api.actions.approveMessages, {
      messages,
      method: "keyboard",
      taskId,
    });
    await expect(
      owner.mutation(api.actions.approveMessages, {
        messages,
        method: "tap",
        taskId,
      })
    ).rejects.toThrow(/changed/iu);
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const finished = await owner.query(api.tasks.detail, { taskId });
    expect(finished.task.status).toBe("completed");
    expect(
      finished.actions.every(
        (view) =>
          view.attempts.length === 1 &&
          view.currentApproval?.method === "keyboard"
      )
    ).toBeTruthy();
  });

  it("rolls back every approval when a later message has changed", async () => {
    const { backend, owner, ownerId } = await family();
    await backend.run(
      async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
    );
    const result = await propose(backend, ownerId, ["Sam", "Linda"]);
    const taskId = requireTask(result.taskId);
    const detail = await owner.query(api.tasks.detail, { taskId });

    const messages = detail.actions.flatMap((view) =>
      view.current
        ? [
            {
              actionId: view.action._id,
              fingerprint: view.current.fingerprint,
              version: view.current.version,
            },
          ]
        : []
    );

    const [, second] = messages;

    if (!second) {
      throw new Error("Missing second message");
    }

    await owner.mutation(api.actions.revise, {
      actionId: second.actionId,
      body: "Dinner is now at seven.",
    });
    await expect(
      owner.mutation(api.actions.approveMessages, {
        messages,
        method: "tap",
        taskId,
      })
    ).rejects.toThrow(/changed/iu);
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const unchanged = await owner.query(api.tasks.detail, { taskId });
    expect(
      unchanged.actions.every(
        (view) =>
          view.action.status === "awaiting_approval" &&
          view.currentApproval === null &&
          view.attempts.length === 0
      )
    ).toBeTruthy();
  });

  it("requires the complete remaining set and keeps relationship metadata in the review", async () => {
    const { backend, owner, ownerId } = await family();
    const result = await propose(backend, ownerId, ["Sam", "Linda"]);
    const taskId = requireTask(result.taskId);
    const detail = await owner.query(api.assistant.taskReview, { taskId });
    expect(
      detail?.actions.map((view) => view.recipientRelationship)
    ).toStrictEqual(["Son", "Daughter"]);

    const messages =
      detail?.actions.flatMap((view) =>
        view.current
          ? [
              {
                actionId: view.action._id,
                fingerprint: view.current.fingerprint,
                version: view.current.version,
              },
            ]
          : []
      ) ?? [];

    await expect(
      owner.mutation(api.actions.approveMessages, {
        messages: messages.slice(0, 1),
        method: "tap",
        taskId,
      })
    ).rejects.toThrow(/changed/iu);
    const [first] = messages;

    if (!first) {
      throw new Error("Missing message");
    }

    await expect(
      owner.mutation(api.actions.approveMessages, {
        messages: [first, first],
        method: "tap",
        taskId,
      })
    ).rejects.toThrow(/changed/iu);
  });

  it("sends messages that one reply prepared as separate requests together", async () => {
    const { backend, owner, ownerId } = await family();
    await backend.run(
      async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
    );
    const toSam = await propose(backend, ownerId, ["Sam"]);
    const toLinda = await propose(backend, ownerId, ["Linda"]);

    const actionIds = [toSam.actionId, toLinda.actionId].flatMap((id) =>
      id === null ? [] : [id]
    );

    expect(actionIds).toHaveLength(2);

    const views = await owner.query(api.assistant.actionReviews, {
      actionIds: [...actionIds, "not-an-action"],
    });

    expect(
      views.map((view) =>
        view.current?.details.kind === "send_message"
          ? view.current.details.channel
          : null
      )
    ).toStrictEqual(["imessage", "email"]);

    const messages = views.flatMap((view) =>
      view.current
        ? [
            {
              actionId: view.action._id,
              fingerprint: view.current.fingerprint,
              version: view.current.version,
            },
          ]
        : []
    );

    const [, second] = messages;

    if (!second) {
      throw new Error("Missing second message");
    }

    await owner.mutation(api.actions.revise, {
      actionId: second.actionId,
      body: "Dinner is now at seven.",
    });
    await expect(
      owner.mutation(api.actions.approveMessages, { messages, method: "tap" })
    ).rejects.toThrow(/changed/iu);

    const fresh = await owner.query(api.assistant.actionReviews, { actionIds });
    expect(
      fresh.every((view) => view.action.status === "awaiting_approval")
    ).toBeTruthy();

    await owner.mutation(api.actions.approveMessages, {
      messages: fresh.flatMap((view) =>
        view.current
          ? [
              {
                actionId: view.action._id,
                fingerprint: view.current.fingerprint,
                version: view.current.version,
              },
            ]
          : []
      ),
      method: "tap",
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);

    const tasks = await Promise.all(
      [toSam.taskId, toLinda.taskId].map(
        async (taskId) =>
          await owner.query(api.tasks.detail, { taskId: requireTask(taskId) })
      )
    );

    expect(tasks.map((detail) => detail.task.status)).toStrictEqual([
      "completed",
      "completed",
    ]);
  });
});

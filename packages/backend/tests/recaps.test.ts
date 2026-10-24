import type { ConversationRecap } from "@lifelink/contracts/model-output";
import { describe, expect, it } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import {
  connectFamily,
  newBackend,
  onlyAction,
  ownerWithContact,
} from "./harness";
import type { Backend } from "./harness";

const theySay = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  contactId: Id<"contacts">,
  body: string
): Promise<void> => {
  await backend.mutation(internal.messages.receive, {
    body,
    channel: "imessage",
    contactId,
    mode: "live",
    ownerId,
    providerMessageId: `test-${Math.random()}`,
  });
};

const youSay = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  contactId: Id<"contacts">,
  body: string,
  status: Doc<"messages">["status"] = "sent"
): Promise<void> => {
  await backend.run(async (ctx) => {
    await ctx.db.insert("messages", {
      actionId: null,
      body,
      channel: "imessage",
      contactId,
      createdAt: Date.now(),
      direction: "outgoing",
      mode: "live",
      ownerId,
      photoIds: [],
      providerMessageId: null,
      status,
      statusUpdatedAt: Date.now(),
      taskId: null,
    });
  });
};

describe("recapping a conversation", () => {
  it("separates what was agreed from what was only offered", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await theySay(
      backend,
      ownerId,
      contactId,
      "Do you need a ride on Wednesday?"
    );
    await youSay(
      backend,
      ownerId,
      contactId,
      "Yes please, that would be lovely."
    );
    await theySay(backend, ownerId, contactId, "I can pick you up at 9am.");

    await owner.mutation(api.recaps.request, { contactId });
    const view = await owner.query(api.recaps.forContact, { contactId });

    expect(
      view?.recap.agreements.map((item) => item.offer.quote)
    ).toStrictEqual(["Do you need a ride on Wednesday?"]);
    expect(view?.recap.offers.map((item) => item.offer.quote)).toStrictEqual([
      "I can pick you up at 9am.",
    ]);
    expect(view?.recap).toMatchObject({
      localReason: "chosen",
      method: "local",
    });
  });

  it("never treats an unsent draft as something you said", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await theySay(
      backend,
      ownerId,
      contactId,
      "Could you come for lunch on Sunday?"
    );
    await youSay(backend, ownerId, contactId, "Yes, I'd love to!", "draft");
    await youSay(backend, ownerId, contactId, "Yes, I'd love to!", "failed");

    await owner.mutation(api.recaps.request, { contactId });
    const view = await owner.query(api.recaps.forContact, { contactId });

    expect(view?.recap.agreements).toStrictEqual([]);
    expect(view?.recap.lines).toHaveLength(1);
  });

  it("makes a new recap when a new message arrives", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await theySay(backend, ownerId, contactId, "I can drive you on Tuesday.");
    const first = await owner.mutation(api.recaps.request, { contactId });
    const same = await owner.mutation(api.recaps.request, { contactId });

    await youSay(backend, ownerId, contactId, "Thank you, yes please!");
    const next = await owner.mutation(api.recaps.request, { contactId });

    expect(same).toBe(first);
    expect(next).not.toBe(first);
  });
});

describe("done comes only from LifeLink's records", () => {
  it("lists completed tasks, never a claim in a message", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await theySay(
      backend,
      ownerId,
      contactId,
      "I booked the taxi for you, all done!"
    );

    await backend.run(async (ctx) => {
      await ctx.db.insert("tasks", {
        appointmentId: null,
        contactId,
        createdAt: Date.now(),
        kind: "send_message",
        mode: "live",
        origin: "text",
        ownerId,
        request: "Thank Sam",
        status: "completed",
        title: "Message to Sam Alvarez",
        updatedAt: Date.now(),
      });
    });

    await owner.mutation(api.recaps.request, { contactId });
    const view = await owner.query(api.recaps.forContact, { contactId });

    expect(view?.done.map((task) => task.title)).toStrictEqual([
      "Message to Sam Alvarez",
    ]);
  });
});

describe("a cloud recap is held to the messages", () => {
  it("downgrades an agreement without a real acceptance to an offer", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await theySay(backend, ownerId, contactId, "I could drive you on Tuesday.");
    const recapId = await owner.mutation(api.recaps.request, { contactId });

    await backend.run(async (ctx) => {
      await ctx.db.patch(recapId, { method: "cloud", status: "recapping" });
    });

    const model: ConversationRecap = {
      agreements: [
        {
          acceptance: { messageRef: "m1", quote: "Yes, see you then" },
          offer: { messageRef: "m1", quote: "I could drive you on Tuesday." },
          text: "Sam is driving you on Tuesday.",
        },
      ],
      offers: [],
      proposedSteps: [],
      summary: "Sam offered a ride.",
      unclear: [],
    };

    await backend.mutation(internal.recaps.finish, {
      model: "test-model",
      recapId,
      resultJson: JSON.stringify(model),
    });

    const view = await owner.query(api.recaps.forContact, { contactId });

    expect(view?.recap.agreements).toStrictEqual([]);
    expect(view?.recap.offers[0]?.offer.quote).toBe(
      "I could drive you on Tuesday."
    );
    expect(view?.recap.droppedCount).toBe(1);
  });
});

describe("proposed next steps", () => {
  it("are prepared for the usual exact-version review, once", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await theySay(
      backend,
      ownerId,
      contactId,
      "I could drive you on Tuesday if you like."
    );
    const recapId = await owner.mutation(api.recaps.request, { contactId });

    const taskId = await owner.mutation(api.recaps.prepareStep, {
      index: 0,
      recapId,
    });

    const again = await owner.mutation(api.recaps.prepareStep, {
      index: 0,
      recapId,
    });

    const { current, view } = await onlyAction(owner, taskId);

    expect(again).toBe(taskId);
    expect(view.action.status).toBe("awaiting_approval");
    expect(current.details).toMatchObject({
      body: "Yes please, that would be wonderful. Thank you!\nRuth",
      kind: "send_message",
    });
  });

  it("are not prepared for real from a Practice recap", async () => {
    const backend = newBackend();
    const { contactId, owner, ownerId } = await ownerWithContact(backend, true);

    await backend.mutation(internal.messages.receive, {
      body: "I could drive you on Tuesday if you like.",
      channel: "imessage",
      contactId,
      mode: "simulated",
      ownerId,
      providerMessageId: "practice-1",
    });

    const recapId = await owner.mutation(api.recaps.request, { contactId });

    await owner.mutation(api.profiles.setDemoMode, { enabled: false });

    await expect(
      owner.mutation(api.recaps.prepareStep, { index: 0, recapId })
    ).rejects.toThrow(/Practice mode/u);
  });
});

describe("recaps stay private", () => {
  it("is never readable by family", async () => {
    const backend = newBackend();

    const { contactId, owner, ownerId } = await ownerWithContact(
      backend,
      false
    );

    await theySay(backend, ownerId, contactId, "I can drive you on Tuesday.");
    await owner.mutation(api.recaps.request, { contactId });

    const { family } = await connectFamily(backend, owner, [
      "appointments.view",
      "reminders.view",
      "rides.view",
      "photos.view",
      "scam_alerts.view",
      "groceries.view",
    ]);

    await expect(
      family.query(api.recaps.forContact, { contactId })
    ).rejects.toThrow(/owner/u);

    const overview = await family.query(api.family.overview, { ownerId });

    expect(JSON.stringify(overview)).not.toContain("drive you on Tuesday");
  });
});

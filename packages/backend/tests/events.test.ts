import { afterEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { newBackend, ownerWithContact } from "./harness";
import {
  conversationForContact,
  enrollContact,
  PROJECT_ID,
} from "./imessage-harness";

const countRows = async (backend: ReturnType<typeof newBackend>) =>
  await backend.run(async (ctx) => {
    const events = await ctx.db.query("incomingEvents").collect();
    const messages = await ctx.db.query("messages").collect();

    return {
      events: events.length,
      incoming: messages.filter((message) => message.direction === "incoming")
        .length,
    };
  });

describe("incoming events are processed once", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("ignores a repeated Photon delivery and repeated provider message ids", async () => {
    const backend = newBackend();

    const { ownerId, contactId } = await ownerWithContact(backend, false);

    vi.stubEnv("SPECTRUM_PROJECT_ID", PROJECT_ID);
    await enrollContact(backend, ownerId, contactId);

    const event = {
      conversation: { ...conversationForContact(), messageId: "msg_1" },
      eventId: "evt_1",
      messageId: "msg_1",
      payload: "{}",
      projectId: PROJECT_ID,
      text: "Yes, I can drive you.",
      type: "messages",
    };

    await expect(
      backend.mutation(internal.webhooks.photonEvent, event)
    ).resolves.toBe("processed");
    await expect(
      backend.mutation(internal.webhooks.photonEvent, event)
    ).resolves.toBe("duplicate");
    await expect(countRows(backend)).resolves.toStrictEqual({
      events: 1,
      incoming: 1,
    });

    // A new event id that carries the same provider message is still stored once.
    await expect(
      backend.mutation(internal.webhooks.photonEvent, {
        ...event,
        eventId: "evt_2",
      })
    ).resolves.toBe("processed");
    await expect(countRows(backend)).resolves.toStrictEqual({
      events: 2,
      incoming: 1,
    });
  });

  it("ignores a repeated Discord message", async () => {
    const backend = newBackend();
    const { owner } = await ownerWithContact(backend, false);

    await owner.mutation(api.contacts.create, {
      channels: [
        { address: "100000000000000001", channel: "discord", preferred: true },
      ],
      name: "Marcus Alvarez",
      relationship: "Grandson",
      trusted: true,
    });

    const message = {
      authorId: "100000000000000001",
      content: "Hi Grandma",
      messageId: "d_1",
      payload: "{}",
    };

    await expect(
      backend.mutation(internal.webhooks.discordMessage, message)
    ).resolves.toBe("processed");
    await expect(
      backend.mutation(internal.webhooks.discordMessage, message)
    ).resolves.toBe("duplicate");
    await expect(countRows(backend)).resolves.toStrictEqual({
      events: 1,
      incoming: 1,
    });
  });

  it("records a Composio event once even when it matches no connection", async () => {
    const backend = newBackend();

    const event = {
      connectedAccountId: null,
      eventId: "msg_abc",
      mail: null,
      payload: "{}",
      triggerSlug: "GMAIL_NEW_GMAIL_MESSAGE",
      type: "composio.trigger.message",
    };

    await expect(
      backend.mutation(internal.webhooks.composioEvent, event)
    ).resolves.toBe("ignored");
    await expect(
      backend.mutation(internal.webhooks.composioEvent, event)
    ).resolves.toBe("duplicate");
    await expect(countRows(backend)).resolves.toStrictEqual({
      events: 1,
      incoming: 0,
    });
  });

  it("ignores messages from people who are not anyone's contact", async () => {
    const backend = newBackend();

    await ownerWithContact(backend, false);

    const result = await backend.mutation(internal.webhooks.photonEvent, {
      conversation: {
        ...conversationForContact(),
        handle: "+15550000000",
        messageId: "msg_9",
      },
      eventId: "evt_9",
      messageId: "msg_9",
      payload: "{}",
      projectId: PROJECT_ID,
      text: "Click this link to claim your prize",
      type: "messages",
    });

    expect(result).toBe("ignored");
    await expect(countRows(backend)).resolves.toStrictEqual({
      events: 1,
      incoming: 0,
    });
  });
});

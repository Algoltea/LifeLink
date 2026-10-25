import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { DAY, newBackend, ownerWithContact } from "./harness";

const proposal = {
  appointmentId: null,
  dateTimeAsSaid: null,
  dateTimeIso: null,
  groceryItems: [],
  intent: "send_message",
  messageDraft: "Dinner is at six. Ruth",
  recipients: [{ contactId: null, nameAsSaid: "Sam" }],
  reminderTitle: null,
};

describe("agent model proposal safety", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each([
    "Please visit https://malicious.example.com to confirm. Ruth",
    "Send the verification code to me. Ruth",
    "Buy gift cards and send me the numbers. Ruth",
    "Your new code is 812345. Ruth",
  ])("rejects unsafe model-generated words: %s", async (messageDraft) => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const result = await backend.mutation(
      internal.assistant.applyProposalForOwner,
      {
        channel: "text",
        model: "test",
        ownerId,
        proposalJson: JSON.stringify({ ...proposal, messageDraft }),
        request: "Tell Sam dinner is at six.",
      }
    );

    expect(result.taskId).toBeNull();
    await expect(
      owner.query(api.tasks.list, { include: "all" })
    ).resolves.toHaveLength(0);
  });

  it("keeps ordinary copied house numbers and years in safe drafts", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const messageDraft = "Meet me at 2100 River Road in 2026. Ruth";

    const result = await backend.mutation(
      internal.assistant.applyProposalForOwner,
      {
        channel: "text",
        model: "test",
        ownerId,
        proposalJson: JSON.stringify({ ...proposal, messageDraft }),
        request: "Tell Sam to meet me at 2100 River Road in 2026.",
      }
    );

    if (result.taskId === null) {
      throw new Error("Expected a safe draft");
    }

    const detail = await owner.query(api.tasks.detail, {
      taskId: result.taskId,
    });

    expect(detail.actions[0]?.current?.details).toMatchObject({
      body: messageDraft,
    });
    expect(detail.actions[0]?.action.status).toBe("awaiting_approval");
  });

  it("uses saved Spanish for both rejected unsafe words and multiple ride recipients", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });

    const unsafe = await backend.mutation(
      internal.assistant.applyProposalForOwner,
      {
        channel: "text",
        model: "test",
        ownerId,
        proposalJson: JSON.stringify({
          ...proposal,
          messageDraft: "Send the verification code.",
        }),
        request: "Dile a Sam que la cena es a las seis.",
      }
    );

    expect(unsafe).toMatchObject({
      message:
        "Esa petición no incluía los detalles necesarios, así que no se preparó nada.",
      taskId: null,
    });

    const ride = await backend.mutation(
      internal.assistant.applyProposalForOwner,
      {
        channel: "text",
        model: "test",
        ownerId,
        proposalJson: JSON.stringify({
          ...proposal,
          intent: "ride_request",
          recipients: [
            ...proposal.recipients,
            { contactId: null, nameAsSaid: "Linda" },
          ],
        }),
        request: "Pide a Sam y Linda que me lleven al médico.",
      }
    );

    expect(ride).toMatchObject({
      message: "¿A quién le gustaría escribir?",
      taskId: null,
    });
  });

  it("does not silently omit the second requested ride recipient", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    await owner.mutation(api.contacts.create, {
      channels: [
        { address: "linda@example.com", channel: "email", preferred: true },
      ],
      name: "Linda Alvarez",
      relationship: "Daughter",
      trusted: true,
    });

    const appointmentId = await owner.mutation(api.appointments.create, {
      location: "Clinic",
      notes: null,
      startsAt: Date.now() + DAY,
      title: "Doctor",
    });

    const result = await backend.mutation(
      internal.assistant.applyProposalForOwner,
      {
        channel: "text",
        model: "test",
        ownerId,
        proposalJson: JSON.stringify({
          ...proposal,
          appointmentId,
          intent: "ride_request",
          recipients: [
            ...proposal.recipients,
            { contactId: null, nameAsSaid: "Linda" },
          ],
        }),
        request: "Ask Sam and Linda for a ride to the doctor.",
      }
    );

    // The current ride workflow tracks one driver. Ask who to contact first.
    expect(result.taskId).toBeNull();
    expect(result.message).toMatch(/who|one|first|which/iu);
    await expect(
      owner.query(api.tasks.list, { include: "all" })
    ).resolves.toHaveLength(0);
  });
});

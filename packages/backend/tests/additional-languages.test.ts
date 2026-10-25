import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { Proposal } from "@lifelink/contracts/model-output";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { contactLocale, ownerLocale } from "../convex/lib/locale";
import { noticesFor } from "../convex/lib/notices";
import { formatDay, formatTime } from "../convex/lib/time";
import { additionalLanguageCases } from "./additional-language-cases";
import {
  DAY,
  newBackend,
  onlyAction,
  ownerWithContact,
  signUp,
} from "./harness";

const proposal = (
  intent: Proposal["intent"],
  fields: Partial<Proposal> = {}
): Proposal => ({
  appointmentId: null,
  dateTimeAsSaid: null,
  dateTimeIso: null,
  groceryItems: [],
  intent,
  messageDraft: null,
  recipients: [],
  reminderTitle: null,
  ...fields,
});

const NOW = Date.parse("2026-10-24T12:00:00Z");
const TITLE = "Dr. Patel — 原文";
const LOCATION = "Clínica Central";
const ORIGINAL = "Bonjour — 原文\nDon't translate this: ¿sí?";

describe("eight additional backend languages", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockRejectedValue(new Error("Unexpected outbound request"))
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each(additionalLanguageCases)(
    "persists $language overrides and keeps null tied to the owner despite a different linked profile",
    async ({ language }) => {
      const backend = newBackend();

      const { owner, ownerId, contactId } = await ownerWithContact(
        backend,
        false
      );

      const { id: familyId, person: family } = await signUp(backend, {
        demo: false,
        name: "Sam Alvarez",
        role: "family",
        subject: "family",
      });

      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: "es",
      });
      await family.mutation(api.profiles.updatePreferences, {
        supportLanguage: language,
      });
      await backend.run(
        async (ctx) =>
          await ctx.db.patch(contactId, { linkedProfileId: familyId })
      );

      const read = async () =>
        await backend.run(
          async (ctx) =>
            await contactLocale(ctx, ownerId, await ctx.db.get(contactId))
        );

      const locales = [await read()];

      const context = await backend.query(internal.assistant.planningContext, {
        ownerId,
      });

      expect(context).toMatchObject({
        contacts: expect.arrayContaining([
          {
            id: contactId,
            language: "Spanish",
            name: "Sam Alvarez",
            relationship: "Son",
          },
        ]),
        language: "Spanish",
      });

      const fields = {
        channels: [
          {
            address: "+15555550142",
            channel: "imessage" as const,
            preferred: true,
          },
        ],
        contactId,
        name: "Sam Alvarez",
        relationship: "Son",
        trusted: true,
      };

      await owner.mutation(api.contacts.update, { ...fields, language });
      locales.push(await read());
      await owner.mutation(api.contacts.update, fields);
      locales.push(await read());
      await owner.mutation(api.contacts.update, { ...fields, language: null });
      locales.push(await read());
      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: "en",
      });
      locales.push(await read());
      expect(locales).toStrictEqual(["es", language, language, "es", "en"]);

      const newId = await owner.mutation(api.contacts.create, {
        channels: fields.channels,
        language,
        name: fields.name,
        relationship: fields.relationship,
        trusted: fields.trusted,
      });

      await expect(
        backend.run(async (ctx) => await ctx.db.get(newId))
      ).resolves.toMatchObject({ language });
    }
  );

  it.each(additionalLanguageCases)(
    "keeps $language recipient drafts separate from the owner's words and saved evidence",
    async ({ language, ride, prepared }) => {
      const backend = newBackend();

      const { owner, ownerId, contactId } = await ownerWithContact(
        backend,
        false
      );

      const appointmentId = await owner.mutation(api.appointments.create, {
        location: LOCATION,
        notes: null,
        startsAt: NOW + DAY,
        title: TITLE,
      });

      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: language,
      });
      await backend.run(
        async (ctx) => await ctx.db.patch(contactId, { language: "en" })
      );

      const apply = async () =>
        await backend.mutation(internal.assistant.applyProposalForOwner, {
          channel: "text",
          model: "test",
          ownerId,
          proposalJson: JSON.stringify(
            proposal("ride_request", {
              appointmentId,
              recipients: [{ contactId, nameAsSaid: "Sam" }],
            })
          ),
          request: ORIGINAL,
        });

      const first = await apply();

      if (first.taskId === null) {
        throw new Error("Expected a ride task");
      }

      const firstAction = await onlyAction(owner, first.taskId);
      expect({
        details: firstAction.current.details,
        reply: first.message,
      }).toMatchObject({
        details: {
          body: expect.stringContaining("Hi Sam, could you give me a ride"),
          kind: "send_message",
        },
        reply: expect.stringContaining(prepared),
      });

      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: "en",
      });
      await backend.run(
        async (ctx) => await ctx.db.patch(contactId, { language })
      );
      const second = await apply();
      expect(second.message).toContain("I've written a message asking Sam");

      if (second.taskId === null) {
        throw new Error("Expected a ride task");
      }

      const { current } = await onlyAction(owner, second.taskId);

      if (current.details.kind !== "send_message") {
        throw new Error("Expected a message");
      }

      for (const part of [
        ride,
        TITLE,
        LOCATION,
        "Ruth",
        formatDay(NOW + DAY, "America/New_York", intlLocaleOf(language)),
        formatTime(NOW + DAY, "America/New_York", intlLocaleOf(language)),
      ]) {
        expect(current.details.body).toContain(part);
      }

      const retained = await onlyAction(owner, first.taskId);
      expect(retained.current).toStrictEqual(firstAction.current);
    }
  );

  it.each(additionalLanguageCases)(
    "keeps owner-only analysis and original quotes out of $language recipient help drafts",
    async ({ language, check }) => {
      const backend = newBackend();
      const { owner, contactId } = await ownerWithContact(backend, false);
      await backend.run(
        async (ctx) => await ctx.db.patch(contactId, { language })
      );

      const reviewId = await owner.mutation(api.scam.submit, {
        allowCloudAnalysis: false,
        emailId: null,
        screenshotId: null,
        text: ORIGINAL,
      });

      const signals = [
        {
          detail: "Owner-only analysis",
          label: "Private warning",
          quote: ORIGINAL,
          stance: "requests" as const,
        },
      ];

      await backend.run(
        async (ctx) => await ctx.db.patch(reviewId, { signals })
      );

      const taskId = await owner.mutation(api.scam.askTrustedContact, {
        contactId,
        reviewId,
      });

      const draft = await onlyAction(owner, taskId);

      if (draft.current.details.kind !== "send_message") {
        throw new Error("Expected a help draft");
      }

      expect(draft.current.details.body).toContain(check);

      for (const privateText of ["Owner-only", "Private warning", ORIGINAL]) {
        expect(draft.current.details.body).not.toContain(privateText);
      }

      await expect(
        backend.run(async (ctx) => await ctx.db.get(reviewId))
      ).resolves.toMatchObject({ inputText: ORIGINAL, signals });
    }
  );

  it.each(additionalLanguageCases)(
    "writes $language proposal replies without rewriting proposed content",
    async ({ language, prepared, groceries, noOrder, reminder }) => {
      const backend = newBackend();

      const { owner, ownerId, contactId } = await ownerWithContact(
        backend,
        false
      );

      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: language,
      });

      const apply = async (input: Proposal) =>
        await backend.mutation(internal.assistant.applyProposalForOwner, {
          channel: "text",
          model: "test",
          ownerId,
          proposalJson: JSON.stringify(input),
          request: ORIGINAL,
        });

      const message = await apply(
        proposal("send_message", {
          messageDraft: ORIGINAL,
          recipients: [{ contactId, nameAsSaid: "Sam" }],
        })
      );

      if (message.taskId === null) {
        throw new Error("Expected a message task");
      }

      const messageAction = await onlyAction(owner, message.taskId);
      expect({
        details: messageAction.current.details,
        reply: message.message,
      }).toMatchObject({
        details: { body: ORIGINAL, kind: "send_message" },
        reply: expect.stringContaining(prepared),
      });

      const reminderResult = await apply(
        proposal("create_reminder", {
          dateTimeIso: new Date(NOW + DAY).toISOString(),
          reminderTitle: TITLE,
        })
      );

      for (const part of [reminder, TITLE]) {
        expect(reminderResult.message).toContain(part);
      }

      if (reminderResult.taskId === null) {
        throw new Error("Expected a reminder task");
      }

      const reminderAction = await onlyAction(owner, reminderResult.taskId);
      expect(reminderAction.current.details).toMatchObject({
        kind: "create_reminder",
        remindAt: NOW + DAY,
        title: TITLE,
      });

      const groceryResult = await apply(
        proposal("grocery_list", {
          groceryItems: [{ name: "café 原文", quantity: 2, unit: "袋" }],
        })
      );

      for (const part of [noOrder, "café 原文"]) {
        expect(groceryResult.message).toContain(part);
      }

      const list = await backend.run(
        async (ctx) => await ctx.db.query("groceryLists").first()
      );

      expect(list).toMatchObject({
        items: [{ name: "café 原文", quantity: 2, unit: "袋" }],
        name: groceries,
      });
    }
  );

  it.each(additionalLanguageCases)(
    "keeps saved briefings and uses $language rules when cloud generation fails",
    async ({
      language,
      noAppointments,
      rideNeeded,
      rideConfirmed,
      waiting,
    }) => {
      const backend = newBackend();

      const { owner, ownerId, contactId } = await ownerWithContact(
        backend,
        false
      );

      await owner.mutation(api.profiles.updatePreferences, {
        explanationDetail: "detailed",
        supportLanguage: language,
      });
      await backend.action(internal.briefings.generate, {
        dateKey: "empty",
        ownerId,
      });

      const earlier = await backend.run(
        async (ctx) => await ctx.db.query("briefings").first()
      );

      expect(earlier).toMatchObject({
        greetingFact: expect.stringContaining(noAppointments),
        lines: [],
      });

      const appointmentId = await owner.mutation(api.appointments.create, {
        location: null,
        notes: null,
        startsAt: NOW + DAY,
        title: TITLE,
      });

      await backend.run(
        async (ctx) =>
          await ctx.db.insert("reminders", {
            createdAt: NOW,
            dismissedAt: null,
            firedAt: null,
            mode: "live",
            ownerId,
            remindAt: NOW + 60_000,
            scheduledJobId: null,
            shareWithCircle: false,
            sourceActionId: null,
            title: ORIGINAL,
          })
      );
      await owner.mutation(api.messages.draft, {
        body: ORIGINAL,
        contactId,
        photoIds: [],
      });
      vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");

      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json(
            { error: { message: "Original provider diagnostic" } },
            { status: 400 }
          )
        );

      vi.stubGlobal("fetch", fetchMock);
      await backend.action(internal.briefings.generate, {
        dateKey: "failed-cloud",
        ownerId,
      });

      const rows = await backend.run(
        async (ctx) => await ctx.db.query("briefings").collect()
      );

      expect(rows[0]).toStrictEqual(earlier);
      expect(rows[1]).toMatchObject({
        greetingFact: expect.stringContaining(TITLE),
        lines: expect.arrayContaining([
          expect.stringContaining(rideNeeded),
          expect.stringContaining(ORIGINAL),
          expect.stringContaining(waiting),
        ]),
        source: "rules",
      });
      expect(fetchMock).toHaveBeenCalledOnce();
      await backend.run(
        async (ctx) =>
          await ctx.db.patch(appointmentId, { rideStatus: "confirmed" })
      );
      await owner.mutation(api.messages.draft, {
        body: "Second request",
        contactId,
        photoIds: [],
      });
      vi.stubEnv("OPENROUTER_API_KEY", "");
      await backend.action(internal.briefings.generate, {
        dateKey: "confirmed",
        ownerId,
      });

      const confirmed = await backend.run(
        async (ctx) => await ctx.db.query("briefings").order("desc").first()
      );

      expect(confirmed).toMatchObject({
        greetingFact: expect.stringContaining(
          formatDay(NOW + DAY, "America/New_York", intlLocaleOf(language))
        ),
        lines: expect.arrayContaining([
          rideConfirmed,
          expect.stringContaining("2"),
          expect.stringContaining(waiting),
        ]),
      });
    }
  );

  it.each(additionalLanguageCases)(
    "provides all $language service notices with original names and usernames",
    ({ language, greeting }) => {
      const notices = noticesFor(language);
      const english = noticesFor("en");

      for (const part of [greeting, "@sam_a"]) {
        expect(notices.telegramStartHelp("Sam", "sam_a")).toContain(part);
      }

      expect(notices.telegramStartHelp(null, null)).not.toMatch(
        /null|undefined/u
      );

      for (const key of [
        "telegramAlreadyConnected",
        "telegramExpired",
        "photoOnly",
      ] as const) {
        expect(notices[key]).not.toBe(english[key]);
      }

      const connected = notices.telegramConnected(["Ruth", "María"]);

      for (const name of ["Ruth", "María"]) {
        expect(connected).toContain(name);
      }

      expect(notices.telegramConnected([])).not.toBe(
        english.telegramConnected([])
      );
    }
  );

  it("uses English for an unknown persisted owner language", async () => {
    const backend = newBackend();

    const { ownerId, contactId } = await ownerWithContact(backend, false);

    await backend.run(async (ctx) => {
      const preferences = await ctx.db
        .query("preferences")
        .withIndex("by_profile", (index) => index.eq("profileId", ownerId))
        .unique();

      if (preferences === null) {
        throw new Error("Missing preferences");
      }

      await ctx.db.patch(preferences._id, {
        supportLanguage: "unknown-language",
      });
    });
    await expect(
      backend.run(async (ctx) => await ownerLocale(ctx, ownerId))
    ).resolves.toBe("en");

    const context = await backend.query(internal.assistant.planningContext, {
      ownerId,
    });

    expect(context).toMatchObject({ language: "English", locale: "en" });
    expect(
      context?.contacts.find((contact) => contact.id === contactId)?.language
    ).toBe("English");
    await backend.action(internal.briefings.generate, {
      dateKey: "unknown",
      ownerId,
    });
    await expect(
      backend.run(async (ctx) => await ctx.db.query("briefings").first())
    ).resolves.toMatchObject({
      greetingFact: "Nothing is booked for the next few days.",
    });
  });
});

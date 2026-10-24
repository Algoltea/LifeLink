import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { systemInstructionFor } from "../convex/integrations/live";
import { rideRequestBody } from "../convex/lib/journey";
import { contactLocale, ownerLocale } from "../convex/lib/locale";
import { noticesFor } from "../convex/lib/notices";
import { DAY, newBackend, onlyAction, ownerWithContact } from "./harness";

describe("persisted locale and contact fallback", () => {
  it.each(["es", "fr"])(
    "persists %s during onboarding without narrowing multilingual support",
    async (language) => {
      const backend = newBackend();
      const person = backend.withIdentity({ subject: "new-owner" });

      const signup = {
        city: null,
        displayName: "Ruth Alvarez",
        postalCode: null,
        preferredName: "Ruth",
        role: "owner" as const,
        signOffName: null,
        startInDemoMode: false,
        supportLanguage: language,
        timeZone: "America/New_York",
      };

      const ownerId = await person.mutation(
        api.profiles.completeOnboarding,
        signup
      );

      const initial = await person.query(api.profiles.me, {});

      expect(initial?.preferences?.supportLanguage).toBe(language);
      await person.mutation(api.profiles.updatePreferences, {
        supportLanguage: "en",
      });
      await expect(
        person.mutation(api.profiles.completeOnboarding, signup)
      ).resolves.toBe(ownerId);
      const updated = await person.query(api.profiles.me, {});

      expect(updated?.preferences?.supportLanguage).toBe("en");
    }
  );

  it("rejects unsupported preferences and preserves the previous language", async () => {
    const backend = newBackend();
    const { owner } = await ownerWithContact(backend, false);

    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });
    await expect(
      owner.mutation(api.profiles.updatePreferences, { supportLanguage: "xx" })
    ).rejects.toThrow("Please choose one of the languages offered.");
    const saved = await owner.query(api.profiles.me, {});

    expect(saved?.preferences?.supportLanguage).toBe("es");
  });

  it("defaults old rows to English, follows owner changes, and preserves or clears contact overrides", async () => {
    const backend = newBackend();

    const { owner, ownerId, contactId } = await ownerWithContact(
      backend,
      false
    );

    const read = async () =>
      await backend.run(async (ctx) => ({
        contact: await contactLocale(ctx, ownerId, await ctx.db.get(contactId)),
        owner: await ownerLocale(ctx, ownerId),
      }));

    await expect(read()).resolves.toStrictEqual({ contact: "en", owner: "en" });
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });
    await expect(read()).resolves.toStrictEqual({ contact: "es", owner: "es" });

    const update = {
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

    await owner.mutation(api.contacts.update, { ...update, language: "en" });
    await owner.mutation(api.contacts.update, update);
    await expect(read()).resolves.toStrictEqual({ contact: "en", owner: "es" });
    await owner.mutation(api.contacts.update, { ...update, language: null });
    await expect(read()).resolves.toStrictEqual({ contact: "es", owner: "es" });
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "fr",
    });
    await expect(read()).resolves.toStrictEqual({ contact: "en", owner: "en" });
  });

  it("keeps Sarah's full support language in assistant and voice context", async () => {
    const backend = newBackend();

    const { owner, ownerId, contactId } = await ownerWithContact(
      backend,
      false
    );

    await owner.mutation(api.profiles.updatePreferences, {
      communicationNotes: "Private help preference",
      supportLanguage: "fr",
    });

    const context = await backend.query(internal.assistant.planningContext, {
      ownerId,
    });

    expect(context?.language).toBe("French");
    expect(
      context?.contacts.find((contact) => contact.id === contactId)?.language
    ).toBe("French");
    expect(JSON.stringify(context)).not.toContain("Private help preference");
    await expect(
      owner.query(internal.voice.nameForVoice, {})
    ).resolves.toStrictEqual({ language: "French", preferredName: "Ruth" });
  });

  it("uses the voice language without changing review-before-send rules", () => {
    expect(systemInstructionFor("Ruth", "Spanish")).toContain(
      "Speak in Spanish"
    );
    expect(systemInstructionFor("Ruth")).toContain("answer in that language");
    expect(systemInstructionFor("Ruth", "Spanish")).toContain(
      "never claim something was sent"
    );
  });
});

describe("recipient-language drafts and service notices", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    { contactLanguage: null, expected: "es", ownerLanguage: "es" },
    { contactLanguage: "es", expected: "es", ownerLanguage: "en" },
    { contactLanguage: "en", expected: "en", ownerLanguage: "es" },
  ] as const)(
    "drafts rides in $expected for owner $ownerLanguage and contact $contactLanguage",
    async ({ contactLanguage, ownerLanguage, expected }) => {
      const backend = newBackend();

      const { owner, ownerId, contactId } = await ownerWithContact(
        backend,
        false
      );

      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: ownerLanguage,
      });
      await backend.run(
        async (ctx) =>
          await ctx.db.patch(contactId, { language: contactLanguage })
      );

      const appointmentId = await owner.mutation(api.appointments.create, {
        location: "Clínica Central",
        notes: null,
        startsAt: Date.now() + 2 * DAY,
        title: "Dr. Patel",
      });

      const body = await backend.run(async (ctx) => {
        const profile = await ctx.db.get(ownerId);
        const contact = await ctx.db.get(contactId);
        const appointment = await ctx.db.get(appointmentId);

        if (profile === null || contact === null || appointment === null) {
          throw new Error("Missing ride fixture");
        }

        return await rideRequestBody(ctx, profile, contact, appointment);
      });

      expect(body).toContain(
        expected === "es"
          ? "Hola, Sam. ¿Me podrías llevar"
          : "Hi Sam, could you give me a ride"
      );
      expect(body).toContain("Dr. Patel");
      expect(body).toContain("Clínica Central");
      expect(body).toContain(
        expected === "es" ? "¡Gracias! Ruth" : "Thank you! Ruth"
      );
    }
  );

  it.each(["en", "es"] as const)(
    "drafts scam verification in %s without leaking the owner's differently worded warnings",
    async (language: InterfaceLocale) => {
      const backend = newBackend();
      const { owner, contactId } = await ownerWithContact(backend, false);

      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: language === "es" ? "en" : "es",
      });
      await backend.run(
        async (ctx) => await ctx.db.patch(contactId, { language })
      );

      const reviewId = await owner.mutation(api.scam.submit, {
        emailId: null,
        screenshotId: null,
        text: "URGENT send gift cards and verification code",
      });

      await backend.run(
        async (ctx) =>
          await ctx.db.patch(reviewId, {
            signals: [
              {
                detail: "Private explanation",
                label: "Privater Warnhinweis",
                quote: null,
                stance: "requests",
              },
            ],
          })
      );

      const taskId = await owner.mutation(api.scam.askTrustedContact, {
        contactId,
        reviewId,
      });

      const { current } = await onlyAction(owner, taskId);

      expect(current.details.kind).toBe("send_message");

      if (current.details.kind !== "send_message") {
        throw new Error("Expected a verification message");
      }

      expect(current.details.body).toContain(
        language === "es"
          ? "¿Me ayudas a revisar si es real"
          : "Could you help me check whether it's real"
      );
      expect(current.details.body).not.toContain("Privater Warnhinweis");
      expect(current.details.body).not.toContain("Private explanation");
      expect(current.details.body).not.toContain("verification code");
    }
  );

  it("renders Spanish service notices and leaves names unchanged", () => {
    const notices = noticesFor("es");

    expect(notices.telegramConnected(["Ruth", "María"])).toContain(
      "Ruth y María"
    );
    expect(notices.telegramConnected([])).toContain("su familiar");
    expect(notices.telegramAlreadyConnected).toContain(
      "Su conexión ya está lista"
    );
    expect(notices.telegramExpired).toContain("Este enlace venció");
    expect(notices.telegramStartHelp("Sam", "sam_a")).toContain("@sam_a");
  });

  it("writes deterministic briefings in Spanish while preserving appointment words", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });
    await owner.mutation(api.appointments.create, {
      location: null,
      notes: null,
      startsAt: Date.now() + DAY,
      title: "Dr. Patel",
    });
    await backend.action(internal.briefings.generate, {
      dateKey: "2026-10-24",
      ownerId,
    });

    const briefing = await backend.run(
      async (ctx) => await ctx.db.query("briefings").first()
    );

    expect(briefing?.greetingFact).toContain("Dr. Patel es el");
    expect(briefing?.lines).toContain(
      "Aún no tienes transporte para esa cita."
    );
    expect(briefing?.source).toBe("rules");
  });
});

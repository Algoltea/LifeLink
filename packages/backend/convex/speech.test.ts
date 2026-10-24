import { SPEECH_VOICES } from "@lifelink/contracts/speech";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./profiles.ts": () => import("./profiles"),
  "./speechlimits.ts": () => import("./speechlimits"),
  "./voice.ts": () => import("./voice"),
};

const newBackend = () => convexTest(schema, modules);

type Backend = ReturnType<typeof newBackend>;

const fetchMock = vi.fn<typeof fetch>();
const NOW = Date.parse("2026-10-24T12:00:00Z");
const AUDIO = new Uint8Array([73, 68, 51]);

const speechResponse = (): Promise<Response> =>
  Promise.resolve(
    new Response(AUDIO, { headers: { "Content-Type": "audio/mpeg" } })
  );

const createPerson = async (
  backend: Backend,
  role: "family" | "owner" = "owner",
  subject = "person-1"
) => {
  const person = backend.withIdentity({ subject });

  const id = await person.mutation(api.profiles.completeOnboarding, {
    city: null,
    displayName: "Ruth Alvarez",
    postalCode: null,
    preferredName: "Ruth",
    role,
    signOffName: null,
    startInDemoMode: false,
    timeZone: "America/New_York",
  });

  return { id, person };
};

const speechUsage = async (backend: Backend, profileId: Id<"profiles">) =>
  await backend.run(
    async (ctx) =>
      await ctx.db
        .query("speechUsage")
        .withIndex("by_profile", (index) => index.eq("profileId", profileId))
        .unique()
  );

describe("speech", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(NOW);
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-api-key");
    vi.stubEnv("OPENROUTER_TTS_MODEL", "");
    vi.stubEnv("OPENROUTER_TTS_VOICE", "sarah");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockImplementation(speechResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  describe("account speech preferences", () => {
    it.each(["owner", "family"] as const)(
      "saves and resets the %s's own voice without changing another account",
      async (role) => {
        const backend = newBackend();
        const { person } = await createPerson(backend, role);

        const other = await createPerson(backend, "owner", "person-2");

        const initial = await person.query(api.profiles.me, {});
        expect(initial?.preferences?.speechVoice).toBeNull();

        await person.mutation(api.profiles.updatePreferences, {
          speechVoice: "george",
        });
        await person.mutation(api.profiles.updatePreferences, {
          captions: false,
        });

        const saved = await person.query(api.profiles.me, {});
        expect(saved?.preferences).toMatchObject({
          captions: false,
          speechVoice: "george",
        });
        const otherAccount = await other.person.query(api.profiles.me, {});
        expect(otherAccount?.preferences?.speechVoice).toBeNull();

        await person.mutation(api.profiles.updatePreferences, {
          speechVoice: null,
        });

        const reset = await person.query(api.profiles.me, {});
        expect(reset?.preferences?.speechVoice).toBeNull();
      }
    );

    it("keeps legacy preferences valid until a voice is chosen", async () => {
      const backend = newBackend();
      const { person } = await createPerson(backend);
      const me = await person.query(api.profiles.me, {});
      const preferencesId = me?.preferences?._id;

      if (preferencesId === undefined) {
        throw new Error("Expected onboarding preferences.");
      }

      await backend.run(async (ctx) => {
        await ctx.db.patch(preferencesId, { speechVoice: undefined });
      });
      await person.mutation(api.profiles.updatePreferences, {
        captions: false,
      });

      const legacy = await person.query(api.profiles.me, {});
      expect(legacy?.preferences?.speechVoice).toBeUndefined();

      await person.mutation(api.profiles.updatePreferences, {
        speechVoice: "lily",
      });

      const saved = await person.query(api.profiles.me, {});
      expect(saved?.preferences?.speechVoice).toBe("lily");
    });

    it.each(["unknown", "Sarah", " sarah"])(
      "rejects the unsupported saved voice %s without replacing the choice",
      async (voice) => {
        const backend = newBackend();
        const { person } = await createPerson(backend);
        await person.mutation(api.profiles.updatePreferences, {
          speechVoice: "river",
        });

        await expect(
          person.mutation(api.profiles.updatePreferences, {
            // @ts-expect-error Exercise untyped callers at the public validation boundary.
            speechVoice: voice,
          })
        ).rejects.toThrow("Validator error");

        const saved = await person.query(api.profiles.me, {});
        expect(saved?.preferences?.speechVoice).toBe("river");
      }
    );

    it("requires sign-in before saving a voice", async () => {
      await expect(
        newBackend().mutation(api.profiles.updatePreferences, {
          speechVoice: "will",
        })
      ).rejects.toMatchObject({ data: { code: "not_signed_in" } });
    });
  });

  describe("read-aloud voice selection", () => {
    it.each(SPEECH_VOICES)(
      "forwards $label to OpenRouter",
      async ({ value }) => {
        const backend = newBackend();
        const { person } = await createPerson(backend);

        const audio = await person.action(api.voice.synthesizeSpeech, {
          text: "  Hello Ruth.  ",
          voice: value,
        });

        expect(audio).toStrictEqual({
          audio: AUDIO.buffer,
          contentType: "audio/mpeg",
          model: "elevenlabs/eleven-v4-turbo",
        });
        expect(fetchMock).toHaveBeenCalledOnce();
        const [url, options] = fetchMock.mock.calls[0] ?? [];
        expect(url).toBe("https://openrouter.ai/api/v1/audio/speech");
        expect(JSON.parse(String(options?.body))).toStrictEqual({
          input: "Hello Ruth.",
          model: "elevenlabs/eleven-v4-turbo",
          response_format: "mp3",
          voice: value,
        });
      }
    );

    it.each([
      { configured: undefined, expected: "sarah" },
      { configured: "", expected: "sarah" },
      { configured: "george", expected: "george" },
    ])(
      "uses $expected when the request omits voice and env is $configured",
      async ({ configured, expected }) => {
        const backend = newBackend();
        const { person } = await createPerson(backend);
        vi.stubEnv("OPENROUTER_TTS_VOICE", configured);

        await person.action(api.voice.synthesizeSpeech, {
          text: "Hello Ruth.",
        });

        expect(
          JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
        ).toMatchObject({
          voice: expected,
        });
      }
    );

    it("uses a valid explicit voice even when the deployment default is invalid", async () => {
      const backend = newBackend();
      const { id, person } = await createPerson(backend);
      vi.stubEnv("OPENROUTER_TTS_VOICE", "unsupported-default");

      await person.action(api.voice.synthesizeSpeech, {
        text: "Hello",
        voice: "alice",
      });

      expect(
        JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
      ).toMatchObject({
        voice: "alice",
      });
      await expect(speechUsage(backend, id)).resolves.toMatchObject({
        dayCharacters: 5,
        minuteRequests: 1,
      });
    });

    it.each(["unknown", "Sarah", " sarah"])(
      "rejects the explicit voice %s before reserving quota or fetching audio",
      async (voice) => {
        const backend = newBackend();
        const { id, person } = await createPerson(backend);

        await expect(
          person.action(api.voice.synthesizeSpeech, {
            text: "Hello",
            // @ts-expect-error Exercise untyped callers at the public validation boundary.
            voice,
          })
        ).rejects.toThrow("Validator error");

        await expect(speechUsage(backend, id)).resolves.toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
      }
    );

    it.each([
      { name: "OPENROUTER_API_KEY", value: "" },
      { name: "OPENROUTER_TTS_MODEL", value: "unknown-model" },
      { name: "OPENROUTER_TTS_VOICE", value: "unknown-voice" },
    ])("validates $name before reserving quota", async ({ name, value }) => {
      const backend = newBackend();
      const { id, person } = await createPerson(backend);
      vi.stubEnv(name, value);

      await expect(
        person.action(api.voice.synthesizeSpeech, {
          text: "Hello",
        })
      ).rejects.toMatchObject({ data: { code: "speech_unavailable" } });

      await expect(speechUsage(backend, id)).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("read-aloud authorization and quotas", () => {
    it("rejects anonymous and un-onboarded callers before contacting OpenRouter", async () => {
      const backend = newBackend();

      await expect(
        backend.action(api.voice.synthesizeSpeech, {
          text: "Hello",
          voice: "will",
        })
      ).rejects.toMatchObject({ data: { code: "not_signed_in" } });
      await expect(
        backend
          .withIdentity({ subject: "no-profile" })
          .action(api.voice.synthesizeSpeech, {
            text: "Hello",
            voice: "will",
          })
      ).rejects.toMatchObject({ data: { code: "not_signed_in" } });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("allows a family member to read their supplied text", async () => {
      const backend = newBackend();
      const { id, person } = await createPerson(backend, "family");

      await person.action(api.voice.synthesizeSpeech, {
        text: "Hello",
        voice: "bella",
      });

      expect(fetchMock).toHaveBeenCalledOnce();
      await expect(speechUsage(backend, id)).resolves.toMatchObject({
        dayCharacters: 5,
        minuteRequests: 1,
      });
    });

    it.each([" ", "a".repeat(601)])(
      "rejects invalid text before reserving quota",
      async (text) => {
        const backend = newBackend();
        const { id, person } = await createPerson(backend);

        await expect(
          person.action(api.voice.synthesizeSpeech, {
            text,
            voice: "will",
          })
        ).rejects.toMatchObject({ data: { code: "speech_text_invalid" } });

        await expect(speechUsage(backend, id)).resolves.toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
      }
    );

    it("shares the ten-per-minute quota across voices and allows the next minute", async () => {
      const backend = newBackend();
      const { id, person } = await createPerson(backend);

      for (const { value } of SPEECH_VOICES.slice(0, 10)) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- reserve ten chunks in a known order.
        await person.action(api.voice.synthesizeSpeech, {
          text: "Hello",
          voice: value,
        });
      }

      await expect(
        person.action(api.voice.synthesizeSpeech, {
          text: "Hello",
          voice: "will",
        })
      ).rejects.toMatchObject({ data: { code: "speech_limit" } });
      expect(fetchMock).toHaveBeenCalledTimes(10);
      await expect(speechUsage(backend, id)).resolves.toMatchObject({
        dayCharacters: 50,
        minuteRequests: 10,
      });

      vi.spyOn(Date, "now").mockReturnValue(NOW + 60_000);
      await person.action(api.voice.synthesizeSpeech, {
        text: "Hello",
        voice: "will",
      });
      expect(fetchMock).toHaveBeenCalledTimes(11);
      await expect(speechUsage(backend, id)).resolves.toMatchObject({
        dayCharacters: 55,
        minuteRequests: 1,
      });
    });

    it("keeps the daily character limit when a different voice is selected", async () => {
      const backend = newBackend();
      const { id, person } = await createPerson(backend);
      await backend.run(async (ctx) => {
        await ctx.db.insert("speechUsage", {
          dayCharacters: 100_000,
          dayStartedAt: NOW,
          minuteRequests: 1,
          minuteStartedAt: NOW - 60_000,
          profileId: id,
        });
      });

      await expect(
        person.action(api.voice.synthesizeSpeech, {
          text: "Hello",
          voice: "will",
        })
      ).rejects.toMatchObject({ data: { code: "speech_limit" } });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});

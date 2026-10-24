import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./demo.ts": () => import("./demo"),
  "./profiles.ts": () => import("./profiles"),
  "./voice.ts": () => import("./voice"),
};

const newBackend = () => convexTest(schema, modules);

const signUp = async (
  backend: ReturnType<typeof newBackend>,
  signup: {
    demo: boolean;
    name: string;
    role: "family" | "owner";
    subject: string;
  }
) => {
  const person = backend.withIdentity({ subject: signup.subject });

  await person.mutation(api.profiles.completeOnboarding, {
    city: null,
    displayName: signup.name,
    postalCode: null,
    preferredName: signup.name.split(" ")[0] ?? signup.name,
    role: signup.role,
    signOffName: null,
    startInDemoMode: signup.demo,
    timeZone: "America/New_York",
  });

  return { person };
};

const fetchMock = vi.fn<typeof fetch>();
const NOW = Date.parse("2026-10-24T12:00:00Z");

describe("voice session authorization", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(NOW);
    vi.stubEnv("DEMO_MODE_ALLOWED", "true");
    vi.stubEnv("GEMINI_API_KEY", "test-only-api-key");
    vi.stubEnv("GEMINI_LIVE_MODEL", "test-live-model");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("rejects anonymous and un-onboarded callers before contacting Gemini", async () => {
    const backend = newBackend();

    await expect(
      backend.action(api.voice.createCallScreeningSession, {})
    ).rejects.toMatchObject({ data: { code: "not_signed_in" } });
    await expect(
      backend
        .withIdentity({ subject: "no-profile" })
        .action(api.voice.createCallScreeningSession, {})
    ).rejects.toMatchObject({ data: { code: "not_signed_in" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not let family members mint a screening token", async () => {
    const backend = newBackend();

    const { person } = await signUp(backend, {
      demo: false,
      name: "Linda Alvarez",
      role: "family",
      subject: "family-1",
    });

    await expect(
      person.action(api.voice.createCallScreeningSession, {})
    ).rejects.toMatchObject({ data: { code: "owner_only" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses Practice mode even with a configured provider", async () => {
    const backend = newBackend();

    const { person } = await signUp(backend, {
      demo: true,
      name: "Ruth Alvarez",
      role: "owner",
      subject: "owner-1",
    });

    await expect(
      person.action(api.voice.createCallScreeningSession, {})
    ).rejects.toMatchObject({ data: { code: "practice_mode" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("checks the caller's own Practice mode rather than another owner's profile", async () => {
    const backend = newBackend();
    await signUp(backend, {
      demo: false,
      name: "Live Owner",
      role: "owner",
      subject: "live-owner",
    });

    const { person } = await signUp(backend, {
      demo: true,
      name: "Practice Owner",
      role: "owner",
      subject: "practice-owner",
    });

    await expect(
      person.action(api.voice.createCallScreeningSession, {})
    ).rejects.toMatchObject({ data: { code: "practice_mode" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { endpoint: api.voice.createCallScreeningSession, purpose: "screening" },
    { endpoint: api.voice.createLiveSession, purpose: "conversation" },
  ])("reports missing configuration for $purpose", async ({ endpoint }) => {
    const backend = newBackend();

    const { person } = await signUp(backend, {
      demo: false,
      name: "Ruth Alvarez",
      role: "owner",
      subject: "owner-1",
    });

    vi.stubEnv("GEMINI_API_KEY", "");

    await expect(person.action(endpoint, {})).rejects.toMatchObject({
      data: { code: "voice_unavailable" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns only the short-lived token for an owner outside Practice mode", async () => {
    const backend = newBackend();

    const { person } = await signUp(backend, {
      demo: false,
      name: "Ruth Alvarez",
      role: "owner",
      subject: "owner-1",
    });

    fetchMock.mockResolvedValueOnce(
      Response.json({ name: "auth_tokens/screening-token" })
    );

    await expect(
      person.action(api.voice.createCallScreeningSession, {})
    ).resolves.toStrictEqual({
      expiresAt: NOW + 30 * 60_000,
      model: "test-live-model",
      token: "auth_tokens/screening-token",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0] ?? [];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      bidiGenerateContentSetup: {
        inputAudioTranscription: {},
        proactivity: { proactiveAudio: true },
        tools: [],
      },
      uses: 1,
    });
    expect(String(options?.body)).not.toContain("submit_request");
  });

  it("surfaces provider refusal instead of returning a screening session", async () => {
    const backend = newBackend();

    const { person } = await signUp(backend, {
      demo: false,
      name: "Ruth Alvarez",
      role: "owner",
      subject: "owner-1",
    });

    fetchMock.mockResolvedValueOnce(
      new Response("Invalid payload", { status: 400 })
    );

    await expect(
      person.action(api.voice.createCallScreeningSession, {})
    ).rejects.toMatchObject({
      data: {
        code: "voice_unavailable",
        message: "The service refused the request (400): Invalid payload",
      },
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([false, true])(
    "keeps existing conversation sessions compatible with Practice mode %s",
    async (demo) => {
      const backend = newBackend();

      const { person } = await signUp(backend, {
        demo,
        name: "Ruth Alvarez",
        role: "owner",
        subject: "owner-1",
      });

      fetchMock.mockResolvedValueOnce(
        Response.json({ name: "auth_tokens/conversation-token" })
      );

      await expect(
        person.action(api.voice.createLiveSession, {})
      ).resolves.toStrictEqual({
        expiresAt: NOW + 30 * 60_000,
        model: "test-live-model",
        token: "auth_tokens/conversation-token",
      });
      expect(fetchMock).toHaveBeenCalledOnce();
      const [, options] = fetchMock.mock.calls[0] ?? [];
      expect(JSON.parse(String(options?.body))).toMatchObject({
        bidiGenerateContentSetup: {
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          sessionResumption: {},
          systemInstruction: {
            parts: [{ text: expect.stringContaining("assistant for Ruth") }],
          },
          tools: [
            {
              functionDeclarations: [
                { name: "submit_request", parameters: expect.any(Object) },
              ],
            },
          ],
        },
      });
      expect(String(options?.body)).not.toContain("proactivity");
    }
  );
});

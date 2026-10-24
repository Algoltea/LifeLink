import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLiveToken } from "./live";

const fetchMock = vi.fn<typeof fetch>();
const NOW = Date.parse("2026-10-24T12:00:00Z");

describe("Gemini Live token", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(NOW);
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

  it("uses the REST setup fields and locks the one-use token to the server's setup", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ name: "auth_tokens/test-token" })
    );

    await expect(createLiveToken("Ruth")).resolves.toStrictEqual({
      expiresAt: NOW + 30 * 60_000,
      model: "test-live-model",
      ok: true,
      token: "auth_tokens/test-token",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/auth_tokens"
    );
    expect(options).toMatchObject({
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": "test-only-api-key",
      },
      method: "POST",
    });

    // With no fieldMask, the REST API takes the entire setup from this token;
    // clients cannot replace the instructions or add tools at connection time.
    expect(JSON.parse(String(options?.body))).toStrictEqual({
      bidiGenerateContentSetup: {
        generationConfig: { responseModalities: ["AUDIO"] },
        inputAudioTranscription: {},
        model: "models/test-live-model",
        outputAudioTranscription: {},
        sessionResumption: {},
        systemInstruction: {
          parts: [
            {
              text: expect.stringContaining(
                "You are a calm, warm voice assistant for Ruth"
              ),
            },
          ],
        },
        tools: [
          {
            functionDeclarations: [
              {
                description: expect.any(String),
                name: "submit_request",
                parameters: {
                  properties: {
                    request: {
                      description: expect.any(String),
                      type: "STRING",
                    },
                  },
                  required: ["request"],
                  type: "OBJECT",
                },
              },
            ],
          },
        ],
      },
      expireTime: "2026-10-24T12:30:00.000Z",
      newSessionExpireTime: "2026-10-24T12:01:00.000Z",
      uses: 1,
    });
  });

  it("does not contact Google when the API key is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    await expect(createLiveToken("Ruth")).resolves.toMatchObject({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a provider rejection without claiming a session was created", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("Invalid payload", { status: 400 })
    );

    await expect(createLiveToken("Ruth")).resolves.toStrictEqual({
      error: "The service refused the request (400): Invalid payload",
      ok: false,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

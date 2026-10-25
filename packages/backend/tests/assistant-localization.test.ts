import { register } from "@convex-dev/agent/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { newBackend, ownerWithContact } from "./harness";
import type { Backend, Person } from "./harness";

const submit = async (backend: Backend, owner: Person, text: string) => {
  const threadId = await owner.mutation(api.assistant.submitRequest, {
    channel: "text",
    text,
  });

  await backend.finishAllScheduledFunctions(vi.runAllTimers);

  return await owner.query(api.assistant.listThreadMessages, {
    paginationOpts: { cursor: null, numItems: 30 },
    threadId,
  });
};

describe("assistant language and deterministic fallbacks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("OPENROUTER_API_KEY", "");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    { expected: "Puede escribir a su familia desde Mensajes.", language: "es" },
    { expected: "The assistant is not set up yet", language: "en" },
    { expected: "The assistant is not set up yet", language: "fr" },
  ])(
    "uses the $language fixed fallback without cloud support",
    async ({ language, expected }) => {
      const backend = newBackend();
      register(backend);
      const { owner } = await ownerWithContact(backend, false);
      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: language,
      });

      const transcript = await submit(backend, owner, "¿Cómo estás?");

      expect(
        transcript.page.find((message) => message.role === "assistant")?.text
      ).toContain(expected);
      expect(
        transcript.page.find((message) => message.role === "user")?.text
      ).toBe("¿Cómo estás?");
    }
  );

  it("discloses English-only practice requests in the selected language and retains earlier turns", async () => {
    const backend = newBackend();
    register(backend);
    const { owner, ownerId } = await ownerWithContact(backend, false);
    await backend.run(
      async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
    );

    const first = await submit(backend, owner, "Hello");

    const firstReply = first.page.find(
      (message) => message.role === "assistant"
    );

    expect(firstReply?.text).toContain("requests in English");

    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });
    const second = await submit(backend, owner, "¿Puedes ayudarme?");

    const replies = second.page.filter(
      (message) => message.role === "assistant"
    );

    expect(replies.map((message) => message.text)).toContain(firstReply?.text);
    expect(
      replies.some(
        (message) =>
          message.text.includes("peticiones en inglés") &&
          message.text.includes("Puede escribir sus propios mensajes")
      )
    ).toBeTruthy();
    await expect(
      backend.run(async (ctx) => await ctx.db.query("actions").collect())
    ).resolves.toStrictEqual([]);
  });

  it.each(["HTTP 400", "HTTP 200 SSE"])(
    "keeps %s provider error text intact inside a Spanish failure response",
    async (transport) => {
      vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
      const fetchMock = vi.fn<typeof fetch>();

      const detail =
        transport === "HTTP 400"
          ? "Original provider detail"
          : "Original streamed provider detail";

      const error = { code: 429, message: detail };
      fetchMock.mockResolvedValue(
        transport === "HTTP 400"
          ? Response.json({ error }, { status: 400 })
          : new Response(
              `data: ${JSON.stringify({ error })}\n\ndata: [DONE]\n\n`,
              {
                headers: { "Content-Type": "text/event-stream" },
              }
            )
      );
      vi.stubGlobal("fetch", fetchMock);
      const backend = newBackend();
      register(backend);
      const { owner } = await ownerWithContact(backend, false);
      await owner.mutation(api.profiles.updatePreferences, {
        supportLanguage: "es",
      });

      const transcript = await submit(backend, owner, "Ayúdame");

      const reply = transcript.page.find(
        (message) =>
          message.role === "assistant" && message.text.includes(detail)
      );

      expect(reply?.text).toContain(
        "Revise la conversación por si se preparó algo y vuelva a intentarlo en un momento."
      );
      expect(reply?.text).toContain(detail);
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0]?.[1]?.body).toContain("Reply in Spanish");
    }
  );

  it("uses the current language when a proposal lacks required details", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });

    const result = await backend.mutation(
      internal.assistant.applyProposalForOwner,
      {
        channel: "text",
        model: "test",
        ownerId,
        proposalJson: "{}",
        request: "Ayúdame",
      }
    );

    expect(result).toStrictEqual({
      actionId: null,
      message:
        "Esa petición no incluía los detalles necesarios, así que no se preparó nada.",
      taskId: null,
    });
  });
});

// @vitest-environment happy-dom

import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { interfaceLocales } from "@lifelink/contracts/locale";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "@/components/app/preferences";
import { messagesFor, setLocale } from "@/i18n/locale";

import { ExplanationPanel } from "./explanation-panel";

// Better Auth captures fetch when its client is created, before any render.
const authFetch = vi.hoisted(() => {
  const date = "2026-10-25T12:00:00.000Z";
  const userId = "explanation-test-user";

  const session = {
    session: {
      createdAt: date,
      expiresAt: "2026-10-26T12:00:00.000Z",
      id: `${userId}-session`,
      token: "test-session",
      updatedAt: date,
      userId,
    },
    user: {
      createdAt: date,
      email: `${userId}@example.com`,
      emailVerified: true,
      id: userId,
      name: "Ana Example",
      updatedAt: date,
    },
  };

  const request = vi.fn<typeof fetch>().mockImplementation(() => {
    const response = Response.json(session);

    return Promise.resolve(response);
  });

  vi.stubGlobal("fetch", request);

  return request;
});

const fetchAccessToken = (): Promise<null> => Promise.resolve(null);

const useTestAuth = () => ({
  fetchAccessToken,
  isAuthenticated: true,
  isLoading: false,
});

const ORIGINAL = "Wait for an answer";
const REPLY = "Merci, Nguyễn. I'll call at 4:30.";

// SAFETY: this fixture ID is used only by the mocked query transport below.
const MESSAGE_ID = "message-test" as Id<"messages">;

const EXPLANATION = {
  dates: [{ isoDate: "2026-10-24", quote: "Saturday" }],
  droppedCount: 0,
  interpretations: [],
  localReason: "chosen",
  method: "local",
  missingDetails: [],
  mode: "simulated",
  plainSummary: ORIGINAL,
  requests: [{ quote: ORIGINAL, text: "They asked you to wait." }],
  statedFacts: [],
  status: "done",
  suggestedReplies: [{ draft: REPLY, kind: "clarify", label: "Thanks" }],
} satisfies Partial<Doc<"messageExplanations">>;

describe("explanation language integration", () => {
  let client: ConvexReactClient;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    authFetch.mockClear();
    vi.stubGlobal("fetch", authFetch);
    setLocale("en");
    client = new ConvexReactClient("http://127.0.0.1:3210");
    vi.spyOn(client, "setAuth").mockImplementation((_fetchToken, onChange) =>
      onChange?.(true)
    );
    vi.spyOn(client, "clearAuth").mockImplementation(() => {});
    vi.spyOn(client, "watchQuery").mockReturnValue({
      journal: () => {},
      localQueryResult: () => EXPLANATION,
      onUpdate: () => () => {},
    });
    vi.spyOn(client, "mutation").mockResolvedValue(null);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    act(() => root.unmount());
    await client.close();
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("asks for a cloud explanation as soon as it opens, without any consent step", async () => {
    const me = {
      preferences: null,
      profile: {
        _id: "explanation-test-profile",
        authUserId: "explanation-test-user",
        demoMode: true,
        presentationDemo: true,
      },
    };

    vi.spyOn(client, "watchQuery").mockImplementation((...args) => {
      const [query] = args;

      return {
        journal: () => {},
        localQueryResult: () =>
          getFunctionName(query) === "profiles:me" ? me : null,
        onUpdate: () => () => {},
      };
    });
    const request = vi.spyOn(client, "mutation").mockResolvedValue(null);

    await act(async () => {
      root.render(
        <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
          <PreferencesProvider>
            <ExplanationPanel
              onUseReply={vi.fn<(draft: string) => void>()}
              source={{ messageId: MESSAGE_ID }}
            />
          </PreferencesProvider>
        </ConvexProviderWithAuth>
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain(
      messagesFor("en").explanation.reading
    );
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    expect(
      request.mock.calls.map(([mutation, args]) => [
        getFunctionName(mutation),
        args,
      ])
    ).toStrictEqual([
      [
        "explanations:request",
        { allowCloudAnalysis: true, messageId: MESSAGE_ID },
      ],
    ]);
  });

  it.each([false, true])(
    "renders an older local Practice reading with account-specific copy (presentation=%s)",
    async (enabled) => {
      const me = {
        preferences: null,
        profile: {
          _id: "explanation-test-profile",
          authUserId: "explanation-test-user",
          demoMode: true,
          presentationDemo: enabled,
        },
      };

      const explanation = { ...EXPLANATION, localReason: "practice" };

      vi.spyOn(client, "watchQuery").mockImplementation((...args) => {
        const [query] = args;

        return {
          journal: () => {},
          localQueryResult: () =>
            getFunctionName(query) === "profiles:me" ? me : explanation,
          onUpdate: () => () => {},
        };
      });
      await act(async () => {
        root.render(
          <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
            <PreferencesProvider>
              <ExplanationPanel
                onUseReply={vi.fn<(draft: string) => void>()}
                source={{ messageId: MESSAGE_ID }}
              />
            </PreferencesProvider>
          </ConvexProviderWithAuth>
        );
        await Promise.resolve();
      });

      expect(container.textContent.includes("Practice")).toBe(!enabled);
      expect(container.querySelector('input[type="checkbox"]')).toBeNull();
      expect(container.textContent).toContain(ORIGINAL);
    }
  );

  it.each(interfaceLocales)(
    "localizes $id controls and spoken labels while preserving English local analysis and authored replies",
    async ({ id, intl }) => {
      const useReply = vi.fn<(draft: string) => void>();

      const synthesize = vi
        .spyOn(client, "action")
        .mockRejectedValue(new Error("Speech unavailable in test"));

      await act(async () => {
        root.render(
          <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
            <ExplanationPanel
              onUseReply={useReply}
              source={{ messageId: MESSAGE_ID }}
            />
          </ConvexProviderWithAuth>
        );
        await Promise.resolve();
      });

      const panel = container.querySelector("section");
      const quote = container.querySelector("blockquote");

      const reply = [...container.querySelectorAll("button")].find(
        (button) => button.textContent === EXPLANATION.suggestedReplies[0]?.label
      );

      if (reply === undefined) {
        throw new Error("Missing suggested reply control");
      }

      reply.focus();
      act(() => setLocale(id));
      const words = messagesFor(id).explanation;

      const summary = [...container.querySelectorAll("p")].find(
        (element) => element.textContent === ORIGINAL
      );

      expect({
        focus: document.activeElement === reply,
        localLanguage: summary?.lang,
        localNotice: container.textContent.includes(words.localLanguageNotice),
        method: container.textContent.includes(words.local.chosen),
        original: quote?.textContent,
        reply: reply.getAttribute("aria-label"),
        samePanel: container.querySelector("section") === panel,
        sameQuote: container.querySelector("blockquote") === quote,
        title: container.querySelector("section")?.getAttribute("aria-label"),
      }).toStrictEqual({
        focus: true,
        localLanguage: "en",
        localNotice: id !== "en",
        method: true,
        original: `“${ORIGINAL}”`,
        reply: words.replyLabelFor("Thanks"),
        samePanel: true,
        sameQuote: true,
        title: words.title,
      });
      expect(container.textContent).toContain(
        new Intl.DateTimeFormat(intl, {
          day: "numeric",
          month: "long",
          timeZone: "UTC",
          weekday: "long",
        }).format(new Date("2026-10-24T12:00:00Z"))
      );
      act(() => reply.click());
      expect(useReply).toHaveBeenCalledExactlyOnceWith(REPLY);

      const read = [...container.querySelectorAll("button")].find(
        (button) => button.textContent === messagesFor(id).common.readAloud
      );

      if (read === undefined) {
        throw new Error("Missing explanation read-aloud control");
      }

      await act(async () => {
        read.click();
        await Promise.resolve();
      });
      expect(
        synthesize.mock.calls[0]?.[1]?.text?.includes(words.localLanguageNotice)
      ).toBe(id !== "en");
      expect(synthesize.mock.calls[0]?.[1]?.text).toContain(ORIGINAL);
    }
  );
});

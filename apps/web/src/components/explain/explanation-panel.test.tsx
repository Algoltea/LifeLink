// @vitest-environment happy-dom

import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { interfaceLocales } from "@lifelink/contracts/locale";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { ExplanationPanel } from "./explanation-panel";

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
    setLocale("en");
    client = new ConvexReactClient("http://127.0.0.1:3210");
    vi.spyOn(client, "watchQuery").mockReturnValue({
      journal: () => {},
      localQueryResult: () => EXPLANATION,
      onUpdate: () => () => {},
    });
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

  it.each(interfaceLocales)(
    "localizes $id controls and spoken labels while preserving English local analysis and authored replies",
    async ({ id, intl }) => {
      const useReply = vi.fn<(draft: string) => void>();

      const synthesize = vi
        .spyOn(client, "action")
        .mockRejectedValue(new Error("Speech unavailable in test"));

      act(() => {
        root.render(
          <ConvexProvider client={client}>
            <ExplanationPanel
              onUseReply={useReply}
              source={{ messageId: MESSAGE_ID }}
            />
          </ConvexProvider>
        );
      });

      const panel = container.querySelector("section");
      const quote = container.querySelector("blockquote");

      const reply = [...container.querySelectorAll("button")].find(
        (button) =>
          button.textContent === messagesFor("en").explanation.useReply
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
        reply: container.textContent.includes(REPLY),
        samePanel: container.querySelector("section") === panel,
        sameQuote: container.querySelector("blockquote") === quote,
        title: container.querySelector("h2")?.textContent,
      }).toStrictEqual({
        focus: true,
        localLanguage: "en",
        localNotice: true,
        method: true,
        original: `“${ORIGINAL}”`,
        reply: true,
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
        (button) => button.textContent === words.readAloud
      );

      if (read === undefined) {
        throw new Error("Missing explanation read-aloud control");
      }

      await act(async () => {
        read.click();
        await Promise.resolve();
      });
      expect(synthesize.mock.calls[0]?.[1]?.text).toContain(
        words.localLanguageNotice
      );
      expect(synthesize.mock.calls[0]?.[1]?.text).toContain(ORIGINAL);
    }
  );
});

// @vitest-environment happy-dom

import { localInboxInsight } from "@lifelink/contracts/inbox";
import type { InboxChatSummary } from "@lifelink/contracts/inbox-chat";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

import { EmailSummaryCard } from "./email-summary-card";

const ORIGINAL_TEXT = "Wait for an answer";

const LOCAL_NOTE =
  "Showing the overview made in LifeLink. Nothing was sent to cloud AI.";

const localSummary = (savedSummary: string | null): InboxChatSummary => ({
  items: [
    {
      ...localInboxInsight({
        bodyText: ORIGINAL_TEXT,
        checked: false,
        fromAddress: "sam@example.com",
        fromName: "Sam",
        id: "email-test",
        subject: "A note",
        summary: savedSummary,
        suspicious: false,
      }),
      sender: "Sam",
      subject: "A note",
    },
  ],
  method: "local",
  note: LOCAL_NOTE,
  practice: false,
  summary: null,
});

describe("email summary content language", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it.each([null, ORIGINAL_TEXT])(
    "preserves original snippets and saved summaries through a language change: %s",
    (savedSummary) => {
      const summary = localSummary(savedSummary);
      act(() => root.render(<EmailSummaryCard summary={summary} />));

      expect(container.textContent).toContain(ORIGINAL_TEXT);
      act(() => setLocale("es"));

      expect({
        original: container.textContent.includes(ORIGINAL_TEXT),
        title: container.querySelector("h3")?.textContent,
        translatedOriginal: container.textContent.includes(
          "Esperar una respuesta"
        ),
      }).toStrictEqual({
        original: true,
        title: messagesFor("es").ask.emailSummary.title,
        translatedOriginal: false,
      });
      expect(container.textContent).toContain(
        "La revisión automática no ha terminado. Revise este mensaje antes de decidir."
      );
      expect(container.textContent).toContain(
        translateServerMessage(LOCAL_NOTE, "es")
      );

      act(() => setLocale("en"));

      expect({
        original: container.textContent.includes(ORIGINAL_TEXT),
        reason: container.textContent.includes(
          "The automatic check has not finished. Review this message before deciding."
        ),
      }).toStrictEqual({ original: true, reason: true });
    }
  );

  it("preserves authored cloud summaries and reasons", () => {
    const summary: InboxChatSummary = {
      ...localSummary(null),
      items: localSummary(null).items.map((item) => ({
        ...item,
        reason: ORIGINAL_TEXT,
      })),
      method: "cloud",
      summary: ORIGINAL_TEXT,
    };

    act(() => root.render(<EmailSummaryCard summary={summary} />));
    act(() => setLocale("es"));

    expect(
      [...container.querySelectorAll("p")].filter(
        (element) => element.textContent === ORIGINAL_TEXT
      )
    ).toHaveLength(3);
    expect(container.textContent).not.toContain("Esperar una respuesta");
  });
});

// @vitest-environment happy-dom

import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { act, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { MessageComposer } from "./message-composer";
import type { MessageDraft } from "./message-composer";

const ORIGINAL_TEXT = "Wait for an answer";

const unexpectedNavigation = (): never => {
  throw new Error("Changing language must not navigate away from the draft.");
};

const router: AppRouterInstance = {
  back: unexpectedNavigation,
  bfcacheId: "composer-test",
  forward: unexpectedNavigation,
  prefetch: unexpectedNavigation,
  push: unexpectedNavigation,
  refresh: unexpectedNavigation,
  replace: unexpectedNavigation,
};

const ComposerWithDraft = () => {
  const [draft, setDraft] = useState<MessageDraft>({
    body: ORIGINAL_TEXT,
    fromSuggestion: true,
    notice: "reply_added",
  });

  const input = useRef<HTMLTextAreaElement>(null);

  return (
    <MessageComposer
      canReach
      // SAFETY: fixed test identifier; no backend calls use it.
      contactId={"contact-test" as Id<"contacts">}
      draft={draft}
      firstName="Sam"
      inputRef={input}
      onDraftChange={setDraft}
      practice
    />
  );
};

describe("message draft language changes", () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: ConvexReactClient;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    // Convex connects lazily; this test never submits or uploads anything.
    client = new ConvexReactClient("https://composer-test.convex.cloud");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <ConvexProvider client={client}>
          <AppRouterContext value={router}>
            <ComposerWithDraft />
          </AppRouterContext>
        </ConvexProvider>
      )
    );
  });

  afterEach(async () => {
    act(() => root.unmount());
    container.remove();
    await client.close();
    setLocale("en");
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("translates a suggested-reply notice while preserving the unsent draft and focus", () => {
    const input = container.querySelector("textarea");
    const output = container.querySelector("output");

    if (!input) {
      throw new Error("Expected a message input.");
    }

    act(() => input.focus());
    input.setSelectionRange(5, 13);
    expect(output?.textContent).toBe(messagesFor("en").threads.replyAdded);

    act(() => setLocale("es"));

    expect({
      body: input.value,
      focused: document.activeElement === input,
      notice: output?.textContent,
      sameInput: container.querySelector("textarea") === input,
      sameOutput: container.querySelector("output") === output,
      selection: [input.selectionStart, input.selectionEnd],
    }).toStrictEqual({
      body: ORIGINAL_TEXT,
      focused: true,
      notice: messagesFor("es").threads.replyAdded,
      sameInput: true,
      sameOutput: true,
      selection: [5, 13],
    });

    act(() => setLocale("en"));

    expect({
      body: input.value,
      focused: document.activeElement === input,
      notice: output?.textContent,
      selection: [input.selectionStart, input.selectionEnd],
    }).toStrictEqual({
      body: ORIGINAL_TEXT,
      focused: true,
      notice: messagesFor("en").threads.replyAdded,
      selection: [5, 13],
    });
  });
});

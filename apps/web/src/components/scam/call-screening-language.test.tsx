// @vitest-environment happy-dom

import {
  CALL_WARNING_REASONS,
  callWarningKinds,
} from "@lifelink/contracts/call-screening";
import type { CallCaption, CallFlag } from "@lifelink/contracts/call-screening";
import { interfaceLocales } from "@lifelink/contracts/locale";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { act } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";
import { callScreening as en } from "@/i18n/messages/en/call-screening";
import { callScreening as es } from "@/i18n/messages/es/call-screening";

import {
  CallCaptions,
  CallPrivacy,
  callFlagReason,
} from "./call-screening-parts";
import { CallSummary, outcomeOf } from "./call-summary";
import { TrustedPeople } from "./trusted-people";

const ORIGINAL_WORDS = "Wait for an answer";

const caption: CallCaption = {
  final: true,
  id: "original-caption",
  speaker: "caller",
  text: ORIGINAL_WORDS,
  timeMs: 1000,
};

const flag: CallFlag = {
  captionId: caption.id,
  id: "original-warning",
  quote: ORIGINAL_WORDS,
  reason: CALL_WARNING_REASONS.gift_cards,
  timeMs: caption.timeMs,
};

const summary: ComponentProps<typeof CallSummary>["summary"] = {
  captions: [caption],
  checkIncomplete: true,
  durationMs: 10_000,
  flags: [flag],
  heardWords: 4,
  interrupted: true,
  practice: false,
  startedAt: Date.UTC(2026, 9, 24, 12),
};

describe("call-screening language integration", () => {
  let client: ConvexReactClient;
  let container: HTMLDivElement;
  let root: Root;

  const render = (children: ReactNode) => {
    act(() => {
      root.render(
        <ConvexProvider client={client}>
          <AppRouterContext
            value={{
              back: vi.fn<() => void>(),
              bfcacheId: "call-test",
              forward: vi.fn<() => void>(),
              prefetch: vi.fn<() => void>(),
              push: vi.fn<() => void>(),
              refresh: vi.fn<() => void>(),
              replace: vi.fn<() => void>(),
            }}
          >
            {children}
          </AppRouterContext>
        </ConvexProvider>
      );
    });
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    client = new ConvexReactClient("http://127.0.0.1:3210");
    // Only the transport is stubbed; the hooks and components remain real.
    vi.spyOn(client, "watchQuery").mockReturnValue({
      journal: () => {},
      localQueryResult: () => [],
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

  it.each(callWarningKinds)(
    "translates the %s category without changing its source",
    (kind) => {
      expect({
        english: callFlagReason(CALL_WARNING_REASONS[kind], en),
        spanish: callFlagReason(CALL_WARNING_REASONS[kind], es),
      }).toStrictEqual({
        english: CALL_WARNING_REASONS[kind],
        spanish: es.warningReasons[kind],
      });
    }
  );

  it("keeps older warning reasons and unknown text intact", () => {
    expect([
      callFlagReason(en.moneyReason, es),
      callFlagReason(en.secrecyReason, es),
      callFlagReason(ORIGINAL_WORDS, es),
    ]).toStrictEqual([es.moneyReason, es.secrecyReason, ORIGINAL_WORDS]);
  });

  it.each(interfaceLocales)(
    "updates $id captions and privacy labels without replacing captions, focus, or size choices",
    ({ id }) => {
      const words = messagesFor(id).callScreening;
      render(
        <>
          <CallCaptions captions={[caption]} flags={[flag]} practice={false} />
          <CallPrivacy />
        </>
      );

      const smaller = [...container.querySelectorAll("button")].find(
        (button) => button.textContent === en.smaller
      );

      if (smaller === undefined) {
        throw new Error("Missing smaller captions control");
      }

      act(() => smaller.click());
      smaller.focus();
      const log = container.querySelector('[role="log"]');
      act(() => setLocale(id));

      expect({
        focus: document.activeElement === smaller,
        log: container.querySelector('[role="log"]') === log,
        original: log?.textContent?.includes(ORIGINAL_WORDS),
        selected: smaller.getAttribute("aria-pressed"),
        translated: smaller.textContent,
      }).toStrictEqual({
        focus: true,
        log: true,
        original: true,
        selected: "true",
        translated: words.smaller,
      });
      expect(container.textContent).toContain(words.privacy);
      expect(container.textContent).toContain(words.languageLimit);
    }
  );

  it("keeps summary quotes and expanded captions while localizing warnings and read-aloud text", async () => {
    const synthesize = vi
      .spyOn(client, "action")
      .mockRejectedValue(new Error("Speech unavailable in test"));

    render(
      <CallSummary
        onBack={vi.fn<() => void>()}
        summary={summary}
        summaryId={null}
      />
    );
    const details = container.querySelector("details");

    if (details === null) {
      throw new Error("Missing in-memory captions");
    }

    details.open = true;
    act(() => setLocale("es"));

    const read = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === es.readResult
    );

    if (read === undefined) {
      throw new Error("Missing localized read-aloud control");
    }

    expect({
      expanded: container.querySelector("details") === details && details.open,
      quote: container.querySelector("blockquote")?.textContent,
      title: container.querySelector("h2")?.textContent,
      warning: container.querySelector("h4")?.textContent,
    }).toStrictEqual({
      expanded: true,
      quote: `“${ORIGINAL_WORDS}”`,
      title: es.summary,
      warning: es.warningReasons.gift_cards,
    });
    expect(container.textContent).toContain(es.partlyChecked);
    await act(async () => {
      read.click();
      await Promise.resolve();
    });
    expect(synthesize.mock.calls[0]?.[1]?.text).toBe(
      `${es.potentialScam} ${es.flaggedTitle(1)}. ${es.warningReasons.gift_cards} ${es.flaggedAdvice} ${es.interrupted} ${es.partlyChecked}`
    );
  });

  it.each([
    {
      checkIncomplete: false,
      expected: "silent",
      heardWords: 0,
      title: es.silentTitle,
    },
    {
      checkIncomplete: true,
      expected: "unchecked",
      heardWords: 8,
      title: es.uncheckedTitle,
    },
    {
      checkIncomplete: false,
      expected: "clear",
      heardWords: 8,
      title: es.clearTitle,
    },
    {
      checkIncomplete: false,
      expected: "clear",
      heardWords: undefined,
      title: es.clearTitle,
    },
  ] as const)(
    "preserves the $expected outcome in Spanish",
    ({ checkIncomplete, expected, heardWords, title }) => {
      const value = { ...summary, checkIncomplete, flags: [], heardWords };
      render(
        <CallSummary
          onBack={vi.fn<() => void>()}
          summary={value}
          summaryId={null}
        />
      );
      act(() => setLocale("es"));

      expect(outcomeOf(value)).toBe(expected);
      expect(container.querySelector("h3")?.textContent).toBe(title);
    }
  );

  it.each([
    { owner: "en", practice: true, recipient: "es" },
    { owner: "es", practice: true, recipient: "en" },
    { owner: "en", practice: false, recipient: "es" },
    { owner: "es", practice: false, recipient: "en" },
  ] as const)(
    "prepares the practice=$practice call template for $recipient with $owner screens",
    async ({ owner, recipient, practice }) => {
      vi.mocked(client.watchQuery).mockReturnValue({
        journal: () => {},
        localQueryResult: () => [
          {
            _id: "trusted-contact",
            channels: [
              { address: "sam@example.com", channel: "email", preferred: true },
            ],
            language: recipient,
            name: "Sam",
            sample: false,
            trusted: true,
          },
        ],
        onUpdate: () => () => {},
      });

      const draft = vi
        .spyOn(client, "mutation")
        .mockResolvedValue("draft-task");

      render(
        <CallSummary
          onBack={vi.fn<() => void>()}
          summary={{ ...summary, practice }}
          summaryId={null}
        />
      );
      act(() => setLocale(owner));

      const prepare = [...container.querySelectorAll("button")].find(
        (button) =>
          button.getAttribute("aria-label") ===
          messagesFor(owner).trustedPeople.prepareAria("Sam")
      );

      if (prepare === undefined) {
        throw new Error("Missing contact draft control");
      }

      await act(async () => {
        prepare.click();
        await Promise.resolve();
      });

      const recipientMessages = messagesFor(recipient);
      expect(draft.mock.calls.map(([, args]) => args)).toStrictEqual([
        {
          body: practice
            ? recipientMessages.callScreening.practiceHelp
            : recipientMessages.trustedPeople.callHelpMessage,
          contactId: "trusted-contact",
          photoIds: [],
        },
      ]);
    }
  );

  it.each([en.practiceHelp, ORIGINAL_WORDS])(
    "preserves an explicit body even when it matches a template: %s",
    async (message) => {
      vi.mocked(client.watchQuery).mockReturnValue({
        journal: () => {},
        localQueryResult: () => [
          {
            _id: "trusted-contact",
            channels: [
              { address: "sam@example.com", channel: "email", preferred: true },
            ],
            language: "es",
            name: "Sam",
            sample: false,
            trusted: true,
          },
        ],
        onUpdate: () => () => {},
      });

      const draft = vi
        .spyOn(client, "mutation")
        .mockResolvedValue("draft-task");

      render(<TrustedPeople message={message} practiceCall />);
      act(() => setLocale("es"));

      const prepare = [...container.querySelectorAll("button")].find(
        (button) =>
          button.getAttribute("aria-label") ===
          messagesFor("es").trustedPeople.prepareAria("Sam")
      );

      if (prepare === undefined) {
        throw new Error("Missing contact draft control");
      }

      await act(async () => {
        prepare.click();
        await Promise.resolve();
      });

      expect(draft.mock.calls.map(([, args]) => args)).toStrictEqual([
        {
          body: message,
          contactId: "trusted-contact",
          photoIds: [],
        },
      ]);
    }
  );
});

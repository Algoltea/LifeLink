// @vitest-environment happy-dom

import type { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import type { FunctionReturnType } from "convex/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "@/components/app/preferences";
import { messagesFor, setLocale } from "@/i18n/locale";

import { CallScreening } from "./call-screening";
import { CallSummary } from "./call-summary";
import { ScamScreen } from "./scam-screen";
import { TrustedPeople } from "./trusted-people";

const timestamp = Date.UTC(2026, 9, 25, 12);
const practiceLabel = /practice|sample|simulat|made-up|script/iu;

const meFor = (
  demoMode: boolean,
  presentationDemo?: boolean
): FunctionReturnType<typeof api.profiles.me> => ({
  demoModeAllowed: true,
  needsOnboarding: false,
  preferences: null,
  profile: {
    _creationTime: timestamp,
    // SAFETY: fixed fixture identifier; all Convex transport is stubbed.
    _id: "presentation-scam-test" as Id<"profiles">,
    assistantThreadId: null,
    authUserId: "presentation-scam-test",
    city: null,
    createdAt: timestamp,
    demoMode,
    displayName: "Elena Rivera",
    postalCode: null,
    preferredName: "Elena",
    presentationDemo,
    role: "owner",
    signOffName: null,
    timeZone: "America/New_York",
  },
});

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");

  const values = new Map<string, unknown>([
    ["profiles:me", meFor(true, true)],
    [
      "status:integrations",
      { integrations: [{ configured: true, id: "gemini_live" }] },
    ],
    [
      "contacts:list",
      [
        {
          _id: "trusted-person",
          channels: [
            { address: "+15555550101", channel: "imessage", preferred: true },
          ],
          name: "Sam",
          sample: false,
          trusted: true,
        },
      ],
    ],
    ["callscreening:list", []],
    ["scam:list", []],
    ["emails:list", []],
  ]);

  vi.spyOn(client, "watchQuery").mockImplementation((...args) => ({
    journal: () => {},
    localQueryLogs: () => [],
    localQueryResult: () => values.get(getFunctionName(args[0])),
    onUpdate: () => () => {},
  }));

  const action = vi
    .spyOn(client, "action")
    .mockRejectedValue(new Error("No live services in test"));

  const mutation = vi
    .spyOn(client, "mutation")
    .mockResolvedValue("saved-summary");

  return { action, client, mutation, values };
};

describe("presentation scam safety", () => {
  let backend: ReturnType<typeof createBackend>;
  let container: HTMLDivElement;
  let root: Root;
  let renderVersion = 0;

  const render = async (children: ReactNode) => {
    renderVersion += 1;
    await act(() =>
      root.render(
        <ConvexProvider client={backend.client} key={renderVersion}>
          <PreferencesProvider>
            <AppRouterContext
              value={{
                back: vi.fn<() => void>(),
                bfcacheId: "presentation-scam",
                forward: vi.fn<() => void>(),
                prefetch: vi.fn<() => void>(),
                push: vi.fn<() => void>(),
                refresh: vi.fn<() => void>(),
                replace: vi.fn<() => void>(),
              }}
            >
              {children}
            </AppRouterContext>
          </PreferencesProvider>
        </ConvexProvider>
      )
    );
  };

  const button = (text: string): HTMLButtonElement => {
    const match = [...container.querySelectorAll("button")].find(
      (item) => item.textContent === text
    );

    if (!match) {
      throw new Error(`Missing button: ${text}`);
    }

    return match;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    backend = createBackend();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(() => root.unmount());
    await backend.client.close();
    container.remove();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([true, false])(
    "blocks real calls for presentation with demoMode=%s",
    async (demoMode) => {
      backend.values.set("profiles:me", meFor(demoMode, true));
      await render(
        <>
          <CallScreening onActiveChange={vi.fn<() => void>()} />
          <TrustedPeople />
        </>
      );

      expect({
        callDisabled: button(messagesFor("en").trustedPeople.call).disabled,
        consent: container.querySelector('input[type="checkbox"]'),
        phoneLink: container.querySelector('a[href^="tel:"]'),
        startDisabled: button(messagesFor("en").callScreening.start).disabled,
      }).toStrictEqual({
        callDisabled: true,
        consent: null,
        phoneLink: null,
        startDisabled: true,
      });
      expect(container.textContent).toContain(
        "Live call checks are unavailable for this account."
      );
      expect(container.textContent).toContain(
        "Calls are unavailable for this account."
      );
      expect(container.textContent).not.toMatch(practiceLabel);
      expect([
        backend.action.mock.calls,
        backend.mutation.mock.calls,
      ]).toStrictEqual([[], []]);
    }
  );

  it("preserves ordinary practice labels and suppresses presentation sample pills", async () => {
    backend.values.set("profiles:me", meFor(true));
    backend.values.set("contacts:list", [
      {
        _id: "sample-person",
        channels: [
          { address: "sam@example.com", channel: "email", preferred: true },
        ],
        name: "Sam",
        sample: true,
        trusted: true,
      },
    ]);
    await render(
      <>
        <CallScreening onActiveChange={vi.fn<() => void>()} />
        <TrustedPeople />
      </>
    );
    expect(container.textContent).toContain(
      messagesFor("en").callScreening.practiceMode
    );
    expect(container.textContent).toContain(
      messagesFor("en").circle.practiceContact
    );
    expect(container.textContent).toContain(
      messagesFor("en").trustedPeople.callsPractice
    );

    backend.values.set("profiles:me", meFor(true, true));
    await render(<TrustedPeople />);
    expect(container.textContent).toContain("Sam");
    expect(container.textContent).not.toMatch(practiceLabel);
  });

  it("keeps a real contact callable on an ordinary live account", async () => {
    backend.values.set("profiles:me", meFor(false));
    await render(<TrustedPeople />);
    expect(
      container.querySelector('a[href="tel:+15555550101"]')
    ).not.toBeNull();
  });

  it.each([0, 4])(
    "removes presentation labels from full summaries and narration with %s words",
    async (heardWords) => {
      await render(
        <CallSummary
          onBack={vi.fn<() => void>()}
          summaryId={null}
          summary={{
            captions: [
              {
                final: true,
                id: "caption",
                speaker: "caller",
                text: "Wait for an answer",
                timeMs: 1000,
              },
            ],
            durationMs: 4000,
            flags: [],
            heardWords,
            interrupted: false,
            practice: true,
            startedAt: timestamp,
          }}
        />
      );
      expect(container.textContent).not.toMatch(practiceLabel);
      expect(container.textContent).not.toContain(
        messagesFor("en").callScreening.liveCall
      );
      expect(container.textContent).toContain("Wait for an answer");
      await act(async () => {
        button(messagesFor("en").callScreening.readResult).click();
        await Promise.resolve();
      });
      const [narration] = backend.action.mock.calls;
      expect(
        narration
          ? {
              name: getFunctionName(narration[0]),
              text: narration[1]?.text,
            }
          : null
      ).toStrictEqual({
        name: "voice:synthesizeSpeech",
        text: expect.any(String),
      });
      expect(narration?.[1]?.text).not.toMatch(practiceLabel);
    }
  );

  it("keeps photo checks unavailable and local-check guidance accurate", async () => {
    await render(<ScamScreen emailId={null} />);
    expect(container.textContent).not.toMatch(practiceLabel);
    expect(container.textContent).toContain(
      messagesFor("en").scam.photo.unavailable
    );
    expect(container.textContent).toContain(
      messagesFor("en").scamResult.method.rules
    );
    expect(
      button(messagesFor("en").scam.submit.screenshot).disabled
    ).toBeTruthy();
    expect([
      backend.action.mock.calls,
      backend.mutation.mock.calls,
    ]).toStrictEqual([[], []]);
  });
});

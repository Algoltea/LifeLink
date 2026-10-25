// @vitest-environment happy-dom

import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import type { InboxChatSummary } from "@lifelink/contracts/inbox-chat";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EmailSummaryCard } from "@/components/assistant/email-summary-card";
import { SettingsScreen } from "@/components/settings/settings-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { WeatherChip } from "@/components/today/weather";
import { messagesFor, setLocale } from "@/i18n/locale";
import type { WeatherState } from "@/lib/weather";

import { ModePill, SimulatedPill } from "./bits";
import { OfflineQueueProvider } from "./offline-queue";
import { PreferencesProvider } from "./preferences";
import type { Me } from "./preferences";
import { usePresentationDemo } from "./presentation-demo";
import { AppShell } from "./shell";

// Better Auth captures fetch when its client is created, before any render.
const authFetch = vi.hoisted(() => {
  const request = vi.fn<typeof fetch>().mockImplementation(() => {
    const response = Response.json(null);

    return Promise.resolve(response);
  });

  vi.stubGlobal("fetch", request);

  return request;
});

// SAFETY: identifiers are fixtures; only the stubbed Convex transport sees them.
const profileId = "presentation-owner" as Id<"profiles">;

// SAFETY: this fixed identifier is only returned by the stubbed transport.
const preferencesId = "presentation-preferences" as Id<"preferences">;
const timestamp = Date.UTC(2026, 9, 25, 12);

const storedPreferences: Doc<"preferences"> = {
  _creationTime: timestamp,
  _id: preferencesId,
  captions: true,
  contrast: "standard",
  groceryNotes: null,
  profileId,
  readAloud: false,
  reducedMotion: false,
  speechRate: 0.9,
  supportLanguage: "en",
  textScale: 1,
  theme: "light",
  updatedAt: timestamp,
};

const meFor = (presentationDemo?: boolean): Me => ({
  demoModeAllowed: true,
  needsOnboarding: false,
  preferences: storedPreferences,
  profile: {
    _creationTime: timestamp,
    _id: profileId,
    assistantThreadId: null,
    authUserId: "presentation-user",
    city: null,
    createdAt: timestamp,
    demoMode: true,
    displayName: "Ana Rivera",
    postalCode: null,
    preferredName: "Ana",
    presentationDemo,
    role: "owner",
    signOffName: null,
    timeZone: "America/New_York",
  },
});

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");
  let me: Me | null | undefined;
  const listeners = new Set<() => void>();

  vi.spyOn(client, "setAuth").mockImplementation((_fetchToken, onChange) => {
    onChange?.(true);
  });
  vi.spyOn(client, "clearAuth").mockImplementation(() => {});

  // Exercise the real context and subscriptions; replace only Convex transport.
  vi.spyOn(client, "watchQuery").mockImplementation(() => ({
    journal: () => {},
    localQueryLogs: () => [],
    localQueryResult: () => me,
    onUpdate: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  }));

  const mutate = vi.spyOn(client, "mutation").mockResolvedValue(null);

  return {
    client,
    mutate,
    receive: (next: Me | null | undefined) => {
      me = next;

      for (const listener of listeners) {
        listener();
      }
    },
  };
};

const fetchAccessToken = (): Promise<null> => Promise.resolve(null);

const useTestAuth = () => ({
  fetchAccessToken,
  isAuthenticated: true,
  isLoading: false,
});

const PresentationState = () => (
  <output data-presentation-state="">{String(usePresentationDemo())}</output>
);

const SUMMARY: InboxChatSummary = {
  items: [],
  method: "local",
  note: "Showing the overview made in LifeLink. Nothing was sent to cloud AI.",
  practice: true,
  summary: "Sam's piano practice starts at four.",
};

describe("account-scoped presentation", () => {
  let backend: ReturnType<typeof createBackend>;
  let container: HTMLDivElement;
  let root: Root;

  const render = async (children: ReactNode) => {
    await act(() =>
      root.render(
        <ConvexProviderWithAuth client={backend.client} useAuth={useTestAuth}>
          <ThemeProvider>
            <PreferencesProvider>
              <OfflineQueueProvider>
                <PathnameContext value="/settings">{children}</PathnameContext>
              </OfflineQueueProvider>
            </PreferencesProvider>
          </ThemeProvider>
        </ConvexProviderWithAuth>
      )
    );
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    authFetch.mockClear();
    vi.stubGlobal("fetch", authFetch);
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
    setLocale("en");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("defaults off and follows the current profile without persisting across accounts", async () => {
    await render(<PresentationState />);
    expect(container.querySelector("output")?.textContent).toBe("false");
    const { receive } = backend;

    for (const [me, expected] of [
      [meFor(true), "true"],
      [null, "false"],
      [meFor(), "false"],
      [meFor(false), "false"],
    ] as const) {
      act(() => receive(me));
      expect(container.querySelector("output")?.textContent).toBe(expected);
    }

    expect(backend.mutate).not.toHaveBeenCalled();
  });

  it("hides simulated pills only for the presentation account", async () => {
    backend.receive(meFor());
    await render(
      <>
        <SimulatedPill />
        <ModePill mode="simulated" />
        <ModePill mode="live" />
      </>
    );
    expect(container.querySelectorAll('[data-slot="pill"]')).toHaveLength(2);

    await act(() => backend.receive(meFor(true)));
    expect(container.querySelectorAll('[data-slot="pill"]')).toHaveLength(0);

    await act(() => backend.receive(meFor(false)));
    expect(container.querySelectorAll('[data-slot="pill"]')).toHaveLength(2);
    expect(backend.mutate).not.toHaveBeenCalled();
  });

  it("hides the banner, account mode entry, and settings toggle while retaining the account", async () => {
    backend.receive(meFor(true));
    await render(
      <AppShell>
        <SettingsScreen />
      </AppShell>
    );

    expect({
      accountVisible: container.textContent.includes("Ana Rivera"),
      modeSettings: container.querySelector("#demo"),
      practiceLabel: /practice/iu.test(container.textContent),
    }).toStrictEqual({
      accountVisible: true,
      modeSettings: null,
      practiceLabel: false,
    });

    const account = container.querySelector('aside [aria-haspopup="menu"]');

    if (!(account instanceof HTMLButtonElement)) {
      throw new Error("Missing account menu trigger");
    }

    await act(() => account.click());
    expect(document.querySelector('[role="menu"]')?.textContent).toContain(
      messagesFor("en").shell.signOut
    );
    expect(document.querySelector('a[href="/settings#demo"]')).toBeNull();
    expect(backend.mutate).not.toHaveBeenCalled();
  });

  it.each([undefined, false])(
    "retains the ordinary practice banner and working mode toggle with presentationDemo=%s",
    async (presentation) => {
      backend.receive(meFor(presentation));
      await render(
        <AppShell>
          <SettingsScreen />
        </AppShell>
      );

      expect(container.textContent).toContain(
        messagesFor("en").shell.practiceBannerOn
      );
      const toggle = container.querySelector('#demo [role="switch"]');

      if (!(toggle instanceof HTMLElement)) {
        throw new Error("Missing practice mode switch");
      }

      expect(toggle.getAttribute("aria-checked")).toBe("true");
      await act(() => toggle.click());
      expect(backend.mutate.mock.calls.map(([, args]) => args)).toStrictEqual([
        { enabled: false },
      ]);
    }
  );

  it("omits the assistant overview prefix without altering authored content or provenance", async () => {
    backend.receive(meFor(true));
    await render(<EmailSummaryCard summary={SUMMARY} />);

    expect(container.textContent).not.toContain("Practice ·");
    expect({
      authoredContent: container.textContent.includes(SUMMARY.summary ?? ""),
      provenance: container.textContent.includes(SUMMARY.note),
      storedPractice: SUMMARY.practice,
    }).toStrictEqual({
      authoredContent: true,
      provenance: true,
      storedPractice: true,
    });

    await act(() => backend.receive(meFor()));
    expect(container.textContent).toContain("Practice ·");
    expect(backend.mutate).not.toHaveBeenCalled();
  });

  it("shows local review provenance for a saved practice overview without rewriting it", async () => {
    const summary = {
      ...SUMMARY,
      note: "Practice emails are reviewed in LifeLink and are never sent to cloud AI.",
    };

    backend.receive(meFor(true));
    await render(<EmailSummaryCard summary={summary} />);

    expect(container.textContent).toContain(SUMMARY.note);
    expect(container.textContent).not.toContain(summary.note);
    expect(summary.note).toBe(
      "Practice emails are reviewed in LifeLink and are never sent to cloud AI."
    );

    await act(() => backend.receive(meFor()));
    expect(container.textContent).toContain(summary.note);
  });

  it("keeps the Today forecast while suppressing only its presentation label", async () => {
    const state: WeatherState = {
      fetchedAt: null,
      forecast: {
        current: { code: 0, isDay: true, temperatureC: 15 },
        days: [
          {
            code: 0,
            date: "2026-10-25",
            highC: 18,
            lowC: 10,
            precipitationChance: 0,
          },
        ],
        place: "Riverdale",
      },
      status: "practice",
    };

    backend.receive(meFor());
    await render(<WeatherChip state={state} unit="celsius" />);
    const trigger = container.querySelector("button");

    if (!(trigger instanceof HTMLButtonElement)) {
      throw new Error("Missing forecast trigger");
    }

    await act(() => trigger.click());
    expect(document.body.textContent).toContain(
      messagesFor("en").weather.practiceSample
    );

    await act(() => backend.receive(meFor(true)));
    expect(document.body.textContent).not.toContain(
      messagesFor("en").weather.practiceSample
    );
    expect(document.body.textContent).toContain("Riverdale");
    expect(state.status).toBe("practice");
    expect(backend.mutate).not.toHaveBeenCalled();
  });
});

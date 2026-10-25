// @vitest-environment happy-dom

import { interfaceLocales } from "@lifelink/contracts/locale";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PreferencesProvider,
  useLanguagePreference,
} from "@/components/app/preferences";
import { ThemeProvider } from "@/components/theme-provider";
import { currentMessages, setLocale } from "@/i18n/locale";
import { LocaleBoundary } from "@/i18n/locale-boundary";
import { authClient } from "@/lib/auth-client";

import { SettingsScreen } from "./settings-screen";

// Better Auth captures fetch when the client module is initialized.
const authFetch = vi.hoisted(() => {
  const request = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", request);

  return request;
});

const initialMe = {
  demoModeAllowed: false,
  preferences: {
    captions: true,
    contrast: "standard",
    readAloud: false,
    reducedMotion: false,
    speechRate: 0.9,
    supportLanguage: "en",
    textScale: 1,
    theme: "light",
  },
  profile: {
    _id: "ana-profile",
    authUserId: "ana",
    city: null,
    demoMode: true,
    displayName: "Ana Example",
    postalCode: null,
    preferredName: "Ana",
    role: "owner",
    signOffName: null,
    timeZone: "America/New_York",
  },
};

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");
  let me = initialMe;
  const listeners = new Set<() => void>();

  vi.spyOn(client, "setAuth").mockImplementation((_fetchToken, onChange) => {
    onChange?.(true);
  });
  vi.spyOn(client, "clearAuth").mockImplementation(() => {});

  // Keep the real Convex hooks and providers; only replace the transport boundary.
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
  const update = vi.spyOn(client, "mutation").mockResolvedValue(null);

  return {
    client,
    receivePreferences: (preferences: typeof initialMe.preferences) => {
      me = { ...me, preferences };

      for (const listener of listeners) {
        listener();
      }
    },
    update,
  };
};

const fetchAccessToken = (): Promise<null> => Promise.resolve(null);

const useTestAuth = () => ({
  fetchAccessToken,
  isAuthenticated: true,
  isLoading: false,
});

const OtherLanguageControl = () => {
  const { changeLanguage } = useLanguagePreference();

  return createElement(
    "button",
    { onClick: () => changeLanguage("fr"), type: "button" },
    "Choose French outside Settings"
  );
};

describe("changing the screen language", () => {
  let container: HTMLDivElement;
  let root: Root;
  let backend: ReturnType<typeof createBackend>;

  const required = <Element extends HTMLElement>(selector: string): Element => {
    const element = container.querySelector<Element>(selector);

    if (element === null) {
      throw new Error(`Missing test element: ${selector}`);
    }

    return element;
  };

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const date = new Date("2026-10-25T12:00:00Z");

    const session: ReturnType<typeof authClient.useSession> = {
      data: {
        session: {
          createdAt: date,
          expiresAt: date,
          id: "ana-session",
          token: "test-session",
          updatedAt: date,
          userId: "ana",
        },
        user: {
          createdAt: date,
          email: "ana@example.com",
          emailVerified: true,
          id: "ana",
          name: "Ana",
          updatedAt: date,
        },
      },
      error: null,
      isPending: false,
      isRefetching: false,
      refetch: async () => {},
    };

    authFetch.mockImplementation(() => {
      const response = Response.json(session.data);

      return Promise.resolve(response);
    });
    authClient.$store.atoms.session?.set(session);
    setLocale("en");
    backend = createBackend();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(() => {
      root.render(
        createElement(
          ConvexProviderWithAuth,
          { client: backend.client, useAuth: useTestAuth },
          createElement(
            ThemeProvider,
            null,
            createElement(
              PreferencesProvider,
              null,
              createElement(
                LocaleBoundary,
                null,
                createElement(SettingsScreen),
                createElement(OtherLanguageControl)
              )
            )
          )
        )
      );
    });
  });

  afterEach(async () => {
    await act(() => root.unmount());
    await backend.client.close();
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each(interfaceLocales.filter(({ id }) => id !== "en"))(
    "switches to $id without replacing unsaved fields or moving focus",
    async ({ id }) => {
      const name = required<HTMLInputElement>('input[name="name"]');
      name.value = "Unsaved name";
      name.focus();

      await act(() => setLocale(id));

      expect(required("h1").textContent).toBe(currentMessages().settings.title);
      expect(required('input[name="name"]')).toBe(name);
      expect(name.value).toBe("Unsaved name");
      expect(document.activeElement).toBe(name);
      expect(backend.update).not.toHaveBeenCalled();
    }
  );

  it("retains a rejected language save and retries the same selection", async () => {
    const pending = Promise.withResolvers<null>();
    backend.update.mockReturnValueOnce(pending.promise);

    const language = required<HTMLSelectElement>(
      'select[aria-label="Language"]'
    );

    const name = required<HTMLInputElement>('input[name="name"]');

    name.value = "Still unsaved";
    name.focus();

    await act(() => {
      language.value = "es";
      language.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect({
      pending: language.closest("fieldset")?.disabled,
      value: language.value,
    }).toStrictEqual({ pending: true, value: "es" });

    await act(async () => {
      pending.reject(new Error("Connection lost"));
      await pending.promise.catch(() => null);
    });

    expect(required('[role="alert"]').textContent).toBe(
      currentMessages().settings.choicesNotSaved(
        currentMessages().common.genericError
      )
    );
    expect({
      connected: name.isConnected,
      focused: document.activeElement === name,
      language: language.value,
      pending: language.closest("fieldset")?.disabled,
      value: name.value,
    }).toStrictEqual({
      connected: true,
      focused: true,
      language: "es",
      pending: false,
      value: "Still unsaved",
    });

    const retry = [...container.querySelectorAll("button")].find(
      (button) =>
        button.textContent === currentMessages().settings.trySavingAgain
    );

    if (retry === undefined) {
      throw new Error("Missing retry control after failed language save");
    }

    backend.update.mockResolvedValueOnce(null);
    await act(async () => {
      retry.click();
      await Promise.resolve();
    });

    expect(backend.update.mock.calls.map(([, patch]) => patch)).toStrictEqual([
      { supportLanguage: "es" },
      { supportLanguage: "es" },
    ]);
    expect({
      failure: container.querySelector('[role="alert"]'),
      locale: language.value,
      pending: language.closest("fieldset")?.disabled,
    }).toStrictEqual({ failure: null, locale: "es", pending: false });
  });

  it("never resaves a Settings language draft after another control changes language", async () => {
    const name = required<HTMLInputElement>('input[name="name"]');
    name.value = "Still editing";
    name.focus();

    const language = required<HTMLSelectElement>(
      'select[aria-label="Language"]'
    );

    await act(() => {
      language.value = "es";
      language.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(() =>
      backend.receivePreferences({
        ...initialMe.preferences,
        supportLanguage: "es",
      })
    );

    const external = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Choose French outside Settings"
    );

    if (external === undefined) {
      throw new Error("Missing other language control");
    }

    await act(() => external.click());
    await act(() =>
      backend.receivePreferences({
        ...initialMe.preferences,
        supportLanguage: "fr",
      })
    );

    expect(document.activeElement).toBe(name);

    const textSize = [
      ...container.querySelectorAll<HTMLElement>('[role="radio"]'),
    ].find(
      (button) =>
        button.textContent === currentMessages().settings.textSizeLarge
    );

    if (textSize === undefined) {
      throw new Error("Missing text size control");
    }

    await act(() => textSize.click());

    expect(backend.update.mock.calls.map(([, patch]) => patch)).toStrictEqual([
      { supportLanguage: "es" },
      { supportLanguage: "fr" },
      { textScale: 1.15 },
    ]);
    expect({
      document: document.documentElement.lang,
      selection: language.value,
    }).toStrictEqual({ document: "fr", selection: "fr" });
    expect(required('input[name="name"]')).toBe(name);
    expect(name.value).toBe("Still editing");
  });

  it("does not overwrite a local language choice when unrelated preferences update", async () => {
    await act(() => setLocale("es"));
    await act(() =>
      backend.receivePreferences({ ...initialMe.preferences, speechRate: 1.1 })
    );

    expect(required("h1").textContent).toBe(currentMessages().settings.title);
    expect(document.documentElement.lang).toBe("es");
  });
});

// @vitest-environment happy-dom

import { interfaceLocales } from "@lifelink/contracts/locale";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "@/components/app/preferences";
import { ThemeProvider } from "@/components/theme-provider";
import { currentMessages, setLocale } from "@/i18n/locale";
import { LocaleBoundary } from "@/i18n/locale-boundary";

import { SettingsScreen } from "./settings-screen";

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
  const update = vi.spyOn(client, "mutation");

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
    setLocale("en");
    backend = createBackend();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(() => {
      root.render(
        createElement(
          ConvexProvider,
          { client: backend.client },
          createElement(
            ThemeProvider,
            null,
            createElement(
              PreferencesProvider,
              null,
              createElement(LocaleBoundary, null, createElement(SettingsScreen))
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
      currentMessages().settings.choicesNotSaved("Connection lost")
    );
    expect({
      connected: name.isConnected,
      language: language.value,
      pending: language.closest("fieldset")?.disabled,
      value: name.value,
    }).toStrictEqual({
      connected: true,
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
      saved: container.textContent.includes(currentMessages().settings.saved),
    }).toStrictEqual({ failure: null, saved: true });
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

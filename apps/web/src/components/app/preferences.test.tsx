// @vitest-environment happy-dom

import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import { LOCALE_STORAGE_KEY } from "@/i18n/boot";
import { getLocale, setLocale, useLocale } from "@/i18n/locale";
import { authClient } from "@/lib/auth-client";

import { PreferencesProvider, useLanguagePreference } from "./preferences";
import type { Me } from "./preferences";

// Better Auth captures fetch when the client module is initialized.
const authFetch = vi.hoisted(() => {
  const request = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", request);

  return request;
});

const timestamp = Date.UTC(2026, 9, 25, 12);

const meFor = (userId = "ana", supportLanguage = "en"): Me => {
  // SAFETY: these identifiers only pass through the stubbed Convex transport.
  const profileId = `${userId}-profile` as Id<"profiles">;
  // SAFETY: this identifier only passes through the stubbed Convex transport.
  const preferencesId = `${userId}-preferences` as Id<"preferences">;

  return {
    demoModeAllowed: false,
    needsOnboarding: false,
    preferences: {
      _creationTime: timestamp,
      _id: preferencesId,
      captions: true,
      contrast: "standard",
      groceryNotes: null,
      profileId,
      readAloud: false,
      reducedMotion: false,
      speechRate: 0.9,
      supportLanguage,
      textScale: 1,
      theme: "light",
      updatedAt: timestamp,
    },
    profile: {
      _creationTime: timestamp,
      _id: profileId,
      assistantThreadId: null,
      authUserId: userId,
      city: null,
      createdAt: timestamp,
      demoMode: false,
      displayName: userId,
      postalCode: null,
      preferredName: userId,
      role: "owner",
      signOffName: null,
      timeZone: "America/New_York",
    },
  };
};

const sessionFor = (
  userId: string | null
): ReturnType<typeof authClient.useSession> => ({
  data:
    userId === null
      ? null
      : {
          session: {
            createdAt: new Date(timestamp),
            expiresAt: new Date(timestamp + 86_400_000),
            id: `${userId}-session`,
            token: "test-session",
            updatedAt: new Date(timestamp),
            userId,
          },
          user: {
            createdAt: new Date(timestamp),
            email: `${userId}@example.com`,
            emailVerified: true,
            id: userId,
            name: userId,
            updatedAt: new Date(timestamp),
          },
        },
  error: null,
  isPending: false,
  isRefetching: false,
  refetch: async () => {},
});

const fetchAccessToken = (): Promise<null> => Promise.resolve(null);

const useTestAuth = () => ({
  fetchAccessToken,
  isAuthenticated: true,
  isLoading: false,
});

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");
  let me: Me | null | undefined = meFor();
  const listeners = new Set<() => void>();
  let authenticate: ((authenticated: boolean) => void) | undefined;

  // Exercise the actual auth/query contexts and replace only their transport.
  vi.spyOn(client, "setAuth").mockImplementation((_fetchToken, onChange) => {
    authenticate = onChange;
  });
  vi.spyOn(client, "clearAuth").mockImplementation(() => {});
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
    authenticate: (authenticated: boolean) => authenticate?.(authenticated),
    client,
    receive: (next: Me | null | undefined) => {
      me = next;

      for (const listener of listeners) {
        listener();
      }
    },
    update,
  };
};

const LanguageControls = ({ id }: { id: string }) => {
  const language = useLanguagePreference();
  const locale = useLocale();

  return (
    <section id={id}>
      <output data-error={language.error} data-pending={language.pending}>
        {locale}
      </output>
      <button onClick={() => language.changeLanguage("es")} type="button">
        Spanish
      </button>
      <button onClick={() => language.changeLanguage("fr")} type="button">
        French
      </button>
      <button onClick={() => language.retry()} type="button">
        Retry
      </button>
    </section>
  );
};

describe("shared language preferences", () => {
  let root: Root;
  let container: HTMLDivElement;
  let backend: ReturnType<typeof createBackend>;
  let session: ReturnType<typeof authClient.useSession>;

  const render = async (withProvider = true) => {
    await act(() => {
      authClient.$store.atoms.session?.set(session);
      root.render(
        withProvider ? (
          <ConvexProviderWithAuth client={backend.client} useAuth={useTestAuth}>
            <ThemeProvider>
              <PreferencesProvider>
                <LanguageControls id="settings" />
                <LanguageControls id="sidebar" />
              </PreferencesProvider>
            </ThemeProvider>
          </ConvexProviderWithAuth>
        ) : (
          <LanguageControls id="guest" />
        )
      );
    });
  };

  const click = async (label: string, id = "settings") => {
    const button = [...container.querySelectorAll(`#${id} button`)].find(
      (element) => element.textContent === label
    );

    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Missing ${id} ${label} control`);
    }

    await act(() => button.click());
  };

  const states = () =>
    [...container.querySelectorAll("output")].map((output) => ({
      error: output.dataset.error,
      locale: output.textContent,
      pending: output.dataset.pending,
    }));

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    backend = createBackend();
    session = sessionFor("ana");
    authFetch.mockResolvedValue(Response.json(session.data));
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
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

  it("changes language locally without any provider", async () => {
    await render(false);
    await click("Spanish", "guest");
    await click("Retry", "guest");

    expect(states()).toStrictEqual([
      { error: "false", locale: "es", pending: "false" },
    ]);
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("es");
    expect(backend.update).not.toHaveBeenCalled();
  });

  it("keeps guest choices local even with a stale profile", async () => {
    session = sessionFor(null);
    await render();
    await act(() => backend.authenticate(false));
    await click("Spanish");
    await click("Retry", "sidebar");

    expect(getLocale()).toBe("es");
    expect(states()).toStrictEqual([
      { error: "false", locale: "es", pending: "false" },
      { error: "false", locale: "es", pending: "false" },
    ]);
    expect(backend.update).not.toHaveBeenCalled();
  });

  it("updates immediately and shares account persistence across both controls", async () => {
    const pending = Promise.withResolvers<null>();
    backend.update.mockReturnValueOnce(pending.promise);
    await render();
    await act(() => backend.authenticate(true));
    await click("Spanish");

    expect({
      controls: states(),
      local: localStorage.getItem(LOCALE_STORAGE_KEY),
    }).toStrictEqual({
      controls: [
        { error: "false", locale: "es", pending: "true" },
        { error: "false", locale: "es", pending: "true" },
      ],
      local: "es",
    });
    expect(
      backend.update.mock.calls.map(([reference, patch]) => ({
        mutation: getFunctionName(reference),
        patch,
      }))
    ).toStrictEqual([
      {
        mutation: "profiles:updatePreferences",
        patch: { supportLanguage: "es" },
      },
    ]);

    await act(() => pending.resolve(null));
    // A mutation acknowledgement can arrive before its query update.
    expect(getLocale()).toBe("es");
    await act(() => backend.receive(meFor("ana", "es")));
    expect(states()).toStrictEqual([
      { error: "false", locale: "es", pending: "false" },
      { error: "false", locale: "es", pending: "false" },
    ]);
    await act(() => backend.receive(meFor("ana", "de")));
    expect(getLocale()).toBe("de");
  });

  it("does not upload a local choice when a session becomes Convex-ready", async () => {
    backend.receive(meFor("ana", "de"));
    await render();
    await click("Spanish");
    expect(getLocale()).toBe("es");
    expect(backend.update).not.toHaveBeenCalled();

    await act(() => backend.authenticate(true));
    expect(getLocale()).toBe("de");
    expect(backend.update).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    null,
    {
      demoModeAllowed: false,
      needsOnboarding: true,
      preferences: null,
      profile: null,
    },
  ])(
    "waits for a delayed profile without queueing a device choice (%j)",
    async (me) => {
      backend.receive(me);
      await render();
      await act(() => backend.authenticate(true));
      await click("Spanish");
      expect(getLocale()).toBe("es");
      expect(backend.update).not.toHaveBeenCalled();

      await act(() => backend.receive(meFor("ana", "fr")));
      expect(getLocale()).toBe("fr");
      expect(backend.update).not.toHaveBeenCalled();
      await click("Spanish");
      expect(backend.update.mock.calls.map(([, patch]) => patch)).toStrictEqual(
        [{ supportLanguage: "es" }]
      );
    }
  );

  it("retains a failed choice through unrelated updates and retries from another control", async () => {
    backend.update.mockRejectedValueOnce(new Error("Connection lost"));
    await render();
    await act(() => backend.authenticate(true));
    await click("Spanish");
    const changed = meFor();

    if (changed.preferences) {
      changed.preferences.textScale = 1.3;
    }

    await act(() => backend.receive(changed));
    expect(states()).toStrictEqual([
      { error: "true", locale: "es", pending: "false" },
      { error: "true", locale: "es", pending: "false" },
    ]);

    const retrying = Promise.withResolvers<null>();
    backend.update.mockReturnValueOnce(retrying.promise);
    await click("Retry", "sidebar");
    expect(states()).toStrictEqual([
      { error: "false", locale: "es", pending: "true" },
      { error: "false", locale: "es", pending: "true" },
    ]);
    await act(() => retrying.resolve(null));
    expect(backend.update.mock.calls.map(([, patch]) => patch)).toStrictEqual([
      { supportLanguage: "es" },
      { supportLanguage: "es" },
    ]);
    expect(states()).toStrictEqual([
      { error: "false", locale: "es", pending: "false" },
      { error: "false", locale: "es", pending: "false" },
    ]);
  });

  it.each(["success", "failure"])(
    "ignores a stale %s after an account change",
    async (outcome) => {
      const pending = Promise.withResolvers<null>();
      backend.update.mockReturnValueOnce(pending.promise);
      await render();
      await act(() => backend.authenticate(true));
      await click("Spanish");

      session = sessionFor("bea");
      await render();
      await click("French", "sidebar");
      // The new session must not write while the old profile remains cached.
      expect(backend.update).toHaveBeenCalledOnce();
      await act(() => backend.receive(meFor("bea", "de")));
      await act(() => {
        if (outcome === "failure") {
          pending.reject(new Error("Old account failed"));
        } else {
          pending.resolve(null);
        }
      });
      await click("Retry", "sidebar");
      expect(states()).toStrictEqual([
        { error: "false", locale: "de", pending: "false" },
        { error: "false", locale: "de", pending: "false" },
      ]);
      expect(backend.update).toHaveBeenCalledOnce();
    }
  );

  it("does not retry a previous account's failed choice", async () => {
    backend.update.mockRejectedValueOnce(new Error("Connection lost"));
    await render();
    await act(() => backend.authenticate(true));
    await click("Spanish");
    expect(states()[0]?.error).toBe("true");

    session = sessionFor("bea");
    await act(() => backend.receive(meFor("bea", "de")));
    await render();
    await click("Retry");
    expect(getLocale()).toBe("de");
    expect(backend.update).toHaveBeenCalledOnce();
    await click("French", "sidebar");
    expect(backend.update.mock.calls.map(([, patch]) => patch)).toStrictEqual([
      { supportLanguage: "es" },
      { supportLanguage: "fr" },
    ]);
  });

  it("does not reuse an attempt after signing out and back into the same account", async () => {
    const previous = Promise.withResolvers<null>();
    backend.update.mockReturnValueOnce(previous.promise);
    await render();
    await act(() => backend.authenticate(true));
    await click("Spanish");

    session = sessionFor(null);
    await render();
    await click("French", "sidebar");
    session = sessionFor("ana");
    await render();
    await act(() => previous.reject(new Error("Previous session failed")));
    await click("Retry");

    expect(states()).toStrictEqual([
      { error: "false", locale: "en", pending: "false" },
      { error: "false", locale: "en", pending: "false" },
    ]);
    expect(backend.update).toHaveBeenCalledOnce();
  });

  it("waits for the session itself to finish loading", async () => {
    session = { ...sessionFor("ana"), isPending: true };
    await render();
    await act(() => backend.authenticate(true));
    await click("Spanish");
    expect(backend.update).not.toHaveBeenCalled();

    session = sessionFor("ana");
    await render();
    expect(getLocale()).toBe("en");
    expect(backend.update).not.toHaveBeenCalled();
  });

  it("confirms a saved language when its query arrives before the mutation result", async () => {
    const pending = Promise.withResolvers<null>();
    backend.update.mockReturnValueOnce(pending.promise);
    await render();
    await act(() => backend.authenticate(true));
    await click("Spanish");
    await act(() => backend.receive(meFor("ana", "es")));
    expect(states()).toStrictEqual([
      { error: "false", locale: "es", pending: "true" },
      { error: "false", locale: "es", pending: "true" },
    ]);

    await act(() => pending.resolve(null));
    expect(states()).toStrictEqual([
      { error: "false", locale: "es", pending: "false" },
      { error: "false", locale: "es", pending: "false" },
    ]);
    await act(() => backend.receive(meFor("ana", "fr")));
    expect(getLocale()).toBe("fr");
  });

  it("keeps the latest choice when an older save finishes late", async () => {
    const older = Promise.withResolvers<null>();
    const newer = Promise.withResolvers<null>();
    backend.update
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise);
    await render();
    await act(() => backend.authenticate(true));
    await click("Spanish");
    await click("French", "sidebar");
    await act(() => backend.receive(meFor("ana", "es")));
    await act(() => newer.resolve(null));
    await act(() => older.reject(new Error("Old request failed")));

    expect(states()).toStrictEqual([
      { error: "false", locale: "fr", pending: "false" },
      { error: "false", locale: "fr", pending: "false" },
    ]);
    await act(() => backend.receive(meFor("ana", "fr")));
    expect(getLocale()).toBe("fr");
  });
});

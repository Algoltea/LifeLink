import { runInNewContext } from "node:vm";

import { afterEach, describe, expect, it, vi } from "vitest";

import { LOCALE_BOOT_SCRIPT } from "./boot";

describe("initial screen language", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it.each([
    { browser: "es-MX", expected: "es", saved: null },
    { browser: "en-US", expected: "es", saved: "es" },
    { browser: "es-ES", expected: "en", saved: "en" },
    { browser: "fr-FR", expected: "en", saved: null },
    { browser: "es-US", expected: "es", saved: "" },
  ])(
    "agrees before and after hydration: %o",
    async ({ browser, expected, saved }) => {
      const storage = { getItem: () => saved };
      const navigator = { language: browser };
      const document = { documentElement: { lang: "en" } };
      vi.stubGlobal("window", {});
      vi.stubGlobal("localStorage", storage);
      vi.stubGlobal("navigator", navigator);
      vi.resetModules();

      runInNewContext(LOCALE_BOOT_SCRIPT, {
        document,
        localStorage: storage,
        navigator,
      });
      const { getLocale } = await import("./locale");

      expect(document.documentElement.lang).toBe(expected);
      expect(getLocale()).toBe(expected);
    }
  );

  it("uses the browser language when storage access is denied", async () => {
    const storage = {
      getItem: () => {
        throw new Error("Storage denied");
      },
    };

    const navigator = { language: "es-AR" };
    const document = { documentElement: { lang: "en" } };
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("navigator", navigator);
    vi.resetModules();

    runInNewContext(LOCALE_BOOT_SCRIPT, {
      document,
      localStorage: storage,
      navigator,
    });
    const { getLocale } = await import("./locale");

    expect(document.documentElement.lang).toBe("es");
    expect(getLocale()).toBe("es");
  });
});

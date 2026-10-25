import { runInNewContext } from "node:vm";

import { interfaceLocales } from "@lifelink/contracts/locale";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LOCALE_BOOT_SCRIPT } from "./boot";

const INITIAL_LOCALES = [
  ...interfaceLocales.map(({ id, intl }) => ({
    browser: intl,
    expected: id,
    saved: null,
  })),
  ...interfaceLocales.map(({ id }) => ({
    browser: "ja-JP",
    expected: id,
    saved: id,
  })),
  { browser: "es-MX", expected: "es", saved: null },
  { browser: "es-ES", expected: "en", saved: "en" },
  { browser: "fr-FR", expected: "fr", saved: "" },
  { browser: "fr-FR", expected: "en", saved: "unsupported" },
  { browser: "fr-FR", expected: "en", saved: " " },
  { browser: "en-US", expected: "vi", saved: " VI-vn " },
  { browser: "fil", expected: "tl", saved: null },
  { browser: "tl-PH", expected: "tl", saved: null },
  { browser: " ZH-hans ", expected: "zh", saved: null },
  { browser: "zh-Hans-CN", expected: "zh", saved: null },
  ...[
    "zh-Hans-TW",
    "zh-Hans-HK",
    "zh-Hans-MO",
    "zh-cmn-Hans-TW",
    "zh-CN-x-hant",
    "zh-CN-x-tw",
    "zh-x-hant",
    "zh-x-hk",
  ].flatMap((tag) => [
    { browser: tag, expected: "zh", saved: null },
    { browser: "en-US", expected: "zh", saved: tag },
  ]),
  { browser: "zh-SG", expected: "zh", saved: null },
  ...[
    "zh-Hant",
    "zh-TW",
    "zh-HK",
    "zh-MO",
    "zh-Hant-CN",
    "zh-cmn-Hant-CN",
    "zh-Hant-x-hans",
    "zh-Latn",
    "zh-TW-u-nu-hanidec",
    "ja-JP",
    "ar",
    "unknown",
    "",
  ].flatMap((tag) => [
    { browser: tag, expected: "en", saved: null },
    { browser: "zh-CN", expected: "en", saved: tag || "unknown" },
  ]),
];

describe("initial screen language", () => {
  beforeAll(async () => {
    // Compile the real catalogs before individual test timers start. Resetting
    // modules still reruns locale initialization against each case's globals.
    await import("./locale");
    vi.resetModules();
  }, 30_000);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it.each(INITIAL_LOCALES)(
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

  it.each(INITIAL_LOCALES.filter(({ saved }) => saved === null))(
    "uses browser $browser when storage access is denied",
    async ({ browser, expected }) => {
      const storage = {
        getItem: () => {
          throw new Error("Storage denied");
        },
      };

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
});

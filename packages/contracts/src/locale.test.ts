import { describe, expect, it } from "vitest";

import { supportLanguages } from "./help-style";
import {
  interfaceLocaleOf,
  interfaceLocales,
  intlLocaleOf,
  isInterfaceLocale,
} from "./locale";

const LOCALES = [
  ["en", "en-US"],
  ["es", "es-US"],
  ["fr", "fr-FR"],
  ["de", "de-DE"],
  ["it", "it-IT"],
  ["pt", "pt-BR"],
  ["zh", "zh-CN"],
  ["vi", "vi-VN"],
  ["ko", "ko-KR"],
  ["tl", "fil-PH"],
] as const;

describe("fixed-word locales", () => {
  it("supports exactly the ten cloud help languages", () => {
    expect(interfaceLocales.map(({ id }) => id)).toStrictEqual(
      LOCALES.map(([id]) => id)
    );
    expect(interfaceLocales.map(({ id }) => id)).toStrictEqual(
      supportLanguages.map(({ id }) => id)
    );
    expect(interfaceLocales.find(({ id }) => id === "zh")?.label).toBe(
      "中文（简体）"
    );
  });

  it.each(LOCALES)("preserves %s and resolves its Intl tag %s", (id, tag) => {
    expect(interfaceLocaleOf(id)).toBe(id);
    expect(interfaceLocaleOf(` ${tag.toUpperCase()} `)).toBe(id);
    expect(intlLocaleOf(id)).toBe(tag);
    expect(isInterfaceLocale(id)).toBeTruthy();
    expect(isInterfaceLocale(tag)).toBeFalsy();
  });

  it.each([
    ["es-MX", "es"],
    ["fr-CA", "fr"],
    ["pt-PT", "pt"],
    ["zh-Hans", "zh"],
    ["zh-Hans-CN", "zh"],
    ["zh-Hans-TW", "zh"],
    ["zh-Hans-HK", "zh"],
    ["zh-Hans-MO", "zh"],
    ["zh-cmn-Hans-TW", "zh"],
    ["zh-SG", "zh"],
    ["zh-CN-u-nu-hanidec", "zh"],
    ["zh-CN-x-hant", "zh"],
    ["zh-CN-x-tw", "zh"],
    ["zh-x-hant", "zh"],
    ["zh-x-hk", "zh"],
    ["tl-PH", "tl"],
    ["fil", "tl"],
    ["FIL-ph", "tl"],
  ])("normalizes %s to %s", (tag, locale) => {
    expect(interfaceLocaleOf(tag)).toBe(locale);
  });

  it.each([
    undefined,
    null,
    "",
    " ",
    "unknown",
    "ja-JP",
    "ar",
    "English",
    "Spanish",
    "espanol",
    "zh-Hant",
    "zh-TW",
    "zh-HK",
    "zh-MO",
    "zh-Hant-CN",
    "zh-cmn-Hant-CN",
    "zh-Hant-x-hans",
    " ZH-hant-hk ",
    "zh-TW-u-nu-hanidec",
    "zh-Latn",
  ])("falls back to English for %s", (language) => {
    expect(interfaceLocaleOf(language)).toBe("en");
    expect(isInterfaceLocale(language)).toBeFalsy();
  });

  it("keeps the browser Filipino alias distinct from stored locale IDs", () => {
    expect(isInterfaceLocale("fil")).toBeFalsy();
    expect(interfaceLocaleOf("fil")).toBe("tl");
  });
});

import { describe, expect, it } from "vitest";

import { helpStyleOf } from "./help-style";
import { interfaceLocaleOf, intlLocaleOf, isInterfaceLocale } from "./locale";

describe("fixed-word locales", () => {
  it.each(["es", "es-MX", "ES-us", " es-ES "])(
    "normalizes %s to Spanish",
    (language) => {
      expect(interfaceLocaleOf(language)).toBe("es");
    }
  );

  it.each([
    undefined,
    null,
    "",
    "fr",
    "unknown",
    "English",
    "Spanish",
    "espanol",
  ])("falls back to English for %s", (language) => {
    expect(interfaceLocaleOf(language)).toBe("en");
  });

  it("keeps fixed-word support separate from multilingual explanations", () => {
    expect(helpStyleOf({ supportLanguage: "fr" }).language).toBe("fr");
    expect(interfaceLocaleOf("fr")).toBe("en");
    expect(isInterfaceLocale("es-MX")).toBeFalsy();
    expect(isInterfaceLocale("es")).toBeTruthy();
  });

  it("uses supported Intl tags", () => {
    expect(intlLocaleOf("es")).toBe("es-US");
    expect(intlLocaleOf("en")).toBe("en-US");
  });
});

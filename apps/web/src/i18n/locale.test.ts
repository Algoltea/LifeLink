import { groceryUnits } from "@lifelink/contracts/groceries";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOCALE_BOOT_SCRIPT, LOCALE_STORAGE_KEY } from "./boot";
import {
  currentIntlLocale,
  currentMessages,
  getLocale,
  messagesFor,
  setLocale,
} from "./locale";
import { en } from "./messages/en";
import { es } from "./messages/es";
import { translateServerMessage } from "./server-messages";

describe("localization", () => {
  beforeEach(() => {
    vi.stubGlobal("document", { documentElement: { lang: "en" } });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn<Storage["getItem"]>(() => null),
      setItem: vi.fn<Storage["setItem"]>(),
    });
    setLocale("en");
  });

  afterEach(() => {
    setLocale("en");
    vi.unstubAllGlobals();
  });

  describe("language catalogs", () => {
    it("provides matching namespaces in both typed catalogs", () => {
      expect(Object.keys(es)).toStrictEqual(Object.keys(en));
    });

    it("provides Spanish labels for every shared grocery unit", () => {
      for (const unit of groceryUnits) {
        expect(es.groceries.units[unit.value]?.label).toBeTruthy();
        expect(es.groceries.units[unit.value]?.short).toBeDefined();
      }
    });

    it("selects Spanish words and Intl formatting without changing English", () => {
      setLocale("es");

      expect({
        english: messagesFor("en").format.today,
        intl: currentIntlLocale(),
        locale: getLocale(),
        today: currentMessages().format.today,
      }).toStrictEqual({
        english: "Today",
        intl: "es-US",
        locale: "es",
        today: "Hoy",
      });
      expect(document.documentElement.lang).toBe("es");
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        LOCALE_STORAGE_KEY,
        "es"
      );
    });

    it("switches even if device storage is unavailable", () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error("Storage disabled");
      });

      expect(() => setLocale("es")).not.toThrow();
      expect(getLocale()).toBe("es");
      expect(document.documentElement.lang).toBe("es");
    });

    it("includes the shared storage key in the pre-paint language script", () => {
      expect(LOCALE_BOOT_SCRIPT).toContain(LOCALE_STORAGE_KEY);
      expect(LOCALE_BOOT_SCRIPT).toContain("navigator.language");
    });
  });

  describe("fixed backend messages", () => {
    it("translates known messages only in Spanish", () => {
      expect(translateServerMessage("Wait for an answer")).toBe(
        "Wait for an answer"
      );
      setLocale("es");
      expect(translateServerMessage("Wait for an answer")).toBe(
        "Esperar una respuesta"
      );
    });

    it("preserves names and exact quoted words in generated status messages", () => {
      setLocale("es");
      expect(translateServerMessage("Ana said: “I'll be there at 4.”")).toBe(
        "Ana dijo: “I'll be there at 4.”"
      );
    });

    it.each([
      "Unrecognized provider error",
      "toString",
      "constructor",
      "__proto__",
    ])(
      "preserves unknown text instead of hiding or inventing an error: %s",
      (message) => {
        setLocale("es");
        expect(translateServerMessage(message)).toBe(message);
      }
    );
  });
});

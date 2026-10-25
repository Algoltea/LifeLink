import { interfaceLocales } from "@lifelink/contracts/locale";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { translateConnectionMessage } from "./connection-messages";

describe("connection message dispatch", () => {
  beforeEach(() => {
    vi.stubGlobal("document", { documentElement: { lang: "en" } });
    vi.stubGlobal("localStorage", { setItem: vi.fn<Storage["setItem"]>() });
    setLocale("en");
  });

  afterEach(() => {
    setLocale("en");
    vi.unstubAllGlobals();
  });

  it.each(interfaceLocales)(
    "uses explicit $id messages and keeps provider diagnostics verbatim",
    ({ id }) => {
      setLocale(id === "en" ? "ko" : "en");
      const words = messagesFor(id).connections;
      const label = "Sam’s Gmail — Nguyễn";
      const unavailable = `${label} has no available features in LifeLink yet. You do not need to connect an account.`;
      expect(translateConnectionMessage(unavailable, id)).toBe(
        words.unavailableFeatures(label)
      );
      expect(
        translateConnectionMessage(
          `Your real ${label} connection is saved. Practice accounts cannot replace it. Turn off Practice mode in Settings to manage it.`,
          id
        )
      ).toBe(words.practiceBlocked(label));
      expect(translateConnectionMessage("The connection is pending.", id)).toBe(
        words.connectionState(words.connectionStates.pending ?? "pending")
      );
      const diagnostic = "  Provider X: access_denied; request-id abc-42  ";
      expect(translateConnectionMessage(diagnostic, id)).toBe(diagnostic);
      setLocale(id);
      expect(translateConnectionMessage(unavailable)).toBe(
        words.unavailableFeatures(label)
      );
    }
  );
});

import { describe, expect, it } from "vitest";

import { messagesFor } from "@/i18n/locale";

import { reviewNarration } from "./scam-result";

const review: Parameters<typeof reviewNarration>[0] = {
  explanation:
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.",
  inputKind: "text",
  model: "rules",
  nextSteps: [],
  signals: [],
  verdict: "unsure",
};

describe("scam result narration", () => {
  it.each(["en", "es"] as const)(
    "discloses the English-only rules before the no-warning result in %s",
    (locale) => {
      const spoken = reviewNarration(review, locale);
      const t = messagesFor(locale).scamResult;

      expect(spoken.startsWith(t.localLanguageNotice)).toBeTruthy();
      expect(spoken).toContain(t.verdicts.unsure);
      expect(spoken).not.toContain(t.verdicts.likely_scam);
    }
  );

  it("keeps the limit on older rules results that used the likely_safe label", () => {
    const t = messagesFor("es").scamResult;

    const spoken = reviewNarration(
      { ...review, model: "rules-v1", verdict: "likely_safe" },
      "es"
    );

    expect(spoken.startsWith(t.localLanguageNotice)).toBeTruthy();
    expect(spoken).toContain(t.verdicts.likely_safe);
  });

  it("preserves authored cloud wording without mislabelling its detection method", () => {
    const explanation =
      "El mensaje dice: “Envíeme su contraseña y transfiera dinero de inmediato.”";

    const spoken = reviewNarration(
      { ...review, explanation, model: "cloud" },
      "es"
    );

    expect(spoken).not.toContain(
      messagesFor("es").scamResult.localLanguageNotice
    );
    expect(spoken).toContain(explanation);
  });
});

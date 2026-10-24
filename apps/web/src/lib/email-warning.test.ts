import { describe, expect, it } from "vitest";

import { messagesFor } from "@/i18n/locale";

import { emailWarningIntro, hasEmailWarning } from "./email-warning";

describe("email warning narration", () => {
  it("leads with the caution, saved reasons, and trusted-person advice", () => {
    const intro = emailWarningIntro({ suspicious: true }, [
      "Pressure to act fast",
      "Mentions private details",
    ]);

    expect(intro.startsWith("Potential scam.")).toBeTruthy();
    expect(intro).toContain("Pressure to act fast; Mentions private details");
    expect(intro).toContain("If you're unsure, ask someone you trust");
    expect(intro.indexOf("Pressure to act fast")).toBeLessThan(
      intro.indexOf("ask someone you trust")
    );
  });

  it.each(["likely_scam", "suspicious"])(
    "keeps a saved %s warning even without a summary flag",
    (verdict) => {
      const email = { scamCheck: { verdict }, suspicious: false };

      expect(hasEmailWarning(email)).toBeTruthy();
      expect(
        emailWarningIntro(email, ["Contains a link"]).startsWith(
          "Potential scam. Warning signs: Contains a link."
        )
      ).toBeTruthy();
    }
  );

  it("does not invent a reason when none is available", () => {
    expect(emailWarningIntro({ suspicious: true }, [])).toContain(
      "This email raised a concern. Check the request before acting."
    );
  });

  it.each([{ suspicious: null }, { suspicious: false }])(
    "does not invent a check or warning for an unchecked email: %j",
    (email) => {
      expect(hasEmailWarning(email)).toBeFalsy();
      expect(emailWarningIntro(email, [])).toBe("");
    }
  );

  it.each(["en", "es"] as const)(
    "discloses the language limit without inventing a warning for an unflagged checked email in %s",
    (locale) => {
      const email = { scamCheck: { verdict: "unsure" }, suspicious: false };

      expect(hasEmailWarning(email)).toBeFalsy();
      expect(emailWarningIntro(email, [], locale)).toBe(
        messagesFor(locale).email.localLanguageNotice
      );
    }
  );

  it.each(["en", "es"] as const)(
    "keeps the language limit and saved warning in %s narration",
    (locale) => {
      const intro = emailWarningIntro(
        { scamCheck: { verdict: "suspicious" }, suspicious: true },
        ["Mentions private details"],
        locale
      );

      expect(intro).toContain(messagesFor(locale).email.localLanguageNotice);
      expect(intro).toContain(
        locale === "es" ? "Menciona datos privados" : "Mentions private details"
      );
    }
  );
});

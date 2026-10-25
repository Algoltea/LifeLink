import { describe, expect, it } from "vitest";

import { messagesFor } from "@/i18n/locale";

import {
  emailCheckNotice,
  emailWarningIntro,
  emailWarningSign,
  hasEmailWarning,
} from "./email-warning";

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
      const email = {
        scamCheck: { method: "local", verdict },
        suspicious: false,
      };

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
      const email = {
        scamCheck: { method: "local", verdict: "unsure" },
        suspicious: false,
      };

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
        {
          scamCheck: { method: "local", verdict: "suspicious" },
          suspicious: true,
        },
        ["Mentions private details"],
        locale
      );

      expect(intro).toContain(messagesFor(locale).email.localLanguageNotice);
      expect(intro).toContain(
        locale === "es" ? "Menciona datos privados" : "Mentions private details"
      );
    }
  );

  it.each(["en", "es"] as const)(
    "uses the cloud caveat on an unflagged AI result in %s",
    (locale) => {
      const email = {
        scamCheck: {
          method: "cloud",
          model: "provider/model",
          verdict: "unsure",
        },
        suspicious: false,
      };

      expect(hasEmailWarning(email)).toBeFalsy();
      expect(emailCheckNotice(email, locale)).toBe(
        messagesFor(locale).email.cloudCheckNotice
      );
      expect(emailWarningIntro(email, [], locale)).toBe(
        messagesFor(locale).email.cloudCheckNotice
      );
    }
  );

  it.each(["Pressure to act fast", "Ana said: “Wait for an answer”"])(
    "preserves authored AI warning text even when it resembles fixed English: %s",
    (sign) => {
      const email = {
        scamCheck: { method: "cloud", verdict: "suspicious" },
        suspicious: true,
      };

      expect(emailWarningSign(email, sign, "es")).toBe(sign);
      expect(emailWarningIntro(email, [sign], "es")).toContain(sign);
      expect(emailWarningIntro(email, [sign], "es")).toContain(
        messagesFor("es").email.cloudCheckNotice
      );
      expect(emailWarningIntro(email, [sign], "es")).not.toContain(
        messagesFor("es").email.localLanguageNotice
      );
    }
  );

  it.each(["rules-v1", "rules (model unavailable)"])(
    "recognizes a saved rules model, including cloud fallback: %s",
    (model) => {
      const email = {
        scamCheck: { model, verdict: "unsure" },
        suspicious: false,
      };

      expect(emailCheckNotice(email, "es")).toBe(
        messagesFor("es").email.localLanguageNotice
      );
      expect(emailWarningSign(email, "Pressure to act fast", "es")).toBe(
        "Presión para actuar rápido"
      );
    }
  );

  it("recognizes a saved cloud model when no explicit method was stored", () => {
    const email = {
      scamCheck: { model: "provider/model", verdict: "unsure" },
      suspicious: false,
    };

    expect(emailWarningIntro(email, [], "es")).toBe(
      messagesFor("es").email.cloudCheckNotice
    );
    expect(emailWarningSign(email, "Pressure to act fast", "es")).toBe(
      "Pressure to act fast"
    );
  });

  it.each(["en", "es"] as const)(
    "does not infer locality from an older result's rulesVersion in %s",
    (locale) => {
      const email = {
        scamCheck: { rulesVersion: 1, verdict: "unsure" },
        suspicious: false,
      };

      expect(emailCheckNotice(email, locale)).toBe(
        messagesFor(locale).email.unknownCheckNotice
      );
      expect(emailWarningIntro(email, [], locale)).toBe(
        messagesFor(locale).email.unknownCheckNotice
      );
      expect(emailWarningSign(email, "Pressure to act fast", locale)).toBe(
        "Pressure to act fast"
      );
    }
  );
});

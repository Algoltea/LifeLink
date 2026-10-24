import { describe, expect, it } from "vitest";

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

  it.each([
    { suspicious: null },
    { suspicious: false },
    { scamCheck: { verdict: "unsure" }, suspicious: false },
  ])("does not announce a scam on an unflagged email: %j", (email) => {
    expect(hasEmailWarning(email)).toBeFalsy();
    expect(emailWarningIntro(email, [])).toBe("");
  });
});

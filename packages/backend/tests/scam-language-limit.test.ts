import { describe, expect, it } from "vitest";

import { api } from "../convex/_generated/api";
import { newBackend, signUp } from "./harness";

const SPANISH_REQUEST =
  "Envíeme su contraseña y transfiera dinero de inmediato.";

const localReview = async (text: string, supportLanguage: string) => {
  const backend = newBackend();

  const { person } = await signUp(backend, {
    demo: false,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

  await person.mutation(api.profiles.updatePreferences, { supportLanguage });

  const reviewId = await person.mutation(api.scam.submit, {
    allowCloudAnalysis: false,
    emailId: null,
    screenshotId: null,
    text,
  });

  return await person.query(api.scam.get, { reviewId });
};

describe("English-only local scam rule limitations", () => {
  it.each(["en", "es"])(
    "misses the Spanish request even with %s preferences, without calling it safe",
    async (supportLanguage) => {
      // This records a known detection gap, not evidence that the request is safe.
      const review = await localReview(SPANISH_REQUEST, supportLanguage);

      expect(review).toMatchObject({
        cloudAnalysisConsent: false,
        confidence: "low",
        model: "rules",
        status: "done",
        verdict: "unsure",
      });
      expect(review.signals).toStrictEqual([]);
      expect(review.inputText).toBe(SPANISH_REQUEST);
    }
  );

  it("quotes only the matched English words verbatim in mixed-language input", async () => {
    const text = `${SPANISH_REQUEST} Please send your PaSsWoRd.`;
    const review = await localReview(text, "es");

    expect(review).toMatchObject({
      cloudAnalysisConsent: false,
      model: "rules",
      verdict: "suspicious",
    });
    expect(review.inputText).toBe(text);
    expect(
      review.signals.map((signal) => ({
        evidence: signal.evidence,
        quote: signal.quote,
      }))
    ).toStrictEqual([{ evidence: "verified", quote: "PaSsWoRd" }]);
  });
});

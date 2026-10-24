import type { ScamReviewResult } from "@lifelink/contracts/model-output";
import { describe, expect, it } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { connectFamily, newBackend, signUp } from "./harness";
import type { Backend } from "./harness";

const SCAM_TEXT =
  "URGENT: your account is suspended. Reply with the verification code we sent you and buy two gift cards today.";

const GENUINE_NOTICE =
  "Your statement is ready. Your bank will never ask for your verification code, and we never ask you to pay with gift cards.";

const owner = async (backend: Backend) =>
  await signUp(backend, {
    demo: false,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

/** A review waiting for a model answer, as `startReview` leaves it. */
const pendingReview = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  input: { inputKind?: Doc<"scamReviews">["inputKind"]; text: string | null }
): Promise<Id<"scamReviews">> =>
  await backend.run(
    async (ctx) =>
      await ctx.db.insert("scamReviews", {
        askTrustedContact: false,
        automatic: false,
        cloudAnalysisConsent: true,
        confidence: "low",
        createdAt: Date.now(),
        emailId: null,
        explanation: "",
        inputKind: input.inputKind ?? "text",
        inputText: input.text,
        mode: "live",
        model: "",
        nextSteps: [],
        ownerId,
        screenshotId: null,
        signals: [],
        status: "reviewing",
        verdict: "unsure",
        verificationTaskId: null,
      })
  );

const modelSays = (
  overrides: Partial<ScamReviewResult> = {}
): ScamReviewResult => ({
  askTrustedContact: true,
  confidence: "high",
  explanation: "This message pressures you to act quickly.",
  nextSteps: ["Don't reply.", "Call your bank on the number on your card."],
  signals: [],
  verdict: "likely_scam",
  ...overrides,
});

const finishWith = async (
  backend: Backend,
  reviewId: Id<"scamReviews">,
  result: ScamReviewResult
): Promise<Doc<"scamReviews">> => {
  await backend.mutation(internal.scam.finish, {
    model: "test-model",
    resultJson: JSON.stringify(result),
    reviewId,
  });

  const review = await backend.run(async (ctx) => await ctx.db.get(reviewId));

  if (review === null) {
    throw new Error("Expected the review to exist.");
  }

  return review;
};

describe("model quotes are checked against the message", () => {
  it("removes a fabricated quote and lowers confidence", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);
    const reviewId = await pendingReview(backend, id, { text: SCAM_TEXT });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({
        signals: [
          {
            detail: "It asks for a code.",
            label: "Asks for a code",
            quote: "Reply with the verification code",
            stance: "requests",
          },
          {
            detail: "It asks for your PIN.",
            label: "Asks for a PIN",
            quote: "send us your PIN",
            stance: "requests",
          },
        ],
      })
    );

    expect(review.signals.map((signal) => signal.quote)).toStrictEqual([
      "Reply with the verification code",
    ]);
    expect(review.signals[0]?.evidence).toBe("verified");
    expect(review.unverifiedQuoteCount).toBe(1);
    expect(review.confidence).toBe("low");
  });

  it("removes a paraphrase that differs by one word", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);
    const reviewId = await pendingReview(backend, id, { text: SCAM_TEXT });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({
        signals: [
          {
            detail: "It asks for a code.",
            label: "Asks for a code",
            quote: "Reply with the security code",
            stance: "requests",
          },
        ],
      })
    );

    expect(review.signals).toStrictEqual(
      // The local rules still explain the verdict with the message's own words.
      expect.not.arrayContaining([
        expect.objectContaining({ quote: "Reply with the security code" }),
      ])
    );
    expect(review.unverifiedQuoteCount).toBe(1);
  });

  it("stores the message's own words, not the model's copy", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);
    const reviewId = await pendingReview(backend, id, { text: SCAM_TEXT });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({
        signals: [
          {
            detail: "Pressure.",
            label: "Pressure",
            quote: "  “URGENT: your account is suspended.”",
            stance: "mentions",
          },
        ],
      })
    );

    expect(review.signals[0]?.quote).toBe("URGENT: your account is suspended.");
  });

  it("hides an explanation that quotes words the message does not contain", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);
    const reviewId = await pendingReview(backend, id, { text: SCAM_TEXT });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({
        explanation: 'It says "wire the money to this account" right away.',
      })
    );

    expect(review.explanation).not.toContain("wire the money");
    expect(review.unverifiedQuoteCount).toBe(1);
    expect(review.confidence).toBe("low");
  });

  it("keeps a screenshot's quotes but labels them unverified", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);

    const reviewId = await pendingReview(backend, id, {
      inputKind: "screenshot",
      text: "It came from my bank, I think",
    });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({
        confidence: "high",
        signals: [
          {
            detail: "Read from the image.",
            label: "Asks for a code",
            quote: "Text back the 6-digit code",
            stance: "requests",
          },
          {
            detail: "From the words you typed.",
            label: "Claims to be a bank",
            quote: "from my bank",
            stance: "mentions",
          },
        ],
      })
    );

    expect(
      review.signals.map((signal) => [signal.quote, signal.evidence])
    ).toStrictEqual([
      ["Text back the 6-digit code", "image_unverified"],
      ["from my bank", "verified"],
    ]);
    expect(review.unverifiedQuoteCount).toBe(0);
    expect(review.confidence).toBe("medium");
  });
});

describe("warnings against an action are not requests for it", () => {
  it("does not flag a genuine safety notice locally", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);

    const reviewId = await person.mutation(api.scam.submit, {
      emailId: null,
      screenshotId: null,
      text: GENUINE_NOTICE,
    });

    const review = await person.query(api.scam.get, { reviewId });

    expect(review.verdict).toBe("unsure");
    expect(
      review.signals.map((signal) => [signal.label, signal.stance])
    ).toStrictEqual([
      ["Warns against sharing private details", "warns_against"],
      ["Warns against unusual payments", "warns_against"],
    ]);
  });

  it.each([
    "Reply with the verification code we sent you.",
    "Buy two gift cards and read me the numbers.",
    "Don't tell anyone, just buy the gift cards.",
  ])("still flags a real request: %s", async (text) => {
    const backend = newBackend();
    const { person } = await owner(backend);

    const reviewId = await person.mutation(api.scam.submit, {
      emailId: null,
      screenshotId: null,
      text,
    });

    const review = await person.query(api.scam.get, { reviewId });

    expect(review.verdict).not.toBe("unsure");
    expect(review.signals[0]?.stance).toBe("mentions");
  });

  it("flags the request in a message that also contains a warning", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);

    const reviewId = await person.mutation(api.scam.submit, {
      emailId: null,
      screenshotId: null,
      text: "We'll never ask for your password. To keep your account, buy a gift card today.",
    });

    const review = await person.query(api.scam.get, { reviewId });

    expect(review.verdict).toBe("suspicious");
    expect(
      review.signals.find((signal) => signal.stance !== "warns_against")?.quote
    ).toBe("gift card");
  });

  it("believes a model's warning only when the words agree", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);

    const reviewId = await pendingReview(backend, id, {
      text: "Don't tell anyone, just buy the gift cards.",
    });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({
        signals: [
          {
            detail: "It mentions gift cards.",
            label: "Gift cards",
            quote: "gift cards",
            stance: "warns_against",
          },
        ],
      })
    );

    expect(review.signals[0]?.stance).toBe("mentions");
  });
});

describe("the verdict stays careful", () => {
  it("never falls below the local check", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);
    const reviewId = await pendingReview(backend, id, { text: SCAM_TEXT });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({ confidence: "high", signals: [], verdict: "likely_safe" })
    );

    expect(review.verdict).toBe("likely_scam");
    expect(review.signals.length).toBeGreaterThan(0);
    expect(
      review.signals.every((signal) => signal.evidence === "verified")
    ).toBeTruthy();
  });

  it("keeps a cautious model verdict when every quote was removed", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);

    const reviewId = await pendingReview(backend, id, {
      text: "Hi, it's your grandson. I'm in trouble, please help.",
    });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({
        signals: [
          {
            detail: "Invented.",
            label: "Invented",
            quote: "send money by Western Union",
            stance: "requests",
          },
        ],
        verdict: "likely_scam",
      })
    );

    expect(review.verdict).toBe("likely_scam");
    expect(review.signals).toStrictEqual([]);
    expect(review.confidence).toBe("low");
  });

  it("never saves likely_safe", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);

    const reviewId = await pendingReview(backend, id, {
      text: "See you at lunch on Sunday.",
    });

    const review = await finishWith(
      backend,
      reviewId,
      modelSays({ signals: [], verdict: "likely_safe" })
    );

    expect(review.verdict).toBe("unsure");
  });

  it("marks a malformed answer as failed", async () => {
    const backend = newBackend();
    const { id } = await owner(backend);
    const reviewId = await pendingReview(backend, id, { text: SCAM_TEXT });

    await backend.mutation(internal.scam.finish, {
      model: "test-model",
      resultJson: '{"verdict":"likely_scam"}',
      reviewId,
    });

    const review = await backend.run(async (ctx) => await ctx.db.get(reviewId));

    expect(review?.status).toBe("failed");
  });
});

const storeEmail = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  extra: Partial<Doc<"emails">> = {}
): Promise<Id<"emails">> =>
  await backend.run(async (ctx) => {
    const emailId = await ctx.db.insert("emails", {
      actionNeeded: null,
      bodyText: GENUINE_NOTICE,
      cloudAnalysisConsent: false,
      connectionId: null,
      fromAddress: "statements@bank.example",
      fromName: "Bank",
      mode: "live",
      ownerId,
      provider: "gmail",
      providerMessageId: "m-1",
      providerThreadId: null,
      receivedAt: Date.now(),
      selectedForReview: false,
      subject: "Your statement",
      summary: null,
      suspicious: true,
      ...extra,
    });

    // What the first version of the rules recorded: a false alarm.
    const reviewId = await ctx.db.insert("scamReviews", {
      askTrustedContact: true,
      automatic: true,
      cloudAnalysisConsent: false,
      confidence: "medium",
      createdAt: Date.now(),
      emailId,
      explanation: "Old rules.",
      inputKind: "email",
      inputText: GENUINE_NOTICE,
      mode: "live",
      model: "rules-v1",
      nextSteps: [],
      ownerId,
      screenshotId: null,
      signals: [],
      status: "done",
      verdict: "likely_scam",
      verificationTaskId: null,
    });

    await ctx.db.patch(emailId, {
      scamCheck: {
        checkedAt: Date.now(),
        reviewId,
        rulesVersion: 1,
        verdict: "likely_scam",
        warningCount: 2,
      },
    });

    return emailId;
  });

describe("rescanning stored email with the updated rules", () => {
  it("shows actual warning reasons inline without counting protective advice as a warning", async () => {
    const backend = newBackend();
    const { id, person } = await owner(backend);
    const genuineId = await storeEmail(backend, id);

    const suspiciousId = await storeEmail(backend, id, {
      bodyText: SCAM_TEXT,
      providerMessageId: "m-2",
    });

    await person.mutation(api.emails.checkRecent, {
      emailIds: [genuineId, suspiciousId],
    });

    const genuine = await person.query(api.emails.get, { emailId: genuineId });

    const suspicious = await person.query(api.emails.get, {
      emailId: suspiciousId,
    });

    expect(genuine.warningSigns).toStrictEqual([]);
    expect(suspicious.warningSigns).toStrictEqual(
      expect.arrayContaining([
        "Pressure to act fast",
        "Mentions private details",
        "Mentions a payment method",
      ])
    );

    const stranger = await signUp(backend, {
      demo: false,
      name: "Pat",
      role: "owner",
      subject: "another-owner",
    });

    await expect(
      stranger.person.query(api.emails.get, { emailId: suspiciousId })
    ).rejects.toThrow(/not_found/u);
  });

  it("replaces the false alarm everywhere it was shown", async () => {
    const backend = newBackend();
    const { id, person } = await owner(backend);
    const emailId = await storeEmail(backend, id);

    const { family } = await connectFamily(backend, person, [
      "scam_alerts.view",
    ]);

    const before = await family.query(api.family.overview, { ownerId: id });

    expect(before?.scamAlerts).toHaveLength(1);

    await person.mutation(api.emails.checkRecent, {});

    const email = await backend.run(async (ctx) => await ctx.db.get(emailId));
    const after = await family.query(api.family.overview, { ownerId: id });
    const history = await person.query(api.scam.list, {});

    expect(email?.suspicious).toBeFalsy();
    expect(email?.scamCheck).toMatchObject({
      rulesVersion: 2,
      warningCount: 0,
    });
    expect(after?.scamAlerts).toStrictEqual([]);
    expect(history).toHaveLength(1);
  });

  it("keeps a flag that a cloud summary set", async () => {
    const backend = newBackend();
    const { id, person } = await owner(backend);

    const emailId = await storeEmail(backend, id, {
      cloudAnalysisConsent: true,
      summaryFlagged: true,
    });

    await person.mutation(api.emails.checkRecent, {});

    const email = await backend.run(async (ctx) => await ctx.db.get(emailId));

    expect(email?.suspicious).toBeTruthy();
  });
});

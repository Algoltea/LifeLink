import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { newBackend, signUp } from "./harness";
import type { Backend } from "./harness";

const fetchMock = vi.fn<typeof fetch>();

const SCAM_BODY =
  "Your account is locked. Buy two Apple gift cards today and reply with the codes.";

const setup = async () => {
  const backend = newBackend();

  const { id, person } = await signUp(backend, {
    demo: false,
    name: "Ruth",
    role: "owner",
    subject: "email-ai-owner",
  });

  const connectionId = await backend.run(
    async (ctx) =>
      await ctx.db.insert("connections", {
        accountLabel: "ruth@example.com",
        connectedAt: Date.now(),
        externalAccountId: "mail-account",
        lastError: null,
        mode: "live",
        ownerId: id,
        pendingAttemptId: null,
        provider: "gmail",
        status: "active",
        updatedAt: Date.now(),
      })
  );

  return { backend, connectionId, owner: person, ownerId: id };
};

const sync = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  connectionId: Id<"connections">,
  receivedAt = Date.now()
): Promise<Id<"emails">> => {
  await backend.mutation(internal.emails.storeSynced, {
    connectionId,
    messages: [
      {
        bodyText: SCAM_BODY,
        fromAddress: "support@locked-account.example",
        fromName: "Account Support",
        providerMessageId: `mail-${receivedAt}`,
        providerThreadId: null,
        receivedAt,
        subject: "Urgent: account locked",
      },
    ],
    ownerId,
    provider: "gmail",
  });

  const email = await backend.run(
    async (ctx) =>
      await ctx.db
        .query("emails")
        .withIndex("by_owner_received", (index) => index.eq("ownerId", ownerId))
        .first()
  );

  if (email === null) {
    throw new Error("The synced email was not stored.");
  }

  return email._id;
};

const scheduledChecks = async (backend: Backend): Promise<number> =>
  await backend.run(async (ctx) => {
    const jobs = await ctx.db.system.query("_scheduled_functions").collect();

    return jobs.filter((job) => job.name.includes("checkNewEmail")).length;
  });

const modelReply = (quote: string): Response =>
  Response.json({
    choices: [
      {
        message: {
          content: JSON.stringify({
            askTrustedContact: true,
            confidence: "high",
            explanation: "It asks for gift cards to unlock an account.",
            nextSteps: ["Don’t buy gift cards. Ask someone you trust."],
            signals: [
              {
                detail: "Real companies never ask for gift cards.",
                label: "Gift card payment",
                quote,
                stance: "requests",
              },
            ],
            verdict: "likely_scam",
          }),
        },
      },
    ],
    model: "test-fast-model",
  });

describe("AI checks on newly arrived email", () => {
  beforeEach(() => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("replaces the keyword result with the fast model's checked result", async () => {
    const { backend, connectionId, ownerId } = await setup();
    const emailId = await sync(backend, ownerId, connectionId);

    fetchMock.mockResolvedValueOnce(
      modelReply("Buy two Apple gift cards today")
    );
    await backend.action(internal.scam.checkNewEmail, { emailId });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.model).toBe("openai/gpt-6-luna");

    const { email, review } = await backend.run(async (ctx) => {
      const stored = await ctx.db.get(emailId);

      return {
        email: stored,
        review:
          stored?.scamCheck === undefined
            ? null
            : await ctx.db.get(stored.scamCheck.reviewId),
      };
    });

    expect(review).toMatchObject({
      automatic: true,
      cloudAnalysisConsent: true,
      model: "test-fast-model",
      verdict: "likely_scam",
    });
    expect(review?.signals).toContainEqual(
      expect.objectContaining({ quote: "Buy two Apple gift cards today" })
    );
    expect(email).toMatchObject({
      scamCheck: { verdict: "likely_scam" },
      suspicious: true,
    });

    await backend.action(internal.scam.checkNewEmail, { emailId });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("schedules exactly one check, even when the mail syncs again", async () => {
    const { backend, connectionId, ownerId } = await setup();
    const receivedAt = Date.now();
    await sync(backend, ownerId, connectionId, receivedAt);
    await sync(backend, ownerId, connectionId, receivedAt);

    await expect(scheduledChecks(backend)).resolves.toBe(1);
  });

  it("does not send mail older than two days", async () => {
    const { backend, connectionId, ownerId } = await setup();
    await sync(backend, ownerId, connectionId, Date.now() - 3 * 86_400_000);

    await expect(scheduledChecks(backend)).resolves.toBe(0);
  });

  it("sends nothing when the owner turns the setting off", async () => {
    const { backend, connectionId, owner, ownerId } = await setup();
    await owner.mutation(api.profiles.updatePreferences, {
      aiEmailChecks: false,
    });
    const emailId = await sync(backend, ownerId, connectionId);

    await backend.action(internal.scam.checkNewEmail, { emailId });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("drops a quote that is not in the email but keeps the flag's reasons", async () => {
    const { backend, connectionId, ownerId } = await setup();
    const emailId = await sync(backend, ownerId, connectionId);

    fetchMock.mockResolvedValueOnce(modelReply("Send your bank password"));
    await backend.action(internal.scam.checkNewEmail, { emailId });

    const { email, review } = await backend.run(async (ctx) => {
      const stored = await ctx.db.get(emailId);

      return {
        email: stored,
        review:
          stored?.scamCheck === undefined
            ? null
            : await ctx.db.get(stored.scamCheck.reviewId),
      };
    });

    expect(review?.signals).not.toContainEqual(
      expect.objectContaining({ quote: "Send your bank password" })
    );
    expect(email?.scamCheck?.verdict).not.toBe("unsure");
    expect(email?.scamCheck?.warningCount).toBeGreaterThan(0);
  });

  it("keeps the keyword result when the model is unavailable", async () => {
    const { backend, connectionId, ownerId } = await setup();
    const emailId = await sync(backend, ownerId, connectionId);

    fetchMock.mockResolvedValueOnce(
      new Response("Unavailable", { status: 503 })
    );
    await backend.action(internal.scam.checkNewEmail, { emailId });

    const review = await backend.run(async (ctx) => {
      const stored = await ctx.db.get(emailId);

      return stored?.scamCheck === undefined
        ? null
        : await ctx.db.get(stored.scamCheck.reviewId);
    });

    // The request left LifeLink, so the record must not say it didn't.
    expect(review).toMatchObject({
      cloudAnalysisConsent: true,
      model: expect.stringMatching(/^rules/u),
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { api, internal } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import type { JsonObject } from "../convex/integrations/http";
import type { MailSummary } from "../convex/integrations/mail";
import { DAY, newBackend, signUp } from "./harness";
import type { Backend } from "./harness";

const fetchMock = vi.fn<typeof fetch>();
const ACCOUNT_ID = "warning-mail-account";
const OWN_ADDRESS = "verified-owner@example.com";
const VERIFIED_PROFILE = { emailAddress: OWN_ADDRESS };

const PROFILE_URL =
  "https://backend.composio.dev/api/v3.1/tools/execute/GMAIL_GET_PROFILE";

const GMAIL_DRAFT_URL =
  "https://backend.composio.dev/api/v3.1/tools/execute/GMAIL_CREATE_EMAIL_DRAFT";

const OUTLOOK_DRAFT_URL =
  "https://backend.composio.dev/api/v3.1/tools/execute/OUTLOOK_CREATE_DRAFT";

const AI_URL = "https://openrouter.ai/api/v1/chat/completions";

const SCAM_BODY =
  "URGENT: your account is suspended. Reply with the verification code and buy two gift cards today.";

const SAFE_BODY = "See you for dinner on Sunday.";

const toolRequestSchema = z.object({
  arguments: z.record(z.string(), z.unknown()),
  connected_account_id: z.string(),
  user_id: z.string(),
});

const mail = (overrides: Partial<MailSummary> = {}): MailSummary => ({
  bodyText: SCAM_BODY,
  fromAddress: "scammer@example.net",
  fromName: "Account Support",
  providerMessageId: "warning-message",
  providerThreadId: "original-thread",
  receivedAt: Date.now(),
  subject: "Account notice",
  ...overrides,
});

const setup = async (provider: "gmail" | "outlook" = "gmail") => {
  const backend = newBackend();

  const { id: ownerId, person: owner } = await signUp(backend, {
    demo: false,
    name: "Ruth",
    role: "owner",
    subject: "warning-owner",
  });

  const connectionId = await backend.run(
    async (ctx) =>
      await ctx.db.insert("connections", {
        // An account label is not a verified recipient.
        accountLabel: "unverified-label@example.net",
        connectedAt: Date.now(),
        externalAccountId: ACCOUNT_ID,
        lastError: null,
        mode: "live",
        ownerId,
        pendingAttemptId: null,
        provider,
        status: "active",
        updatedAt: Date.now(),
      })
  );

  return { backend, connectionId, owner, ownerId, provider };
};

type Fixture = Awaited<ReturnType<typeof setup>>;

const ingest = async (
  fixture: Fixture,
  message = mail()
): Promise<Id<"emails">> => {
  const { backend, connectionId, ownerId, provider } = fixture;
  await backend.mutation(internal.emails.storeSynced, {
    connectionId,
    messages: [message],
    ownerId,
    provider,
  });

  const email = await backend.run(
    async (ctx) =>
      await ctx.db
        .query("emails")
        .withIndex("by_provider_message", (index) =>
          index
            .eq("ownerId", ownerId)
            .eq("providerMessageId", message.providerMessageId)
        )
        .unique()
  );

  if (email === null) {
    throw new Error("Expected ingestion to store the email.");
  }

  return email._id;
};

const storedEmail = async (
  backend: Backend,
  emailId: Id<"emails">
): Promise<Doc<"emails">> => {
  const email = await backend.run(async (ctx) => await ctx.db.get(emailId));

  if (email === null) {
    throw new Error("Expected the ingested email to exist.");
  }

  return email;
};

const warningJobs = async (backend: Backend) =>
  await backend.run(async (ctx) => {
    const jobs = await ctx.db.system.query("_scheduled_functions").collect();

    return jobs.filter((job) => job.name.includes("emailWarnings"));
  });

const toolResponse = (data: JsonObject): Response =>
  Response.json({ data, successful: true });

const toolRequests = (url: string) =>
  fetchMock.mock.calls
    .filter(([input]) => input === url)
    .map(([, init]) => toolRequestSchema.parse(JSON.parse(String(init?.body))));

const cloudResult = (quote: string) => ({
  askTrustedContact: true,
  confidence: "high",
  explanation: "This request appears to be a scam.",
  nextSteps: ["Ask someone you trust before taking any action."],
  signals: [
    {
      detail: "Check this request with someone you trust.",
      label: "Suspicious request",
      quote,
      stance: "requests",
    },
  ],
  verdict: "likely_scam",
});

const mockProvider = (profile: JsonObject = VERIFIED_PROFILE) => {
  fetchMock.mockImplementation((input) => {
    if (input === PROFILE_URL) {
      return Promise.resolve(toolResponse(profile));
    }

    if (input === GMAIL_DRAFT_URL || input === OUTLOOK_DRAFT_URL) {
      return Promise.resolve(toolResponse({ id: "warning-draft" }));
    }

    throw new Error(`Unexpected mocked request: ${String(input)}`);
  });
};

describe("automatic scam warning drafts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
    vi.stubEnv("COMPOSIO_API_KEY", "test-only-key");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubGlobal("fetch", fetchMock);
    mockProvider();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it.each<{ name: string; profile: JsonObject }>([
    { name: "direct", profile: { emailAddress: OWN_ADDRESS } },
    { name: "nested", profile: { data: { emailAddress: OWN_ADDRESS } } },
  ])(
    "ingests, queues, and drafts to the verified $name Gmail profile",
    async ({ profile }) => {
      const fixture = await setup();
      const { backend, ownerId } = fixture;
      mockProvider(profile);
      const message = mail();
      const emailId = await ingest(fixture, message);

      await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
        scamCheck: { verdict: "likely_scam" },
        scamWarningDraft: { draftId: null, status: "queued" },
        scamWarningMailboxId: ACCOUNT_ID,
      });
      expect(fetchMock).not.toHaveBeenCalled();

      await backend.finishAllScheduledFunctions(vi.runAllTimers);

      expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
        PROFILE_URL,
        GMAIL_DRAFT_URL,
      ]);
      expect([
        ...toolRequests(PROFILE_URL),
        ...toolRequests(GMAIL_DRAFT_URL),
      ]).toStrictEqual([
        {
          arguments: { user_id: "me" },
          connected_account_id: ACCOUNT_ID,
          user_id: ownerId,
        },
        {
          arguments: {
            body: expect.stringContaining("Trusted circle"),
            include_signature: false,
            is_html: false,
            recipient_email: OWN_ADDRESS,
            thread_id: message.providerThreadId,
          },
          connected_account_id: ACCOUNT_ID,
          user_id: ownerId,
        },
      ]);
      await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
        scamWarningDraft: { draftId: "warning-draft", status: "created" },
      });
    }
  );

  it("creates a standalone Outlook note with no recipient or reply arguments", async () => {
    const fixture = await setup("outlook");
    const emailId = await ingest(fixture);
    await fixture.backend.finishAllScheduledFunctions(vi.runAllTimers);

    expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
      OUTLOOK_DRAFT_URL,
    ]);
    expect(toolRequests(OUTLOOK_DRAFT_URL)).toStrictEqual([
      {
        arguments: {
          body: expect.stringContaining("Trusted circle"),
          is_html: false,
          subject: expect.stringContaining("Account notice"),
        },
        connected_account_id: ACCOUNT_ID,
        user_id: fixture.ownerId,
      },
    ]);
    await expect(storedEmail(fixture.backend, emailId)).resolves.toMatchObject({
      scamWarningDraft: { draftId: "warning-draft", status: "created" },
    });
  });

  it.each([
    { age: 0, bodyText: SAFE_BODY, name: "unflagged", verdict: "unsure" },
    {
      age: 0,
      bodyText: "Please buy a gift card.",
      name: "suspicious but not likely scam",
      verdict: "suspicious",
    },
    { age: 3 * DAY, bodyText: SCAM_BODY, name: "old", verdict: "likely_scam" },
  ])("does not draft for $name mail", async ({ age, bodyText, verdict }) => {
    const fixture = await setup();

    const emailId = await ingest(
      fixture,
      mail({ bodyText, receivedAt: Date.now() - age })
    );

    const email = await storedEmail(fixture.backend, emailId);
    expect(email.scamCheck?.verdict).toBe(verdict);
    expect(email.scamWarningDraft).toBeUndefined();

    expect(email.scamWarningMailboxId).toBe(age > 0 ? undefined : ACCOUNT_ID);

    await fixture.backend.action(internal.emailWarnings.create, { emailId });
    await fixture.backend.finishAllScheduledFunctions(vi.runAllTimers);
    await expect(warningJobs(fixture.backend)).resolves.toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not turn a manual cloud review into an automatic warning", async () => {
    const fixture = await setup();
    const { backend, owner } = fixture;
    const emailId = await ingest(fixture, mail({ bodyText: SAFE_BODY }));
    await owner.mutation(api.profiles.updatePreferences, {
      aiEmailChecks: false,
    });
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");

    const reviewId = await owner.mutation(api.scam.submit, {
      allowCloudAnalysis: true,
      emailId,
      screenshotId: null,
      text: null,
    });

    await backend.mutation(internal.scam.finish, {
      model: "manual-test-model",
      resultJson: JSON.stringify(cloudResult(SAFE_BODY)),
      reviewId,
    });
    await expect(
      backend.run(async (ctx) => await ctx.db.get(reviewId))
    ).resolves.toMatchObject({
      automatic: false,
      verdict: "likely_scam",
    });
    await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
      suspicious: true,
    });

    await owner.mutation(api.emails.checkRecent, { emailIds: [emailId] });
    await backend.action(internal.emailWarnings.create, { emailId });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const email = await storedEmail(backend, emailId);
    expect(email.scamWarningDraft).toBeUndefined();
    await expect(warningJobs(backend)).resolves.toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([SCAM_BODY, SAFE_BODY])(
    "queues one warning across local screening, an AI upgrade, and repeated ingestion: %s",
    async (bodyText) => {
      const fixture = await setup();
      const { backend } = fixture;
      const message = mail({ bodyText });
      const emailId = await ingest(fixture, message);
      await expect(warningJobs(backend)).resolves.toHaveLength(
        bodyText === SCAM_BODY ? 1 : 0
      );
      vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
      fetchMock.mockResolvedValueOnce(
        Response.json({
          choices: [
            { message: { content: JSON.stringify(cloudResult(bodyText)) } },
          ],
          model: "automatic-test-model",
        })
      );
      await backend.action(internal.scam.checkNewEmail, { emailId });

      const email = await storedEmail(backend, emailId);
      expect(email).toMatchObject({
        scamCheck: { verdict: "likely_scam" },
        scamWarningDraft: { status: "queued" },
      });

      if (email.scamCheck === undefined) {
        throw new Error("Expected the automatic review to remain linked.");
      }

      await expect(warningJobs(backend)).resolves.toHaveLength(1);
      await backend.finishAllScheduledFunctions(vi.runAllTimers);

      await ingest(fixture, message);
      await backend.action(internal.scam.checkNewEmail, { emailId });
      await backend.mutation(internal.scam.applyEmailCheck, {
        model: "automatic-test-model",
        resultJson: JSON.stringify(cloudResult(bodyText)),
        reviewId: email.scamCheck.reviewId,
      });
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
        AI_URL,
        PROFILE_URL,
        GMAIL_DRAFT_URL,
      ]);
      const completed = await storedEmail(backend, emailId);
      const jobs = await warningJobs(backend);
      expect({
        draft: completed.scamWarningDraft,
        jobCount: jobs.length,
      }).toMatchObject({
        draft: { draftId: "warning-draft", status: "created" },
        jobCount: 1,
      });
    }
  );

  it.each([
    "Practice mode",
    "expired connection",
    "different owner",
    "manual review",
  ])("rechecks %s before even reading the Gmail profile", async (change) => {
    const fixture = await setup();
    const { backend, connectionId, ownerId } = fixture;
    const emailId = await ingest(fixture);

    const { id: otherId } = await signUp(backend, {
      demo: false,
      name: "Other owner",
      role: "owner",
      subject: "other-warning-owner",
    });

    await backend.run(async (ctx) => {
      if (change === "Practice mode") {
        await ctx.db.patch(ownerId, { demoMode: true });
      } else if (change === "expired connection") {
        await ctx.db.patch(connectionId, { status: "expired" });
      } else if (change === "different owner") {
        await ctx.db.patch(connectionId, { ownerId: otherId });
      } else {
        const email = await ctx.db.get(emailId);

        if (email?.scamCheck === undefined) {
          throw new Error("Expected an automatic review.");
        }

        await ctx.db.patch(email.scamCheck.reviewId, { automatic: false });
      }
    });

    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
      scamWarningDraft: { status: "skipped" },
    });
  });

  it.each<{ name: string; profile: JsonObject }>([
    { name: "missing", profile: {} },
    {
      name: "nested malformed",
      profile: { data: { emailAddress: "not an address" } },
    },
    {
      name: "multiple recipients",
      profile: { emailAddress: `${OWN_ADDRESS},scammer@example.net` },
    },
  ])(
    "fails closed on a $name Gmail address without a fallback recipient",
    async ({ profile }) => {
      const fixture = await setup();
      const emailId = await ingest(fixture);
      mockProvider(profile);
      await fixture.backend.finishAllScheduledFunctions(vi.runAllTimers);
      await fixture.backend.action(internal.emailWarnings.create, { emailId });

      expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
        PROFILE_URL,
      ]);
      await expect(
        storedEmail(fixture.backend, emailId)
      ).resolves.toMatchObject({
        scamWarningDraft: { draftId: null, status: "failed" },
      });
    }
  );

  it("rechecks the pinned account after a Gmail profile read changes the connection", async () => {
    const fixture = await setup();
    const { backend, connectionId } = fixture;
    const message = mail();
    const emailId = await ingest(fixture, message);
    fetchMock.mockImplementationOnce(async () => {
      await backend.run(async (ctx) => {
        await ctx.db.patch(connectionId, {
          externalAccountId: "replacement-account",
        });
      });

      return toolResponse({ emailAddress: OWN_ADDRESS });
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    await ingest(fixture, message);
    await backend.action(internal.emailWarnings.create, { emailId });

    expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
      PROFILE_URL,
    ]);
    await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
      scamWarningDraft: { draftId: null, status: "skipped" },
      scamWarningMailboxId: ACCOUNT_ID,
    });
  });

  it("claims once across concurrent workers and persists unknown before the draft write answers", async () => {
    const fixture = await setup();
    const { backend } = fixture;
    const emailId = await ingest(fixture);
    const bothProfiles = Promise.withResolvers<null>();
    const draftStarted = Promise.withResolvers<null>();
    const draftResponse = Promise.withResolvers<Response>();
    let profiles = 0;
    fetchMock.mockImplementation(async (input) => {
      if (input === PROFILE_URL) {
        profiles += 1;

        if (profiles === 2) {
          bothProfiles.resolve(null);
        }

        await bothProfiles.promise;

        return toolResponse({ emailAddress: OWN_ADDRESS });
      }

      draftStarted.resolve(null);

      return await draftResponse.promise;
    });

    const workers = Promise.all([
      backend.action(internal.emailWarnings.create, { emailId }),
      backend.action(internal.emailWarnings.create, { emailId }),
    ]);

    await draftStarted.promise;

    try {
      await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
        scamWarningDraft: { draftId: null, status: "unknown" },
      });
      expect(toolRequests(GMAIL_DRAFT_URL)).toHaveLength(1);
    } finally {
      draftResponse.resolve(
        toolResponse({ data: { draft_id: "concurrent-draft" } })
      );
      await workers;
    }

    await backend.finishAllScheduledFunctions(vi.runAllTimers);

    expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
      PROFILE_URL,
      PROFILE_URL,
      GMAIL_DRAFT_URL,
    ]);
    await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
      scamWarningDraft: { draftId: "concurrent-draft", status: "created" },
    });
  });

  it.each([
    { outcome: "timeout", status: "unknown" },
    { outcome: "missing receipt", status: "unknown" },
    { outcome: "rejected", status: "failed" },
  ])(
    "never repeats an attempted draft after a provider $outcome",
    async ({ outcome, status }) => {
      const fixture = await setup();
      const { backend } = fixture;
      const message = mail();
      const emailId = await ingest(fixture, message);
      const draftStarted = Promise.withResolvers<null>();
      fetchMock.mockImplementation(async (input, init) => {
        if (input === PROFILE_URL) {
          return toolResponse({ emailAddress: OWN_ADDRESS });
        }

        draftStarted.resolve(null);

        if (outcome === "rejected") {
          return new Response("Draft rejected", { status: 400 });
        }

        if (outcome === "missing receipt") {
          return toolResponse({});
        }

        const response = Promise.withResolvers<Response>();
        init?.signal?.addEventListener(
          "abort",
          () => response.reject(new DOMException("Timed out", "AbortError")),
          { once: true }
        );

        return await response.promise;
      });

      const attempt = backend.action(internal.emailWarnings.create, {
        emailId,
      });

      await draftStarted.promise;

      if (outcome === "timeout") {
        await vi.advanceTimersByTimeAsync(30_000);
      }

      await attempt;
      await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
        scamWarningDraft: { draftId: null, status },
      });

      await ingest(fixture, message);
      await backend.action(internal.emailWarnings.create, { emailId });
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
        PROFILE_URL,
        GMAIL_DRAFT_URL,
      ]);
      await expect(warningJobs(backend)).resolves.toHaveLength(1);
      await expect(storedEmail(backend, emailId)).resolves.toMatchObject({
        scamWarningDraft: { draftId: null, status },
      });
    }
  );

  it("ignores a queued source webhook after its connected account changes", async () => {
    const fixture = await setup();
    const { backend, connectionId, ownerId } = fixture;

    const event = {
      connectedAccountId: ACCOUNT_ID,
      eventId: "warning-source-event",
      mail: mail(),
      payload: "{}",
      triggerSlug: "GMAIL_NEW_GMAIL_MESSAGE",
      type: "composio.trigger.message",
    };

    await expect(
      backend.mutation(internal.webhooks.composioEvent, event)
    ).resolves.toBe("processed");
    await backend.run(async (ctx) => {
      await ctx.db.patch(connectionId, {
        externalAccountId: "replacement-account",
      });
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    await expect(
      backend.mutation(internal.webhooks.composioEvent, {
        ...event,
        eventId: "late-warning-source-event",
      })
    ).resolves.toBe("ignored");

    await expect(
      backend.run(
        async (ctx) =>
          await ctx.db
            .query("emails")
            .withIndex("by_owner_received", (index) =>
              index.eq("ownerId", ownerId)
            )
            .collect()
      )
    ).resolves.toStrictEqual([]);
    await expect(warningJobs(backend)).resolves.toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

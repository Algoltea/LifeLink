import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { connectFamily, newBackend, signUp } from "./harness";
import type { Backend, Person } from "./harness";

const photoArgs = () => ({
  allowCloudAnalysis: true,
  contentType: "image/png",
  photo: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer,
  text: null,
});

const owner = async (backend: Backend, demo = false) =>
  await signUp(backend, {
    demo,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

const storedFiles = async (backend: Backend) =>
  await backend.run(
    async (ctx) => await ctx.db.system.query("_storage").collect()
  );

const submittedPhoto = async (person: Person) => {
  const reviewId = await person.action(api.scam.submitPhoto, photoArgs());
  const review = await person.query(api.scam.get, { reviewId });

  if (review.screenshotId === null) {
    throw new Error("Expected the submitted photo.");
  }

  return { reviewId, storageId: review.screenshotId };
};

const modelResult = {
  askTrustedContact: true,
  confidence: "high",
  explanation: "It asks you to send a code.",
  extractedText: "Send your verification code now.",
  imageReadable: true,
  nextSteps: ["Check with someone you trust."],
  signals: [
    {
      detail: "This asks for private details.",
      label: "Asks for a code",
      quote: "Send your verification code now.",
      stance: "requests",
    },
  ],
  verdict: "likely_scam",
};

const seedReview = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  fields: Partial<Doc<"scamReviews">> = {}
) =>
  await backend.run(
    async (ctx) =>
      await ctx.db.insert("scamReviews", {
        askTrustedContact: false,
        cloudAnalysisConsent: true,
        confidence: "low",
        createdAt: Date.now(),
        emailId: null,
        explanation: "",
        inputKind: "screenshot",
        inputText: null,
        mode: "live",
        model: "",
        nextSteps: [],
        ownerId,
        screenshotId: null,
        signals: [],
        status: "reviewing",
        verdict: "unsure",
        verificationTaskId: null,
        ...fields,
      })
  );

/** Model the metadata set by a real storage upload; convex-test storeBlob omits MIME. */
const setUploadMetadata = async (
  backend: Backend,
  storageId: Id<"_storage">,
  contentType: string | null = "image/png",
  size?: number
) =>
  await backend.run(async (ctx) => {
    const fields = {
      contentType: contentType ?? undefined,
      size: size ?? photoArgs().photo.byteLength,
    };

    // @ts-expect-error Seed only convex-test's in-memory system row to match real upload metadata.
    await ctx.db.patch(storageId, fields);
  });

const legacyUpload = async (
  backend: Backend,
  contentType: string | null = "image/png",
  size?: number
) => {
  const storageId = await backend.run(
    async (ctx) =>
      await ctx.storage.store(
        new Blob([photoArgs().photo], { type: contentType ?? "" })
      )
  );

  await setUploadMetadata(backend, storageId, contentType, size);

  return storageId;
};

const fetchMock = vi.fn<typeof fetch>();

describe("scam photo checks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    vi.stubEnv("DEMO_MODE_ALLOWED", "true");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  describe("photo consent and upload boundaries", () => {
    it.each(["consent", "practice", "config"])(
      "stores nothing without %s permission",
      async (boundary) => {
        const backend = newBackend();
        const { person } = await owner(backend, boundary === "practice");

        if (boundary === "config") {
          vi.stubEnv("OPENROUTER_API_KEY", "");
        }

        await expect(
          person.action(api.scam.submitPhoto, {
            ...photoArgs(),
            allowCloudAnalysis: boundary !== "consent",
          })
        ).rejects.toThrow("Reading a photo needs your permission");
        await expect(storedFiles(backend)).resolves.toHaveLength(0);
        expect(fetchMock).not.toHaveBeenCalled();
      }
    );

    it("rejects signed-out users and family before storing", async () => {
      const backend = newBackend();

      const { person } = await signUp(backend, {
        demo: false,
        name: "Linda",
        role: "family",
        subject: "family-1",
      });

      await expect(
        backend.action(api.scam.submitPhoto, photoArgs())
      ).rejects.toThrow("sign in");
      await expect(
        person.action(api.scam.submitPhoto, photoArgs())
      ).rejects.toThrow("account owner");
      await expect(storedFiles(backend)).resolves.toHaveLength(0);
    });

    it.each([
      { contentType: "image/svg+xml", photo: new Uint8Array([1]).buffer },
      { contentType: "image/png", photo: new ArrayBuffer(0) },
      { contentType: "image/png", photo: new ArrayBuffer(6 * 1024 * 1024 + 1) },
    ])("rejects unsupported or oversized photo data", async (invalid) => {
      const backend = newBackend();
      const { person } = await owner(backend);
      await expect(
        person.action(api.scam.submitPhoto, { ...photoArgs(), ...invalid })
      ).rejects.toThrow("under 6 MB");
      await expect(storedFiles(backend)).resolves.toHaveLength(0);
    });

    it("cleans up a stored upload if permission changes before attachment", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      vi.spyOn(
        await import("../convex/integrations/openrouter"),
        "openRouterConfigured"
      )
        .mockReturnValueOnce(true)
        .mockReturnValue(false);
      await expect(
        person.action(api.scam.submitPhoto, photoArgs())
      ).rejects.toThrow("Reading a photo needs your permission");
      await expect(storedFiles(backend)).resolves.toHaveLength(0);
      await expect(person.query(api.scam.list, {})).resolves.toHaveLength(0);
    });
  });

  describe("photo results and deletion", () => {
    it("marks provider failure as unreadable while keeping the photo for retry", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      const { reviewId } = await submittedPhoto(person);
      fetchMock.mockResolvedValue(new Response("Unavailable", { status: 503 }));
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      await expect(
        person.query(api.scam.get, { reviewId })
      ).resolves.toMatchObject({
        extractedText: null,
        imageReadable: false,
        photoUrl: expect.any(String),
        status: "done",
        verdict: "unsure",
      });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
    });

    it("clears an email's cached check so it can be checked again", async () => {
      const backend = newBackend();
      const { id, person } = await owner(backend);

      const emailId = await backend.run(
        async (ctx) =>
          await ctx.db.insert("emails", {
            actionNeeded: null,
            bodyText: "Your statement is ready.",
            connectionId: null,
            fromAddress: "bank@example.com",
            fromName: "Bank",
            mode: "live",
            ownerId: id,
            provider: "gmail",
            providerMessageId: "test-email",
            providerThreadId: null,
            receivedAt: Date.now(),
            selectedForReview: false,
            subject: "Statement",
            summary: null,
            suspicious: false,
          })
      );

      const args = { emailId, screenshotId: null, text: null };
      const reviewId = await person.mutation(api.scam.submit, args);
      await person.mutation(api.scam.remove, { reviewId });
      const email = await backend.run(async (ctx) => await ctx.db.get(emailId));
      expect(email?.scamCheck).toBeUndefined();
      const replacement = await person.mutation(api.scam.submit, args);
      expect(replacement).not.toBe(reviewId);
      await expect(
        person.query(api.scam.get, { reviewId: replacement })
      ).resolves.toMatchObject({ inputKind: "email", status: "done" });
    });

    it("leaves photos registered in the gallery intact", async () => {
      const backend = newBackend();
      const { id, person } = await owner(backend);
      const { reviewId, storageId } = await submittedPhoto(person);
      await backend.run(
        async (ctx) =>
          await ctx.db.insert("photos", {
            caption: null,
            contactId: null,
            contentType: "image/png",
            createdAt: Date.now(),
            ownerId: id,
            sharedWithCircle: false,
            storageId,
            uploadedByProfileId: id,
          })
      );
      await person.mutation(api.scam.remove, { reviewId });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
      await expect(person.query(api.scam.list, {})).resolves.toHaveLength(0);
    });

    it("retains the photo and extracted words after analysis, then deletes both with the check", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      const { reviewId, storageId } = await submittedPhoto(person);
      fetchMock.mockResolvedValue(
        Response.json({
          choices: [{ message: { content: JSON.stringify(modelResult) } }],
          model: "test-vision-model",
        })
      );
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      const review = await person.query(api.scam.get, { reviewId });
      expect(review).toMatchObject({
        confidence: "medium",
        extractedText: modelResult.extractedText,
        imageReadable: true,
        photoUrl: expect.any(String),
        screenshotOwned: true,
        signals: [expect.objectContaining({ evidence: "image_unverified" })],
        status: "done",
      });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
      await person.mutation(api.scam.remove, { reviewId });
      await expect(
        backend.run(async (ctx) => await ctx.storage.get(storageId))
      ).resolves.toBeNull();
      await expect(person.query(api.scam.list, {})).resolves.toHaveLength(0);
      await expect(person.query(api.scam.get, { reviewId })).rejects.toThrow(
        "could not be found"
      );
    });

    it("keeps an explicit unreadable signal and discards invented image claims", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      const { reviewId } = await submittedPhoto(person);
      await backend.mutation(internal.scam.finish, {
        model: "test-model",
        resultJson: JSON.stringify({ ...modelResult, imageReadable: false }),
        reviewId,
      });
      const review = await person.query(api.scam.get, { reviewId });
      expect(review).toMatchObject({
        confidence: "low",
        extractedText: null,
        imageReadable: false,
        signals: [],
        verdict: "unsure",
      });
      expect(review.explanation).toContain("photo could not be read");
      expect(review.photoUrl).not.toBeNull();
    });

    it.each(["practice", "config"])(
      "does not contact the provider if %s changes before analysis",
      async (boundary) => {
        const backend = newBackend();
        const { id, person } = await owner(backend);
        const { reviewId } = await submittedPhoto(person);

        if (boundary === "practice") {
          await backend.run(
            async (ctx) => await ctx.db.patch(id, { demoMode: true })
          );
        } else {
          vi.stubEnv("OPENROUTER_API_KEY", "");
        }

        await backend.finishAllScheduledFunctions(vi.runAllTimers);
        expect(fetchMock).not.toHaveBeenCalled();
        await expect(
          person.query(api.scam.get, { reviewId })
        ).resolves.toMatchObject({ imageReadable: false, status: "done" });
      }
    );

    it.each(["signed out", "stranger", "family"] as const)(
      "blocks %s from previews and deletion",
      async (viewerKind) => {
        const backend = newBackend();
        const { person } = await owner(backend);

        const { family } = await connectFamily(backend, person, [
          "scam_alerts.view",
          "photos.view",
        ]);

        const { person: stranger } = await signUp(backend, {
          demo: false,
          name: "Pat",
          role: "owner",
          subject: "stranger",
        });

        const { reviewId } = await submittedPhoto(person);

        const viewers = { family, "signed out": backend, stranger };
        const viewer = viewers[viewerKind];
        await expect(viewer.query(api.scam.get, { reviewId })).rejects.toThrow(
          /sign in|account owner|could not be found/u
        );
        await expect(
          viewer.mutation(api.scam.remove, { reviewId })
        ).rejects.toThrow(/sign in|account owner|could not be found/u);
        await expect(storedFiles(backend)).resolves.toHaveLength(1);
      }
    );

    it("does not resurrect a check removed while its analysis was pending", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      const { reviewId } = await submittedPhoto(person);
      await person.mutation(api.scam.remove, { reviewId });
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      await backend.mutation(internal.scam.finish, {
        model: "late",
        resultJson: JSON.stringify(modelResult),
        reviewId,
      });
      expect(fetchMock).not.toHaveBeenCalled();
      await expect(storedFiles(backend)).resolves.toHaveLength(0);
      await expect(person.query(api.scam.list, {})).resolves.toHaveLength(0);
    });

    it("never promotes an owned photo reused through the legacy path", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      const { reviewId, storageId } = await submittedPhoto(person);
      await setUploadMetadata(backend, storageId);

      const secondId = await person.mutation(api.scam.submit, {
        allowCloudAnalysis: true,
        emailId: null,
        screenshotId: storageId,
        text: null,
      });

      await expect(
        person.query(api.scam.get, { reviewId: secondId })
      ).resolves.toMatchObject({ photoUrl: null, screenshotOwned: false });
      await person.mutation(api.scam.remove, { reviewId });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
      await person.mutation(api.scam.remove, { reviewId: secondId });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
    });
  });

  describe("legacy upload compatibility", () => {
    it.each([0, 6 * 1024 * 1024])(
      "preserves the original accepted size boundary %i",
      async (size) => {
        const backend = newBackend();
        const { person } = await owner(backend);
        const screenshotId = await legacyUpload(backend, "image/png", size);

        const reviewId = await person.mutation(api.scam.submit, {
          allowCloudAnalysis: true,
          emailId: null,
          screenshotId,
          text: null,
        });

        await expect(
          person.query(api.scam.get, { reviewId })
        ).resolves.toMatchObject({
          photoUrl: null,
          screenshotOwned: false,
          status: "reviewing",
        });
      }
    );

    it("runs the original upload-URL and submit flow without granting preview or deletion", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      await expect(
        person.mutation(api.messages.generatePhotoUploadUrl, {})
      ).resolves.toStrictEqual(expect.any(String));
      const screenshotId = await legacyUpload(backend, "image/gif");

      const reviewId = await person.mutation(api.scam.submit, {
        allowCloudAnalysis: true,
        emailId: null,
        screenshotId,
        text: null,
      });

      fetchMock.mockResolvedValue(
        Response.json({
          choices: [{ message: { content: JSON.stringify(modelResult) } }],
          model: "test-vision",
        })
      );
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      expect(fetchMock).toHaveBeenCalledOnce();
      await expect(
        person.query(api.scam.get, { reviewId })
      ).resolves.toMatchObject({
        extractedText: modelResult.extractedText,
        imageReadable: true,
        photoUrl: null,
        screenshotOwned: false,
        signals: [expect.objectContaining({ evidence: "image_unverified" })],
        status: "done",
      });
      await person.mutation(api.scam.remove, { reviewId });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
      await expect(person.query(api.scam.list, {})).resolves.toHaveLength(0);
    });

    it("analyzes old pending rows with absent provenance without promoting them", async () => {
      const backend = newBackend();
      const { id, person } = await owner(backend);
      const screenshotId = await legacyUpload(backend);
      const reviewId = await seedReview(backend, id, { screenshotId });
      fetchMock.mockResolvedValue(
        Response.json({
          choices: [{ message: { content: JSON.stringify(modelResult) } }],
          model: "test-vision",
        })
      );
      await backend.action(internal.scam.run, { reviewId });
      expect(fetchMock).toHaveBeenCalledOnce();
      const review = await person.query(api.scam.get, { reviewId });
      expect(review).toMatchObject({
        imageReadable: true,
        photoUrl: null,
        status: "done",
      });
      expect(review.screenshotOwned).toBeUndefined();
      await person.mutation(api.scam.remove, { reviewId });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
    });

    it("does not derive legacy ownership from another owner's secure check", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);

      const { person: stranger } = await signUp(backend, {
        demo: false,
        name: "Pat",
        role: "owner",
        subject: "other-owner",
      });

      const { reviewId, storageId } = await submittedPhoto(person);
      await setUploadMetadata(backend, storageId);

      const legacyId = await stranger.mutation(api.scam.submit, {
        allowCloudAnalysis: true,
        emailId: null,
        screenshotId: storageId,
        text: null,
      });

      await expect(
        stranger.query(api.scam.get, { reviewId: legacyId })
      ).resolves.toMatchObject({ photoUrl: null, screenshotOwned: false });
      await stranger.mutation(api.scam.remove, { reviewId: legacyId });
      await expect(storedFiles(backend)).resolves.toHaveLength(1);
      await expect(
        person.query(api.scam.get, { reviewId })
      ).resolves.toMatchObject({
        photoUrl: expect.any(String),
        screenshotOwned: true,
      });
      await person.mutation(api.scam.remove, { reviewId });
      await expect(storedFiles(backend)).resolves.toHaveLength(0);
    });

    it.each(["consent", "practice", "config"])(
      "still rejects legacy submit without %s",
      async (boundary) => {
        const backend = newBackend();
        const { person } = await owner(backend, boundary === "practice");
        const screenshotId = await legacyUpload(backend);

        if (boundary === "config") {
          vi.stubEnv("OPENROUTER_API_KEY", "");
        }

        await expect(
          person.mutation(api.scam.submit, {
            allowCloudAnalysis: boundary !== "consent",
            emailId: null,
            screenshotId,
            text: null,
          })
        ).rejects.toThrow(
          "Reading a photo needs your permission and a cloud AI service, and is not available in Practice mode. Type its words instead."
        );
        expect(fetchMock).not.toHaveBeenCalled();
        await expect(storedFiles(backend)).resolves.toHaveLength(1);
      }
    );

    it.each(["signed out", "family"] as const)(
      "still rejects %s legacy submit",
      async (viewerKind) => {
        const backend = newBackend();

        const { person } = await signUp(backend, {
          demo: false,
          name: "Linda",
          role: "family",
          subject: "family-1",
        });

        const screenshotId = await legacyUpload(backend);
        const viewer = viewerKind === "family" ? person : backend;
        await expect(
          viewer.mutation(api.scam.submit, {
            allowCloudAnalysis: true,
            emailId: null,
            screenshotId,
            text: null,
          })
        ).rejects.toThrow(/sign in|account owner/u);
        expect(fetchMock).not.toHaveBeenCalled();
      }
    );

    it.each([
      { contentType: "text/plain", size: 8 },
      { contentType: null, size: 8 },
      { contentType: "image/png", size: 6 * 1024 * 1024 + 1 },
    ])(
      "keeps the original legacy metadata checks: %j",
      async ({ contentType, size }) => {
        const backend = newBackend();
        const { person } = await owner(backend);
        const screenshotId = await legacyUpload(backend, contentType, size);
        await expect(
          person.mutation(api.scam.submit, {
            allowCloudAnalysis: true,
            emailId: null,
            screenshotId,
            text: null,
          })
        ).rejects.toThrow("Please choose a photo under 6 MB.");
        await expect(storedFiles(backend)).resolves.toHaveLength(1);
        expect(fetchMock).not.toHaveBeenCalled();
      }
    );

    it("rejects a missing legacy upload", async () => {
      const backend = newBackend();
      const { person } = await owner(backend);
      const screenshotId = await legacyUpload(backend);
      await backend.run(async (ctx) => await ctx.storage.delete(screenshotId));
      await expect(
        person.mutation(api.scam.submit, {
          allowCloudAnalysis: true,
          emailId: null,
          screenshotId,
          text: null,
        })
      ).rejects.toThrow("Please choose a photo under 6 MB.");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(["consent", "practice", "config"])(
      "still refuses legacy analysis without %s",
      async (boundary) => {
        const backend = newBackend();
        const { id, person } = await owner(backend);
        const screenshotId = await legacyUpload(backend);

        const reviewId = await seedReview(backend, id, {
          cloudAnalysisConsent: boundary !== "consent",
          mode: boundary === "practice" ? "simulated" : "live",
          screenshotId,
        });

        if (boundary === "config") {
          vi.stubEnv("OPENROUTER_API_KEY", "");
        }

        await backend.action(internal.scam.run, { reviewId });
        expect(fetchMock).not.toHaveBeenCalled();
        await expect(
          person.query(api.scam.get, { reviewId })
        ).resolves.toMatchObject({
          imageReadable: false,
          photoUrl: null,
          status: "done",
        });
        await expect(storedFiles(backend)).resolves.toHaveLength(1);
      }
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { connectFamily, newBackend, signUp } from "./harness";
import type { Backend } from "./harness";

const fetchMock = vi.fn<typeof fetch>();

const setup = async () => {
  const backend = newBackend();

  const { id, person } = await signUp(backend, {
    demo: false,
    name: "Ruth",
    role: "owner",
    subject: "inbox-owner",
  });

  return { backend, owner: person, ownerId: id };
};

const addEmail = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  index: number,
  overrides: Partial<
    Pick<
      Doc<"emails">,
      | "bodyText"
      | "mode"
      | "receivedAt"
      | "subject"
      | "fromAddress"
      | "fromName"
    >
  > = {}
) =>
  await backend.run(
    async (ctx) =>
      await ctx.db.insert("emails", {
        actionNeeded: null,
        bodyText: "Please reply to confirm dinner.",
        connectionId: null,
        fromAddress: "sam@example.com",
        fromName: "Sam",
        mode: "live",
        ownerId,
        provider: "gmail",
        providerMessageId: `mail-${index}`,
        providerThreadId: null,
        receivedAt: 1000 + index,
        selectedForReview: false,
        subject: `Message ${index}`,
        summary: null,
        suspicious: null,
        ...overrides,
      })
  );

const addConnection = async (backend: Backend, ownerId: Id<"profiles">) =>
  await backend.run(
    async (ctx) =>
      await ctx.db.insert("connections", {
        accountLabel: "ruth@example.com",
        connectedAt: Date.now(),
        externalAccountId: "mail-account",
        lastError: null,
        mode: "live",
        ownerId,
        pendingAttemptId: null,
        provider: "gmail",
        status: "active",
        updatedAt: Date.now(),
      })
  );

describe("email inbox", () => {
  beforeEach(() => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(new Response("Unavailable", { status: 503 }));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });
  describe("bounded inbox pages", () => {
    it("returns 15 emails per page without losing messages with equal timestamps", async () => {
      const { backend, ownerId, owner } = await setup();

      const ids = await Promise.all(
        Array.from(
          { length: 32 },
          async (_, index) =>
            await addEmail(backend, ownerId, index, { receivedAt: 1000 })
        )
      );

      const first = await owner.query(api.emails.page, {
        paginationOpts: { cursor: null, numItems: 15 },
      });

      const second = await owner.query(api.emails.page, {
        paginationOpts: { cursor: first.continueCursor, numItems: 15 },
      });

      const third = await owner.query(api.emails.page, {
        paginationOpts: { cursor: second.continueCursor, numItems: 15 },
      });

      expect([
        first.page.length,
        second.page.length,
        third.page.length,
      ]).toStrictEqual([15, 15, 2]);
      expect(third.isDone).toBeTruthy();
      expect(
        new Set(
          [...first.page, ...second.page, ...third.page].map(
            (email) => email.id
          )
        )
      ).toStrictEqual(new Set(ids));
      await expect(
        owner.query(api.emails.page, {
          paginationOpts: { cursor: null, numItems: 1000 },
        })
      ).rejects.toThrow(/pages of 15/u);
    });

    it("can continue from a full last page after older provider mail is imported", async () => {
      const { backend, ownerId, owner } = await setup();
      await Promise.all(
        Array.from(
          { length: 15 },
          async (_, index) => await addEmail(backend, ownerId, index)
        )
      );

      const first = await owner.query(api.emails.page, {
        paginationOpts: { cursor: null, numItems: 15 },
      });

      const olderId = await addEmail(backend, ownerId, -1);

      const updated = await owner.query(api.emails.page, {
        paginationOpts: { cursor: null, numItems: 15 },
      });

      const older = await owner.query(api.emails.page, {
        paginationOpts: { cursor: updated.continueCursor, numItems: 15 },
      });

      expect(first.isDone).toBeTruthy();
      expect(older.page.map((email) => email.id)).toStrictEqual([olderId]);
    });

    it("limits all inbox reads and safety checks to the owner", async () => {
      const { backend, ownerId, owner } = await setup();
      const id = await addEmail(backend, ownerId, 1);

      const { person: stranger } = await signUp(backend, {
        demo: false,
        name: "Other",
        role: "owner",
        subject: "stranger",
      });

      const { family } = await connectFamily(backend, owner, [
        "scam_alerts.view",
      ]);

      await expect(
        stranger.query(api.emails.selectedRow, { emailId: id })
      ).resolves.toBeNull();
      await expect(
        stranger.mutation(api.emails.checkRecent, { emailIds: [id] })
      ).rejects.toThrow(/could not be found/u);
      await expect(
        family.query(api.emails.page, {
          paginationOpts: { cursor: null, numItems: 15 },
        })
      ).rejects.toThrow(/Only the account owner/u);

      const otherPage = await stranger.query(api.emails.page, {
        paginationOpts: { cursor: null, numItems: 15 },
      });

      expect(otherPage.page).toStrictEqual([]);
    });
  });

  describe("private recent email overview", () => {
    it("uses only exact trusted email addresses and gives image-only mail the same priority in both views", async () => {
      const { backend, ownerId, owner } = await setup();

      const known = await addEmail(backend, ownerId, 1, {
        bodyText: "Some news from home for you to read when you have a moment.",
        subject: "A family update",
      });

      const spoof = await addEmail(backend, ownerId, 2, {
        bodyText: "Some news from home for you to read when you have a moment.",
        fromAddress: "different@example.com",
        subject: "A family update",
      });

      const image = await addEmail(backend, ownerId, 3, {
        bodyText: "[image: IMG_1234.jpg]",
        subject: "(no subject)",
      });

      await owner.mutation(api.emails.checkRecent, {});
      await owner.mutation(api.contacts.create, {
        channels: [
          { address: "SAM@example.com", channel: "email", preferred: true },
        ],
        name: "Sam",
        relationship: "Family",
        trusted: true,
      });
      const overview = await owner.query(api.inbox.recent, {});

      const page = await owner.query(api.emails.page, {
        paginationOpts: { cursor: null, numItems: 15 },
      });

      expect(overview.items.find((item) => item.id === known)?.reason).toMatch(
        /Trusted circle/u
      );
      expect(
        overview.items.find((item) => item.id === spoof)?.reason
      ).not.toMatch(/Trusted circle/u);
      expect(overview.items.find((item) => item.id === image)?.category).toBe(
        "low_priority"
      );
      expect(page.page.find((item) => item.id === image)?.priority).toBe(
        "low_priority"
      );
    });

    it("returns a consented cloud overview tied to the current inbox snapshot", async () => {
      const { backend, ownerId, owner } = await setup();
      const id = await addEmail(backend, ownerId, 1);
      await owner.mutation(api.emails.checkRecent, {});
      const before = await owner.query(api.inbox.recent, {});
      fetchMock.mockResolvedValueOnce(
        Response.json(
          {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    items: [
                      {
                        category: "reply",
                        id,
                        quote: "Please reply",
                        reason: "A response may be needed.",
                        summary: "Sam asks you to confirm dinner.",
                      },
                    ],
                    summary: "One recent email asks about dinner plans.",
                  }),
                },
              },
            ],
            model: "test-model",
          },
          { status: 200 }
        )
      );

      const result = await owner.action(api.inbox.summarize, {
        allowCloudAnalysis: true,
      });

      expect(result).toMatchObject({
        key: before.key,
        method: "cloud",
        summary: "One recent email asks about dinner plans.",
      });
      expect(result.items[0]).toMatchObject({
        category: "reply",
        id,
        quote: "Please reply",
      });
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("covers only the newest 15 emails and changes its key when recent mail changes", async () => {
      const { backend, ownerId, owner } = await setup();
      await Promise.all(
        Array.from(
          { length: 17 },
          async (_, index) => await addEmail(backend, ownerId, index)
        )
      );
      await owner.mutation(api.emails.checkRecent, {});
      const before = await owner.query(api.inbox.recent, {});
      await addEmail(backend, ownerId, 18);
      const after = await owner.query(api.inbox.recent, {});
      expect(before.items).toHaveLength(15);
      expect(
        before.items.some((item) => item.subject === "Message 0")
      ).toBeFalsy();
      expect(
        before.items.every((item) => item.category === "reply")
      ).toBeTruthy();
      expect(after.key).not.toBe(before.key);
    });

    it("keeps cloud analysis opt-in and never sends Practice emails", async () => {
      const { backend, ownerId, owner } = await setup();
      await addEmail(backend, ownerId, 1);

      const local = await owner.action(api.inbox.summarize, {
        allowCloudAnalysis: false,
      });

      await addEmail(backend, ownerId, 2, { mode: "simulated" });

      const practice = await owner.action(api.inbox.summarize, {
        allowCloudAnalysis: true,
      });

      expect(local.method).toBe("local");
      expect(practice.note).toMatch(/Practice/u);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("falls back honestly after cloud failure and denies family or anonymous analysis", async () => {
      const { backend, ownerId, owner } = await setup();
      await addEmail(backend, ownerId, 1);

      const result = await owner.action(api.inbox.summarize, {
        allowCloudAnalysis: true,
      });

      const { family } = await connectFamily(backend, owner, [
        "scam_alerts.view",
      ]);

      expect(result.note).toMatch(/may have received/u);
      expect(result.items).toHaveLength(1);
      await expect(family.query(api.inbox.recent, {})).rejects.toThrow(
        /Only the account owner/u
      );
      await expect(
        backend.action(api.inbox.summarize, { allowCloudAnalysis: true })
      ).rejects.toThrow(/sign in/u);
    });
  });

  describe("provider continuation state", () => {
    it("preserves an older cursor on refresh, rejects stale pages, and resets for a reconnected account", async () => {
      const { backend, ownerId } = await setup();
      const connectionId = await addConnection(backend, ownerId);

      const args = {
        accountId: "mail-account",
        connectionId,
        messages: [],
        ownerId,
        provider: "gmail" as const,
      };

      await backend.mutation(internal.emails.storeMailPage, {
        ...args,
        expectedCursor: null,
        nextCursor: "page-2",
        older: false,
      });
      await backend.mutation(internal.emails.storeMailPage, {
        ...args,
        expectedCursor: "page-2",
        nextCursor: "page-3",
        older: true,
      });
      await backend.mutation(internal.emails.storeMailPage, {
        ...args,
        expectedCursor: null,
        nextCursor: "different-page-2",
        older: false,
      });

      const connection = await backend.run(
        async (ctx) => await ctx.db.get(connectionId)
      );

      expect(connection?.mailPaging?.nextCursor).toBe("page-3");
      await expect(
        backend.mutation(internal.emails.storeMailPage, {
          ...args,
          expectedCursor: "page-2",
          nextCursor: "page-4",
          older: true,
        })
      ).resolves.toBe(0);
      await backend.run(async (ctx) => {
        await ctx.db.patch(connectionId, { externalAccountId: "new-account" });
      });
      await expect(
        backend.mutation(internal.emails.storeMailPage, {
          ...args,
          expectedCursor: "page-3",
          nextCursor: null,
          older: true,
        })
      ).rejects.toThrow(/mailbox changed/u);
    });
  });
});

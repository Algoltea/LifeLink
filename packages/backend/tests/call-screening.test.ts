import type { CallFlag } from "@lifelink/contracts/call-screening";
import { describe, expect, it } from "vitest";

import { api } from "../convex/_generated/api";
import { connectFamily, newBackend, signUp } from "./harness";
import type { Backend } from "./harness";

interface SummaryInput {
  durationMs: number;
  flags: CallFlag[];
  interrupted: boolean;
  practice: boolean;
  sessionId: string;
  startedAt: number;
}

const MAX_DURATION_MS = 30 * 60_000;

const flag = (overrides: Partial<CallFlag> = {}): CallFlag => ({
  captionId: "caption-one",
  id: "caption-one:credentials-request",
  quote: "Read me the verification code.",
  reason: "A request to share a verification code.",
  timeMs: 1000,
  ...overrides,
});

const summary = (overrides: Partial<SummaryInput> = {}): SummaryInput => ({
  durationMs: 24_000,
  flags: [flag()],
  interrupted: false,
  practice: false,
  sessionId: "call-one",
  startedAt: Date.now() - 24_000,
  ...overrides,
});

const owner = async (
  backend: Backend,
  { demo = false, subject = "owner-one" } = {}
) =>
  await signUp(backend, {
    demo,
    name: "Ruth Alvarez",
    role: "owner",
    subject,
  });

describe("private call summaries", () => {
  it.each(["anonymous", "not onboarded", "family"] as const)(
    "rejects %s access to all summary functions",
    async (viewer) => {
      const backend = newBackend();
      const { person } = await owner(backend);

      const summaryId = await person.mutation(
        api.callscreening.save,
        summary()
      );

      const { family } = await connectFamily(backend, person, [
        "scam_alerts.view",
      ]);

      let caller = backend;

      if (viewer === "not onboarded") {
        caller = backend.withIdentity({ subject: "new-user" });
      } else if (viewer === "family") {
        caller = family;
      }

      const error = viewer === "family" ? /owner_only/u : /not_signed_in/u;
      await expect(
        caller.mutation(api.callscreening.save, summary())
      ).rejects.toThrow(error);
      await expect(caller.query(api.callscreening.list, {})).rejects.toThrow(
        error
      );
      await expect(
        caller.query(api.callscreening.get, { summaryId })
      ).rejects.toThrow(error);
      await expect(
        caller.mutation(api.callscreening.remove, { summaryId })
      ).rejects.toThrow(error);

      await expect(
        person.query(api.callscreening.list, {})
      ).resolves.toHaveLength(1);
    }
  );

  it("isolates owners even when they use the same session ID", async () => {
    const backend = newBackend();
    const { id: firstOwnerId, person: first } = await owner(backend);

    const { id: secondOwnerId, person: second } = await owner(backend, {
      subject: "owner-two",
    });

    const firstId = await first.mutation(api.callscreening.save, summary());

    await expect(
      second.query(api.callscreening.list, {})
    ).resolves.toStrictEqual([]);
    await expect(
      second.query(api.callscreening.get, { summaryId: firstId })
    ).rejects.toThrow(/not_found/u);
    await expect(
      second.mutation(api.callscreening.remove, { summaryId: firstId })
    ).rejects.toThrow(/not_found/u);

    const secondId = await second.mutation(api.callscreening.save, summary());
    await expect(
      first.query(api.callscreening.list, {})
    ).resolves.toMatchObject([{ _id: firstId, ownerId: firstOwnerId }]);
    await expect(
      second.query(api.callscreening.list, {})
    ).resolves.toMatchObject([{ _id: secondId, ownerId: secondOwnerId }]);
  });

  it("returns the original summary unchanged on retries", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);
    const input = summary();
    const summaryId = await person.mutation(api.callscreening.save, input);
    const original = await person.query(api.callscreening.get, { summaryId });

    await person.mutation(api.profiles.setDemoMode, { enabled: true });

    const retryId = await person.mutation(api.callscreening.save, {
      ...input,
      durationMs: 1000,
      flags: [],
      interrupted: true,
      practice: true,
    });

    expect(retryId).toBe(summaryId);
    await expect(
      person.query(api.callscreening.get, { summaryId })
    ).resolves.toStrictEqual(original);
    await expect(
      person.query(api.callscreening.list, {})
    ).resolves.toHaveLength(1);
  });

  it("redacts sensitive numbers in both quotes and reasons before storage", async () => {
    const backend = newBackend();
    const { id, person } = await owner(backend);

    const input = summary({
      flags: [
        flag({
          quote: "Code 123456; card 4111 1111 1111 1111; phone 212-555-0123.",
          reason: "Account 12-34-56; keep 123 and 42.",
        }),
      ],
      interrupted: true,
    });

    const summaryId = await person.mutation(api.callscreening.save, input);

    const stored = await backend.run(
      async (ctx) => await ctx.db.get(summaryId)
    );

    expect(stored).toStrictEqual({
      _creationTime: expect.any(Number),
      _id: summaryId,
      createdAt: expect.any(Number),
      durationMs: input.durationMs,
      flags: [
        flag({
          quote: "Code ••••; card ••••; phone ••••.",
          reason: "Account ••••; keep 123 and 42.",
        }),
      ],
      interrupted: true,
      mode: "live",
      ownerId: id,
      sessionId: input.sessionId,
      startedAt: input.startedAt,
    });
  });

  it.each(["123\n456", "123‑456", "１２３４", "𝟙𝟚𝟛𝟜"])(
    "redacts grouped or Unicode secret %j before storage",
    async (secret) => {
      const backend = newBackend();
      const { person } = await owner(backend);

      const summaryId = await person.mutation(
        api.callscreening.save,
        summary({ flags: [flag({ quote: `Code ${secret}`, reason: secret })] })
      );

      const stored = await backend.run(
        async (ctx) => await ctx.db.get(summaryId)
      );

      expect(stored?.flags[0]).toMatchObject({
        quote: "Code ••••",
        reason: "••••",
      });
    }
  );

  it.each(["transcript", "audio", "ownerId", "mode"])(
    "rejects an unexpected %s argument without saving anything",
    async (argument) => {
      const backend = newBackend();
      const { person } = await owner(backend);
      const input = { ...summary(), [argument]: "must not be accepted" };

      await expect(
        person.mutation(api.callscreening.save, input)
      ).rejects.toThrow(/unexpected|extra|validator|field/iu);
      await expect(
        person.query(api.callscreening.list, {})
      ).resolves.toStrictEqual([]);
    }
  );

  it("rejects transcript content added to a flag", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);
    const input = summary();
    const unexpectedFlag = { ...flag(), transcript: "The full conversation" };

    await expect(
      person.mutation(api.callscreening.save, {
        ...input,
        flags: [unexpectedFlag],
      })
    ).rejects.toThrow(/unexpected|extra|validator|field/iu);
    await expect(
      person.query(api.callscreening.list, {})
    ).resolves.toStrictEqual([]);
  });

  it.each([
    { demo: false, mode: "live", practice: false },
    { demo: false, mode: "simulated", practice: true },
    { demo: true, mode: "simulated", practice: false },
    { demo: true, mode: "simulated", practice: true },
  ])(
    "stores $mode for demo=$demo, practice=$practice",
    async ({ demo, mode, practice }) => {
      const backend = newBackend();
      const { person } = await owner(backend, { demo });

      const summaryId = await person.mutation(
        api.callscreening.save,
        summary({ practice })
      );

      await expect(
        person.query(api.callscreening.get, { summaryId })
      ).resolves.toMatchObject({
        mode,
      });
    }
  );

  it("returns only the newest 50 summaries in insertion order", async () => {
    const backend = newBackend();
    const { id, person } = await owner(backend);

    const ids = await backend.run(async (ctx) => {
      const inserted = [];

      for (let index = 0; index < 55; index += 1) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- insertion order is under test.
        const summaryId = await ctx.db.insert("scamCallSummaries", {
          createdAt: Date.now(),
          durationMs: 0,
          flags: [],
          interrupted: false,
          mode: "live",
          ownerId: id,
          sessionId: `call-${index}`,
          startedAt: Date.now() - index * 60_000,
        });

        inserted.push(summaryId);
      }

      return inserted;
    });

    const recent = await person.query(api.callscreening.list, {});
    expect(recent.map((item) => item._id)).toStrictEqual(
      ids.slice(-50).toReversed()
    );
  });

  it("deletes a saved summary and creates no action or approval", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);
    const summaryId = await person.mutation(api.callscreening.save, summary());

    await expect(
      person.mutation(api.callscreening.remove, { summaryId })
    ).resolves.toBeNull();
    await expect(
      person.query(api.callscreening.list, {})
    ).resolves.toStrictEqual([]);
    await expect(
      person.query(api.callscreening.get, { summaryId })
    ).rejects.toThrow(/not_found/u);
    await expect(
      person.mutation(api.callscreening.remove, { summaryId })
    ).rejects.toThrow(/not_found/u);

    const effects = await backend.run(async (ctx) => ({
      actions: await ctx.db.query("actions").take(1),
      approvals: await ctx.db.query("approvals").take(1),
      summary: await ctx.db.get(summaryId),
      tasks: await ctx.db.query("tasks").take(1),
    }));

    expect(effects).toStrictEqual({
      actions: [],
      approvals: [],
      summary: null,
      tasks: [],
    });
  });
});

describe("call summary bounds", () => {
  it.each([
    { startedAt: -1 },
    { startedAt: Number.NaN },
    { startedAt: Number.POSITIVE_INFINITY },
    { startedAt: Number.MAX_SAFE_INTEGER },
    { durationMs: -1 },
    { durationMs: Number.NaN },
    { durationMs: Number.POSITIVE_INFINITY },
    { durationMs: MAX_DURATION_MS + 1 },
    { sessionId: "" },
    { sessionId: "   " },
    { sessionId: "s".repeat(101) },
    { flags: Array.from({ length: 21 }, () => flag()) },
  ])("rejects invalid summary fields %j", async (overrides) => {
    const backend = newBackend();
    const { person } = await owner(backend);

    await expect(
      person.mutation(api.callscreening.save, summary(overrides))
    ).rejects.toThrow(/invalid/u);
    await expect(
      person.query(api.callscreening.list, {})
    ).resolves.toStrictEqual([]);
  });

  it("rejects start times beyond the clock skew allowance", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);

    await expect(
      person.mutation(
        api.callscreening.save,
        summary({ startedAt: Date.now() + 10 * 60_000 })
      )
    ).rejects.toThrow(/invalid/u);
  });

  it.each([
    { id: "" },
    { id: "i".repeat(101) },
    { captionId: " " },
    { captionId: "c".repeat(101) },
    { quote: " " },
    { quote: "q".repeat(301) },
    { reason: "" },
    { reason: "r".repeat(141) },
    { timeMs: -1 },
    { timeMs: Number.NaN },
    { timeMs: Number.POSITIVE_INFINITY },
    { timeMs: 24_001 },
  ])("rejects invalid flag fields %j", async (overrides) => {
    const backend = newBackend();
    const { person } = await owner(backend);

    await expect(
      person.mutation(
        api.callscreening.save,
        summary({ flags: [flag(overrides)] })
      )
    ).rejects.toThrow(/invalid/u);
    await expect(
      person.query(api.callscreening.list, {})
    ).resolves.toStrictEqual([]);
  });

  it("accepts exact upper limits", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);

    const input = summary({
      durationMs: MAX_DURATION_MS,
      flags: Array.from({ length: 20 }, (_, index) =>
        flag({
          captionId: "c".repeat(100),
          id: `${index}`.padEnd(100, "i"),
          quote: "q".repeat(300),
          reason: "r".repeat(140),
          timeMs: MAX_DURATION_MS,
        })
      ),
      sessionId: "s".repeat(100),
      startedAt: Date.now() - MAX_DURATION_MS,
    });

    const summaryId = await person.mutation(api.callscreening.save, input);

    await expect(
      person.query(api.callscreening.get, { summaryId })
    ).resolves.toMatchObject({
      durationMs: input.durationMs,
      flags: input.flags,
      sessionId: input.sessionId,
    });
  });

  it("accepts an interrupted session with no captions and zero duration", async () => {
    const backend = newBackend();
    const { person } = await owner(backend);

    const summaryId = await person.mutation(
      api.callscreening.save,
      summary({ durationMs: 0, flags: [], interrupted: true, startedAt: 0 })
    );

    await expect(
      person.query(api.callscreening.get, { summaryId })
    ).resolves.toMatchObject({
      durationMs: 0,
      flags: [],
      interrupted: true,
      startedAt: 0,
    });
  });
});

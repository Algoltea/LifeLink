import { describe, expect, it } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { DAY, newBackend, ownerWithContact, signUp } from "./harness";
import type { Backend } from "./harness";

const briefingLines = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  dateKey: string
): Promise<string[]> => {
  await backend.action(internal.briefings.generate, { dateKey, ownerId });

  const briefing = await backend.run(
    async (ctx) =>
      await ctx.db
        .query("briefings")
        .withIndex("by_owner_date", (index) =>
          index.eq("ownerId", ownerId).eq("dateKey", dateKey)
        )
        .first()
  );

  return briefing?.lines ?? [];
};

describe("how I like help", () => {
  it("saves short or detailed help and one step at a time", async () => {
    const backend = newBackend();

    const { person } = await signUp(backend, {
      demo: false,
      name: "Ruth Alvarez",
      role: "owner",
      subject: "owner-1",
    });

    await person.mutation(api.profiles.updatePreferences, {
      explanationDetail: "detailed",
      stepByStep: true,
    });

    const me = await person.query(api.profiles.me, {});

    expect(me?.preferences).toMatchObject({
      explanationDetail: "detailed",
      stepByStep: true,
    });
  });

  it("keeps a short briefing to the few things that matter most", async () => {
    const backend = newBackend();

    const {
      contactId,
      owner: person,
      ownerId: id,
    } = await ownerWithContact(backend, false);

    // Something waiting for approval gives the briefing one more thing to say.
    await person.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });

    await person.mutation(api.appointments.create, {
      location: null,
      notes: null,
      startsAt: Date.now() + DAY,
      title: "Dr. Lee",
    });

    await backend.run(async (ctx) => {
      // Reminders later today, so the briefing has more to say than short help allows.
      for (const minutes of [1, 2, 3]) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- a few fixed test rows.
        await ctx.db.insert("reminders", {
          createdAt: Date.now(),
          dismissedAt: null,
          firedAt: null,
          mode: "live",
          ownerId: id,
          remindAt: Date.now() + minutes * 60_000,
          scheduledJobId: null,
          shareWithCircle: false,
          sourceActionId: null,
          title: `Take a short walk ${minutes}`,
        });
      }
    });

    const short = await briefingLines(backend, id, "short");

    await person.mutation(api.profiles.updatePreferences, {
      explanationDetail: "detailed",
    });

    const detailed = await briefingLines(backend, id, "detailed");

    expect(short.length).toBeLessThanOrEqual(3);
    expect(detailed.length).toBeGreaterThan(short.length);
  });
});

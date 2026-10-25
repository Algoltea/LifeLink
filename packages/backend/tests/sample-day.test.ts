import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { newBackend, signUp } from "./harness";

describe("a fuller practice day", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds messages, emails, and appointments once, even when practice is set up again", async () => {
    const backend = newBackend();

    const { id: ownerId, person: owner } = await signUp(backend, {
      demo: true,
      name: "Ruth Alvarez",
      role: "owner",
      subject: "owner-1",
    });

    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    await backend.mutation(internal.demo.seed, { ownerId });

    const contacts = await owner.query(api.contacts.list, {});
    const emails = await owner.query(api.emails.list, {});
    const upcoming = await owner.query(api.appointments.upcoming, { days: 30 });

    expect(
      contacts.filter(({ name }) => name === "Rosa Martinez")
    ).toHaveLength(1);
    expect(
      emails.filter(({ subject }) => subject.includes("ready for pickup"))
    ).toHaveLength(1);
    const titles = new Set(upcoming.map(({ title }) => title));

    expect(
      ["Dr. Patel", "Plumber visit", "Dentist"].every((title) =>
        titles.has(title)
      )
    ).toBeTruthy();
  });
});

import { describe, expect, it } from "vitest";

import { api } from "../convex/_generated/api";
import { newBackend, ownerWithContact } from "./harness";

describe("messages list", () => {
  it("counts the messages to each person that still need approval", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);

    const before = await owner.query(api.messages.threads, {});

    expect(before.find((row) => row.contact.id === contactId)?.waiting).toBe(0);

    await owner.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });
    await owner.mutation(api.messages.draft, {
      body: "Are you free on Sunday?",
      contactId,
      photoIds: [],
    });

    const after = await owner.query(api.messages.threads, {});

    expect(after.find((row) => row.contact.id === contactId)?.waiting).toBe(2);
  });
});

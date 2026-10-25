import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { describe, expect, it } from "vitest";

import { conversationItems, dividerLabel, previewOf } from "./message-bits";
import type { Message } from "./message-bits";

const timestamp = Date.UTC(2026, 9, 24, 16);

const message: Message = {
  _creationTime: timestamp,
  // SAFETY: fixed test identifiers; no backend calls use them.
  _id: "message-test" as Id<"messages">,
  actionId: null,
  body: "I'll meet you at noon.",
  channel: "in_app",
  // SAFETY: fixed test identifiers; no backend calls use them.
  contactId: "contact-test" as Id<"contacts">,
  createdAt: timestamp,
  direction: "outgoing",
  mode: "simulated",
  // SAFETY: fixed test identifiers; no backend calls use them.
  ownerId: "owner-test" as Id<"profiles">,
  photoIds: [],
  providerMessageId: null,
  status: "sent",
  statusUpdatedAt: timestamp,
  taskId: null,
};

describe("localized chat content", () => {
  it("uses the supplied language for every timestamp divider", () => {
    const timeZone = "America/New_York";

    expect(dividerLabel(timestamp, timeZone, timestamp, "en")).toBe(
      "Today at 12:00 PM"
    );
    expect(dividerLabel(timestamp, timeZone, timestamp, "es")).toMatch(
      /^Hoy a las /u
    );
    expect(
      dividerLabel(Date.UTC(2026, 9, 21, 16), timeZone, timestamp, "es")
    ).toMatch(/^miércoles a las /u);
    expect(
      dividerLabel(Date.UTC(2026, 8, 1, 16), timeZone, timestamp, "es")
    ).toContain("sept");
  });

  it("updates conversation labels without rewriting saved messages", () => {
    const messages = [message];

    const english = conversationItems(
      messages,
      "America/New_York",
      timestamp,
      "en"
    );

    const spanish = conversationItems(
      messages,
      "America/New_York",
      timestamp,
      "es"
    );

    expect(english[0]?.divider).toMatch(/^Today at /u);
    expect(spanish[0]?.divider).toMatch(/^Hoy a las /u);
    expect(spanish[0]?.message).toBe(message);
    expect({
      english: previewOf(message, "en"),
      spanish: previewOf(message, "es"),
    }).toStrictEqual({
      english: "You: I'll meet you at noon.",
      spanish: "Usted: I'll meet you at noon.",
    });
  });
});

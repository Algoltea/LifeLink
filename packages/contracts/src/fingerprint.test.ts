import { describe, expect, it } from "vitest";

import { consequentialDetails } from "./actions";
import type { SendMessageDetails } from "./actions";
import { canonicalize, fingerprint } from "./fingerprint";

const message: SendMessageDetails = {
  address: "+15555550142",
  body: "Could you drive me on Tuesday?",
  channel: "imessage",
  contactId: "contact_1",
  contactName: "Sam Alvarez",
  kind: "send_message",
  photoIds: ["b", "a"],
};

describe("canonical fingerprints", () => {
  it("does not depend on key order", async () => {
    expect(canonicalize({ a: 1, b: [true, null] })).toBe(
      canonicalize({ a: 1, b: [true, null] })
    );
    await expect(fingerprint({ a: 1, b: "x" })).resolves.toBe(
      await fingerprint({ a: 1, b: "x" })
    );
  });

  it("drops undefined fields and treats non-finite numbers as null", () => {
    expect(canonicalize({ a: undefined, b: 1 })).toBe('{"b":1}');
    expect(canonicalize({ a: Number.NaN })).toBe('{"a":null}');
  });

  it("ignores display-only labels such as the contact's name", async () => {
    const renamed = await fingerprint(
      consequentialDetails({ ...message, contactName: "Sam A." })
    );

    expect(renamed).toBe(await fingerprint(consequentialDetails(message)));
  });

  it("normalises address case and spacing, and photo order", async () => {
    const variant = await fingerprint(
      consequentialDetails({
        ...message,
        address: "  +15555550142 ",
        photoIds: ["a", "b"],
      })
    );

    expect(variant).toBe(await fingerprint(consequentialDetails(message)));
  });

  it("changes when the words, recipient, or time change", async () => {
    const original = await fingerprint(consequentialDetails(message));

    const reworded = await fingerprint(
      consequentialDetails({
        ...message,
        body: "Could you drive me on Wednesday?",
      })
    );

    const otherPerson = await fingerprint(
      consequentialDetails({ ...message, contactId: "contact_2" })
    );

    const reminder = await fingerprint(
      consequentialDetails({
        kind: "create_reminder",
        remindAt: 1000,
        shareWithCircle: false,
        title: "Pickup",
      })
    );

    const later = await fingerprint(
      consequentialDetails({
        kind: "create_reminder",
        remindAt: 2000,
        shareWithCircle: false,
        title: "Pickup",
      })
    );

    expect(reworded).not.toBe(original);
    expect(otherPerson).not.toBe(original);
    expect(later).not.toBe(reminder);
  });
});

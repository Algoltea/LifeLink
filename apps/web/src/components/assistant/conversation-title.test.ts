import { describe, expect, it } from "vitest";

import { conversationTitleFor } from "./conversation-title";

describe("conversation title language", () => {
  it.each(["Wait for an answer", "New conversation"])(
    "preserves the first request even when it matches a catalog entry: %s",
    (title) => {
      const conversation = { hasMessages: true, title };

      expect(conversationTitleFor(conversation, "en")).toBe(title);
      expect(conversationTitleFor(conversation, "es")).toBe(title);
    }
  );

  it("translates the generated label for an empty conversation", () => {
    const conversation = { hasMessages: false, title: "New conversation" };

    expect(conversationTitleFor(conversation, "en")).toBe("New conversation");
    expect(conversationTitleFor(conversation, "es")).toBe("Nueva conversación");
  });
});

import { describe, expect, it } from "vitest";

import {
  PRIVATE_INBOX_OPTIONS,
  formatInboxChatSummary,
  withoutPrivateInboxSummaries,
} from "./inbox-chat";
import type { InboxChatSummary } from "./inbox-chat";

const summary = (): InboxChatSummary => ({
  items: [
    {
      category: "low_priority",
      id: "news",
      quote: null,
      reason: "Optional newsletter.",
      sender: "Daily news",
      subject: "Updates",
      summary: "A weekly newsletter.",
    },
    {
      category: "check_first",
      id: "warning",
      quote: null,
      reason: "Warning signs found.",
      sender: "Unknown",
      subject: "Payment",
      summary: "A payment request.",
    },
    {
      category: "reply",
      id: "dinner",
      quote: "Please reply",
      reason: "A reply may be needed.",
      sender: "Sam",
      subject: "Dinner plans",
      summary: "Sam asks about dinner.",
    },
  ],
  method: "local",
  note: "Made in LifeLink.",
  practice: true,
  summary: null,
});

describe("email summaries in chat", () => {
  it("keeps every subject, sender, and reason and puts warnings before optional mail", () => {
    const formatted = formatInboxChatSummary(summary());
    expect(formatted).toContain("Practice");
    expect(formatted).toContain("Your 3 most recent imported emails");
    expect(formatted.indexOf("Check before acting")).toBeLessThan(
      formatted.indexOf("Lower priority")
    );
    expect(formatted).toContain("Dinner plans — Sam");
    expect(formatted).toContain("A reply may be needed.");
  });

  it("gives a useful next step when no email has been imported", () => {
    expect(formatInboxChatSummary({ ...summary(), items: [] })).toContain(
      "Connect Gmail or Outlook"
    );
  });

  it("excludes saved email-summary content from future model context", () => {
    const messages = [
      { content: "Ordinary chat", providerOptions: {} },
      {
        content: "Private email details",
        providerOptions: PRIVATE_INBOX_OPTIONS,
      },
    ];

    expect(withoutPrivateInboxSummaries(messages)).toStrictEqual([messages[0]]);
    expect(messages).toHaveLength(2);
  });
});

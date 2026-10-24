import { describe, expect, it } from "vitest";

import { checkInboxOverview, localInboxInsight } from "./inbox";
import type { InboxMessage, InboxOverview } from "./inbox";

const message = (overrides: Partial<InboxMessage> = {}): InboxMessage => ({
  bodyText: "Please reply to confirm whether you can join us.",
  checked: true,
  fromAddress: "sam@example.com",
  fromName: "Sam",
  id: "email-1",
  subject: "Dinner plans",
  summary: null,
  suspicious: false,
  ...overrides,
});

const suggestion = (
  overrides: Partial<InboxOverview["items"][number]> = {}
): InboxOverview => ({
  items: [
    {
      category: "reply",
      id: "email-1",
      quote: "Please reply",
      reason: "A reply may be needed.",
      summary: "Sam asks about dinner plans.",
      ...overrides,
    },
  ],
  summary: "A message about dinner plans.",
});

describe("recent email priorities", () => {
  it.each([
    { category: "reply", text: "Please reply by Friday." },
    { category: "review", text: "Your appointment is on Monday." },
    { category: "low_priority", text: "Weekly newsletter. Unsubscribe here." },
    { category: "review", text: "Payment due tomorrow. Unsubscribe here." },
    {
      category: "review",
      text: "Please reply using our app. Do not reply to this email.",
    },
    { category: "review", text: "Hello from Sam." },
  ])("classifies $text as $category", ({ text, category }) => {
    expect(localInboxInsight(message({ bodyText: text })).category).toBe(
      category
    );
  });

  it("keeps warning signs and unchecked emails out of the low-priority group", () => {
    expect(
      localInboxInsight(
        message({ bodyText: "Newsletter sale.", suspicious: true })
      ).category
    ).toBe("check_first");
    expect(
      localInboxInsight(
        message({ bodyText: "Newsletter sale.", checked: false })
      ).category
    ).toBe("review");
  });

  it("keeps warnings and reply requests prominent even when a model lowers their priority", () => {
    const raw = suggestion({ category: "low_priority" });
    expect(
      checkInboxOverview([message({ suspicious: true })], raw)[0]?.category
    ).toBe("check_first");
    expect(checkInboxOverview([message()], raw)[0]?.category).toBe("reply");
  });

  it("requires evidence from the matching email and rejects unsupported certainty", () => {
    const original = message();
    expect(
      checkInboxOverview(
        [original],
        suggestion({ quote: "Your order has shipped" })
      )
    ).toStrictEqual([localInboxInsight(original)]);
    expect(
      checkInboxOverview(
        [original],
        suggestion({ reason: "This is safe to ignore." })
      )
    ).toStrictEqual([localInboxInsight(original)]);
    expect(
      checkInboxOverview(
        [original],
        suggestion({ summary: 'Sam says "wire money".' })
      )
    ).toStrictEqual([localInboxInsight(original)]);
  });

  it("retains every email exactly once if model ids are missing, duplicated, or invented", () => {
    const first = message();
    const second = message({ id: "email-2" });
    const raw = suggestion();
    const [candidate] = raw.items;

    if (!candidate) {
      throw new Error("Expected a suggestion.");
    }

    raw.items.push({ ...candidate, id: "invented" }, { ...candidate });
    expect(checkInboxOverview([first, second], raw)).toStrictEqual([
      localInboxInsight(first),
      localInboxInsight(second),
    ]);
  });

  it("accepts a cautious grounded description", () => {
    const checked = checkInboxOverview([message()], suggestion());
    expect(checked[0]).toMatchObject({
      category: "reply",
      quote: "Please reply",
      summary: "Sam asks about dinner plans.",
    });
  });
});

import { describe, expect, it } from "vitest";

import type { ConversationRecap } from "./model-output";
import { checkRecap, localRecap, recapRequest } from "./recap";
import type { RecapLine } from "./recap";

const NOW = Date.parse("2026-10-24T09:00:00-04:00");

const RIDE: RecapLine[] = [
  {
    body: "Do you need a ride to the eye doctor on Wednesday?",
    from: "them",
    ref: "m1",
  },
  { body: "Yes please, that would be lovely.", from: "you", ref: "m2" },
  { body: "I can pick you up at 9am.", from: "them", ref: "m3" },
];

const recap = (
  overrides: Partial<ConversationRecap> = {}
): ConversationRecap => ({
  agreements: [],
  offers: [],
  proposedSteps: [],
  summary: "Sam is helping with a ride.",
  unclear: [],
  ...overrides,
});

describe("checking a model's recap", () => {
  it("keeps an agreement with an offer and a later acceptance from the other side", () => {
    const checked = checkRecap(
      recap({
        agreements: [
          {
            acceptance: { messageRef: "m2", quote: "Yes please" },
            offer: {
              messageRef: "m1",
              quote: "Do you need a ride to the eye doctor on Wednesday?",
            },
            text: "Sam will drive you on Wednesday.",
          },
        ],
      }),
      RIDE,
      NOW
    );

    expect(checked.agreements).toStrictEqual([
      {
        acceptance: { from: "you", quote: "Yes please" },
        offer: {
          from: "them",
          quote: "Do you need a ride to the eye doctor on Wednesday?",
        },
        text: "Sam will drive you on Wednesday.",
      },
    ]);
  });

  it("keeps an offer without an acceptance as only an offer", () => {
    const checked = checkRecap(
      recap({
        agreements: [
          {
            // The "acceptance" is from the same person who offered.
            acceptance: {
              messageRef: "m3",
              quote: "I can pick you up at 9am.",
            },
            offer: { messageRef: "m1", quote: "Do you need a ride" },
            text: "Agreed on a ride.",
          },
        ],
      }),
      RIDE,
      NOW
    );

    expect(checked.agreements).toStrictEqual([]);
    expect(checked.offers).toHaveLength(1);
    expect(checked.droppedCount).toBe(1);
  });

  it("never counts an acceptance that came before the offer", () => {
    const checked = checkRecap(
      recap({
        agreements: [
          {
            acceptance: { messageRef: "m2", quote: "Yes please" },
            offer: { messageRef: "m3", quote: "I can pick you up at 9am." },
            text: "Pickup at 9am is agreed.",
          },
        ],
      }),
      RIDE,
      NOW
    );

    expect(checked.agreements).toStrictEqual([]);
    expect(checked.offers.map((item) => item.offer.quote)).toStrictEqual([
      "I can pick you up at 9am.",
    ]);
  });

  it("drops quotes that are not in the message they cite", () => {
    const checked = checkRecap(
      recap({
        offers: [
          {
            offer: { messageRef: "m3", quote: "I'll bring lunch too" },
            text: "Lunch.",
          },
          {
            offer: { messageRef: "m9", quote: "I can pick you up" },
            text: "Ride.",
          },
          {
            offer: { messageRef: "m1", quote: "I can pick you up" },
            text: "Wrong message.",
          },
        ],
      }),
      RIDE,
      NOW
    );

    expect(checked.offers).toStrictEqual([]);
    expect(checked.droppedCount).toBe(3);
  });

  it("keeps only safe messages and future reminders with an absolute time", () => {
    const checked = checkRecap(
      recap({
        proposedSteps: [
          {
            kind: "send_message",
            messageDraft: "Thank you, see you at 9am!\nRuth",
            remindAtIso: null,
            reminderTitle: null,
            why: "Confirm the time.",
          },
          {
            kind: "send_message",
            messageDraft: "Details at www.rides.example",
            remindAtIso: null,
            reminderTitle: null,
            why: "Link.",
          },
          {
            kind: "create_reminder",
            messageDraft: null,
            remindAtIso: "2026-10-28T08:30:00-04:00",
            reminderTitle: "Sam picks you up",
            why: "Be ready.",
          },
          {
            kind: "create_reminder",
            messageDraft: null,
            remindAtIso: "2026-10-28T08:30:00",
            reminderTitle: "No offset",
            why: "Ambiguous.",
          },
        ],
      }),
      RIDE,
      NOW
    );

    expect(checked.proposedSteps.map((step) => step.kind)).toStrictEqual([
      "send_message",
      "create_reminder",
    ]);
    expect(checked.proposedSteps[1]?.remindAt).toBe(
      Date.parse("2026-10-28T08:30:00-04:00")
    );
    expect(checked.droppedCount).toBe(2);
  });
});

describe("the local recap", () => {
  it("separates an agreement from an offer that has no answer yet", () => {
    const local = localRecap(RIDE, { contactName: "Sam", signOff: "Ruth" });

    expect(local.agreements.map((item) => item.offer.quote)).toStrictEqual([
      "Do you need a ride to the eye doctor on Wednesday?",
    ]);
    expect(local.offers.map((item) => item.offer.quote)).toStrictEqual([
      "I can pick you up at 9am.",
    ]);
  });

  it("proposes a reply to an open offer, never marking it agreed", () => {
    const local = localRecap(
      [
        {
          body: "I could drive you on Tuesday if you like.",
          from: "them",
          ref: "m1",
        },
      ],
      { contactName: "Sam", signOff: "Ruth" }
    );

    expect(local.agreements).toStrictEqual([]);
    expect(local.proposedSteps[0]?.kind).toBe("send_message");
  });

  it("does not count a refusal as an agreement", () => {
    const local = localRecap(
      [
        { body: "Could you drive me on Tuesday?", from: "you", ref: "m1" },
        { body: "Sorry, I can't make it Tuesday.", from: "them", ref: "m2" },
      ],
      { contactName: "Sam", signOff: "Ruth" }
    );

    expect(local.agreements).toStrictEqual([]);
    expect(local.offers).toStrictEqual([]);
  });

  it("quotes only words from the messages", () => {
    const local = localRecap(RIDE, { contactName: "Sam", signOff: "Ruth" });
    const all = RIDE.map((line) => line.body).join("\n");

    const quotes = [
      ...local.agreements.flatMap((item) => [
        item.offer.quote,
        item.acceptance.quote,
      ]),
      ...local.offers.map((item) => item.offer.quote),
    ];

    expect(quotes.every((quote) => all.includes(quote))).toBeTruthy();
  });
});

describe("the recap request", () => {
  it("labels each message and never carries private notes", () => {
    const request = JSON.stringify(
      recapRequest({
        contactName: "Sam",
        helpStyle: { detail: "short", language: "en", stepByStep: false },
        lines: RIDE,
        name: "Ruth",
        now: "2026-10-24T09:00:00-04:00",
        signOff: "Ruth",
        timeZone: "America/New_York",
      })
    );

    expect(request).toContain("m3 (Sam): I can pick you up at 9am.");
    expect(request).not.toContain("Notes:");
  });
});

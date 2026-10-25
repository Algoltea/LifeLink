import { describe, expect, it } from "vitest";

import { draftProblem } from "./draft-safety";
import { checkExplanation, localExplanation } from "./explanation";
import type { MessageExplanation } from "./model-output";

const MESSAGE =
  "Hi Mom! Can you come to Lily's recital on Saturday? It starts at 2pm at the school. Dad will drive.";

const explained = (
  overrides: Partial<MessageExplanation> = {}
): MessageExplanation => ({
  dates: [],
  interpretations: [],
  missingDetails: [],
  plainSummary: "Your daughter invites you to a recital.",
  requests: [],
  statedFacts: [],
  suggestedReplies: [],
  ...overrides,
});

describe("checking a model's explanation", () => {
  it("preserves summaries longer than 300 characters, including their final warning", () => {
    const summary = `${"This message describes a limited offer from a shop. ".repeat(7)}Check with someone you trust before sharing private details.`;

    const checked = checkExplanation(
      explained({ plainSummary: summary }),
      MESSAGE
    );

    expect(summary.length).toBeGreaterThan(300);
    expect(checked.plainSummary).toBe(summary);
    expect(checked.plainSummary).toMatch(/before sharing private details\.$/u);
  });

  it("checks quotations at the end of a long summary", () => {
    const summary = `${"This message describes an invitation. ".repeat(9)}She says "send your password".`;

    const checked = checkExplanation(
      explained({ plainSummary: summary }),
      MESSAGE
    );

    expect(checked.plainSummary).not.toContain("send your password");
    expect(checked.droppedCount).toBe(1);
  });

  it("keeps a request it can quote, cut from the message", () => {
    const checked = checkExplanation(
      explained({
        requests: [
          {
            quote: "“Can you come to Lily's recital on Saturday?”",
            text: "She asks you to come.",
          },
        ],
      }),
      MESSAGE
    );

    expect(checked.requests).toStrictEqual([
      {
        quote: "Can you come to Lily's recital on Saturday?",
        text: "She asks you to come.",
      },
    ]);
    expect(checked.droppedCount).toBe(0);
  });

  it("turns an unquotable request into a labelled guess", () => {
    const checked = checkExplanation(
      explained({
        requests: [
          { quote: "Please bring flowers", text: "She wants flowers." },
        ],
      }),
      MESSAGE
    );

    expect(checked.requests).toStrictEqual([]);
    expect(checked.interpretations).toStrictEqual([
      {
        text: "She wants flowers.",
        why: "This is not said word for word in the message.",
      },
    ]);
    expect(checked.droppedCount).toBe(1);
  });

  it("never presents an invented fact as stated", () => {
    const checked = checkExplanation(
      explained({
        statedFacts: [
          { quote: "Dad will drive.", text: "Dad is driving." },
          { quote: "Tickets cost $10.", text: "Tickets cost $10." },
        ],
      }),
      MESSAGE
    );

    expect(checked.statedFacts.map((fact) => fact.quote)).toStrictEqual([
      "Dad will drive.",
    ]);
  });

  it("keeps a date only with its words, and a calendar date only when valid", () => {
    const checked = checkExplanation(
      explained({
        dates: [
          { isoDate: "2026-10-31", quote: "Saturday" },
          { isoDate: "2026-02-30", quote: "2pm" },
          { isoDate: "2026-11-01", quote: "Sunday" },
        ],
      }),
      MESSAGE
    );

    expect(checked.dates).toStrictEqual([
      { isoDate: "2026-10-31", quote: "Saturday" },
      { isoDate: null, quote: "2pm" },
    ]);
    expect(checked.droppedCount).toBe(1);
  });

  it("offers at most three replies, one of each kind, and only safe ones", () => {
    const checked = checkExplanation(
      explained({
        suggestedReplies: [
          {
            draft: "Yes, I'd love to!\nRuth",
            kind: "accept",
            label: "Say yes",
          },
          { draft: "Of course!\nRuth", kind: "accept", label: "Yes again" },
          {
            draft: "Details at www.recital-tickets.example",
            kind: "clarify",
            label: "Link",
          },
          {
            draft: "I'm sorry, I can't make it.\nRuth",
            kind: "decline",
            label: "Say no",
          },
        ],
      }),
      MESSAGE
    );

    expect(checked.suggestedReplies.map((reply) => reply.kind)).toStrictEqual([
      "accept",
      "decline",
    ]);
    expect(checked.droppedCount).toBe(2);
  });

  it("withholds a summary that quotes words the message does not contain", () => {
    const checked = checkExplanation(
      explained({ plainSummary: 'She says "the recital is cancelled".' }),
      MESSAGE
    );

    expect(checked.plainSummary).not.toContain("cancelled");
    expect(checked.droppedCount).toBe(1);
  });
});

describe("the local reading", () => {
  const local = localExplanation(MESSAGE, {
    senderName: "Linda",
    signOff: "Ruth",
  });

  it("finds questions and dates by their own words", () => {
    expect(local.requests.map((request) => request.quote)).toStrictEqual([
      "Can you come to Lily's recital on Saturday?",
    ]);
    expect(local.dates.map((date) => date.quote)).toStrictEqual([
      "Saturday",
      "2pm",
    ]);
  });

  it("quotes only words that are in the message", () => {
    const quotes = [
      ...local.requests.map((request) => request.quote),
      ...local.dates.map((date) => date.quote),
    ];

    expect(quotes.every((quote) => MESSAGE.includes(quote))).toBeTruthy();
    expect(local.interpretations).toStrictEqual([]);
  });

  it("offers signed accept, clarify, and decline replies", () => {
    expect(
      local.suggestedReplies.map((reply) => [reply.kind, reply.draft])
    ).toStrictEqual([
      ["accept", "Yes, that works for me. Thank you!\nRuth"],
      ["clarify", "Could you tell me a little more about what you need?\nRuth"],
      ["decline", "I'm sorry, I can't this time.\nRuth"],
    ]);
  });

  it("notices a missing time", () => {
    const reading = localExplanation("Could you drive me on Tuesday?", {
      senderName: "Sam",
      signOff: "Ruth",
    });

    expect(reading.missingDetails).toStrictEqual(["No time is given."]);
    expect(reading.suggestedReplies[1]?.draft).toBe(
      "What time should I be ready?\nRuth"
    );
  });

  it.each(["12:30", "09:05", "18:45", "23:59", "0:00", "2:30pm"])(
    "recognizes the clock time %s without claiming it is missing",
    (time) => {
      const reading = localExplanation(
        `Still on for lunch Sunday at ${time}?`,
        {
          senderName: "Linda",
          signOff: "Ruth",
        }
      );

      expect(reading.dates.map((date) => date.quote)).toStrictEqual([
        "Sunday",
        time,
      ]);
      expect(reading.missingDetails).toStrictEqual([]);
      expect(reading.suggestedReplies[1]?.draft).not.toContain("What time");
    }
  );

  it.each([
    "Can you check the ratio 12:30 on Sunday?",
    "Can you check https://example.com/12:30 on Sunday?",
    "Can you check www.example.com/12:30 on Sunday?",
    "Can you check the score 12:30 on Sunday?",
    "Can you come Sunday at 24:30?",
    "Can you come Sunday at 12:99?",
  ])("does not interpret non-clock text as a time: %s", (source) => {
    const reading = localExplanation(source, {
      senderName: "Linda",
      signOff: "Ruth",
    });

    expect(reading.dates.map((date) => date.quote)).toStrictEqual(["Sunday"]);
    expect(reading.missingDetails).toContain("No time is given.");
  });

  it("suggests no replies when nothing is asked", () => {
    const reading = localExplanation("Thinking of you today.", {
      senderName: "Sam",
      signOff: "Ruth",
    });

    expect(reading.suggestedReplies).toStrictEqual([]);
    expect(reading.plainSummary).toContain("no questions or requests");
  });
});

describe("draft safety", () => {
  it.each([
    ["", "empty"],
    ["See www.example.com", "link"],
    ["Here it is: 482913", "code"],
    ["I'll buy the gift cards.", "payment"],
    ["My PIN is below.", "private_details"],
    ["x".repeat(601), "too_long"],
    ["Compraré las tarjetas de regalo.", "payment"],
    ["Voici mon mot de passe.", "private_details"],
    ["我会买礼品卡", "payment"],
    ["비밀번호를 보낼게요", "private_details"],
  ])("rejects %j", (draft, problem) => {
    expect(draftProblem(draft, "")).toBe(problem);
  });

  it("allows numbers copied from the message and years", () => {
    expect(
      draftProblem("See you at 2100 River Road in 2026.", "2100 River Road")
    ).toBeNull();
  });
});

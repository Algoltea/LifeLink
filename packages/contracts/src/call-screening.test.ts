import { describe, expect, it } from "vitest";

import type { CallCaption } from "./call-screening";
import {
  CALL_WARNING_REASONS,
  callFlagsFromSigns,
  callTranscriptWindow,
  countCallWords,
  finalizeCallCaptions,
  PRACTICE_CALL_DURATION_MS,
  PRACTICE_CALL_SCRIPT,
  redactCallQuote,
  upsertCallCaption,
} from "./call-screening";

const caption = (text: string): CallCaption => ({
  final: true,
  id: "segment-1",
  speaker: "unknown",
  text,
  timeMs: 1250,
});

describe(upsertCallCaption, () => {
  it("replaces complete snapshots without appending repeated words", () => {
    const first = { ...caption("Please send"), final: false };
    const initial = Object.freeze([Object.freeze(first)]);

    const incoming = Object.freeze({
      ...first,
      text: "Please send me the verification code.",
      timeMs: 2000,
    });

    const result = upsertCallCaption(initial, incoming);

    expect(result).toStrictEqual([{ ...incoming, timeMs: first.timeMs }]);
    expect(upsertCallCaption(result, incoming)).toStrictEqual(result);
    expect(initial[0]?.text).toBe("Please send");
    expect(incoming.timeMs).toBe(2000);
  });

  it("retains insertion order and original time when an earlier segment changes", () => {
    const first = { ...caption("First"), final: false };
    const second = { ...caption("Second"), id: "segment-2", timeMs: 4000 };

    const original = Object.freeze([
      Object.freeze(first),
      Object.freeze(second),
    ]);

    const result = upsertCallCaption(original, {
      ...first,
      final: true,
      text: "First, corrected.",
      timeMs: 5000,
    });

    expect(result).toStrictEqual([
      { ...first, final: true, text: "First, corrected." },
      second,
    ]);
    expect(
      upsertCallCaption(result, { ...second, id: "segment-3", timeMs: 1 })
    ).toStrictEqual([...result, { ...second, id: "segment-3", timeMs: 1 }]);
  });

  it("ignores a stale interim snapshot after finalization, including metadata", () => {
    const final = Object.freeze({
      ...caption("Do not send money."),
      flagId: "original-flag",
      speaker: "caller" as const,
    });

    const result = upsertCallCaption(Object.freeze([final]), {
      ...caption("Send money"),
      final: false,
      flagId: "stale-flag",
      timeMs: 9000,
    });

    expect(result).toStrictEqual([final]);
  });

  it("accepts corrected final snapshots while preserving existing flag linkage", () => {
    const existing = { ...caption("Send money."), flagId: "first-flag" };

    const corrected = {
      ...caption("Please send money now."),
      flagId: "replacement-flag",
      timeMs: 9000,
    };

    expect(upsertCallCaption([existing], corrected)).toStrictEqual([
      { ...corrected, flagId: "first-flag", timeMs: existing.timeMs },
    ]);
    expect(
      upsertCallCaption([existing], caption("Send funds."))[0]?.flagId
    ).toBe("first-flag");
    expect(
      upsertCallCaption([caption("Send money.")], corrected)[0]?.flagId
    ).toBe("replacement-flag");
  });

  it("distinguishes separate captions containing identical speech", () => {
    const first = caption("Hello.");
    const second = { ...first, id: "segment-2" };

    expect(upsertCallCaption([first], second)).toStrictEqual([first, second]);
  });
});

describe(finalizeCallCaptions, () => {
  it("purely finalizes every segment without changing evidence or metadata", () => {
    const first = Object.freeze({ ...caption("Still speaking"), final: false });

    const second = Object.freeze({
      ...caption("Already finished."),
      flagId: "saved-flag",
      id: "segment-2",
    });

    const original = Object.freeze([first, second]);
    const result = finalizeCallCaptions(original);

    expect(result).toStrictEqual([{ ...first, final: true }, second]);
    expect(first.final).toBeFalsy();
    expect(finalizeCallCaptions(result)).toStrictEqual(result);
    expect(finalizeCallCaptions([])).toStrictEqual([]);
  });
});

describe(redactCallQuote, () => {
  it.each([
    ["Your code is 123456.", "Your code is ••••."],
    ["Use card 4111 1111 1111 1111.", "Use card ••••."],
    ["Account 12-34-56-78 and code 9876", "Account •••• and code ••••"],
    ["Call (212) 555-0123.", "Call (••••."],
    ["Code 12 34", "Code ••••"],
    ["Code 123\n456", "Code ••••"],
    ["Code 123‑456", "Code ••••"],
    ["Code 12‐34", "Code ••••"],
    ["Code 12\t34", "Code ••••"],
    ["Code １２３４ and ١٢٣٤", "Code •••• and ••••"],
    ["Code 𝟙𝟚", "Code 𝟙𝟚"],
    ["Code 𝟙𝟚𝟛", "Code 𝟙𝟚𝟛"],
    ["Code 𝟙𝟚𝟛𝟜", "Code ••••"],
    ["Code 𝟙𝟚‑𝟛𝟜", "Code ••••"],
    ["Send $500.00 today.", "Send $•••• today."],
    ["2 cards, 123 dollars, room 12.", "2 cards, 123 dollars, room 12."],
    ["No numbers here.", "No numbers here."],
  ])("redacts long digit sequences: %s", (source, expected) => {
    expect(redactCallQuote(source)).toBe(expected);
    expect(redactCallQuote(redactCallQuote(source))).toBe(expected);
  });
});

describe("practice call", () => {
  it("has unique, known-speaker, final captions", () => {
    expect(PRACTICE_CALL_SCRIPT.length).toBeGreaterThan(0);
    expect(new Set(PRACTICE_CALL_SCRIPT.map((item) => item.id)).size).toBe(
      PRACTICE_CALL_SCRIPT.length
    );
    expect(
      PRACTICE_CALL_SCRIPT.every(
        (item) => item.final && item.speaker !== "unknown"
      )
    ).toBeTruthy();
    expect(finalizeCallCaptions(PRACTICE_CALL_SCRIPT)).toStrictEqual(
      PRACTICE_CALL_SCRIPT
    );
  });

  it("keeps ordered caption times within the 24-second duration", () => {
    expect(PRACTICE_CALL_DURATION_MS).toBe(24_000);
    expect(
      PRACTICE_CALL_SCRIPT.every(
        (item) => item.timeMs >= 0 && item.timeMs < PRACTICE_CALL_DURATION_MS
      )
    ).toBeTruthy();
    const times = PRACTICE_CALL_SCRIPT.map((item) => item.timeMs);

    expect(times).toStrictEqual(times.toSorted((a, b) => a - b));
  });

  it("warns from fixed lines at 10, 14 and 18 seconds without any cloud check", () => {
    const warnings = PRACTICE_CALL_SCRIPT.filter(
      (line) => line.warning !== undefined
    );

    expect(warnings.map((line) => line.timeMs)).toStrictEqual([
      10_000, 14_000, 18_000,
    ]);
    expect(new Set(warnings.map((line) => line.warning)).size).toBe(3);
  });
});

describe(countCallWords, () => {
  it("counts spoken words, including contractions, but not punctuation or hidden digits", () => {
    expect(
      countCallWords("Hi, it’s Dr. Patel’s office — call me at 555 0100.")
    ).toBe(10);
    expect(countCallWords("Read me the code •••• please")).toBe(5);
    expect(countCallWords("  …  ")).toBe(0);
  });
});

const line = (id: string, text: string): CallCaption => ({
  ...caption(text),
  id,
});

describe(callTranscriptWindow, () => {
  it("keeps the newest lines that fit, oldest first", () => {
    const captions = [
      line("a", "First line."),
      line("b", "  "),
      line("c", "Second line."),
      line("d", "Third line."),
    ];

    expect(callTranscriptWindow(captions)).toBe(
      "First line.\nSecond line.\nThird line."
    );
    expect(callTranscriptWindow(captions, 25)).toBe(
      "Second line.\nThird line."
    );
    expect(callTranscriptWindow([])).toBe("");
  });

  it("keeps the newest words of one segment longer than the limit", () => {
    expect(callTranscriptWindow([line("a", "0123456789")], 4)).toBe("6789");
  });
});

describe(callFlagsFromSigns, () => {
  const captions: CallCaption[] = [
    { ...caption("Hello, this is your bank."), id: "one", timeMs: 1000 },
    {
      ...caption("Read me the code we just texted you."),
      id: "two",
      timeMs: 9000,
    },
  ];

  it("places each sign on the caption holding its quote", () => {
    expect(
      callFlagsFromSigns(
        [{ kind: "codes_or_passwords", quote: "the code we just texted you" }],
        captions
      )
    ).toStrictEqual([
      {
        captionId: "two",
        id: "two:codes_or_passwords",
        quote: "the code we just texted you",
        reason: CALL_WARNING_REASONS.codes_or_passwords,
        timeMs: 9000,
      },
    ]);
  });

  it("drops a quote that no caption holds any more", () => {
    expect(
      callFlagsFromSigns([{ kind: "money", quote: "wire the money" }], captions)
    ).toStrictEqual([]);
  });

  it("skips kinds already flagged in this call and empty quotes", () => {
    const [existing] = callFlagsFromSigns(
      [{ kind: "money", quote: "your bank" }],
      captions
    );

    expect(existing?.captionId).toBe("one");
    expect(
      callFlagsFromSigns(
        [
          { kind: "money", quote: "Read me" },
          { kind: "threats", quote: "   " },
        ],
        captions,
        existing ? [existing] : []
      )
    ).toStrictEqual([]);
  });
});

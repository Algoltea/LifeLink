import { describe, expect, it } from "vitest";

import type { CallCaption } from "./call-screening";
import {
  detectCallFlags,
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
    expect(detectCallFlags(result[0] ?? caption(""))).toStrictEqual([]);
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

describe(detectCallFlags, () => {
  it.each([
    ["Please buy two gift cards.", "money-request"],
    ["Buy $500 worth of gift cards.", "money-request"],
    ["Pay with gift cards now.", "money-request"],
    ["You must make a wire transfer.", "money-request"],
    ["Can you please transfer the money to this account?", "money-request"],
    ["Wire $500.00 to this account.", "money-request"],
    ["Send me 500 dollars immediately.", "money-request"],
    ["Read me the gift card numbers.", "money-request"],
    ["Read me the verification code we just sent you.", "credentials-request"],
    ["Please tell me your password.", "credentials-request"],
    ["Send your one-time code to me.", "credentials-request"],
    ["Share your PIN with me.", "credentials-request"],
    ["Give me the code we just sent.", "credentials-request"],
    [
      "I need you to give me remote access to your computer.",
      "remote-access-request",
    ],
    ["Please let me control your computer.", "remote-access-request"],
    ["Install AnyDesk so I can help.", "remote-access-request"],
    ["Enable remote access now.", "remote-access-request"],
    ["Don't tell anyone, this is urgent.", "secrecy-urgency"],
    ["Keep this between us and act right now.", "secrecy-urgency"],
    ["Do not tell your family. We must act immediately.", "secrecy-urgency"],
  ])("flags a direct request with a stable rule key: %s", (text, rule) => {
    const source = caption(text);
    const flags = detectCallFlags(source);

    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({
      captionId: source.id,
      id: `${source.id}:${rule}`,
      quote: text,
      timeMs: source.timeMs,
    });
    expect(flags[0]?.reason.length).toBeGreaterThan(0);
    expect(detectCallFlags(source)).toStrictEqual(flags);
  });

  it("ignores unfinished requests that can still become a refusal", () => {
    const interim = { ...caption("Send me your password"), final: false };

    expect(detectCallFlags(interim)).toStrictEqual([]);
    expect(detectCallFlags({ ...interim, final: true })).toHaveLength(1);
    expect(
      detectCallFlags(caption("Send me your password? No, never do that."))
    ).toStrictEqual([]);
    expect(
      detectCallFlags(caption("Send me your password — actually, don't."))
    ).toStrictEqual([]);
  });

  it("quotes original case, punctuation and whitespace without fabricating evidence", () => {
    const source = caption(
      "Hello.  PLEASE send me your verification code!\nThanks."
    );

    const flags = detectCallFlags(source);

    expect(flags[0]?.quote).toBe("PLEASE send me your verification code!");
    expect(source.text.includes(flags[0]?.quote ?? "missing")).toBeTruthy();
  });

  it("deduplicates a rule within a caption while retaining distinct risks", () => {
    const source = caption(
      "Send money. Wire money now. Give me your password."
    );

    const flags = detectCallFlags(source);

    expect(flags.map((flag) => flag.id)).toStrictEqual([
      "segment-1:money-request",
      "segment-1:credentials-request",
    ]);
    expect(flags[0]?.quote).toBe("Send money.");
    expect(
      detectCallFlags({ ...source, text: "Please wire money immediately." })[0]
        ?.id
    ).toBe(flags[0]?.id);
    expect(detectCallFlags({ ...source, id: "segment-2" })[0]?.id).toBe(
      "segment-2:money-request"
    );
  });

  it.each([
    "",
    "We sell gift cards at our shop.",
    "I bought a gift card yesterday.",
    "Buy a gift card for your daughter's birthday.",
    "Your verification code is on your phone.",
    "The transfer is complete.",
    "I need to reset my password.",
    "Remote access is disabled.",
    "This is an urgent reminder about your appointment.",
    "Keep this private.",
    "Don't tell anyone about the birthday surprise right now.",
    "Please do not send money.",
    "Never share your password.",
    "You must not install AnyDesk.",
    "I won't give you remote access.",
    "I refuse to buy gift cards.",
    "I will not read the verification code.",
    "We will never ask you to send money or share a code.",
    "If someone says send money, hang up.",
    "A scammer might say: give me your password.",
    '"Send money now" is an example of a scam request.',
    "Please send me your password — no, don't do that.",
    "Give me your password. Never do that.",
    "Wire money now. Do not do that.",
    "Send me your verification code. Don't do that.",
    "Allow remote access. Please don't do that.",
    "Don't tell anyone, but there is no urgency.",
    "Keep this private, this is not urgent.",
    "Don't tell anyone to share their password right now.",
    "Do not tell your family to send money immediately.",
    '"Don\'t tell anyone, act right now."',
    "Please tell me your password requirements.",
    "Tell me your password is safe.",
    "Send me the verification code documentation.",
    "Give me access to your calendar.",
    "Give me the remote control for the television.",
    "Please share your ZIP code.",
    "Give me the code for the recipe.",
    "Send moneytree seeds.",
    "Share your passwordless login instructions.",
    "Install AnyDeskHelper.",
    "Keep this private; the surgery is unurgent.",
    "Buy gift cardigans.",
  ])("abstains on safety advice, refusals and benign mentions: %s", (text) => {
    expect(detectCallFlags(caption(text))).toStrictEqual([]);
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

  it("keeps detection evidence exact until the caller chooses to redact", () => {
    const source = caption("Send me 12345 dollars.");
    const flags = detectCallFlags(source);

    expect(flags[0]?.quote).toBe(source.text);
    expect(redactCallQuote(flags[0]?.quote ?? "")).toBe(
      "Send me •••• dollars."
    );
    expect(flags[0]?.quote).toBe(source.text);
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

  it("first flags exactly at 10 seconds and exercises at least two rules", () => {
    const flags = PRACTICE_CALL_SCRIPT.flatMap(detectCallFlags);

    expect(flags[0]?.timeMs).toBe(10_000);
    expect(
      PRACTICE_CALL_SCRIPT.flatMap((item) =>
        item.timeMs < 10_000 ? detectCallFlags(item) : []
      )
    ).toStrictEqual([]);
    expect(
      new Set(flags.map((flag) => flag.id.split(":").at(-1))).size
    ).toBeGreaterThanOrEqual(2);
    expect(PRACTICE_CALL_SCRIPT.flatMap(detectCallFlags)).toStrictEqual(flags);
  });
});

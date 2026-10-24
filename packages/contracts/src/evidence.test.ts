import { describe, expect, it } from "vitest";

import {
  locateQuote,
  proseQuotesVerified,
  quotedSegments,
  stanceOf,
} from "./evidence";

const MESSAGE =
  "URGENT: Your account is suspended. Reply with the verification code we sent you today.";

describe(locateQuote, () => {
  it("finds an exact quote and returns the original slice", () => {
    const match = locateQuote(MESSAGE, "Reply with the verification code");

    expect(match).toStrictEqual({
      end: 67,
      found: true,
      start: 35,
      text: "Reply with the verification code",
    });
  });

  it("rejects a fabricated quote", () => {
    expect(locateQuote(MESSAGE, "send us your PIN").found).toBeFalsy();
  });

  it("rejects a paraphrase that differs by one word", () => {
    expect(
      locateQuote(MESSAGE, "Reply with the security code").found
    ).toBeFalsy();
  });

  it("is case-sensitive, so the person sees the message's own words", () => {
    expect(locateQuote(MESSAGE, "urgent").found).toBeFalsy();
    expect(locateQuote(MESSAGE, "URGENT").found).toBeTruthy();
  });

  it("ignores wrapping quotation marks and surrounding spaces only", () => {
    const match = locateQuote(MESSAGE, "  “Your account is suspended.”  ");

    expect(match.found && match.text).toBe("Your account is suspended.");
  });

  it("rejects empty, whitespace, and null quotes", () => {
    expect(locateQuote(MESSAGE, "").found).toBeFalsy();
    expect(locateQuote(MESSAGE, "   ").found).toBeFalsy();
    expect(locateQuote(MESSAGE, '""').found).toBeFalsy();
    expect(locateQuote(MESSAGE, null).found).toBeFalsy();
  });

  it("points at the first occurrence of a repeated quote", () => {
    const match = locateQuote("pay now. pay now.", "pay now");

    expect(match.found && match.start).toBe(0);
  });
});

describe("quoted prose", () => {
  it("extracts quotations from an explanation", () => {
    expect(
      quotedSegments('It says "act now" and “buy gift cards” to scare you.')
    ).toStrictEqual(["act now", "buy gift cards"]);
  });

  it("verifies prose only when every quotation is in the source", () => {
    expect(
      proseQuotesVerified(MESSAGE, 'It says "Reply with the"')
    ).toBeTruthy();
    expect(
      proseQuotesVerified(MESSAGE, 'It says "wire the money"')
    ).toBeFalsy();
    expect(proseQuotesVerified(MESSAGE, "No quotations here.")).toBeTruthy();
  });
});

const stanceAt = (text: string, phrase: string) =>
  stanceOf(text, text.indexOf(phrase));

describe(stanceOf, () => {
  it.each([
    [
      "Your bank will never ask for your verification code. Do not share it.",
      "verification code",
    ],
    ["We never ask you to pay with gift cards.", "gift cards"],
    ["Reminder: never share your PIN or password.", "PIN"],
    ["Reminder: never share your PIN or password.", "password"],
    ["Please do not give your bank details to anyone.", "bank details"],
    [
      "Medicare will not call to ask for your Medicare number.",
      "Medicare number",
    ],
    ["No one will ever ask you for a one-time code.", "one-time code"],
  ])("treats a warning as a warning: %s", (text, phrase) => {
    expect(stanceAt(text, phrase)).toBe("warns_against");
  });

  it.each([
    ["Reply with the verification code we sent you.", "verification code"],
    ["Buy two gift cards and read me the numbers.", "gift cards"],
    ["Don't tell anyone, just buy the gift cards.", "gift cards"],
    [
      "If you don't send the gift card numbers today, you lose it.",
      "gift card",
    ],
    ["Don't forget to buy the gift cards before noon.", "gift cards"],
    ["Don't delay: send your bank details now.", "bank details"],
    [
      "Never share your code with anyone except our agent who calls you.",
      "code",
    ],
  ])("keeps a request a request: %s", (text, phrase) => {
    expect(stanceAt(text, phrase)).toBe("mentions");
  });

  it("only reads the clause before the match", () => {
    const text =
      "We never ask for your password. To keep your account, send your bank account number.";

    expect(stanceAt(text, "password")).toBe("warns_against");
    expect(stanceAt(text, "bank account")).toBe("mentions");
  });
});

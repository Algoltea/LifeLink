/**
 * Reading a short reply by pattern, for Practice mode and local recaps. A
 * refusal is checked first, because "Sorry, I can't" also contains "I can",
 * and a maybe is never read as a yes.
 */

type ReplyReading = "accepted" | "declined" | "unclear";

const YES_PATTERN =
  /\b(?:yes|sure|of course|happy to|no problem|i can|i'll|i will|absolutely|ok|okay|sounds good|that works|perfect|great)\b/iu;

const NO_PATTERN =
  /\b(?:no(?! problem)|can['’]?t(?! wait)|cannot|sorry|unable|won['’]?t|not able)\b/iu;

const HEDGE_PATTERN =
  /\b(?:maybe|might|not sure|let me (?:check|see)|i['’]ll (?:check|see|try)|let you know|possibly|perhaps)\b/iu;

const readReply = (text: string): ReplyReading => {
  if (NO_PATTERN.test(text)) {
    return "declined";
  }

  if (HEDGE_PATTERN.test(text)) {
    return "unclear";
  }

  return YES_PATTERN.test(text) ? "accepted" : "unclear";
};

export { readReply };

export type { ReplyReading };

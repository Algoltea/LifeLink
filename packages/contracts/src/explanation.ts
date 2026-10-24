/**
 * "Help me understand this". A model may explain a message, but only what it
 * can quote word for word is presented as something the message says.
 * Everything else is shown as a guess or left out. Suggested replies are
 * optional starting points that the person edits and approves; they are never
 * sent from here.
 *
 * Without the cloud assistant, `localExplanation` finds questions, requests,
 * and dates by pattern and says that it did.
 */
import { draftProblem } from "./draft-safety";
import { locateQuote, proseQuotesVerified } from "./evidence";
import type { MessageExplanation } from "./model-output";

const MAX_ITEMS = 4;
const MAX_DATES = 6;
const MAX_REPLIES = 3;
const MAX_TEXT = 300;

interface CheckedExplanation extends MessageExplanation {
  /** Items the model gave that were removed because the message does not say them. */
  droppedCount: number;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

const validIsoDate = (value: string | null): string | null => {
  if (value === null || !ISO_DATE.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T12:00:00Z`);

  return Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
    ? null
    : value;
};

const clip = (text: string): string => text.trim().slice(0, MAX_TEXT);

const NOT_WORD_FOR_WORD = "This is not said word for word in the message.";

const UNVERIFIED_SUMMARY =
  "The assistant's summary quoted words that are not in the message, so it is not shown. The details below are checked against the message.";

/** Hold a model's explanation to the message it read. */
const checkExplanation = (
  raw: MessageExplanation,
  source: string
): CheckedExplanation => {
  let droppedCount = 0;
  const interpretations: MessageExplanation["interpretations"] = [];

  const verified = (
    items: MessageExplanation["requests"]
  ): MessageExplanation["requests"] =>
    items.flatMap((item) => {
      const match = locateQuote(source, item.quote);

      if (match.found) {
        return [{ quote: match.text, text: clip(item.text) }];
      }

      // Not in the message: at most a guess, and never presented as what it says.
      droppedCount += 1;

      if (item.text.trim().length > 0) {
        interpretations.push({ text: clip(item.text), why: NOT_WORD_FOR_WORD });
      }

      return [];
    });

  const requests = verified(raw.requests).slice(0, MAX_ITEMS);
  const statedFacts = verified(raw.statedFacts).slice(0, MAX_ITEMS);

  const dates = raw.dates
    .flatMap((date) => {
      const match = locateQuote(source, date.quote);

      if (!match.found) {
        droppedCount += 1;

        return [];
      }

      return [{ isoDate: validIsoDate(date.isoDate), quote: match.text }];
    })
    .slice(0, MAX_DATES);

  const seenKinds = new Set<string>();

  const suggestedReplies = raw.suggestedReplies
    .flatMap((reply) => {
      if (
        seenKinds.has(reply.kind) ||
        draftProblem(reply.draft, source) !== null
      ) {
        droppedCount += 1;

        return [];
      }

      seenKinds.add(reply.kind);

      return [
        {
          draft: reply.draft.trim(),
          kind: reply.kind,
          label: clip(reply.label),
        },
      ];
    })
    .slice(0, MAX_REPLIES);

  let plainSummary = clip(raw.plainSummary);

  if (!proseQuotesVerified(source, plainSummary)) {
    droppedCount += 1;
    plainSummary = UNVERIFIED_SUMMARY;
  }

  return {
    dates,
    droppedCount,
    interpretations: [
      ...interpretations,
      ...raw.interpretations.map((item) => ({
        text: clip(item.text),
        why: clip(item.why),
      })),
    ]
      .filter((item) => item.text.length > 0)
      .slice(0, MAX_ITEMS),
    missingDetails: raw.missingDetails
      .map(clip)
      .filter((detail) => detail.length > 0)
      .slice(0, MAX_ITEMS),
    plainSummary,
    requests,
    statedFacts,
    suggestedReplies,
  };
};

// ── Local reading: patterns, not understanding ────────────────────────────

const SENTENCE_BREAK = /(?<=[.!?])\s+|\n+/u;

const REQUEST =
  /\b(?:can you|could you|would you|will you|please|let me know|can we|could we|shall we|do you want|would you like)\b/iu;

const DAY_WORDS =
  /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tonight|tomorrow|this weekend|next week|this (?:morning|afternoon|evening)|(?:jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? \d{1,2}(?:st|nd|rd|th)?|may \d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/giu;

const TIME_WORDS =
  /\b\d{1,2}(?::\d{2})?\s?(?:am|pm|a\.m\.|p\.m\.)|\b(?:noon|midnight)\b/giu;

interface Found {
  index: number;
  isTime: boolean;
  text: string;
}

const findDates = (source: string): Found[] => {
  const found = [
    ...[...source.matchAll(DAY_WORDS)].map((match) => ({
      index: match.index,
      isTime: false,
      text: match[0],
    })),
    ...[...source.matchAll(TIME_WORDS)].map((match) => ({
      index: match.index,
      isTime: true,
      text: match[0],
    })),
  ].toSorted((first, second) => first.index - second.index);

  const seen = new Set<string>();

  return found.filter((item) => {
    const key = item.text.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

interface LocalOptions {
  /** How the reply is signed, as in every other LifeLink draft. */
  signOff: string;
  /** Who wrote the message, for the summary. */
  senderName: string;
}

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

/** What LifeLink can say without the cloud assistant. Every quote is cut from the message. */
const localExplanation = (
  source: string,
  options: LocalOptions
): CheckedExplanation => {
  const sentences = source
    .split(SENTENCE_BREAK)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const requests = sentences
    .filter((sentence) => sentence.endsWith("?") || REQUEST.test(sentence))
    .slice(0, MAX_ITEMS)
    .map((sentence) => ({
      quote: sentence,
      text: sentence.endsWith("?")
        ? "A question for you."
        : "Something they ask of you.",
    }));

  const found = findDates(source).slice(0, MAX_DATES);
  const hasDay = found.some((item) => !item.isTime);
  const hasTime = found.some((item) => item.isTime);
  const missingDetails: string[] = [];

  if (requests.length > 0 && hasDay && !hasTime) {
    missingDetails.push("No time is given.");
  }

  if (hasTime && !hasDay) {
    missingDetails.push("No day is given.");
  }

  const datePart =
    found.length === 0
      ? ""
      : ` It mentions ${plural(found.length, "date or time", "dates or times")}.`;

  const plainSummary =
    requests.length === 0
      ? `LifeLink found no questions or requests in this message from ${options.senderName}.${datePart}`
      : `This message from ${options.senderName} has ${plural(requests.length, "question or request", "questions or requests")} for you.${datePart}`;

  const sign = (words: string): string => `${words}\n${options.signOff}`;

  const clarify = missingDetails.includes("No time is given.")
    ? "What time should I be ready?"
    : "Could you tell me a little more about what you need?";

  const suggestedReplies: MessageExplanation["suggestedReplies"] =
    requests.length === 0
      ? []
      : [
          {
            draft: sign("Yes, that works for me. Thank you!"),
            kind: "accept",
            label: "Say yes",
          },
          { draft: sign(clarify), kind: "clarify", label: "Ask a question" },
          {
            draft: sign("I'm sorry, I can't this time."),
            kind: "decline",
            label: "Say no",
          },
        ];

  return {
    dates: found.map((item) => ({ isoDate: null, quote: item.text })),
    droppedCount: 0,
    interpretations: [],
    missingDetails,
    plainSummary,
    requests,
    statedFacts: [],
    suggestedReplies,
  };
};

export { checkExplanation, localExplanation };

export type { CheckedExplanation, LocalOptions };

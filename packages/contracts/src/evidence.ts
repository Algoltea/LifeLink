/**
 * Evidence checks for model output. Instructions ask a model to quote exactly;
 * these functions make sure it did. A quote is shown to the person only when
 * those words are in the text LifeLink was given, and the stored quote is cut
 * from that original text, never copied from the model.
 */

type QuoteMatch =
  | { found: false }
  | { end: number; found: true; start: number; text: string };

const NOT_FOUND: QuoteMatch = { found: false };

// Models often wrap a quote in quotation marks; the marks are not evidence.
const WRAPPING_QUOTES = /^["'“”‘’]+|["'“”‘’]+$/gu;

/**
 * Find a quote in the original text. Matching is exact and case-sensitive
 * after trimming surrounding whitespace and wrapping quotation marks.
 */
const locateQuote = (source: string, quote: string | null): QuoteMatch => {
  if (quote === null) {
    return NOT_FOUND;
  }

  const needle = quote.trim().replaceAll(WRAPPING_QUOTES, "").trim();

  if (needle.length === 0) {
    return NOT_FOUND;
  }

  const start = source.indexOf(needle);

  if (start === -1) {
    return NOT_FOUND;
  }

  const end = start + needle.length;

  return { end, found: true, start, text: source.slice(start, end) };
};

const QUOTED_SEGMENT = /["“](?<quoted>[^"“”]{3,})["”]/gu;

/** Words a piece of prose presents as quotations ("like this"), for checking against the source. */
const quotedSegments = (prose: string): string[] =>
  [...prose.matchAll(QUOTED_SEGMENT)].flatMap((match) =>
    match.groups?.quoted === undefined ? [] : [match.groups.quoted]
  );

/** True when every quotation in the prose appears in the source text. */
const proseQuotesVerified = (source: string, prose: string): boolean =>
  quotedSegments(prose).every((segment) => locateQuote(source, segment).found);

/**
 * How the words around a warning sign use it.
 * - `warns_against`: the text tells the reader not to do it ("never share your code").
 * - `requests`: the text asks the reader to do it.
 * - `mentions`: anything else, or not sure.
 */
const signalStances = ["requests", "warns_against", "mentions"] as const;

type SignalStance = (typeof signalStances)[number];

const MAX_CLAUSE_LENGTH = 100;

const CLAUSE_BOUNDARIES = /[.!?;,\n]/gu;

// A condition or threat keeps the request a request: "If you don't pay with gift cards today…"
const CONDITIONAL = /\b(?:if|unless|otherwise|or else)\b/iu;

// An exception after the match undoes the warning: "never share your code with anyone except our agent".
const EXCEPTION_AFTER = /\b(?:except|unless|other than|apart from|but)\b/iu;

const CLAUSE_END = /[.!?;\n]/u;

// Pressure phrased as a negation is still pressure: "don't forget to buy the gift cards".
const NEGATED_PRESSURE =
  /\b(?:never|not|don['’]?t)\s+(?:forget|hesitate|delay|wait|miss|fail|ignore)\b/iu;

// A negation that governs a warning verb: "never ask for", "do not share", "won't request".
const NEGATED_WARNING_VERB =
  /\b(?:never|not|don['’]?t|won['’]?t|can['’]?t|cannot|shouldn['’]?t|no one (?:will|should)|nobody (?:will|should))\b(?:\s+[\p{L}'’]+){0,3}?\s+(?:ask|asks|asking|request|requests|share|give|send|pay|buy|provide|reveal|disclose|accept|accepts|need|needs|threaten|threatens|call|text|email|reply|click|open)\b/iu;

/**
 * Whether the clause around a match tells the reader *not* to do
 * something. Deliberately conservative: it only reports `warns_against` when a
 * negation clearly governs a warning verb in the same clause, and never for a
 * conditional ("if you don't…") or an exception ("…except our agent"). Everything else is `mentions`.
 */
const stanceOf = (source: string, matchStart: number): SignalStance => {
  const before = source.slice(
    Math.max(0, matchStart - MAX_CLAUSE_LENGTH),
    matchStart
  );

  const boundaries = [...before.matchAll(CLAUSE_BOUNDARIES)];
  const lastBoundary = boundaries.at(-1);

  const clause =
    lastBoundary?.index === undefined
      ? before
      : before.slice(lastBoundary.index + 1);

  const after = source.slice(matchStart, matchStart + MAX_CLAUSE_LENGTH);
  const afterEnd = after.search(CLAUSE_END);
  const rest = afterEnd === -1 ? after : after.slice(0, afterEnd);

  if (
    CONDITIONAL.test(clause) ||
    NEGATED_PRESSURE.test(clause) ||
    EXCEPTION_AFTER.test(rest)
  ) {
    return "mentions";
  }

  return NEGATED_WARNING_VERB.test(clause) ? "warns_against" : "mentions";
};

export {
  locateQuote,
  proseQuotesVerified,
  quotedSegments,
  signalStances,
  stanceOf,
};

export type { QuoteMatch, SignalStance };

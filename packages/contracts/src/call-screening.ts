interface CallCaption {
  id: string;
  speaker: "unknown" | "caller" | "you";
  text: string;
  timeMs: number;
  final: boolean;
  flagId?: string;
}

interface CallFlag {
  id: string;
  captionId: string;
  reason: string;
  quote: string;
  timeMs: number;
}

/** Incoming text is a complete snapshot, never a delta to append. */
const upsertCallCaption = (
  captions: readonly CallCaption[],
  incoming: CallCaption
): CallCaption[] => {
  const existing = captions.find((caption) => caption.id === incoming.id);

  if (!existing) {
    return [...captions, { ...incoming }];
  }

  if (existing.final && !incoming.final) {
    return [...captions];
  }

  const replacement: CallCaption = {
    ...incoming,
    final: existing.final || incoming.final,
    timeMs: existing.timeMs,
  };

  if (existing.flagId !== undefined) {
    replacement.flagId = existing.flagId;
  }

  return captions.map((caption) =>
    caption.id === incoming.id ? replacement : caption
  );
};

const finalizeCallCaptions = (
  captions: readonly CallCaption[]
): CallCaption[] => captions.map((caption) => ({ ...caption, final: true }));

const SPOKEN_WORD = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu;

/** Counts spoken words so a summary can tell silence apart from a quiet call. */
const countCallWords = (text: string): number =>
  text.match(SPOKEN_WORD)?.length ?? 0;

/** What an AI check may report from a live call; each kind has fixed wording. */
const callWarningKinds = [
  "money",
  "gift_cards",
  "codes_or_passwords",
  "remote_access",
  "personal_details",
  "threats",
  "secrecy_or_pressure",
] as const;

type CallWarningKind = (typeof callWarningKinds)[number];

const CALL_WARNING_REASONS: Record<CallWarningKind, string> = {
  codes_or_passwords: "A request to share a verification code or password.",
  gift_cards: "A request to pay with gift cards or share their codes.",
  money: "A request to send money or move your savings.",
  personal_details: "A request for personal or bank details.",
  remote_access: "A request to allow remote access to a device.",
  secrecy_or_pressure: "A request for secrecy or pressure to act right away.",
  threats: "A threat of arrest, fines, or a closed account.",
};

interface CallWarningSign {
  kind: CallWarningKind;
  quote: string;
}

const MAX_TRANSCRIPT_CHARS = 6000;

interface CallTranscriptLine {
  caption: CallCaption;
  start: number;
  text: string;
}

/** Caption offsets in the same trimmed, newline-joined text sent for checking. */
const callTranscriptLines = (
  captions: readonly CallCaption[]
): CallTranscriptLine[] => {
  const lines: CallTranscriptLine[] = [];
  let start = 0;

  for (const caption of captions) {
    const text = caption.text.trim();

    if (text.length === 0) {
      continue;
    }

    lines.push({ caption, start, text });
    start += text.length + 1;
  }

  return lines;
};

/** The newest captions that fit, oldest first, one segment per line. */
const callTranscriptWindow = (
  captions: readonly CallCaption[],
  maxChars = MAX_TRANSCRIPT_CHARS
): string => {
  const lines: string[] = [];
  let length = 0;

  for (const { text: line } of callTranscriptLines(captions).toReversed()) {
    if (length + line.length + 1 > maxChars) {
      // One very long segment still contributes its newest words.
      if (lines.length === 0) {
        lines.push(line.slice(-maxChars));
      }

      break;
    }

    lines.unshift(line);
    length += line.length + 1;
  }

  return lines.join("\n");
};

/**
 * Matches each quote contiguously in the current transcript, across captions
 * when needed. The latest occurrence is anchored to the caption where it starts
 * for both its ID and timing. Corrected-away quotes and already flagged kinds
 * are dropped.
 */
const callFlagsFromSigns = (
  signs: readonly CallWarningSign[],
  captions: readonly CallCaption[],
  existing: readonly CallFlag[] = []
): CallFlag[] => {
  const flags: CallFlag[] = [];
  const seen = new Set(existing.map((flag) => flag.reason));
  const lines = callTranscriptLines(captions);
  const transcript = lines.map((line) => line.text).join("\n");

  for (const sign of signs) {
    const reason = CALL_WARNING_REASONS[sign.kind];
    const quote = sign.quote.trim();

    if (seen.has(reason) || quote.length === 0) {
      continue;
    }

    const start = transcript.lastIndexOf(quote);

    const line = lines.findLast(
      (item) => item.start <= start && start < item.start + item.text.length
    );

    if (line === undefined) {
      continue;
    }

    const { caption } = line;

    seen.add(reason);
    flags.push({
      captionId: caption.id,
      id: `${caption.id}:${sign.kind}`,
      quote: transcript.slice(start, start + quote.length),
      reason,
      timeMs: caption.timeMs,
    });
  }

  return flags;
};

const DIGIT_SEQUENCE = /\p{Nd}(?:[\p{Nd}\p{Pd}\s()./]*\p{Nd})?/gu;
const NON_DIGIT = /[^\p{Nd}]/gu;

/** Redact before showing or saving a quote. */
const redactCallQuote = (text: string): string =>
  text.replaceAll(DIGIT_SEQUENCE, (sequence) =>
    [...sequence.replaceAll(NON_DIGIT, "")].length >= 4 ? "••••" : sequence
  );

const PRACTICE_CALL_DURATION_MS = 24_000;

/** Practice uses fixed warnings so it never needs a microphone or cloud AI. */
type PracticeLine = CallCaption & { warning?: CallWarningKind };

const PRACTICE_CALL_SCRIPT: readonly PracticeLine[] = [
  {
    final: true,
    id: "practice-hello",
    speaker: "caller",
    text: "Hello, I am calling about your account.",
    timeMs: 1000,
  },
  {
    final: true,
    id: "practice-question",
    speaker: "you",
    text: "What is this about?",
    timeMs: 4000,
  },
  {
    final: true,
    id: "practice-claim",
    speaker: "caller",
    text: "There is a payment problem with your account.",
    timeMs: 7000,
  },
  {
    final: true,
    id: "practice-gift-cards",
    speaker: "caller",
    text: "Please buy two gift cards to fix the payment problem.",
    timeMs: 10_000,
    warning: "gift_cards",
  },
  {
    final: true,
    id: "practice-code",
    speaker: "caller",
    text: "Read me the verification code we just sent to your phone.",
    timeMs: 14_000,
    warning: "codes_or_passwords",
  },
  {
    final: true,
    id: "practice-pressure",
    speaker: "caller",
    text: "Do not tell your family, we need to act right now.",
    timeMs: 18_000,
    warning: "secrecy_or_pressure",
  },
  {
    final: true,
    id: "practice-refusal",
    speaker: "you",
    text: "I will not send money or share a code. I will call my bank myself.",
    timeMs: 22_000,
  },
];

export {
  CALL_WARNING_REASONS,
  callFlagsFromSigns,
  callTranscriptWindow,
  callWarningKinds,
  countCallWords,
  finalizeCallCaptions,
  PRACTICE_CALL_DURATION_MS,
  MAX_TRANSCRIPT_CHARS,
  PRACTICE_CALL_SCRIPT,
  redactCallQuote,
  upsertCallCaption,
};

export type {
  CallCaption,
  CallFlag,
  CallWarningKind,
  CallWarningSign,
  PracticeLine,
};

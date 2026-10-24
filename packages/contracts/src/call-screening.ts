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

// Keep decimal amounts intact and retain each original sentence for evidence.
const SENTENCE_BOUNDARY = /(?<=[.!?;])\s+|\n+/u;

const REQUEST_PREFIX =
  /^(?:(?:can|could|will|would)\s+you\s+|you\s+(?:must|need\s+to|have\s+to)\s+|i\s+need\s+you\s+to\s+)?(?:please\s+|kindly\s+)?/iu;

// These rules deliberately abstain on quoted, hypothetical, negated, or
// corrective speech, even when that means missing a request in the same sentence.
const NON_REQUEST_CONTEXT =
  /["“”]|\b(?:not|never|no|don['’]?t|doesn['’]?t|didn['’]?t|won['’]?t|wouldn['’]?t|shouldn['’]?t|can['’]?t|cannot|couldn['’]?t|isn['’]?t|aren['’]?t|avoid|refuse|refused|refusing|decline|declined|scam|scammers?|fraud|example|suppose|pretend|if|unless|instead)\b/iu;

const FOLLOWUP_CORRECTION =
  /[.!?;]\s+(?:no|actually|sorry|never|(?:please\s+)?(?:do\s+not|don['’]?t))\b/iu;

const BENIGN_GIFT_CONTEXT =
  /\b(?:birthday|anniversary|christmas|holiday|present|groceries)\b/iu;

const GIFT_CARD_REQUEST =
  /^(?:buy|purchase|get)\s+(?:(?:me|us)\s+)?(?:[$£€]\s*\d+(?:[.,]\d+)*\s+(?:worth\s+of|in)\s+)?(?:(?:a|the|some|two|three|four|five|\d+)\s+)?(?:(?:apple|amazon|google\s+play|steam)\s+)?gift\s+cards?\b/iu;

const PAYMENT_METHOD_REQUEST =
  /^(?:pay\s+(?:(?:me|us)\s+)?(?:with|by|using)\s+(?:(?:a|the)\s+)?(?:gift\s+cards?|(?:bank|wire)\s+transfer|bitcoin|cryptocurrency)|make\s+(?:a|the)\s+(?:bank|wire)\s+transfer)\b/iu;

const MONEY_REQUEST =
  /^(?:send|wire|transfer|pay)\s+(?:(?:me|us)\s+)?(?:(?:(?:the|your|some)\s+)?(?:money|funds|savings|payment)\b|[$£€]\s*\d+(?:[.,]\d+)*(?!\w)|\d+(?:[.,]\d+)*\s+(?:dollars?|pounds?|euros?)\b)/iu;

const GIFT_CODE_REQUEST =
  /^(?:send|read|give|tell)\s+(?:(?:me|us)\s+)?(?:the|your)\s+gift\s+card\s+(?:codes?|numbers?|pins?)\b/iu;

const CREDENTIAL_REQUEST =
  /^(?:send|read|give|tell|share|provide|text|email|repeat|disclose)\s+(?:out\s+)?(?:(?:me|us)\s+)?(?:(?:the|your|that)\s+)?(?:(?:verification|security|authentication|login|six[- ]digit|6[- ]digit)\s+codes?|one[- ]time\s+(?:codes?|passwords?)|passwords?|passcodes?|pins?|code\s+(?:we\s+(?:just\s+)?sent|sent\s+to\s+you|(?:on|from)\s+your\s+phone))\b(?=\s*(?:[.!?;,]|$)|\s+(?:now|please|immediately|so|and|to|for|with|that|we|you)\b)/iu;

const REMOTE_ACCESS_REQUEST =
  /^(?:(?:give|grant|allow)\s+(?:me|us)\s+(?:remote\s+(?:access|control)\b|(?:access|control)\s+(?:to|of|over)\s+(?:your|the)\s+(?:computer|device|phone)\b)|(?:enable|allow)\s+remote\s+(?:access|control)\b|let\s+(?:me|us)\s+(?:remotely\s+)?(?:access|control)\s+(?:your|the)\s+(?:computer|device|phone)\b|(?:install|download|open)\s+(?:(?:the|a)\s+)?(?:anydesk|teamviewer|remote\s+(?:access|control)\s+(?:software|app|program))\b)/iu;

const SECRECY_REQUEST =
  /^(?:keep\s+(?:this|it|our\s+conversation|this\s+call)\s+(?:a\s+secret|private|between\s+us)|(?:don['’]?t|do\s+not)\s+(?:tell|contact)\s+(?:anyone|anybody|your\s+(?:family|bank)|the\s+police)|tell\s+no\s+one)\b(?!\s+to\b)/iu;

const URGENCY =
  /\b(?:urgent|urgently|immediately|right\s+now|act\s+now|hurry|within\s+(?:\d+|one|two|five|ten)\s+minutes?)\b/iu;

const requestsMoney = (request: string): boolean =>
  MONEY_REQUEST.test(request) ||
  PAYMENT_METHOD_REQUEST.test(request) ||
  GIFT_CODE_REQUEST.test(request) ||
  (GIFT_CARD_REQUEST.test(request) && !BENIGN_GIFT_CONTEXT.test(request));

const RULES = [
  {
    key: "money-request",
    matches: requestsMoney,
    reason: "A request to send money or pay with gift cards.",
  },
  {
    key: "credentials-request",
    matches: (request: string): boolean => CREDENTIAL_REQUEST.test(request),
    reason: "A request to share a verification code or password.",
  },
  {
    key: "remote-access-request",
    matches: (request: string): boolean => REMOTE_ACCESS_REQUEST.test(request),
    reason: "A request to allow remote access to a device.",
  },
] as const;

/** Local warning signs, not a verdict. Only final speech can produce a flag. */
const detectCallFlags = (caption: CallCaption): CallFlag[] => {
  if (
    !caption.final ||
    (FOLLOWUP_CORRECTION.test(caption.text) &&
      NON_REQUEST_CONTEXT.test(caption.text))
  ) {
    return [];
  }

  const sentences = caption.text.split(SENTENCE_BOUNDARY);
  const flags = new Map<string, CallFlag>();

  for (const sentence of sentences) {
    const quote = sentence.trim();
    const request = quote.replace(REQUEST_PREFIX, "");

    if (!NON_REQUEST_CONTEXT.test(quote)) {
      for (const rule of RULES) {
        if (!flags.has(rule.key) && rule.matches(request)) {
          flags.set(rule.key, {
            captionId: caption.id,
            id: `${caption.id}:${rule.key}`,
            quote,
            reason: rule.reason,
            timeMs: caption.timeMs,
          });
        }
      }
    }

    // The secrecy command itself can be negative ("don't tell anyone").
    // Read the whole final segment to allow "Don't tell anyone. Act now."
    // A refusal, correction, or safety context still suppresses this rule.
    const secrecy = request.match(SECRECY_REQUEST);

    if (
      secrecy &&
      !flags.has("secrecy-urgency") &&
      URGENCY.test(caption.text) &&
      !NON_REQUEST_CONTEXT.test(caption.text.replace(secrecy[0], "")) &&
      !BENIGN_GIFT_CONTEXT.test(caption.text)
    ) {
      flags.set("secrecy-urgency", {
        captionId: caption.id,
        id: `${caption.id}:secrecy-urgency`,
        quote: caption.text.trim(),
        reason: "A request for secrecy while pressuring you to act urgently.",
        timeMs: caption.timeMs,
      });
    }
  }

  return [...flags.values()];
};

const DIGIT_SEQUENCE = /\p{Nd}(?:[\p{Nd}\p{Pd}\s()./]*\p{Nd})?/gu;
const NON_DIGIT = /[^\p{Nd}]/gu;

/** Redact before persistence; detection keeps the original, exact evidence. */
const redactCallQuote = (text: string): string =>
  text.replaceAll(DIGIT_SEQUENCE, (sequence) =>
    [...sequence.replaceAll(NON_DIGIT, "")].length >= 4 ? "••••" : sequence
  );

const PRACTICE_CALL_DURATION_MS = 24_000;

const PRACTICE_CALL_SCRIPT: readonly CallCaption[] = [
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
  },
  {
    final: true,
    id: "practice-code",
    speaker: "caller",
    text: "Read me the verification code we just sent to your phone.",
    timeMs: 14_000,
  },
  {
    final: true,
    id: "practice-pressure",
    speaker: "caller",
    text: "Do not tell your family, we need to act right now.",
    timeMs: 18_000,
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
  detectCallFlags,
  finalizeCallCaptions,
  PRACTICE_CALL_DURATION_MS,
  PRACTICE_CALL_SCRIPT,
  redactCallQuote,
  upsertCallCaption,
};

export type { CallCaption, CallFlag };

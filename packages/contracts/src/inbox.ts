import { z } from "zod";

import { emailImportance } from "./email-importance";
import type { EmailImportanceInput } from "./email-importance";
import { locateQuote, proseQuotesVerified } from "./evidence";

const INBOX_PAGE_SIZE = 15;
const INBOX_IMPORTANCE_VERSION = 2;

const inboxCategories = [
  "check_first",
  "reply",
  "review",
  "low_priority",
] as const;

type InboxCategory = (typeof inboxCategories)[number];

interface InboxMessage extends EmailImportanceInput {
  id: string;
  summary: string | null;
  suspicious: boolean | null;
  checked: boolean;
}

interface InboxInsight {
  id: string;
  category: InboxCategory;
  reason: string;
  quote: string | null;
  summary: string;
}

const FIRST_SENTENCE = /(?<=[.!?])\s+/u;

const UNSAFE_CERTAINTY =
  /\b(?:safe to ignore|must (?:reply|respond)|definitely safe|verified sender|sender is verified)\b/iu;

const inboxGuidanceAllowed = (text: string): boolean =>
  !UNSAFE_CERTAINTY.test(text);

const localInboxInsight = (message: InboxMessage): InboxInsight => {
  const summary =
    message.summary ??
    message.bodyText.split(FIRST_SENTENCE)[0]?.slice(0, 240) ??
    "";

  const base = { id: message.id, quote: null, summary };

  if (message.suspicious) {
    return {
      ...base,
      category: "check_first",
      reason:
        "Warning signs were found. Check the message before replying, paying, or sharing details.",
    };
  }

  if (!message.checked) {
    return {
      ...base,
      category: "review",
      reason:
        "The automatic check has not finished. Review this message before deciding.",
    };
  }

  return { ...base, ...emailImportance(message) };
};

const inboxOverviewSchema = z.strictObject({
  items: z.array(
    z.strictObject({
      category: z.enum(inboxCategories),
      id: z.string(),
      quote: z
        .string()
        .describe("An exact quote from this email supporting the suggestion."),
      reason: z
        .string()
        .describe(
          "One short, cautious reason. Say may need a reply, never must reply or safe to ignore."
        ),
      summary: z.string().describe("One short sentence explaining this email."),
    })
  ),
  summary: z
    .string()
    .describe(
      "Two short sentences summarizing the inbox. No claim that a message is safe, legitimate, already answered, or completed."
    ),
});

type InboxOverview = z.infer<typeof inboxOverviewSchema>;

/** AI can explain a priority, but cannot override the deterministic classification. */
const checkInboxOverview = (
  messages: InboxMessage[],
  raw: InboxOverview
): InboxInsight[] =>
  messages.map((message) => {
    const local = localInboxInsight(message);
    const candidates = raw.items.filter((item) => item.id === message.id);
    const candidate = candidates.length === 1 ? candidates[0] : undefined;

    if (!candidate || local.category === "check_first" || !message.checked) {
      return local;
    }

    const source = `${message.subject}\n${message.bodyText}`;
    const match = locateQuote(source, candidate.quote);

    if (
      !candidate.quote.trim() ||
      !match.found ||
      !candidate.reason.trim() ||
      !candidate.summary.trim() ||
      !proseQuotesVerified(source, candidate.summary) ||
      !proseQuotesVerified(source, candidate.reason) ||
      !inboxGuidanceAllowed(`${candidate.reason} ${candidate.summary}`) ||
      candidate.category !== local.category
    ) {
      return local;
    }

    return {
      category: candidate.category,
      id: message.id,
      quote: match.text,
      reason: candidate.reason,
      summary: candidate.summary,
    };
  });

export {
  INBOX_IMPORTANCE_VERSION,
  INBOX_PAGE_SIZE,
  checkInboxOverview,
  inboxCategories,
  inboxGuidanceAllowed,
  inboxOverviewSchema,
  localInboxInsight,
};

export type { InboxCategory, InboxInsight, InboxMessage, InboxOverview };

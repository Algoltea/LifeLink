/**
 * Schemas for structured model output. Gemini (through OpenRouter) proposes;
 * the backend parses with these schemas, resolves every name and date against
 * stored data, and only then creates an action for the person to review.
 *
 * Nothing here can grant permissions, set spending limits, or approve.
 */
import { z } from "zod";

import { callWarningKinds } from "./call-screening";
import { signalStances } from "./evidence";

const nullableString = z.string().nullable();

const assistantIntents = [
  "ride_request",
  "send_message",
  "create_reminder",
  "create_appointment",
  "grocery_list",
  "scam_check",
  "email_summary",
  "answer_only",
  "clarify",
] as const;

const assistantPlanSchema = z.strictObject({
  appointmentId: nullableString.describe(
    "Id of the stored appointment the request refers to, copied exactly from context, or null."
  ),
  // Optional so proposals written before appointments could be added still parse.
  appointmentLocation: nullableString
    .optional()
    .describe(
      "For create_appointment: where it is, as the person said it, or null."
    ),
  appointmentTitle: nullableString
    .optional()
    .describe(
      "For create_appointment: a short name, such as Dentist or Eye doctor. Otherwise null."
    ),
  clarificationQuestion: nullableString.describe(
    "One short question when the recipient, date, or time is unclear; otherwise null."
  ),
  dateTimeAsSaid: nullableString.describe(
    "The person's own words for the date or time, or null."
  ),
  dateTimeIso: nullableString.describe(
    "An absolute ISO 8601 date-time with offset if, and only if, it is unambiguous; otherwise null. For ride_request only an explicitly stated appointment clock time or arrival time at rideDestination; null for day-only references or a time copied from saved context. Pickup belongs in pickupTimeIso."
  ),
  groceryItems: z
    .array(
      z.strictObject({
        name: z.string(),
        quantity: z.number().nullable(),
        unit: nullableString,
      })
    )
    .describe(
      "Items to add to a grocery list; empty unless the intent is grocery_list."
    ),
  groceryListId: nullableString
    .optional()
    .describe(
      "Explicit grocery list id, copied from context; null for the default list."
    ),
  groceryListName: nullableString
    .optional()
    .describe(
      "Explicit list name exactly as requested, even if unknown; null only when no list is named. Never replace an unknown name with the default list."
    ),
  intent: z.enum(assistantIntents),
  messageDraft: nullableString.describe(
    "The exact words to send, written in the person's voice, or null when nothing is being sent."
  ),
  pickupTimeAsSaid: nullableString
    .optional()
    .describe(
      "For a ride: an exact quote containing both the explicit pickup request and its clock time, distinct from the appointment time; otherwise null. Do not quote unrelated words or only an isolated time."
    ),
  pickupTimeIso: nullableString
    .optional()
    .describe(
      "For a ride: absolute requested pickup time with offset, only when explicitly requested and unambiguous; otherwise null. Never use the appointment start as pickup."
    ),
  recipients: z
    .array(
      z.strictObject({
        contactId: nullableString.describe(
          "Contact id copied exactly from context, or null if unsure."
        ),
        nameAsSaid: z.string(),
      })
    )
    .describe("Who the person wants to reach, as they said it."),
  reminderTitle: nullableString,
  reply: z
    .string()
    .describe(
      "What the assistant says back, in plain, warm, short sentences suitable for reading aloud."
    ),
  // Optional so proposals written before rides to places still parse.
  rideDestination: nullableString
    .optional()
    .describe(
      "For ride_request to a place that is not a stored appointment: where they need to go, as they said it. Otherwise null."
    ),
});

type AssistantPlan = z.infer<typeof assistantPlanSchema>;

const proposalIntents = [
  "ride_request",
  "send_message",
  "create_reminder",
  "create_appointment",
  "grocery_list",
  "scam_check",
] as const;

/**
 * Arguments of the agent's single `propose_action` tool. The agent writes its
 * own conversational reply as thread text; the tool only carries a proposal,
 * which the backend validates and turns into something awaiting approval.
 */
const proposalSchema = assistantPlanSchema
  .omit({ clarificationQuestion: true, reply: true })
  .extend({
    intent: z.enum(proposalIntents),
  });

type Proposal = z.infer<typeof proposalSchema>;

const scamVerdicts = [
  "likely_scam",
  "suspicious",
  "likely_safe",
  "unsure",
] as const;

const scamReviewSchema = z.strictObject({
  askTrustedContact: z.boolean(),
  confidence: z.enum(["low", "medium", "high"]),
  explanation: z
    .string()
    .describe("Two to four plain sentences explaining the verdict."),
  nextSteps: z
    .array(z.string())
    .describe("Short, concrete steps. Never ask the person to click a link."),
  signals: z.array(
    z.strictObject({
      detail: z.string(),
      label: z.string(),
      quote: nullableString.describe(
        "The exact words from the message, copied character for character, or null."
      ),
      stance: z
        .enum(signalStances)
        .describe(
          "requests: the message asks the reader to do this. warns_against: the message tells the reader not to do this. mentions: anything else."
        ),
    })
  ),
  verdict: z.enum(scamVerdicts),
});

type ScamReviewResult = z.infer<typeof scamReviewSchema>;

/** Warning signs in a rolling, unlabeled live-call transcript. */
const callWarningSchema = z.strictObject({
  signs: z
    .array(
      z.strictObject({
        kind: z.enum(callWarningKinds),
        quote: z
          .string()
          .describe(
            "The exact words from the transcript, copied character for character."
          ),
      })
    )
    .describe("Empty when nothing in the transcript is a clear warning sign."),
});

const replyKinds = ["accept", "clarify", "decline"] as const;

const quotedItem = z.strictObject({
  quote: z
    .string()
    .describe(
      "The exact words from the message, copied character for character."
    ),
  text: z.string().describe("One short, plain sentence."),
});

/**
 * "Help me understand this": a private, plain-language reading of one message.
 * Every request, date, and stated fact must quote the message; the backend
 * moves anything it cannot find word for word into interpretations.
 */
const messageExplanationSchema = z.strictObject({
  dates: z
    .array(
      z.strictObject({
        isoDate: nullableString.describe(
          "The calendar date as YYYY-MM-DD only if it is certain; otherwise null."
        ),
        quote: z
          .string()
          .describe(
            "The exact words for the date or time, copied character for character."
          ),
      })
    )
    .describe("Dates and times the message mentions."),
  interpretations: z
    .array(z.strictObject({ text: z.string(), why: z.string() }))
    .describe(
      "Possible meanings the message does not state. Each is a guess, and why says what suggests it."
    ),
  missingDetails: z
    .array(z.string())
    .describe("Details a reply would need that the message does not give."),
  plainSummary: z
    .string()
    .describe(
      "Two or three short, plain sentences saying what the message is about."
    ),
  requests: z
    .array(quotedItem)
    .describe("What the sender explicitly asks the reader to do or answer."),
  statedFacts: z
    .array(quotedItem)
    .describe("Things the message states as fact."),
  suggestedReplies: z
    .array(
      z.strictObject({
        draft: z
          .string()
          .describe(
            "The full reply in the reader's own voice: short, warm, and signed with their name."
          ),
        kind: z.enum(replyKinds),
        label: z.string().describe("Two to four words, such as Say yes."),
      })
    )
    .describe("Up to three optional replies: accept, clarify, or decline."),
});

type MessageExplanation = z.infer<typeof messageExplanationSchema>;

/**
 * The two halves are written by separate model calls: guidance for the owner
 * (which may use their private notes) and reply drafts (which never see them).
 */
const explanationGuidanceSchema = messageExplanationSchema.omit({
  suggestedReplies: true,
});

const suggestedRepliesSchema = messageExplanationSchema.pick({
  suggestedReplies: true,
});

type ExplanationGuidance = z.infer<typeof explanationGuidanceSchema>;

type SuggestedReplies = z.infer<typeof suggestedRepliesSchema>;

const recapEvidence = z.strictObject({
  messageRef: z
    .string()
    .describe("The ref of the message the words come from, such as m3."),
  quote: z
    .string()
    .describe(
      "The exact words from that message, copied character for character."
    ),
});

const recapStepKinds = ["send_message", "create_reminder"] as const;

/**
 * A recap of a text conversation. An offer is not an agreement, and the model
 * can never say something is done: LifeLink's own records decide that.
 */
const conversationRecapSchema = z.strictObject({
  agreements: z
    .array(
      z.strictObject({
        acceptance: recapEvidence,
        offer: recapEvidence,
        text: z.string().describe("What was agreed, in one plain sentence."),
      })
    )
    .describe(
      "Only where one person offered or asked and the other clearly accepted later."
    ),
  offers: z
    .array(
      z.strictObject({
        offer: recapEvidence,
        text: z.string().describe("What was offered, in one plain sentence."),
      })
    )
    .describe("Offers or requests that have not been clearly accepted."),
  proposedSteps: z
    .array(
      z.strictObject({
        kind: z.enum(recapStepKinds),
        messageDraft: nullableString.describe(
          "For send_message: the exact words, in the conversation's language and the person's voice. Otherwise null."
        ),
        remindAtIso: nullableString.describe(
          "For create_reminder: an absolute ISO 8601 time with offset. Otherwise null."
        ),
        reminderTitle: nullableString.describe(
          "For create_reminder: a short title. Otherwise null."
        ),
        why: z.string().describe("One plain sentence on why this might help."),
      })
    )
    .describe(
      "At most three possible next steps; the person reviews each one."
    ),
  summary: z
    .string()
    .describe("Two or three short, plain sentences about the conversation."),
  unclear: z
    .array(z.string())
    .describe("Things that are not settled yet, one short sentence each."),
});

type ConversationRecap = z.infer<typeof conversationRecapSchema>;

const appointmentExtractionSchema = z.strictObject({
  ambiguity: nullableString.describe(
    "What is unclear about the date, time, or place, or null."
  ),
  endsAtIso: nullableString,
  found: z.boolean(),
  location: nullableString,
  notes: nullableString,
  providerName: nullableString,
  startsAtIso: nullableString,
  title: nullableString,
});

type AppointmentExtraction = z.infer<typeof appointmentExtractionSchema>;

const replyDecisions = [
  "accepted",
  "declined",
  "counter_offer",
  "unclear",
] as const;

const replyClassificationSchema = z.strictObject({
  decision: z.enum(replyDecisions),
  pickupTimeAsSaid: nullableString,
  pickupTimeIso: nullableString.describe(
    "Absolute ISO 8601 time with offset if the reply states one clearly."
  ),
  summary: z
    .string()
    .describe("One plain sentence describing what the reply says."),
});

type ReplyClassification = z.infer<typeof replyClassificationSchema>;

const emailSummarySchema = z.strictObject({
  actionNeeded: nullableString,
  summary: z.string(),
  suspicious: z.boolean(),
});

type EmailSummary = z.infer<typeof emailSummarySchema>;

const briefingSchema = z.strictObject({
  greetingFact: z
    .string()
    .describe("The single most useful fact for today, in one short sentence."),
  lines: z
    .array(z.string())
    .describe("Two to five short sentences covering the rest of today."),
});

type Briefing = z.infer<typeof briefingSchema>;

const newsArticleKinds = ["news", "opinion", "sponsored"] as const;

const newsSummarySchema = z.strictObject({
  gist: z
    .string()
    .describe("What the article is about, in one plain sentence."),
  kind: z
    .enum(newsArticleKinds)
    .describe(
      "opinion for commentary, columns, or reviews; sponsored for advertising; otherwise news."
    ),
  points: z
    .array(z.string())
    .describe("Up to three short sentences with the most important facts."),
});

type NewsSummary = z.infer<typeof newsSummarySchema>;

export {
  appointmentExtractionSchema,
  callWarningSchema,
  assistantIntents,
  assistantPlanSchema,
  briefingSchema,
  conversationRecapSchema,
  recapStepKinds,
  proposalIntents,
  proposalSchema,
  emailSummarySchema,
  explanationGuidanceSchema,
  messageExplanationSchema,
  newsArticleKinds,
  newsSummarySchema,
  replyClassificationSchema,
  replyKinds,
  suggestedRepliesSchema,
  replyDecisions,
  scamReviewSchema,
  scamVerdicts,
};

export type {
  AppointmentExtraction,
  AssistantPlan,
  Briefing,
  ConversationRecap,
  Proposal,
  EmailSummary,
  ExplanationGuidance,
  MessageExplanation,
  NewsSummary,
  ReplyClassification,
  ScamReviewResult,
  SuggestedReplies,
};

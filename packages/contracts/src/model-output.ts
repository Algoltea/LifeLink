/**
 * Schemas for structured model output. Gemini (through OpenRouter) proposes;
 * the backend parses with these schemas, resolves every name and date against
 * stored data, and only then creates an action for the person to review.
 *
 * Nothing here can grant permissions, set spending limits, or approve.
 */
import { z } from "zod";

const nullableString = z.string().nullable();

const assistantIntents = [
  "ride_request",
  "send_message",
  "create_reminder",
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
  clarificationQuestion: nullableString.describe(
    "One short question when the recipient, date, or time is unclear; otherwise null."
  ),
  dateTimeAsSaid: nullableString.describe(
    "The person's own words for the date or time, or null."
  ),
  dateTimeIso: nullableString.describe(
    "An absolute ISO 8601 date-time with offset if, and only if, it is unambiguous; otherwise null."
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
  intent: z.enum(assistantIntents),
  messageDraft: nullableString.describe(
    "The exact words to send, written in the person's voice, or null when nothing is being sent."
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
});

type AssistantPlan = z.infer<typeof assistantPlanSchema>;

const proposalIntents = [
  "ride_request",
  "send_message",
  "create_reminder",
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
      quote: nullableString,
    })
  ),
  verdict: z.enum(scamVerdicts),
});

type ScamReviewResult = z.infer<typeof scamReviewSchema>;

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

export {
  appointmentExtractionSchema,
  assistantIntents,
  assistantPlanSchema,
  briefingSchema,
  proposalIntents,
  proposalSchema,
  emailSummarySchema,
  replyClassificationSchema,
  replyDecisions,
  scamReviewSchema,
  scamVerdicts,
};

export type {
  AppointmentExtraction,
  AssistantPlan,
  Briefing,
  Proposal,
  EmailSummary,
  ReplyClassification,
  ScamReviewResult,
};

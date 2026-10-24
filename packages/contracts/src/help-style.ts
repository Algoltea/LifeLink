/**
 * How the person likes LifeLink to explain things. These are structured
 * choices, not free text, so they shape wording without giving anyone a way
 * to instruct the model.
 */

const explanationDetails = ["short", "detailed"] as const;

type ExplanationDetail = (typeof explanationDetails)[number];

interface HelpStyle {
  detail: ExplanationDetail;
  stepByStep: boolean;
}

const DEFAULT_HELP_STYLE: HelpStyle = { detail: "short", stepByStep: false };

/** The stored preferences, with older rows read as the defaults. */
const helpStyleOf = (
  stored: {
    explanationDetail?: ExplanationDetail;
    stepByStep?: boolean;
  } | null
): HelpStyle => ({
  detail: stored?.explanationDetail ?? DEFAULT_HELP_STYLE.detail,
  stepByStep: stored?.stepByStep ?? DEFAULT_HELP_STYLE.stepByStep,
});

/** Prompt lines for explanations written for the owner. Never used for words sent to anyone else. */
const helpStyleLines = (style: HelpStyle): string[] => [
  style.detail === "short"
    ? "The person prefers short help: keep the summary to one or two short sentences, and list only the most important items."
    : "The person prefers detailed help: use up to four short sentences in the summary, and explain each item a little more.",
  ...(style.stepByStep
    ? [
        "The person prefers one step at a time: keep each item to a single idea.",
      ]
    : []),
];

export { DEFAULT_HELP_STYLE, explanationDetails, helpStyleLines, helpStyleOf };

export type { ExplanationDetail, HelpStyle };

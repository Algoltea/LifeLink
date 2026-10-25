/**
 * The order of the landing page's examples. Their words live in each
 * locale's `landing` messages; every person, time, and message is an example.
 */

const SCAM_EXAMPLE_IDS = ["text", "email", "letter", "call"] as const;

type ScamExampleId = (typeof SCAM_EXAMPLE_IDS)[number];

const FEATURE_IDS = [
  "email",
  "today",
  "groceries",
  "documents",
  "circle",
  "family",
  "recap",
  "help",
  "connections",
] as const;

type FeatureId = (typeof FEATURE_IDS)[number];

export type { FeatureId, ScamExampleId };

export { FEATURE_IDS, SCAM_EXAMPLE_IDS };

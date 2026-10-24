interface EmailWarningSource {
  scamCheck?: { verdict: string };
  suspicious: boolean | null;
}

const hasEmailWarning = (email: EmailWarningSource): boolean =>
  email.suspicious === true ||
  email.scamCheck?.verdict === "likely_scam" ||
  email.scamCheck?.verdict === "suspicious";

/** Say the caution before the sender's words, using the saved check's reasons. */
const emailWarningIntro = (
  email: EmailWarningSource,
  warningSigns: string[]
): string => {
  if (!hasEmailWarning(email)) {
    return "";
  }

  const reason =
    warningSigns.length > 0
      ? `Warning signs: ${warningSigns.join("; ")}.`
      : "This email raised a concern. Check the request before acting.";

  return `Potential scam. ${reason} If you're unsure, ask someone you trust before you reply, open a link, send money, or share personal details.`;
};

export { emailWarningIntro, hasEmailWarning };

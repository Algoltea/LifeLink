import { currentMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

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

  const t = currentMessages().email.warning;

  const reason =
    warningSigns.length > 0
      ? t.signs(
          warningSigns.map((sign) => translateServerMessage(sign)).join("; ")
        )
      : t.concern;

  return t.intro(reason);
};

export { emailWarningIntro, hasEmailWarning };

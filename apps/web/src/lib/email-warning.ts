import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { getLocale, messagesFor } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

interface EmailWarningSource {
  scamCheck?: { verdict: string };
  suspicious: boolean | null;
}

const hasEmailWarning = (email: EmailWarningSource): boolean =>
  email.suspicious === true ||
  email.scamCheck?.verdict === "likely_scam" ||
  email.scamCheck?.verdict === "suspicious";

/** Explain the local check's limits before reading the sender's words. */
const emailWarningIntro = (
  email: EmailWarningSource,
  warningSigns: string[],
  locale: InterfaceLocale = getLocale()
): string => {
  const { localLanguageNotice, warning: t } = messagesFor(locale).email;

  if (!hasEmailWarning(email)) {
    return email.scamCheck === undefined ? "" : localLanguageNotice;
  }

  const reason =
    warningSigns.length > 0
      ? t.signs(
          warningSigns
            .map((sign) => translateServerMessage(sign, locale))
            .join("; ")
        )
      : t.concern;

  return `${t.intro(reason)} ${localLanguageNotice}`;
};

export { emailWarningIntro, hasEmailWarning };

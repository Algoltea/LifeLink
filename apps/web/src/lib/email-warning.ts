import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { getLocale, messagesFor } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

interface EmailWarningSource {
  scamCheck?: { method?: string; model?: string; verdict: string };
  suspicious: boolean | null;
}

const emailCheckMethod = (
  email: EmailWarningSource
): "cloud" | "local" | "pending" | "unknown" => {
  const check = email.scamCheck;

  if (check === undefined) {
    return "pending";
  }

  if (check.method === "cloud") {
    return "cloud";
  }

  if (check.method === "local" || check.method === "rules") {
    return "local";
  }

  if (check.model?.startsWith("rules")) {
    return "local";
  }

  // Old automatic AI results also retain rulesVersion; it does not identify the method.
  return check.model?.trim() ? "cloud" : "unknown";
};

const emailCheckNotice = (
  email: EmailWarningSource,
  locale: InterfaceLocale = getLocale()
): string => {
  const t = messagesFor(locale).email;

  switch (emailCheckMethod(email)) {
    case "local": {
      return t.localLanguageNotice;
    }

    case "cloud": {
      return t.cloudCheckNotice;
    }

    case "unknown": {
      return t.unknownCheckNotice;
    }

    default: {
      return "";
    }
  }
};

/** Only known local labels are fixed catalog text; cloud or unknown labels stay verbatim. */
const emailWarningSign = (
  email: EmailWarningSource,
  sign: string,
  locale: InterfaceLocale = getLocale()
): string =>
  emailCheckMethod(email) === "local"
    ? translateServerMessage(sign, locale)
    : sign;

const hasEmailWarning = (email: EmailWarningSource): boolean =>
  email.suspicious === true ||
  email.scamCheck?.verdict === "likely_scam" ||
  email.scamCheck?.verdict === "suspicious";

/** Explain the saved check's limits before reading the sender's words. */
const emailWarningIntro = (
  email: EmailWarningSource,
  warningSigns: string[],
  locale: InterfaceLocale = getLocale()
): string => {
  const t = messagesFor(locale).email.warning;
  const notice = emailCheckNotice(email, locale);

  if (!hasEmailWarning(email)) {
    return notice;
  }

  const reason =
    warningSigns.length > 0
      ? t.signs(
          warningSigns
            .map((sign) => emailWarningSign(email, sign, locale))
            .join("; ")
        )
      : t.concern;

  return [t.intro(reason), notice].filter(Boolean).join(" ");
};

export {
  emailCheckNotice,
  emailWarningIntro,
  emailWarningSign,
  hasEmailWarning,
};

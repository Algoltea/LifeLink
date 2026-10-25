/**
 * Languages LifeLink's own words are written in: screens, fixed messages, and
 * the introduction a contact receives. These match the cloud help languages;
 * anything without a translation here falls back to English. Chinese copy is
 * Simplified only, so explicit Traditional Chinese tags fall back to English.
 */

const interfaceLocales = [
  { id: "en", intl: "en-US", label: "English" },
  { id: "es", intl: "es-US", label: "Español" },
  { id: "fr", intl: "fr-FR", label: "Français" },
  { id: "de", intl: "de-DE", label: "Deutsch" },
  { id: "it", intl: "it-IT", label: "Italiano" },
  { id: "pt", intl: "pt-BR", label: "Português" },
  { id: "zh", intl: "zh-CN", label: "中文（简体）" },
  { id: "vi", intl: "vi-VN", label: "Tiếng Việt" },
  { id: "ko", intl: "ko-KR", label: "한국어" },
  { id: "tl", intl: "fil-PH", label: "Tagalog" },
] as const;

type InterfaceLocale = (typeof interfaceLocales)[number]["id"];

const DEFAULT_LOCALE: InterfaceLocale = "en";

/** BCP 47 script and region, before extensions or private-use subtags. Shared with the boot script. */
const CHINESE_LOCALE_PATTERN =
  /^zh(?:-[a-z]{3}){0,3}(?:-(?<script>[a-z]{4}))?(?:-(?<region>[a-z]{2}|[0-9]{3}))?(?:-|$)/u;

const isInterfaceLocale = (
  candidate: string | null | undefined
): candidate is InterfaceLocale =>
  interfaceLocales.some((locale) => locale.id === candidate);

/** The interface locale for a stored language, a browser tag like "es-MX", or nothing. */
const interfaceLocaleOf = (
  language: string | null | undefined
): InterfaceLocale => {
  const tag = language?.trim().toLowerCase() ?? "";
  const [base] = tag.split("-");

  if (base === "zh") {
    const variant = CHINESE_LOCALE_PATTERN.exec(tag)?.groups;

    // An explicit script wins over region, including Hans in Taiwan or Hong Kong.
    if (variant?.script) {
      return variant.script === "hans" ? "zh" : DEFAULT_LOCALE;
    }

    if (["tw", "hk", "mo"].includes(variant?.region ?? "")) {
      return DEFAULT_LOCALE;
    }
  }

  if (base === "fil") {
    return "tl";
  }

  return isInterfaceLocale(base) ? base : DEFAULT_LOCALE;
};

/** The BCP 47 tag for Intl formatting and speech in this locale. */
const intlLocaleOf = (locale: InterfaceLocale): string =>
  interfaceLocales.find((candidate) => candidate.id === locale)?.intl ??
  "en-US";

export {
  CHINESE_LOCALE_PATTERN,
  DEFAULT_LOCALE,
  interfaceLocaleOf,
  interfaceLocales,
  intlLocaleOf,
  isInterfaceLocale,
};

export type { InterfaceLocale };

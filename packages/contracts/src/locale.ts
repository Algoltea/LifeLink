/**
 * Languages LifeLink's own words are written in: screens, fixed messages, and
 * the introduction a contact receives. Cloud explanations reach more languages
 * through the support language in help-style; anything without a translation
 * here falls back to English.
 */

const interfaceLocales = [
  { id: "en", intl: "en-US", label: "English" },
  { id: "es", intl: "es-US", label: "Español" },
] as const;

type InterfaceLocale = (typeof interfaceLocales)[number]["id"];

const DEFAULT_LOCALE: InterfaceLocale = "en";

const isInterfaceLocale = (
  candidate: string | null | undefined
): candidate is InterfaceLocale =>
  interfaceLocales.some((locale) => locale.id === candidate);

/** The interface locale for a stored language, a browser tag like "es-MX", or nothing. */
const interfaceLocaleOf = (
  language: string | null | undefined
): InterfaceLocale => {
  const base = language?.trim().toLowerCase().split("-")[0];

  return isInterfaceLocale(base) ? base : DEFAULT_LOCALE;
};

/** The BCP 47 tag for Intl formatting and speech in this locale. */
const intlLocaleOf = (locale: InterfaceLocale): string =>
  interfaceLocales.find((candidate) => candidate.id === locale)?.intl ??
  "en-US";

export {
  DEFAULT_LOCALE,
  interfaceLocaleOf,
  interfaceLocales,
  intlLocaleOf,
  isInterfaceLocale,
};

export type { InterfaceLocale };

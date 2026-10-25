import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { getLocale } from "./locale";
import { serverCatalogs } from "./server/catalogs";

/**
 * The backend writes its messages in English. Known messages are shown in
 * the person's language; anything unknown is shown as written, so a missing
 * translation never hides what went wrong.
 */
const translateServerMessage = (
  message: string,
  locale: InterfaceLocale = getLocale()
): string => {
  if (locale === "en") {
    return message;
  }

  const text = message.trim();
  const catalog = serverCatalogs[locale];

  const exact = Object.hasOwn(catalog.exact, text)
    ? catalog.exact[text]
    : undefined;

  if (exact !== undefined) {
    return exact;
  }

  for (const [pattern, replace] of catalog.patterns) {
    const match = pattern.exec(text);

    if (match) {
      return replace(...match.slice(1));
    }
  }

  return message;
};

export { translateServerMessage };

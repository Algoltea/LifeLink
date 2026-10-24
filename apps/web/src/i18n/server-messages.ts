import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { getLocale } from "./locale";
import { es as spanish } from "./server/es";

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

  const exact = Object.hasOwn(spanish.exact, text)
    ? spanish.exact[text]
    : undefined;

  if (exact !== undefined) {
    return exact;
  }

  for (const [pattern, replace] of spanish.patterns) {
    const match = pattern.exec(text);

    if (match) {
      return replace(...match.slice(1));
    }
  }

  return message;
};

export { translateServerMessage };

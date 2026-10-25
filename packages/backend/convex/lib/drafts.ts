import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { formatDay, formatTime } from "./time";

/**
 * Messages LifeLink drafts for the owner to send, in the language the
 * recipient reads. The owner still reviews and can change every word.
 */

interface RideRequestDraft {
  firstName: string;
  location: string | null;
  signOff: string;
  startsAt: number;
  timeZone: string;
  title: string;
}

const rideRequestDraft = (
  draft: RideRequestDraft,
  locale: InterfaceLocale
): string => {
  const intl = intlLocaleOf(locale);
  const day = formatDay(draft.startsAt, draft.timeZone, intl);
  const time = formatTime(draft.startsAt, draft.timeZone, intl);

  if (locale === "es") {
    const place = draft.location === null ? "" : ` en ${draft.location}`;

    return [
      `Hola, ${draft.firstName}. ¿Me podrías llevar a ${draft.title}${place} el ${day}?`,
      `Necesito estar allí a las ${time}.`,
      `¡Gracias! ${draft.signOff}`,
    ].join(" ");
  }

  const place = draft.location === null ? "" : ` at ${draft.location}`;

  return [
    `Hi ${draft.firstName}, could you give me a ride to ${draft.title}${place} on ${day}?`,
    `I need to be there by ${time}.`,
    `Thank you! ${draft.signOff}`,
  ].join(" ");
};

interface CheckRequestDraft {
  email: boolean;
  firstName: string;
  signOff: string;
}

const checkRequestDraft = (
  draft: CheckRequestDraft,
  locale: InterfaceLocale
): string => {
  if (locale === "es") {
    const what = draft.email ? "un correo" : "un mensaje";

    return `Hola, ${draft.firstName}. Recibí ${what} que me genera dudas. ¿Me ayudas a revisar si es real antes de hacer algo? ${draft.signOff}`;
  }

  const what = draft.email ? "an email" : "a message";

  return `Hi ${draft.firstName}, I got ${what} that I'm not sure about. It looks a bit odd. Could you help me check whether it's real before I do anything? ${draft.signOff}`;
};

export { checkRequestDraft, rideRequestDraft };

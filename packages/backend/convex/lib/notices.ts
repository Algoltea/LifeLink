import type { InterfaceLocale } from "@lifelink/contracts/locale";

/**
 * LifeLink's own short service replies to the people its owners write to.
 * Never used for approved messages, which are sent exactly as approved.
 */
interface Notices {
  photoOnly: string;
  telegramAlreadyConnected: string;
  telegramConnected: (names: string[]) => string;
  telegramExpired: string;
  telegramStartHelp: (
    firstName: string | null,
    username: string | null
  ) => string;
}

const joinNames = (names: string[], and: string): string =>
  names.length <= 1
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} ${and} ${names.at(-1)}`;

const NOTICES: Record<InterfaceLocale, Notices> = {
  en: {
    photoOnly: "(Sent a photo. Open Telegram to see it.)",
    telegramAlreadyConnected:
      "You're already connected. Anything you send here goes to your family member in LifeLink.",
    telegramConnected: (names) =>
      `You're connected. Messages from ${joinNames(names, "and") || "your family member"} will arrive here, and your replies go back to them.`,
    telegramExpired:
      "This link has expired or was already used. Ask the person who uses LifeLink to send you a new one.",
    telegramStartHelp: (firstName, username) =>
      `Hi${firstName ? ` ${firstName}` : ""}! To connect, ask your family member to add your Telegram username${username ? ` @${username}` : ""} in LifeLink, or to send you their LifeLink link. Then tap Start again.`,
  },
  es: {
    photoOnly: "(Envió una foto. Abra Telegram para verla).",
    telegramAlreadyConnected:
      "Su conexión ya está lista. Todo lo que envíe aquí le llega a su familiar en LifeLink.",
    telegramConnected: (names) =>
      `Su conexión está lista. Los mensajes de ${joinNames(names, "y") || "su familiar"} llegarán aquí, y sus respuestas se envían de vuelta.`,
    telegramExpired:
      "Este enlace venció o ya se usó. Pídale a la persona que usa LifeLink que le envíe uno nuevo.",
    telegramStartHelp: (firstName, username) =>
      `¡Hola${firstName ? ` ${firstName}` : ""}! Para conectarse, pídale a su familiar que agregue su usuario de Telegram${username ? ` @${username}` : ""} en LifeLink, o que le envíe su enlace de LifeLink. Luego toque Iniciar (Start) otra vez.`,
  },
};

const noticesFor = (locale: InterfaceLocale): Notices => NOTICES[locale];

export { noticesFor };

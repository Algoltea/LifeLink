import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { formatDay, formatTime } from "./time";

/** New drafts follow the recipient's language. Saved and approved words never pass through this catalog. */
interface RideRequestDraft {
  firstName: string;
  location: string | null;
  signOff: string;
  startsAt: number;
  timeZone: string;
  title: string;
}

interface RidePlaceDraft {
  firstName: string;
  place: string;
  signOff: string;
  startsAt: number;
  timeZone: string;
}

interface CheckRequestDraft {
  email: boolean;
  firstName: string;
  signOff: string;
}

interface DraftMessages {
  check: (draft: CheckRequestDraft) => string;
  ride: (draft: RideRequestDraft, day: string, time: string) => string;
  ridePlace: (draft: RidePlaceDraft, day: string, time: string) => string;
}

const DRAFTS: Record<InterfaceLocale, DraftMessages> = {
  de: {
    check: ({ email, firstName, signOff }) =>
      `Hallo ${firstName}, ich habe ${email ? "eine E-Mail" : "eine Nachricht"} bekommen und bin mir nicht sicher, ob sie echt ist. Kannst du mir helfen, das zu prüfen, bevor ich etwas unternehme? ${signOff}`,
    ride: (draft, day, time) =>
      `Hallo ${draft.firstName}, könntest du mich am ${day} zu meinem Termin „${draft.title}“${draft.location === null ? "" : ` bei ${draft.location}`} fahren? Ich muss um ${time} dort sein. Danke! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Hallo ${draft.firstName}, könntest du mich am ${day} zu ${draft.place} fahren? Ich muss um ${time} dort sein. Danke! ${draft.signOff}`,
  },
  en: {
    check: ({ email, firstName, signOff }) =>
      `Hi ${firstName}, I got ${email ? "an email" : "a message"} that I'm not sure about. It looks a bit odd. Could you help me check whether it's real before I do anything? ${signOff}`,
    ride: (draft, day, time) =>
      `Hi ${draft.firstName}, could you give me a ride to ${draft.title}${draft.location === null ? "" : ` at ${draft.location}`} on ${day}? I need to be there by ${time}. Thank you! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Hi ${draft.firstName}, could you give me a ride to ${draft.place} on ${day}? I need to be there by ${time}. Thank you! ${draft.signOff}`,
  },
  es: {
    check: ({ email, firstName, signOff }) =>
      `Hola, ${firstName}. Recibí ${email ? "un correo" : "un mensaje"} que me genera dudas. ¿Me ayudas a revisar si es real antes de hacer algo? ${signOff}`,
    ride: (draft, day, time) =>
      `Hola, ${draft.firstName}. ¿Me podrías llevar a ${draft.title}${draft.location === null ? "" : ` en ${draft.location}`} el ${day}? Necesito estar allí a las ${time}. ¡Gracias! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Hola, ${draft.firstName}. ¿Me podrías llevar a ${draft.place} el ${day}? Necesito estar allí a las ${time}. ¡Gracias! ${draft.signOff}`,
  },
  fr: {
    check: ({ email, firstName, signOff }) =>
      `Bonjour ${firstName}, j'ai reçu ${email ? "un e-mail" : "un message"} qui me laisse dans le doute. Peux-tu m'aider à vérifier s'il est authentique avant que je fasse quoi que ce soit ? ${signOff}`,
    ride: (draft, day, time) =>
      `Bonjour ${draft.firstName}, pourrais-tu m'accompagner en voiture pour mon rendez-vous « ${draft.title} »${draft.location === null ? "" : ` à ${draft.location}`} le ${day} ? Je dois y être à ${time}. Merci ! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Bonjour ${draft.firstName}, pourrais-tu me conduire à ${draft.place} le ${day} ? Je dois y être à ${time}. Merci ! ${draft.signOff}`,
  },
  it: {
    check: ({ email, firstName, signOff }) =>
      `Ciao ${firstName}, ho ricevuto ${email ? "un'e-mail" : "un messaggio"} che mi lascia qualche dubbio. Mi aiuti a verificare se è ${email ? "autentica" : "autentico"} prima che faccia qualcosa? ${signOff}`,
    ride: (draft, day, time) =>
      `Ciao ${draft.firstName}, potresti accompagnarmi in auto al mio appuntamento «${draft.title}»${draft.location === null ? "" : ` presso ${draft.location}`} il ${day}? Devo essere lì per le ${time}. Grazie! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Ciao ${draft.firstName}, potresti accompagnarmi in auto a ${draft.place} il ${day}? Devo essere lì per le ${time}. Grazie! ${draft.signOff}`,
  },
  ko: {
    check: ({ email, firstName, signOff }) =>
      `${firstName} 님, 안녕하세요. ${email ? "이메일을" : "메시지를"} 받았는데 진짜인지 잘 모르겠어요. 제가 무언가 하기 전에 확인하는 것을 도와주실 수 있나요? ${signOff}`,
    ride: (draft, day, time) =>
      `${draft.firstName} 님, 안녕하세요. ${day}에 “${draft.title}” 예약이 있는데 차로 데려다주실 수 있나요?${draft.location === null ? "" : ` 장소는 ${draft.location}입니다.`} ${time}까지 도착해야 해요. 감사합니다! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `${draft.firstName} 님, 안녕하세요. ${day}에 ${draft.place}까지 차로 데려다주실 수 있나요? ${time}까지 도착해야 해요. 감사합니다! ${draft.signOff}`,
  },
  pt: {
    check: ({ email, firstName, signOff }) =>
      `Olá, ${firstName}. Recebi ${email ? "um e-mail" : "uma mensagem"} que me deixou com dúvidas. Você pode me ajudar a verificar se é de verdade antes de eu fazer alguma coisa? ${signOff}`,
    ride: (draft, day, time) =>
      `Olá, ${draft.firstName}. Você poderia me levar ao meu compromisso «${draft.title}»${draft.location === null ? "" : ` em ${draft.location}`} no dia ${day}? Preciso estar lá às ${time}. Agradeço! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Olá, ${draft.firstName}. Você poderia me levar a ${draft.place} no dia ${day}? Preciso estar lá às ${time}. Agradeço! ${draft.signOff}`,
  },
  tl: {
    check: ({ email, firstName, signOff }) =>
      `Kumusta, ${firstName}. May natanggap akong ${email ? "email" : "mensahe"} na hindi ako sigurado kung totoo. Maaari mo ba akong tulungang suriin ito bago ako gumawa ng anuman? ${signOff}`,
    ride: (draft, day, time) =>
      `Kumusta, ${draft.firstName}. Maaari mo ba akong ihatid sa appointment kong “${draft.title}”${draft.location === null ? "" : ` sa ${draft.location}`} sa ${day}? Kailangan kong makarating nang hindi lalampas sa ${time}. Salamat! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Kumusta, ${draft.firstName}. Maaari mo ba akong ihatid sa ${draft.place} sa ${day}? Kailangan kong makarating nang hindi lalampas sa ${time}. Salamat! ${draft.signOff}`,
  },
  vi: {
    check: ({ email, firstName, signOff }) =>
      `Chào ${firstName}, tôi nhận được ${email ? "một email" : "một tin nhắn"} mà tôi chưa yên tâm. Bạn có thể giúp tôi kiểm tra xem có thật không trước khi tôi làm gì không? ${signOff}`,
    ride: (draft, day, time) =>
      `Chào ${draft.firstName}, bạn có thể chở tôi đến cuộc hẹn «${draft.title}»${draft.location === null ? "" : ` tại ${draft.location}`} vào ${day} không? Tôi cần có mặt trước ${time}. Cảm ơn bạn! ${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `Chào ${draft.firstName}, bạn có thể chở tôi đến ${draft.place} vào ${day} không? Tôi cần có mặt trước ${time}. Cảm ơn bạn! ${draft.signOff}`,
  },
  zh: {
    check: ({ email, firstName, signOff }) =>
      `${firstName}，你好。我收到${email ? "一封邮件" : "一条消息"}，不太确定是不是真的。你能帮我核实一下吗？我会先等一等，不采取行动。${signOff}`,
    ride: (draft, day, time) =>
      `${draft.firstName}，你好。${day}你能开车送我去参加“${draft.title}”的预约吗？${draft.location === null ? "" : `地点是${draft.location}。`}我需要在${time}之前到达。谢谢！${draft.signOff}`,
    ridePlace: (draft, day, time) =>
      `${draft.firstName}，你好。${day}你能开车送我去${draft.place}吗？我需要在${time}之前到达。谢谢！${draft.signOff}`,
  },
};

const rideRequestDraft = (
  draft: RideRequestDraft,
  locale: InterfaceLocale
): string => {
  const intl = intlLocaleOf(locale);

  return DRAFTS[locale].ride(
    draft,
    formatDay(draft.startsAt, draft.timeZone, intl),
    formatTime(draft.startsAt, draft.timeZone, intl)
  );
};

const ridePlaceDraft = (
  draft: RidePlaceDraft,
  locale: InterfaceLocale
): string => {
  const intl = intlLocaleOf(locale);

  return DRAFTS[locale].ridePlace(
    draft,
    formatDay(draft.startsAt, draft.timeZone, intl),
    formatTime(draft.startsAt, draft.timeZone, intl)
  );
};

const checkRequestDraft = (
  draft: CheckRequestDraft,
  locale: InterfaceLocale
): string => DRAFTS[locale].check(draft);

export { checkRequestDraft, ridePlaceDraft, rideRequestDraft };

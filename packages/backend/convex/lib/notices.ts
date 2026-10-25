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
  de: {
    photoOnly:
      "(Ein Foto wurde gesendet. Öffnen Sie Telegram, um es anzusehen.)",
    telegramAlreadyConnected:
      "Sie sind bereits verbunden. Alles, was Sie hier senden, kommt bei Ihrem Familienmitglied in LifeLink an.",
    telegramConnected: (names) =>
      `Sie sind verbunden. Nachrichten von ${joinNames(names, "und") || "Ihrem Familienmitglied"} kommen hier an. Ihre Antworten werden zurückgesendet.`,
    telegramExpired:
      "Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitten Sie die Person, die LifeLink nutzt, um einen neuen Link.",
    telegramStartHelp: (firstName, username) =>
      `Hallo${firstName ? ` ${firstName}` : ""}! Bitten Sie Ihr Familienmitglied, Ihren Telegram-Benutzernamen${username ? ` @${username}` : ""} in LifeLink hinzuzufügen oder Ihnen den LifeLink-Link zu senden. Tippen Sie danach erneut auf Start.`,
  },
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
  fr: {
    photoOnly: "(Une photo a été envoyée. Ouvrez Telegram pour la voir.)",
    telegramAlreadyConnected:
      "La connexion est déjà établie. Tout ce que vous envoyez ici parvient à votre proche dans LifeLink.",
    telegramConnected: (names) =>
      `La connexion est établie. Les messages de ${joinNames(names, "et") || "votre proche"} arriveront ici, et vos réponses seront transmises en retour.`,
    telegramExpired:
      "Ce lien a expiré ou a déjà été utilisé. Demandez à la personne qui utilise LifeLink de vous en envoyer un nouveau.",
    telegramStartHelp: (firstName, username) =>
      `Bonjour${firstName ? ` ${firstName}` : ""} ! Pour vous connecter, demandez à votre proche d'ajouter votre nom d'utilisateur Telegram${username ? ` @${username}` : ""} dans LifeLink ou de vous envoyer son lien LifeLink. Appuyez ensuite de nouveau sur Démarrer (Start).`,
  },
  it: {
    photoOnly: "(È stata inviata una foto. Apra Telegram per vederla.)",
    telegramAlreadyConnected:
      "Il collegamento è già attivo. Tutto ciò che invia qui arriva al suo familiare in LifeLink.",
    telegramConnected: (names) =>
      `Il collegamento è attivo. I messaggi di ${joinNames(names, "e") || "un suo familiare"} arriveranno qui e le sue risposte saranno inviate al mittente.`,
    telegramExpired:
      "Questo link è scaduto o è già stato usato. Chieda alla persona che usa LifeLink di inviarne uno nuovo.",
    telegramStartHelp: (firstName, username) =>
      `Salve${firstName ? ` ${firstName}` : ""}! Per collegarsi, chieda al suo familiare di aggiungere il suo nome utente Telegram${username ? ` @${username}` : ""} in LifeLink o di inviarle il link LifeLink. Poi tocchi di nuovo Avvia (Start).`,
  },
  ko: {
    photoOnly: "(사진을 보냈습니다. Telegram을 열어 확인해 주세요.)",
    telegramAlreadyConnected:
      "이미 연결되어 있습니다. 여기에서 보내시는 내용은 LifeLink에 있는 가족에게 전달됩니다.",
    telegramConnected: (names) =>
      `연결되었습니다. ${names.length === 0 ? "가족" : `${names.join(", ")} 님`}의 메시지가 여기로 도착하며, 답장은 상대방에게 전달됩니다.`,
    telegramExpired:
      "이 링크는 만료되었거나 이미 사용되었습니다. LifeLink를 사용하는 분께 새 링크를 보내 달라고 부탁해 주세요.",
    telegramStartHelp: (firstName, username) =>
      `${firstName ? `${firstName} 님, ` : ""}안녕하세요! 연결하려면 가족에게 Telegram 사용자 이름${username ? ` @${username}` : ""}을 LifeLink에 추가하거나 LifeLink 링크를 보내 달라고 부탁해 주세요. 그런 다음 시작(Start)을 다시 눌러 주세요.`,
  },
  pt: {
    photoOnly: "(Uma foto foi enviada. Abra o Telegram para vê-la.)",
    telegramAlreadyConnected:
      "Sua conexão já está pronta. Tudo o que você enviar aqui chega ao seu familiar no LifeLink.",
    telegramConnected: (names) =>
      `Sua conexão está pronta. As mensagens de ${joinNames(names, "e") || "seu familiar"} chegarão aqui, e suas respostas serão enviadas de volta.`,
    telegramExpired:
      "Este link expirou ou já foi usado. Peça à pessoa que usa o LifeLink para enviar um novo.",
    telegramStartHelp: (firstName, username) =>
      `Olá${firstName ? `, ${firstName}` : ""}! Para se conectar, peça ao seu familiar para adicionar seu nome de usuário do Telegram${username ? ` @${username}` : ""} no LifeLink ou enviar o link do LifeLink. Depois toque em Iniciar (Start) novamente.`,
  },
  tl: {
    photoOnly: "(Nagpadala ng larawan. Buksan ang Telegram para makita ito.)",
    telegramAlreadyConnected:
      "Nakakonekta na kayo. Ang anumang ipadala ninyo rito ay mapupunta sa inyong kapamilya sa LifeLink.",
    telegramConnected: (names) =>
      `Nakakonekta na kayo. Dito darating ang mga mensahe mula ${names.length === 0 ? "sa inyong kapamilya" : `${names.length === 1 ? "kay" : "kina"} ${joinNames(names, "at")}`}, at maipapadala sa kanila ang inyong mga sagot.`,
    telegramExpired:
      "Nag-expire na o nagamit na ang link na ito. Hilingin sa taong gumagamit ng LifeLink na magpadala ng bago.",
    telegramStartHelp: (firstName, username) =>
      `Kumusta${firstName ? `, ${firstName}` : ""}! Para makakonekta, hilingin sa inyong kapamilya na idagdag ang inyong Telegram username${username ? ` @${username}` : ""} sa LifeLink, o ipadala ang kanilang LifeLink link. Pagkatapos, pindutin muli ang Start.`,
  },
  vi: {
    photoOnly: "(Đã gửi một ảnh. Hãy mở Telegram để xem.)",
    telegramAlreadyConnected:
      "Bạn đã được kết nối. Mọi nội dung bạn gửi ở đây sẽ đến người thân của bạn trong LifeLink.",
    telegramConnected: (names) =>
      `Đã kết nối. Tin nhắn từ ${joinNames(names, "và") || "người thân của bạn"} sẽ đến đây, và câu trả lời của bạn sẽ được gửi lại cho họ.`,
    telegramExpired:
      "Liên kết này đã hết hạn hoặc đã được sử dụng. Hãy nhờ người dùng LifeLink gửi cho bạn liên kết mới.",
    telegramStartHelp: (firstName, username) =>
      `Xin chào${firstName ? ` ${firstName}` : ""}! Để kết nối, hãy nhờ người thân thêm tên người dùng Telegram${username ? ` @${username}` : ""} của bạn vào LifeLink, hoặc gửi cho bạn liên kết LifeLink. Sau đó nhấn Bắt đầu (Start) lần nữa.`,
  },
  zh: {
    photoOnly: "（发送了一张照片。请打开Telegram查看。）",
    telegramAlreadyConnected:
      "您已连接成功。您在这里发送的内容会送达家人在LifeLink中的账户。",
    telegramConnected: (names) =>
      `您已连接成功。${joinNames(names, "和") || "您家人"}的消息会显示在这里，您的回复也会送达对方。`,
    telegramExpired:
      "此链接已过期或已使用。请让使用LifeLink的人给您发送一个新链接。",
    telegramStartHelp: (firstName, username) =>
      `${firstName ? `${firstName}，` : ""}您好！请让家人在LifeLink中添加您的Telegram用户名${username ? ` @${username}` : ""}，或向您发送LifeLink链接，以便建立连接。然后再次点击“开始（Start）”。`,
  },
};

const noticesFor = (locale: InterfaceLocale): Notices => NOTICES[locale];

export { noticesFor };

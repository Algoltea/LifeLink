import type { InterfaceLocale } from "@lifelink/contracts/locale";

interface AssistantMessages {
  invalidProposal: string;
  notConfigured: string;
  practiceEnglishOnly: string;
  providerError: (reason: string) => string;
}

/** Provider diagnostics are inserted unchanged; Practice still parses only English requests. */
const ASSISTANT_MESSAGES: Record<InterfaceLocale, AssistantMessages> = {
  de: {
    invalidProposal:
      "In dieser Anfrage fehlen die nötigen Angaben. Deshalb wurde nichts vorbereitet.",
    notConfigured:
      "Der Assistent ist noch nicht eingerichtet. Deshalb kann ich das noch nicht für Sie vorbereiten. Unter Nachrichten können Sie Ihrer Familie weiterhin schreiben. Die Person, die die App eingerichtet hat, kann dies mit bun run dev:setup abschließen.",
    practiceEnglishOnly:
      "Im Übungsmodus ohne verbundenes Assistentenmodell verstehe ich nur Anfragen auf Englisch zu Fahrten, Nachrichtenentwürfen, Einkaufslisten und Betrugsprüfungen. Unter Nachrichten können Sie eigene Nachrichten in jeder Sprache schreiben.",
    providerError: (reason) =>
      `Ich konnte das gerade nicht bearbeiten (${reason}). Prüfen Sie im Gespräch, ob schon etwas vorbereitet wurde, und versuchen Sie es gleich noch einmal.`,
  },
  en: {
    invalidProposal:
      "That request did not have the details I need, so nothing was prepared.",
    notConfigured:
      "The assistant is not set up yet, so I can't plan this for you. You can still write to family from Messages. Whoever set up the app can finish it with bun run dev:setup.",
    practiceEnglishOnly:
      "In practice mode without the assistant model connected, I only understand requests in English for rides, message drafts, grocery items, or scam checks. You can write your own messages in any language from Messages.",
    providerError: (reason) =>
      `I couldn't work that out just now (${reason}). Check the conversation for anything already prepared, and try again in a moment.`,
  },
  es: {
    invalidProposal:
      "Esa petición no incluía los detalles necesarios, así que no se preparó nada.",
    notConfigured:
      "El asistente aún no está configurado, así que no puedo preparar esto. Puede escribir a su familia desde Mensajes. Quien configuró la aplicación puede terminar con bun run dev:setup.",
    practiceEnglishOnly:
      "En el modo de práctica sin el asistente conectado, solo entiendo peticiones en inglés para pedir transporte, preparar mensajes, añadir productos o revisar mensajes sospechosos. Puede escribir sus propios mensajes en cualquier idioma desde Mensajes.",
    providerError: (reason) =>
      `No pude resolverlo ahora (${reason}). Revise la conversación por si se preparó algo y vuelva a intentarlo en un momento.`,
  },
  fr: {
    invalidProposal:
      "Cette demande ne contenait pas les détails nécessaires. Rien n'a donc été préparé.",
    notConfigured:
      "L'assistant n'est pas encore configuré, je ne peux donc pas préparer cette demande. Vous pouvez toujours écrire à vos proches depuis Messages. La personne qui a installé l'application peut terminer avec bun run dev:setup.",
    practiceEnglishOnly:
      "En mode entraînement, sans connexion au modèle de l'assistant, je comprends uniquement les demandes en anglais pour les trajets, les brouillons de messages, les courses et les vérifications d'arnaques. Vous pouvez écrire vos propres messages dans n'importe quelle langue depuis Messages.",
    providerError: (reason) =>
      `Je n'ai pas pu traiter cette demande pour le moment (${reason}). Vérifiez dans la conversation si quelque chose a déjà été préparé, puis réessayez dans un instant.`,
  },
  it: {
    invalidProposal:
      "La richiesta non conteneva i dettagli necessari, quindi non è stato preparato nulla.",
    notConfigured:
      "L'assistente non è ancora configurato, quindi non posso preparare questa richiesta. Può comunque scrivere ai familiari da Messaggi. Chi ha configurato l'app può completare la procedura con bun run dev:setup.",
    practiceEnglishOnly:
      "In modalità prova, senza il modello dell'assistente collegato, capisco solo richieste in inglese per passaggi, bozze di messaggi, prodotti della spesa o controlli delle truffe. Può scrivere i suoi messaggi in qualsiasi lingua da Messaggi.",
    providerError: (reason) =>
      `Non sono riuscito a elaborare la richiesta in questo momento (${reason}). Controlli nella conversazione se è già stato preparato qualcosa e riprovi tra poco.`,
  },
  ko: {
    invalidProposal:
      "요청에 필요한 세부 정보가 없어 아무것도 준비하지 않았습니다.",
    notConfigured:
      "아직 도우미가 설정되지 않아 이 요청을 준비해 드릴 수 없습니다. 메시지에서 가족에게 글을 보내실 수는 있습니다. 앱을 설정한 분이 bun run dev:setup으로 설정을 마칠 수 있습니다.",
    practiceEnglishOnly:
      "도우미 모델이 연결되지 않은 연습 모드에서는 차량 이동 요청, 메시지 초안, 장보기 항목 추가, 사기 확인에 관한 영어 요청만 이해할 수 있습니다. 메시지에서는 어떤 언어로든 직접 글을 쓰실 수 있습니다.",
    providerError: (reason) =>
      `지금은 요청을 처리하지 못했습니다(${reason}). 대화에서 이미 준비된 내용이 있는지 확인하신 후 잠시 뒤 다시 시도해 주세요.`,
  },
  pt: {
    invalidProposal:
      "Esse pedido não tinha os detalhes necessários, por isso nada foi preparado.",
    notConfigured:
      "O assistente ainda não está configurado, por isso não posso preparar isso. Você pode continuar escrevendo para a família em Mensagens. Quem configurou o aplicativo pode concluir com bun run dev:setup.",
    practiceEnglishOnly:
      "No modo de prática sem o modelo do assistente conectado, só entendo pedidos em inglês para transporte, rascunhos de mensagens, itens de compras ou verificação de golpes. Você pode escrever suas próprias mensagens em qualquer idioma em Mensagens.",
    providerError: (reason) =>
      `Não consegui resolver isso agora (${reason}). Confira na conversa se algo já foi preparado e tente novamente em instantes.`,
  },
  tl: {
    invalidProposal:
      "Kulang ang mga detalye sa kahilingang iyon, kaya walang naihanda.",
    notConfigured:
      "Hindi pa naka-set up ang assistant, kaya hindi ko pa ito maihahanda. Maaari pa rin kayong sumulat sa pamilya sa Mga mensahe. Maaaring tapusin ng nag-set up ng app ang proseso gamit ang bun run dev:setup.",
    practiceEnglishOnly:
      "Sa practice mode na walang konektadong modelo ng assistant, mga kahilingan sa Ingles lamang ang nauunawaan ko para sa masasakyan, draft ng mensahe, mga bibilhin, o pagsusuri ng scam. Maaari kayong magsulat ng sarili ninyong mensahe sa anumang wika sa Mga mensahe.",
    providerError: (reason) =>
      `Hindi ko ito maiproseso ngayon (${reason}). Tingnan sa pag-uusap kung may naihanda na, at subukang muli pagkalipas ng ilang sandali.`,
  },
  vi: {
    invalidProposal:
      "Yêu cầu này thiếu các chi tiết cần thiết, nên chưa có gì được chuẩn bị.",
    notConfigured:
      "Trợ lý chưa được thiết lập nên tôi chưa thể chuẩn bị yêu cầu này. Bạn vẫn có thể viết cho gia đình trong Tin nhắn. Người thiết lập ứng dụng có thể hoàn tất bằng bun run dev:setup.",
    practiceEnglishOnly:
      "Trong chế độ thực hành khi chưa kết nối mô hình trợ lý, tôi chỉ hiểu yêu cầu bằng tiếng Anh về đưa đón, soạn tin nhắn, thêm đồ mua sắm hoặc kiểm tra lừa đảo. Bạn có thể tự viết tin nhắn bằng bất kỳ ngôn ngữ nào trong Tin nhắn.",
    providerError: (reason) =>
      `Tôi chưa thể xử lý việc này lúc này (${reason}). Hãy xem trong cuộc trò chuyện có nội dung nào đã được chuẩn bị chưa, rồi thử lại sau một lát.`,
  },
  zh: {
    invalidProposal: "这项请求缺少必要的详细信息，因此没有准备任何内容。",
    notConfigured:
      "助手尚未设置好，所以我暂时无法帮您准备这项请求。您仍可以在“消息”中给家人写消息。设置应用的人可以运行 bun run dev:setup 完成设置。",
    practiceEnglishOnly:
      "在未连接助手模型的练习模式下，我只能理解用英语提出的接送、起草消息、添加购物物品或诈骗检查请求。您可以在“消息”中用任何语言自行写消息。",
    providerError: (reason) =>
      `我暂时无法处理这项请求（${reason}）。请查看对话中是否已有准备好的内容，然后稍后再试。`,
  },
};

const assistantMessagesFor = (locale: InterfaceLocale): AssistantMessages =>
  ASSISTANT_MESSAGES[locale];

export { assistantMessagesFor };

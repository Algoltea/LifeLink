import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "Adicionar uma pessoa",
  addPhoto: "Adicionar uma foto",
  addWayToReach: (firstName) =>
    `Adicione uma forma de contato com ${firstName} no Círculo de confiança.`,
  addingPhoto: "Adicionando foto…",
  backTo: "Voltar para ",
  channels: {
    discord: "Mensagem direta pelo Discord",
    email: "E-mail",
    imessage: "iMessage",
    in_app: "Mensagem pelo LifeLink",
    telegram: "Telegram",
  },
  chooseConversation: "Escolha uma pessoa para ler a conversa e responder.",
  conversationWith: (name) => `Conversa com ${name}`,
  conversationWithPrefix: "Conversa com ",
  conversations: "Conversas",
  dividerAt: (day, time) => `${day} às ${time}`,
  empty:
    "Adicione familiares ou amigos ao seu círculo de confiança para começar a escrever para eles.",
  emptyThread: (firstName) => `Ainda não há mensagens com ${firstName}`,
  emptyThreadHint: (firstName) =>
    `Escreva abaixo para começar. Você verá exatamente o que ${firstName} receberá antes que algo seja enviado.`,
  helpMeUnderstand: "Ajude-me a entender",
  loadingConversation: "Carregando conversa",
  loadingConversations: "Carregando conversas",
  maxPhotos: (count) =>
    `Você pode anexar até ${count} fotos. Remova uma para adicionar outra.`,
  messageTo: (firstName) => `Mensagem para ${firstName}`,
  messagesWith: (name) => `Mensagens com ${name}`,
  noWayToReach: "Ainda sem forma de contato",
  noWayToReachName: (firstName) =>
    `Ainda sem forma de contato com ${firstName}`,
  notSent: "Não enviado",
  notSureSent: "Não se sabe se foi enviado",
  nothingSentUntilApproved: "Nada é enviado até você revisar e aprovar.",
  pendingMany: (count, firstName) =>
    `${count} mensagens para ${firstName} aguardam sua aprovação.`,
  pendingOne: (firstName) =>
    `Uma mensagem para ${firstName} aguarda sua aprovação.`,
  peopleCount: (count) => `${count} ${count === 1 ? "pessoa" : "pessoas"}`,
  photoCount: (count) => `${count} ${count === 1 ? "foto" : "fotos"}`,
  photoInvalid: (name) =>
    `${name}: escolha uma foto (JPEG, PNG, WebP ou HEIC).`,
  photosToSend: "Fotos para enviar",
  practiceNothingSent: (firstName) =>
    `Prática: nada será enviado para ${firstName}.`,
  preparing: "Preparando…",
  preparingMessage: "Preparando sua mensagem",
  previewManyPhotos: (count) => `${count} fotos`,
  previewOnePhoto: "Uma foto",
  previewYou: (words) => `Você: ${words}`,
  recap: "Resumo",
  recapThis: " esta conversa",
  removePhoto: (name) => `Remover ${name}`,
  replyAdded:
    "Resposta adicionada à sua mensagem. Você pode alterá-la antes de revisar.",
  review: "Revisar",
  reviewBeforeSending: "Revisar antes de enviar",
  reviewBeforeSendingTail: " antes de enviar",
  reviewIt: "Revisar",
  seeWhatHappened: "Veja o que aconteceu",
  srThem: (firstName, when) => `${firstName}, ${when}: `,
  srYou: (when) => `Você, ${when}: `,
  startConversation: "Iniciar uma conversa",
  status: {
    delivered: "Entregue",
    draft: "Rascunho, não enviado",
    failed: "Não enviado",
    read: "Lido",
    received: "Recebido",
    sending: "Enviando…",
    sent: "Enviado",
    unknown: "Não se sabe se foi enviado",
  },
  subline:
    "Escreva para as pessoas do seu círculo de confiança. Você vê cada mensagem antes do envio.",
  title: "Mensagens",
  toAddress: (address) => ` para ${address}`,
  waitingForApproval: (count) =>
    count === 1
      ? "Aguardando sua aprovação"
      : `${count} aguardando sua aprovação`,
  writeTo: (firstName) => `Escreva para ${firstName}`,
  writeToPlaceholder: (firstName) => `Escreva para ${firstName}…`,
};

export { threads };

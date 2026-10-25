import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "Agregar a una persona",
  addPhoto: "Agregar una foto",
  addWayToReach: (firstName) =>
    `Agregue una forma de comunicarse con ${firstName} en Círculo de confianza.`,
  addingPhoto: "Agregando la foto…",
  backTo: "Volver a ",
  channels: {
    discord: "Mensaje directo de Discord",
    email: "Correo",
    imessage: "iMessage",
    in_app: "Mensaje de LifeLink",
    telegram: "Telegram",
  },
  chooseConversation: "Elija a alguien para leer su conversación y responder.",
  conversationWith: (name) => `Conversación con ${name}`,
  conversationWithPrefix: "Conversación con ",
  conversations: "Conversaciones",
  dividerAt: (day, time) => `${day} a las ${time}`,
  empty:
    "Agregue familiares o amigos a su círculo de confianza para empezar a escribirles.",
  emptyThread: (firstName) => `Todavía no hay mensajes con ${firstName}`,
  emptyThreadHint: (firstName) =>
    `Escriba abajo para empezar. Verá exactamente lo que recibirá ${firstName} antes de que se envíe nada.`,
  helpMeUnderstand: "Ayúdeme a entender",
  loadingConversation: "Cargando la conversación",
  loadingConversations: "Cargando las conversaciones",
  maxPhotos: (count) =>
    `Puede adjuntar hasta ${count} fotos. Quite una para agregar otra.`,
  messageTo: (firstName) => `Mensaje para ${firstName}`,
  messagesWith: (name) => `Mensajes con ${name}`,
  noWayToReach: "Todavía no hay forma de comunicarse",
  noWayToReachName: (firstName) =>
    `Todavía no hay forma de comunicarse con ${firstName}`,
  notSent: "No se envió",
  notSureSent: "No es seguro que se haya enviado",
  nothingSentUntilApproved:
    "No se envía nada hasta que usted lo revise y lo apruebe.",
  pendingMany: (count, firstName) =>
    `${count} mensajes para ${firstName} esperan su aprobación.`,
  pendingOne: (firstName) =>
    `Un mensaje para ${firstName} espera su aprobación.`,
  peopleCount: (count) => `${count} ${count === 1 ? "persona" : "personas"}`,
  photoCount: (count) => `${count} ${count === 1 ? "foto" : "fotos"}`,
  photoInvalid: (name) =>
    `${name}: Por favor, elija una foto (JPEG, PNG, WebP o HEIC).`,
  photosToSend: "Fotos para enviar",
  practiceNothingSent: (firstName) =>
    `Práctica: no se enviará nada a ${firstName}.`,
  preparing: "Preparando…",
  preparingMessage: "Preparando su mensaje",
  previewManyPhotos: (count) => `${count} fotos`,
  previewOnePhoto: "Una foto",
  previewYou: (words) => `Usted: ${words}`,
  recap: "Resumen",
  recapThis: " de esta conversación",
  removePhoto: (name) => `Quitar ${name}`,
  replyAdded:
    "Se agregó la respuesta a su mensaje. Puede cambiarla antes de revisarla.",
  reviewAndSend: "Revisar y enviar",
  reviewIt: "Revisarlo",
  seeWhatHappened: "Ver qué pasó",
  srThem: (firstName, when) => `${firstName}, ${when}: `,
  srYou: (when) => `Usted, ${when}: `,
  startConversation: "Empezar una conversación",
  status: {
    delivered: "Entregado",
    draft: "Borrador, sin enviar",
    failed: "No se envió",
    read: "Leído",
    received: "Recibido",
    sending: "Enviando…",
    sent: "Enviado",
    unknown: "No es seguro que se haya enviado",
  },
  subline:
    "Escriba a las personas de su círculo de confianza. Usted ve cada mensaje antes de que se envíe.",
  title: "Mensajes",
  toAddress: (address) => ` a ${address}`,
  waitingForApproval: (count) =>
    count === 1 ? "Espera su aprobación" : `${count} esperan su aprobación`,
  writeTo: (firstName) => `Escribir a ${firstName}`,
  writeToPlaceholder: (firstName) => `Escribir a ${firstName}…`,
};

export { threads };

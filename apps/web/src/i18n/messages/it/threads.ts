import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "Aggiungi una persona",
  addPhoto: "Aggiungi una foto",
  addWayToReach: (firstName) =>
    `Aggiunga un recapito per ${firstName} nella Cerchia di fiducia.`,
  addingPhoto: "Aggiunta della foto…",
  backTo: "Torna a ",
  channels: {
    discord: "Messaggio diretto Discord",
    email: "Email",
    imessage: "iMessage",
    in_app: "Messaggio LifeLink",
    telegram: "Telegram",
  },
  chooseConversation:
    "Scelga una persona per leggere la conversazione e rispondere.",
  conversationWith: (name) => `Conversazione con ${name}`,
  conversationWithPrefix: "Conversazione con ",
  conversations: "Conversazioni",
  dividerAt: (day, time) => `${day} alle ${time}`,
  empty:
    "Aggiunga familiari o amici alla Sua cerchia di fiducia per iniziare a scrivere loro.",
  emptyThread: (firstName) => `Non ci sono ancora messaggi con ${firstName}`,
  emptyThreadHint: (firstName) =>
    `Scriva qui sotto per iniziare. Vedrà esattamente ciò che riceverà ${firstName} prima che venga inviato qualcosa.`,
  helpMeUnderstand: "Mi aiuti a capire",
  loadingConversation: "Caricamento della conversazione",
  loadingConversations: "Caricamento delle conversazioni",
  maxPhotos: (count) =>
    `Può allegare fino a ${count} foto. Ne rimuova una per aggiungerne un’altra.`,
  messageTo: (firstName) => `Messaggio per ${firstName}`,
  messagesWith: (name) => `Messaggi con ${name}`,
  noWayToReach: "Nessun recapito disponibile",
  noWayToReachName: (firstName) =>
    `Nessun recapito disponibile per ${firstName}`,
  notSent: "Non inviato",
  notSureSent: "Invio non confermato",
  nothingSentUntilApproved:
    "Nulla viene inviato finché non lo verifica e approva.",
  pendingMany: (count, firstName) =>
    `${count} messaggi per ${firstName} attendono la Sua approvazione.`,
  pendingOne: (firstName) =>
    `Un messaggio per ${firstName} attende la Sua approvazione.`,
  peopleCount: (count) => `${count} ${count === 1 ? "persona" : "persone"}`,
  photoCount: (count) => `${count} foto`,
  photoInvalid: (name) => `${name}: scelga una foto (JPEG, PNG, WebP o HEIC).`,
  photosToSend: "Foto da inviare",
  practiceNothingSent: (firstName) =>
    `Prova: non verrà inviato nulla a ${firstName}.`,
  preparing: "Preparazione…",
  preparingMessage: "Preparazione del Suo messaggio",
  previewManyPhotos: (count) => `${count} foto`,
  previewOnePhoto: "Una foto",
  previewYou: (words) => `Lei: ${words}`,
  recap: "Riepilogo",
  recapThis: " questa conversazione",
  removePhoto: (name) => `Rimuovi ${name}`,
  replyAdded:
    "Risposta aggiunta al messaggio. Può modificarla prima della verifica.",
  review: "Verifica",
  reviewAndSend: "Verifica e invia",
  reviewIt: "Verifica",
  seeWhatHappened: "Veda cosa è successo",
  srThem: (firstName, when) => `${firstName}, ${when}: `,
  srYou: (when) => `Lei, ${when}: `,
  startConversation: "Inizia una conversazione",
  status: {
    delivered: "Consegnato",
    draft: "Bozza, non inviata",
    failed: "Non inviato",
    read: "Letto",
    received: "Ricevuto",
    sending: "Invio…",
    sent: "Inviato",
    unknown: "Invio non confermato",
  },
  subline:
    "Scriva alle persone della Sua cerchia di fiducia. Vedrà ogni messaggio prima dell’invio.",
  title: "Messaggi",
  toAddress: (address) => ` a ${address}`,
  waitingForApproval: (count) =>
    count === 1
      ? "In attesa della Sua approvazione"
      : `${count} in attesa della Sua approvazione`,
  writeTo: (firstName) => `Scriva a ${firstName}`,
  writeToPlaceholder: (firstName) => `Scriva a ${firstName}…`,
};

export { threads };

import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "Person hinzufügen",
  addPhoto: "Foto hinzufügen",
  addWayToReach: (firstName) =>
    `Fügen Sie im Vertrauenskreis eine Kontaktmöglichkeit für ${firstName} hinzu.`,
  addingPhoto: "Foto wird hinzugefügt…",
  backTo: "Zurück zu ",
  channels: {
    discord: "Discord-Direktnachricht",
    email: "E-Mail",
    imessage: "iMessage",
    in_app: "LifeLink-Nachricht",
    telegram: "Telegram",
  },
  chooseConversation:
    "Wählen Sie eine Person, um Ihre Unterhaltung zu lesen und zu antworten.",
  conversationWith: (name) => `Unterhaltung mit ${name}`,
  conversationWithPrefix: "Unterhaltung mit ",
  conversations: "Unterhaltungen",
  dividerAt: (day, time) => `${day} um ${time}`,
  empty:
    "Fügen Sie Familie oder Freunde zu Ihrem Vertrauenskreis hinzu, um ihnen zu schreiben.",
  emptyThread: (firstName) => `Noch keine Nachrichten mit ${firstName}`,
  emptyThreadHint: (firstName) =>
    `Schreiben Sie unten, um zu beginnen. Sie sehen genau, was ${firstName} erhält, bevor etwas gesendet wird.`,
  helpMeUnderstand: "Beim Verstehen helfen",
  loadingConversation: "Unterhaltung wird geladen",
  loadingConversations: "Unterhaltungen werden geladen",
  maxPhotos: (count) =>
    `Sie können bis zu ${count} ${count === 1 ? "Foto" : "Fotos"} anhängen. Entfernen Sie eines, um ein anderes hinzuzufügen.`,
  messageTo: (firstName) => `Nachricht an ${firstName}`,
  messagesWith: (name) => `Nachrichten mit ${name}`,
  noWayToReach: "Noch keine Kontaktmöglichkeit",
  noWayToReachName: (firstName) =>
    `Noch keine Kontaktmöglichkeit für ${firstName}`,
  notSent: "Nicht gesendet",
  notSureSent: "Versand ungewiss",
  nothingSentUntilApproved:
    "Nichts wird gesendet, bevor Sie es geprüft und genehmigt haben.",
  pendingMany: (count, firstName) =>
    `${count} Nachrichten an ${firstName} warten auf Ihre Zustimmung.`,
  pendingOne: (firstName) =>
    `Eine Nachricht an ${firstName} wartet auf Ihre Zustimmung.`,
  peopleCount: (count) => `${count} ${count === 1 ? "Person" : "Personen"}`,
  photoCount: (count) => `${count} ${count === 1 ? "Foto" : "Fotos"}`,
  photoInvalid: (name) =>
    `${name}: Bitte wählen Sie ein Foto (JPEG, PNG, WebP oder HEIC).`,
  photosToSend: "Zu sendende Fotos",
  practiceNothingSent: (firstName) =>
    `Übung: Es wird nichts an ${firstName} gesendet.`,
  preparing: "Wird vorbereitet…",
  preparingMessage: "Ihre Nachricht wird vorbereitet",
  previewManyPhotos: (count) => `${count} Fotos`,
  previewOnePhoto: "Ein Foto",
  previewYou: (words) => `Sie: ${words}`,
  recap: "Rückblick",
  recapThis: " auf diese Unterhaltung",
  removePhoto: (name) => `${name} entfernen`,
  replyAdded:
    "Antwort zu Ihrer Nachricht hinzugefügt. Sie können sie vor der Prüfung ändern.",
  reviewAndSend: "Prüfen und senden",
  reviewIt: "Jetzt prüfen",
  seeWhatHappened: "Ansehen, was geschehen ist",
  srThem: (firstName, when) => `${firstName}, ${when}: `,
  srYou: (when) => `Sie, ${when}: `,
  startConversation: "Unterhaltung beginnen",
  status: {
    delivered: "Zugestellt",
    draft: "Entwurf, nicht gesendet",
    failed: "Nicht gesendet",
    read: "Gelesen",
    received: "Empfangen",
    sending: "Wird gesendet…",
    sent: "Gesendet",
    unknown: "Versand ungewiss",
  },
  subline:
    "Schreiben Sie den Menschen in Ihrem Vertrauenskreis. Sie sehen jede Nachricht, bevor sie gesendet wird.",
  title: "Nachrichten",
  toAddress: (address) => ` an ${address}`,
  waitingForApproval: (count) =>
    count === 1
      ? "Wartet auf Ihre Zustimmung"
      : `${count} warten auf Ihre Zustimmung`,
  writeTo: (firstName) => `An ${firstName} schreiben`,
  writeToPlaceholder: (firstName) => `Schreiben Sie an ${firstName}…`,
};

export { threads };

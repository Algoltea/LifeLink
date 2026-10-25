import type { Messages } from "../en";

const family: Messages["family"] = {
  appointments: "Termine",
  budget: (amount) => ` · Budget ${amount}`,
  checked: (kind, day) => `${kind}, geprüft ${day}`,
  codeHint:
    "Die Person, die Sie eingeladen hat, kann ihn auf ihrer Seite „Vertrauenskreis“ ablesen.",
  connect: "Verbinden",
  connected:
    "Sie sind verbunden. Sie sehen nur, was die Person mit Ihnen teilen möchte.",
  empty:
    "Noch teilt niemand etwas mit Ihnen. Wenn Sie eingeladen werden, geben Sie den Code unten ein.",
  groceries: "Einkaufsliste",
  haveCode: "Haben Sie einen Einladungscode?",
  invitationCode: "Einladungscode",
  kinds: { email: "E-Mail", screenshot: "Bildschirmfoto", text: "Text" },
  likelyScam: "Wahrscheinlich Betrug",
  loadingMessages: "Nachrichten werden geladen",
  loadingPhoto: "Foto wird geladen…",
  loadingShared: "Geteilte Informationen werden geladen",
  loadingWhatWasShared: "Geteilte Inhalte werden geladen",
  messagesWith: (name) => `Nachrichten mit ${name}`,
  noMessages: "Noch keine Nachrichten in LifeLink.",
  noSharedReminders: "Keine geteilten Erinnerungen.",
  notSharing: "Diese Person teilt gerade nichts mit Ihnen.",
  nothingLeft: "Nichts mehr zu kaufen.",
  nothingSoon: "Nichts in den nächsten 30 Tagen.",
  onlyResult: "Nur das Ergebnis wird geteilt, niemals die Nachricht selbst.",
  photoUnavailable: "Dieses Foto ist nicht verfügbar.",
  photos: "Fotos",
  replyTo: (name) => `Antwort an ${name}`,
  ride: {
    asked: "Fahrt angefragt, noch nicht bestätigt",
    confirmed: "Fahrt bestätigt",
    declined: "Fahrt abgelehnt",
  },
  scamChecks: "Betrugsprüfungen",
  sendReply: "Antwort senden",
  sharedPhoto: "Ein geteiltes Foto",
  sharedReminders: "Geteilte Erinnerungen",
  shares: (name, scopes) =>
    `${name} teilt: ${scopes}. Sie können dies ansehen, aber nichts für diese Person senden, genehmigen oder ausgeben.`,
  subline:
    "Sie sehen nur, was jede Person mit Ihnen teilen möchte. Sie können es ansehen, aber niemals für die Person etwas senden, genehmigen oder Geld ausgeben.",
  suspicious: "Verdächtig",
  theyWrote: (name) => `${name} schrieb: `,
  title: "Familie",
  updates: "Neuigkeiten",
  withPhotos: " · mit Fotos",
  you: "Sie",
  youWrote: "Sie schrieben: ",
};

export { family };

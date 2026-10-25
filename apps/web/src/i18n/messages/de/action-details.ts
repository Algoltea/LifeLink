import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " und ",
  budget: (amount) => ` Budget: ${amount}.`,
  by: (channel) => `Über ${channel}`,
  calendar: "Kalender",
  confirming: "Sie bestätigen",
  document: "Dokument",
  draftSavedIn: (provider) =>
    `Als Entwurf in Ihrem ${provider} gespeichert. Er wird erst versendet, wenn Sie ihn dort senden.`,
  driveNoteHint:
    "Wird als neues Dokument in Ihrem Google Drive gespeichert. Nur Sie können es sehen, solange Sie es dort nicht teilen.",
  estimate: (amount) => `Ihre Schätzung: ${amount}.`,
  event: "Termin",
  itemCount: (name, count) => `${name}: ${count} Artikel`,
  noEstimate: "Noch keine Schätzung.",
  noJustYou: "Nein, nur für Sie",
  notGiven: "Nicht angegeben",
  onlyGrantees: (names, scope) =>
    `Nur ${names} können dies sehen, weil Sie ${scope} mit ihnen teilen.`,
  peopleYouAllowed: "Personen, denen Sie es erlaubt haben",
  readEmail: "E-Mail vorlesen",
  readMessage: "Nachricht vorlesen",
  readNote: "Notiz vorlesen",
  readUpdate: "Mitteilung vorlesen",
  reminder: "Erinnerung",
  sharedWithCircle: "Mit Ihrem Vertrauenskreis geteilt",
  shoppingRecord:
    "Dies ist ein Eintrag zu einer früheren Einkaufsanfrage. Einkaufen über LifeLink ist nicht mehr verfügbar.",
  spoken: {
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, Ort: ${location}` : ""}.`,
    confirm: (summary) => `Sie bestätigen: ${summary}`,
    driveNote: (title, body) =>
      `Eine Notiz in Ihrem Google Drive mit dem Titel ${title}. Darin steht: ${body}`,
    email: (to, subject, body) =>
      `E-Mail an ${to}. Betreff: ${subject}. Darin steht: ${body}`,
    emailAloud: (subject, body) => `Betreff: ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `An ${name}, über ${channel}${route}. Die Nachricht lautet: ${body}`,
    reminder: (title, when, shared) =>
      `Erinnerung: ${title}. ${when}. ${shared ? "Mit Ihrem Vertrauenskreis geteilt." : "Nur für Sie."}`,
    update: (text) => `Die Mitteilung lautet: ${text}`,
  },
  starts: "Beginn",
  subject: "Betreff",
  thisScope: "dies",
  to: "An",
  toAddress: (address) => ` an ${address}`,
  toName: (name) => `An ${name}`,
  when: "Wann",
  where: "Wo",
  withPhotos: (count) => `Mit ${count} ${count === 1 ? "Foto" : "Fotos"}.`,
  yesShared: "Ja",
};

export { actionDetails };

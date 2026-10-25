import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "Vertraute Person hinzufügen",
  call: "Anrufen",
  callAria: (name) => `${name} anrufen`,
  callHelpMessage:
    "Ich bin unsicher wegen eines Anrufs, den ich erhalten habe. Könnten Sie mir helfen zu prüfen, ob er echt ist, bevor ich etwas weitergebe oder Geld sende?",
  callsLoading:
    "Anrufe sind erst verfügbar, wenn Ihre Kontoeinstellungen geladen sind.",
  callsPractice: "Im Übungsmodus sind keine Anrufe verfügbar.",
  contactFallback: "Kontakt",
  empty:
    "Eine zweite Meinung kann helfen. Fügen Sie eine bekannte Person hinzu zu Ihrem ",
  emptyRest:
    ", um bei dieser Prüfung um Hilfe zu bitten. Sie prüfen jede Nachricht, bevor sie gesendet wird.",
  failed: (name, error) =>
    `Die Nachricht an ${name} konnte nicht vorbereitet werden. ${error} Es wurde nichts gesendet. Wählen Sie erneut „Nachricht vorbereiten“.`,
  introCall:
    "Bereiten Sie eine Nachricht vor, in der Sie um Hilfe mit dem Anruf bitten. Sie können sie vor der Zustimmung lesen und ändern. Es wird noch nichts gesendet.",
  introCheck:
    "Bereiten Sie eine Nachricht vor, in der Sie jemanden um Hilfe bei dieser Prüfung bitten. Sie können sie vor der Zustimmung lesen und ändern. Es wird noch nichts gesendet.",
  list: "Vertraute Personen",
  loading: "Vertraute Personen werden geladen",
  noMessageAddress: "Keine Nachrichtenadresse gespeichert",
  noPhone: "Keine Telefonnummer gespeichert. ",
  noWayToMessage: "Keine Möglichkeit zum Schreiben gespeichert. ",
  prepare: "Nachricht vorbereiten",
  prepareAria: (name) => `Nachricht an ${name} vorbereiten`,
  preparing: "Wird vorbereitet…",
  reachedBy: {
    discord: "Per Nachricht erreichbar",
    email: "Per E-Mail erreichbar",
    imessage: "Per Nachricht erreichbar",
    in_app: "In LifeLink erreichbar",
    telegram: "Per Nachricht erreichbar",
  },
  saveDetails: "Speichern Sie die Kontaktdaten in Ihrem ",
  trustedCircle: "Vertrauenskreis",
  unavailable:
    "„Anrufen“ und „Nachricht vorbereiten“ sind gerade nicht verfügbar.",
};

export { trustedPeople };

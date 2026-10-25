import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "Möchten Sie etwas ergänzen? (optional)",
  addNotePlaceholder: "Zum Beispiel, von wem die Nachricht angeblich stammt",
  ask: "Eine vertraute Person fragen",
  callCheckTitle: "Anruf auf Betrug prüfen",
  checkSomethingElse: "Etwas anderes prüfen",
  checking: "Wird geprüft",
  checkingMessage: "Nachricht wird geprüft…",
  chooseEmail: "E-Mail auswählen",
  chooseRecent: "Aus Ihren letzten E-Mails auswählen",
  cloudNote:
    "Ein KI-Dienst liest dies zur Prüfung. Lassen Sie Passwörter und Kartennummern weg.",
  didNotFinish: "Nicht abgeschlossen",
  earlier: "Frühere Prüfungen",
  earlierEmpty: "Ihre Nachrichten-, Foto- und Anrufprüfungen erscheinen hier.",
  emailMissing:
    "Diese E-Mail ist nicht unter den letzten Nachrichten im Posteingang. Wählen Sie eine andere oder geben Sie unten ihren Wortlaut ein.",
  from: (sender) => `Von ${sender}`,
  guidance: {
    ai: "Ein KI-Dienst hilft bei Nachrichten- und Fotoprüfungen. Fotos bleiben bei Ihrer Prüfung, bis Sie sie löschen. Übungsprüfungen verwenden niemals KI.",
    intro:
      "Eine Prüfung sucht nach häufigen Warnzeichen. Sie kann nicht bestätigen, wer eine Nachricht gesendet hat oder ob sie wahr ist.",
    next: "Lesen Sie das Ergebnis, folgen Sie „Was Sie jetzt tun können“ oder bitten Sie eine vertraute Person um eine zweite Meinung. Sie entscheiden, was als Nächstes geschieht.",
    title: "Was kann mir eine Betrugsprüfung sagen?",
  },
  howToShow: "Wie möchten Sie die Nachricht zeigen?",
  loadingEarlier: "Frühere Prüfungen werden geladen",
  loadingEmail: "E-Mail wird geladen",
  loadingEmails: "Ihre E-Mails werden geladen",
  localNote:
    "KI-Prüfungen sind gerade nicht verfügbar. LifeLink verwendet stattdessen häufige Warnzeichen.",
  messageWords: "Der Wortlaut der Nachricht",
  messageWordsPlaceholder: "Fügen Sie die Worte hier ein oder tippen Sie sie",
  noLongerAvailable:
    "Diese Prüfung ist nicht mehr verfügbar. Sie können eine neue starten.",
  noRecentEmails: "Es gibt keine aktuellen E-Mails zur Auswahl. ",
  noRecentEmailsRest:
    ", oder geben Sie stattdessen den Wortlaut der Nachricht ein.",
  noSubject: "(Kein Betreff)",
  openEmail: "E-Mail öffnen",
  opening: "Ihre Prüfung wird geöffnet",
  photo: {
    availabilityChecking: "Es wird geprüft, ob Fotoprüfungen verfügbar sind…",
    practice:
      "Der Übungsmodus ist eingeschaltet. Fotos werden weder geprüft noch an einen KI-Dienst gesendet.",
    unavailable:
      "Fotoprüfungen sind gerade nicht verfügbar. Ihr Foto wird nicht hochgeladen.",
    unavailableType:
      "Fotoprüfungen sind nicht verfügbar. Geben Sie stattdessen die Worte ein.",
  },
  practiceEmailNote:
    "Dies ist eine Übungs-E-Mail. Sie wird auf diesem Gerät ohne Cloud-KI geprüft.",
  practiceNote:
    "Übungsprüfungen verwenden häufige Warnzeichen. Es wird nichts an einen KI-Dienst gesendet.",
  practiceSuffix: " · Übung",
  preparing: "Ihre Prüfung wird vorbereitet…",
  review: "Prüfen",
  sources: { email: "E-Mail", screenshot: "Foto", text: "Text" },
  startNew: "Neue Prüfung starten",
  subline:
    "Sind Sie bei einer Nachricht oder einem Anruf unsicher? LifeLink sucht nach Warnzeichen, bevor Sie handeln.",
  submit: {
    email: "Diese E-Mail prüfen",
    screenshot: "Dieses Foto prüfen",
    text: "Diese Nachricht prüfen",
  },
  title: "Betrugsprüfung",
  uploading: "Ihr Foto wird hochgeladen…",
  uploadingNote:
    "Ihr Foto wird hochgeladen. Lassen Sie diese Seite geöffnet. Danach werden die Worte gelesen.",
};

export { scam };

import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Erklärung schließen",
  cloud:
    "Mit Ihrer Erlaubnis von Cloud-KI erklärt. Jedes Zitat wurde mit der Nachricht abgeglichen.",
  cloudConsent:
    "Den Cloud-Assistenten für eine ausführlichere Erklärung verwenden. Der Nachrichtentext wird an den KI-Anbieter gesendet. Lassen Sie das Kästchen frei für eine lokale Erklärung.",
  cloudConsentWithNotes:
    "Den Cloud-Assistenten für eine ausführlichere Erklärung verwenden. Der Nachrichtentext und Ihre Notizen dazu, wie Sie Hilfe möchten, werden an den KI-Anbieter gesendet. Lassen Sie das Kästchen frei für eine lokale Erklärung.",
  dateSpoken: (quote, date) =>
    `Genanntes Datum: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Genannte Daten und Uhrzeiten",
  droppedNote:
    "Einige Angaben des Assistenten standen nicht wörtlich in der Nachricht. Sie werden deshalb als Vermutungen angezeigt oder weggelassen.",
  explainAgainWithCloud: "Mit Cloud-KI erneut erklären",
  explainThis: "Diese Nachricht erklären",
  explainWithCloud: "Mit Cloud-KI erklären",
  facts: "Was in der Nachricht steht",
  guessNote: "Dies sind Vermutungen und keine Aussagen aus der Nachricht.",
  guessSpoken: (text) => `Eine Vermutung: ${text}`,
  guesses: "Was gemeint sein könnte",
  inPlainWords: "Einfach erklärt",
  intro:
    "LifeLink kann erklären, worum diese Nachricht bittet, welche Daten sie nennt und was sie offenlässt.",
  loading: "Erklärung wird geladen",
  local: {
    chosen:
      "Lokale Erklärung: anhand von Mustern gefunden, nicht durch vollständiges Verstehen. Es wurde nichts an einen KI-Anbieter gesendet.",
    failed:
      "Lokale Erklärung. Sie haben eine Cloud-Erklärung angefordert, aber sie wurde nicht fertiggestellt. Der Anbieter hat diese Nachricht möglicherweise bereits erhalten.",
    limit:
      "Lokale Erklärung. Die heutige Grenze für Cloud-Erklärungen ist erreicht. Es wurde nichts Weiteres gesendet.",
    practice:
      "Übung: in LifeLink erklärt. Übungsnachrichten werden niemals an einen KI-Anbieter gesendet.",
    unavailable:
      "Lokale Erklärung. Der Cloud-Assistent ist nicht eingerichtet. Es wurde nichts an einen KI-Anbieter gesendet.",
  },
  localLanguageNotice:
    "Lokale regelbasierte Erklärungen sind auf Englisch und wurden noch nicht übersetzt. Eine Cloud-Erklärung kann in Ihrer gewählten Sprache verfasst werden. Zitate aus der ursprünglichen Nachricht bleiben unverändert.",
  missing: "Noch nicht gesagt",
  missingSpoken: (detail) => `Noch nicht gesagt: ${detail}`,
  onlyYou:
    "Nur Sie können dies sehen. Es wird niemals gesendet oder mit der Familie geteilt.",
  part: "Teil",
  practiceNote:
    "Im Übungsmodus liest LifeLink die Nachricht lokal. Übungsnachrichten werden niemals an einen KI-Anbieter gesendet.",
  readAloud: "Erklärung vorlesen",
  readReply: "Diese Antwort vorlesen",
  reading: "Nachricht wird gelesen…",
  replies: "Mögliche Antworten",
  repliesHint:
    "Es wird nichts gesendet. Eine Antwort wird in Ihr Nachrichtenfeld eingefügt. Dort können Sie sie ändern und prüfen, bevor etwas geschieht.",
  requestSpoken: (text, quote) =>
    `Die Bitte lautet: ${text} In den ursprünglichen Worten: ${quote}.`,
  requests: "Worum gebeten wird",
  title: "Hilfe beim Verstehen dieser Nachricht",
  useReply: "Diese Antwort verwenden",
  useReplyLabel: (label) => `Diese Antwort verwenden: ${label}`,
};

export { explanation };

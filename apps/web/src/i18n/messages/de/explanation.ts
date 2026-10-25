import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Erklärung schließen",
  cloud:
    "Von Cloud-KI erklärt. Jedes Zitat wurde mit der Nachricht abgeglichen.",
  dateSpoken: (quote, date) =>
    `Genanntes Datum: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Genannte Daten und Uhrzeiten",
  droppedNote:
    "Einige Angaben des Assistenten standen nicht wörtlich in der Nachricht. Sie werden deshalb als Vermutungen angezeigt oder weggelassen.",
  facts: "Was in der Nachricht steht",
  guessNote: "Dies sind Vermutungen und keine Aussagen aus der Nachricht.",
  guessSpoken: (text) => `Eine Vermutung: ${text}`,
  guesses: "Was gemeint sein könnte",
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
  moreDetail: "Mehr Details",
  onlyYou: "Nur Sie können dies sehen.",
  part: "Teil",
  reading: "Nachricht wird gelesen…",
  replies: "Mögliche Antworten",
  repliesHint:
    "Es wird nichts gesendet. Eine Antwort wird in Ihr Nachrichtenfeld eingefügt. Dort können Sie sie ändern und prüfen, bevor etwas geschieht.",
  replyLabelFor: (label) => `Diese Antwort verwenden: ${label}`,
  requestSpoken: (text, quote) =>
    `Die Bitte lautet: ${text} In den ursprünglichen Worten: ${quote}.`,
  requests: "Worum gebeten wird",
  title: "Hilfe beim Verstehen dieser Nachricht",
};

export { explanation };

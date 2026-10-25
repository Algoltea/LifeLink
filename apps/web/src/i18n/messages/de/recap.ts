import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "Vereinbart",
  agreedSpoken: (text) => `Vereinbart: ${text}`,
  changedNote:
    "Einige Angaben des Assistenten standen nicht wörtlich in den Nachrichten oder waren Angebote statt Vereinbarungen. Sie wurden deshalb geändert oder weggelassen.",
  close: "Rückblick schließen",
  cloud:
    "Mit Ihrer Erlaubnis von Cloud-KI erstellter Rückblick. Jedes Zitat wurde mit den Nachrichten abgeglichen.",
  cloudConsent:
    "Den Cloud-Assistenten für einen ausführlicheren Rückblick verwenden. Ihre letzten Nachrichten mit dieser Person werden an den KI-Anbieter gesendet. Lassen Sie das Kästchen frei für einen kurzen Rückblick, der in LifeLink erstellt wird.",
  done: "Erledigt",
  doneFromRecords:
    "Aus LifeLinks eigenen Aufzeichnungen, nicht aus Aussagen in den Nachrichten.",
  inShort: "Kurz zusammengefasst",
  intro: (contactName) =>
    `LifeLink kann zusammenfassen, was Sie und ${contactName} vereinbart haben, was nur angeboten wurde und was noch offen ist.`,
  loading: "Rückblick wird geladen",
  local: {
    chosen:
      "Kurzer Rückblick, in LifeLink erstellt: anhand von Mustern gefunden, nicht durch vollständiges Verstehen. Es wurde nichts an einen KI-Anbieter gesendet.",
    failed:
      "Kurzer Rückblick, in LifeLink erstellt. Sie haben einen Cloud-Rückblick angefordert, aber er wurde nicht fertiggestellt. Der Anbieter hat diese Nachrichten möglicherweise bereits erhalten.",
    limit:
      "Kurzer Rückblick, in LifeLink erstellt. Die heutige Grenze für Cloud-Rückblicke ist erreicht. Es wurde nichts Weiteres gesendet.",
    practice:
      "Übung: ein kurzer Rückblick, in LifeLink erstellt. Übungsnachrichten werden niemals an einen KI-Anbieter gesendet.",
    unavailable:
      "Kurzer Rückblick, in LifeLink erstellt. Der Cloud-Assistent ist nicht eingerichtet. Es wurde nichts an einen KI-Anbieter gesendet.",
  },
  messageTo: (contactName) => `Nachricht an ${contactName}`,
  nextSteps: "Mögliche nächste Schritte",
  nextStepsHint:
    "Es geschieht nichts, bevor Sie einen Schritt vorbereiten, prüfen und genehmigen.",
  noFinishedTasks: (contactName) =>
    `LifeLink hat aus diesem Zeitraum keine abgeschlossenen Aufgaben mit ${contactName}. Was eine Nachricht behauptet, gilt nicht als erledigt.`,
  offerNote:
    "Ein Angebot ist erst eine Vereinbarung, wenn die andere Person zustimmt.",
  offered: "Angeboten, noch nicht vereinbart",
  offeredSpoken: (text) => `Angeboten, noch nicht vereinbart: ${text}`,
  onlyYou:
    "Nur Sie können dies sehen. Es wird niemals gesendet oder mit der Familie geteilt.",
  part: "Teil",
  practiceNote:
    "Im Übungsmodus erstellt LifeLink den Rückblick selbst. Übungsnachrichten werden niemals an einen KI-Anbieter gesendet.",
  prepare: "Zur Prüfung vorbereiten",
  prepared: "Vorbereitet. Jetzt prüfen",
  readAloud: "Rückblick vorlesen",
  reading: "Unterhaltung wird gelesen…",
  recapAgain: "Erneut zusammenfassen",
  recapThis: "Diese Unterhaltung zusammenfassen",
  recapWithCloud: "Mit Cloud-KI zusammenfassen",
  reminderForYou: "Eine Erinnerung für Sie",
  stillUnclear: "Noch unklar",
  title: (contactName) => `Rückblick mit ${contactName}`,
  unclearSpoken: (text) => `Noch unklar: ${text}`,
  you: "Sie",
};

export { recap };

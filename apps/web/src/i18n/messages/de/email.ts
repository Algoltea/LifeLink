import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "Über Betrugsprüfungen",
  appointmentAdded:
    "Der Termin wurde unter „Ihre Woche“ auf der Seite „Heute“ hinzugefügt.",
  appointmentFound: "Termin gefunden",
  backToInbox: "Zurück zum Posteingang",
  checkAnother: "Weitere Nachricht prüfen",
  checkCouldNotFinish: (error) =>
    `Die Betrugsprüfung konnte nicht abgeschlossen werden. ${error}`,
  checkFirst: "Prüfen Sie vor dem Handeln auf häufige Warnzeichen.",
  checkForNew: "Nach neuen E-Mails suchen",
  checkManually: " Sie können unten selbst eine Prüfung starten.",
  checkThis: "Diese E-Mail prüfen",
  checked: (when) => `Geprüft ${when}`,
  checkedAt: (when) => ` Geprüft ${when}.`,
  checking: "Wird geprüft…",
  checksAutomatic:
    "Wenn KI-E-Mail-Prüfungen in den Einstellungen aktiviert sind, können neue echte E-Mails an einen Cloud-KI-Anbieter gesendet werden. Übungs-E-Mails bleiben in LifeLink. Lokale Regeln, die nur für Englisch ausgelegt sind, werden verwendet, wenn Cloud-KI ausgeschaltet oder nicht verfügbar ist oder die Prüfung nicht abschließt. Auch bei einer fehlgeschlagenen Cloud-Anfrage kann die E-Mail bereits an den Anbieter gesendet worden sein. Keine der beiden Methoden kann den Absender überprüfen oder beweisen, dass eine E-Mail sicher ist.",
  checksIntro:
    "Neue E-Mails werden in LifeLink auf häufige Betrugsanzeichen geprüft. Wählen Sie eine Nachricht, um sie zu lesen und zu sehen, was aufgefallen ist.",
  checksTitle: "So funktionieren die E-Mail-Prüfungen",
  chooseEmail:
    "Wählen Sie eine E-Mail, um sie zu lesen und ihre Betrugsprüfung anzusehen.",
  cloudCheckNotice:
    "Cloud-KI hat bei dieser E-Mail-Prüfung geholfen. Sie kann Fehler machen und den Absender nicht überprüfen. Keine Warnzeichen bedeutet nicht, dass die E-Mail sicher ist.",
  cloudConsent:
    "Diese E-Mail an einen Cloud-KI-Dienst senden, um eine Zusammenfassung zu erhalten und einen möglichen Termin darin zu erkennen. Lassen Sie das Kästchen frei für eine kurze Vorschau, die in LifeLink erstellt wird.",
  concern:
    "Diese E-Mail hat Bedenken ausgelöst. Prüfen Sie die Bitte, bevor Sie handeln.",
  connectMailbox: "Gmail oder Outlook verbinden",
  connected: (list) => `Verbunden: ${list}.`,
  countEmails: (count) => `${count} ${count === 1 ? "E-Mail" : "E-Mails"}`,
  empty:
    "Hier gibt es noch keine E-Mails. Verbinden Sie ein Postfach und wählen Sie dann „Nach neuen E-Mails suchen“, um aktuelle Nachrichten zu importieren.",
  from: "Von ",
  helpMeUnderstand: "Beim Verstehen helfen",
  inbox: "Posteingang",
  linksNotOpened:
    "LifeLink öffnet keine Links in E-Mails. Prüfen Sie die Nachricht zuerst, wenn sie um Geld oder private Daten bittet.",
  loadingEmail: "E-Mail wird geladen",
  loadingEmails: "E-Mails werden geladen",
  localLanguageNotice:
    "Diese E-Mail-Prüfung verwendet lokale Regeln, die nur für Englisch entwickelt wurden. Sie können Betrug in Spanisch und anderen Sprachen übersehen. Keine Warnzeichen bedeutet nicht, dass eine E-Mail sicher ist.",
  lowerPriority: "Weniger dringend",
  mailboxes: "Ihre Postfächer",
  mayNeedReply: "Möglicherweise Antwort nötig",
  needsAttention: (label, error) =>
    `${label} braucht Ihre Aufmerksamkeit${error ? `: ${error}` : "."}`,
  newEmails: (count) =>
    count === 0
      ? "Keine neuen E-Mails."
      : `${count} ${count === 1 ? "neue E-Mail" : "neue E-Mails"}.`,
  noMailbox: "Kein Postfach verbunden.",
  noSigns: "Keine Warnzeichen gefunden. Absender nicht bestätigt.",
  noSubject: "(Kein Betreff)",
  noSubjectSpoken: "Kein Betreff",
  noText: "Diese E-Mail enthält keinen Text.",
  notChecked: "Noch nicht geprüft",
  notCheckedEmail: "Diese E-Mail wurde noch nicht geprüft.",
  notCheckedNote: "Noch nicht geprüft",
  nowTheEmail: "Nun die E-Mail.",
  openManualCheck: "Manuelle Betrugsprüfung öffnen",
  opened: (subject) => `Geöffnet: ${subject}`,
  paging: {
    loadOlder: "Ältere E-Mails laden",
    loading: "Wird geladen…",
    newer: "Neuere",
    noMoreImported:
      "Keine weiteren E-Mails importiert. Versuchen Sie die nächste Gruppe, falls noch ältere E-Mails verfügbar sind.",
    noOlder: "Keine älteren E-Mails verfügbar.",
    older: "Ältere E-Mails",
    page: (page) => `Seite ${page} · Bis zu 15 E-Mails auf einmal`,
  },
  preview: "Kurze Vorschau anzeigen",
  readSummary: "Zusammenfassung vorlesen",
  readingNow: "Wird gerade gelesen…",
  readyToRead: "Bereit zum Lesen",
  reconnect: "Erneut verbinden",
  reply: "Antworten",
  replyAdded:
    "Die Antwort wurde zu Ihrer Nachricht hinzugefügt. Sie können sie vor der Prüfung ändern.",
  replyComposer: {
    nothingSent: (provider) =>
      `Es wurde noch nichts gesendet. Sie prüfen die Antwort zuerst. Danach wird sie über Ihr ${provider} im selben Gespräch gesendet. Möchten Sie sie lieber in ${provider} fertigstellen? Speichern Sie sie stattdessen als Entwurf.`,
    placeholder: "Schreiben Sie Ihre Antwort…",
    replyTo: (to) => `Antwort an ${to}`,
    review: "Prüfen und senden",
    saveDraft: "Stattdessen als Entwurf speichern",
    speak: "Sprechen",
    stopListening: "Zuhören beenden",
  },
  ride: {
    asked: "Sie haben jemanden um eine Fahrt gebeten.",
    confirmed: "Ihre Fahrt ist bestätigt.",
    declined: "Die Fahrt wurde abgelehnt.",
  },
  sampleEmails:
    " Dies sind Beispiel-E-Mails, mit denen Sie sicher üben können.",
  scamCheck: "Betrugsprüfung",
  scamCheckNotDone: "Betrugsprüfung noch nicht durchgeführt",
  scamSigns:
    "Hier gibt es Anzeichen für Betrug. Bitte prüfen Sie die Nachricht, bevor Sie einer ihrer Aufforderungen folgen.",
  spokenFrom: (subject, from, body) => `${subject}. Von ${from}. ${body}`,
  summarizeCloud: "Mit Cloud-KI zusammenfassen",
  summary: "Zusammenfassung",
  summaryNote:
    "Lassen Sie in LifeLink eine kurze Vorschau erstellen oder wählen Sie Cloud-KI",
  summarySpoken: "E-Mail-Zusammenfassung.",
  theEmail: "Die E-Mail",
  title: "E-Mail",
  unknownCheckNotice:
    "Bei dieser gespeicherten Prüfung ist nicht angegeben, ob Cloud-KI oder lokale Regeln verwendet wurden. Lokale Regeln decken nur Englisch ab und können Betrug in anderen Sprachen übersehen. Keine Warnzeichen bedeutet nicht, dass die E-Mail sicher ist.",
  warning: {
    concern:
      "Diese E-Mail hat Bedenken ausgelöst. Prüfen Sie die Bitte, bevor Sie handeln.",
    intro: (reason) =>
      `Möglicher Betrug. ${reason} Wenn Sie unsicher sind, fragen Sie eine vertraute Person, bevor Sie antworten, einen Link öffnen, Geld senden oder persönliche Daten weitergeben.`,
    signs: (signs) => `Warnzeichen: ${signs}.`,
  },
  warningSigns: "Warnzeichen",
  warningSignsFound: "Warnzeichen gefunden",
  whatShouldIDo: "Was soll ich tun?",
};

export { email };

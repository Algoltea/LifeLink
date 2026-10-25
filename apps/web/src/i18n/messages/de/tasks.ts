import type { Messages } from "../en";

const tasks: Messages["tasks"] = {
  alsoWaiting: "Wartet ebenfalls auf Sie",
  answerFirst: "Beantworten Sie zuerst die Frage oben.",
  approve: {
    calendar_event: "Genehmigen und hinzufügen",
    confirm_arrangement: "Fahrt bestätigen",
    create_reminder: "Erinnerung speichern",
    drive_note: "Genehmigen und speichern",
    email_draft: "Genehmigen und Entwurf speichern",
    family_update: "Mitteilung teilen",
    grocery_handoff: "Anfrage genehmigen",
    send_message: "Genehmigen und senden",
  },
  approveAgain:
    "Nach Ihrer Zustimmung hat sich etwas geändert. Bitte prüfen Sie die Angaben und stimmen Sie erneut zu.",
  approvedWaiting: "Genehmigt. Warten auf den Start…",
  approving: "Zustimmung wird erfasst…",
  askAgainIfChanged:
    "Wenn sich nach Ihrer Zustimmung etwas ändert, etwa die Uhrzeit oder der Empfänger, fragt LifeLink Sie erneut.",
  backToToday: "Zurück zu Heute",
  breadcrumb: "Navigationspfad",
  cancelEditing: "Bearbeitung abbrechen",
  cancelRequest: "Diese Anfrage abbrechen",
  cancelled: "Sie haben dies abgebrochen. Es wurde nichts gesendet.",
  cancelling: "Wird abgebrochen…",
  changeWords: "Wortlaut ändern",
  changesSaved:
    "Änderungen gespeichert. Prüfen Sie die aktualisierte Nachricht, bevor Sie zustimmen.",
  checkNow: "Jetzt prüfen",
  checkedForYou: "Für Sie geprüft",
  checking: "Wird geprüft…",
  checks: {
    appointment: (title, day, time) =>
      `Tag und Uhrzeit stimmen mit ${title} am ${day} um ${time} überein.`,
    contact: (name, relationship) =>
      `${name} ist in Ihren Kontakten (${relationship}).`,
    hasLink:
      "Diese Nachricht enthält einen Link. Prüfen Sie, ob Sie ihn wirklich einfügen wollten.",
    noLinks: "Keine Links in der Nachricht.",
    nothingUnclear: "Es ist eindeutig, um wen und welchen Zeitpunkt es geht.",
    trusted: "vertraut",
  },
  couldNotTell:
    "Wir konnten es von hier aus nicht feststellen. Bitte prüfen Sie es, zum Beispiel indem Sie die Person fragen, und teilen Sie uns mit:",
  detailsChanged:
    "Die Angaben haben sich während Ihrer Bearbeitung geändert. Ihre Änderungen bleiben hier erhalten. Vergleichen Sie sie vor dem Speichern mit dem aktuellen Wortlaut.",
  detailsGone: "Diese Angaben sind nicht mehr verfügbar.",
  didNotGoThrough: "Dies wurde nicht ausgeführt.",
  done: "Erledigt",
  earlierVersionHide: "Frühere Version ausblenden",
  earlierVersionShow: "Frühere Version anzeigen",
  goToCircle: "Zum Vertrauenskreis",
  heading: {
    approveSubline: "Es geschieht nichts ohne Ihre Zustimmung.",
    approveTitle: "Erst prüfen, dann zustimmen",
    completedSubline: "Hier ist alles erledigt.",
    confirmSubline: (who) =>
      `${who} hat geantwortet. Prüfen Sie die Uhrzeit und bestätigen Sie dann.`,
    confirmTitle: "Fahrt bestätigen",
    sendSubline: (who) =>
      `Nichts geht an ${who}, bevor Sie auf „Genehmigen“ drücken. Sie können den Wortlaut vorher ändern.`,
    sendTitle: "Vor dem Senden lesen",
    standsSubline: "Das ist der aktuelle Stand.",
    waitingSubline: (who) =>
      `Ihre Nachricht wurde gesendet. Wir zeigen die Antwort von ${who} hier, sobald sie eintrifft.`,
    waitingTitle: (who) => `Warten auf ${who}`,
  },
  howItWent: "So ist es gelaufen",
  inProgress: "In Bearbeitung",
  itArrived: "Ist angekommen",
  itDidNotArrive: "Ist nicht angekommen",
  keepMyEdits: "Meine Änderungen behalten",
  latestWording: "Aktuellen Wortlaut ansehen",
  loadingDetails: "Aufgabendetails werden geladen",
  loadingLatest: "Aktuelle Angaben werden geladen",
  loadingRequest: "Anfragedetails werden geladen",
  messageText: "Nachrichtentext",
  messages: "Nachrichten",
  noLongerEditable:
    "Diese Anfrage kann nicht mehr bearbeitet werden. Ihr ungespeicherter Text bleibt hier erhalten, damit Sie ihn kopieren können.",
  notFound: "Dies konnte nicht gefunden werden.",
  notSure: "Wir sind nicht sicher, ob dies ausgeführt wurde.",
  notSureDetail:
    "Der Dienst hat nicht bestätigt, was geschehen ist. LifeLink kennzeichnet das Ergebnis weiterhin als ungewiss, damit ein erneuter Versuch nicht irrtümlich als sicher gilt.",
  nothingNeedsYou: "Gerade ist nichts von Ihnen nötig.",
  nothingToApprove: "Hier gibt es nichts zu genehmigen.",
  nothingToApproveRequest: "Für diese Anfrage gibt es nichts zu genehmigen.",
  nothingWasSent:
    "Es wurde nichts gesendet. Sie können es sicher erneut versuchen.",
  offlineApprovalFailed:
    "Diese Zustimmung konnte offline nicht gespeichert werden. Bitte stimmen Sie erneut zu, wenn Sie verbunden sind.",
  offlineApprovalSaved:
    "Für Ihre nächste Verbindung gespeichert. LifeLink prüft alles erneut, bevor etwas gesendet wird.",
  openReceipt: "Beleg öffnen",
  outcomeError: (error) => `${error} Bitte versuchen Sie es erneut.`,
  practiceApproval:
    " Übungsmodus: Mit Ihrer Zustimmung wird gezeigt, was geschehen würde. Es wird nichts wirklich gesendet.",
  progress: "Fortschritt",
  progressAndNext: "Fortschritt und nächste Schritte",
  recordedOutcome: "Erfasstes Ergebnis",
  reminderShare: "Meinen Vertrauenskreis diese Erinnerung sehen lassen",
  reminderShareAria: "Diese Erinnerung mit meinem Vertrauenskreis teilen",
  reminderShareHint: "Nur Personen, mit denen Sie Erinnerungen teilen.",
  replied: (who) => `${who} hat geantwortet`,
  reviewStatus: {
    approved: "Genehmigt",
    awaiting_approval: "Diese Angaben prüfen",
    cancelled: "Abgebrochen",
    executing: "In Bearbeitung",
    failed: "Nicht ausgeführt",
    succeeded: "Abgeschlossen",
    unknown: "Ergebnis nicht bestätigt",
  },
  savedApproveAgain:
    "Gespeichert. Da sich der Wortlaut geändert hat, stimmen Sie bitte erneut zu.",
  savingOutcome: "Das Ergebnis wird gespeichert…",
  seeDetails: "Details ansehen",
  sentStatus: { sent: "gesendet" },
  sentWaiting:
    "Ihre Nachricht wurde gesendet. Wir zeigen die Antwort, sobald sie eintrifft.",
  shoppingRetired: "Einkaufsanfragen können nicht mehr genehmigt werden.",
  spectrumUnknown:
    "Wir können diese Nachricht weiterhin nicht bestätigen. Fragen Sie die Person, ob sie angekommen ist. Falls sie noch nicht angekommen ist, kann sie später noch eintreffen. LifeLink behält den Status „ungewiss“ bei.",
  status: {
    awaiting_approval: "Sie sind dran",
    cancelled: "Abgebrochen",
    completed: "Abgeschlossen",
    in_progress: "Wird bearbeitet",
    needs_attention: "Bitte ansehen",
    needs_clarification: "Eine Frage an Sie",
    waiting_for_reply: "Warten auf Antwort",
  },
  stepByStep: "Schritt für Schritt",
  steps: {
    awaiting_approval: "Braucht Ihre Zustimmung",
    failed: "Hat nicht funktioniert",
    pending: "Später",
    running: "Wird bearbeitet",
    skipped: "Nicht nötig",
    succeeded: "Erledigt",
    unknown: "Ausführung ungewiss",
    waiting: "Wartet",
  },
  them: "diese Person",
  they: "Die Person",
  unclearReply: (who) =>
    `Wir konnten nicht sicher erkennen, was ${who} gemeint hat. Hat ${who} zugestimmt?`,
  useLatestWords: "Aktuellen Wortlaut verwenden",
  version: (version, status) => `Version ${version} · ${status}`,
  wentNotThrough: "Es wurde nicht ausgeführt. Sie können es erneut versuchen.",
  wentThrough: "Es wurde ausgeführt.",
  whoCan: (who) => `Ja, ${who} kann`,
  whoCannot: (who) => `Nein, ${who} kann nicht`,
  workingNow: "Wird jetzt bearbeitet…",
  youSent: "Sie haben gesendet",
};

export { tasks };

import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "Über diese Prüfung",
  adviceNote:
    "Dieser Rat stammt aus der Nachricht selbst und wird deshalb nicht als Warnzeichen gezählt",
  adviceTitle: "Ratschläge in der Nachricht selbst",
  allWords: "Alle von LifeLink gelesenen Worte",
  cannotProve:
    "Dieses Ergebnis kann nicht beweisen, dass eine Nachricht echt ist. Bestätigen Sie unerwartete Bitten über einen Kontakt, den Sie bereits kennen.",
  checkDidNotFinish: "Die Prüfung wurde nicht abgeschlossen",
  checkingMessage: "Ihre Nachricht wird geprüft…",
  compareWithPhoto: "Vergleichen Sie die Worte mit Ihrem Foto",
  confidence: {
    high: "Mehrere Angaben stützen diese Einschätzung. Den Absender kann sie dennoch nicht überprüfen.",
    low: "Es gibt nicht genug Informationen, um sicher zu sein. Eine zweite Meinung kann helfen.",
    medium:
      "Einige Angaben stützen diese Einschätzung. Überprüfen Sie die Bitte auf einem unabhängigen Weg.",
  },
  couldNotRead: "LifeLink konnte dieses Foto nicht deutlich lesen",
  delete: "Diese Prüfung löschen",
  deleteConfirm:
    "Diese Prüfung löschen? Sie wird aus „Frühere Prüfungen“ entfernt.",
  deleting: "Wird gelöscht…",
  howChecked: "So wurde geprüft",
  imageUnverified:
    "Diese Worte wurden von einem Foto gelesen und können falsch oder unvollständig sein. LifeLink konnte sie nicht mit dem ursprünglichen Text abgleichen. Vergleichen Sie sie mit Ihrem Foto.",
  keep: "Diese Prüfung behalten",
  kinds: {
    email: "Eine E-Mail",
    screenshot: "Ein Foto oder Bildschirmfoto",
    text: "Eine Nachricht",
  },
  localLanguageNotice:
    "Diese lokale Prüfung ist nur für Englisch ausgelegt. Sie kann Betrug in Spanisch und anderen Sprachen übersehen. Keine Warnzeichen bedeutet nicht, dass eine Nachricht sicher ist.",
  method: {
    cloud:
      "Ein Cloud-KI-Dienst hat mit Ihrer Erlaubnis bei dieser Prüfung geholfen.",
    cloudOld:
      "Ein Cloud-KI-Dienst hat bei dieser früheren Prüfung geholfen. Angaben zur Erlaubnis wurden mit diesem Eintrag nicht gespeichert.",
    rules:
      "LifeLink hat Regeln für häufige Warnzeichen verwendet. Die Nachricht wurde für diese Prüfung nicht an einen Cloud-KI-Dienst gesendet.",
    rulesFallback:
      "LifeLink hat Regeln für häufige Warnzeichen verwendet, weil Cloud-KI nicht verfügbar war oder nicht fertig wurde. Der Dienst hat diese Inhalte möglicherweise bereits erhalten.",
    rulesOld:
      "LifeLink hat Regeln für häufige Warnzeichen verwendet. Dieser ältere Eintrag gibt nicht an, ob ein Cloud-KI-Dienst die Nachricht ebenfalls erhalten hat.",
  },
  newPhoto: "Neues Foto aufnehmen",
  noFullWording:
    "Der vollständige Wortlaut wurde mit dieser Prüfung nicht gespeichert. Die Zitate oben sind keine vollständige Abschrift. Vergleichen Sie sie mit Ihrem Foto oder geben Sie die Worte für eine weitere Prüfung ein.",
  noSigns:
    "Es wurden keine eindeutigen Warnzeichen gefunden. Das beweist nicht, dass diese Nachricht echt ist.",
  noStepsHint:
    "Bevor Sie einer unerwarteten Bitte folgen, fragen Sie eine vertraute Person über deren gespeicherte Kontaktdaten.",
  originalEmail: "Ursprüngliche E-Mail",
  originalMessage: "Ursprüngliche Nachricht",
  photo: {
    alt: "Das für diese Prüfung verwendete Foto",
    larger: "Foto größer ansehen",
    noPreview: "Für diese Prüfung ist keine Fotovorschau verfügbar. ",
    readSaved: "Sie können weiterhin das gespeicherte Ergebnis lesen.",
    reopen: "Versuchen Sie, die Prüfung erneut zu öffnen.",
    see: "Foto ansehen",
    smaller: "Foto verkleinern",
    smallerAria: "Das Foto verkleinern",
  },
  photoRetention: {
    old: "Diese ältere Prüfung hat keine gespeicherte Fotovorschau. Beim Löschen dieser Prüfung wird das Ergebnis entfernt. Das ältere Foto kann im Speicher verbleiben.",
    owned:
      "Ihr Foto wird zusammen mit dieser Prüfung aufbewahrt. Wenn Sie die Prüfung löschen, wird auch das Foto gelöscht, sofern es nicht noch von einer anderen gespeicherten Prüfung oder einem anderen Foto verwendet wird.",
  },
  readAloud: "Ergebnis vorlesen",
  readingPhoto: "Die Worte auf Ihrem Foto werden gelesen…",
  recoveryMessage:
    "Gehen Sie vorsichtig mit der Nachricht um. Sie können eine weitere Prüfung versuchen oder eine vertraute Person fragen.",
  recoveryPhoto:
    "Versuchen Sie ein deutlicheres Foto bei gutem Licht, auf dem alle Worte sichtbar sind, oder geben Sie die Worte ein. Diese Prüfung kann Ihnen nicht sagen, ob die Nachricht echt ist.",
  removedQuotes:
    "Einige vom Assistenten angeführte Worte wurden in der Nachricht nicht gefunden. Sie werden deshalb nicht angezeigt.",
  savedWording: "Der mit dieser Prüfung gespeicherte Wortlaut",
  signCount: (count) => `${count} Warnzeichen`,
  signsNoteMessage: "Was in dieser Nachricht aufgefallen ist",
  signsNotePhoto: "Mit den Worten, die LifeLink von Ihrem Foto gelesen hat",
  step: "Schritt",
  titles: {
    email: "Ihre E-Mail-Prüfung",
    screenshot: "Ihre Fotoprüfung",
    text: "Ihre Nachrichtenprüfung",
  },
  typeWords: "Stattdessen Worte eingeben",
  verdicts: {
    likely_safe: "Keine eindeutigen Warnzeichen",
    likely_scam: "Wahrscheinlich Betrug",
    suspicious: "Warnzeichen gefunden",
    unsure: "Nicht bestätigt",
  },
  waitHint:
    "Das dauert meist wenige Sekunden. Lassen Sie diese Seite geöffnet. Verwenden Sie bis dahin keine Links oder Telefonnummern aus der Nachricht und zahlen Sie niemandem Geld.",
  whatNow: "Was Sie jetzt tun können",
};

export { scamResult };

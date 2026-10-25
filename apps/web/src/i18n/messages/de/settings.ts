import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "Konten und Berechtigungen",
  accountsLink: "Konten, die LifeLink verwenden darf",
  aiEmailChecks: "Neue E-Mails mit KI prüfen",
  aiEmailChecksDescription:
    "Wenn eine neue E-Mail eintrifft, prüft ein Cloud-KI-Dienst sie auf Betrugswarnzeichen. Ältere E-Mails und Übungs-E-Mails werden niemals gesendet.",
  captions: "Untertitel beim Sprechen",
  captionsDescription: "Zeigt die Worte an, während Sie mit LifeLink sprechen.",
  characterCount: (count, maximum) => `${count} von ${maximum} Zeichen`,
  choicesNotSaved: (error) =>
    `Ihre Auswahl wurde nicht in Ihrem Konto gespeichert. ${error} Versuchen Sie es unten erneut.`,
  contrast: "Kontrast",
  contrastDescription:
    "Mehr Kontrast macht Text dunkler und Umrandungen deutlicher.",
  contrastMore: "Mehr Kontrast",
  contrastStandard: "Standard",
  defaultVoice: "LifeLink-Standard",
  demoAllowedHint: "Dieser Schalter wird automatisch gespeichert.",
  demoBetweenModes:
    "Alles, was in einem Modus vorbereitet wurde, muss erneut geprüft werden, bevor es im anderen ausgeführt wird.",
  demoDescription:
    "Im Übungsmodus wird nichts wirklich gesendet, anderswo gespeichert oder gekauft. Alle Vorgänge werden simuliert und mit „Übung“ gekennzeichnet. Beispielpersonen und -nachrichten werden hinzugefügt, damit Sie alles sicher ausprobieren können.",
  demoFailed: (error) =>
    `Der Übungsmodus konnte nicht geändert werden. ${error} Versuchen Sie den Schalter erneut.`,
  demoOff:
    "Der Übungsmodus ist ausgeschaltet. Alles, was Sie jetzt genehmigen, geschieht wirklich.",
  demoOn: "Der Übungsmodus ist eingeschaltet.",
  demoTitle: "Übungsmodus",
  demoTurnedOff: "Der Übungsmodus wurde für diese App ausgeschaltet.",
  demoUse: "Übungsmodus verwenden",
  detailDetailed: "Ausführlich",
  detailShort: "Kurz",
  explanations: "Erklärungen",
  explanationsDescription:
    "„Kurz“ nennt die wichtigsten Punkte. „Ausführlich“ erklärt etwas mehr.",
  fullName: "Vollständiger Name",
  groceriesLink: "Einkaufslisten und Budgets",
  hearSample: "Beispiel anhören",
  helpDescription:
    "Wird verwendet, wenn LifeLink Ihnen eine Nachricht, eine Betrugsprüfung, einen Rückblick auf eine Unterhaltung oder Ihren Morgenüberblick erklärt. Nur Sie sehen diese Inhalte. Die Auswahl unten wird beim Ändern gespeichert. Für Notizen gibt es eine eigene Schaltfläche „Notizen speichern“.",
  helpTitle: "So möchte ich Hilfe",
  language: "Sprache",
  languageDescription:
    "Wählen Sie die Sprache für LifeLinks zentrale Seiten und die Hilfe aus der Cloud. Die zentralen Seiten sind in allen zehn angebotenen Sprachen übersetzt. Einige neuere Seiten sind noch auf Englisch. Betrugs- und E-Mail-Prüfungen mit lokalen Regeln decken nur Englisch ab und können Betrug in anderen Sprachen übersehen. Zitate und Nachrichten behalten ihren ursprünglichen Wortlaut.",
  lessMovement: "Weniger Bewegung",
  lessMovementDescription:
    "Schaltet gleitende Übergänge und Ein- und Ausblenden aus.",
  loading: "Einstellungen werden geladen",
  newsOnToday: "Nachrichten auf Heute",
  newsOnTodayDescription:
    "Zeigt drei Schlagzeilen auf „Heute“. Dort wählen Sie gute Nachrichten oder die wichtigsten Nachrichten.",
  notes: "Notizen dazu, wie ich Hilfe möchte",
  notesHint:
    "Zum Beispiel: „Zeigen Sie mir immer nur einen Schritt.“ Nur LifeLinks Erklärungen an Sie verwenden diese Notizen. Sie werden niemals der Familie gezeigt oder in eine Nachricht eingefügt. Wenn Sie eine Cloud-Erklärung erlauben, gehen diese Notizen zusammen mit der Nachricht an den KI-Anbieter.",
  notesNotSaved: (error) =>
    `Ihre Notizen wurden nicht gespeichert. ${error} Ihr Text ist noch da. Wählen Sie „Notizen speichern“, um es erneut zu versuchen.`,
  notesSaveHint:
    "Wählen Sie „Notizen speichern“, um Änderungen an diesem Text zu behalten.",
  notesSaved: "Ihre Notizen sind gespeichert.",
  oneStep: "Ein Schritt nach dem anderen",
  oneStepDescription:
    "Zeigt Erklärungen und nächste Schritte einzeln mit einer Schaltfläche „Weiter“.",
  permissionsLink: "Wer was sehen kann",
  postalCode: "Postleitzahl",
  preferredName: "So nennt LifeLink Sie",
  profileNotSaved: (error) =>
    `Ihr Profil wurde nicht gespeichert. ${error} Ihre Eingaben sind noch da. Wählen Sie „Profil speichern“, um es erneut zu versuchen.`,
  profileSaveHint:
    "Wählen Sie „Profil speichern“, um Änderungen in diesem Abschnitt zu behalten.",
  profileTitle: "Über Sie",
  readAloudAuto: "Automatisch vorlesen",
  readAloudAutoDescription:
    "LifeLink liest neue Tagesüberblicke und Antworten vor.",
  readAloudVoice: "Vorlesestimme",
  readAloudVoiceDescription:
    "Wählen Sie, welche Stimme Ihnen vorliest. „LifeLink-Standard“ verwendet die Standardstimme.",
  saveNotes: "Notizen speichern",
  saveProfile: "Profil speichern",
  saved: "Gespeichert.",
  savesAsYouChange: "Diese Vorlieben werden beim Ändern gespeichert.",
  seeingAndHearing: "Sehen und Hören",
  signOff: "So unterschreiben Sie Nachrichten",
  signOffPlaceholder: "Zum Beispiel Mama",
  speakingSpeed: "Sprechgeschwindigkeit",
  speakingSpeedDescription: "Wie schnell LifeLink beim Vorlesen spricht.",
  speechQuicker: "Schneller",
  speechSample: "So klingt LifeLink, wenn es Ihnen vorliest.",
  speechSlower: "Langsamer",
  speechUsual: "Normal",
  subline:
    "Passen Sie LifeLink so an, dass Sie bequem lesen und zuhören können.",
  textSize: "Textgröße",
  textSizeDescription:
    "Gilt für jede Seite. Ihre Auswahl wird auf diesem Gerät gespeichert.",
  textSizeLarge: "Groß",
  textSizeLarger: "Größer",
  textSizeLargest: "Am größten",
  textSizeStandard: "Standard",
  theme: "Hell oder dunkel",
  themeDark: "Dunkel",
  themeLight: "Hell",
  themeSystem: "Wie auf meinem Gerät",
  timeZone: "Zeitzone",
  title: "Einstellungen",
  trySavingAgain: "Erneut speichern versuchen",
};

export { settings };

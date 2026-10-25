import type { Messages } from "../en";

const today: Messages["today"] = {
  addAppointment: "Termin hinzufügen",
  addPostalCode: "Ihre Postleitzahl hinzufügen",
  allEmail: "Alle E-Mails",
  allMessages: "Alle Nachrichten",
  appointment: "Termin",
  appointmentForm: {
    date: "Datum",
    heading: "Einen Termin hinzufügen",
    location: "Wo",
    missingTitle: "Bitte geben Sie an, wofür der Termin ist.",
    missingWhen: "Bitte wählen Sie ein Datum und eine Uhrzeit.",
    notes: "Notizen",
    optional: "Optional",
    pastWhen: "Bitte wählen Sie einen Zeitpunkt, der noch nicht vorbei ist.",
    save: "Termin speichern",
    saved: (title: string) => `Termin gespeichert: ${title}.`,
    time: "Uhrzeit",
    title: "Wofür ist der Termin?",
    titleHint: "Zum Beispiel: Zahnarzt oder Mittagessen mit Rosa.",
  },
  check: "Prüfen",
  checkPostalCode: "Ihre Postleitzahl prüfen",
  connect: "Verbinden",
  connectMailbox:
    "Verbinden Sie Gmail oder Outlook, um neue E-Mails hier zu sehen.",
  couldNotFindTown: "Ihr Ort wurde nicht gefunden",
  dismissFailed: (error) =>
    `${error} Wählen Sie „Fertig“, um es erneut zu versuchen.`,
  fromFamily: "Von Familie und Freunden",
  gettingStarted: "Erste Schritte",
  gettingStartedHint:
    "Jeder Schritt wird als erledigt markiert, wenn Sie ihn abschließen.",
  hideSteps: "Diese Schritte ausblenden",
  latestEmail: "Neueste E-Mails",
  loadingBriefing: "Ihr Tagesüberblick wird geladen",
  loadingToday: "Heute wird geladen",
  messages: "Nachrichten",
  messagesFrom: (names) =>
    `Sie haben in den letzten zwei Tagen Nachrichten von ${names} erhalten.`,
  newMessage: "Neue Nachricht",
  news: "Nachrichten aus der Welt",
  newsFullStory: (source) => `Ganzer Artikel bei ${source}`,
  newsGood: "Gute Nachrichten",
  newsMoreFrom: (source) => `Mehr von ${source}`,
  newsOpensNewTab: ", öffnet sich in einem neuen Tab",
  newsOpinion: "Meinungsbeitrag",
  newsSourceFrom: ", von ",
  newsSponsored: "Gesponserter Inhalt",
  newsSummarizing: "Wird zusammengefasst …",
  newsSummaryUnavailable:
    "Für diesen Artikel gibt es keine Zusammenfassung. Sie können den ganzen Artikel lesen.",
  newsTop: "Wichtigste Nachrichten",
  newsType: "Art der Nachrichten",
  newsUnavailable:
    "Nachrichten sind gerade nicht verfügbar. Bitte versuchen Sie es später erneut.",
  nextAppointment: (title, when, time) =>
    `Ihr nächster Termin: ${title}, ${when} um ${time}.`,
  noAppointments: "Sie haben diese Woche keine Termine geplant.",
  noEmail: "Keine neuen E-Mails.",
  noMessages: "Keine neuen Nachrichten in den letzten zwei Tagen.",
  noSubject: "Kein Betreff",
  nothingBooked: "Diese Woche ist nichts eingetragen.",
  onDay: (day) => `am ${day}`,
  openForDetails: "Für Details öffnen",
  possibleScam: "Möglicher Betrug",
  readMyDay: "Meinen Tag vorlesen",
  reminder: "Erinnerung",
  remindersDue: (count) =>
    `${count} ${count === 1 ? "Erinnerung ist" : "Erinnerungen sind"} fällig.`,
  rideConfirmed: (name) => `Fahrt mit ${name}, bestätigt`,
  seeWeather: "Wetter zu Ihren Terminen ansehen",
  steps: {
    askAction: "LifeLink fragen",
    askDescription:
      "Versuchen Sie „Erinnern Sie mich um fünf daran, die Pflanzen zu gießen.“ Sie prüfen alles, bevor etwas geschieht.",
    askTitle: "Um Hilfe bitten",
    emailAction: "E-Mail verbinden",
    emailDescription:
      "LifeLink liest mit Ihnen und weist auf Dinge hin, die nach Betrug aussehen.",
    emailTitle: "Ihr E-Mail-Konto verbinden",
    locationAction: "Postleitzahl hinzufügen",
    locationDescription:
      "LifeLink zeigt das Wetter auf „Heute“ und neben jedem Termin.",
    locationTitle: "Ihre Postleitzahl hinzufügen",
    trustedAction: "Person hinzufügen",
    trustedDescription:
      "Wählen Sie, wer bei Fahrten helfen kann und was diese Personen sehen dürfen. Sie entscheiden.",
    trustedTitle: "Eine vertraute Person hinzufügen",
  },
  title: "Heute",
  titlePrefix: "Heute: ",
  todayLower: "heute",
  tomorrowLower: "morgen",
  weatherHigh: ", Höchsttemperatur ",
  weatherPrefix: ", Wetter: ",
  yourWeek: "Ihre Woche",
};

export { today };

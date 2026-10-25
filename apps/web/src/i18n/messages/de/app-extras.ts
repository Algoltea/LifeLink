import type { Messages } from "../en";

const appExtras: Messages["appExtras"] = {
  approvalRecorded: (label) => `Zustimmung erfasst: ${label}`,
  loading: {
    addPerson: "Person hinzufügen",
    addPhoto: "Foto hinzufügen",
    app: "LifeLink wird geladen",
    beforeSending: "vor dem Senden",
    call: "Anruf",
    checkPhoto: "Dieses Foto prüfen",
    checks: "Ihre Prüfungen werden geladen",
    chooseFile: "Wählen Sie eine Datei aus, um hier eine Vorschau zu sehen.",
    choosePhoto: "Foto auswählen",
    circle: "Ihr Vertrauenskreis wird geladen",
    circleBody:
      "Die Menschen, denen Sie vertrauen, ihre Kontaktmöglichkeiten und genau das, was sie jeweils sehen können.",
    circleTitle: "Vertrauenskreis",
    connectEmail: "Gmail oder Outlook verbinden",
    connections: "Verbindungen werden geladen",
    connectionsBody:
      "Wählen Sie, wobei Sie Hilfe möchten. Öffnen Sie eine Karte, um vor dem Verbinden alle Möglichkeiten zu sehen.",
    connectionsTitle: "Verbindungen",
    conversation: "Unterhaltung wird geladen",
    conversations: "Unterhaltungen werden geladen",
    conversationsTitle: "Unterhaltungen",
    documentsTitle: "Dokumente",
    drive: "Ihre Drive-Dateien werden geladen",
    driveNotice:
      "Drive zum Üben mit Beispieldateien und Notizen, die Sie im Übungsmodus speichern. Nichts hier stammt aus einem echten Google-Konto.",
    earlierChecks: "Frühere Prüfungen",
    edit: "Bearbeiten",
    email: "E-Mail wird geladen",
    emailTitle: "E-Mail",
    emails: "E-Mails werden geladen",
    familyBody:
      "Sie sehen nur, was jede Person mit Ihnen teilen möchte. Sie können es ansehen, aber niemals für die Person etwas senden, genehmigen oder Geld ausgeben.",
    familyTitle: "Familie",
    groceriesBody:
      "Führen Sie eine Einkaufsliste, planen Sie Ihr Budget und kopieren oder drucken Sie, was Sie brauchen.",
    groceriesTitle: "Einkaufsliste",
    helpUnderstand: "Beim Verstehen helfen",
    inbox: "Posteingang",
    listenCall: "Bei einem Anruf zuhören",
    lists: "Ihre Listen werden geladen",
    message: "Nachricht",
    messagesBody:
      "Schreiben Sie den Menschen in Ihrem Vertrauenskreis. Sie sehen jede Nachricht, bevor sie gesendet wird.",
    messagesTitle: "Nachrichten",
    notSharing: "Sie teilen derzeit nichts mit anderen Personen.",
    page: "Ihre Seite wird geladen",
    permissions: "Berechtigungen",
    photo: "Foto",
    practiceCall: "Übungsanruf ausprobieren",
    practiceMessage: "Übung: Es wird nichts an diese Person gesendet.",
    readAloud: "Vorlesen",
    readDay: "Meinen Tag vorlesen",
    recap: "Rückblick",
    recapBody:
      "LifeLink kann zusammenfassen, was Sie und Ihre Familie vereinbart haben, was nur angeboten wurde und was noch offen ist.",
    recapConversation: "Diese Unterhaltung zusammenfassen",
    recapPractice:
      "Im Übungsmodus erstellt LifeLink den Rückblick selbst. Übungsnachrichten werden niemals an einen KI-Anbieter gesendet.",
    review: "Prüfen",
    scamBody:
      "Sind Sie bei einer Nachricht oder einem Anruf unsicher? LifeLink sucht nach Warnzeichen, bevor Sie handeln.",
    scamTitle: "Betrugsprüfung",
    settings: "Einstellungen werden geladen",
    settingsBody:
      "Passen Sie LifeLink so an, dass Sie bequem lesen und zuhören können.",
    settingsTitle: "Einstellungen",
    shared: "Geteilte Informationen werden geladen",
    startListening: "Zuhören starten",
    takePhoto: "Foto aufnehmen",
    task: "Aufgabendetails werden geladen",
    text: "Text",
    thisConversation: "diese Unterhaltung",
    today: "Heute wird geladen",
    yourFiles: "Ihre Dateien",
  },
  openingFamily: "Ihre Familienansicht wird geöffnet",
  phone: {
    allCountries: "Alle Länder",
    common: "Häufig verwendet",
    countryCode: "Ländervorwahl",
    other: "Andere: Vorwahl mit + selbst eingeben",
  },
  signIn: {
    backHome: "Zur Startseite",
    body: "Melden Sie sich an, um die heutigen Nachrichten und Termine zu sehen. Nichts wird gesendet, bevor Sie zustimmen.",
    breakPrompt: "Machen Sie gerade eine Pause?",
    busy: "Einen Moment bitte…",
    connectionError:
      "Die Verbindung konnte nicht hergestellt werden. Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
    createAccount: "Konto erstellen",
    createBody:
      "Das dauert etwa eine Minute. Ihre Familie können Sie später hinzufügen.",
    createError:
      "Das Konto konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
    createOption: "Ein Konto erstellen",
    createTitle: "Los geht’s.",
    email: "E-Mail",
    friend: "Freundin oder Freund",
    hide: "Ausblenden",
    hidePassword: "Passwort ausblenden",
    mismatch:
      "E-Mail-Adresse und Passwort stimmen nicht überein. Bitte prüfen Sie beides und versuchen Sie es erneut.",
    modeLabel: "Anmelden oder Konto erstellen",
    name: "Ihr vollständiger Name",
    or: ", oder ",
    paintingAlt: {
      "sign-in":
        "Claude Monet, Woman with a Parasol: Eine Frau mit einem grünen Sonnenschirm steht auf einem windigen Hügel vor einem hellen Himmel. Ihr kleiner Sohn steht in der Nähe im Gras.",
      "sign-up":
        "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte: Menschen ruhen sich auf einer sonnigen Wiese am Fluss aus. Ein Paar unter einem Sonnenschirm steht neben einem kleinen Hund und einem zahmen Affen.",
    },
    password: "Passwort",
    passwordHint: (count) => `Mindestens ${count} Zeichen.`,
    passwordMinimum: (count) =>
      `Bitte wählen Sie ein Passwort mit mindestens ${count} Zeichen.`,
    play: "Solitaire ohne Anmeldung spielen",
    playMahjong: "Mahjong spielen",
    show: "Anzeigen",
    showPassword: "Passwort anzeigen",
    signIn: "Anmelden",
    welcome: "Willkommen zurück.",
  },
  timeZone: {
    all: "Alle Zeitzonen",
    common: "Häufig verwendet",
  },
};

export { appExtras };

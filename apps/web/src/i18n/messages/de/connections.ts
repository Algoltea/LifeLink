import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label) => `Konto: ${label}`,
  allowProvider: (label) => `Wählen Sie auf der Seite von ${label} „Zulassen“.`,
  appAccount:
    "Dies funktioniert über das eigene Konto der App. Sie brauchen sich dafür nicht anzumelden.",
  callback: {
    back: "Zurück zu Verbindungen",
    checking: (label) => `Die Verbindung zu ${label} wird geprüft`,
    connected: (label) => `${label} ist verbunden.`,
    connectedTitle: (label) => `${label} verbunden`,
    declined: (label) =>
      `Die Verbindung zu ${label} wurde nicht fertiggestellt. Es wurde nichts geändert. Sie können es erneut versuchen.`,
    missing:
      "Diese Seite wurde geöffnet, ohne dass eine Verbindung fertigzustellen ist. Beginnen Sie bitte erneut unter „Verbindungen“.",
    practice:
      "Der Übungsmodus ist eingeschaltet. Schalten Sie ihn in den Einstellungen aus, bevor Sie eine echte Verbindung fertigstellen.",
    service: "Der Dienst",
    subline:
      "Kehren Sie zu „Verbindungen“ zurück, um Ihre Dienste zu prüfen oder erneut zu beginnen.",
    title: "Verbindungsstatus",
    unavailable:
      "Für diesen Dienst ist in LifeLink keine Verbindung verfügbar. Unter „Verbindungen“ können Sie die Einschränkungen nachlesen.",
  },
  canDo: "Das ist möglich",
  cancel: "Abbrechen",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Schließen",
  comingLater: "Kommt später",
  connect: "Verbinden",
  connectProvider: (label) => `${label} verbinden`,
  connectionState: (status) => `Status der Verbindung: ${status}.`,
  connectionStates: {
    active: "aktiv",
    deleted: "gelöscht",
    expired: "abgelaufen",
    failed: "fehlgeschlagen",
    inactive: "inaktiv",
    initiated: "gestartet",
    pending: "ausstehend",
    revoked: "widerrufen",
  },
  detailLabel: (label, summary) => `${label}. ${summary} Details.`,
  details: "Details",
  developerSetupAfter: (label) => ` aus und wählen Sie ${label}.`,
  developerSetupBefore: "Für die Person, die LifeLink betreibt: Führen Sie ",
  disconnect: (label) => `Verbindung zu ${label} trennen`,
  disconnectPractice: "Übungskonto trennen",
  disconnectTip: (label) =>
    `Tipp: Die Person kann die Verbindung zu ${label} in diesem Fenster jederzeit trennen.`,
  disconnected: (label) =>
    `Die Verbindung zu ${label} wurde getrennt. Sie wird ab jetzt nicht mehr verwendet.`,
  discordSetup: (practice) =>
    `${practice ? "Wenn Sie Discord wirklich verwenden, tragen Sie" : "Tragen Sie"} die Discord-Nutzer-ID jeder Person unter „Vertrauenskreis“ ein.`,
  empty: "Es sind keine Dienste aufgeführt.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "Verbindungen sind für diese App noch nicht eingerichtet. Führen Sie bun run dev:setup aus.",
    "Please sign in again.": "Bitte melden Sie sich erneut an.",
    "Practice connections are only available in practice mode.":
      "Übungsverbindungen sind nur im Übungsmodus verfügbar.",
    "That account could not be found.":
      "Dieses Konto konnte nicht gefunden werden.",
    "That connection could not be found.":
      "Diese Verbindung konnte nicht gefunden werden.",
    "The connection did not finish. You can try again.":
      "Die Verbindung wurde nicht fertiggestellt. Sie können es erneut versuchen.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "Diese Verbindung hat sich während der Anfrage geändert. Kehren Sie zu „Verbindungen“ zurück, um ihren Status zu prüfen.",
    "This connection was not started from your account. Please try connecting again.":
      "Diese Verbindung wurde nicht von Ihrem Konto aus gestartet. Versuchen Sie bitte erneut, die Verbindung herzustellen.",
    "This service does not use a personal sign-in.":
      "Dieser Dienst verwendet keine persönliche Anmeldung.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "Schalten Sie den Übungsmodus in den Einstellungen aus, bevor Sie ein echtes Konto verbinden oder ändern.",
    "We could not confirm the connection.":
      "Die Verbindung konnte nicht bestätigt werden.",
  },
  groups: {
    appointments: "Termine verwalten",
    email: "E-Mails lesen und schreiben",
    messages: "Familie und Freunden schreiben",
  },
  helperTitle: "Richten Sie dies für jemanden ein?",
  imessageIntro:
    "Verknüpfen Sie jede Person im Vertrauenskreis mit ihrem bestehenden Photon-Kontakt. LifeLink registriert keine neuen Kontakte.",
  imessageSteps: [
    "Speichern Sie genau die Telefonnummer oder Apple-ID-E-Mail-Adresse, von der die Person iMessages sendet. Telefonnummer und E-Mail-Adresse sind getrennte Identitäten, auch bei derselben Person.",
    "Stellen Sie sicher, dass genau diese Adresse bereits im Photon-Dashboard registriert ist. Falls sie fehlt, fügen Sie den Kontakt zuerst dort hinzu. Wählen Sie dann „iMessage verknüpfen“ im Vertrauenskreis und verwenden Sie die zugewiesene Nummer, die für diesen Kontakt angezeigt wird.",
    "Bitten Sie die Person, von genau dieser gespeicherten Adresse die erste iMessage an ihre zugewiesene Nummer zu senden. LifeLink kann ihr schreiben, sobald ihre erste Nachricht eingegangen ist.",
  ],
  intro: (label) =>
    `LifeLink bietet diese Möglichkeiten mit ${label}. Nichts wird ohne Ihre Zustimmung gesendet.`,
  limitTags: { not_offered: "Nicht möglich", not_wired: "Kommt später" },
  limitsCount: (count) => `Was LifeLink noch nicht kann (${count})`,
  limitsTitle: "Was LifeLink noch nicht kann",
  loading: "Verbindungen werden geladen",
  manage: "Verwalten",
  notSetUp:
    "Dies ist noch nicht eingeschaltet. Bitten Sie die Person, die LifeLink eingerichtet hat, es einzuschalten.",
  openCircle: "Vertrauenskreis öffnen",
  permissions: {
    add: "Hinzufügen",
    calendar: "Termine suchen",
    draft: "Entwurf",
    message: "Nachricht",
    money: "Geld",
    notice: "Hinweise",
    post: "Veröffentlichen",
    read: "Lesen",
    replies: "Antworten",
    send: "Senden",
    unavailable: "Noch nichts",
  },
  practiceAccount: "Übungskonto verwenden",
  practiceBlocked: (label) =>
    `Ihre echte Verbindung zu ${label} ist gespeichert. Übungskonten können sie nicht ersetzen. Schalten Sie den Übungsmodus in den Einstellungen aus, um sie zu verwalten.`,
  practiceConnected: (label) =>
    `Ein Übungskonto für ${label} ist verbunden. Es greift niemals auf den echten Dienst zu.`,
  practiceDisconnected: (label) =>
    `Das Übungskonto für ${label} wurde getrennt.`,
  practiceMessages: (imessage) =>
    imessage
      ? "iMessages im Übungsmodus sind simuliert. Keine Nachrichten erreichen Ihre Kontakte."
      : "Discord-Nachrichten im Übungsmodus sind simuliert. Keine Nachrichten erreichen Ihre Kontakte.",
  practiceNeverConnects:
    "Dieses Übungskonto stellt niemals eine Verbindung zum echten Dienst her.",
  pressConnect: (label) => `Wählen Sie unten „${label}“.`,
  providers: {
    discord: {
      accountRequirement:
        "Das Familienmitglied ist auf einem gemeinsamen Server mit dem Bot der App oder hat dem Bot zuerst geschrieben.",
      capabilities: {
        "discord.receive": {
          label: "Antworten empfangen",
          note: "Antworten kommen an, solange LifeLinks Discord-Bot online ist.",
        },
        "discord.send": {
          label: "Nach Ihrer Zustimmung eine Direktnachricht senden",
        },
      },
      summary: "Direktnachrichten mit Familienmitgliedern auf Discord.",
    },
    ebay: {
      accountRequirement:
        "Persönliche eBay-Konten können hier nicht verbunden werden.",
      capabilities: {
        "ebay.search": { label: "eBay-Angebote suchen" },
        "ebay.selling": { label: "Ihre Angebote, Bestellungen oder Käufe" },
      },
      summary:
        "Die Suche kommt später. LifeLink kauft oder verkauft niemals etwas.",
    },
    facebook: {
      accountRequirement:
        "Nur Funktionen für Facebook-Seiten. Persönliche Profile werden nicht unterstützt.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Nachrichten Ihrer Seite lesen und beantworten",
        },
        "facebook.page_post": {
          label: "Nach Ihrer Zustimmung auf einer Seite veröffentlichen",
        },
        "facebook.personal": {
          label: "Persönliche Chronik und Nachrichten von Freunden",
          note: "Facebook erlaubt Apps nicht, persönliche Messenger-Chats zu lesen oder zu senden.",
        },
      },
      summary: "Nur Unternehmensseiten. Kommt später.",
    },
    gmail: {
      accountRequirement: "Ein Google-Konto.",
      capabilities: {
        "email.appointments": { label: "Termine in E-Mails finden" },
        "email.draft": { label: "Einen Entwurf zur Prüfung für Sie schreiben" },
        "email.new_message_event": {
          label: "Neue E-Mails erkennen (Prüfung etwa einmal pro Minute)",
        },
        "email.read_selected": {
          label: "Von Ihnen ausgewählte E-Mails für eine Zusammenfassung lesen",
        },
        "email.send": { label: "Nach Ihrer Zustimmung eine E-Mail senden" },
      },
      summary:
        "E-Mails lesen, schreiben und senden. Termine in Ihren E-Mails finden.",
    },
    google_calendar: {
      accountRequirement: "Ein Google-Konto.",
      capabilities: {
        "calendar.create": {
          label: "Einen von Ihnen genehmigten Termin hinzufügen",
        },
        "calendar.read": { label: "Ihre bevorstehenden Termine ansehen" },
      },
      summary: "Nach Ihrer Zustimmung Termine zu Ihrem Kalender hinzufügen.",
    },
    google_drive: {
      accountRequirement: "Ein Google-Konto.",
      capabilities: {
        "drive.create": {
          label: "Nach Ihrer Zustimmung Terminnotizen als Dokument speichern",
        },
        "drive.read": {
          label: "Dateien finden, die Sie bereits in Drive aufbewahren",
          note: "LifeLink sieht Dateinamen und Links, aber nicht den Inhalt der Dateien.",
        },
      },
      summary: "Ihre Dateien finden und Terminnotizen speichern.",
    },
    imessage: {
      accountRequirement:
        "Ihre Kontakte brauchen weder eine Einladung noch ein LifeLink-Konto oder Zugriff auf das Photon-Dashboard.",
      capabilities: {
        "imessage.delivery": {
          label: "Zustellungsinformationen",
          note: "LifeLink weiß, dass Ihre Nachricht gesendet wurde, aber nicht, ob sie angekommen ist oder gelesen wurde.",
        },
        "imessage.first_contact": {
          label: "Eine Unterhaltung mit einer neuen Person beginnen",
          note: "Jede Person muss die erste Nachricht senden.",
        },
        "imessage.receive": { label: "Antworten empfangen" },
        "imessage.send": {
          label: "Nach Ihrer Zustimmung einen Text oder ein Foto senden",
          note: "Funktioniert, nachdem die Person die erste Nachricht gesendet hat.",
        },
      },
      summary:
        "Nachrichten mit Familie und Freunden austauschen. Jede Person sendet die erste Nachricht.",
    },
    instacart: {
      accountRequirement: "Einkaufen über LifeLink ist nicht mehr verfügbar.",
      capabilities: {},
      summary: "Einkaufen über LifeLink ist nicht mehr verfügbar.",
    },
    instagram: {
      accountRequirement: "Ein Instagram-Business- oder Creator-Konto.",
      capabilities: {
        "instagram.messages": { label: "Direktnachrichten beantworten" },
        "instagram.personal": { label: "Persönliche Konten" },
        "instagram.post": {
          label: "Nach Ihrer Zustimmung einen Fotobeitrag teilen",
        },
      },
      summary: "Nur Business- und Creator-Konten. Kommt später.",
    },
    outlook: {
      accountRequirement:
        "Ein Microsoft-Konto. Manche Arbeitskonten benötigen die Zustimmung der Administration.",
      capabilities: {
        "calendar.create": {
          label:
            "Einen von Ihnen genehmigten Termin zum Outlook-Kalender hinzufügen",
        },
        "email.draft": { label: "Einen Entwurf zur Prüfung für Sie schreiben" },
        "email.new_message_event": {
          label: "Neue E-Mails beim Eintreffen erkennen",
        },
        "email.read_selected": {
          label: "Von Ihnen ausgewählte E-Mails für eine Zusammenfassung lesen",
        },
        "email.send": { label: "Nach Ihrer Zustimmung eine E-Mail senden" },
      },
      summary: "Outlook-E-Mail und -Kalender über eine Verbindung.",
    },
    paypal: {
      accountRequirement:
        "Persönliche PayPal-Konten können hier nicht verbunden werden.",
      capabilities: {
        "paypal.invoices": { label: "Rechnungen nachsehen" },
        "paypal.send_money": {
          label: "Geld an eine Person senden",
          note: "LifeLink sendet niemals Geld.",
        },
      },
      summary: "Rechnungen kommen später. LifeLink sendet niemals Geld.",
    },
    telegram: {
      accountRequirement:
        "Das Familienmitglied öffnet den von LifeLink für es erstellten Link und tippt in Telegram auf Start.",
      capabilities: {
        "telegram.first_contact": {
          label: "Eine Unterhaltung mit einer neuen Person beginnen",
          note: "Jede Person muss beim Bot zuerst auf Start tippen.",
        },
        "telegram.receive": { label: "Antworten empfangen" },
        "telegram.send": {
          label: "Nach Ihrer Zustimmung eine Nachricht oder Fotos senden",
        },
      },
      summary: "Nachrichten mit Familienmitgliedern auf Telegram.",
    },
  },
  realImessage:
    "Wenn Sie iMessage wirklich verwenden, folgen Sie diesen Schritten.",
  requirements: "Was Sie brauchen",
  retry: "Erneut verbinden versuchen",
  returnConnected: "Danach kehren Sie hierher zurück und sehen „Verbunden“.",
  setup: "Einrichten",
  signInProvider: (label) =>
    `Sie melden sich auf der eigenen Seite von ${label} an. LifeLink sieht Ihr Passwort niemals.`,
  signInTheirAccount:
    "Melden Sie sich mit dem Konto der Person an, nicht mit Ihrem eigenen.",
  status: {
    connected: "Verbunden",
    disconnected: "Nicht verbunden",
    error: "Verbindung fehlgeschlagen",
    notOn: "Nicht eingeschaltet",
    pending: "Nicht abgeschlossen",
    practice: "Übung",
    practiceAccount: "Übungskonto",
    ready: "Bereit",
    realSaved: "Echtes Konto gespeichert",
  },
  subline:
    "Verbinden Sie die Dienste, die Sie bereits nutzen. Öffnen Sie einen Dienst, um zu sehen, was LifeLink damit tun kann.",
  telegramSetup: (practice) =>
    `${practice ? "Wenn Sie Telegram wirklich verwenden, öffnen Sie" : "Öffnen Sie"} jede Person im Vertrauenskreis, wählen Sie „Telegram verknüpfen“ und senden Sie ihr ihren Link. Sie tippt einmal auf Start.`,
  title: "Verbindungen",
  unavailableFeatures: (label) =>
    `Für ${label} gibt es in LifeLink noch keine verfügbaren Funktionen. Sie brauchen kein Konto zu verbinden.`,
  unavailableIntro: (label) => `LifeLink kann mit ${label} noch nichts tun.`,
};

export { connections };

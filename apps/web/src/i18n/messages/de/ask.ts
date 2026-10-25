import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "Chatverlauf schließen",
  composerLabel: "Schreiben oder sprechen Sie mit LifeLink",
  conversationLabel: "Unterhaltung mit LifeLink",
  copied: "Kopiert",
  copy: "Kopieren",
  copyUnavailable:
    "Kopieren ist hier nicht möglich. Sie können stattdessen den Text markieren.",
  emailSummary: {
    cloud: "Zusammenfassung aus der Cloud",
    cloudConsent:
      "Cloud-KI für eine ausführlichere Zusammenfassung verwenden. Dabei werden der verfügbare Text und gespeicherte Zusammenfassungen meiner 15 neuesten importierten E-Mails an den KI-Anbieter gesendet. Lassen Sie das Kästchen frei, um die Zusammenfassung in LifeLink zu erstellen.",
    count: (count) =>
      `${count} kürzlich importierte ${count === 1 ? "E-Mail" : "E-Mails"} · `,
    empty:
      "Noch keine importierten E-Mails. Suchen Sie auf der E-Mail-Seite nach neuen E-Mails und erstellen Sie dann erneut eine Zusammenfassung.",
    emptyGroup: "Keine E-Mails in dieser Kategorie.",
    groups: {
      check_first: "Vor dem Handeln prüfen",
      low_priority: "Weniger dringend",
      reply: "Möglicherweise Antwort nötig",
      review: "Ein Blick lohnt sich",
    },
    howMade: "So wurde diese Zusammenfassung erstellt",
    local: "LifeLink-Zusammenfassung",
    noSubject: "(Kein Betreff)",
    offline:
      "Stellen Sie eine Verbindung her, um Ihre importierten E-Mails zusammenzufassen.",
    openEmail: "E-Mail öffnen",
    options: "Optionen zur Zusammenfassung",
    practicePrefix: "Übung · ",
    suggestionsOnly:
      "Dies sind nur Vorschläge. Lesen Sie die ursprünglichen Nachrichten, bevor Sie handeln. In Ihrem Postfach wurde nichts gesendet oder geändert.",
    summarize: "E-Mails zusammenfassen",
    summarizing: "E-Mails werden zusammengefasst…",
    title: "Zusammenfassung neuer E-Mails",
    working: "Die E-Mail-Zusammenfassung wird zu diesem Chat hinzugefügt…",
  },
  failed: "Diese Antwort wurde nicht fertiggestellt. Bitte fragen Sie erneut.",
  history: "Verlauf",
  historyDescription: "Machen Sie dort weiter, wo Sie aufgehört haben.",
  historyEmpty:
    "Noch keine Unterhaltungen. Ihr erster Chat wird hier gespeichert.",
  historyGroups: { earlier: "Früher", thisWeek: "Diese Woche" },
  historyTitle: "Chatverlauf",
  lifeLinkSaid: "LifeLink sagte: ",
  loadEarlier: "Frühere Nachrichten anzeigen",
  loadEarlierConversations: "Frühere Unterhaltungen anzeigen",
  loadingConversation: "Ihre Unterhaltung wird geladen",
  loadingConversations: "Unterhaltungen werden geladen…",
  loadingEarlier: "Frühere Nachrichten werden geladen…",
  loadingHistory: "Ihr Chatverlauf wird geladen",
  newChat: "Neuer Chat",
  openNow: ", jetzt geöffnet",
  opening: "Ihre Unterhaltung wird geöffnet",
  quickActions: "Schnellauswahl",
  suggestions: {
    reminder: {
      label: "Erinnerung einrichten",
      prompt: "Erinnern Sie mich daran, ",
    },
    ride: {
      label: "Um eine Fahrt bitten",
      prompt:
        "Fragen Sie meine Familie, ob mich jemand zu meinem Termin fahren kann am ",
    },
    write: {
      label: "Der Familie schreiben",
      prompt: "Helfen Sie mir, eine Nachricht zu schreiben an ",
    },
  },
  thinking: "Einen Moment bitte…",
  title: "LifeLink fragen",
  titlePrefix: "LifeLink fragen: ",
  waitingConnection: "Warten auf eine Verbindung. Es wurde nichts gesendet.",
  waitingForConnection: "Nachrichten warten auf eine Verbindung",
  whatCanIHelp: "Wobei kann ich Ihnen heute helfen?",
  youSaid: "Sie sagten: ",
  yourConversation: "Ihre Unterhaltung",
};

export { ask };

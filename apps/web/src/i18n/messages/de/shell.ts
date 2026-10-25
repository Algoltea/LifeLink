import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "Kontomenü für ",
  closeMenu: "Menü schließen",
  dismissNotice: "Hinweis schließen",
  familyMember: "Familienmitglied",
  groupGames: "Spiele",
  groupHelpWith: "Hilfe bei",
  groupSetup: "Ihre Einrichtung",
  mainNavigation: "Hauptnavigation",
  menu: "Menü",
  nav: {
    ask: "LifeLink fragen",
    circle: "Vertrauenskreis",
    connections: "Verbindungen",
    documents: "Dokumente",
    email: "E-Mail",
    family: "Familie",
    groceries: "Einkaufsliste",
    mahjong: "Mahjong",
    messages: "Nachrichten",
    scam: "Betrugsprüfung",
    settings: "Einstellungen",
    solitaire: "Solitaire",
    today: "Heute",
  },
  needsReview: (label) => `${label} muss von Ihnen geprüft werden.`,
  notTriedAgain: "Es wird nicht automatisch erneut versucht.",
  offline:
    "Sie sind offline. Sie können weiterschreiben. Alles, was Sie genehmigen, wird erneut geprüft und gesendet, sobald Sie wieder online sind.",
  offlineReview: "Offline vorbereitete Aufgaben müssen geprüft werden",
  offlineWaiting: (count) => ` ${count} warten.`,
  openAsk: "LifeLink fragen öffnen",
  openMenu: "Menü öffnen",
  originalRequest: "Ihre ursprüngliche Anfrage",
  playAccount:
    "Ihre Spiele werden auf diesem Gerät gespeichert und funktionieren offline.",
  practiceBannerOn: "Der Übungsmodus ist eingeschaltet.",
  practiceBannerRest: "Es werden keine echten Nachrichten gesendet.",
  practiceMode: "Übungsmodus",
  reviewOnToday: "Auf Heute prüfen",
  signOut: "Abmelden",
  skipToMain: "Zum Hauptinhalt springen",
  turnOffPractice: "Übungsmodus ausschalten",
  yourOfflineRequest: "Ihre Offline-Anfrage",
};

export { shell };

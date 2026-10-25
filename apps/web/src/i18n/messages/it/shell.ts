import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "Menu dell’account di ",
  closeMenu: "Chiudi menu",
  dismissNotice: "Chiudi avviso",
  familyMember: "Familiare",
  groupGames: "Giochi",
  groupHelpWith: "Aiuto per",
  groupSetup: "Le Sue impostazioni",
  mainNavigation: "Principale",
  menu: "Menu",
  nav: {
    ask: "Chiedi a LifeLink",
    circle: "Cerchia di fiducia",
    connections: "Collegamenti",
    documents: "Documenti",
    email: "Email",
    family: "Famiglia",
    groceries: "Spesa",
    mahjong: "Mahjong",
    messages: "Messaggi",
    scam: "Controllo truffe",
    settings: "Impostazioni",
    solitaire: "Solitario",
    today: "Oggi",
  },
  needsReview: (label) => `${label} richiede la Sua verifica.`,
  notTriedAgain: "Non verrà riprovato automaticamente.",
  offline:
    "Non c’è connessione. Può continuare a scrivere; ciò che approva verrà ricontrollato e inviato quando tornerà online.",
  offlineReview:
    "Le attività preparate senza connessione richiedono la Sua verifica",
  offlineWaiting: (count) => ` ${count} in attesa.`,
  openAsk: "Apri Chiedi",
  openMenu: "Apri menu",
  originalRequest: "La Sua richiesta originale",
  playAccount:
    "Le partite sono salvate su questo dispositivo e funzionano senza connessione.",
  practiceBannerOn: "La modalità di prova è attiva.",
  practiceBannerRest: "Non vengono inviati messaggi reali.",
  practiceMode: "Modalità di prova",
  reviewOnToday: "Verifica su Oggi",
  signOut: "Esci",
  skipToMain: "Vai al contenuto principale",
  turnOffPractice: "Disattiva modalità di prova",
  yourOfflineRequest: "La Sua richiesta senza connessione",
};

export { shell };

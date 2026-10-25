import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "Chiudi cronologia delle conversazioni",
  composerLabel: "Scriva o parli a LifeLink",
  conversationLabel: "Conversazione con LifeLink",
  copied: "Copiato",
  copy: "Copia",
  copyUnavailable: "Qui non è possibile copiare. Può selezionare il testo.",
  emailSummary: {
    cloud: "Riepilogo nel cloud",
    cloudConsent:
      "Usa l’IA nel cloud per un riepilogo più completo. Il testo disponibile e i riepiloghi salvati delle mie 15 email importate più recenti saranno inviati al fornitore di IA. Lasci deselezionato per creare il riepilogo in LifeLink.",
    count: (count) =>
      `${count} ${count === 1 ? "email recente importata" : "email recenti importate"} · `,
    empty:
      "Non ci sono ancora email importate. Cerchi nuove email nella pagina Email, poi crei di nuovo il riepilogo.",
    emptyGroup: "Nessuna email in questa categoria.",
    groups: {
      check_first: "Da controllare prima di agire",
      low_priority: "Priorità minore",
      reply: "Potrebbe richiedere una risposta",
      review: "Da leggere",
    },
    howMade: "Come è stato creato il riepilogo",
    local: "Riepilogo di LifeLink",
    noSubject: "(Senza oggetto)",
    offline: "Si colleghi per riassumere le email importate.",
    openEmail: "Apri Email",
    options: "Opzioni del riepilogo",
    practicePrefix: "Prova · ",
    suggestionsOnly:
      "Sono solo suggerimenti. Verifichi i messaggi originali prima di agire. Nulla è stato inviato o modificato nella Sua casella email.",
    summarize: "Riassumi email",
    summarizing: "Riepilogo delle email in corso…",
    title: "Riepilogo delle email recenti",
    working: "Aggiunta del riepilogo delle email a questa conversazione…",
  },
  failed: "La risposta non è stata completata. Provi a chiedere di nuovo.",
  history: "Cronologia",
  historyDescription: "Riprenda da dove era rimasto.",
  historyEmpty: "Non ci sono ancora conversazioni. La prima verrà salvata qui.",
  historyGroups: {
    earlier: "Precedenti",
    thisWeek: "Questa settimana",
  },
  historyTitle: "Cronologia delle conversazioni",
  lifeLinkSaid: "LifeLink ha detto: ",
  loadEarlier: "Mostra messaggi precedenti",
  loadEarlierConversations: "Mostra conversazioni precedenti",
  loadingConversation: "Caricamento della Sua conversazione",
  loadingConversations: "Caricamento delle conversazioni…",
  loadingEarlier: "Caricamento dei messaggi precedenti…",
  loadingHistory: "Caricamento della cronologia delle conversazioni",
  newChat: "Nuova conversazione",
  openNow: ", aperta ora",
  opening: "Apertura della Sua conversazione",
  quickActions: "Azioni rapide",
  suggestions: {
    reminder: {
      label: "Imposta un promemoria",
      prompt: "Mi ricordi di ",
    },
    ride: {
      label: "Chiedi un passaggio",
      prompt:
        "Chieda alla mia famiglia se qualcuno può accompagnarmi all’appuntamento il ",
    },
    write: {
      label: "Scrivi alla famiglia",
      prompt: "Mi aiuti a scrivere un messaggio a ",
    },
  },
  thinking: "Sto pensando…",
  title: "Chiedi a LifeLink",
  titlePrefix: "Chiedi a LifeLink: ",
  waitingConnection: "In attesa della connessione. Nulla è stato inviato.",
  waitingForConnection: "Messaggi in attesa della connessione",
  whatCanIHelp: "Come posso aiutarLa oggi?",
  youSaid: "Lei ha detto: ",
  yourConversation: "La Sua conversazione",
};

export { ask };

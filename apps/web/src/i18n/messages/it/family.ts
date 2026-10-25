import type { Messages } from "../en";

const family: Messages["family"] = {
  appointments: "Appuntamenti",
  budget: (amount) => ` · limite di spesa ${amount}`,
  checked: (kind, day) => `Controllo di ${kind} del ${day}`,
  codeHint:
    "La persona che Le ha inviato l’invito può leggerlo nella sua pagina Cerchia di fiducia.",
  connect: "Collega",
  connected:
    "Il collegamento è attivo. Vedrà solo ciò che la persona ha scelto di condividere.",
  empty:
    "Nessuno sta ancora condividendo informazioni con Lei. Quando riceve un invito, inserisca il codice qui sotto.",
  groceries: "Spesa",
  haveCode: "Ha un codice d’invito?",
  invitationCode: "Codice d’invito",
  kinds: {
    email: "email",
    screenshot: "schermata",
    text: "testo",
  },
  likelyScam: "Probabile truffa",
  loadingMessages: "Caricamento dei messaggi",
  loadingPhoto: "Caricamento della foto…",
  loadingShared: "Caricamento delle informazioni condivise",
  loadingWhatWasShared: "Caricamento di ciò che è stato condiviso",
  messagesWith: (name) => `Messaggi con ${name}`,
  noMessages: "Non ci sono ancora messaggi in LifeLink.",
  noSharedReminders: "Nessun promemoria condiviso.",
  notSharing:
    "Questa persona non sta condividendo informazioni con Lei al momento.",
  nothingLeft: "Non resta nulla da comprare.",
  nothingSoon: "Nessun impegno nei prossimi 30 giorni.",
  onlyResult: "Viene condiviso solo il risultato, mai il messaggio stesso.",
  photoUnavailable: "Questa foto non è disponibile.",
  photos: "Foto",
  replyTo: (name) => `Rispondi a ${name}`,
  ride: {
    asked: "Passaggio richiesto, non ancora confermato",
    confirmed: "Passaggio confermato",
    declined: "Passaggio rifiutato",
  },
  scamChecks: "Controlli truffe",
  sendReply: "Invia risposta",
  sharedPhoto: "Una foto condivisa",
  sharedReminders: "Promemoria condivisi",
  shares: (name, scopes) =>
    `${name} condivide: ${scopes}. Può vedere queste informazioni, ma non può inviare, approvare o spendere nulla per questa persona.`,
  subline:
    "Veda solo ciò che ogni persona sceglie di condividere. Può guardare, ma non può mai inviare, approvare o spendere nulla per loro.",
  suspicious: "Sospetto",
  theyWrote: (name) => `${name} ha scritto: `,
  title: "Famiglia",
  updates: "Aggiornamenti",
  withPhotos: " · con foto",
  you: "Lei",
  youWrote: "Lei ha scritto: ",
};

export { family };

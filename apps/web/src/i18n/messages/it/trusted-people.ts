import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "Aggiungi una persona di fiducia",
  call: "Chiama",
  callAria: (name) => `Chiama ${name}`,
  callHelpMessage:
    "Ho dei dubbi su una chiamata che ho ricevuto. Mi aiuti a verificare se è autentica prima che condivida informazioni o invii denaro?",
  callsLoading:
    "Le chiamate non sono disponibili finché non vengono caricate le impostazioni dell’account.",
  callsPractice: "Le chiamate non sono disponibili in modalità di prova.",
  contactFallback: "Contatto",
  empty: "Un altro parere può aiutare. Aggiunga qualcuno che conosce alla Sua ",
  emptyRest:
    " per chiedere aiuto con questo controllo. Verificherà ogni messaggio prima dell’invio.",
  failed: (name, error) =>
    `Non è stato possibile preparare il messaggio per ${name}. ${error} Nulla è stato inviato. Riprovi con Prepara messaggio.`,
  introCall:
    "Prepari un messaggio per chiedere aiuto con la chiamata. Potrà leggerlo e modificarlo prima di approvarlo. Non viene ancora inviato nulla.",
  introCheck:
    "Prepari un messaggio per chiedere aiuto con questo controllo. Potrà leggerlo e modificarlo prima di approvarlo. Non viene ancora inviato nulla.",
  list: "Persone di fiducia",
  loading: "Caricamento delle persone di fiducia",
  noMessageAddress: "Nessun recapito per messaggi salvato",
  noPhone: "Nessun numero di telefono salvato. ",
  noWayToMessage: "Nessun recapito per inviare messaggi salvato. ",
  prepare: "Prepara messaggio",
  prepareAria: (name) => `Prepara un messaggio per ${name}`,
  preparing: "Preparazione…",
  reachedBy: {
    discord: "Contattabile via messaggio",
    email: "Contattabile via email",
    imessage: "Contattabile via messaggio",
    in_app: "Contattabile in LifeLink",
    telegram: "Contattabile via messaggio",
  },
  saveDetails: "Salvi i recapiti nella Sua ",
  trustedCircle: "Cerchia di fiducia",
  unavailable: "Chiama e Prepara messaggio non sono disponibili al momento.",
};

export { trustedPeople };

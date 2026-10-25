import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " e ",
  appointment: "Appuntamento",
  budget: (amount) => ` Limite di spesa: ${amount}.`,
  by: (channel) => `Tramite ${channel}`,
  calendar: "Calendario",
  confirming: "Sta confermando",
  document: "Documento",
  draftSavedIn: (provider) =>
    `Salvato come bozza in ${provider}. Non viene inviato finché non lo invia da lì.`,
  driveNoteHint:
    "Viene salvato come nuovo documento nel Suo Google Drive. Solo Lei può vederlo, a meno che non lo condivida lì.",
  estimate: (amount) => `La Sua stima: ${amount}.`,
  event: "Evento",
  itemCount: (name, count) =>
    `${name}: ${count} ${count === 1 ? "articolo" : "articoli"}`,
  noEstimate: "Nessuna stima disponibile.",
  noJustYou: "No, solo Lei",
  notGiven: "Non indicato",
  notes: "Note",
  onlyGrantees: (names, scope) =>
    `Solo ${names} vedrà questo contenuto, perché Lei condivide ${scope} con queste persone.`,
  peopleYouAllowed: "le persone che ha autorizzato",
  readEmail: "Leggi l’email ad alta voce",
  readMessage: "Leggi il messaggio ad alta voce",
  readNote: "Leggi la nota ad alta voce",
  readUpdate: "Leggi l’aggiornamento ad alta voce",
  reminder: "Promemoria",
  replySentFrom: (provider) =>
    `La risposta viene inviata dal Suo account ${provider} nella stessa conversazione, solo dopo la Sua approvazione.`,
  sharedWithCircle: "Condiviso con la Sua cerchia di fiducia",
  shoppingRecord:
    "Questo è il record di una precedente richiesta di acquisto. Gli acquisti tramite LifeLink non sono più disponibili.",
  spoken: {
    appointment: (title: string, when: string, location: string | null) =>
      `Appuntamento: ${title}. ${when}${location ? `, presso ${location}` : ""}.`,
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, presso ${location}` : ""}.`,
    confirm: (summary) => `Sta confermando: ${summary}`,
    driveNote: (title, body) =>
      `Una nota nel Suo Google Drive intitolata ${title}. Il testo è: ${body}`,
    email: (to, subject, body) =>
      `Email a ${to}. Oggetto: ${subject}. Il testo è: ${body}`,
    emailAloud: (subject, body) => `Oggetto: ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `A ${name}, tramite ${channel}${route}. Il messaggio dice: ${body}`,
    reminder: (title, when, shared) =>
      `Promemoria: ${title}. ${when}. ${shared ? "Condiviso con la Sua cerchia di fiducia." : "Solo per Lei."}`,
    reply: (to, subject, body) =>
      `Risposta a ${to}. Oggetto: ${subject}. Il testo è: ${body}`,
    update: (text) => `L’aggiornamento dice: ${text}`,
  },
  starts: "Inizio",
  subject: "Oggetto",
  thisScope: "queste informazioni",
  to: "A",
  toAddress: (address) => ` a ${address}`,
  toName: (name) => `A ${name}`,
  when: "Quando",
  where: "Dove",
  withPhotos: (count) => `Con ${count} foto.`,
  yesShared: "Sì",
};

export { actionDetails };

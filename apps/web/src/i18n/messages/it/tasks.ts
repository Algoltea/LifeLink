import type { Messages } from "../en";

const tasks: Messages["tasks"] = {
  alsoWaiting: "Anche queste attività La attendono",
  answerFirst: "Risponda prima alla domanda sopra.",
  approve: {
    calendar_event: "Approva e aggiungi",
    confirm_arrangement: "Conferma il passaggio",
    create_appointment: "Aggiungi l'appuntamento",
    create_reminder: "Salva il promemoria",
    drive_note: "Approva e salva",
    email_draft: "Approva e salva la bozza",
    email_reply: "Approva e invia",
    family_update: "Condividi l’aggiornamento",
    grocery_handoff: "Approva richiesta",
    send_message: "Approva e invia",
  },
  approveAgain:
    "Qualcosa è cambiato dopo la Sua approvazione. Verifichi e approvi di nuovo.",
  approvedWaiting: "Approvato. In attesa di iniziare…",
  approving: "Approvazione…",
  askAgainIfChanged:
    "Se qualcosa cambia dopo la Sua approvazione, per esempio l’orario o il destinatario, LifeLink Le chiederà di nuovo.",
  backToToday: "Torna a Oggi",
  breadcrumb: "Percorso di navigazione",
  cancelEditing: "Annulla modifica",
  cancelRequest: "Annulla questa richiesta",
  cancelled: "Ha annullato questa richiesta. Nulla è stato inviato.",
  cancelling: "Annullamento…",
  changeDetails: "Modifica i dettagli",
  changeDetailsSaved: "Salvato. Lo controlli, poi approvi.",
  changeWords: "Modifica il testo",
  changesSaved:
    "Modifiche salvate. Verifichi il messaggio aggiornato prima di approvarlo.",
  checkNow: "Controlla adesso",
  checkedForYou: "Controllato per Lei",
  checking: "Controllo in corso…",
  checks: {
    appointment: (title, day, time) =>
      `Il giorno e l’orario corrispondono a ${title} il ${day} alle ${time}.`,
    contact: (name, relationship) =>
      `${name} è tra i Suoi contatti (${relationship}).`,
    hasLink:
      "Questo messaggio contiene un collegamento. Si assicuri di volerlo includere.",
    noLinks: "Nessun collegamento nel messaggio.",
    nothingUnclear: "Non ci sono dubbi su chi o quando.",
    trusted: "di fiducia",
  },
  couldNotTell:
    "Non siamo riusciti a verificarlo da qui. Controlli, per esempio chiedendo alla persona, e ci dica:",
  detailsChanged:
    "I dettagli sono cambiati mentre li modificava. Le Sue modifiche sono conservate qui. Le confronti con il testo più recente prima di salvare.",
  detailsGone: "Questi dettagli non sono più disponibili.",
  didNotGoThrough: "Questa operazione non è andata a buon fine.",
  done: "Fatto",
  earlierVersionHide: "Nascondi la versione precedente",
  earlierVersionShow: "Mostra la versione precedente",
  goToCircle: "Vai alla Cerchia di fiducia",
  heading: {
    approveSubline: "Non accade nulla finché non approva.",
    approveTitle: "Controlli, poi approvi",
    completedSubline: "Tutte le attività di questa richiesta sono completate.",
    confirmSubline: (who) =>
      `${who} ha risposto. Controlli l’orario, poi confermi.`,
    confirmTitle: "Conferma il passaggio",
    sendSubline: (who) =>
      `Nulla viene inviato a ${who} finché non preme Approva. Prima può modificare il testo.`,
    sendTitle: "Legga prima dell’invio",
    standsSubline: "Ecco a che punto siamo.",
    waitingSubline: (who) =>
      `Il messaggio è stato inviato. Mostreremo qui la risposta di ${who} appena arriverà.`,
    waitingTitle: (who) => `In attesa di ${who}`,
  },
  howItWent: "Com’è andata",
  inProgress: "In corso",
  itArrived: "È arrivato",
  itDidNotArrive: "Non è arrivato",
  keepMyEdits: "Mantieni le mie modifiche",
  latestWording: "Mostra il testo più recente",
  loadingDetails: "Caricamento dei dettagli dell’attività",
  loadingLatest: "Caricamento dei dettagli più recenti",
  loadingRequest: "Caricamento dei dettagli della richiesta",
  messageText: "Testo del messaggio",
  messages: "Messaggi",
  noLongerEditable:
    "Questa richiesta non può più essere modificata. Il testo non salvato è conservato qui per permetterLe di copiarlo.",
  notFound: "Non è stato possibile trovarlo.",
  notSure: "Non sappiamo con certezza se l’operazione sia riuscita.",
  notSureDetail:
    "Il servizio non ha confermato cosa è successo. LifeLink mantiene l’esito incerto, così non viene scambiato per un’operazione che si può riprovare in sicurezza.",
  nothingNeedsYou: "Al momento non è richiesta alcuna azione da parte Sua.",
  nothingToApprove: "Non c’è nulla da approvare qui.",
  nothingToApproveRequest: "Non c’è nulla da approvare per questa richiesta.",
  nothingWasSent: "Nulla è stato inviato, quindi può riprovare in sicurezza.",
  offlineApprovalFailed:
    "Non è stato possibile salvare questa approvazione senza connessione. Approvi di nuovo quando sarà online.",
  offlineApprovalSaved:
    "Salvato per quando tornerà online. LifeLink ricontrollerà tutto prima dell’invio.",
  openReceipt: "Apri la ricevuta",
  outcomeError: (error) => `${error} Riprovi.`,
  practiceApproval:
    " Modalità di prova: approvare mostra cosa accadrebbe; nulla viene realmente inviato.",
  progress: "Avanzamento",
  progressAndNext: "Avanzamento e prossimi passaggi",
  recordedOutcome: "Esito registrato",
  reminderShare:
    "Consenti alla mia cerchia di fiducia di vedere questo promemoria",
  reminderShareAria:
    "Condividi questo promemoria con la mia cerchia di fiducia",
  reminderShareHint: "Solo le persone con cui condivide i promemoria.",
  replied: (who) => `${who} ha risposto`,
  reviewStatus: {
    approved: "Approvato",
    awaiting_approval: "Verifichi questi dettagli",
    cancelled: "Annullato",
    executing: "In corso",
    failed: "Non riuscito",
    succeeded: "Completato",
    unknown: "Esito non confermato",
  },
  savedApproveAgain: "Salvato. Poiché il testo è cambiato, approvi di nuovo.",
  savingOutcome: "Salvataggio dell’esito…",
  seeDetails: "Mostra i dettagli",
  sendAll: {
    back: "Indietro",
    confirm: (count: number) => `Invia tutti e ${count}`,
    finishEdits: "Salvi o annulli le modifiche prima di inviare tutto.",
    intro: "Ogni persona riceve il proprio messaggio, nel modo che preferisce.",
    practiceConfirm: (count: number) => `Prova: invia tutti e ${count}`,
    practiceReview: (count: number) =>
      `Prova: controlla e invia tutti e ${count}`,
    recipient: (name: string, channel: string) => `${name}, tramite ${channel}`,
    reconnect: "Si riconnetta per inviare tutti i messaggi.",
    resolveFirst:
      "Alcuni messaggi richiedono prima una sua risposta. Può comunque inviare uno alla volta quelli pronti.",
    review: (count: number) => `Controlla e invia tutti e ${count}`,
    sending: "Invio in corso…",
    summaryHint: "Non parte nulla finché non preme Invia tutti.",
    summaryTitle: (count: number) => `Inviare questi ${count} messaggi?`,
  },
  sentStatus: {
    sent: "inviato",
  },
  sentWaiting:
    "Il messaggio è stato inviato. Mostreremo la risposta appena arriverà.",
  shoppingRetired: "Le richieste di acquisto non possono più essere approvate.",
  spectrumUnknown:
    "Non possiamo ancora confermare questo messaggio. Chieda alla persona se è arrivato. Se non è ancora arrivato, potrebbe arrivare più tardi; LifeLink manterrà lo stato incerto.",
  status: {
    awaiting_approval: "Tocca a Lei",
    cancelled: "Annullato",
    completed: "Completato",
    in_progress: "In lavorazione",
    needs_attention: "Da controllare",
    needs_clarification: "Una domanda per Lei",
    waiting_for_reply: "In attesa di una risposta",
  },
  stepByStep: "Passo dopo passo",
  steps: {
    awaiting_approval: "Serve il Suo intervento",
    failed: "Non ha funzionato",
    pending: "Più tardi",
    running: "In lavorazione",
    skipped: "Non necessario",
    succeeded: "Fatto",
    unknown: "Non si sa se sia riuscito",
    waiting: "In attesa",
  },
  them: "questa persona",
  they: "Questa persona",
  unclearReply: (who) =>
    `Non siamo riusciti a capire con certezza cosa intendesse ${who}. ${who} ha detto di sì?`,
  useLatestWords: "Usa il testo più recente",
  version: (version, status) => `Versione ${version} · ${status}`,
  wentNotThrough: "L’operazione non è riuscita. Può riprovare.",
  wentThrough: "L’operazione è riuscita.",
  whoCan: (who) => `Sì, ${who} può`,
  whoCannot: (who) => `No, ${who} non può`,
  workingNow: "In lavorazione…",
  youSent: "Lei ha inviato",
};

export { tasks };

import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "Accetto, collega questo contatto",
  assignedNumber: "Numero iMessage assegnato: ",
  checkComplete: "Controllo completato. Lo stato attuale è indicato sopra.",
  checkFailed: "Non è stato possibile controllare il primo messaggio. Riprovi.",
  checkFirstMessage: "Controlla il primo messaggio",
  checking: "Controllo del primo messaggio…",
  confirmDescription:
    "Verifichi l’indirizzo esatto e come verrà usato prima di continuare.",
  confirmInvitation: (contactName, handle) =>
    `Non viene inviato alcun messaggio d’invito. Vedrà il numero assegnato da comunicare a ${contactName}. Questa persona deve scrivere per prima da ${handle}. Un numero di telefono e un’email Apple ID sono identità diverse, anche sullo stesso telefono.`,
  confirmLink: "Collega il contatto Photon esistente con indirizzo ",
  confirmLookup:
    "Continuando, questo indirizzo esatto verrà cercato in Photon, il nostro fornitore iMessage, e verrà riutilizzato il contatto esistente. LifeLink non registra nuove persone e non occupa nuovi posti disponibili.",
  confirmNoAccount: (contactName) =>
    `${contactName} non ha bisogno di un account LifeLink né di un invito al pannello di controllo. Questo non consente l’accesso ad alcuna informazione del Suo account.`,
  confirmTitle: (contactName) => `Collegare iMessage per ${contactName}?`,
  confirmTo: " a ",
  copied: (contactName) =>
    `Istruzioni copiate. Le invii personalmente a ${contactName}.`,
  copy: "Copia istruzioni",
  copyFailed:
    "Non è stato possibile copiare le istruzioni. Selezioni e copi il testo sopra, oppure riprovi con Copia istruzioni.",
  exactAddress: "Indirizzo esatto del contatto: ",
  firstMessageConfirmed:
    "Il primo messaggio è stato confermato. LifeLink può ora inviare messaggi a questo indirizzo registrato.",
  heading: "Configurazione di iMessage",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName}: per iniziare a usare iMessage con LifeLink, deve prima inviare un iMessage (per esempio “Salve”) al numero ${assignedNumber} dal Suo esatto indirizzo registrato: ${handle}. In Messaggi, si assicuri che la conversazione parta da ${handle}. Un numero di telefono e un’email Apple ID sono identità diverse, anche sullo stesso telefono. Un messaggio da un altro indirizzo non attiverà questo. Non serve un account LifeLink né un invito al pannello di controllo.`,
  link: "Collega iMessage",
  linkExplanation:
    "Colleghi la persona già registrata in Photon con questo indirizzo esatto. Se non è presente, la aggiunga prima nel pannello di Photon, poi riprovi. LifeLink non crea nuove persone.",
  linkFailed:
    "Non è stato possibile collegare questo contatto. Controlli che questo indirizzo esatto sia registrato nel pannello di Photon, poi riprovi.",
  loading: "Caricamento della configurazione di iMessage…",
  lookingUp: "Ricerca di questo contatto esistente in Photon…",
  mustSendFirst: (contactName) =>
    `${contactName} deve inviare il primo messaggio dall’indirizzo indicato sopra. Un messaggio inviato da Lei non attiverà la configurazione di questa persona.`,
  needsAddress:
    "Serve un indirizzo iMessage. Aggiunga sopra il numero di telefono o l’email Apple ID della persona, poi salvi.",
  notConfigured:
    "È necessaria la configurazione dell’applicazione. Chi gestisce LifeLink deve collegare Photon prima che Lei possa configurare iMessage per questo contatto.",
  ownerOnly:
    "Solo il titolare dell’account può configurare o controllare iMessage per i propri contatti.",
  practice: (contactName) =>
    `I messaggi di prova rimangono in LifeLink, quindi qui non c’è nulla da configurare. Quando passerà a iMessage reale, potrà collegare ${contactName} qui.`,
  retryLink: "Riprova a collegare iMessage",
  row: {
    failed: "iMessage richiede attenzione",
    not_registered: "iMessage non ancora collegato",
    registering: "Collegamento di iMessage",
    waiting: "In attesa del primo iMessage della persona",
  },
  status: {
    failed: "La configurazione richiede attenzione",
    not_registered: "Non collegato",
    ready: "Pronto per iMessage",
    registering: "Collegamento",
    waiting: "In attesa del primo messaggio della persona",
  },
};

export { imessageSetup };

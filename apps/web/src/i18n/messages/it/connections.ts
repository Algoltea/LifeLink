import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label) => `Account: ${label}`,
  allowProvider: (label) => `Scelga Consenti nella pagina di ${label}.`,
  appAccount:
    "Questa funzione usa l’account dell’applicazione, quindi Lei non deve effettuare alcun accesso.",
  callback: {
    back: "Torna ai Collegamenti",
    checking: (label) => `Controllo del collegamento a ${label}`,
    connected: (label) => `${label} è collegato.`,
    connectedTitle: (label) => `${label} collegato`,
    declined: (label) =>
      `Il collegamento a ${label} non è stato completato. Nulla è stato modificato. Può riprovare.`,
    missing:
      "Questa pagina è stata aperta senza un collegamento da completare. Ricominci da Collegamenti.",
    practice:
      "La modalità di prova è attiva. La disattivi nelle Impostazioni prima di completare un collegamento reale.",
    service: "Il servizio",
    subline: "Torni a Collegamenti per verificare i servizi o ricominciare.",
    title: "Stato del collegamento",
    unavailable:
      "Questo servizio non ha un collegamento disponibile in LifeLink. Torni a Collegamenti per verificarne i limiti.",
  },
  canDo: "Cosa può fare",
  cancel: "Annulla",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Chiudi",
  comingLater: "Disponibile in futuro",
  connect: "Collega",
  connectProvider: (label) => `Collega ${label}`,
  connectionState: (status) => `Stato del collegamento: ${status}.`,
  connectionStates: {
    active: "attivo",
    deleted: "eliminato",
    expired: "scaduto",
    failed: "non riuscito",
    inactive: "inattivo",
    initiated: "avviato",
    pending: "in attesa",
    revoked: "revocato",
  },
  detailLabel: (label, summary) => `${label}. ${summary} Dettagli.`,
  details: "Dettagli",
  developerSetupAfter: (label) => ` e scelga ${label}.`,
  developerSetupBefore: "Per chi gestisce LifeLink: eseguire ",
  disconnect: (label) => `Scollega ${label}`,
  disconnectPractice: "Scollega account di prova",
  disconnectTip: (label) =>
    `Suggerimento: la persona può scollegare ${label} da questa finestra in qualsiasi momento.`,
  disconnected: (label) => `${label} è scollegato. Da ora non verrà più usato.`,
  discordSetup: (practice) =>
    `${practice ? "Quando usa Discord reale, aggiunga" : "Aggiunga"} l’ID utente Discord di ogni persona nella Cerchia di fiducia.`,
  empty: "Non ci sono servizi elencati.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "I collegamenti non sono ancora configurati per questa applicazione. Esegua bun run dev:setup.",
    "Please sign in again.": "Acceda di nuovo.",
    "Practice connections are only available in practice mode.":
      "I collegamenti di prova sono disponibili solo in modalità di prova.",
    "That account could not be found.":
      "Non è stato possibile trovare l’account.",
    "That connection could not be found.":
      "Non è stato possibile trovare il collegamento.",
    "The connection did not finish. You can try again.":
      "Il collegamento non è stato completato. Può riprovare.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "Questo collegamento è cambiato durante la richiesta. Torni a Collegamenti per verificarne lo stato.",
    "This connection was not started from your account. Please try connecting again.":
      "Questo collegamento non è stato avviato dal Suo account. Provi a collegarsi di nuovo.",
    "This service does not use a personal sign-in.":
      "Questo servizio non usa un accesso personale.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "Disattivi la modalità di prova nelle Impostazioni prima di collegare o modificare un account reale.",
    "We could not confirm the connection.":
      "Non è stato possibile confermare il collegamento.",
  },
  groups: {
    appointments: "Gestire appuntamenti",
    email: "Leggere e scrivere email",
    messages: "Scrivere a familiari e amici",
  },
  helperTitle: "Sta configurando LifeLink per un’altra persona?",
  imessageIntro:
    "Colleghi ogni persona della Cerchia di fiducia al contatto già esistente in Photon. LifeLink non registra nuovi contatti.",
  imessageSteps: [
    "Salvi il numero di telefono o l’email Apple ID esatti da cui la persona invia iMessage. Un numero di telefono e un indirizzo email sono identità diverse, anche per la stessa persona.",
    "Si assicuri che questo indirizzo esatto sia già registrato nel pannello di Photon. Se manca, aggiunga prima il contatto lì. Poi scelga Collega iMessage nella Cerchia di fiducia e usi il numero assegnato mostrato per quel contatto.",
    "Chieda alla persona di inviare il primo iMessage al numero assegnato da quell’esatto indirizzo salvato. LifeLink potrà scriverle dopo l’arrivo del primo messaggio.",
  ],
  intro: (label) =>
    `LifeLink può fare queste cose con ${label}. Nulla viene inviato finché non lo approva.`,
  limitTags: {
    not_offered: "Non possibile",
    not_wired: "Disponibile in futuro",
  },
  limitsCount: (count) => `Cosa LifeLink non può ancora fare (${count})`,
  limitsTitle: "Cosa LifeLink non può ancora fare",
  loading: "Caricamento dei collegamenti",
  manage: "Gestisci",
  notSetUp:
    "Questa funzione non è ancora attiva. Chieda a chi ha configurato LifeLink di attivarla.",
  openCircle: "Apri Cerchia di fiducia",
  permissions: {
    add: "Aggiungere",
    calendar: "Trovare date",
    draft: "Preparare bozze",
    message: "Messaggi",
    money: "Denaro",
    notice: "Avvisi",
    post: "Pubblicare",
    read: "Letto",
    replies: "Risposte",
    send: "Invia",
    unavailable: "Ancora nessuna funzione",
  },
  practiceAccount: "Usa un account di prova",
  practiceBlocked: (label) =>
    `Il Suo collegamento reale a ${label} è salvato. Gli account di prova non possono sostituirlo. Disattivi la modalità di prova nelle Impostazioni per gestirlo.`,
  practiceConnected: (label) =>
    `Un account di prova di ${label} è collegato. Non contatta mai il servizio reale.`,
  practiceDisconnected: (label) =>
    `L’account di prova di ${label} è scollegato.`,
  practiceMessages: (imessage) =>
    imessage
      ? "Gli iMessage di prova sono simulati. Nessun messaggio raggiunge i Suoi contatti."
      : "I messaggi Discord di prova sono simulati. Nessun messaggio raggiunge i Suoi contatti.",
  practiceNeverConnects:
    "Questo account di prova non si collega mai al servizio reale.",
  pressConnect: (label) => `Prema ${label} qui sotto.`,
  providers: {
    discord: {
      accountRequirement:
        "Il familiare condivide un server con il bot dell’applicazione oppure ha già scritto al bot.",
      capabilities: {
        "discord.receive": {
          label: "Ricevere risposte",
          note: "Le risposte arrivano mentre il bot Discord di LifeLink è online.",
        },
        "discord.send": {
          label: "Inviare un messaggio diretto dopo la Sua approvazione",
        },
      },
      summary: "Messaggi diretti con i familiari su Discord.",
    },
    ebay: {
      accountRequirement:
        "Qui non è possibile collegare account eBay personali.",
      capabilities: {
        "ebay.search": {
          label: "Cercare annunci eBay",
        },
        "ebay.selling": {
          label: "I Suoi annunci, ordini o acquisti",
        },
      },
      summary:
        "La ricerca sarà disponibile in futuro. LifeLink non compra né vende mai.",
    },
    facebook: {
      accountRequirement:
        "Solo funzioni delle Pagine Facebook. I profili personali non sono supportati.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Leggere e rispondere ai messaggi della Sua Pagina",
        },
        "facebook.page_post": {
          label: "Pubblicare su una Pagina dopo la Sua approvazione",
        },
        "facebook.personal": {
          label: "Diario personale e messaggi degli amici",
          note: "Facebook non permette alle applicazioni di leggere o inviare conversazioni personali di Messenger.",
        },
      },
      summary: "Solo Pagine aziendali. Disponibile in futuro.",
    },
    gmail: {
      accountRequirement: "Un account Google.",
      capabilities: {
        "email.appointments": {
          label: "Trovare appuntamenti nelle email",
        },
        "email.draft": {
          label: "Scrivere una bozza da farLe verificare",
        },
        "email.new_message_event": {
          label: "Segnalare nuove email (controllo circa una volta al minuto)",
        },
        "email.read_selected": {
          label: "Leggere le email che sceglie per un riepilogo",
        },
        "email.send": {
          label: "Inviare un’email dopo la Sua approvazione",
        },
      },
      summary:
        "Legga, scriva e invii email. Trovi gli appuntamenti nella posta.",
    },
    google_calendar: {
      accountRequirement: "Un account Google.",
      capabilities: {
        "calendar.create": {
          label: "Aggiungere un appuntamento approvato",
        },
        "calendar.read": {
          label: "Vedere i prossimi eventi",
        },
      },
      summary: "Aggiunga appuntamenti al calendario dopo averli approvati.",
    },
    google_drive: {
      accountRequirement: "Un account Google.",
      capabilities: {
        "drive.create": {
          label:
            "Salvare note di un appuntamento come documento dopo la Sua approvazione",
        },
        "drive.read": {
          label: "Trovare file già conservati in Drive",
          note: "LifeLink vede nomi e collegamenti dei file, non il loro contenuto.",
        },
      },
      summary: "Trovi i Suoi file e salvi note sugli appuntamenti.",
    },
    imessage: {
      accountRequirement:
        "I Suoi contatti non hanno bisogno di un invito, di un account LifeLink o dell’accesso al pannello di Photon.",
      capabilities: {
        "imessage.delivery": {
          label: "Aggiornamenti sulla consegna",
          note: "LifeLink sa che il messaggio è stato inviato, ma non se è arrivato o è stato letto.",
        },
        "imessage.first_contact": {
          label: "Iniziare una conversazione con una nuova persona",
          note: "Ogni persona deve inviare il primo messaggio.",
        },
        "imessage.receive": {
          label: "Ricevere risposte",
        },
        "imessage.send": {
          label: "Inviare un testo o una foto dopo la Sua approvazione",
          note: "Funziona dopo che la persona ha inviato il primo messaggio.",
        },
      },
      summary:
        "Scambi messaggi con familiari e amici. Ogni persona invia il primo messaggio.",
    },
    instacart: {
      accountRequirement:
        "Gli acquisti tramite LifeLink non sono più disponibili.",
      capabilities: {},
      summary: "Gli acquisti tramite LifeLink non sono più disponibili.",
    },
    instagram: {
      accountRequirement: "Un account Instagram Business o Creator.",
      capabilities: {
        "instagram.messages": {
          label: "Rispondere ai messaggi diretti",
        },
        "instagram.personal": {
          label: "Account personali",
        },
        "instagram.post": {
          label: "Condividere un post con foto dopo la Sua approvazione",
        },
      },
      summary: "Solo account Business e Creator. Disponibile in futuro.",
    },
    outlook: {
      accountRequirement:
        "Un account Microsoft. Alcuni account di lavoro richiedono il consenso di un amministratore.",
      capabilities: {
        "calendar.create": {
          label: "Aggiungere un appuntamento approvato al calendario Outlook",
        },
        "email.draft": {
          label: "Scrivere una bozza da farLe verificare",
        },
        "email.new_message_event": {
          label: "Segnalare le nuove email quando arrivano",
        },
        "email.read_selected": {
          label: "Leggere le email che sceglie per un riepilogo",
        },
        "email.send": {
          label: "Inviare un’email dopo la Sua approvazione",
        },
      },
      summary: "Posta e calendario Outlook con un solo collegamento.",
    },
    paypal: {
      accountRequirement:
        "Qui non è possibile collegare account PayPal personali.",
      capabilities: {
        "paypal.invoices": {
          label: "Consultare fatture",
        },
        "paypal.send_money": {
          label: "Inviare denaro a una persona",
          note: "LifeLink non invia mai denaro.",
        },
      },
      summary:
        "Le fatture saranno disponibili in futuro. LifeLink non invia mai denaro.",
    },
    telegram: {
      accountRequirement:
        "Il familiare apre il collegamento creato da LifeLink per lui e preme Avvia in Telegram.",
      capabilities: {
        "telegram.first_contact": {
          label: "Iniziare una conversazione con una nuova persona",
          note: "Ogni persona deve prima premere Avvia nel bot.",
        },
        "telegram.receive": {
          label: "Ricevere risposte",
        },
        "telegram.send": {
          label: "Inviare un messaggio o foto dopo la Sua approvazione",
        },
      },
      summary: "Messaggi con i familiari su Telegram.",
    },
  },
  realImessage: "Quando usa iMessage reale, segua questi passaggi.",
  requirements: "Cosa serve",
  retry: "Riprova il collegamento",
  returnConnected: "Al ritorno qui, vedrà la scritta Collegato.",
  setup: "Configura",
  signInProvider: (label) =>
    `Accederà nella pagina di ${label}. LifeLink non vede mai la Sua password.`,
  signInTheirAccount: "Acceda con l’account della persona, non con il Suo.",
  status: {
    connected: "Collegato",
    disconnected: "Non collegato",
    error: "Collegamento non riuscito",
    notOn: "Non attivato",
    pending: "Non completato",
    practice: "Prova",
    practiceAccount: "Account di prova",
    ready: "Pronto",
    realSaved: "Account reale salvato",
  },
  subline:
    "Colleghi i servizi che usa già. Ne apra uno per vedere cosa può fare LifeLink.",
  telegramSetup: (practice) =>
    `${practice ? "Quando usa Telegram reale, apra" : "Apra"} ogni persona nella Cerchia di fiducia, scelga Collega Telegram e le invii il collegamento. La persona preme Avvia una volta.`,
  title: "Collegamenti",
  unavailableFeatures: (label) =>
    `${label} non ha ancora funzioni disponibili in LifeLink. Non serve collegare un account.`,
  unavailableIntro: (label) =>
    `LifeLink non può ancora fare nulla con ${label}.`,
};

export { connections };

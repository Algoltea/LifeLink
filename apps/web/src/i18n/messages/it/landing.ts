import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "Dimensione del testo", value: "Più grande" },
      { label: "Leggi le risposte ad alta voce", value: "Sì · più lento" },
      { label: "Meno movimento", value: "Sì" },
      { label: "Contrasto", value: "Più forte" },
      { label: "Sottotitoli nelle chiamate", value: "Sì" },
    ],
    intro:
      "Messaggi alla famiglia, appuntamenti e promemoria, con testo grande e lettura ad alta voce ovunque. Tutto ciò che verrebbe inviato aspetta comunque Lei.",
    messages: {
      description:
        "Scriva alla famiglia con iMessage, e-mail, Discord o Telegram. «Mi aiuti a capire» spiega un messaggio ricevuto e propone risposte tra cui scegliere.",
      imageAlt:
        "Mary Cassatt, La lettera: una donna in un abito blu a motivi sigilla una lettera alla scrivania.",
      imageCaption: "Mary Cassatt, La lettera, 1890–91.",
      title: "Messaggi alla famiglia",
    },
    read: {
      description:
        "Testo più grande, contrasto più forte, sottotitoli e una voce di lettura più lenta. Parli invece di scrivere quando vuole. Le Sue impostazioni La seguono in ogni schermata.",
      imageAlt:
        "Édouard Manet, Donna che legge: una donna con cappotto e cappello scuri legge una rivista illustrata all’aperto.",
      imageCaption: "Édouard Manet, Donna che legge, 1880–82.",
      title: "Legga, ascolti o parli",
    },
    reminder: {
      approve: "Approva promemoria",
      changeTime: "Cambia orario",
      title: "Nuovo promemoria",
      version: "Versione 1",
      what: "Chiamare Ana",
      when: "Domenica 1 novembre · 11:00",
      youSaid: "Lei ha detto: «Ricordami di chiamare Ana domenica.»",
    },
    reminders: {
      description:
        "Oggi mostra prima ciò che richiede la Sua attenzione, poi appuntamenti e promemoria. Dica cosa ricordare e LifeLink lo annota perché Lei lo approvi.",
      title: "Appuntamenti e promemoria",
    },
    tab: "Aiuto quotidiano",
    thread: {
      helpMeUnderstand: "Mi aiuti a capire",
      reply: "Certo! Alle 9:45 da te? Forse porto anche Max.",
      sent: "Inviato alle 9:05 · versione 2",
      sentMessage:
        "Ciao Sam, potresti accompagnarmi dal dottor Patel martedì 27 ottobre?",
    },
    title: "In cosa aiuta LifeLink",
    today: {
      comingUp: "In arrivo",
      confirmPickup: "Confermare il passaggio di Sam alle 9:45",
      greeting: "Buon pomeriggio, Ruth",
      review: "Controlla",
      rows: [
        {
          detail: "Promemoria · oggi",
          time: "20:00",
          title: "Pastiglie della sera",
        },
        {
          detail: "Non ancora confermato",
          time: "9:45",
          title: "Sam passa a prenderLa",
        },
        { detail: "Martedì 27 ott.", time: "10:30", title: "Dott. Patel" },
      ],
      waiting: "In attesa di Lei",
    },
  },
  features: {
    hint: "Esempio. Scorra o indichi una riga per vedere qui quella parte di LifeLink.",
    items: {
      circle: {
        name: "Cerchia di fiducia",
        summary:
          "Inviti qualcuno con un codice, scelga cosa può vedere e per quanto tempo, e smetta di condividere quando vuole.",
      },
      connections: {
        name: "Collegamenti",
        summary:
          "Ogni account dice chiaramente cosa funziona, cosa non è ancora pronto e cosa non offre.",
      },
      documents: {
        name: "Documenti",
        summary: "I Suoi file di Google Drive, ognuno con un’anteprima.",
      },
      email: {
        name: "E-mail",
        summary:
          "Segnala le e-mail che sembrano truffe e prepara risposte che non partono mai da sole.",
      },
      family: {
        name: "Vista famiglia",
        summary:
          "La pagina che vede la Sua famiglia: solo ciò che Lei condivide, con foto e uno spazio per rispondere.",
      },
      groceries: {
        name: "Spesa",
        summary:
          "Liste con budget e stima dei costi, pronte da copiare o stampare per il negozio.",
      },
      help: {
        name: "Come preferisco l’aiuto",
        summary:
          "Risposte brevi o dettagliate, un passo alla volta, nella lingua che sceglie.",
      },
      recap: {
        name: "Riepilogo di una conversazione",
        summary:
          "Separa ciò che è stato concordato da ciò che è stato solo offerto e suggerisce i prossimi passi.",
      },
      today: {
        name: "Oggi",
        summary:
          "Ciò che richiede la Sua attenzione prima, poi appuntamenti, meteo e tre notizie scelte da Lei.",
      },
    },
    titleLine1: "Tutto il resto",
    titleLine2: "che fa",
  },
  footer: {
    credits: {
      afterLicense:
        ", Wikimedia Commons. Gli esempi dell’interfaccia usano dati di prova.",
      byAuthor: "di RedKnight7,",
      morse:
        ". Tasto e registratore Morse, 1876: pubblico dominio, Wikimedia Commons.",
      paintings:
        "Mary Cassatt, La lettera; Édouard Manet, Donna che legge; Claude Monet, Passeggiata sulla scogliera a Pourville e Lo stagno delle ninfee; Jean-Jacques de Boissieu, Vecchio con un bambino che legge: pubblico dominio (CC0),",
      telegram: "Telegramma Western Union del 1959",
    },
    getStarted: "Inizia",
    label: "Piè di pagina",
    links: {
      everydayHelp: "Aiuto quotidiano",
      howItWorks: "Come funziona",
      language: "Lingua",
      ourPromise: "La nostra promessa",
      questions: "Domande",
      scamCheck: "Controllo truffe",
    },
    pictures: "Immagini",
    signIn: "Accedi",
    solitaire: "Solitario",
    tagline:
      "Aiuto con i messaggi di ogni giorno. Nulla viene inviato finché non lo dice Lei.",
  },
  hero: {
    getStarted: "Inizia",
    imageAlt:
      "Claude Monet, Passeggiata sulla scogliera a Pourville: due figure su una scogliera fiorita sopra un mare luminoso con barche a vela.",
    imageCaption:
      "Claude Monet, Passeggiata sulla scogliera a Pourville, 1882.",
    intro:
      "LifeLink La aiuta a scrivere alla famiglia, a tenere traccia degli appuntamenti e a controllare messaggi o lettere che sembrano sospetti. Legge ogni messaggio per intero prima di approvarlo.",
    seeHowItWorks: "Guardi come funziona",
    titleLine1: "Nulla viene inviato",
    titleLine2: "finché non lo dice Lei.",
  },
  howItWorks: {
    done: "Fatto",
    exampleTimes: "Orari di esempio",
    imageAlt:
      "Incisione di un tasto, un relè e un registratore Morse, con le scritte Indicatore, Relè, Tasto e Batteria di linea.",
    imageCaption:
      "Tasto e registratore Morse, inciso per Popular Science Monthly, 1876.",
    intro:
      "Ecco una richiesta di passaggio dall’inizio alla fine. Ogni passo ha un nome semplice, così sa sempre cosa è successo e cosa no.",
    result: "Ha approvato due volte. Non è stato inviato nient’altro.",
    slipTitle: "Un passaggio dal dottor Patel",
    timeline: [
      {
        heading: "Lunedì mattina",
        steps: [
          { label: "Chiede un passaggio", time: "9:02" },
          { label: "LifeLink scrive il messaggio", time: "9:02" },
          {
            decision: true,
            label: "Cambia una parola e approva la versione 2",
            time: "9:05",
          },
          { label: "Inviato a Sam con iMessage", time: "9:05" },
        ],
      },
      {
        heading: "Lunedì pomeriggio",
        steps: [
          { label: "Sam risponde: «Certo, alle 9:45?»", time: "13:40" },
          {
            decision: true,
            label: "Conferma l’orario del passaggio",
            time: "13:52",
          },
        ],
      },
      {
        heading: "Martedì 27 ottobre",
        steps: [
          { label: "Promemoria: Sam arriva alle 9:45", time: "9:15" },
          { label: "Appuntamento dal dottor Patel", time: "10:30" },
        ],
      },
    ],
    titleLine1: "Cosa succede",
    titleLine2: "dopo la richiesta",
  },
  language: {
    intro:
      "Scelga la lingua di questa pagina. Se crea un account, LifeLink la conserva. Se ha già un account, con l’accesso si usa la lingua scelta lì.",
    title: "Lingua",
  },
  messageSlip: {
    approve: "Approva e invia",
    message:
      "Ciao Sam, potresti accompagnarmi dal dottor Patel martedì 27 ottobre? Devo essere lì per le 10:30. Grazie! Ruth",
    notSent: "Non ancora inviato",
    sent: "Inviato alle 9:05. Non è stato inviato nient’altro.",
    showAgain: "Mostra di nuovo",
    to: "A Sam Rivera · iMessage",
    version: "Versione 2",
  },
  nav: {
    howItWorks: "Come funziona",
    language: "Lingua",
    questions: "Domande",
    scamCheck: "Controllo truffe",
    signIn: "Accedi",
  },
  previews: {
    approveAndSend: "Approva e invia",
    circle: {
      appointments: "Appuntamenti",
      code: "Codice di invito monouso",
      notShared: "Non condiviso",
      note: "Fino al 31 dicembre",
      rides: "Passaggi",
      scamAlerts: "Avvisi di truffa",
      shared: "Condiviso",
      stop: "Smetti di condividere ora",
      title: "Condiviso con Sam Rivera",
    },
    connections: {
      add: "Aggiungere un appuntamento approvato",
      footnote: "Ogni collegamento elenca solo ciò che sa fare davvero.",
      notReady: "Non ancora pronto",
      note: "Collegato",
      see: "Vedere i prossimi eventi",
      works: "Funziona",
    },
    documents: {
      files: [
        { date: "12 ott.", name: "Riepilogo Medicare.pdf" },
        { date: "30 set.", name: "Ricetta della zuppa di Ana" },
        { date: "14 set.", name: "Foto del giardino" },
      ],
      footnote:
        "Scelga un file per l’anteprima. Lo modifichi o condivida in Google Drive.",
      title: "Documenti",
    },
    email: {
      anaSubject: "Pranzo domenica? Porta l’album delle foto!",
      draftBody:
        "Domenica è perfetto. Porterò l’album. Va bene alle 12:30? Un abbraccio, Ruth",
      draftTitle: "Risposta ad Ana · bozza, non inviata",
      note: "3 nuove",
      parcelSender: "Servizio consegna pacchi",
      parcelSubject: "Azione richiesta: il suo pacco è in giacenza",
      scamWarning: "Sembra una truffa: chiede un pagamento tramite un link.",
      title: "E-mail",
    },
    family: {
      footnote:
        "Sam può leggere e rispondere. Sam non può inviare, approvare o spendere per Ruth.",
      nextAppointment: "Prossimo appuntamento",
      note: "Cosa vede Sam",
      photos: "2 nuove foto dal giardino",
      replyLabel: "Rispondi a Ruth",
      replyText: "Ci vediamo martedì alle 9:45!",
      title: "Notizie di Ruth",
      when: "Dott. Patel, martedì alle 10:30",
    },
    groceries: {
      copy: "Copia lista",
      items: [
        { label: "Latte d’avena, 2", value: "$7.98" },
        { label: "Pane integrale", value: "$4.49" },
        { label: "Mele, 6", value: "$5.20" },
        { label: "Ingredienti per la zuppa per Ana", value: "$18.40" },
      ],
      note: "$62 su un budget di $80",
      print: "Stampa",
      title: "Spesa settimanale",
    },
    help: {
      answers: "Risposte",
      language: "Lingua dell’aiuto",
      noteLabel: "Nota privata",
      noteText: "Al telefono sento poco. Suggerisca prima un messaggio.",
      on: "Sì",
      oneStep: "Un passo alla volta",
      short: "Brevi",
      title: "Come preferisco l’aiuto",
    },
    recap: {
      agreed: "Concordato",
      agreedText: "Sam La accompagna martedì e passa a prenderLa alle 9:45.",
      nextStep: "Prossimo passo suggerito",
      nextStepText: "Ricordamelo lunedì sera.",
      offered: "Solo offerto",
      offeredText: "Forse Sam porta anche Max.",
      review: "Controlla promemoria",
      title: "Riepilogo",
    },
    today: {
      goodNews: "Buone notizie, scelte da Lei",
      headlines: [
        "La biblioteca allunga l’orario della domenica",
        "Volontari restaurano il roseto del paese",
        "Torna il traghetto per l’estate",
      ],
      note: "Lunedì",
      pickup: "Confermare il passaggio di Sam alle 9:45",
      title: "Buongiorno, Ruth",
      waiting: "In attesa di Lei",
      weather: "Meteo",
      weatherValue: "58 °F, pioggia leggera",
    },
  },
  promise: {
    howSharingWorks: "Come funziona la condivisione",
    leftImageAlt:
      "Acquaforte di un anziano che legge un libro con un bambino in grembo, accanto a un tavolino.",
    leftImageCaption:
      "Jean-Jacques de Boissieu, Vecchio con un bambino che legge, 1770.",
    promises: [
      "Non invieremo mai nulla che Lei non abbia letto e approvato. Se un messaggio cambia dopo l’approvazione, Le chiediamo di nuovo.",
      "La Sua famiglia può esserLe vicina senza prendere il controllo. Lei sceglie cosa può vedere una persona di fiducia, come appuntamenti o passaggi, e per quanto tempo. Non può mai inviare, approvare o spendere al posto Suo.",
      "Quando qualcosa è solo una prova, lo diciamo. Quando qualcosa va storto, Le diciamo cosa è successo, che nulla è andato perso e cosa fare dopo.",
      "E non Le diremo mai che un messaggio è sicuro. Le mostriamo i segnali d’allarme e lasciamo a Lei la decisione.",
    ],
    rightImageAlt:
      "Un telegramma Western Union del 1959, battuto in maiuscolo e timbrato con note scritte a mano.",
    rightImageCaption:
      "Un telegramma Western Union, 1959. Ogni parola contava, e qualcuno firmava per riceverlo.",
    sharing:
      "Modifichi o interrompa la condivisione quando vuole, dalla Sua Cerchia di fiducia.",
    signature: "Aiuto quotidiano. La Sua decisione.",
    tab: "La nostra promessa",
    title: "Cosa LifeLink non farà mai",
  },
  questions: {
    imageAlt:
      "Claude Monet, Lo stagno delle ninfee: un ponticello verde si inarca su uno stagno coperto di ninfee.",
    imageCaption: "Claude Monet, Lo stagno delle ninfee, 1900.",
    intro: "Le risposte alle domande più frequenti, tutte in questa pagina.",
    items: [
      {
        answer:
          "Famiglia, e-mail e un appuntamento di prova, per provare tutto. Non si invia nulla di reale e ogni risultato è segnato come Prova.",
        question: "Che cos’è la modalità Prova?",
      },
      {
        answer:
          "Sì. Dica ciò che Le serve, e LifeLink può leggere le risposte ad alta voce alla velocità che sceglie.",
        question: "Posso parlare invece di scrivere?",
      },
      {
        answer:
          "No. Vedono solo ciò che Lei condivide e non possono mai inviare, approvare o spendere al posto Suo.",
        question: "La mia famiglia può agire per me?",
      },
      {
        answer:
          "Gmail, Outlook e Google Calendar, oltre a iMessage, Discord e Telegram. Ognuno mostra chiaramente cosa funziona e cosa non ancora.",
        question: "Quali account posso collegare?",
      },
      {
        answer:
          "No. Tiene le Sue liste, stima i costi e un budget, poi Le permette di copiare o stampare la lista per fare la spesa da sé.",
        question: "LifeLink ordina la spesa?",
      },
      {
        answer:
          "Diventa una nuova versione, e LifeLink Le chiede di approvarla prima di inviare qualsiasi cosa.",
        question: "E se modifico un messaggio?",
      },
      {
        answer:
          "No. Inviato, risposto e confermato sono passi diversi, e LifeLink Le dice a parole a che punto è.",
        question: "«Inviato» vuol dire «concordato»?",
      },
      {
        answer:
          "Indica i segnali d’allarme e un prossimo passo più sicuro. Non promette mai che un messaggio sia sicuro.",
        question: "Può dirmi che un messaggio è sicuro?",
      },
      {
        answer:
          "Il solitario sì, e la partita viene salvata su questo dispositivo. I messaggi richiedono una connessione.",
        question: "Funziona senza internet?",
      },
      {
        answer:
          "Vedrà cosa è successo, che nulla è andato perso e cosa fare dopo.",
        question: "E se qualcosa va storto?",
      },
    ],
    tab: "Domande",
    title: "Domande",
  },
  scamCheck: {
    beCareful: "Faccia attenzione a questo messaggio.",
    checkMessage: "Controlla un messaggio",
    example: "Esempio",
    examples: {
      call: {
        label: "Una telefonata",
        nextStep: "Riattacchi e chiami Suo nipote al numero che ha già.",
        received:
          "Chi chiama dice che Suo nipote è nei guai e ha bisogno di soldi oggi.",
        signs: [
          "Chiede soldi con urgenza.",
          "Le chiede di tenere segreta la chiamata.",
          "Vuole il pagamento con carta regalo o bonifico.",
        ],
      },
      email: {
        label: "Un’e-mail",
        nextStep:
          "Chiami la Sua banca al numero stampato sulla carta. Non risponda a questa e-mail.",
        received:
          "Il suo conto è bloccato. Confermi oggi i suoi dati per evitarne la chiusura.",
        signs: [
          "Minaccia di chiudere il conto.",
          "Le chiede di confermare dati privati.",
          "L’indirizzo del mittente non corrisponde alla Sua banca.",
        ],
      },
      letter: {
        label: "Una lettera",
        nextStep:
          "Cerchi da sé informazioni sulla società del premio prima di pagare o inviare qualcosa.",
        received:
          "Ha vinto $5,000. Invii $40 di spese di gestione per ritirare il premio.",
        signs: [
          "Deve pagare prima di ricevere qualcosa.",
          "Non ha partecipato a nessun concorso.",
          "Non c’è modo di verificare chi l’ha inviata.",
        ],
      },
      text: {
        label: "Un SMS",
        nextStep:
          "Apra direttamente l’app o il sito del corriere. Non usi questo link.",
        received:
          "Il suo pacco è in attesa. Paghi $1.99 per la nuova consegna entro 30 minuti: parcel-redeliver.co/pay",
        signs: [
          "Mette fretta: pagare entro 30 minuti.",
          "Chiede un pagamento tramite un link.",
          "Il link non è il sito di un corriere.",
        ],
      },
    },
    intro:
      "Incolli un SMS, scelga un’e-mail, fotografi una lettera o controlli una chiamata in vivavoce. LifeLink indica i segnali d’allarme e suggerisce un prossimo passo sicuro. Non dice mai che un messaggio è sicuro.",
    kinds: "Tipi di messaggio da controllare",
    panelTitle: "Controllo truffe",
    saferStep: "Un prossimo passo più sicuro",
    tab: "Controllo truffe",
    title: "Non è sicuro che un messaggio sia vero?",
    whatItLooksFor: "Cosa cerca",
  },
  solitaire: {
    boardDescription:
      "Una partita di solitario Klondike in corso. L’otto di picche si sposta sul nove di cuori.",
    controls: ["Annulla", "Suggerimento", "Nuova partita"],
    intro:
      "Klondike con carte grandi e chiare. Tocchi una carta per spostarla o giochi con la tastiera. Annulla e un suggerimento sono sempre a portata di mano, e la partita viene salvata su questo dispositivo, anche senza internet.",
    noAccount: "Nessun account necessario.",
    play: "Gioca a solitario",
    saved: "Partita salvata su questo dispositivo",
    titleLine1: "Una partita tranquilla",
    titleLine2: "a solitario",
  },
  start: {
    alreadyHaveOne: "Creerà un account. Ne ha già uno?",
    defaultRequest: "Sam può accompagnarmi all’appuntamento di martedì?",
    intro:
      "Dica a LifeLink di cosa ha bisogno, poi legga il messaggio completo prima che venga inviato qualcosa. Vuole prima dare un’occhiata? Può provarlo con messaggi di prova.",
    myFamily: "La mia famiglia",
    request: "La Sua richiesta",
    sampleFamily: "Famiglia di prova",
    seeDraft: "Vedi la bozza",
    signIn: "Accedi",
    titleLine1: "Inizi con",
    titleLine2: "una richiesta",
    tryWith: "Prova con",
    whatHelp: "Con cosa vorrebbe aiuto?",
  },
};

export { landing };

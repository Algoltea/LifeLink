import type { Messages } from "../en";

const callScreening: Messages["callScreening"] = {
  alertOff: "Avviso sonoro disattivato",
  alertPlayed: "Avviso riprodotto ad alta voce",
  alertPlaying: "Riproduzione dell’avviso ad alta voce",
  alertReady: "Avviso pronto",
  alertUnavailable:
    "Non è stato possibile riprodurre l’audio. Legga l’avviso sullo schermo.",
  askTrusted: "Chieda a una persona di fiducia",
  bigger: "Testo più grande",
  callCaptions: "Parole ascoltate nella chiamata",
  callTime: "dall’inizio della chiamata",
  callback:
    "Se qualcosa Le è sembrato strano, riagganci e chiami la persona o l’azienda a un numero di cui si fida già.",
  callbackAdvice:
    "Se qualcosa Le è sembrato strano, riagganci e richiami a un numero di fiducia.",
  caller: "Chi chiama",
  cannotConfirm: "Questo non può confermare chi ha chiamato.",
  captionSize: "Dimensione dei sottotitoli",
  captionSource: "Basato su sottotitoli che possono contenere errori.",
  captions: "Sottotitoli",
  captionsEmpty: "Le parole della chiamata appariranno qui.",
  captionsNotSaved:
    "Visibili finché rimane su questa pagina. Non vengono salvati.",
  checkMessage: "Controlla un messaggio",
  checkingLastPart:
    "Ricerca di segnali di allarme nell’ultima parte della chiamata…",
  checksUnavailable:
    "I controlli dei segnali di allarme non sono disponibili al momento. Le parole della chiamata continuano ad apparire qui sotto.",
  clearTitle: "Nessun segnale di allarme ascoltato",
  close: "Chiudi",
  codes: "richieste di codici, password o dati personali",
  connectionError:
    "La connessione per l’ascolto si è interrotta. I sottotitoli sono ancora qui. Prema Ricomincia per continuare ad ascoltare oppure Termina per salvare un riepilogo.",
  consent:
    "Comprendo che l’audio e le parole della chiamata saranno inviati a servizi di IA nel cloud mentre questo controllo è attivo.",
  credentialsReason:
    "Una richiesta di condividere un codice di verifica o una password.",
  delete: "Elimina riepilogo",
  deleteError: "Non è stato possibile eliminare il riepilogo. Riprovi.",
  deleteNotice:
    "Eliminare questo riepilogo non elimina i messaggi che ha preparato o inviato.",
  deleting: "Eliminazione…",
  discard: "Scarta riepilogo",
  earlierAria: "Controlli delle chiamate precedenti",
  finish: "Termina",
  finishSave: "Termina e salva riepilogo",
  flagged: "Cosa ha segnalato LifeLink",
  flaggedAdvice:
    "Non condivida codici e non invii denaro. Riagganci e richiami a un numero di cui si fida già.",
  flaggedBody: "Chi ha chiamato ha fatto richieste frequenti nelle truffe.",
  flaggedTitle: (count) =>
    `${count} ${count === 1 ? "segnale di allarme ascoltato" : "segnali di allarme ascoltati"}`,
  gettingReady: "Preparazione…",
  guideCaution:
    "Può non rilevare alcuni segnali di allarme. Se una chiamata Le sembra strana, riagganci e richiami a un numero di cui si fida già.",
  guideTitle: "LifeLink può avvisarLa ad alta voce in caso di:",
  hangUpFirst:
    "Può tranquillamente dire “La richiamo io” e riagganciare per primo.",
  heard: "Cosa ha sentito LifeLink",
  heardText: (heardWords) => {
    if (heardWords === undefined) {
      return "Nulla di ciò che LifeLink ha sentito corrispondeva a richieste comuni nelle truffe.";
    }

    const words = heardWords === 1 ? "1 parola" : `circa ${heardWords} parole`;

    return `LifeLink ha sentito ${words}. Nessuna corrispondeva a richieste comuni nelle truffe.`;
  },
  help: "Ho appena ricevuto una chiamata che mi lascia dei dubbi. Mi aiuti a verificare se era autentica prima che condivida informazioni o invii denaro?",
  interrupted:
    "La connessione si è interrotta durante il controllo. Sono state controllate solo le parti ascoltate da LifeLink.",
  intro:
    "LifeLink mostra sullo schermo le parole della chiamata, le fa controllare dall’IA per cercare segnali di truffa e La avvisa ad alta voce se ne trova uno.",
  languageLimit:
    "Le chiamate dal vivo usano l’IA nel cloud. I controlli locali del testo si basano ancora su modelli in inglese; tradurre l’interfaccia non estende le lingue che sanno analizzare. Il copione di prova e l’avviso parlato sono in inglese. I sottotitoli e le parole citate rimangono nella lingua originale.",
  listenTitle: "Ascolta una chiamata",
  listening: "LifeLink è in ascolto",
  liveCall: "Chiamata dal vivo",
  messageReview: "Messaggio da verificare",
  mixedVoices:
    "Questi sottotitoli mescolano entrambe le voci e possono contenere errori.",
  money: "richieste di denaro o buoni regalo",
  moneyReason: "Una richiesta di inviare denaro o pagare con buoni regalo.",
  mute: "Disattiva audio dell’avviso",
  noWarnings: "Nessun segnale di allarme rilevato",
  noWarningsYet: " · Nessun segnale di allarme rilevato finora",
  notConfigured:
    "I controlli delle chiamate dal vivo non sono ancora configurati. Può provare una chiamata simulata oppure scrivere le parole di chi ha chiamato.",
  notSafe:
    "Questo non significa che la chiamata fosse sicura. LifeLink può non rilevare segnali di allarme e non può verificare chi ha chiamato.",
  openStep: "Tenga aperta questa schermata mentre parla.",
  otherDevice:
    "Se il telefono non può usare il microfono durante una chiamata, apra LifeLink su un altro dispositivo.",
  outcomeLabels: {
    clear: "Nessun segnale di allarme rilevato",
    flagged: "Segnali di allarme rilevati",
    silent: "Non è stato sentito nulla",
    unchecked: "Controllo incompleto",
  },
  partlyChecked:
    "Una parte di questa chiamata non ha potuto essere controllata, quindi potrebbero esserci altri segnali di allarme.",
  paused:
    "L’ascolto si interrompe mentre viene riprodotto l’avviso, per evitare che LifeLink senta il proprio avvertimento.",
  permissionDenied:
    "L’accesso al microfono non è stato autorizzato. Lo autorizzi nelle impostazioni del sito nel browser, poi riprovi. Può anche provare una chiamata simulata.",
  phoneCall: "Telefonata",
  potentialScam: "Possibile truffa.",
  practice: "Prova",
  practiceCall: "Chiamata di prova",
  practiceCaptionSource:
    "Queste sono le parole del copione della chiamata di prova.",
  practiceCaptions: "Cosa viene detto",
  practiceExplanation:
    "Questa è una chiamata inventata. Non vengono usati il microfono né l’IA nel cloud.",
  practiceFlaggedBody:
    "Nella chiamata di prova sono state fatte richieste frequenti nelle truffe.",
  practiceHeard: "Detto nella chiamata di prova",
  practiceHelp:
    "Ho provato la chiamata truffa simulata di LifeLink. Possiamo parlare di cosa fare se ricevo una chiamata simile?",
  practiceMode:
    "La modalità di prova è attiva. Provi la chiamata inventata qui sotto, senza microfono.",
  practicePlaying: "Riproduzione della chiamata di prova",
  practicePrivacy:
    "Non vengono usati il microfono né l’IA nel cloud. Un breve riepilogo viene salvato nei Controlli precedenti.",
  practiceSaved:
    "La chiamata di prova non usa il microfono né l’IA nel cloud. Il breve riepilogo viene salvato nei Controlli precedenti.",
  practiceSilentBody:
    "La chiamata di prova è terminata prima che venissero riprodotte parole, quindi non c’era nulla da controllare.",
  practiceSilentTitle: "Prova interrotta in anticipo",
  practiceSource: "Basato sul copione di prova.",
  practiceSummary: "Riepilogo della chiamata di prova",
  practiceTime: "dall’inizio",
  practiceVoices:
    "Le voci di prova sono indicate. I sottotitoli delle chiamate reali mescolano entrambe le voci e non le distinguono.",
  privacy:
    "LifeLink non registra le chiamate. L’audio del microfono viene inviato a Gemini di Google per creare i sottotitoli; i sottotitoli vengono inviati a un modello di IA che cerca segnali di allarme. Quando interrompe l’ascolto, LifeLink salva un breve riepilogo dei segnali di allarme, non i sottotitoli.",
  protect:
    "Non condivida codici o password e non dia denaro. Chieda a una persona di fiducia.",
  quoteNotice:
    "Le citazioni possono contenere errori. I numeri lunghi sono nascosti.",
  readResult: "Leggi il risultato ad alta voce",
  remote: "richieste di controllare il computer o il telefono",
  remoteReason:
    "Una richiesta di consentire l’accesso remoto a un dispositivo.",
  retrySave: "Riprova a salvare",
  retrySteps: [
    "Metta la chiamata in vivavoce.",
    "Tenga il telefono vicino a questo dispositivo.",
    "Riavvii il controllo chiamata prima di rispondere.",
  ],
  retryTitle: "Per riprovare",
  review: "Verifica",
  saveError:
    "Non è stato possibile salvare il riepilogo. Tenga aperta questa pagina e riprovi.",
  saving: "Salvataggio del riepilogo…",
  scamWarning: "Sembra una truffa.",
  screenAnotherCall: "Controlla un’altra chiamata",
  secrecyReason:
    "Una richiesta di mantenere il segreto mentre si fa pressione per agire subito.",
  silentBody:
    "LifeLink non ha ricevuto alcuna voce, quindi non ha potuto cercare segnali di allarme nella chiamata.",
  silentTitle: "LifeLink non ha sentito la chiamata",
  smaller: "Testo più piccolo",
  soundUnavailable:
    "L’audio non è disponibile. I segnali di allarme appariranno comunque sullo schermo.",
  speakerStep: "Metta la chiamata in vivavoce vicino a questo dispositivo.",
  start: "Inizia ascolto",
  startAgain: "Ricomincia",
  startError:
    "LifeLink non è riuscito ad avviare l’ascolto. Riprovi oppure provi una chiamata simulata.",
  startStep: "Prema Inizia ascolto e autorizzi il microfono.",
  stop: "Interrompi",
  stopListening: "Interrompi ascolto",
  stopPractice: "Interrompi chiamata di prova",
  stopped: "L’ascolto è terminato",
  summary: "Riepilogo della chiamata",
  summaryNoWarnings: "Non sono stati rilevati segnali di allarme.",
  summarySaved:
    "Salvato nei Controlli precedenti come breve riepilogo. Audio e sottotitoli non vengono conservati.",
  summaryStorage:
    "Nei Controlli precedenti viene salvato solo un breve riepilogo. Audio e sottotitoli non vengono conservati.",
  summaryWarnings: "Questa chiamata presentava segnali di allarme.",
  tellTrusted: "Informi una persona di fiducia",
  timeLimit:
    "Il controllo si è fermato dopo 30 minuti. Ecco il riepilogo fino a quel momento.",
  times:
    "I tempi indicano minuti e secondi dall’inizio del controllo. I numeri lunghi sono nascosti.",
  tryPractice: "Prova una chiamata simulata",
  uncheckedBody:
    "Una parte di ciò che è stato detto non ha potuto essere controllata, quindi alcuni segnali di allarme potrebbero mancare da questo riepilogo.",
  uncheckedTitle: "LifeLink non ha potuto controllare l’intera chiamata",
  unmute: "Attiva audio dell’avviso",
  urgency: "minacce o pressioni per agire in fretta e mantenere il segreto",
  warningReasons: {
    codes_or_passwords:
      "Una richiesta di condividere un codice di verifica o una password.",
    gift_cards:
      "Una richiesta di pagare con buoni regalo o condividerne i codici.",
    money: "Una richiesta di inviare denaro o spostare i Suoi risparmi.",
    personal_details: "Una richiesta di dati personali o bancari.",
    remote_access:
      "Una richiesta di consentire l’accesso remoto a un dispositivo.",
    secrecy_or_pressure:
      "Una richiesta di mantenere il segreto o una pressione per agire subito.",
    threats: "Una minaccia di arresto, multe o chiusura dell’account.",
  },
  warningSign: "Segnale di allarme",
  warnings: "Segnali di allarme rilevati",
  you: "Lei",
};

export { callScreening };

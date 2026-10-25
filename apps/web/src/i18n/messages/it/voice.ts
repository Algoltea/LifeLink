import type { Messages } from "../en";

const voice: Messages["voice"] = {
  captions: "Sottotitoli",
  connectionProblem: "Si è verificato un problema con la connessione vocale.",
  dictationStopped: "La dettatura si è interrotta. Riprovi oppure scriva.",
  emptyRequest: "Non è stato preparato nulla perché la richiesta era vuota.",
  inputLabel: "Per cosa desidera aiuto?",
  lifeLinkSaid: "LifeLink ha detto: ",
  listening:
    "In ascolto. Le parole appariranno nel riquadro; prema Invia quando sono corrette.",
  microphoneBusy:
    "Un’altra applicazione sta usando il microfono. La chiuda e riprovi, oppure scriva.",
  microphoneDenied:
    "LifeLink non ha il permesso di usare il microfono. Lo autorizzi nelle impostazioni del browser per questo sito, oppure scriva.",
  microphoneFailed: "Il microfono non si è avviato. Riprovi oppure scriva.",
  microphoneMissing:
    "Non è stato trovato un microfono. Controlli che sia collegato, oppure scriva.",
  network:
    "Al momento la dettatura richiede una connessione a Internet. Per favore, scriva.",
  noSpeech:
    "Non ho sentito nulla. Prema Parla e riprovi avvicinandosi un po’ al microfono.",
  offlineFailed:
    "Non è stato possibile salvare questa richiesta senza connessione. Le Sue parole sono ancora qui. Riprovi quando sarà online.",
  opening: "Apertura di uno spazio per il Suo messaggio",
  placeholder: "Chieda a LifeLink…",
  prepareFailed:
    "Non è stato possibile prepararlo. Chieda alla persona di riprovare o di scrivere.",
  prepared:
    "È pronto e ora appare sullo schermo. Non accade nulla finché non viene approvato lì.",
  readAloudUnavailable: "La lettura ad alta voce non è disponibile. Riprovi.",
  retry: "Le Sue parole sono ancora nel riquadro. Prema Invia per riprovare.",
  savedOffline:
    "Salvato. LifeLink esaminerà la richiesta quando tornerà online.",
  screeningConnectionProblem:
    "Si è verificato un problema con la connessione del controllo chiamata.",
  screeningDisconnected: "Il controllo chiamata si è disconnesso.",
  screeningLost: "Il controllo chiamata ha perso la connessione.",
  screeningMicrophoneStopped:
    "Il microfono si è interrotto. Riavvii il controllo chiamata per ricollegarsi.",
  screeningResumeFailed:
    "Non è stato possibile riprendere il controllo chiamata dopo l’avviso. Lo riavvii.",
  screeningStopped: "Il controllo chiamata è stato interrotto.",
  send: "Invia",
  sending: "Invio",
  serviceDenied:
    "La dettatura è disattivata in questo browser. Per favore, scriva.",
  speak: "Parla",
  speakHint:
    "Prema Parla per parlare invece di scrivere. Nulla viene inviato finché non lo approva.",
  speaking: "LifeLink sta parlando…",
  startFailed: (error) => `La voce non si è avviata: ${error} Può scrivere.`,
  stop: "Interrompi",
  talking:
    "Sta parlando con LifeLink. Tutto ciò che prepara appare sullo schermo per la Sua approvazione.",
  unavailable:
    "La voce non è disponibile in questo browser: per favore, scriva. Nulla viene inviato finché non lo approva.",
  voiceStopped: "La voce è stata interrotta.",
  youSaid: "Lei ha detto: ",
};

export { voice };

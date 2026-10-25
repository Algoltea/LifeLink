import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "Informazioni su questo controllo",
  adviceNote:
    "Questo consiglio era nel messaggio, quindi non viene contato come segnale di allarme",
  adviceTitle: "Consigli nel messaggio stesso",
  allWords: "Tutte le parole lette da LifeLink",
  cannotProve:
    "Questo risultato non può dimostrare che un messaggio sia autentico. Confermi le richieste inattese attraverso un contatto che conosce già.",
  checkDidNotFinish: "Il controllo non è stato completato",
  checkingMessage: "Controllo del Suo messaggio…",
  compareWithPhoto: "Le confronti con la Sua foto",
  confidence: {
    high: "Diversi dettagli sostengono questa valutazione. Non può comunque verificare il mittente.",
    low: "Non ci sono informazioni sufficienti per essere certi. Un secondo parere può aiutare.",
    medium:
      "Alcuni dettagli sostengono questa valutazione. Verifichi la richiesta in modo indipendente.",
  },
  couldNotRead: "LifeLink non è riuscito a leggere chiaramente questa foto",
  delete: "Elimina questo controllo",
  deleteConfirm:
    "Eliminare questo controllo? Verrà rimosso dai Controlli precedenti.",
  deleting: "Eliminazione…",
  howChecked: "Come è stato eseguito il controllo",
  imageUnverified:
    "Queste parole sono state lette da una foto e potrebbero essere errate o incomplete. LifeLink non ha potuto confrontarle con il testo originale. Le controlli sulla Sua foto.",
  keep: "Conserva questo controllo",
  kinds: {
    email: "Un’email",
    screenshot: "Una foto o una schermata",
    text: "Un messaggio",
  },
  localLanguageNotice:
    "Questo controllo locale è progettato solo per l’inglese. Può non riconoscere truffe in spagnolo e in altre lingue. L’assenza di segnali di allarme non significa che un messaggio sia sicuro.",
  method: {
    cloud:
      "Un servizio di IA nel cloud ha aiutato con questo controllo, con il Suo permesso.",
    cloudOld:
      "Un servizio di IA nel cloud ha aiutato con questo controllo precedente. I dettagli del consenso non sono stati salvati in questo record.",
    rules:
      "LifeLink ha usato regole per segnali di allarme comuni. Per questo controllo, il messaggio non è stato inviato a un servizio di IA nel cloud.",
    rulesFallback:
      "LifeLink ha usato regole per segnali di allarme comuni perché l’IA nel cloud non era disponibile o non ha terminato. Il servizio potrebbe aver già ricevuto questo contenuto.",
    rulesOld:
      "LifeLink ha usato regole per segnali di allarme comuni. Questo record precedente non indica se anche un servizio di IA nel cloud ha ricevuto il messaggio.",
  },
  newPhoto: "Scatta una nuova foto",
  noFullWording:
    "Il testo completo non è stato salvato con questo controllo. Le citazioni sopra non sono una trascrizione completa. Le confronti con la foto oppure scriva il testo per un nuovo controllo.",
  noSigns:
    "Non sono stati trovati segnali di allarme chiari. Questo non dimostra che il messaggio sia autentico.",
  noStepsHint:
    "Prima di agire su una richiesta inattesa, verifichi con una persona che conosce usando i suoi recapiti salvati.",
  originalEmail: "Email originale",
  originalMessage: "Messaggio originale",
  photo: {
    alt: "La foto usata per questo controllo",
    larger: "Ingrandisci la foto",
    noPreview:
      "L’anteprima della foto non è disponibile per questo controllo. ",
    readSaved: "Può comunque leggere il risultato salvato.",
    reopen: "Provi a riaprire il controllo.",
    see: "Mostra la foto",
    smaller: "Riduci la foto",
    smallerAria: "Riduci le dimensioni della foto",
  },
  photoRetention: {
    old: "Questo controllo precedente non ha un’anteprima fotografica salvata. Eliminare il controllo rimuove il risultato; la vecchia foto potrebbe rimanere archiviata.",
    owned:
      "La foto viene conservata con questo controllo. Eliminando il controllo si elimina anche la foto, a meno che sia ancora usata da un altro controllo o da una foto salvata.",
  },
  readAloud: "Leggi il risultato ad alta voce",
  readingPhoto: "Lettura delle parole nella Sua foto…",
  recoveryMessage:
    "Tratti il messaggio con cautela. Può fare un altro controllo o chiedere a una persona di fiducia.",
  recoveryPhoto:
    "Provi con una foto più nitida, ben illuminata e con tutte le parole visibili, oppure scriva il testo. Questo controllo non può dirLe se il messaggio è autentico.",
  removedQuotes:
    "Alcune parole indicate dall’assistente non sono state trovate nel messaggio e quindi non vengono mostrate.",
  savedWording: "Il testo salvato con questo controllo",
  signCount: (count) =>
    `${count} ${count === 1 ? "segnale di allarme" : "segnali di allarme"}`,
  signsNoteMessage: "Cosa è emerso da questo messaggio",
  signsNotePhoto: "Con le parole lette da LifeLink nella Sua foto",
  step: "Passaggio",
  titles: {
    email: "Il controllo della Sua email",
    screenshot: "Il controllo della Sua foto",
    text: "Il controllo del Suo messaggio",
  },
  typeWords: "Scrivi invece il testo",
  verdicts: {
    likely_safe: "Nessun segnale di allarme chiaro",
    likely_scam: "Probabile truffa",
    suspicious: "Segnali di allarme rilevati",
    unsure: "Non verificato",
  },
  waitHint:
    "Di solito bastano pochi secondi. Tenga aperta questa pagina. Nel frattempo, non usi collegamenti o numeri di telefono del messaggio e non paghi nessuno.",
  whatNow: "Cosa fare adesso",
};

export { scamResult };

import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "Informazioni sui controlli truffe",
  appointmentAdded: "È stato aggiunto a La Sua settimana nella pagina Oggi.",
  appointmentFound: "Appuntamento trovato",
  backToInbox: "Torna alla posta in arrivo",
  checkAnother: "Controlla un altro messaggio",
  checkCouldNotFinish: (error) =>
    `Il controllo truffe non è stato completato. ${error}`,
  checkFirst: "Controlli i segnali di allarme comuni prima di agire.",
  checkForNew: "Cerca nuove email",
  checkManually: " Può controllarla manualmente qui sotto.",
  checkThis: "Controlla questa email",
  checked: (when) => `Controllato ${when}`,
  checkedAt: (when) => ` Controllato ${when}.`,
  checking: "Controllo in corso…",
  checksAutomatic:
    "Se i controlli email con IA sono attivi nelle Impostazioni, le nuove email reali possono essere inviate a un fornitore di IA nel cloud. Le email di prova restano in LifeLink. Quando l’IA nel cloud è disattivata, non disponibile o non termina, vengono usate regole locali solo per l’inglese. Una richiesta cloud fallita potrebbe comunque aver inviato l’email al fornitore. Nessuno dei due metodi può verificare il mittente o dimostrare che un’email sia sicura.",
  checksIntro:
    "Le nuove email vengono controllate in LifeLink per cercare segnali di truffa comuni. Scelga un messaggio per leggerlo e vedere cosa è emerso.",
  checksTitle: "Come funzionano i controlli email",
  chooseEmail: "Scelga un’email per leggerla e vedere il controllo truffe.",
  cloudCheckNotice:
    "L’IA nel cloud ha aiutato a controllare questa email. Può commettere errori e non può verificare il mittente. L’assenza di segnali di allarme non significa che l’email sia sicura.",
  cloudConsent:
    "Invia questa email a un servizio di IA nel cloud per un riepilogo e per individuare eventuali appuntamenti. Lasci deselezionato per una breve anteprima creata in LifeLink.",
  concern:
    "Questa email ha sollevato un dubbio. Verifichi la richiesta prima di agire.",
  connectMailbox: "Collega Gmail o Outlook",
  connected: (list) => `Collegato: ${list}.`,
  countEmails: (count) => `${count} email`,
  empty:
    "Non ci sono ancora email. Colleghi una casella, poi scelga “Cerca nuove email” per importare i messaggi recenti.",
  from: "Da ",
  helpMeUnderstand: "Mi aiuti a capire",
  inbox: "Posta in arrivo",
  linksNotOpened:
    "LifeLink non apre i collegamenti nelle email. Se vengono chiesti denaro o dati privati, controlli prima la richiesta.",
  loadingEmail: "Caricamento email",
  loadingEmails: "Caricamento delle email",
  localLanguageNotice:
    "Questo controllo email ha usato regole locali progettate solo per l’inglese. Possono non riconoscere truffe in spagnolo e in altre lingue. L’assenza di segnali di allarme non significa che un’email sia sicura.",
  lowerPriority: "Priorità minore",
  mailboxes: "Le Sue caselle email",
  mayNeedReply: "Potrebbe richiedere una risposta",
  needsAttention: (label, error) =>
    `${label} richiede attenzione${error ? `: ${error}` : "."}`,
  newEmails: (count) =>
    count === 0
      ? "Nessuna nuova email."
      : `${count} ${count === 1 ? "nuova email" : "nuove email"}.`,
  noMailbox: "Nessuna casella email collegata.",
  noSigns: "Nessun segnale di allarme trovato. Mittente non confermato.",
  noSubject: "(Senza oggetto)",
  noSubjectSpoken: "Senza oggetto",
  noText: "Questa email non contiene testo.",
  notChecked: "Non ancora controllato",
  notCheckedEmail: "Questa email non è stata ancora controllata.",
  notCheckedNote: "Non ancora controllato",
  nowTheEmail: "Ora, l’email.",
  openManualCheck: "Apri il controllo truffe manuale",
  opened: (subject) => `Aperto: ${subject}`,
  paging: {
    loadOlder: "Carica email precedenti",
    loading: "Caricamento…",
    newer: "Più recenti",
    noMoreImported:
      "Nessun’altra email importata. Provi con il gruppo successivo se sono ancora disponibili email precedenti.",
    noOlder: "Non ci sono email precedenti disponibili.",
    older: "Email precedenti",
    page: (page) => `Pagina ${page} · Fino a 15 email alla volta`,
  },
  preview: "Mostra una breve anteprima",
  readSummary: "Leggi il riepilogo ad alta voce",
  readingNow: "Lettura in corso…",
  readyToRead: "Pronto per la lettura",
  reconnect: "Ricollega",
  reply: "Rispondi",
  replyAdded:
    "Risposta aggiunta alla bozza. Può modificarla prima della verifica.",
  replyComposer: {
    nothingSent: (provider) =>
      `Nulla viene inviato. Prima verificherà il messaggio, poi verrà salvato come bozza in ${provider}.`,
    placeholder: "Scriva la Sua risposta…",
    replyTo: (to) => `Rispondi a ${to}`,
    review: "Verifica la bozza",
    speak: "Parla",
    stopListening: "Interrompi ascolto",
  },
  ride: {
    asked: "Ha chiesto un passaggio a qualcuno.",
    confirmed: "Il Suo passaggio è confermato.",
    declined: "Il passaggio è stato rifiutato.",
  },
  sampleEmails: " Queste sono email di esempio, per provare in sicurezza.",
  scamCheck: "Controllo truffe",
  scamCheckNotDone: "Controllo truffe non ancora eseguito",
  scamSigns:
    "Sono presenti segnali di truffa. Controlli prima di fare ciò che viene chiesto.",
  spokenFrom: (subject, from, body) => `${subject}. Da ${from}. ${body}`,
  summarizeCloud: "Riassumi con IA nel cloud",
  summary: "Riepilogo",
  summaryNote:
    "Ottenga una breve anteprima creata in LifeLink oppure scelga l’IA nel cloud",
  summarySpoken: "Riepilogo dell’email.",
  theEmail: "L’email",
  title: "Email",
  unknownCheckNotice:
    "Questo controllo salvato non indica se ha usato IA nel cloud o regole locali. Le regole locali coprono solo l’inglese e possono non riconoscere truffe in altre lingue. L’assenza di segnali di allarme non significa che l’email sia sicura.",
  warning: {
    concern:
      "Questa email ha sollevato un dubbio. Verifichi la richiesta prima di agire.",
    intro: (reason) =>
      `Possibile truffa. ${reason} Se ha dubbi, chieda a una persona di fiducia prima di rispondere, aprire un collegamento, inviare denaro o condividere dati personali.`,
    signs: (signs) => `Segnali di allarme: ${signs}.`,
  },
  warningSigns: "Segnali di allarme",
  warningSignsFound: "Segnali di allarme rilevati",
  whatShouldIDo: "Cosa dovrei fare?",
};

export { email };

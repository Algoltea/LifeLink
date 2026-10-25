import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "Vuole aggiungere qualcosa? (facoltativo)",
  addNotePlaceholder: "Per esempio, chi diceva di essere il mittente",
  ask: "Chieda a una persona di fiducia",
  callCheckTitle: "Controllo delle chiamate sospette",
  checkSomethingElse: "Controlla qualcos’altro",
  checking: "Controllo in corso",
  checkingMessage: "Controllo del messaggio…",
  chooseEmail: "Scegli un’email",
  chooseRecent: "Scelga tra le email recenti",
  cloudNote:
    "Un servizio di IA legge questo contenuto per controllarlo. Non includa password o numeri di carte.",
  didNotFinish: "Non completato",
  earlier: "Controlli precedenti",
  earlierEmpty: "Qui appariranno i controlli di messaggi, foto e chiamate.",
  emailMissing:
    "Questa email non si trova nella posta recente. Scelga un’altra email oppure ne scriva il testo qui sotto.",
  from: (sender) => `Da ${sender}`,
  guidance: {
    ai: "Un servizio di IA aiuta a controllare messaggi e foto. Le foto restano associate al controllo finché non lo elimina. I controlli di prova non usano mai l’IA.",
    intro:
      "Il controllo cerca segnali di allarme comuni. Non può confermare chi ha inviato un messaggio né se è vero.",
    next: "Legga il risultato, segua “Cosa fare adesso” oppure chieda un secondo parere a una persona di fiducia. È Lei a decidere cosa fare dopo.",
    title: "Cosa può dirmi un controllo truffe?",
  },
  howToShow: "Come desidera mostrare il messaggio?",
  loadingEarlier: "Caricamento dei controlli precedenti",
  loadingEmail: "Caricamento dell’email",
  loadingEmails: "Caricamento delle Sue email",
  localNote:
    "I controlli con IA non sono disponibili al momento. LifeLink usa invece segnali di allarme comuni.",
  messageWords: "Le parole del messaggio",
  messageWordsPlaceholder: "Incolli o scriva il testo qui",
  noLongerAvailable:
    "Questo controllo non è più disponibile. Può iniziarne uno nuovo.",
  noRecentEmails: "Non ci sono email recenti tra cui scegliere. ",
  noRecentEmailsRest: ", oppure scriva il testo del messaggio.",
  noSubject: "(Senza oggetto)",
  openEmail: "Apri Email",
  opening: "Apertura del Suo controllo",
  photo: {
    availabilityChecking:
      "Verifica della disponibilità dei controlli fotografici…",
    practice:
      "La modalità di prova è attiva. Le foto non vengono controllate né inviate a un servizio di IA.",
    unavailable:
      "I controlli fotografici non sono disponibili al momento. La foto non verrà caricata.",
    unavailableType:
      "I controlli fotografici non sono disponibili. Scriva il testo.",
  },
  practiceEmailNote:
    "Questa è un’email di prova. Viene controllata su questo dispositivo senza IA nel cloud.",
  practiceNote:
    "I controlli di prova usano segnali di allarme comuni. Nulla viene inviato a un servizio di IA.",
  practiceSuffix: " · Prova",
  preparing: "Preparazione del Suo controllo…",
  review: "Verifica",
  sources: {
    email: "Email",
    screenshot: "Foto",
    text: "Testo",
  },
  startNew: "Inizia un nuovo controllo",
  subline:
    "Ha dubbi su un messaggio o una chiamata? LifeLink cerca segnali di allarme prima che Lei agisca.",
  submit: {
    email: "Controlla questa email",
    screenshot: "Controlla questa foto",
    text: "Controlla questo messaggio",
  },
  title: "Controllo truffe",
  uploading: "Caricamento della Sua foto…",
  uploadingNote:
    "Caricamento della foto. Tenga aperta questa pagina; seguirà la lettura del testo.",
};

export { scam };

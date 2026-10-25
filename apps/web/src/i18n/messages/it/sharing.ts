import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `Può vedere: ${labels}`,
  changePermissions: "Modifica permessi",
  chooseAtLeastOne:
    "Scelga almeno un’informazione da condividere per creare un codice.",
  chooseWhatToShare: "Scelga cosa condividere",
  codeAriaLabel: (spelled) => `Codice d’invito ${spelled}`,
  codeCopied: "Codice copiato.",
  codeCopyFailed:
    "Non è stato possibile copiare il codice. Riprovi con Copia il codice oppure annoti il codice mostrato sopra.",
  codeSpoken: (spelled) => `Il codice è ${spelled}`,
  codeSpokenDash: ", trattino, ",
  copyCode: "Copia il codice",
  createCode: "Crea codice d’invito",
  expiry: {
    none: "Nessuna data di fine",
    seven: "7 giorni",
    thirty: "30 giorni",
  },
  forHowLong: "Per quanto tempo",
  giveCode: (firstName) =>
    `Dia questo codice a ${firstName}. Dovrà creare un account LifeLink, scegliere “Mi ha invitato un familiare” e inserirlo. Funziona una sola volta, per 14 giorni. Lo copi adesso: viene mostrato qui una sola volta.`,
  invitationWaiting: "Invito in attesa di accettazione",
  inviteFailed: (error) =>
    `Non è stato possibile creare l’invito. ${error} Le Sue scelte sono ancora qui. Provi di nuovo a creare il codice.`,
  keepSharing: "Continua a condividere",
  loadingPermissions: "Caricamento dei permessi",
  loadingPermissionsShort: "Caricamento dei permessi…",
  makingCode: "Creazione del codice…",
  noInformationSelected:
    "Non è stata selezionata alcuna informazione da condividere.",
  noInformationShared: "Nessuna informazione condivisa",
  notSharing: (firstName) =>
    `Non sta condividendo informazioni con ${firstName}.`,
  permissionsFor: (name) => `Permessi per ${name}`,
  readCode: "Leggi il codice ad alta voce",
  savePermissions: "Salva permessi",
  scopes: {
    "appointments.view": {
      description: "Prossimi appuntamenti, con orario e luogo.",
      label: "Appuntamenti",
    },
    "groceries.view": {
      description: "Le liste della spesa salvate e i relativi limiti di spesa.",
      label: "Liste della spesa",
    },
    "photos.view": {
      description:
        "Le foto che ha condiviso nelle conversazioni con la famiglia.",
      label: "Foto condivise",
    },
    "reminders.view": {
      description: "I promemoria che ha salvato e scelto di condividere.",
      label: "Promemoria",
    },
    "rides.view": {
      description:
        "A che punto è un passaggio o una commissione: richiesto, risposta ricevuta, confermato.",
      label: "Organizzazione dei passaggi",
    },
    "scam_alerts.view": {
      description:
        "Un avviso quando controlla un messaggio che sembra una truffa.",
      label: "Avvisi di truffa",
    },
  },
  sharedInformation: "Informazioni condivise",
  startSharing:
    "Per iniziare a condividere, scelga cosa può vedere questa persona e le dia un codice d’invito. Lo inserirà nel proprio account LifeLink.",
  state: {
    active: "Può vedere le informazioni condivise",
    expired: "Condivisione terminata",
    invited: "Invito non ancora usato",
    revoked: "Condivisione interrotta",
  },
  stopDescription: (name) =>
    `${name} smetterà subito di vedere ciò che ha condiviso. Potrà invitare questa persona di nuovo in seguito.`,
  stopFailed: (error) =>
    `Non è stato possibile interrompere la condivisione. ${error} Riprovi con Interrompi condivisione.`,
  stopSharing: "Interrompi condivisione",
  stopSharingWith: (name) => `Interrompi condivisione con ${name}`,
  stopTitle: (name) => `Interrompere la condivisione con ${name}?`,
  stopped: (name) => `Condivisione con ${name} interrotta.`,
  stopping: "Interruzione della condivisione…",
  them: "questa persona",
  until: (day) => `Fino al ${day}`,
  updateFailed: (error) =>
    `Non è stato possibile aggiornare la condivisione. ${error} Le Sue scelte sono ancora qui. Scelga Salva permessi per riprovare.`,
  updated: "Condivisione aggiornata. Le modifiche hanno effetto immediato.",
  viewOnly:
    "Scelga quali informazioni condividere in LifeLink. Questa persona può solo vederle: non può inviare messaggi, approvare azioni o spendere per Lei.",
  whatNameCanSee: (firstName) => `Cosa può vedere ${firstName}`,
  whatTheyCanSee: "Cosa può vedere questa persona",
};

export { sharing };

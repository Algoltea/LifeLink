import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "Aggiungi questa persona",
  addWay: "Aggiungi un altro recapito",
  added: (name) => `${name}: aggiunta completata.`,
  anotherWay: "Un altro recapito",
  askingForHelp: "Chiedere aiuto a questa persona",
  chooseDifferentPicture: "Scegli un’altra immagine",
  choosePicture: "Scegli un’immagine",
  detailsNotSaved: (error) =>
    `Non è stato possibile salvare i dati della persona. ${error} I dati inseriti sono ancora qui. Salvi di nuovo per riprovare.`,
  howToReach: "Come contattarla",
  language: "Lingua che LifeLink usa con questa persona",
  languageHelp:
    "Le parole scritte da LifeLink per questa persona, come la nota che La presenta nel primo iMessage, usano questa lingua. I Suoi messaggi vengono sempre inviati esattamente come li approva.",
  languageSameAsMine: (language) => `Come la mia (${language})`,
  name: "Nome",
  notSetYet: "Non ancora impostato",
  picture: "Immagine",
  pictureFailed: (error) => `${error} Scelga un’immagine per riprovare.`,
  pictureHelp:
    "Facoltativa. La foto viene ridotta e ritagliata in un quadrato su questo dispositivo. I dati di posizione e fotocamera vengono rimossi prima di salvarla.",
  pictureNotSaved: (error) =>
    `I dati della persona sono salvati, ma l’immagine no. ${error} Le Sue scelte sono ancora qui. Salvi di nuovo per riprovare oppure scelga un’altra immagine.`,
  pictureUnusable:
    "Non è stato possibile usare questa immagine. Provi con un’altra foto.",
  preferredWay: "Recapito preferito",
  relationship: "Il Suo rapporto con questa persona",
  relationshipPlaceholder: "Figlio, vicino, amico",
  removePicture: "Rimuovi immagine",
  saveChanges: "Salva modifiche",
  saved: "Salvato.",
  savingPersonAndPicture: "Salvataggio di persona e immagine…",
  trusted:
    "Fa parte della mia cerchia di fiducia. LifeLink può suggerirmi di chiedere aiuto a questa persona.",
  ways: {
    discord: {
      help: "Il suo ID utente Discord, un numero lungo. In Discord: Impostazioni, Avanzate, Modalità sviluppatore, poi Copia ID utente.",
      label: "Discord",
      valueLabel: "ID utente Discord",
    },
    email: {
      help: "Il suo indirizzo email.",
      label: "Email (Gmail, Outlook e altri)",
      valueLabel: "Indirizzo email",
    },
    imessageEmail: {
      help: "L’email dell’Apple ID usata per iMessage. È un’identità diversa dal numero di telefono. Per inviare iMessage reali in seguito, salvi questa persona, poi scelga Modifica e Collega iMessage.",
      label: "iMessage (email Apple ID)",
      valueLabel: "Email Apple ID",
    },
    imessagePhone: {
      help: "Il suo numero iPhone. Per inviare iMessage reali in seguito, salvi questa persona, poi scelga Modifica e Collega iMessage.",
      label: "iMessage (numero di telefono)",
      valueLabel: "Numero di telefono",
    },
    telegram: {
      help: "Il nome utente Telegram, come @sam_alvarez (in Telegram: Impostazioni, poi Nome utente). Dopo aver salvato, chieda alla persona di aprire @LifeLinkMessage_Bot in Telegram e premere Avvia. Se non ha un nome utente, lasci il campo vuoto e usi il collegamento Telegram qui sotto.",
      label: "Telegram",
      valueLabel: "Nome utente Telegram",
    },
    whatsapp: {
      help: "Conservato per Lei. LifeLink non può ancora inviare messaggi WhatsApp.",
      label: "WhatsApp (solo salvato)",
      valueLabel: "Numero WhatsApp",
    },
  },
  whoTheyAre: "Chi è questa persona",
};

export { contactForm };

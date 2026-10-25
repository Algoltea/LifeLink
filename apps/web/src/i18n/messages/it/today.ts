import type { Messages } from "../en";

const today: Messages["today"] = {
  addPostalCode: "Aggiunga il Suo codice postale",
  allEmail: "Tutte le email",
  allMessages: "Tutti i messaggi",
  appointment: "Appuntamento",
  check: "Controlla",
  checkPostalCode: "Controlli il Suo codice postale",
  connect: "Collega",
  connectMailbox: "Colleghi Gmail o Outlook per vedere qui le nuove email.",
  couldNotFindTown: "Non abbiamo trovato la Sua città",
  dismissFailed: (error) => `${error} Prema Fatto per riprovare.`,
  fromFamily: "Da familiari e amici",
  gettingStarted: "Per iniziare",
  gettingStartedHint:
    "Ogni passaggio viene indicato come completato quando lo termina.",
  hideSteps: "Nascondi questi passaggi",
  latestEmail: "Email più recenti",
  loadingBriefing: "Caricamento del Suo riepilogo",
  loadingToday: "Caricamento di Oggi",
  messages: "Messaggi",
  messagesFrom: (names) =>
    `Negli ultimi due giorni ha ricevuto messaggi da ${names}.`,
  newMessage: "Nuovo messaggio",
  news: "Notizie",
  newsFullStory: (source) => `Articolo completo su ${source}`,
  newsGood: "Buone notizie",
  newsMoreFrom: (source) => `Altre notizie da ${source}`,
  newsOpensNewTab: ", si apre in una nuova scheda",
  newsOpinion: "Articolo d’opinione",
  newsSourceFrom: ", da ",
  newsSponsored: "Contenuto sponsorizzato",
  newsSummarizing: "Riassunto in corso…",
  newsSummaryUnavailable:
    "Non c’è un riassunto per questo articolo. Può leggere l’articolo completo.",
  newsTop: "Notizie principali",
  newsType: "Tipo di notizie",
  newsUnavailable:
    "Le notizie non sono disponibili al momento. Riprovi più tardi.",
  nextAppointment: (title, when, time) =>
    `Il Suo prossimo appuntamento è ${title} ${when} alle ${time}.`,
  noAppointments: "Non ha appuntamenti in programma questa settimana.",
  noEmail: "Nessuna nuova email.",
  noMessages: "Nessun nuovo messaggio negli ultimi due giorni.",
  noSubject: "Senza oggetto",
  nothingBooked: "Nessun impegno questa settimana.",
  onDay: (day) => `il ${day}`,
  openForDetails: "Apri per i dettagli",
  possibleScam: "Possibile truffa",
  readMyDay: "Leggi la mia giornata ad alta voce",
  reminder: "Promemoria",
  remindersDue: (count) => `${count} promemoria in scadenza.`,
  rideConfirmed: (name) => `Passaggio con ${name}, confermato`,
  seeWeather: "Veda il meteo per i Suoi appuntamenti",
  steps: {
    askAction: "Chiedi a LifeLink",
    askDescription:
      "Provi con “Mi ricordi di annaffiare le piante alle cinque”. Verificherà ogni azione prima che avvenga.",
    askTitle: "Chieda una mano",
    emailAction: "Collega email",
    emailDescription:
      "LifeLink legge le email insieme a Lei e segnala ciò che sembra una truffa.",
    emailTitle: "Colleghi la Sua email",
    locationAction: "Aggiungi codice postale",
    locationDescription:
      "LifeLink mostra il meteo su Oggi e accanto a ogni appuntamento.",
    locationTitle: "Aggiunga il Suo codice postale",
    trustedAction: "Aggiungi una persona",
    trustedDescription:
      "Scelga chi può aiutarLa con i passaggi e cosa può vedere. È Lei a decidere.",
    trustedTitle: "Aggiunga una persona di fiducia",
  },
  title: "Oggi",
  titlePrefix: "Oggi: ",
  todayLower: "oggi",
  tomorrowLower: "domani",
  weatherHigh: ", massima ",
  weatherPrefix: ", meteo: ",
  yourWeek: "La Sua settimana",
};

export { today };

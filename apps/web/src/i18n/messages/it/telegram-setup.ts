import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `Invito copiato. Lo invii personalmente a ${contactName}.`,
  copiedLink: (contactName) =>
    `Collegamento copiato. Lo invii personalmente a ${contactName}.`,
  copyInvitation: "Copia invito",
  copyInvitationFailed:
    "Non è stato possibile copiare l’invito. Copi l’indirizzo sopra.",
  copyLink: "Copia collegamento",
  copyLinkFailed:
    "Non è stato possibile copiare il collegamento. Lo selezioni e lo copi sopra.",
  expires: (day) => ` Funziona una sola volta e scade il ${day}.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `Ciao ${contactName}! Apri ${botUrl} in Telegram e premi Avvia, così possiamo scriverci attraverso LifeLink.`,
  link: "Collega Telegram",
  linked: (account, contactName) =>
    `Collegato a ${account}. I messaggi che approva per ${contactName} possono essere inviati tramite Telegram e le risposte arrivano in Messaggi.`,
  loading: "Caricamento della configurazione di Telegram…",
  newLink: "Crea un nuovo collegamento",
  notConfigured:
    "È necessaria la configurazione dell’applicazione. Chi gestisce LifeLink deve collegare Telegram prima che Lei possa collegarlo per questo contatto.",
  ownerOnly:
    "Solo il titolare dell’account può collegare Telegram per i propri contatti.",
  sendLink: (contactName) =>
    `Invii questo collegamento a ${contactName}. Quando lo apre e preme Avvia, Telegram viene collegato qui automaticamente.`,
  theirAccount: "l’account Telegram di questa persona",
  unlink: "Scollega Telegram",
  waitingAsk: (contactName) => `. Chieda a ${contactName} di aprire `,
  waitingFor: (username) => `In attesa di @${username}`,
  waitingRest:
    " in Telegram e premere Avvia. LifeLink collegherà la persona appena lo farà.",
};

export { telegramSetup };

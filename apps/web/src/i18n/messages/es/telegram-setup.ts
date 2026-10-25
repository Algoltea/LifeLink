import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `Invitación copiada. Envíesela usted a ${contactName}.`,
  copiedLink: (contactName) =>
    `Enlace copiado. Envíeselo usted a ${contactName}.`,
  copyInvitation: "Copiar la invitación",
  copyInvitationFailed:
    "No se pudo copiar la invitación. Copie la dirección de arriba.",
  copyLink: "Copiar el enlace",
  copyLinkFailed: "No se pudo copiar el enlace. Selecciónelo y cópielo arriba.",
  expires: (day) => ` Funciona una sola vez y deja de funcionar el ${day}.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `¡Hola, ${contactName}! Abre ${botUrl} en Telegram y toca Iniciar, así podemos escribirnos por LifeLink.`,
  link: "Vincular Telegram",
  linked: (account, contactName) =>
    `Vinculado con ${account}. Los mensajes que apruebe para ${contactName} pueden ir por Telegram, y sus respuestas llegan a Mensajes.`,
  loading: "Cargando la configuración de Telegram…",
  newLink: "Crear un enlace nuevo",
  notConfigured:
    "Falta configurar la aplicación. Quien administra LifeLink debe conectar Telegram antes de que pueda vincularlo para este contacto.",
  ownerOnly:
    "Solo el titular de la cuenta puede vincular Telegram para sus contactos.",
  sendLink: (contactName) =>
    `Envíe este enlace a ${contactName}. Cuando lo abra y toque Iniciar, Telegram quedará vinculado aquí automáticamente.`,
  theirAccount: "su cuenta de Telegram",
  unlink: "Desvincular Telegram",
  waitingAsk: (contactName) => `. Pídale a ${contactName} que abra `,
  waitingFor: (username) => `Esperando a @${username}`,
  waitingRest:
    " en Telegram y toque Iniciar. LifeLink lo vincula en cuanto lo haga.",
};

export { telegramSetup };

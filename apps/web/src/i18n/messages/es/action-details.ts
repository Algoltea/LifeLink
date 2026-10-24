import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " y ",
  budget: (amount) => ` Presupuesto: ${amount}.`,
  by: (channel) => `Por ${channel}`,
  calendar: "Calendario",
  confirming: "Está confirmando",
  document: "Documento",
  draftSavedIn: (provider) =>
    `Se guarda como borrador en su ${provider}. No se envía hasta que usted lo envíe desde allí.`,
  driveNoteHint:
    "Se guarda como un documento nuevo en su Google Drive. Solo usted puede verlo, a menos que lo comparta allí.",
  estimate: (amount) => `Su estimado: ${amount}.`,
  event: "Evento",
  itemCount: (name, count) =>
    `${name}: ${count} ${count === 1 ? "artículo" : "artículos"}`,
  noEstimate: "Todavía no hay estimado.",
  noJustYou: "No, solo usted",
  notGiven: "No se indicó",
  onlyGrantees: (names, scope) =>
    `Esto solo se comparte con ${names}, según sus permisos para ${scope}.`,
  peopleYouAllowed: "las personas a quienes dio permiso",
  readEmail: "Leer el correo en voz alta",
  readMessage: "Leer el mensaje en voz alta",
  readNote: "Leer la nota en voz alta",
  readUpdate: "Leer la novedad en voz alta",
  reminder: "Recordatorio",
  sharedWithCircle: "Compartido con su círculo de confianza",
  shoppingRecord:
    "Este es el registro de un pedido de compras anterior. Ya no se puede comprar a través de LifeLink.",
  spoken: {
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, en ${location}` : ""}.`,
    confirm: (summary) => `Está confirmando: ${summary}`,
    driveNote: (title, body) =>
      `Una nota en su Google Drive llamada ${title}. Dice: ${body}`,
    email: (to, subject, body) =>
      `Correo para ${to}. Asunto: ${subject}. Dice: ${body}`,
    emailAloud: (subject, body) => `Asunto: ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `Para ${name}, por ${channel}${route}. El mensaje dice: ${body}`,
    reminder: (title, when, shared) =>
      `Recordatorio: ${title}. ${when}. ${shared ? "Compartido con su círculo de confianza." : "Solo para usted."}`,
    update: (text) => `La novedad dice: ${text}`,
  },
  starts: "Empieza",
  subject: "Asunto",
  thisScope: "esto",
  to: "Para",
  toAddress: (address) => ` a ${address}`,
  toName: (name) => `Para ${name}`,
  when: "Cuándo",
  where: "Dónde",
  withPhotos: (count) => `Con ${count} ${count === 1 ? "foto" : "fotos"}.`,
  yesShared: "Sí",
};

export { actionDetails };

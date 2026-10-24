import type { Messages } from "../en";

const family: Messages["family"] = {
  appointments: "Citas",
  budget: (amount) => ` · presupuesto ${amount}`,
  checked: (kind, day) => `Se revisó ${kind} el ${day}`,
  codeHint:
    "La persona que le invitó puede leerlo en su página Círculo de confianza.",
  connect: "Conectar",
  connected:
    "Ya están conectados. Verá solo lo que esa persona eligió compartir.",
  empty:
    "Todavía nadie comparte con usted. Cuando alguien le invite, escriba su código abajo.",
  groceries: "Compras",
  haveCode: "¿Tiene un código de invitación?",
  invitationCode: "Código de invitación",
  kinds: {
    email: "un correo",
    screenshot: "una captura de pantalla",
    text: "un mensaje de texto",
  },
  likelyScam: "Probablemente una estafa",
  loadingMessages: "Cargando mensajes",
  loadingPhoto: "Cargando la foto…",
  loadingShared: "Cargando la información compartida",
  loadingWhatWasShared: "Cargando lo que se compartió",
  messagesWith: (name) => `Mensajes con ${name}`,
  noMessages: "Todavía no hay mensajes en LifeLink.",
  noSharedReminders: "No hay recordatorios compartidos.",
  notSharing: "Esta persona no está compartiendo con usted ahora.",
  nothingLeft: "No queda nada por comprar.",
  nothingSoon: "Nada en los próximos 30 días.",
  onlyResult: "Solo se comparte el resultado, nunca el mensaje.",
  photoUnavailable: "Esta foto no está disponible.",
  photos: "Fotos",
  replyTo: (name) => `Responder a ${name}`,
  ride: {
    asked: "Viaje pedido, aún sin confirmar",
    confirmed: "Viaje confirmado",
    declined: "Viaje rechazado",
  },
  scamChecks: "Revisiones de estafas",
  sendReply: "Enviar respuesta",
  sharedPhoto: "Una foto compartida",
  sharedReminders: "Recordatorios compartidos",
  shares: (name, scopes) =>
    `${name} comparte: ${scopes}. Puede mirar, pero no puede enviar, aprobar ni gastar nada por esa persona.`,
  subline:
    "Vea solo lo que cada persona elige compartir. Puede mirar, pero nunca enviar, aprobar ni gastar nada por esa persona.",
  suspicious: "Sospechoso",
  theyWrote: (name) => `${name} escribió: `,
  title: "Familia",
  updates: "Novedades",
  withPhotos: " · con fotos",
  you: "Usted",
  youWrote: "Usted escribió: ",
};

export { family };

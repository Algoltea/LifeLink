import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "Sobre las revisiones de estafas",
  appointmentAdded: "Se agregó a Su semana en su página Hoy.",
  appointmentFound: "Se encontró una cita",
  backToInbox: "Volver a la bandeja de entrada",
  checkAnother: "Revisar otro mensaje",
  checkCouldNotFinish: (error) =>
    `La revisión de estafas no pudo terminar. ${error}`,
  checkFirst: "Revise las señales de alerta comunes antes de actuar.",
  checkForNew: "Buscar correo nuevo",
  checkManually: " Puede revisarlo a mano abajo.",
  checkThis: "Revisar este correo",
  checkUsesSigns:
    "Esta revisión automática usa reglas solo para el inglés, sin IA en la nube. Puede pasar por alto estafas en español u otros idiomas y no puede confirmar quién envió el correo ni si lo que dice es cierto.",
  checked: (when) => `Revisado el ${when} · hecho en LifeLink`,
  checkedAt: (when) => ` Revisado el ${when}.`,
  checking: "Buscando…",
  checksAutomatic:
    "Las revisiones automáticas no envían el correo a un proveedor de IA. Sus reglas solo cubren el inglés y pueden pasar por alto estafas en otros idiomas. No pueden confirmar quién envió un correo ni si lo que dice es cierto. «Buscar correo nuevo» trae sus correos recientes y los revisa de la misma manera.",
  checksIntro:
    "El correo nuevo se revisa en LifeLink buscando señales comunes de estafa. Elija un mensaje para leerlo y ver qué llamó la atención.",
  checksTitle: "Cómo funcionan las revisiones del correo",
  chooseEmail: "Elija un correo para leerlo y ver su revisión de estafas.",
  cloudConsent:
    "Enviar este correo a un servicio de IA en la nube para resumirlo y encontrar alguna cita. Déjelo sin marcar para una vista previa breve hecha en LifeLink.",
  concern: "Este correo causó una duda. Revise lo que pide antes de actuar.",
  connectMailbox: "Conectar Gmail u Outlook",
  connected: (list) => `Conectado: ${list}.`,
  countEmails: (count) => `${count} ${count === 1 ? "correo" : "correos"}`,
  empty:
    "Todavía no hay correos aquí. Conecte un buzón y luego elija «Buscar correo nuevo» para traer los mensajes recientes.",
  from: "De ",
  helpMeUnderstand: "Ayúdeme a entender",
  inbox: "Bandeja de entrada",
  linksNotOpened:
    "LifeLink no abre los enlaces de los correos. Si le pide dinero o datos privados, revíselo primero.",
  loadingEmail: "Cargando el correo",
  loadingEmails: "Cargando los correos",
  localLanguageNotice:
    "Las revisiones automáticas de estafas solo están preparadas para analizar mensajes en inglés. Pueden pasar por alto estafas en español y otros idiomas. Que no haya señales de alerta no significa que el correo sea seguro.",
  lowerPriority: "Menos importante",
  mailboxes: "Sus buzones",
  mayNeedReply: "Puede necesitar respuesta",
  needsAttention: (label, error) =>
    `${label} necesita atención${error ? `: ${error}` : "."}`,
  newEmails: (count) =>
    count === 0
      ? "No hay correos nuevos."
      : `${count} ${count === 1 ? "correo nuevo" : "correos nuevos"}.`,
  noMailbox: "No hay ningún buzón conectado.",
  noSigns: "No se encontraron señales de alerta. Remitente sin confirmar.",
  noSubject: "(Sin asunto)",
  noSubjectSpoken: "Sin asunto",
  noText: "Este correo no tiene texto.",
  notChecked: "Sin revisar todavía",
  notCheckedEmail: "Este correo todavía no se ha revisado.",
  notCheckedNote: "Sin revisar todavía · hecho en LifeLink",
  nowTheEmail: "Ahora, el correo.",
  openManualCheck: "Abrir la revisión manual de estafas",
  opened: (subject) => `Abierto: ${subject}`,
  paging: {
    loadOlder: "Cargar correos anteriores",
    loading: "Cargando…",
    newer: "Más recientes",
    noMoreImported:
      "No se importaron más correos. Pruebe con el siguiente grupo si todavía hay correos anteriores.",
    noOlder: "No hay correos anteriores.",
    older: "Correos anteriores",
    page: (page) => `Página ${page} · Hasta 15 correos a la vez`,
  },
  preview: "Mostrar una vista previa breve",
  readSummary: "Leer el resumen en voz alta",
  readingNow: "Leyéndolo ahora…",
  readyToRead: "Listo para leer",
  reconnect: "Volver a conectar",
  reply: "Responder",
  replyAdded:
    "Se agregó la respuesta a su borrador. Puede cambiarla antes de revisarla.",
  replyComposer: {
    nothingSent: (provider) =>
      `No se envía nada. Primero lo revisará y luego se guardará como borrador en su ${provider}.`,
    placeholder: "Escriba su respuesta…",
    replyTo: (to) => `Responder a ${to}`,
    review: "Revisar el borrador",
    speak: "Hablar",
    stopListening: "Dejar de escuchar",
  },
  ride: {
    asked: "Usted le pidió a alguien que le lleve.",
    confirmed: "Su viaje está confirmado.",
    declined: "El viaje se rechazó.",
  },
  sampleEmails: " Son correos de ejemplo, para que practique con tranquilidad.",
  scamCheck: "Revisión de estafas",
  scamCheckNotDone: "Revisión de estafas sin hacer todavía",
  scamSigns:
    "Tiene señales de estafa. Por favor, revíselo antes de hacer lo que pide.",
  spokenFrom: (subject, from, body) => `${subject}. De ${from}. ${body}`,
  summarizeCloud: "Resumir con IA en la nube",
  summary: "Resumen",
  summaryNote:
    "Obtenga una vista previa breve hecha en LifeLink, o elija IA en la nube",
  summarySpoken: "Resumen del correo.",
  theEmail: "El correo",
  title: "Correo",
  warning: {
    concern: "Este correo causó una duda. Revise lo que pide antes de actuar.",
    intro: (reason) =>
      `Posible estafa. ${reason} Si tiene dudas, pregúntele a alguien de confianza antes de responder, abrir un enlace, enviar dinero o compartir datos personales.`,
    signs: (signs) => `Señales de alerta: ${signs}.`,
  },
  warningSigns: "Señales de alerta",
  warningSignsFound: "Se encontraron señales de alerta",
  whatShouldIDo: "¿Qué debo hacer?",
};

export { email };

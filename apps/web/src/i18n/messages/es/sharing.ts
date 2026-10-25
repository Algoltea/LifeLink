import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `Puede ver: ${labels}`,
  changePermissions: "Cambiar permisos",
  chooseAtLeastOne: "Elija al menos una cosa para compartir y crear un código.",
  chooseWhatToShare: "Elegir qué compartir",
  codeAriaLabel: (spelled) => `Código de invitación ${spelled}`,
  codeCopied: "Código copiado.",
  codeCopyFailed:
    "No se pudo copiar el código. Pulse Copiar el código otra vez, o anote el código que se muestra arriba.",
  codeSpoken: (spelled) => `El código es ${spelled}`,
  codeSpokenDash: ", guion, ",
  copyCode: "Copiar el código",
  createCode: "Crear un código de invitación",
  expiry: {
    none: "Sin fecha de fin",
    seven: "7 días",
    thirty: "30 días",
  },
  forHowLong: "Por cuánto tiempo",
  giveCode: (firstName) =>
    `Dele este código a ${firstName}. Esa persona crea una cuenta de LifeLink, elige «Un familiar me invitó» y lo escribe. Funciona una sola vez, durante 14 días. Cópielo ahora; solo se muestra aquí una vez.`,
  invitationWaiting: "Invitación pendiente de aceptar",
  inviteFailed: (error) =>
    `No se pudo crear la invitación. ${error} Sus opciones siguen aquí. Intente crear el código otra vez.`,
  keepSharing: "Seguir compartiendo",
  loadingPermissions: "Cargando permisos",
  loadingPermissionsShort: "Cargando permisos…",
  makingCode: "Creando el código…",
  noInformationSelected: "No hay información elegida para compartir.",
  noInformationShared: "No se comparte información",
  notSharing: (firstName) =>
    `No está compartiendo ninguna información con ${firstName}.`,
  permissionsFor: (name) => `Permisos de ${name}`,
  readCode: "Leer el código en voz alta",
  savePermissions: "Guardar permisos",
  scopes: {
    "appointments.view": {
      description: "Las próximas citas, con la hora y el lugar.",
      label: "Citas",
    },
    "groceries.view": {
      description: "Sus listas de compras guardadas y sus presupuestos.",
      label: "Listas de compras",
    },
    "photos.view": {
      description:
        "Las fotos que ha compartido en sus conversaciones familiares.",
      label: "Fotos compartidas",
    },
    "reminders.view": {
      description: "Los recordatorios que guardó y eligió compartir.",
      label: "Recordatorios",
    },
    "rides.view": {
      description:
        "Cómo va un viaje o un mandado: pedido, respondido, confirmado.",
      label: "Viajes acordados",
    },
    "scam_alerts.view": {
      description: "Un aviso cuando revisa un mensaje que parece una estafa.",
      label: "Avisos de estafa",
    },
  },
  sharedInformation: "Información compartida",
  startSharing:
    "Para empezar a compartir, elija qué puede ver y dele un código de invitación. Lo escribe en su propia cuenta de LifeLink.",
  state: {
    active: "Puede ver la información compartida",
    expired: "Se terminó de compartir",
    invited: "Invitación sin usar todavía",
    revoked: "Se dejó de compartir",
  },
  stopDescription: (name) =>
    `${name} dejará de ver de inmediato todo lo que compartió. Puede volver a invitarle más adelante.`,
  stopFailed: (error) =>
    `No se pudo dejar de compartir. ${error} Pulse Dejar de compartir otra vez.`,
  stopSharing: "Dejar de compartir",
  stopSharingWith: (name) => `Dejar de compartir con ${name}`,
  stopTitle: (name) => `¿Dejar de compartir con ${name}?`,
  stopped: (name) => `Ya no comparte con ${name}.`,
  stopping: "Dejando de compartir…",
  them: "esa persona",
  until: (day) => `Hasta el ${day}`,
  updateFailed: (error) =>
    `No se pudo actualizar lo que comparte. ${error} Sus opciones siguen aquí. Elija Guardar permisos para intentarlo de nuevo.`,
  updated: "Se actualizó lo que comparte. Se aplica de inmediato.",
  viewOnly:
    "Elija qué información compartir en LifeLink. Solo puede verla; no puede enviar mensajes, aprobar acciones ni gastar por usted.",
  whatNameCanSee: (firstName) => `Qué puede ver ${firstName}`,
  whatTheyCanSee: "Qué puede ver",
};

export { sharing };

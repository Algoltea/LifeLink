import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "Menú de la cuenta de ",
  closeMenu: "Cerrar el menú",
  dismissNotice: "Descartar el aviso",
  familyMember: "Familiar",
  groupHelpWith: "Ayuda con",
  groupSetup: "Su configuración",
  mainNavigation: "Principal",
  menu: "Menú",
  nav: {
    ask: "Pregúntele a LifeLink",
    circle: "Círculo de confianza",
    connections: "Conexiones",
    documents: "Documentos",
    email: "Correo",
    family: "Familia",
    groceries: "Compras",
    messages: "Mensajes",
    scam: "Revisar estafas",
    settings: "Ajustes",
    solitaire: "Solitario",
    today: "Hoy",
  },
  needsReview: (label) => `${label}: necesita su revisión.`,
  notTriedAgain: "No se volverá a intentar automáticamente.",
  offline:
    "No tiene conexión. Puede seguir escribiendo; todo lo que apruebe se revisará otra vez y se enviará cuando vuelva a tener conexión.",
  offlineReview: "Hay trabajo sin conexión que necesita su revisión",
  offlineWaiting: (count) => ` ${count} en espera.`,
  openAsk: "Abrir Pregúntele",
  openMenu: "Abrir el menú",
  originalRequest: "Su pedido original",
  playAccount:
    "El solitario se guarda en este dispositivo y funciona sin conexión.",
  practiceBannerOn: "El modo de práctica está activado.",
  practiceBannerRest: "No se envía ningún mensaje real.",
  practiceMode: "Modo de práctica",
  reviewOnToday: "Revisar en Hoy",
  signOut: "Cerrar sesión",
  skipToMain: "Saltar al contenido principal",
  turnOffPractice: "Desactivar el modo de práctica",
  yourOfflineRequest: "Su pedido sin conexión",
};

export { shell };

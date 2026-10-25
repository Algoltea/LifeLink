import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "Agregar a una persona",
  contactFallback: "Contacto",
  edit: "Editar",
  editPerson: (name) => `Editar a ${name}`,
  empty:
    "Agregue a alguien de confianza. Puede escribirle y elegir qué puede ver en LifeLink. Agregar a una persona no comparte nada por sí solo.",
  keep: "Conservar",
  loadingPeople: "Cargando personas",
  message: "Escribir",
  people: "Personas",
  peopleCount: (count) => (count === 1 ? "1 persona" : `${count} personas`),
  permissions: "Permisos",
  permissionsFor: (name) => ` de ${name}`,
  practiceContact: "Contacto de práctica",
  reachNone: "Todavía no hay forma de comunicarse",
  reachTelegramWaiting: "Telegram: esperando a que toque Iniciar",
  reachWhatsappSaved: "WhatsApp guardado. Todavía no se puede escribir",
  reachedBy: {
    discord: "Por Discord",
    email: "Por correo",
    imessage: "Por iMessage",
    in_app: "En LifeLink",
    telegram: "Por Telegram",
  },
  removeConfirm: (firstName) => `Quitar a ${firstName}`,
  removeDescription: (name) =>
    `Se quitará a ${name}, y todo lo que comparte con esta persona se detiene de inmediato.`,
  removeFailed: (error) =>
    `No se pudo quitar a la persona. ${error} Pulse Quitar otra vez.`,
  removeFallback: "Quitar",
  removeNamed: (firstName) => `Quitar a ${firstName}…`,
  removePerson: "Quitar a esta persona…",
  removeStopsSharing: (firstName) =>
    `Si quita a ${firstName}, también se detiene todo lo que comparte con esta persona.`,
  removeTitle: (name) => `¿Quitar a ${name}?`,
  removed: (name) => `Se quitó a ${name}.`,
  removing: "Quitando…",
  subline:
    "Las personas en quienes confía, cómo comunicarse con ellas y exactamente qué puede ver cada una.",
  title: "Círculo de confianza",
  trusted: "De confianza",
};

export { circle };

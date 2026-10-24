import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "Agregar a una persona de confianza",
  call: "Llamar",
  callAria: (name) => `Llamar a ${name}`,
  callHelpMessage:
    "Recibí una llamada que me genera dudas. ¿Me ayudas a revisar si es real antes de compartir algo o enviar dinero?",
  callsLoading:
    "Las llamadas no están disponibles hasta que carguen los ajustes de su cuenta.",
  callsPractice: "Las llamadas no están disponibles en el modo de práctica.",
  contactFallback: "Contacto",
  empty:
    "Una segunda opinión puede ayudar. Agregue a alguien que conozca a su ",
  emptyRest:
    " para pedirle ayuda con esta revisión. Usted revisará cualquier mensaje antes de que se envíe.",
  failed: (name, error) =>
    `No se pudo preparar el mensaje para ${name}. ${error} No se envió nada. Pulse Preparar mensaje otra vez.`,
  introCall:
    "Prepare un mensaje para pedir ayuda con la llamada. Puede leerlo y cambiarlo antes de aprobarlo. Todavía no se envía nada.",
  introCheck:
    "Prepare un mensaje para pedirle a alguien que le ayude con esta revisión. Puede leerlo y cambiarlo antes de aprobarlo. Todavía no se envía nada.",
  list: "Personas de confianza",
  loading: "Cargando personas de confianza",
  noMessageAddress: "No hay dirección para escribirle",
  noPhone: "No hay número de teléfono guardado. ",
  noWayToMessage: "No hay forma de escribirle guardada. ",
  prepare: "Preparar mensaje",
  prepareAria: (name) => `Preparar un mensaje para ${name}`,
  preparing: "Preparando…",
  reachedBy: {
    discord: "Por mensaje",
    email: "Por correo",
    imessage: "Por mensaje",
    in_app: "En LifeLink",
    telegram: "Por mensaje",
  },
  saveDetails: "Guarde sus datos de contacto en su ",
  trustedCircle: "Círculo de confianza",
  unavailable: "Llamar y Preparar mensaje no están disponibles ahora.",
};

export { trustedPeople };

import type { Messages } from "../en";

const today: Messages["today"] = {
  addPostalCode: "Agregue su código postal",
  allEmail: "Todo el correo",
  allMessages: "Todos los mensajes",
  appointment: "Cita",
  check: "Revisar",
  checkPostalCode: "Revise su código postal",
  connect: "Conectar",
  connectMailbox: "Conecte Gmail u Outlook para ver aquí su correo nuevo.",
  couldNotFindTown: "No pudimos encontrar su ciudad",
  dismissFailed: (error) => `${error} Pulse Listo para intentarlo de nuevo.`,
  fromFamily: "De familiares y amigos",
  gettingStarted: "Para empezar",
  gettingStartedHint: "Cada paso se marca como hecho cuando lo termina.",
  hideSteps: "Ocultar estos pasos",
  latestEmail: "Correo reciente",
  loadingBriefing: "Cargando su resumen",
  loadingToday: "Cargando el día de hoy",
  messages: "Mensajes",
  messagesFrom: (names) =>
    `Tiene mensajes de ${names} de los últimos dos días.`,
  newMessage: "Mensaje nuevo",
  news: "Noticias",
  newsGood: "Buenas noticias",
  newsMoreFrom: (source) => `Más de ${source}`,
  newsOpensNewTab: ", se abre en una pestaña nueva",
  newsSourceFrom: ", de ",
  newsTop: "Noticias principales",
  newsType: "Tipo de noticias",
  newsUnavailable:
    "Las noticias no están disponibles ahora. Por favor, inténtelo más tarde.",
  nextAppointment: (title, when, time) =>
    `Su próxima cita es ${title} ${when} a las ${time}.`,
  noAppointments: "No tiene citas programadas esta semana.",
  noEmail: "No hay correo nuevo.",
  noMessages: "No hay mensajes nuevos de los últimos dos días.",
  noSubject: "Sin asunto",
  nothingBooked: "No hay nada programado esta semana.",
  onDay: (day) => `el ${day}`,
  openForDetails: "Abrir para ver detalles",
  possibleScam: "Posible estafa",
  readMyDay: "Leer mi día en voz alta",
  reminder: "Recordatorio",
  remindersDue: (count) =>
    count === 1
      ? "Tiene 1 recordatorio pendiente."
      : `Tiene ${count} recordatorios pendientes.`,
  rideConfirmed: (name) => `Viaje con ${name}, confirmado`,
  seeWeather: "Vea el tiempo para sus citas",
  steps: {
    askAction: "Pregúntele a LifeLink",
    askDescription:
      "Pruebe con «Recuérdame regar las plantas a las cinco». Usted revisará todo antes de que suceda.",
    askTitle: "Pida una mano",
    emailAction: "Conectar el correo",
    emailDescription:
      "LifeLink lo lee con usted y le señala cualquier cosa que parezca una estafa.",
    emailTitle: "Conecte su correo",
    locationAction: "Agregar código postal",
    locationDescription:
      "LifeLink muestra el tiempo en Hoy y junto a cada cita.",
    locationTitle: "Agregue su código postal",
    trustedAction: "Agregar a alguien",
    trustedDescription:
      "Elija quién puede ayudarle con los viajes y qué puede ver. Usted tiene el control.",
    trustedTitle: "Agregue a alguien de confianza",
  },
  title: "Hoy",
  titlePrefix: "Hoy: ",
  todayLower: "hoy",
  tomorrowLower: "mañana",
  weatherHigh: ", máxima ",
  weatherPrefix: ", el tiempo: ",
  yourWeek: "Su semana",
};

export { today };

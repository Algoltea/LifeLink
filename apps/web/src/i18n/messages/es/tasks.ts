import type { Messages } from "../en";

const tasks: Messages["tasks"] = {
  alsoWaiting: "También le espera",
  answerFirst: "Primero responda la pregunta de arriba.",
  approve: {
    calendar_event: "Aprobar y agregarlo",
    confirm_arrangement: "Confirmar el viaje",
    create_reminder: "Guardar el recordatorio",
    drive_note: "Aprobar y guardarlo",
    email_draft: "Aprobar y guardar el borrador",
    family_update: "Compartir la novedad",
    grocery_handoff: "Aprobar el pedido",
    send_message: "Aprobar y enviar",
  },
  approveAgain:
    "Algo cambió después de que usted aprobó, así que por favor revíselo y apruébelo otra vez.",
  approvedWaiting: "Aprobado. Esperando para empezar…",
  approving: "Aprobando…",
  askAgainIfChanged:
    "Si algo cambia después de aprobar, como la hora o a quién va dirigido, LifeLink le volverá a preguntar.",
  backToToday: "Volver a Hoy",
  breadcrumb: "Ruta de navegación",
  cancelEditing: "Dejar de editar",
  cancelRequest: "Cancelar este pedido",
  cancelled: "Usted canceló esto. No se envió nada.",
  cancelling: "Cancelando…",
  changeWords: "Cambiar las palabras",
  changesSaved:
    "Cambios guardados. Revise el mensaje actualizado antes de aprobarlo.",
  checkNow: "Revisar ahora",
  checkedForYou: "Lo que revisamos por usted",
  checking: "Revisando…",
  checks: {
    appointment: (title, day, time) =>
      `El día y la hora coinciden con ${title} el ${day} a las ${time}.`,
    contact: (name, relationship) =>
      `${name} está en sus contactos (${relationship}).`,
    hasLink: "Este mensaje tiene un enlace. Asegúrese de que quería incluirlo.",
    noLinks: "El mensaje no tiene enlaces.",
    nothingUnclear: "No hay dudas sobre a quién ni cuándo.",
    trusted: "de confianza",
  },
  couldNotTell:
    "No pudimos saberlo desde aquí. Por favor, verifíquelo (por ejemplo, pregúntele a la persona) y díganos:",
  detailsChanged:
    "Los detalles cambiaron mientras editaba. Sus cambios se conservan aquí. Compárelos con la redacción más reciente antes de guardar.",
  detailsGone: "Estos detalles ya no están disponibles.",
  didNotGoThrough: "Esto no se completó.",
  done: "Hecho",
  earlierVersionHide: "Ocultar la versión anterior",
  earlierVersionShow: "Mostrar la versión anterior",
  goToCircle: "Ir a Círculo de confianza",
  heading: {
    approveSubline: "No pasa nada hasta que usted lo apruebe.",
    approveTitle: "Revise esto y luego apruébelo",
    completedSubline: "Todo lo de esto está hecho.",
    confirmSubline: (who) =>
      `${who} respondió. Revise la hora y luego confirme.`,
    confirmTitle: "Confirmar el viaje",
    sendSubline: (who) =>
      `No le llega nada a ${who} hasta que pulse Aprobar. Puede cambiar las palabras antes.`,
    sendTitle: "Lea esto antes de enviarlo",
    standsSubline: "Así va esto.",
    waitingSubline: (who) =>
      `Su mensaje se envió. Le mostraremos aquí la respuesta de ${who} en cuanto llegue.`,
    waitingTitle: (who) => `Esperando a ${who}`,
  },
  howItWent: "Cómo salió",
  inProgress: "En curso",
  itArrived: "Sí llegó",
  itDidNotArrive: "No llegó",
  keepMyEdits: "Conservar mis cambios",
  latestWording: "Ver la redacción más reciente",
  loadingDetails: "Cargando los detalles de la tarea",
  loadingLatest: "Cargando los detalles más recientes",
  loadingRequest: "Cargando los detalles del pedido",
  messageText: "Texto del mensaje",
  messages: "Mensajes",
  noLongerEditable:
    "Este pedido ya no se puede editar. Sus palabras sin guardar se conservan aquí para que pueda copiarlas.",
  notFound: "No se encontró.",
  notSure: "No estamos seguros de que esto se haya completado.",
  notSureDetail:
    "El servicio no confirmó lo que pasó. LifeLink lo deja marcado como incierto para que no se confunda con un reintento seguro.",
  nothingNeedsYou: "Ahora no hay nada que necesite de usted.",
  nothingToApprove: "No hay nada que aprobar aquí.",
  nothingToApproveRequest: "No hay nada que aprobar en este pedido.",
  nothingWasSent:
    "No se envió nada, así que puede intentarlo de nuevo sin problema.",
  offlineApprovalFailed:
    "Esta aprobación no se pudo guardar sin conexión. Por favor, apruébelo otra vez cuando tenga conexión.",
  offlineApprovalSaved:
    "Guardado para cuando vuelva a tener conexión. LifeLink revisará todo otra vez antes de enviarlo.",
  openReceipt: "Abrir el recibo",
  outcomeError: (error) => `${error} Por favor, inténtelo de nuevo.`,
  practiceApproval:
    " Modo de práctica: al aprobar se muestra lo que pasaría; no se envía nada de verdad.",
  progress: "Progreso",
  progressAndNext: "Progreso y siguientes pasos",
  recordedOutcome: "Resultado registrado",
  reminderShare: "Que mi círculo de confianza vea este recordatorio",
  reminderShareAria: "Compartir este recordatorio con mi círculo de confianza",
  reminderShareHint: "Solo las personas con quienes comparte recordatorios.",
  replied: (who) => `${who} respondió`,
  reviewStatus: {
    approved: "Aprobado",
    awaiting_approval: "Revise estos detalles",
    cancelled: "Cancelado",
    executing: "En curso",
    failed: "No se completó",
    succeeded: "Completado",
    unknown: "Resultado sin confirmar",
  },
  savedApproveAgain:
    "Guardado. Como cambiaron las palabras, por favor apruébelo otra vez.",
  savingOutcome: "Guardando lo que pasó…",
  seeDetails: "Ver los detalles",
  sentStatus: {
    sent: "enviado",
  },
  sentWaiting:
    "Su mensaje se envió. Le mostraremos la respuesta en cuanto llegue.",
  shoppingRetired: "Los pedidos de compras ya no se pueden aprobar.",
  spectrumUnknown:
    "Todavía no podemos confirmar este mensaje. Pregúntele a la persona si le llegó. Si aún no le llegó, puede que llegue más tarde; LifeLink mantendrá su estado como incierto.",
  status: {
    awaiting_approval: "Le toca a usted",
    cancelled: "Cancelado",
    completed: "Completado",
    in_progress: "En eso estamos",
    needs_attention: "Necesita un vistazo",
    needs_clarification: "Una pregunta para usted",
    waiting_for_reply: "Esperando respuesta",
  },
  stepByStep: "Paso a paso",
  steps: {
    awaiting_approval: "Le necesita",
    failed: "No funcionó",
    pending: "Más tarde",
    running: "En eso estamos",
    skipped: "No hizo falta",
    succeeded: "Hecho",
    unknown: "No es seguro que se haya completado",
    waiting: "Esperando",
  },
  them: "esa persona",
  they: "Esa persona",
  unclearReply: (who) =>
    `No pudimos saber con seguridad qué quiso decir ${who}. ¿Dijo que sí?`,
  useLatestWords: "Usar las palabras más recientes",
  version: (version, status) => `Versión ${version} · ${status}`,
  wentNotThrough: "No se completó. Puede intentarlo de nuevo.",
  wentThrough: "Se completó.",
  whoCan: (who) => `Sí, ${who} puede`,
  whoCannot: (who) => `No, ${who} no puede`,
  workingNow: "Trabajando en esto ahora…",
  youSent: "Usted envió",
};

export { tasks };

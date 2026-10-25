import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "Acordado",
  agreedSpoken: (text) => `Acordado: ${text}`,
  changedNote:
    "Algunos detalles que dio el asistente no estaban en los mensajes palabra por palabra, o eran ofrecimientos y no acuerdos, así que se cambiaron o se dejaron fuera.",
  close: "Cerrar el resumen",
  cloud:
    "Resumen con IA en la nube, pedido con su permiso. Cada cita se comparó con los mensajes.",
  cloudConsent:
    "Usar el asistente en la nube para un resumen más completo. Sus mensajes recientes con esta persona se envían al proveedor de IA. Déjelo sin marcar para un resumen rápido hecho en LifeLink.",
  done: "Hecho",
  doneFromRecords:
    "Según los registros de LifeLink, no según lo que dicen los mensajes.",
  inShort: "En pocas palabras",
  intro: (contactName) =>
    `LifeLink puede resumir lo que usted y ${contactName} acordaron, lo que solo se ofreció y lo que sigue pendiente.`,
  loading: "Cargando el resumen",
  local: {
    chosen:
      "Resumen rápido hecho en LifeLink: se encontró por patrones, sin comprensión completa. No se envió nada a un proveedor de IA.",
    failed:
      "Resumen rápido hecho en LifeLink. Usted pidió un resumen en la nube, pero no terminó. Puede que el proveedor ya haya recibido estos mensajes.",
    limit:
      "Resumen rápido hecho en LifeLink. Se alcanzó el límite de hoy para resúmenes en la nube, así que no se envió nada más.",
    practice:
      "Práctica: un resumen rápido hecho en LifeLink. Los mensajes de práctica nunca se envían a un proveedor de IA.",
    unavailable:
      "Resumen rápido hecho en LifeLink. El asistente en la nube no está configurado, así que no se envió nada a un proveedor de IA.",
  },
  messageTo: (contactName) => `Mensaje para ${contactName}`,
  nextSteps: "Posibles siguientes pasos",
  nextStepsHint:
    "No pasa nada hasta que usted prepare un paso, lo revise y lo apruebe.",
  noFinishedTasks: (contactName) =>
    `LifeLink no tiene tareas terminadas con ${contactName} de este tiempo. Lo que dice un mensaje no cuenta como hecho.`,
  offerNote:
    "Un ofrecimiento no es un acuerdo hasta que la otra persona dice que sí.",
  offered: "Ofrecido, aún sin acordar",
  offeredSpoken: (text) => `Ofrecido, aún sin acordar: ${text}`,
  onlyYou:
    "Solo usted puede ver esto. Nunca se envía ni se comparte con la familia.",
  part: "Parte",
  practiceNote:
    "En el modo de práctica, LifeLink hace el resumen por su cuenta. Los mensajes de práctica nunca se envían a un proveedor de IA.",
  prepare: "Preparar para revisar",
  prepared: "Preparado. Revisarlo",
  readAloud: "Leer el resumen en voz alta",
  reading: "Leyendo la conversación…",
  recapAgain: "Resumir otra vez",
  recapThis: "Resumir esta conversación",
  recapWithCloud: "Resumir con IA en la nube",
  reminderForYou: "Un recordatorio para usted",
  stillUnclear: "Aún no está claro",
  title: (contactName) => `Resumen con ${contactName}`,
  unclearSpoken: (text) => `Aún no está claro: ${text}`,
  you: "Usted",
};

export { recap };

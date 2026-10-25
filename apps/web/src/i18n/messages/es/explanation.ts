import type { explanation as englishExplanation } from "../en/explanation";

const explanation: typeof englishExplanation = {
  close: "Cerrar la explicación",
  cloud: "Explicado con IA en la nube. Cada cita se comparó con el mensaje.",
  dateSpoken: (quote, date) =>
    `Fecha mencionada: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Fechas y horas mencionadas",
  droppedNote:
    "Algunos detalles que dio el asistente no estaban en el mensaje palabra por palabra, así que se muestran como suposiciones o se dejan fuera.",
  facts: "Lo que dice el mensaje",
  guessNote: "Estas son suposiciones, no algo que diga el mensaje.",
  guessSpoken: (text) => `Una suposición: ${text}`,
  guesses: "Lo que podría significar",
  local: {
    chosen:
      "Lectura local: se encontró por patrones, sin comprensión completa. No se envió nada a un proveedor de IA.",
    failed:
      "Lectura local. Usted pidió una lectura en la nube, pero no terminó. Puede que el proveedor ya haya recibido este mensaje.",
    limit:
      "Lectura local. Se alcanzó el límite de hoy para lecturas en la nube, así que no se envió nada más.",
    practice:
      "Práctica: explicado en LifeLink. Los mensajes de práctica nunca se envían a un proveedor de IA.",
    unavailable:
      "Lectura local. El asistente en la nube no está configurado, así que no se envió nada a un proveedor de IA.",
  },
  localLanguageNotice:
    "Las explicaciones locales basadas en reglas están en inglés y aún no se han traducido. Una explicación en la nube puede escribirse en el idioma que usted eligió. Las citas del mensaje original se mantienen sin cambios.",
  missing: "Lo que aún no se ha dicho",
  missingSpoken: (detail) => `Aún no se ha dicho: ${detail}`,
  moreDetail: "Más detalles",
  onlyYou: "Solo usted puede ver esto.",
  part: "Parte",
  reading: "Leyendo el mensaje…",
  replies: "Posibles respuestas",
  repliesHint:
    "No se envía nada. Una respuesta se coloca en su cuadro de mensaje, donde puede cambiarla y revisarla antes de que pase algo.",
  replyLabelFor: (label) => `Usar esta respuesta: ${label}`,
  requestSpoken: (text, quote) =>
    `Le piden: ${text} En sus propias palabras: ${quote}.`,
  requests: "Lo que le piden",
  title: "Ayuda para entender este mensaje",
};

export { explanation };

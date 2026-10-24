import type { explanation as englishExplanation } from "../en/explanation";

const explanation: typeof englishExplanation = {
  close: "Cerrar la explicación",
  cloud:
    "Lectura con IA en la nube, pedida con su permiso. Cada cita se comparó con el mensaje.",
  cloudConsent:
    "Usar el asistente en la nube para una explicación más completa. El texto del mensaje se envía al proveedor de IA. Déjelo sin marcar para una lectura local.",
  cloudConsentWithNotes:
    "Usar el asistente en la nube para una explicación más completa. El texto del mensaje y sus notas sobre cómo le gusta recibir ayuda se envían al proveedor de IA. Déjelo sin marcar para una lectura local.",
  dateSpoken: (quote, date) =>
    `Fecha mencionada: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Fechas y horas mencionadas",
  droppedNote:
    "Algunos detalles que dio el asistente no estaban en el mensaje palabra por palabra, así que se muestran como suposiciones o se dejan fuera.",
  explainAgainWithCloud: "Explicar otra vez con IA en la nube",
  explainThis: "Explicar este mensaje",
  explainWithCloud: "Explicar con IA en la nube",
  facts: "Lo que dice el mensaje",
  guessNote: "Estas son suposiciones, no algo que diga el mensaje.",
  guessSpoken: (text) => `Una suposición: ${text}`,
  guesses: "Lo que podría significar",
  inPlainWords: "En palabras sencillas",
  intro:
    "LifeLink puede decir qué pide este mensaje, qué fechas menciona y qué información falta.",
  loading: "Cargando la explicación",
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
  onlyYou:
    "Solo usted puede ver esto. Nunca se envía ni se comparte con la familia.",
  part: "Parte",
  practiceNote:
    "En el modo de práctica, LifeLink lee el mensaje localmente. Los mensajes de práctica nunca se envían a un proveedor de IA.",
  readAloud: "Leer la explicación en voz alta",
  readReply: "Leer esta respuesta en voz alta",
  reading: "Leyendo el mensaje…",
  replies: "Posibles respuestas",
  repliesHint:
    "No se envía nada. Una respuesta se coloca en su cuadro de mensaje, donde puede cambiarla y revisarla antes de que pase algo.",
  requestSpoken: (text, quote) =>
    `Le piden: ${text} En sus propias palabras: ${quote}.`,
  requests: "Lo que le piden",
  title: "Ayuda para entender este mensaje",
  useReply: "Usar esta respuesta",
  useReplyLabel: (label) => `Usar esta respuesta: ${label}`,
};

export { explanation };

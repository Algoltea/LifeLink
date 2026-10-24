import type { voice as english } from "../en/voice";

const voice: typeof english = {
  captions: "Subtítulos",
  connectionProblem: "Hubo un problema con la conexión de voz.",
  dictationStopped:
    "El dictado se detuvo. Inténtalo de nuevo o escribe en su lugar.",
  emptyRequest: "No se preparó nada porque la solicitud estaba vacía.",
  inputLabel: "¿Con qué necesitas ayuda?",
  lifeLinkSaid: "LifeLink dijo: ",
  listening:
    "Escuchando. Tus palabras aparecerán en el cuadro; pulsa Enviar cuando estén bien.",
  microphoneBusy:
    "Otra aplicación está usando el micrófono. Ciérrala e inténtalo de nuevo o escribe en su lugar.",
  microphoneDenied:
    "LifeLink no tiene permiso para usar el micrófono. Permítelo en la configuración de este sitio en tu navegador o escribe en su lugar.",
  microphoneFailed:
    "El micrófono no se inició. Inténtalo de nuevo o escribe en su lugar.",
  microphoneMissing:
    "No se encontró un micrófono. Comprueba que haya uno conectado o escribe en su lugar.",
  network:
    "El dictado necesita una conexión a internet en este momento. Escribe en su lugar.",
  noSpeech:
    "No escuché nada. Pulsa Hablar e inténtalo de nuevo, un poco más cerca del micrófono.",
  offlineFailed:
    "No pudimos guardar esta solicitud sin conexión. Tus palabras siguen aquí. Inténtalo de nuevo cuando tengas conexión.",
  opening: "Abriendo un espacio para tu mensaje",
  placeholder: "Pregúntale a LifeLink…",
  prepareFailed:
    "No se pudo preparar. Pídele que lo intente de nuevo o que lo escriba.",
  prepared:
    "Preparado. Ya está en pantalla; no pasa nada hasta que se apruebe allí.",
  retry:
    "Tus palabras siguen en el cuadro. Pulsa Enviar para intentarlo de nuevo.",
  savedOffline:
    "Guardado. LifeLink revisará esto cuando vuelvas a tener conexión.",
  screeningConnectionProblem:
    "Hubo un problema con la conexión de la revisión de llamadas.",
  screeningDisconnected: "Se desconectó la revisión de llamadas.",
  screeningLost: "La revisión de llamadas perdió la conexión.",
  screeningMicrophoneStopped:
    "El micrófono se detuvo. Inicia de nuevo la revisión de llamadas para reconectarte.",
  screeningResumeFailed:
    "La revisión de llamadas no pudo reanudarse después de la alerta. Iníciala de nuevo.",
  screeningStopped: "Se detuvo la revisión de llamadas.",
  send: "Enviar",
  sending: "Enviando",
  serviceDenied:
    "El dictado está desactivado en este navegador. Escribe en su lugar.",
  speak: "Hablar",
  speakHint:
    "Pulsa Hablar para hablar en vez de escribir. No se envía nada hasta que lo apruebes.",
  speaking: "LifeLink está hablando…",
  startFailed: (error: string) =>
    `La voz no se inició: ${error} Puedes escribir en su lugar.`,
  stop: "Detener",
  talking:
    "Hablando con LifeLink. Todo lo que prepare aparecerá en pantalla para que lo apruebes.",
  unavailable:
    "La voz no está disponible en este navegador. Escribe tu solicitud. No se envía nada hasta que lo apruebes.",
  voiceStopped: "Se detuvo la voz.",
  youSaid: "Dijiste: ",
};

export { voice };

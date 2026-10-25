import type { voice as english } from "../en/voice";

const voice: typeof english = {
  connecting: "Conectando…",
  connectionProblem: "Hubo un problema con la conexión de voz.",
  dictationStopped:
    "El dictado se detuvo. Inténtelo de nuevo o escriba en su lugar.",
  emptyRequest: "No se preparó nada porque la solicitud estaba vacía.",
  inputLabel: "¿Con qué necesita ayuda?",
  listening: "Escuchando…",
  microphoneBusy:
    "Otra aplicación está usando el micrófono. Ciérrela e inténtelo de nuevo o escriba en su lugar.",
  microphoneDenied:
    "LifeLink no tiene permiso para usar el micrófono. Permítalo en la configuración de este sitio en su navegador o escriba en su lugar.",
  microphoneFailed:
    "El micrófono no se inició. Inténtelo de nuevo o escriba en su lugar.",
  microphoneMissing:
    "No se encontró un micrófono. Compruebe que haya uno conectado o escriba en su lugar.",
  offlineFailed:
    "No pudimos guardar esta solicitud sin conexión. Sus palabras siguen aquí. Inténtelo de nuevo cuando tenga conexión.",
  opening: "Abriendo un espacio para su mensaje",
  placeholder: "Pregúntele a LifeLink…",
  prepareFailed:
    "No se pudo preparar. Pídale que lo intente de nuevo o que lo escriba.",
  prepared:
    "Preparado. Ya está en pantalla; no pasa nada hasta que se apruebe allí.",
  preparing: "Preparando su solicitud…",
  readAloudUnavailable:
    "La lectura en voz alta no está disponible. Inténtelo de nuevo.",
  retry:
    "Sus palabras siguen en el cuadro. Pulse Enviar para intentarlo de nuevo.",
  savedOffline:
    "Guardado. LifeLink revisará esto cuando vuelva a tener conexión.",
  screeningConnectionProblem:
    "Hubo un problema con la conexión de la revisión de llamadas.",
  screeningDisconnected: "Se desconectó la revisión de llamadas.",
  screeningLost: "La revisión de llamadas perdió la conexión.",
  screeningMicrophoneStopped:
    "El micrófono se detuvo. Inicie de nuevo la revisión de llamadas para volver a conectarse.",
  screeningResumeFailed:
    "La revisión de llamadas no pudo reanudarse después de la alerta. Iníciela de nuevo.",
  screeningStopped: "Se detuvo la revisión de llamadas.",
  send: "Enviar",
  sending: "Enviando",
  speak: "Hablar",
  speakHint:
    "Pulse Hablar para hablar en vez de escribir. No se envía nada hasta que lo apruebe.",
  speaking: "LifeLink está hablando…",
  startFailed: (error: string) =>
    `La voz no se inició: ${error} Puede escribir en su lugar.`,
  stop: "Detener",
  unavailable:
    "La voz no está disponible ahora. Escriba su solicitud. No se envía nada hasta que lo apruebe.",
  voiceStopped: "Se detuvo la voz.",
};

export { voice };

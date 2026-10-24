import type { callScreening as english } from "../en/call-screening";

const callScreening: typeof english = {
  alertOff: "El sonido de alerta está desactivado",
  alertPlayed: "La alerta sonó en voz alta",
  alertPlaying: "La alerta está sonando",
  alertReady: "Alerta lista",
  alertUnavailable:
    "No se pudo reproducir el sonido. Lea el aviso en pantalla.",
  askTrusted: "Pida ayuda a alguien de confianza",
  bigger: "Texto más grande",
  callCaptions: "Lo que se escuchó en la llamada",
  callTime: "desde el inicio de la llamada",
  callback:
    "Si algo le pareció sospechoso, cuelgue y llame a la persona o empresa a un número que ya conozca y en el que confíe.",
  callbackAdvice:
    "Si algo le pareció sospechoso, cuelgue y vuelva a llamar a un número en el que confíe.",
  caller: "Quien llama",
  cannotConfirm: "Esto no permite confirmar quién llamó.",
  captionSize: "Tamaño de los subtítulos",
  captionSource: "Basado en subtítulos que pueden contener errores.",
  captions: "Subtítulos",
  captionsEmpty: "Las palabras de la llamada aparecerán aquí.",
  captionsNotSaved:
    "Se muestran hasta que salga de esta página. No se guardan.",
  checkMessage: "Revisar un mensaje",
  checkingLastPart:
    "Revisando la última parte de la llamada en busca de señales de alerta…",
  checksUnavailable:
    "Las revisiones de señales de alerta no están disponibles en este momento. Las palabras de la llamada siguen apareciendo abajo.",
  clearTitle: "No se escucharon señales de alerta",
  close: "Cerrar",
  codes: "solicitudes de códigos, contraseñas o datos personales",
  connectionError:
    "La conexión de escucha se interrumpió. Los subtítulos siguen aquí. Pulse Volver a empezar para seguir escuchando o Terminar para guardar un resumen.",
  consent:
    "Entiendo que el audio y las palabras de la llamada se enviarán a servicios de IA en la nube mientras esta revisión esté activa.",
  credentialsReason:
    "Una solicitud de compartir un código de verificación o una contraseña.",
  delete: "Eliminar el resumen",
  deleteError: "No se pudo eliminar el resumen. Vuelva a intentarlo.",
  deleteNotice:
    "Eliminar este resumen no elimina los mensajes que haya preparado o enviado.",
  deleting: "Eliminando…",
  discard: "Descartar el resumen",
  earlierAria: "Revisiones anteriores de llamadas",
  finish: "Terminar",
  finishSave: "Terminar y guardar el resumen",
  flagged: "Lo que señaló LifeLink",
  flaggedAdvice:
    "No comparta códigos ni envíe dinero. Cuelgue y vuelva a llamar a un número que ya conozca y en el que confíe.",
  flaggedBody: "Quien llamó pidió cosas que suelen pedir los estafadores.",
  flaggedTitle: (count: number): string =>
    count === 1
      ? "Se escuchó 1 señal de alerta"
      : `Se escucharon ${count} señales de alerta`,
  gettingReady: "Preparando…",
  guideCaution:
    "Puede pasar por alto señales de alerta. Si una llamada le parece sospechosa, cuelgue y llame a un número que ya conozca y en el que confíe.",
  guideTitle: "LifeLink puede avisarle en voz alta sobre:",
  hangUpFirst: "Está bien decir «Te llamaré después» y colgar primero.",
  heard: "Lo que escuchó LifeLink",
  heardText: (heardWords: number | undefined): string => {
    if (heardWords === undefined) {
      return "Nada de lo que escuchó LifeLink coincidió con una solicitud habitual de los estafadores.";
    }

    const words =
      heardWords === 1 ? "1 palabra" : `unas ${heardWords} palabras`;

    return `LifeLink escuchó ${words}. Ninguna coincidió con una solicitud habitual de los estafadores.`;
  },
  help: "Acabo de recibir una llamada que me genera dudas. ¿Podrías ayudarme a comprobar si era auténtica antes de que comparta algo o envíe dinero?",
  interrupted:
    "La conexión se interrumpió durante esta revisión. Solo se revisaron las partes que LifeLink escuchó.",
  intro:
    "LifeLink muestra las palabras de la llamada en pantalla, usa IA para revisarlas en busca de señales de estafa y le avisa en voz alta si encuentra alguna.",
  languageLimit:
    "Las llamadas en vivo usan IA en la nube. Las revisiones locales de texto siguen usando patrones en inglés; traducir la interfaz no amplía su capacidad de detección. El guion de práctica y la alerta de voz están en inglés. Los subtítulos y las citas se mantienen en su idioma original.",
  listenTitle: "Escuchar una llamada",
  listening: "LifeLink está escuchando",
  liveCall: "Llamada en vivo",
  messageReview: "Mensaje para revisar",
  mixedVoices:
    "Estos subtítulos mezclan ambas voces y pueden contener errores.",
  money: "solicitudes de dinero o tarjetas de regalo",
  moneyReason: "Una solicitud de enviar dinero o pagar con tarjetas de regalo.",
  mute: "Silenciar la alerta",
  noWarnings: "No se detectaron señales de alerta",
  noWarningsYet: " · No se han detectado señales de alerta hasta ahora",
  notConfigured:
    "Las revisiones de llamadas en vivo aún no están configuradas. Puede probar una llamada de práctica o escribir las palabras de quien llama.",
  notSafe:
    "Esto no significa que la llamada fuera segura. LifeLink puede pasar por alto señales de alerta y no puede verificar quién llamó.",
  openStep: "Mantenga esta pantalla abierta mientras habla.",
  otherDevice:
    "Si su teléfono no puede usar el micrófono durante una llamada, abra LifeLink en otro dispositivo.",
  outcomeLabels: {
    clear: "No se detectaron señales de alerta",
    flagged: "Se detectaron señales de alerta",
    silent: "No se escuchó nada",
    unchecked: "No se revisó por completo",
  },
  partlyChecked:
    "No se pudo revisar parte de esta llamada, así que podría haber más señales de alerta.",
  paused:
    "La escucha se pausa mientras suena la alerta para no captar su propio aviso.",
  permissionDenied:
    "No se permitió el acceso al micrófono. Permítalo en la configuración del sitio en su navegador y vuelva a intentarlo. También puede probar una llamada de práctica.",
  phoneCall: "Llamada telefónica",
  potentialScam: "Posible estafa.",
  practice: "Práctica",
  practiceCall: "Llamada de práctica",
  practiceCaptionSource:
    "Estas son las palabras del guion de la llamada de práctica.",
  practiceCaptions: "Lo que se está diciendo",
  practiceExplanation:
    "Esta llamada es ficticia. No se usa micrófono ni IA en la nube.",
  practiceFlaggedBody:
    "En la llamada de práctica se pidieron cosas que suelen pedir los estafadores.",
  practiceHeard: "Lo que se dijo en la llamada de práctica",
  practiceHelp:
    "Probé la llamada de práctica de LifeLink sobre estafas. ¿Podemos hablar de qué hacer si recibo una llamada así?",
  practiceMode:
    "El modo de práctica está activado. Pruebe la llamada ficticia de abajo sin usar el micrófono.",
  practicePlaying: "Reproduciendo la llamada de práctica",
  practicePrivacy:
    "No se usa micrófono ni IA en la nube. Se guarda un breve resumen en Revisiones anteriores.",
  practiceSaved:
    "La llamada de práctica no usa micrófono ni IA en la nube. Su breve resumen se guarda en Revisiones anteriores.",
  practiceSilentBody:
    "La llamada de práctica terminó antes de que se reprodujera ninguna palabra, así que no hubo nada que revisar.",
  practiceSilentTitle: "La práctica se detuvo antes de tiempo",
  practiceSource: "Basado en el guion de práctica.",
  practiceSummary: "Resumen de la llamada de práctica",
  practiceTime: "transcurridos",
  practiceVoices:
    "Las voces de práctica están identificadas. Los subtítulos de llamadas reales mezclan ambas voces y no las identifican.",
  privacy:
    "LifeLink no graba las llamadas. El audio del micrófono se envía a Gemini de Google para generar los subtítulos, y los subtítulos se envían a un modelo de IA que los revisa en busca de señales de alerta. Al detener la revisión, LifeLink guarda un breve resumen de las señales de alerta, no los subtítulos.",
  protect:
    "No comparta códigos, contraseñas ni dinero. Pida ayuda a alguien de confianza.",
  quoteNotice:
    "Las citas pueden contener errores. Los números largos están ocultos.",
  readResult: "Leer el resultado en voz alta",
  remote: "solicitudes para controlar su computadora o teléfono",
  remoteReason: "Una solicitud de permitir el acceso remoto a un dispositivo.",
  retrySave: "Volver a intentar guardar",
  retrySteps: [
    "Ponga la llamada telefónica en altavoz.",
    "Mantenga el teléfono cerca de este dispositivo.",
    "Vuelva a iniciar la revisión de llamadas antes de contestar.",
  ],
  retryTitle: "Para volver a intentarlo",
  review: "Revisar",
  saveError:
    "No se pudo guardar el resumen. Mantenga esta página abierta y vuelva a intentarlo.",
  saving: "Guardando su resumen…",
  scamWarning: "Esto parece una estafa.",
  screenAnotherCall: "Revisar otra llamada",
  secrecyReason:
    "Una solicitud de guardar un secreto mientras le presionan para actuar con urgencia.",
  silentBody:
    "LifeLink no recibió ninguna voz, así que no pudo revisar esta llamada en busca de señales de alerta.",
  silentTitle: "LifeLink no escuchó la llamada",
  smaller: "Texto más pequeño",
  soundUnavailable:
    "El sonido no está disponible. Las señales de alerta seguirán apareciendo en pantalla.",
  speakerStep: "Ponga la llamada en altavoz cerca de este dispositivo.",
  start: "Empezar a escuchar",
  startAgain: "Volver a empezar",
  startError:
    "LifeLink no pudo empezar a escuchar. Vuelva a intentarlo o pruebe una llamada de práctica.",
  startStep: "Pulse Empezar a escuchar y permita el acceso al micrófono.",
  stop: "Detener",
  stopListening: "Dejar de escuchar",
  stopPractice: "Detener la llamada de práctica",
  stopped: "Se dejó de escuchar",
  summary: "Resumen de la llamada",
  summaryNoWarnings: "No se detectaron señales de alerta.",
  summarySaved:
    "Guardado en Revisiones anteriores como un breve resumen. No se conserva el audio ni los subtítulos.",
  summaryStorage:
    "Solo se guarda un breve resumen en Revisiones anteriores. No se conserva el audio ni los subtítulos.",
  summaryWarnings: "Esta llamada tenía señales de alerta.",
  tellTrusted: "Cuénteselo a alguien de confianza",
  timeLimit:
    "La revisión se detuvo después de 30 minutos. Este es el resumen hasta ahora.",
  times:
    "Los tiempos indican minutos y segundos desde el inicio de la revisión. Los números largos están ocultos.",
  tryPractice: "Probar una llamada de práctica",
  uncheckedBody:
    "No se pudo revisar parte de lo que se dijo en busca de señales de alerta, así que este resumen podría omitirlas.",
  uncheckedTitle: "LifeLink no pudo revisar esta llamada por completo",
  unmute: "Activar el sonido de alerta",
  urgency: "amenazas o presión para actuar deprisa y guardar un secreto",
  warningReasons: {
    codes_or_passwords:
      "Una solicitud de compartir un código de verificación o una contraseña.",
    gift_cards:
      "Una solicitud de pagar con tarjetas de regalo o compartir sus códigos.",
    money: "Una solicitud de enviar dinero o transferir sus ahorros.",
    personal_details: "Una solicitud de datos personales o bancarios.",
    remote_access:
      "Una solicitud de permitir el acceso remoto a un dispositivo.",
    secrecy_or_pressure:
      "Una solicitud de guardar un secreto o presión para actuar de inmediato.",
    threats: "Una amenaza de arresto, multas o cierre de una cuenta.",
  },
  warningSign: "Señal de alerta",
  warnings: "Se detectaron señales de alerta",
  you: "Usted",
};

export { callScreening };

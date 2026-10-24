import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "Sobre esta revisión",
  adviceNote:
    "Este consejo venía en el propio mensaje, así que no cuenta como señal de alerta",
  adviceTitle: "Consejos en el propio mensaje",
  allWords: "Todas las palabras que leyó LifeLink",
  cannotProve:
    "Este resultado no puede probar que un mensaje sea auténtico. Confirme los pedidos inesperados con un contacto que ya conozca.",
  checkDidNotFinish: "La revisión no terminó",
  checkingMessage: "Revisando su mensaje…",
  compareWithPhoto: "Compárelas con su foto",
  confidence: {
    high: "Varios detalles respaldan esta evaluación. Aun así, no puede verificar al remitente.",
    low: "No hay suficiente información para estar seguros. Una segunda opinión puede ayudar.",
    medium:
      "Algunos detalles respaldan esta evaluación. Verifique el pedido por su cuenta.",
  },
  couldNotRead: "LifeLink no pudo leer bien esta foto",
  delete: "Borrar esta revisión",
  deleteConfirm: "¿Borrar esta revisión? Se quitará de Revisiones anteriores.",
  deleting: "Borrando…",
  howChecked: "Cómo se revisó",
  imageUnverified:
    "Estas palabras se leyeron de una foto y pueden estar mal o incompletas. LifeLink no pudo compararlas con el texto original. Compárelas con su foto.",
  keep: "Conservar esta revisión",
  kinds: {
    email: "Un correo",
    screenshot: "Una foto o captura de pantalla",
    text: "Un mensaje",
  },
  method: {
    cloud:
      "Un servicio de IA en la nube ayudó con esta revisión, con su permiso.",
    cloudOld:
      "Un servicio de IA en la nube ayudó con esta revisión anterior. Los detalles del permiso no se guardaron con este registro.",
    rules:
      "LifeLink usó reglas comunes de alerta. El mensaje no se envió a un servicio de IA en la nube para esta revisión.",
    rulesFallback:
      "LifeLink usó reglas comunes de alerta porque la IA en la nube no estaba disponible o no terminó. Puede que el servicio ya haya recibido este contenido.",
    rulesOld:
      "LifeLink usó reglas comunes de alerta. Este registro anterior no dice si un servicio de IA en la nube también recibió el mensaje.",
  },
  newPhoto: "Tomar una foto nueva",
  noFullWording:
    "El texto completo no se guardó con esta revisión. Las citas de arriba no son una transcripción completa. Compárelas con su foto, o escriba las palabras para otra revisión.",
  noSigns:
    "No se encontraron señales de alerta claras. Eso no prueba que el mensaje sea auténtico.",
  noStepsHint:
    "Antes de hacer caso a un pedido inesperado, consulte con alguien que conozca usando sus datos de contacto guardados.",
  originalEmail: "Correo original",
  originalMessage: "Mensaje original",
  photo: {
    alt: "La foto usada para esta revisión",
    larger: "Ver la foto más grande",
    noPreview:
      "La vista previa de la foto no está disponible para esta revisión. ",
    readSaved: "Todavía puede leer el resultado guardado.",
    reopen: "Pruebe a abrir la revisión otra vez.",
    see: "Ver la foto",
    smaller: "Achicar la foto",
    smallerAria: "Hacer la foto más pequeña",
  },
  photoRetention: {
    old: "Esta revisión anterior no tiene vista previa de la foto guardada. Al borrarla se quita el resultado; la foto anterior puede seguir guardada.",
    owned:
      "Su foto se guarda con esta revisión. Al borrar la revisión también se borra la foto, a menos que otra revisión o foto guardada todavía la use.",
  },
  readAloud: "Leer el resultado en voz alta",
  readingPhoto: "Leyendo las palabras de su foto…",
  recoveryMessage:
    "Trate el mensaje con cuidado. Puede intentar otra revisión o preguntarle a alguien de confianza.",
  recoveryPhoto:
    "Pruebe con una foto más clara, con buena luz y todas las palabras a la vista, o escriba las palabras en su lugar. Esta revisión no puede decirle si el mensaje es auténtico.",
  removedQuotes:
    "Algunas palabras que señaló el asistente no estaban en el mensaje, así que no se muestran.",
  savedWording: "El texto guardado con esta revisión",
  signCount: (count) =>
    `${count} ${count === 1 ? "señal de alerta" : "señales de alerta"}`,
  signsNoteMessage: "Lo que llamó la atención en este mensaje",
  signsNotePhoto: "Con las palabras que LifeLink leyó de su foto",
  step: "Paso",
  titles: {
    email: "Revisión de su correo",
    screenshot: "Revisión de su foto",
    text: "Revisión de su mensaje",
  },
  typeWords: "Escribir las palabras",
  verdicts: {
    likely_safe: "Sin señales de alerta claras",
    likely_scam: "Probablemente una estafa",
    suspicious: "Se encontraron señales de alerta",
    unsure: "Sin verificar",
  },
  waitHint:
    "Suele tardar unos segundos. Mantenga esta página abierta. Mientras tanto, no use enlaces ni números de teléfono del mensaje, ni le pague a nadie.",
  whatNow: "Qué hacer ahora",
};

export { scamResult };

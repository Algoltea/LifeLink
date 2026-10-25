import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "¿Algo que agregar? (opcional)",
  addNotePlaceholder: "Por ejemplo, de quién decía ser",
  ask: "Pregúntele a alguien de confianza",
  callCheckTitle: "Revisión de llamada sospechosa",
  checkSomethingElse: "Revisar otra cosa",
  checking: "Revisando",
  checkingMessage: "Revisando el mensaje…",
  chooseEmail: "Elija un correo",
  chooseRecent: "Elija entre sus correos recientes",
  cloudNote:
    "Un servicio de IA lo lee para revisarlo. No incluya contraseñas ni números de tarjeta.",
  didNotFinish: "No terminó",
  earlier: "Revisiones anteriores",
  earlierEmpty: "Aquí aparecerán sus revisiones de mensajes, fotos y llamadas.",
  emailMissing:
    "Este correo no está en la bandeja reciente. Elija otro correo o escriba sus palabras abajo.",
  from: (sender) => `De ${sender}`,
  guidance: {
    ai: "Un servicio de IA ayuda con las revisiones de mensajes y fotos. Las fotos se guardan con su revisión hasta que la borre. Las revisiones de práctica nunca usan IA.",
    intro:
      "Una revisión busca señales de alerta comunes. No puede confirmar quién envió un mensaje ni si es cierto.",
    next: "Lea el resultado, siga «Qué hacer ahora» o pídale una segunda opinión a alguien de confianza. Usted decide qué pasa después.",
    title: "¿Qué me puede decir una revisión de estafas?",
  },
  howToShow: "¿Cómo quiere mostrar el mensaje?",
  loadingEarlier: "Cargando revisiones anteriores",
  loadingEmail: "Cargando el correo",
  loadingEmails: "Cargando sus correos",
  localNote:
    "Las revisiones con IA no están disponibles ahora. LifeLink usa señales de alerta comunes en su lugar.",
  messageWords: "Las palabras del mensaje",
  messageWordsPlaceholder: "Pegue o escriba aquí las palabras",
  noLongerAvailable:
    "Esta revisión ya no está disponible. Puede empezar una nueva.",
  noRecentEmails: "No hay correos recientes para elegir. ",
  noRecentEmailsRest: ", o escriba las palabras del mensaje en su lugar.",
  noSubject: "(Sin asunto)",
  openEmail: "Abra Correo",
  opening: "Abriendo su revisión",
  photo: {
    availabilityChecking:
      "Viendo si las revisiones de fotos están disponibles…",
    practice:
      "El modo de práctica está activado. Las fotos no se revisan ni se envían a un servicio de IA.",
    unavailable:
      "Las revisiones de fotos no están disponibles ahora. Su foto no se subirá.",
    unavailableType:
      "Las revisiones de fotos no están disponibles. Escriba las palabras en su lugar.",
  },
  practiceEmailNote:
    "Este es un correo de práctica. Se revisa en este dispositivo sin IA en la nube.",
  practiceNote:
    "Las revisiones de práctica usan señales de alerta comunes. No se envía nada a un servicio de IA.",
  practiceSuffix: " · Práctica",
  preparing: "Preparando su revisión…",
  review: "Ver",
  sources: {
    email: "Correo",
    screenshot: "Foto",
    text: "Texto",
  },
  startNew: "Empezar una revisión nueva",
  subline:
    "¿Tiene dudas sobre un mensaje o una llamada? LifeLink busca señales de alerta antes de que usted actúe.",
  submit: {
    email: "Revisar este correo",
    screenshot: "Revisar esta foto",
    text: "Revisar este mensaje",
  },
  title: "Revisar estafas",
  uploading: "Subiendo su foto…",
  uploadingNote:
    "Subiendo su foto. Mantenga esta página abierta; después se leerán las palabras.",
};

export { scam };

import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "Cuentas y permisos",
  accountsLink: "Cuentas que LifeLink puede usar",
  aiEmailChecks: "Revisar correos nuevos con IA",
  aiEmailChecksDescription:
    "Cuando llega un correo nuevo, un servicio de IA en la nube lo revisa en busca de señales de estafa. Los correos antiguos y los de práctica nunca se envían.",
  captions: "Subtítulos al hablar",
  captionsDescription: "Muestra las palabras mientras habla con LifeLink.",
  characterCount: (count, maximum) => `${count} de ${maximum} caracteres`,
  choicesNotSaved: (error) =>
    `Sus opciones no se guardaron en su cuenta. ${error} Inténtelo de nuevo abajo.`,
  contrast: "Contraste",
  contrastDescription:
    "Más contraste hace el texto más oscuro y los bordes más marcados.",
  contrastMore: "Más contraste",
  contrastStandard: "Normal",
  defaultVoice: "Voz predeterminada de LifeLink",
  demoAllowedHint: "Este interruptor se guarda automáticamente.",
  demoBetweenModes:
    "Todo lo que se prepare en un modo debe revisarse de nuevo antes de usarse en el otro.",
  demoDescription:
    "En el modo de práctica no se envía, se guarda fuera ni se compra nada de verdad. Todo lo que pasaría se simula y se marca como «Práctica», y se agregan personas y mensajes de ejemplo para que pueda probar con tranquilidad.",
  demoFailed: (error) =>
    `No se pudo cambiar el modo de práctica. ${error} Pruebe el interruptor otra vez.`,
  demoOff:
    "El modo de práctica está desactivado. Todo lo que apruebe ahora sucede de verdad.",
  demoOn: "El modo de práctica está activado.",
  demoTitle: "Modo de práctica",
  demoTurnedOff: "El modo de práctica se desactivó para esta aplicación.",
  demoUse: "Usar el modo de práctica",
  detailDetailed: "Detalladas",
  detailShort: "Breves",
  explanations: "Explicaciones",
  explanationsDescription:
    "Breves da los puntos principales. Detalladas explica un poco más.",
  fullName: "Nombre completo",
  groceriesLink: "Listas de compras y presupuestos",
  hearSample: "Escuchar un ejemplo",
  helpDescription:
    "Se usa cuando LifeLink le explica un mensaje, una revisión de estafa, el resumen de una conversación o su resumen de la mañana. Solo usted lo ve. Las opciones de abajo se guardan al cambiarlas; las notas tienen su propio botón Guardar notas.",
  helpTitle: "Cómo me gusta recibir ayuda",
  language: "Idioma",
  languageDescription:
    "Elija el idioma de las pantallas de LifeLink y de la ayuda en la nube. Las pantallas principales están disponibles en inglés y español; con otras opciones, quedan en inglés. La ayuda en la nube puede usar otros idiomas cuando esté disponible. Las revisiones de estafas y de correo que usan reglas locales solo cubren el inglés y pueden pasar por alto estafas en otros idiomas. Las citas y los mensajes conservan sus palabras originales.",
  lessMovement: "Menos movimiento",
  lessMovementDescription: "Quita los deslizamientos y desvanecimientos.",
  loading: "Cargando los ajustes",
  newsOnToday: "Noticias en Hoy",
  newsOnTodayDescription:
    "Muestra tres titulares en Hoy. Allí elige buenas noticias o noticias principales.",
  notes: "Notas sobre cómo me gusta recibir ayuda",
  notesHint:
    "Por ejemplo, «Explíqueme un paso a la vez». Solo las explicaciones de LifeLink para usted las usan. Nunca se muestran a su familia ni se ponen en un mensaje. Si permite una explicación en la nube, estas notas se envían al proveedor de IA junto con el mensaje.",
  notesNotSaved: (error) =>
    `Sus notas no se guardaron. ${error} Su texto sigue aquí. Elija Guardar notas para intentarlo de nuevo.`,
  notesSaveHint:
    "Elija Guardar notas para conservar los cambios de este texto.",
  notesSaved: "Sus notas están guardadas.",
  oneStep: "Un paso a la vez",
  oneStepDescription:
    "Muestra las explicaciones y los siguientes pasos de uno en uno, con un botón Siguiente.",
  permissionsLink: "Quién puede ver qué",
  postalCode: "Código postal",
  preferredName: "Cómo le llama LifeLink",
  profileNotSaved: (error) =>
    `Su perfil no se guardó. ${error} Lo que escribió sigue aquí. Elija Guardar perfil para intentarlo de nuevo.`,
  profileSaveHint:
    "Elija Guardar perfil para conservar los cambios de esta sección.",
  profileTitle: "Sobre usted",
  readAloudAuto: "Leer en voz alta automáticamente",
  readAloudAutoDescription:
    "LifeLink lee en voz alta los resúmenes y las respuestas nuevas.",
  readAloudVoice: "Voz de lectura en voz alta",
  readAloudVoiceDescription:
    "Elija quién le lee. La opción predeterminada de LifeLink usa la voz estándar.",
  saveNotes: "Guardar notas",
  saveProfile: "Guardar perfil",
  saved: "Guardado.",
  savesAsYouChange: "Estas preferencias se guardan al cambiarlas.",
  seeingAndHearing: "Ver y escuchar",
  signOff: "Cómo firma sus mensajes",
  signOffPlaceholder: "Por ejemplo, Mamá",
  speakingSpeed: "Velocidad de la voz",
  speakingSpeedDescription:
    "Qué tan rápido habla LifeLink cuando lee en voz alta.",
  speechQuicker: "Más rápido",
  speechSample: "Así suena LifeLink cuando le lee en voz alta.",
  speechSlower: "Más despacio",
  speechUsual: "Normal",
  subline: "Haga que LifeLink sea cómodo de leer y de escuchar.",
  textSize: "Tamaño del texto",
  textSizeDescription:
    "Cambia todas las páginas. Su elección se recuerda en este dispositivo.",
  textSizeLarge: "Grande",
  textSizeLarger: "Más grande",
  textSizeLargest: "El más grande",
  textSizeStandard: "Normal",
  theme: "Claro u oscuro",
  themeDark: "Oscuro",
  themeLight: "Claro",
  themeSystem: "Igual que mi dispositivo",
  timeZone: "Zona horaria",
  title: "Ajustes",
  trySavingAgain: "Intentar guardar de nuevo",
};

export { settings };

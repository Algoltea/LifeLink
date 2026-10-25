import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "Agregar a esta persona",
  addWay: "Agregar otra forma de contacto",
  added: (name) => `Se agregó a ${name}.`,
  anotherWay: "Otra forma",
  askingForHelp: "Pedirle ayuda",
  chooseDifferentPicture: "Elegir otra foto",
  choosePicture: "Elegir una foto",
  detailsNotSaved: (error) =>
    `No se pudieron guardar los datos de la persona. ${error} Lo que escribió sigue aquí. Guarde otra vez para reintentar.`,
  howToReach: "Cómo comunicarse con esta persona",
  language: "Idioma que LifeLink usa con esta persona",
  languageHelp:
    "Las palabras propias de LifeLink para esta persona, como la nota que le presenta a usted en su primer iMessage, usan este idioma. Sus mensajes siempre se envían tal como usted los aprueba.",
  languageSameAsMine: (language) => `Igual que el mío (${language})`,
  name: "Nombre",
  notSetYet: "Sin elegir todavía",
  picture: "Foto",
  pictureFailed: (error) => `${error} Elija una foto para intentarlo de nuevo.`,
  pictureHelp:
    "Opcional. La foto se hace pequeña y cuadrada en este dispositivo, y se quitan los datos de ubicación y de la cámara antes de guardarla.",
  pictureNotSaved: (error) =>
    `Los datos de la persona se guardaron, pero la foto no. ${error} Sus opciones siguen aquí. Guarde otra vez para reintentar, o elija otra foto.`,
  pictureUnusable: "No se pudo usar esa foto. Por favor, pruebe con otra.",
  preferredWay: "Forma preferida de contacto",
  relationship: "Qué es de usted",
  relationshipPlaceholder: "Hijo, vecina, amigo",
  removePicture: "Quitar la foto",
  saveChanges: "Guardar cambios",
  saved: "Guardado.",
  savingPersonAndPicture: "Guardando la persona y la foto…",
  trusted: "En mi círculo de confianza. LifeLink puede sugerir pedirle ayuda.",
  ways: {
    discord: {
      help: "Su ID de usuario de Discord, un número largo. En Discord: Ajustes, Avanzado, Modo desarrollador y luego Copiar ID de usuario.",
      label: "Discord",
      valueLabel: "ID de usuario de Discord",
    },
    email: {
      help: "Su dirección de correo electrónico.",
      label: "Correo (Gmail, Outlook y otros)",
      valueLabel: "Dirección de correo",
    },
    imessageEmail: {
      help: "El correo de Apple ID que usa para iMessage. Es una identidad distinta de su número de teléfono. Para enviar iMessages de verdad más adelante, guarde a esta persona y luego elija Editar y Vincular iMessage.",
      label: "iMessage (correo de Apple ID)",
      valueLabel: "Correo de Apple ID",
    },
    imessagePhone: {
      help: "Su número de iPhone. Para enviar iMessages de verdad más adelante, guarde a esta persona y luego elija Editar y Vincular iMessage.",
      label: "iMessage (número de teléfono)",
      valueLabel: "Número de teléfono",
    },
    telegram: {
      help: "Su usuario de Telegram, como @sam_alvarez (en Telegram: Ajustes y luego Nombre de usuario). Después de guardar, pídale que abra @LifeLinkMessage_Bot en Telegram y toque Iniciar. ¿No tiene usuario? Déjelo en blanco y use el enlace de Telegram de abajo.",
      label: "Telegram",
      valueLabel: "Usuario de Telegram",
    },
    whatsapp: {
      help: "Se guarda para usted. LifeLink todavía no puede enviar mensajes de WhatsApp.",
      label: "WhatsApp (solo guardado)",
      valueLabel: "Número de WhatsApp",
    },
  },
  whoTheyAre: "Quién es",
};

export { contactForm };

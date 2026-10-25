interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "presión para actuar rápido"],
  ["mentions private details", "menciona datos privados"],
  ["mentions a payment method", "menciona una forma de pago"],
  ["contains a link", "contiene un enlace"],
  ["threats", "amenazas"],
  ["prize or windfall", "premio o dinero inesperado"],
] as const;

/** Only the combinations emitted by scam.ts; arbitrary lists are not translated. */
const scamSummaries = (): ServerCatalog["exact"] => {
  const combinations: (typeof SCAM_SIGNS)[number][][] = [[]];

  for (const sign of SCAM_SIGNS) {
    // Snapshot this round because the loop appends the new combinations.
    const previousCombinations = [...combinations];

    for (const previous of previousCombinations) {
      combinations.push([...previous, sign]);
    }
  }

  const translations: Record<string, string> = {};

  for (const signs of combinations) {
    if (signs.length === 0) {
      continue;
    }

    const english = signs.map(([label]) => label).join(", ");
    const spanish = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] =
      `Este mensaje presenta ${signs.length} ${signs.length === 1 ? "señal de alerta común" : "señales de alerta comunes"}: ${spanish}.`;
  }

  return translations;
};

const SPEECH_ERRORS: ServerCatalog["exact"] = {
  "Audio playback stopped responding. Please try again.":
    "La reproducción de audio dejó de responder. Inténtelo de nuevo.",
  "Choose between 1 and 600 characters to read.":
    "Elija un texto de entre 1 y 600 caracteres para leer.",
  "Please choose a shorter section to read aloud.":
    "Elija una sección más corta para leer en voz alta.",
  "Please read a shorter passage at a time.":
    "Lea un fragmento más corto cada vez.",
  "Please sign in again to use read-aloud.":
    "Vuelva a iniciar sesión para usar la lectura en voz alta.",
  "Read-aloud is not set up yet.":
    "La lectura en voz alta todavía no está configurada.",
  "Read-aloud is not set up yet. An OpenRouter key is needed.":
    "La lectura en voz alta todavía no está configurada. Se necesita una clave de OpenRouter.",
  "Read-aloud is unavailable. Please try again.":
    "La lectura en voz alta no está disponible. Inténtelo de nuevo.",
  "Read-aloud needs a short pause. Please try again in a minute.":
    "La lectura en voz alta necesita una breve pausa. Inténtelo de nuevo en un minuto.",
  "Read-aloud returned an unexpected audio format. Please try again later.":
    "La lectura en voz alta devolvió un formato de audio inesperado. Inténtelo de nuevo más tarde.",
  "Read-aloud returned no audio. Please try again.":
    "La lectura en voz alta no devolvió ningún audio. Inténtelo de nuevo.",
  "Read-aloud took too long. Please try again.":
    "La lectura en voz alta tardó demasiado. Inténtelo de nuevo.",
  "That audio was too large. Please read a shorter section.":
    "Ese audio era demasiado grande. Elija una sección más corta para leer.",
  "That passage is too long to read at once. Please choose a shorter section.":
    "Ese fragmento es demasiado largo para leerlo de una vez. Elija una sección más corta.",
  "The audio could not be loaded. Please try again.":
    "No se pudo cargar el audio. Inténtelo de nuevo.",
  "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
    "El modelo configurado para la lectura en voz alta no es un modelo de ElevenLabs verificado en OpenRouter.",
  "The configured read-aloud voice is not supported. Please check the speech settings.":
    "La voz configurada para la lectura en voz alta no es compatible. Revise la configuración de voz.",
  "This audio could not be played. Please try again.":
    "No se pudo reproducir este audio. Inténtelo de nuevo.",
  "This browser cannot play audio. You can still read the text here.":
    "Este navegador no puede reproducir audio. Puede seguir leyendo el texto aquí.",
  "Today’s read-aloud limit has been reached. Please try again tomorrow.":
    "Se alcanzó el límite de lectura en voz alta de hoy. Inténtelo de nuevo mañana.",
};

/** Spanish for the backend's fixed English messages, matched exactly. */
const es: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    ...SPEECH_ERRORS,
    "Action not found.": "No se encontró la acción.",
    "Added to your calendar.": "Se añadió a su calendario.",
    "An action cannot change into a different kind of action.":
      "Una acción no se puede convertir en otro tipo de acción.",
    "An earlier try is still unresolved.":
      "Todavía no se sabe qué pasó con un intento anterior.",
    "Ask for a ride": "Pedir un viaje",
    "Ask someone in your trusted circle to take a look.":
      "Pídale a alguien de su círculo de confianza que lo revise.",
    "Attempt not found.": "No se encontró el intento.",
    "Check up to 15 emails at a time.": "Revise hasta 15 correos a la vez.",
    "Choose someone from your trusted circle who can be messaged.":
      "Elija a alguien de su círculo de confianza a quien se le pueda enviar un mensaje.",
    "Cloud AI is not set up. Your local overview is still available.":
      "La IA en la nube no está configurada. Su resumen local sigue disponible.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "Sugerencias de la IA en la nube, con citas de apoyo cotejadas con cada correo. Verifique los detalles en el mensaje original.",
    "Confirm the ride": "Confirmar el viaje",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Conecte Gmail u Outlook en Conexiones para enviar correos.",
    "Contains a link": "Contiene un enlace",
    "Discord is not set up for this app yet.":
      "Discord todavía no está configurado para esta aplicación.",
    "Discord is not set up for this app.":
      "Discord no está configurado para esta aplicación.",
    "Don't click links or call numbers in the message.":
      "No abra los enlaces ni llame a los números del mensaje.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "Las conexiones de correo, calendario y Drive todavía no están configuradas para esta aplicación.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Escriba un importe de cero o más en centavos enteros, o deje la estimación en blanco.",
    "Enter a quantity greater than 0.": "Escriba una cantidad mayor que 0.",
    "Found it in your mailbox.": "Se encontró en su buzón de correo.",
    "Found the event on your calendar.":
      "Se encontró el evento en su calendario.",
    "Found the message in the Discord conversation.":
      "Se encontró el mensaje en la conversación de Discord.",
    "Found the notes in your Google Drive.":
      "Se encontraron las notas en su Google Drive.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Si dice ser de una empresa, llame al número de su tarjeta, su factura o el sitio web oficial.",
    "It is not in your mailbox, so it did not go through.":
      "No está en su buzón de correo, así que no se envió.",
    "Let family know": "Avisar a la familia",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "Los enlaces de mensajes inesperados pueden llevar a páginas falsas. Abra usted mismo el sitio web.",
    "Mentions a payment method": "Menciona una forma de pago",
    "Mentions private details": "Menciona datos privados",
    "New conversation": "Nueva conversación",
    "No connected mailbox to send from.":
      "No hay un buzón de correo conectado desde el que enviar.",
    "No recent emails to summarize yet.":
      "Todavía no hay correos recientes para resumir.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "No se encontró un asunto ni texto legible, ni una solicitud para hacer algo. No se han evaluado las imágenes ni los archivos adjuntos.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "Nadie de su círculo de confianza tiene permiso para ver los planes de viaje, así que no se compartió ninguna novedad.",
    "Not needed because the ride was declined.":
      "No hace falta porque no se aceptó el viaje.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "Solo se encontró una nota informal breve o información sobre un archivo compartido, sin un asunto relevante, una solicitud de respuesta ni detalles que requieran atención a tiempo.",
    "Only something that failed can be tried again.":
      "Solo se puede volver a intentar algo que falló.",
    "Only the account owner can do this.":
      "Solo la persona titular de la cuenta puede hacer esto.",
    "Open emails in pages of 15.": "Abra los correos en grupos de 15.",
    "Paste the message you would like checked.":
      "Pegue el mensaje que quiere revisar.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Photon aceptó el iMessage para su entrega con la misma aprobación.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Photon confirmó que aceptó el iMessage anterior para su entrega.",
    "Please answer the open question first.":
      "Primero responda la pregunta pendiente.",
    "Please check up to 8,000 characters at a time.":
      "Revise hasta 8.000 caracteres a la vez.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "Elija una foto JPG, PNG o WebP de menos de 6 MB.",
    "Please choose a photo under 6 MB.": "Elija una foto de menos de 6 MB.",
    "Please choose a time that has not passed yet.":
      "Elija una hora que todavía no haya pasado.",
    "Please choose one of the options shown.":
      "Elija una de las opciones que aparecen.",
    "Please sign in again to continue.":
      "Vuelva a iniciar sesión para continuar.",
    "Please sign in again.": "Vuelva a iniciar sesión.",
    "Please write your reply first.": "Primero escriba su respuesta.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "Los correos de práctica se revisan en LifeLink y nunca se envían a la IA en la nube.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "El modo de práctica está activado. Desactívelo y revise esto de nuevo para hacerlo de verdad.",
    "Practice: done.": "Práctica: completado.",
    "Practice: no draft was saved in your real mailbox.":
      "Práctica: no se guardó ningún borrador en su buzón real.",
    "Practice: nothing was added to your real calendar.":
      "Práctica: no se añadió nada a su calendario real.",
    "Practice: nothing was saved in your real Google Drive.":
      "Práctica: no se guardó nada en su Google Drive real.",
    "Practice: the reply was not really sent.":
      "Práctica: la respuesta no se envió de verdad.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "La presión puede hacer más difícil detenerse y revisar. Confirme las solicitudes urgentes con un contacto que ya conozca.",
    "Pressure to act fast": "Presión para actuar rápido",
    "Prize or windfall": "Premio o dinero inesperado",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Las solicitudes de tarjetas de regalo, transferencias o criptomonedas merecen otra revisión. Puede ser difícil recuperar esos pagos.",
    "Save a reminder": "Guardar un recordatorio",
    "Save the reminder": "Guardar el recordatorio",
    "Saved the notes in your Google Drive.":
      "Se guardaron las notas en su Google Drive.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "Cambiaron los permisos para compartir con alguien esta novedad. Revise quién podrá verla.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "Se muestra el resumen hecho en LifeLink. No se envió nada a la IA en la nube.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum no ha confirmado si se envió este mensaje. Revise de nuevo o confirme cuando llegue; no se puede marcar con seguridad como no enviado.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Los premios inesperados que requieren pagar primero casi siempre son estafas.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Telegram permite 1024 caracteres con fotos. Acorte el mensaje o envíe las fotos por separado.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Telegram le pidió a LifeLink que reduzca el ritmo. No se envió nada; vuelva a intentarlo en un minuto.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "Telegram todavía no está configurado para esta aplicación. Pídale a quien la configuró que ejecute bun run dev:setup --only=telegram.",
    "Telegram is not set up for this app.":
      "Telegram no está configurado para esta aplicación.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Telegram rechazó el envío: esta persona bloqueó el bot o nunca pulsó Iniciar. Pídale que abra el enlace de nuevo.",
    "That Google Drive is no longer connected.":
      "Ese Google Drive ya no está conectado.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Esa cuenta ya no está conectada. Vuelva a conectarla en Conexiones.",
    "That calendar is no longer connected.":
      "Ese calendario ya no está conectado.",
    "That could not be found.": "No se pudo encontrar.",
    "That email could not be found.": "No se pudo encontrar ese correo.",
    "That mailbox is no longer connected.":
      "Ese buzón de correo ya no está conectado.",
    "That person has no way to be reached yet.":
      "Todavía no hay una forma de contactar a esa persona.",
    "That step could not be found.": "No se pudo encontrar ese paso.",
    "That task could not be found.": "No se pudo encontrar esa tarea.",
    "The automatic check has not finished. Review this message before deciding.":
      "La revisión automática no ha terminado. Revise este mensaje antes de decidir.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "El resumen en la nube no se completó. Se muestra el resumen local; es posible que el proveedor haya recibido estos correos.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "Se alcanzó el límite de lectura en la nube. Su resumen local sigue disponible.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "El asunto o mensaje actual pide una respuesta o confirmación. Revise los detalles antes de responder.",
    "The details changed since you looked. Please review them again.":
      "Los detalles cambiaron desde que los vio. Revíselos de nuevo.",
    "The event is not on your calendar.": "El evento no está en su calendario.",
    "The message cannot be empty.": "El mensaje no puede estar vacío.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "El mensaje contiene un evento concreto, una acción relacionada con una cuenta o un detalle de horario que conviene revisar.",
    "The message is not in the Discord conversation, so it did not go through.":
      "El mensaje no está en la conversación de Discord, así que no se envió.",
    "The notes are not in your Google Drive.":
      "Las notas no están en su Google Drive.",
    "The person you are writing to is no longer in your contacts.":
      "La persona a quien le escribe ya no está en sus contactos.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "La dirección del remitente coincide con la de alguien de su Círculo de confianza y el mensaje contiene información que conviene revisar. Que la dirección coincida no verifica quién lo envió.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "El nombre o la dirección del remitente sugiere que es un mensaje sobre salud, facturación o servicios de una cuenta. Revíselo; no se ha verificado la identidad del remitente.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "El remitente o el mensaje parece ser una promoción o un boletín, sin una acción concreta ni un asunto importante. Por lo general puede esperar si no le interesa.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "El asunto menciona una cita, una transacción, un aviso sobre una cuenta u otro tema que conviene revisar.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "Hay un asunto o un mensaje con contenido, pero no una solicitud clara de respuesta. Léalo para decidir si es importante para usted.",
    "There is nothing to check for this one.":
      "No hay nada que comprobar en este caso.",
    "These details could not be verified. Please prepare them again.":
      "No se pudieron verificar estos detalles. Prepárelos de nuevo.",
    "This action is missing its details.":
      "Faltan los detalles de esta acción.",
    "This can no longer be changed because it has already started.":
      "Esto ya empezó y no se puede cambiar.",
    "This changed while you were offline. Please look it over again before approving.":
      "Esto cambió mientras no tenía conexión. Revíselo de nuevo antes de aprobarlo.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "Esta revisión no encontró señales de alerta comunes en el texto disponible. No puede verificar quién lo envió ni demostrar que sea auténtico. Revise las solicitudes inesperadas con alguien de confianza.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "Esta revisión solo encontró consejos para no compartir datos ni pagar de formas inusuales. Esos consejos no demuestran que el mensaje sea auténtico. Revise las solicitudes inesperadas con alguien de confianza.",
    "This check has expired.": "Esta revisión venció.",
    "This email is not from a connected mailbox.":
      "Este correo no proviene de un buzón conectado.",
    "This has already started, so it can no longer be cancelled.":
      "Esto ya empezó y no se puede cancelar.",
    "This is already approved.": "Esto ya está aprobado.",
    "This is not waiting for approval.":
      "Esto no está pendiente de aprobación.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "Esto menciona datos delicados. No comparta contraseñas, códigos ni datos de cuentas en respuesta a un mensaje inesperado.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "El mensaje le dice que no haga esto. Las empresas reales lo dicen, pero los estafadores también lo copian. Revise las demás solicitudes del mensaje.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "Esto se preparó en el modo de práctica. Prepárelo de nuevo ahora que la práctica está desactivada.",
    Threats: "Amenazas",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "Las amenazas de arresto o problemas legales son una táctica común para asustar.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "Use un número entero para artículos o paquetes. Elija peso o volumen para una cantidad medida.",
    "Wait for an answer": "Esperar una respuesta",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "Se encontraron señales de alerta. Revise el mensaje antes de responder, pagar o compartir datos.",
    "Warns against sharing private details":
      "Advierte que no comparta datos privados",
    "Warns against threats": "Advierte sobre las amenazas",
    "Warns against unusual payments": "Advierte sobre pagos inusuales",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "No sabemos con seguridad si el último intento falló. Revise si se completó antes de intentarlo de nuevo.",
    "We are still checking this action. Wait for that check to finish.":
      "Todavía estamos revisando esta acción. Espere a que termine la revisión.",
    "Which appointment is the ride for?": "¿Para qué cita es el viaje?",
    "Who would you like to ask?": "¿A quién le gustaría preguntar?",
    "Write a few words or add a photo first.":
      "Primero escriba unas palabras o añada una foto.",
    "Write your reply first.": "Primero escriba su respuesta.",
    "You are not connected with this person.":
      "No tiene una conexión con esta persona.",
    "You cancelled this.": "Usted canceló esto.",
    "You offered or asked, and the answer was yes.":
      "Usted hizo una oferta o una solicitud y recibió una respuesta afirmativa.",
    "You offered or asked. The answer is not clear yet.":
      "Usted hizo una oferta o una solicitud. La respuesta todavía no está clara.",
    "You offered or asked. There is no answer yet.":
      "Usted hizo una oferta o una solicitud. Todavía no hay respuesta.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "iMessage todavía no está configurado para esta aplicación. Pídale a quien la configuró que ejecute bun run dev:setup.",
    "iMessage is not set up for this app.":
      "iMessage no está configurado para esta aplicación.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) =>
        `La lectura en voz alta no está disponible (${status}). Inténtelo de nuevo más tarde.`,
    ],
    [/^Ride to (?<title>.+)$/u, (title) => `Viaje a ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `Esperando la respuesta de ${name}.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} dijo: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name} no puede llevarle esta vez. Puede preguntarle a otra persona.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `Todavía no hay una forma de contactar a ${name}.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `Configure iMessage para ${name} en Círculo de confianza y pídale que escriba primero al número asignado.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `Primero vincule el Telegram de ${name} en Círculo de confianza: envíele su enlace y pídale que pulse Iniciar.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) =>
        `${name} respondió, pero todavía no está claro: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `Todavía no hay una forma de contactar a ${name}. Añada una en Círculo de confianza.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `Práctica: el mensaje para ${name} no se envió de verdad. Pronto llegará una respuesta de práctica.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) => `Photon aceptó el iMessage para ${name} para su entrega.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) =>
        `Se compartió con ${count} ${count === "1" ? "persona" : "personas"} de su círculo de confianza.`,
    ],
    [
      /^Reply sent to (?<to>[^“”"\r\n]+)\.$/u,
      (to) => `Se envió la respuesta a ${to}.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `Se guardó el borrador en su carpeta de borradores de ${provider}. No se ha enviado.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) =>
        `${name} hizo una oferta o una solicitud y recibió una respuesta afirmativa.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) =>
        `${name} hizo una oferta o una solicitud. Todavía no hay respuesta.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) =>
        `${name} hizo una oferta o una solicitud. La respuesta todavía no está clara.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) => `${name} hizo una pregunta que usted todavía no ha respondido.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) => `Responda a la oferta de ${name} si desea aceptarla.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `En ${messages === "1" ? "su último mensaje" : `sus últimos ${messages} mensajes`} con ${name}, LifeLink encontró ${agreements} ${agreements === "1" ? "acuerdo" : "acuerdos"} y ${offers} ${offers === "1" ? "oferta o solicitud" : "ofertas o solicitudes"} sin una respuesta clara.`,
    ],
  ],
};

export { es };

export type { ServerCatalog };

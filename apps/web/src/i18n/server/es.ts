interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

/** Spanish for the backend's fixed English messages, matched exactly. */
const es: ServerCatalog = {
  exact: {
    "Action not found.": "No se encontró la acción.",
    "An earlier try is still unresolved.":
      "Todavía no se sabe qué pasó con un intento anterior.",
    "Ask for a ride": "Pedir un viaje",
    "Ask someone in your trusted circle to take a look.":
      "Pídale a alguien de su círculo de confianza que lo revise.",
    "Attempt not found.": "No se encontró el intento.",
    "Choose someone from your trusted circle who can be messaged.":
      "Elija a alguien de su círculo de confianza a quien se le pueda enviar un mensaje.",
    "Confirm the ride": "Confirmar el viaje",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Conecte Gmail u Outlook en Conexiones para enviar correos.",
    "Contains a link": "Contiene un enlace",
    "Discord is not set up for this app yet.":
      "Discord todavía no está configurado para esta aplicación.",
    "Don't click links or call numbers in the message.":
      "No abra los enlaces ni llame a los números del mensaje.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "Las conexiones de correo, calendario y Drive todavía no están configuradas para esta aplicación.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Escriba un importe de cero o más en centavos enteros, o deje la estimación en blanco.",
    "Enter a quantity greater than 0.": "Escriba una cantidad mayor que 0.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Si dice ser de una empresa, llame al número de su tarjeta, su factura o el sitio web oficial.",
    "Let family know": "Avisar a la familia",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "Los enlaces de mensajes inesperados pueden llevar a páginas falsas. Abra usted mismo el sitio web.",
    "Mentions a payment method": "Menciona una forma de pago",
    "Mentions private details": "Menciona datos privados",
    "New conversation": "Nueva conversación",
    "Not needed because the ride was declined.":
      "No hace falta porque no se aceptó el viaje.",
    "Only something that failed can be tried again.":
      "Solo se puede volver a intentar algo que falló.",
    "Paste the message you would like checked.":
      "Pegue el mensaje que quiere revisar.",
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
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "El modo de práctica está activado. Desactívelo y revise esto de nuevo para hacerlo de verdad.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "La presión puede hacer más difícil detenerse y revisar. Confirme las solicitudes urgentes con un contacto que ya conozca.",
    "Pressure to act fast": "Presión para actuar rápido",
    "Prize or windfall": "Premio o dinero inesperado",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Las solicitudes de tarjetas de regalo, transferencias o criptomonedas merecen otra revisión. Puede ser difícil recuperar esos pagos.",
    "Save a reminder": "Guardar un recordatorio",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum no ha confirmado si se envió este mensaje. Revise de nuevo o confirme cuando llegue; no se puede marcar con seguridad como no enviado.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Los premios inesperados que requieren pagar primero casi siempre son estafas.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Esa cuenta ya no está conectada. Vuelva a conectarla en Conexiones.",
    "That could not be found.": "No se pudo encontrar.",
    "That person has no way to be reached yet.":
      "Todavía no hay una forma de contactar a esa persona.",
    "That task could not be found.": "No se pudo encontrar esa tarea.",
    "The details changed since you looked. Please review them again.":
      "Los detalles cambiaron desde que los vio. Revíselos de nuevo.",
    "The message cannot be empty.": "El mensaje no puede estar vacío.",
    "The person you are writing to is no longer in your contacts.":
      "La persona a quien le escribe ya no está en sus contactos.",
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
  },
  patterns: [
    [/^Ride to (?<title>.+)$/u, (title) => `Viaje a ${title}`],
    [
      /^Waiting for (?<name>.+) to answer\.$/u,
      (name) => `Esperando la respuesta de ${name}.`,
    ],
    [
      /^(?<name>.+) said: “(?<body>[\s\S]+)”$/u,
      (name, body) => `${name} dijo: “${body}”`,
    ],
    [
      /^(?<name>.+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name} no puede llevarle esta vez. Puede preguntarle a otra persona.`,
    ],
    [
      /^(?<name>.+) has no way to be reached yet\.$/u,
      (name) => `Todavía no hay una forma de contactar a ${name}.`,
    ],
    [
      /^Set up iMessage for (?<name>.+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `Configure iMessage para ${name} en Círculo de confianza y pídale que escriba primero al número asignado.`,
    ],
    [
      /^Link (?<name>.+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `Primero vincule el Telegram de ${name} en Círculo de confianza: envíele su enlace y pídale que pulse Iniciar.`,
    ],
  ],
};

export { es };

export type { ServerCatalog };

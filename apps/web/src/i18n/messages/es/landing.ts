import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "Tamaño del texto", value: "Más grande" },
      { label: "Leer respuestas en voz alta", value: "Sí · más despacio" },
      { label: "Menos movimiento", value: "Sí" },
      { label: "Contraste", value: "Más fuerte" },
      { label: "Subtítulos en llamadas", value: "Sí" },
    ],
    intro:
      "Mensajes a la familia, citas y recordatorios, con letra grande y lectura en voz alta en todo momento. Todo lo que se vaya a enviar le sigue esperando a usted.",
    messages: {
      description:
        "Escriba a su familia por iMessage, correo electrónico, Discord o Telegram. «Ayúdeme a entender» le explica un mensaje que ha recibido y le sugiere respuestas para que usted elija.",
      imageAlt:
        "Mary Cassatt, La carta: una mujer con un vestido azul estampado cierra una carta en su escritorio.",
      imageCaption: "Mary Cassatt, La carta, 1890–91.",
      title: "Mensajes a la familia",
    },
    read: {
      description:
        "Letra más grande, más contraste, subtítulos y una voz de lectura más lenta. Hable en lugar de escribir cuando quiera. Sus ajustes le acompañan en cada pantalla.",
      imageAlt:
        "Édouard Manet, Mujer leyendo: una mujer con abrigo y sombrero oscuros lee una revista ilustrada al aire libre.",
      imageCaption: "Édouard Manet, Mujer leyendo, 1880–82.",
      title: "Lea, escuche o hable",
    },
    reminder: {
      approve: "Aprobar recordatorio",
      changeTime: "Cambiar la hora",
      title: "Nuevo recordatorio",
      version: "Versión 1",
      what: "Llamar a Ana",
      when: "Domingo, 1 de noviembre · 11:00 a. m.",
      youSaid: "Usted dijo: «Recuérdeme llamar a Ana el domingo».",
    },
    reminders: {
      description:
        "Hoy empieza por lo que necesita su atención primero y luego muestra citas y recordatorios. Diga qué quiere recordar y LifeLink lo anota para que usted lo apruebe.",
      title: "Citas y recordatorios",
    },
    tab: "Ayuda diaria",
    thread: {
      helpMeUnderstand: "Ayúdeme a entender",
      reply: "¡Claro! ¿A las 9:45 en su casa? Quizás traiga a Max.",
      sent: "Enviado 9:05 a. m. · versión 2",
      sentMessage:
        "Hola, Sam: ¿podrías llevarme al Dr. Patel el martes 27 de octubre?",
    },
    title: "En qué le ayuda LifeLink",
    today: {
      comingUp: "Próximamente",
      confirmPickup: "Confirmar que Sam le recoge a las 9:45",
      greeting: "Buenas tardes, Ruth",
      review: "Revisar",
      rows: [
        {
          detail: "Recordatorio · hoy",
          time: "8:00 p. m.",
          title: "Pastillas de la noche",
        },
        {
          detail: "Aún sin confirmar",
          time: "9:45 a. m.",
          title: "Sam pasa a recogerle",
        },
        { detail: "Martes, 27 oct.", time: "10:30 a. m.", title: "Dr. Patel" },
      ],
      waiting: "Le está esperando",
    },
  },
  features: {
    hint: "Ejemplo. Desplácese o señale una fila para ver aquí esa parte de LifeLink.",
    items: {
      circle: {
        name: "Círculo de confianza",
        summary:
          "Invite a alguien con un código, elija qué puede ver y durante cuánto tiempo, y deje de compartir cuando quiera.",
      },
      connections: {
        name: "Conexiones",
        summary:
          "Cada cuenta dice con claridad qué funciona, qué aún no está listo y qué no ofrece.",
      },
      documents: {
        name: "Documentos",
        summary: "Sus archivos de Google Drive, cada uno con una vista previa.",
      },
      email: {
        name: "Correo",
        summary:
          "Señala los correos que parecen estafas y redacta respuestas que nunca se envían solas.",
      },
      family: {
        name: "Vista familiar",
        summary:
          "La página que ve su familia: solo lo que usted comparte, con fotos y un lugar para responder.",
      },
      groceries: {
        name: "Compras",
        summary:
          "Listas con presupuesto y costos estimados, listas para copiar o imprimir antes de ir a la tienda.",
      },
      help: {
        name: "Cómo prefiero la ayuda",
        summary:
          "Respuestas cortas o detalladas, un paso a la vez, en el idioma que usted elija.",
      },
      recap: {
        name: "Resumen de una conversación",
        summary:
          "Separa lo acordado de lo que solo se ofreció y sugiere los próximos pasos.",
      },
      today: {
        name: "Hoy",
        summary:
          "Lo que necesita su atención primero, luego citas, el tiempo y tres titulares que usted elige.",
      },
    },
    titleLine1: "Todo lo demás",
    titleLine2: "que hace",
  },
  footer: {
    credits: {
      afterLicense:
        ", Wikimedia Commons. Los ejemplos de la aplicación usan datos de muestra.",
      byAuthor: "de RedKnight7,",
      morse:
        ". Manipulador y registrador Morse, 1876: dominio público, Wikimedia Commons.",
      paintings:
        "Mary Cassatt, La carta; Édouard Manet, Mujer leyendo; Claude Monet, Paseo por el acantilado en Pourville y Estanque de nenúfares; Jean-Jacques de Boissieu, Anciano leyendo con un niño: dominio público (CC0),",
      telegram: "Telegrama de Western Union de 1959",
    },
    getStarted: "Empezar",
    label: "Pie de página",
    links: {
      everydayHelp: "Ayuda diaria",
      howItWorks: "Cómo funciona",
      language: "Idioma",
      ourPromise: "Nuestra promesa",
      questions: "Preguntas",
      scamCheck: "Revisar estafas",
    },
    pictures: "Imágenes",
    signIn: "Iniciar sesión",
    solitaire: "Solitario",
    tagline:
      "Ayuda con los mensajes de cada día. Nada se envía hasta que usted lo diga.",
  },
  hero: {
    getStarted: "Empezar",
    imageAlt:
      "Claude Monet, Paseo por el acantilado en Pourville: dos figuras sobre un acantilado florido frente a un mar luminoso con veleros.",
    imageCaption: "Claude Monet, Paseo por el acantilado en Pourville, 1882.",
    intro:
      "LifeLink le ayuda a escribir a su familia, llevar la cuenta de sus citas y revisar mensajes o cartas que parecen sospechosos. Usted lee cada mensaje completo antes de aprobarlo.",
    seeHowItWorks: "Ver cómo funciona",
    titleLine1: "Nada se envía",
    titleLine2: "hasta que usted lo diga.",
  },
  howItWorks: {
    done: "Listo",
    exampleTimes: "Horas de ejemplo",
    imageAlt:
      "Grabado de un manipulador, un relé y un registrador Morse, rotulados Indicador, Relé, Manipulador y Batería de línea.",
    imageCaption:
      "Manipulador y registrador Morse, grabado para Popular Science Monthly, 1876.",
    intro:
      "Aquí tiene una petición de transporte de principio a fin. Cada paso se nombra con palabras sencillas, para que siempre sepa qué ha pasado y qué no.",
    result: "Usted aprobó dos veces. No se envió nada más.",
    slipTitle: "Transporte al Dr. Patel",
    timeline: [
      {
        heading: "Lunes por la mañana",
        steps: [
          { label: "Usted pide que le lleven", time: "9:02 a. m." },
          { label: "LifeLink redacta el mensaje", time: "9:02 a. m." },
          {
            decision: true,
            label: "Usted cambia una palabra y aprueba la versión 2",
            time: "9:05 a. m.",
          },
          { label: "Enviado a Sam por iMessage", time: "9:05 a. m." },
        ],
      },
      {
        heading: "Lunes por la tarde",
        steps: [
          { label: "Sam responde: «Claro, ¿a las 9:45?»", time: "1:40 p. m." },
          {
            decision: true,
            label: "Usted confirma la hora de recogida",
            time: "1:52 p. m.",
          },
        ],
      },
      {
        heading: "Martes, 27 de octubre",
        steps: [
          { label: "Recordatorio: Sam llega a las 9:45", time: "9:15 a. m." },
          { label: "Cita con el Dr. Patel", time: "10:30 a. m." },
        ],
      },
    ],
    titleLine1: "Qué pasa",
    titleLine2: "después de pedir",
  },
  language: {
    intro:
      "Elija el idioma de esta página. Si crea una cuenta, LifeLink lo conserva. Si ya tiene una, al iniciar sesión se usa el idioma que eligió allí.",
    title: "Idioma",
  },
  messageSlip: {
    approve: "Aprobar y enviar",
    message:
      "Hola, Sam: ¿podrías llevarme al Dr. Patel el martes 27 de octubre? Tengo que estar allí a las 10:30 a. m. ¡Gracias! Ruth",
    notSent: "Aún no se ha enviado",
    sent: "Enviado 9:05 a. m. No se envió nada más.",
    showAgain: "Mostrar de nuevo",
    to: "Para Sam Rivera · iMessage",
    version: "Versión 2",
  },
  nav: {
    howItWorks: "Cómo funciona",
    language: "Idioma",
    questions: "Preguntas",
    scamCheck: "Revisar estafas",
    signIn: "Iniciar sesión",
  },
  previews: {
    approveAndSend: "Aprobar y enviar",
    circle: {
      appointments: "Citas",
      code: "Código de invitación de un solo uso",
      notShared: "No compartido",
      note: "Hasta el 31 de diciembre",
      rides: "Transporte",
      scamAlerts: "Alertas de estafa",
      shared: "Compartido",
      stop: "Dejar de compartir ahora",
      title: "Compartido con Sam Rivera",
    },
    connections: {
      add: "Añadir una cita aprobada",
      footnote: "Cada conexión muestra solo lo que de verdad puede hacer.",
      notReady: "Aún no está listo",
      note: "Conectado",
      see: "Ver sus próximos eventos",
      works: "Funciona",
    },
    documents: {
      files: [
        { date: "12 oct.", name: "Resumen de Medicare.pdf" },
        { date: "30 sept.", name: "Receta de sopa de Ana" },
        { date: "14 sept.", name: "Fotos del jardín" },
      ],
      footnote:
        "Elija un archivo para verlo. Cámbielo o compártalo en Google Drive.",
      title: "Documentos",
    },
    email: {
      anaSubject: "¿Comemos el domingo? ¡Trae el álbum de fotos!",
      draftBody:
        "El domingo me parece estupendo. Llevaré el álbum. ¿Te va bien a las 12:30? Con cariño, Ruth",
      draftTitle: "Respuesta a Ana · borrador, no enviado",
      note: "3 nuevos",
      parcelSender: "Servicio de entrega de paquetes",
      parcelSubject: "Acción necesaria: su paquete está retenido",
      scamWarning:
        "Esto parece una estafa: pide un pago a través de un enlace.",
      title: "Correo",
    },
    family: {
      footnote:
        "Sam puede leer y responder. Sam no puede enviar, aprobar ni gastar por Ruth.",
      nextAppointment: "Próxima cita",
      note: "Lo que ve Sam",
      photos: "2 fotos nuevas del jardín",
      replyLabel: "Responder a Ruth",
      replyText: "¡Nos vemos el martes a las 9:45!",
      title: "Novedades de Ruth",
      when: "Dr. Patel, martes a las 10:30 a. m.",
    },
    groceries: {
      copy: "Copiar lista",
      items: [
        { label: "Leche de avena, 2", value: "$7.98" },
        { label: "Pan integral", value: "$4.49" },
        { label: "Manzanas, 6", value: "$5.20" },
        {
          label: "Ingredientes de sopa para la visita de Ana",
          value: "$18.40",
        },
      ],
      note: "$62 de un presupuesto de $80",
      print: "Imprimir",
      title: "Compra semanal",
    },
    help: {
      answers: "Respuestas",
      language: "Idioma de la ayuda",
      noteLabel: "Nota privada",
      noteText: "No oigo bien por teléfono. Sugiera escribir primero.",
      on: "Sí",
      oneStep: "Un paso a la vez",
      short: "Cortas",
      title: "Cómo prefiero la ayuda",
    },
    recap: {
      agreed: "Acordado",
      agreedText: "Sam le lleva el martes y le recoge a las 9:45.",
      nextStep: "Próximo paso sugerido",
      nextStepText: "Recuérdemelo el lunes por la noche.",
      offered: "Solo ofrecido",
      offeredText: "Puede que Sam traiga a Max.",
      review: "Revisar recordatorio",
      title: "Resumen",
    },
    today: {
      goodNews: "Buenas noticias, elegidas por usted",
      headlines: [
        "La biblioteca amplía su horario los domingos",
        "Voluntarios restauran el jardín de rosas del pueblo",
        "Vuelve el ferry durante el verano",
      ],
      note: "Lunes",
      pickup: "Confirmar que Sam le recoge a las 9:45",
      title: "Buenos días, Ruth",
      waiting: "Le está esperando",
      weather: "El tiempo",
      weatherValue: "58 °F, lluvia ligera",
    },
  },
  promise: {
    howSharingWorks: "Cómo funciona compartir",
    leftImageAlt:
      "Aguafuerte de un anciano que lee un libro con un niño en el regazo, junto a una mesita.",
    leftImageCaption:
      "Jean-Jacques de Boissieu, Anciano leyendo con un niño, 1770.",
    promises: [
      "Nunca enviaremos nada que usted no haya leído y aprobado. Si un mensaje cambia después de que lo apruebe, le volvemos a preguntar.",
      "Su familia puede estar cerca sin tomar el control. Usted elige qué puede ver una persona de confianza, como citas o transporte, y durante cuánto tiempo. Nunca pueden enviar, aprobar ni gastar por usted.",
      "Cuando algo es solo práctica, lo decimos. Cuando algo sale mal, le contamos qué pasó, que no se perdió nada y qué hacer después.",
      "Y nunca le diremos que un mensaje es seguro. Le mostramos las señales de alerta y la decisión queda en sus manos.",
    ],
    rightImageAlt:
      "Un telegrama de Western Union de 1959, escrito a máquina en mayúsculas y sellado con notas a mano.",
    rightImageCaption:
      "Un telegrama de Western Union, 1959. Cada palabra contaba, y alguien firmaba al recibirlo.",
    sharing:
      "Cambie o deje de compartir cuando quiera, desde su Círculo de confianza.",
    signature: "Ayuda diaria. Su decisión.",
    tab: "Nuestra promesa",
    title: "Lo que LifeLink nunca hará",
  },
  questions: {
    imageAlt:
      "Claude Monet, Estanque de nenúfares: un puente verde se arquea sobre un estanque cubierto de nenúfares.",
    imageCaption: "Claude Monet, Estanque de nenúfares, 1900.",
    intro: "Respuestas a lo que más se pregunta, todas en esta página.",
    items: [
      {
        answer:
          "Una familia, correos y una cita de muestra, para que pueda probarlo todo. No se envía nada real y cada resultado lleva la etiqueta Práctica.",
        question: "¿Qué es el modo Práctica?",
      },
      {
        answer:
          "Sí. Diga lo que necesita, y LifeLink puede leerle las respuestas en voz alta a la velocidad que usted elija.",
        question: "¿Puedo hablar en lugar de escribir?",
      },
      {
        answer:
          "No. Solo ven lo que usted comparte y nunca pueden enviar, aprobar ni gastar por usted.",
        question: "¿Puede mi familia actuar por mí?",
      },
      {
        answer:
          "Gmail, Outlook y Google Calendar, además de iMessage, Discord y Telegram. Cada una muestra con claridad qué funciona y qué todavía no.",
        question: "¿Qué cuentas puedo conectar?",
      },
      {
        answer:
          "No. Guarda sus listas, estima los costos y un presupuesto, y luego le permite copiar o imprimir la lista para que haga la compra usted.",
        question: "¿LifeLink hace pedidos de compras?",
      },
      {
        answer:
          "Se convierte en una nueva versión, y LifeLink le pide que la apruebe antes de enviar nada.",
        question: "¿Y si cambio un mensaje?",
      },
      {
        answer:
          "No. Enviado, respondido y confirmado son pasos distintos, y LifeLink le dice con palabras en cuál está.",
        question: "¿«Enviado» es lo mismo que «acordado»?",
      },
      {
        answer:
          "Le nombra las señales de alerta y un próximo paso más seguro. Nunca promete que un mensaje sea seguro.",
        question: "¿Puede decirme que un mensaje es seguro?",
      },
      {
        answer:
          "El solitario sí, y su partida se guarda en este dispositivo. Los mensajes necesitan conexión.",
        question: "¿Funciona sin internet?",
      },
      {
        answer: "Verá qué pasó, que no se perdió nada y qué hacer después.",
        question: "¿Y si algo sale mal?",
      },
    ],
    tab: "Preguntas",
    title: "Preguntas",
  },
  scamCheck: {
    beCareful: "Tenga cuidado con este mensaje.",
    checkMessage: "Revisar un mensaje",
    example: "Ejemplo",
    examples: {
      call: {
        label: "Una llamada",
        nextStep: "Cuelgue y llame a su nieto al número que ya tiene de él.",
        received:
          "Alguien llama y dice que su nieto está en problemas y necesita que le envíen dinero hoy.",
        signs: [
          "Pide dinero con urgencia.",
          "Le pide que mantenga la llamada en secreto.",
          "Quiere el pago con tarjeta de regalo o transferencia.",
        ],
      },
      email: {
        label: "Un correo",
        nextStep:
          "Llame a su banco al número impreso en su tarjeta. No responda a este correo.",
        received:
          "Su cuenta bancaria está bloqueada. Confirme sus datos hoy para evitar el cierre.",
        signs: [
          "Amenaza con cerrar su cuenta.",
          "Le pide confirmar datos privados.",
          "La dirección del remitente no coincide con la de su banco.",
        ],
      },
      letter: {
        label: "Una carta",
        nextStep:
          "Busque usted mismo la empresa del premio antes de pagar o enviar nada.",
        received:
          "Ha ganado $5,000. Envíe $40 de gastos de tramitación para reclamar su premio.",
        signs: [
          "Tiene que pagar antes de recibir nada.",
          "Usted no participó en ningún concurso.",
          "No hay forma de comprobar quién lo envió.",
        ],
      },
      text: {
        label: "Un mensaje de texto",
        nextStep:
          "Abra usted mismo la aplicación o la web de su empresa de envíos. No use este enlace.",
        received:
          "Su paquete está esperando. Pague $1.99 por la nueva entrega en 30 minutos: parcel-redeliver.co/pay",
        signs: [
          "Le mete prisa: pague en 30 minutos.",
          "Pide un pago a través de un enlace.",
          "El enlace no es de la web de una empresa de envíos.",
        ],
      },
    },
    intro:
      "Pegue un mensaje de texto, elija un correo, fotografíe una carta o revise una llamada con el altavoz. LifeLink señala las alertas y sugiere un próximo paso seguro. Nunca le dice que un mensaje es seguro.",
    kinds: "Tipos de mensaje que revisar",
    panelTitle: "Revisar estafas",
    saferStep: "Un próximo paso más seguro",
    tab: "Revisar estafas",
    title: "¿No está seguro de si un mensaje es real?",
    whatItLooksFor: "Qué busca",
  },
  solitaire: {
    boardDescription:
      "Una partida de solitario Klondike en curso. El ocho de picas pasa sobre el nueve de corazones.",
    controls: ["Deshacer", "Pista", "Partida nueva"],
    intro:
      "Klondike con cartas grandes y claras. Toque una carta para moverla o juegue con el teclado. Deshacer y una pista están siempre a un toque, y su partida se guarda en este dispositivo, incluso sin internet.",
    noAccount: "No necesita cuenta.",
    play: "Jugar al solitario",
    saved: "Partida guardada en este dispositivo",
    titleLine1: "Una partida tranquila",
    titleLine2: "de solitario",
  },
  start: {
    alreadyHaveOne: "Creará una cuenta. ¿Ya tiene una?",
    defaultRequest: "¿Puede Sam llevarme a mi cita del martes?",
    intro:
      "Dígale a LifeLink lo que necesita y lea el mensaje completo antes de que se envíe nada. ¿Prefiere echar un vistazo primero? Puede probarlo con mensajes de muestra.",
    myFamily: "Mi propia familia",
    request: "Su petición",
    sampleFamily: "Familia de muestra",
    seeDraft: "Ver el borrador",
    signIn: "Iniciar sesión",
    titleLine1: "Empiece con",
    titleLine2: "una petición",
    tryWith: "Probar con",
    whatHelp: "¿En qué le gustaría recibir ayuda?",
  },
};

export { landing };

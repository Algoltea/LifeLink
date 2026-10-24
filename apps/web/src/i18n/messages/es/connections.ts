import type { ConnectionsMessages } from "../en/connections";

const connections: ConnectionsMessages = {
  account: (label) => `Cuenta: ${label}`,
  allowProvider: (label) => `Elija Permitir en la página de ${label}.`,
  appAccount:
    "Esto funciona a través de la cuenta de la aplicación, así que usted no tiene que iniciar sesión.",
  callback: {
    back: "Volver a Conexiones",
    checking: (label) => `Revisando la conexión de ${label}`,
    connected: (label) => `${label} está conectado.`,
    connectedTitle: (label) => `${label} conectado`,
    declined: (label) =>
      `${label} no terminó de conectarse. No se cambió nada. Puede intentarlo de nuevo.`,
    missing:
      "Esta página se abrió sin una conexión que terminar. Empiece de nuevo desde Conexiones.",
    practice:
      "El modo de práctica está activado. Desactívelo en Configuración antes de terminar una conexión real.",
    service: "El servicio",
    subline:
      "Vuelva a Conexiones para revisar sus servicios o empezar de nuevo.",
    title: "Estado de la conexión",
    unavailable:
      "Este servicio no tiene una conexión disponible en LifeLink. Vuelva a Conexiones para revisar sus limitaciones.",
  },
  canDo: "Qué puede hacer",
  cancel: "Cancelar",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Cerrar",
  comingLater: "Disponible más adelante",
  connect: "Conectar",
  connectProvider: (label) => `Conectar ${label}`,
  connectionState: (status) => `El estado de la conexión es: ${status}.`,
  connectionStates: {
    active: "activa",
    deleted: "eliminada",
    expired: "vencida",
    failed: "fallida",
    inactive: "inactiva",
    initiated: "iniciada",
    pending: "pendiente",
    revoked: "revocada",
  },
  detailLabel: (label, summary) => `${label}. ${summary} Detalles.`,
  details: "Detalles",
  developerSetupAfter: (label) => ` y elija ${label}.`,
  developerSetupBefore: "Para quien administra LifeLink: ejecute ",
  disconnect: (label) => `Desconectar ${label}`,
  disconnectPractice: "Desconectar cuenta de práctica",
  disconnectTip: (label) =>
    `Consejo: esa persona puede desconectar ${label} desde esta ventana cuando quiera.`,
  disconnected: (label) =>
    `Se desconectó ${label}. Nada lo usará a partir de ahora.`,
  discordSetup: (practice) =>
    `${practice ? "Cuando use Discord real, agregue" : "Agregue"} el ID de usuario de Discord de cada persona en Círculo de confianza.`,
  empty: "No hay servicios en la lista.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "Las conexiones todavía no están configuradas para esta aplicación. Ejecute bun run dev:setup.",
    "Please sign in again.": "Vuelva a iniciar sesión.",
    "Practice connections are only available in practice mode.":
      "Las conexiones de práctica solo están disponibles en el modo de práctica.",
    "That account could not be found.": "No se encontró esa cuenta.",
    "That connection could not be found.": "No se encontró esa conexión.",
    "The connection did not finish. You can try again.":
      "La conexión no terminó. Puede intentarlo de nuevo.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "Esta conexión cambió mientras se procesaba la solicitud. Vuelva a Conexiones para revisar su estado.",
    "This connection was not started from your account. Please try connecting again.":
      "Esta conexión no se inició desde su cuenta. Intente conectarse de nuevo.",
    "This service does not use a personal sign-in.":
      "Este servicio no usa un inicio de sesión personal.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "Desactive el modo de práctica en Configuración antes de conectar o cambiar una cuenta real.",
    "We could not confirm the connection.": "No pudimos confirmar la conexión.",
  },
  groups: {
    appointments: "Administrar citas",
    email: "Leer y escribir correos",
    messages: "Enviar mensajes a familiares y amigos",
  },
  helperTitle: "¿Está configurando esto para otra persona?",
  imessageIntro:
    "Vincule a cada persona de su Círculo de confianza con su contacto existente en Photon. LifeLink no registra contactos nuevos.",
  imessageSteps: [
    "Guarde el número de teléfono o el correo del Apple ID exacto desde el que envían iMessages. Un número de teléfono y un correo son identidades distintas, incluso para la misma persona.",
    "Asegúrese de que esa dirección exacta ya esté registrada en el panel de Photon. Si falta, agregue allí el contacto primero. Después elija Vincular iMessage en Círculo de confianza y use el número asignado que aparece para ese contacto.",
    "Pídales que envíen el primer iMessage a su número asignado desde esa dirección exacta guardada. LifeLink puede enviarles mensajes después de que llegue su primer mensaje.",
  ],
  intro: (label) =>
    `LifeLink puede hacer estas cosas con ${label}. No se envía nada hasta que usted lo apruebe.`,
  limitTags: {
    not_offered: "No es posible",
    not_wired: "Disponible más adelante",
  },
  limitsCount: (count) => `Qué no puede hacer LifeLink todavía (${count})`,
  limitsTitle: "Qué no puede hacer LifeLink todavía",
  loading: "Cargando conexiones",
  manage: "Administrar",
  notSetUp:
    "Esto todavía no está activado. Pida a la persona que configuró LifeLink que lo active.",
  openCircle: "Abrir Círculo de confianza",
  permissions: {
    add: "Agregar",
    calendar: "Buscar fechas",
    draft: "Borrador",
    message: "Mensaje",
    money: "Dinero",
    notice: "Avisos",
    post: "Publicar",
    read: "Leer",
    replies: "Respuestas",
    send: "Enviar",
    unavailable: "Nada todavía",
  },
  practiceAccount: "Usar una cuenta de práctica",
  practiceBlocked: (label) =>
    `Su conexión real de ${label} está guardada. Las cuentas de práctica no pueden reemplazarla. Desactive el modo de práctica en Configuración para administrarla.`,
  practiceConnected: (label) =>
    `Se conectó una cuenta de práctica de ${label}. Nunca se comunica con el servicio real.`,
  practiceDisconnected: (label) =>
    `Se desconectó la cuenta de práctica de ${label}.`,
  practiceMessages: (imessage) =>
    imessage
      ? "Los iMessages de práctica son simulados. Ningún mensaje llega a sus contactos."
      : "Los mensajes de Discord de práctica son simulados. Ningún mensaje llega a sus contactos.",
  practiceNeverConnects:
    "Esta cuenta de práctica nunca se conecta al servicio real.",
  pressConnect: (label) => `Pulse ${label} abajo.`,
  providers: {
    discord: {
      accountRequirement:
        "Su familiar comparte un servidor con el bot de la aplicación o ya le ha enviado un mensaje al bot.",
      capabilities: {
        "discord.receive": {
          label: "Recibir respuestas",
          note: "Las respuestas llegan mientras el bot de Discord de LifeLink está en línea.",
        },
        "discord.send": {
          label: "Enviar un mensaje directo después de que usted lo apruebe",
        },
      },
      summary: "Mensajes directos con familiares en Discord.",
    },
    ebay: {
      accountRequirement:
        "Las cuentas personales de eBay no se pueden conectar aquí.",
      capabilities: {
        "ebay.search": {
          label: "Buscar anuncios en eBay",
        },
        "ebay.selling": {
          label: "Sus anuncios, pedidos o compras",
        },
      },
      summary:
        "La búsqueda estará disponible más adelante. LifeLink nunca compra ni vende.",
    },
    facebook: {
      accountRequirement:
        "Solo funciones de páginas de Facebook. No se admiten perfiles personales.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Leer y responder los mensajes de su página",
        },
        "facebook.page_post": {
          label: "Publicar en una página después de que usted lo apruebe",
        },
        "facebook.personal": {
          label: "Cronología personal y mensajes de amigos",
          note: "Facebook no permite que las aplicaciones lean ni envíen conversaciones personales de Messenger.",
        },
      },
      summary: "Solo páginas de empresas. Disponible más adelante.",
    },
    gmail: {
      accountRequirement: "Una cuenta de Google.",
      capabilities: {
        "email.appointments": {
          label: "Encontrar citas en los correos",
        },
        "email.draft": {
          label: "Escribir un borrador para que usted lo revise",
        },
        "email.new_message_event": {
          label:
            "Avisar de correos nuevos (se revisa aproximadamente una vez por minuto)",
        },
        "email.read_selected": {
          label: "Leer los correos que usted elija para un resumen",
        },
        "email.send": {
          label: "Enviar un correo después de que usted lo apruebe",
        },
      },
      summary: "Lea, escriba y envíe correos. Encuentre citas en su correo.",
    },
    google_calendar: {
      accountRequirement: "Una cuenta de Google.",
      capabilities: {
        "calendar.create": {
          label: "Agregar una cita aprobada",
        },
        "calendar.read": {
          label: "Ver sus próximos eventos",
        },
      },
      summary: "Agregue citas a su calendario después de aprobarlas.",
    },
    google_drive: {
      accountRequirement: "Una cuenta de Google.",
      capabilities: {
        "drive.create": {
          label:
            "Guardar notas de una cita como documento después de que usted lo apruebe",
        },
        "drive.read": {
          label: "Encontrar archivos que ya tiene en Drive",
          note: "LifeLink ve los nombres y enlaces de los archivos, no su contenido.",
        },
      },
      summary: "Encuentre sus archivos y guarde notas de sus citas.",
    },
    imessage: {
      accountRequirement:
        "Sus contactos no necesitan una invitación, una cuenta de LifeLink ni acceso al panel de Photon.",
      capabilities: {
        "imessage.delivery": {
          label: "Actualizaciones de entrega",
          note: "LifeLink sabe que su mensaje se envió, pero no si llegó o se leyó.",
        },
        "imessage.first_contact": {
          label: "Iniciar una conversación con alguien nuevo",
          note: "Cada persona debe enviar el primer mensaje.",
        },
        "imessage.receive": {
          label: "Recibir respuestas",
        },
        "imessage.send": {
          label: "Enviar un texto o una foto después de que usted lo apruebe",
          note: "Funciona después de que la otra persona envíe el primer mensaje.",
        },
      },
      summary:
        "Envíe mensajes a familiares y amigos. Cada persona envía el primer mensaje.",
    },
    instacart: {
      accountRequirement:
        "Las compras a través de LifeLink ya no están disponibles.",
      capabilities: {},
      summary: "Las compras a través de LifeLink ya no están disponibles.",
    },
    instagram: {
      accountRequirement: "Una cuenta de empresa o de creador de Instagram.",
      capabilities: {
        "instagram.messages": {
          label: "Responder mensajes directos",
        },
        "instagram.personal": {
          label: "Cuentas personales",
        },
        "instagram.post": {
          label: "Compartir una foto después de que usted lo apruebe",
        },
      },
      summary: "Solo cuentas de empresa y de creador. Disponible más adelante.",
    },
    outlook: {
      accountRequirement:
        "Una cuenta de Microsoft. Algunas cuentas de trabajo necesitan el consentimiento de un administrador.",
      capabilities: {
        "calendar.create": {
          label: "Agregar una cita aprobada a su calendario de Outlook",
        },
        "email.draft": {
          label: "Escribir un borrador para que usted lo revise",
        },
        "email.new_message_event": {
          label: "Avisar de correos nuevos cuando lleguen",
        },
        "email.read_selected": {
          label: "Leer los correos que usted elija para un resumen",
        },
        "email.send": {
          label: "Enviar un correo después de que usted lo apruebe",
        },
      },
      summary: "Correo y calendario de Outlook en una sola conexión.",
    },
    paypal: {
      accountRequirement:
        "Las cuentas personales de PayPal no se pueden conectar aquí.",
      capabilities: {
        "paypal.invoices": {
          label: "Consultar facturas",
        },
        "paypal.send_money": {
          label: "Enviar dinero a una persona",
          note: "LifeLink nunca envía dinero.",
        },
      },
      summary:
        "Las facturas estarán disponibles más adelante. LifeLink nunca envía dinero.",
    },
    telegram: {
      accountRequirement:
        "Su familiar abre el enlace que LifeLink crea para esa persona y toca Iniciar en Telegram.",
      capabilities: {
        "telegram.first_contact": {
          label: "Iniciar una conversación con alguien nuevo",
          note: "Cada persona debe tocar Iniciar en el bot primero.",
        },
        "telegram.receive": {
          label: "Recibir respuestas",
        },
        "telegram.send": {
          label: "Enviar un mensaje o fotos después de que usted lo apruebe",
        },
      },
      summary: "Mensajes con familiares en Telegram.",
    },
  },
  realImessage: "Cuando use iMessage real, siga estos pasos.",
  requirements: "Qué necesita",
  retry: "Intentar conectar de nuevo",
  returnConnected: "Al volver aquí, verá Conectado.",
  setup: "Configurar",
  signInProvider: (label) =>
    `Iniciará sesión en la página de ${label}. LifeLink nunca ve su contraseña.`,
  signInTheirAccount:
    "Inicie sesión con la cuenta de esa persona, no con la suya.",
  status: {
    connected: "Conectado",
    disconnected: "Sin conectar",
    error: "No se conectó",
    notOn: "Sin activar",
    pending: "Sin terminar",
    practice: "Práctica",
    practiceAccount: "Cuenta de práctica",
    ready: "Listo",
    realSaved: "Cuenta real guardada",
  },
  subline:
    "Conecte los servicios que ya usa. Abra uno para ver qué puede hacer LifeLink con él.",
  telegramSetup: (practice) =>
    `${practice ? "Cuando use Telegram real, abra" : "Abra"} a cada persona en Círculo de confianza, elija Vincular Telegram y envíele su enlace. Esa persona toca Iniciar una vez.`,
  title: "Conexiones",
  unavailableFeatures: (label) =>
    `${label} todavía no tiene funciones disponibles en LifeLink. No necesita conectar una cuenta.`,
  unavailableIntro: (label) =>
    `LifeLink todavía no puede hacer nada con ${label}.`,
};

export { connections };

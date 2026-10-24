import type { appExtras as EnglishAppExtras } from "../en/app-extras";

const appExtras: typeof EnglishAppExtras = {
  approvalRecorded: (label: string): string =>
    `Aprobación registrada: ${label}`,
  loading: {
    addPerson: "Añadir una persona",
    addPhoto: "Añadir una foto",
    app: "Cargando LifeLink",
    beforeSending: "antes de enviar",
    call: "Llamar",
    checkPhoto: "Comprobar esta foto",
    checks: "Cargando sus comprobaciones",
    chooseFile: "Elija un archivo para ver aquí una vista previa.",
    choosePhoto: "Elegir una foto",
    circle: "Cargando su círculo de confianza",
    circleBody:
      "Las personas en quienes confía, cómo contactarlas y exactamente qué puede ver cada una.",
    circleTitle: "Círculo de confianza",
    connectEmail: "Conectar Gmail u Outlook",
    connections: "Cargando conexiones",
    connectionsBody:
      "Elija en qué necesita ayuda. Abra una tarjeta para ver todo lo que puede hacer antes de conectar.",
    connectionsTitle: "Conexiones",
    conversation: "Cargando la conversación",
    conversations: "Cargando conversaciones",
    conversationsTitle: "Conversaciones",
    documentsTitle: "Documentos",
    drive: "Cargando sus archivos de Drive",
    driveNotice:
      "Practique con archivos de ejemplo de Drive y las notas que guarde en el modo de práctica. Nada de aquí proviene de una cuenta real de Google.",
    earlierChecks: "Comprobaciones anteriores",
    edit: "Editar",
    email: "Cargando el correo",
    emailTitle: "Correo",
    emails: "Cargando correos",
    familyBody:
      "Vea solo lo que cada persona decida compartir. Puede consultar, pero nunca enviar, aprobar ni gastar nada en su nombre.",
    familyTitle: "Familia",
    groceriesBody:
      "Lleve una lista de compras, planifique su presupuesto y copie o imprima lo que necesite.",
    groceriesTitle: "Compras",
    helpUnderstand: "Ayúdeme a entender",
    inbox: "Bandeja de entrada",
    listenCall: "Escuchar una llamada",
    lists: "Cargando sus listas",
    message: "Mensaje",
    messagesBody:
      "Escriba a las personas de su círculo de confianza. Verá cada mensaje antes de enviarlo.",
    messagesTitle: "Mensajes",
    notSharing: "No está compartiendo nada con nadie.",
    page: "Cargando su página",
    permissions: "Permisos",
    photo: "Foto",
    practiceCall: "Probar una llamada de práctica",
    practiceMessage: "Práctica: no se les enviará nada.",
    readAloud: "Leer en voz alta",
    readDay: "Leer mi día en voz alta",
    recap: "Resumir",
    recapBody:
      "LifeLink puede resumir lo que usted y su familia acordaron, lo que solo se ofreció y lo que sigue pendiente.",
    recapConversation: "Resumir esta conversación",
    recapPractice:
      "En el modo de práctica, LifeLink genera el resumen por sí mismo. Los mensajes de práctica nunca se envían a un proveedor de IA.",
    review: "Revisar",
    scamBody:
      "¿Tiene dudas sobre un mensaje o una llamada? LifeLink busca señales de alerta antes de que actúe.",
    scamTitle: "Comprobar estafas",
    settings: "Cargando los ajustes",
    settingsBody: "Ajuste LifeLink para leer y escuchar con comodidad.",
    settingsTitle: "Ajustes",
    shared: "Cargando la información compartida",
    startListening: "Empezar a escuchar",
    takePhoto: "Tomar una foto",
    task: "Cargando los detalles de la tarea",
    text: "Texto",
    thisConversation: "esta conversación",
    today: "Cargando el día de hoy",
    yourFiles: "Sus archivos",
  },
  openingFamily: "Abriendo su vista familiar",
  phone: {
    allCountries: "Todos los países",
    common: "Frecuentes",
    countryCode: "Código de país",
    other: "Otro: escriba el código +",
  },
  signIn: {
    backHome: "Volver al inicio",
    body: "Inicie sesión para ver los mensajes y las citas de hoy. No se envía nada hasta que usted lo autorice.",
    breakPrompt: "¿Solo quiere descansar un rato?",
    busy: "Un momento…",
    connectionError:
      "No pudimos conectarnos. Compruebe su conexión a internet e inténtelo de nuevo.",
    createAccount: "Crear cuenta",
    createBody: "Solo toma un minuto. Puede agregar a su familia después.",
    createError: "No pudimos crear la cuenta. Inténtelo de nuevo.",
    createOption: "Crear una cuenta",
    createTitle: "Comencemos.",
    email: "Correo electrónico",
    friend: "Amigo",
    hide: "Ocultar",
    hidePassword: "Ocultar contraseña",
    mismatch:
      "El correo y la contraseña no coinciden. Revíselos e inténtelo de nuevo.",
    modeLabel: "Iniciar sesión o crear una cuenta",
    name: "Su nombre completo",
    or: ", o ",
    paintingAlt: {
      "sign-in":
        "Claude Monet, Woman with a Parasol: una mujer sostiene una sombrilla verde en una colina ventosa bajo un cielo luminoso, con su hijo pequeño cerca, entre la hierba.",
      "sign-up":
        "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte: varias personas descansan sobre el césped soleado junto al río, mientras una pareja bajo una sombrilla está junto a un perro pequeño y un mono de compañía.",
    },
    password: "Contraseña",
    passwordHint: (count: number): string => `Al menos ${count} caracteres.`,
    passwordMinimum: (count: number): string =>
      `Elija una contraseña de al menos ${count} caracteres.`,
    play: "Jugar al solitario sin iniciar sesión",
    playMahjong: "jugar al Mahjong",
    show: "Mostrar",
    showPassword: "Mostrar contraseña",
    signIn: "Iniciar sesión",
    welcome: "Le damos la bienvenida de nuevo.",
  },
  timeZone: {
    all: "Todas las zonas horarias",
    common: "Frecuentes",
  },
};

export { appExtras };

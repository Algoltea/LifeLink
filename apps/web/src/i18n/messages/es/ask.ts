import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "Cerrar el historial",
  composerLabel: "Escríbale o háblele a LifeLink",
  conversationLabel: "Conversación con LifeLink",
  copied: "Copiado",
  copy: "Copiar",
  copyUnavailable:
    "Aquí no se puede copiar. Puede seleccionar el texto en su lugar.",
  emailSummary: {
    cloud: "Resumen en la nube",
    cloudConsent:
      "Usar IA en la nube para un resumen más completo. Esto envía al proveedor de IA el texto disponible y los resúmenes guardados de mis 15 correos importados más recientes. Déjelo sin marcar para resumir en LifeLink.",
    count: (count) => `${count} correos importados recientes · `,
    empty:
      "Todavía no hay correos importados. Busque correo nuevo en la página Correo y vuelva a resumir.",
    emptyGroup: "No hay correos en esta categoría.",
    groups: {
      check_first: "Revisar antes de actuar",
      low_priority: "Menos importante",
      reply: "Puede necesitar respuesta",
      review: "Vale la pena mirar",
    },
    howMade: "Cómo se hizo este resumen",
    local: "Resumen de LifeLink",
    noSubject: "(Sin asunto)",
    offline: "Conéctese para resumir sus correos importados.",
    openEmail: "Abrir Correo",
    options: "Opciones del resumen",
    practicePrefix: "Práctica · ",
    suggestionsOnly:
      "Solo son sugerencias. Revise los mensajes originales antes de actuar. No se envió ni se cambió nada en su buzón.",
    summarize: "Resumir correos",
    summarizing: "Resumiendo los correos…",
    title: "Resumen del correo reciente",
    working: "Agregando el resumen del correo a esta conversación…",
  },
  failed: "Esa respuesta no terminó. Por favor, pregunte otra vez.",
  history: "Historial",
  historyDescription: "Siga donde lo dejó.",
  historyEmpty:
    "Todavía no hay conversaciones. Su primera conversación se guardará aquí.",
  historyGroups: {
    earlier: "Antes",
    thisWeek: "Esta semana",
  },
  historyTitle: "Historial de conversaciones",
  lifeLinkSaid: "LifeLink dijo: ",
  loadEarlier: "Mostrar mensajes anteriores",
  loadEarlierConversations: "Mostrar conversaciones anteriores",
  loadingConversation: "Cargando su conversación",
  loadingConversations: "Cargando conversaciones…",
  loadingEarlier: "Cargando mensajes anteriores…",
  loadingHistory: "Cargando su historial",
  newChat: "Nueva conversación",
  openNow: ", abierta ahora",
  opening: "Abriendo su conversación",
  quickActions: "Acciones rápidas",
  suggestions: {
    reminder: {
      label: "Poner un recordatorio",
      prompt: "Recuérdame ",
    },
    ride: {
      label: "Pedir que me lleven",
      prompt:
        "Pregúntale a mi familia si alguien me puede llevar a mi cita el ",
    },
    write: {
      label: "Escribir a la familia",
      prompt: "Ayúdame a escribirle un mensaje a ",
    },
  },
  thinking: "Pensando…",
  title: "Pregúntele a LifeLink",
  titlePrefix: "Pregúntele a LifeLink: ",
  waitingConnection: "Esperando conexión. No se ha enviado nada.",
  waitingForConnection: "Mensajes esperando conexión",
  whatCanIHelp: "¿En qué le puedo ayudar hoy?",
  youSaid: "Usted dijo: ",
  yourConversation: "Su conversación",
};

export { ask };

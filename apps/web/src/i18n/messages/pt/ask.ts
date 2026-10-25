import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "Fechar histórico de conversas",
  composerLabel: "Escreva ou fale com o LifeLink",
  conversationLabel: "Conversa com o LifeLink",
  copied: "Copiado",
  copy: "Copiar",
  copyUnavailable: "Não é possível copiar aqui. Você pode selecionar o texto.",
  emailSummary: {
    cloud: "Resumo na nuvem",
    cloudConsent:
      "Usar IA na nuvem para um resumo mais completo. Isso envia o texto disponível e os resumos salvos dos meus 15 e-mails importados mais recentes ao provedor de IA. Deixe desmarcado para resumir no LifeLink.",
    count: (count) =>
      `${count} ${count === 1 ? "e-mail recente importado" : "e-mails recentes importados"} · `,
    empty:
      "Ainda não há e-mails importados. Verifique novas mensagens na página E-mail e faça o resumo novamente.",
    emptyGroup: "Nenhum e-mail nesta categoria.",
    groups: {
      check_first: "Verificar antes de agir",
      low_priority: "Prioridade menor",
      reply: "Pode precisar de resposta",
      review: "Vale a pena conferir",
    },
    howMade: "Como este resumo foi feito",
    local: "Resumo do LifeLink",
    noSubject: "(Sem assunto)",
    offline: "Conecte-se para resumir seus e-mails importados.",
    openEmail: "Abrir E-mail",
    options: "Opções do resumo",
    practicePrefix: "Prática · ",
    suggestionsOnly:
      "São apenas sugestões. Confira as mensagens originais antes de agir. Nada foi enviado nem alterado na sua caixa de e-mail.",
    summarize: "Resumir e-mails",
    summarizing: "Resumindo e-mails…",
    title: "Resumo dos e-mails recentes",
    working: "Adicionando o resumo dos e-mails a esta conversa…",
  },
  failed: "A resposta não foi concluída. Faça o pedido novamente.",
  history: "Histórico",
  historyDescription: "Continue de onde parou.",
  historyEmpty:
    "Ainda não há conversas. Sua primeira conversa será salva aqui.",
  historyGroups: {
    earlier: "Anteriores",
    thisWeek: "Esta semana",
  },
  historyTitle: "Histórico de conversas",
  lifeLinkSaid: "O LifeLink disse: ",
  loadEarlier: "Mostrar mensagens anteriores",
  loadEarlierConversations: "Mostrar conversas anteriores",
  loadingConversation: "Carregando sua conversa",
  loadingConversations: "Carregando conversas…",
  loadingEarlier: "Carregando mensagens anteriores…",
  loadingHistory: "Carregando seu histórico de conversas",
  newChat: "Nova conversa",
  openNow: ", aberta agora",
  opening: "Abrindo sua conversa",
  quickActions: "Ações rápidas",
  suggestions: {
    reminder: {
      label: "Criar um lembrete",
      prompt: "Lembre-me de ",
    },
    ride: {
      label: "Pedir uma carona",
      prompt:
        "Pergunte à minha família se alguém pode me levar ao compromisso em ",
    },
    write: {
      label: "Escrever para a família",
      prompt: "Ajude-me a escrever uma mensagem para ",
    },
  },
  thinking: "Pensando…",
  title: "Perguntar ao LifeLink",
  titlePrefix: "Perguntar ao LifeLink: ",
  waitingConnection: "Aguardando conexão. Nada foi enviado.",
  waitingForConnection: "Mensagens aguardando conexão",
  whatCanIHelp: "Como posso ajudar você hoje?",
  youSaid: "Você disse: ",
  yourConversation: "Sua conversa",
};

export { ask };

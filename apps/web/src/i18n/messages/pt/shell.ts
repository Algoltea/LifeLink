import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "Menu da conta de ",
  closeMenu: "Fechar menu",
  dismissNotice: "Dispensar aviso",
  familyMember: "Familiar",
  groupGames: "Jogos",
  groupHelpWith: "Ajuda com",
  groupSetup: "Suas configurações",
  mainNavigation: "Principal",
  menu: "Menu",
  nav: {
    ask: "Perguntar ao LifeLink",
    circle: "Círculo de confiança",
    connections: "Conexões",
    documents: "Documentos",
    email: "E-mail",
    family: "Família",
    groceries: "Lista de compras",
    mahjong: "Mahjong",
    messages: "Mensagens",
    scam: "Verificar golpes",
    settings: "Configurações",
    solitaire: "Paciência",
    today: "Hoje",
  },
  needsReview: (label) => `${label} precisa da sua revisão.`,
  notTriedAgain: "Não haverá nova tentativa automática.",
  offline:
    "Você está sem conexão. Pode continuar escrevendo; tudo o que aprovar será verificado novamente e enviado quando a conexão voltar.",
  offlineReview: "As atividades preparadas sem conexão precisam da sua revisão",
  offlineWaiting: (count) => ` ${count} aguardando.`,
  openAsk: "Abrir Perguntar",
  openMenu: "Abrir menu",
  originalRequest: "Seu pedido original",
  playAccount:
    "Seus jogos ficam salvos neste dispositivo e funcionam sem conexão.",
  practiceBannerOn: "O modo de prática está ativado.",
  practiceBannerRest: "Nenhuma mensagem real é enviada.",
  practiceMode: "Modo de prática",
  reviewOnToday: "Revisar em Hoje",
  signOut: "Sair",
  skipToMain: "Pular para o conteúdo principal",
  turnOffPractice: "Desativar modo de prática",
  yourOfflineRequest: "Seu pedido feito sem conexão",
};

export { shell };

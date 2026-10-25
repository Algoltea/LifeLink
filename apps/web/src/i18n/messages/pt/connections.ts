import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label) => `Conta: ${label}`,
  allowProvider: (label) => `Escolha Permitir na página de ${label}.`,
  appAccount:
    "Esta função usa a conta do próprio aplicativo, então você não precisa entrar em nenhuma conta.",
  callback: {
    back: "Voltar para Conexões",
    checking: (label) => `Verificando a conexão com ${label}`,
    connected: (label) => `${label} está conectado.`,
    connectedTitle: (label) => `${label} conectado`,
    declined: (label) =>
      `A conexão com ${label} não foi concluída. Nada foi alterado. Você pode tentar novamente.`,
    missing:
      "Esta página foi aberta sem uma conexão para concluir. Comece novamente em Conexões.",
    practice:
      "O modo de prática está ativado. Desative em Configurações antes de concluir uma conexão real.",
    service: "O serviço",
    subline:
      "Volte para Conexões para conferir seus serviços ou começar novamente.",
    title: "Estado da conexão",
    unavailable:
      "Este serviço não tem conexão disponível no LifeLink. Volte para Conexões para conferir suas limitações.",
  },
  canDo: "O que pode fazer",
  cancel: "Cancelar",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Fechar",
  comingLater: "Disponível futuramente",
  connect: "Conectar",
  connectProvider: (label) => `Conectar ${label}`,
  connectionState: (status) => `Estado da conexão: ${status}.`,
  connectionStates: {
    active: "ativa",
    deleted: "excluída",
    expired: "expirada",
    failed: "falhou",
    inactive: "inativa",
    initiated: "iniciada",
    pending: "pendente",
    revoked: "revogada",
  },
  detailLabel: (label, summary) => `${label}. ${summary} Detalhes.`,
  details: "Detalhes",
  developerSetupAfter: (label) => ` e escolha ${label}.`,
  developerSetupBefore: "Para quem administra o LifeLink: execute ",
  disconnect: (label) => `Desconectar ${label}`,
  disconnectPractice: "Desconectar conta de prática",
  disconnectTip: (label) =>
    `Dica: a pessoa pode desconectar ${label} nesta janela a qualquer momento.`,
  disconnected: (label) =>
    `${label} foi desconectado. Nada o usará daqui em diante.`,
  discordSetup: (practice) =>
    `${practice ? "Quando usar o Discord real, adicione" : "Adicione"} o ID de usuário do Discord de cada pessoa no Círculo de confiança.`,
  empty: "Nenhum serviço listado.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "As conexões ainda não estão configuradas para este aplicativo. Execute bun run dev:setup.",
    "Please sign in again.": "Entre novamente.",
    "Practice connections are only available in practice mode.":
      "As conexões de prática só estão disponíveis no modo de prática.",
    "That account could not be found.":
      "Não foi possível encontrar essa conta.",
    "That connection could not be found.":
      "Não foi possível encontrar essa conexão.",
    "The connection did not finish. You can try again.":
      "A conexão não foi concluída. Você pode tentar novamente.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "Esta conexão mudou durante o pedido. Volte para Conexões para verificar seu estado.",
    "This connection was not started from your account. Please try connecting again.":
      "Esta conexão não foi iniciada pela sua conta. Tente conectar novamente.",
    "This service does not use a personal sign-in.":
      "Este serviço não usa acesso por conta pessoal.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "Desative o modo de prática em Configurações antes de conectar ou alterar uma conta real.",
    "We could not confirm the connection.":
      "Não conseguimos confirmar a conexão.",
  },
  groups: {
    appointments: "Gerenciar compromissos",
    email: "Ler e escrever e-mails",
    messages: "Enviar mensagens à família e aos amigos",
  },
  helperTitle: "Você está configurando para outra pessoa?",
  imessageIntro:
    "Vincule cada pessoa do Círculo de confiança ao contato já existente no Photon. O LifeLink não cadastra novos contatos.",
  imessageSteps: [
    "Salve o número de telefone ou e-mail do Apple ID exatos de onde a pessoa envia iMessages. Um número de telefone e um endereço de e-mail são identidades separadas, mesmo para a mesma pessoa.",
    "Confira se este endereço exato já está cadastrado no painel do Photon. Se não estiver, adicione o contato lá primeiro. Depois escolha Vincular iMessage no Círculo de confiança e use o número atribuído mostrado para esse contato.",
    "Peça à pessoa para enviar o primeiro iMessage ao número atribuído a partir daquele endereço exato salvo. O LifeLink poderá enviar mensagens depois que a primeira mensagem dela chegar.",
  ],
  intro: (label) =>
    `O LifeLink pode fazer estas coisas com ${label}. Nada é enviado até você aprovar.`,
  limitTags: {
    not_offered: "Não é possível",
    not_wired: "Disponível futuramente",
  },
  limitsCount: (count) => `O que o LifeLink ainda não pode fazer (${count})`,
  limitsTitle: "O que o LifeLink ainda não pode fazer",
  loading: "Carregando conexões",
  manage: "Gerenciar",
  notSetUp:
    "Esta função ainda não está ativada. Peça à pessoa que configurou o LifeLink para ativá-la.",
  openCircle: "Abrir Círculo de confiança",
  permissions: {
    add: "Adicionar",
    calendar: "Encontrar datas",
    draft: "Criar rascunhos",
    message: "Mensagens",
    money: "Dinheiro",
    notice: "Avisos",
    post: "Publicar",
    read: "Lido",
    replies: "Respostas",
    send: "Enviar",
    unavailable: "Nada por enquanto",
  },
  practiceAccount: "Usar uma conta de prática",
  practiceBlocked: (label) =>
    `Sua conexão real com ${label} está salva. Contas de prática não podem substituí-la. Desative o modo de prática em Configurações para gerenciar.`,
  practiceConnected: (label) =>
    `Uma conta de prática de ${label} está conectada. Ela nunca entra em contato com o serviço real.`,
  practiceDisconnected: (label) =>
    `A conta de prática de ${label} foi desconectada.`,
  practiceMessages: (imessage) =>
    imessage
      ? "Os iMessages de prática são simulados. Nenhuma mensagem chega aos seus contatos."
      : "As mensagens de prática do Discord são simuladas. Nenhuma mensagem chega aos seus contatos.",
  practiceNeverConnects:
    "Esta conta de prática nunca se conecta ao serviço real.",
  pressConnect: (label) => `Pressione ${label} abaixo.`,
  providers: {
    discord: {
      accountRequirement:
        "O familiar participa de um servidor com o bot do aplicativo ou já enviou uma mensagem ao bot.",
      capabilities: {
        "discord.receive": {
          label: "Receber respostas",
          note: "As respostas chegam enquanto o bot do Discord do LifeLink está online.",
        },
        "discord.send": {
          label: "Enviar uma mensagem direta depois da sua aprovação",
        },
      },
      summary: "Mensagens diretas com familiares no Discord.",
    },
    ebay: {
      accountRequirement:
        "Não é possível conectar contas pessoais do eBay aqui.",
      capabilities: {
        "ebay.search": {
          label: "Pesquisar anúncios no eBay",
        },
        "ebay.selling": {
          label: "Seus anúncios, pedidos ou compras",
        },
      },
      summary:
        "A pesquisa estará disponível futuramente. O LifeLink nunca compra nem vende.",
    },
    facebook: {
      accountRequirement:
        "Apenas funções de Páginas do Facebook. Perfis pessoais não são compatíveis.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Ler e responder às mensagens da sua Página",
        },
        "facebook.page_post": {
          label: "Publicar em uma Página depois da sua aprovação",
        },
        "facebook.personal": {
          label: "Linha do tempo pessoal e mensagens de amigos",
          note: "O Facebook não permite que aplicativos leiam ou enviem conversas pessoais do Messenger.",
        },
      },
      summary: "Apenas Páginas comerciais. Disponível futuramente.",
    },
    gmail: {
      accountRequirement: "Uma conta do Google.",
      capabilities: {
        "email.appointments": {
          label: "Encontrar compromissos nos e-mails",
        },
        "email.draft": {
          label: "Escrever um rascunho para você revisar",
        },
        "email.new_message_event": {
          label:
            "Avisar sobre novos e-mails (verificados cerca de uma vez por minuto)",
        },
        "email.read_selected": {
          label: "Ler os e-mails que você escolher para um resumo",
        },
        "email.send": {
          label: "Enviar um e-mail depois da sua aprovação",
        },
      },
      summary:
        "Leia, escreva e envie e-mails. Encontre compromissos nas mensagens.",
    },
    google_calendar: {
      accountRequirement: "Uma conta do Google.",
      capabilities: {
        "calendar.create": {
          label: "Adicionar um compromisso aprovado",
        },
        "calendar.read": {
          label: "Ver seus próximos eventos",
        },
      },
      summary: "Adicione compromissos ao seu calendário depois de aprovar.",
    },
    google_drive: {
      accountRequirement: "Uma conta do Google.",
      capabilities: {
        "drive.create": {
          label:
            "Salvar notas de um compromisso como documento depois da sua aprovação",
        },
        "drive.read": {
          label: "Encontrar arquivos que você já guarda no Drive",
          note: "O LifeLink vê nomes e links dos arquivos, não o conteúdo.",
        },
      },
      summary: "Encontre seus arquivos e salve notas de compromissos.",
    },
    imessage: {
      accountRequirement:
        "Seus contatos não precisam de convite, conta no LifeLink nem acesso ao painel do Photon.",
      capabilities: {
        "imessage.delivery": {
          label: "Atualizações de entrega",
          note: "O LifeLink sabe que sua mensagem foi enviada, mas não se chegou ou foi lida.",
        },
        "imessage.first_contact": {
          label: "Iniciar uma conversa com alguém novo",
          note: "Cada pessoa precisa enviar a primeira mensagem.",
        },
        "imessage.receive": {
          label: "Receber respostas",
        },
        "imessage.send": {
          label: "Enviar um texto ou uma foto depois da sua aprovação",
          note: "Funciona depois que a pessoa envia a primeira mensagem.",
        },
      },
      summary:
        "Troque mensagens com familiares e amigos. Cada pessoa envia a primeira mensagem.",
    },
    instacart: {
      accountRequirement:
        "As compras pelo LifeLink não estão mais disponíveis.",
      capabilities: {},
      summary: "As compras pelo LifeLink não estão mais disponíveis.",
    },
    instagram: {
      accountRequirement: "Uma conta Instagram Business ou Creator.",
      capabilities: {
        "instagram.messages": {
          label: "Responder a mensagens diretas",
        },
        "instagram.personal": {
          label: "Contas pessoais",
        },
        "instagram.post": {
          label: "Compartilhar uma publicação com foto depois da sua aprovação",
        },
      },
      summary: "Apenas contas Business e Creator. Disponível futuramente.",
    },
    outlook: {
      accountRequirement:
        "Uma conta Microsoft. Algumas contas de trabalho precisam do consentimento de um administrador.",
      capabilities: {
        "calendar.create": {
          label:
            "Adicionar um compromisso aprovado ao seu calendário do Outlook",
        },
        "email.draft": {
          label: "Escrever um rascunho para você revisar",
        },
        "email.new_message_event": {
          label: "Avisar sobre novos e-mails quando chegarem",
        },
        "email.read_selected": {
          label: "Ler os e-mails que você escolher para um resumo",
        },
        "email.send": {
          label: "Enviar um e-mail depois da sua aprovação",
        },
      },
      summary: "E-mail e calendário do Outlook em uma só conexão.",
    },
    paypal: {
      accountRequirement:
        "Não é possível conectar contas pessoais do PayPal aqui.",
      capabilities: {
        "paypal.invoices": {
          label: "Consultar faturas",
        },
        "paypal.send_money": {
          label: "Enviar dinheiro a uma pessoa",
          note: "O LifeLink nunca envia dinheiro.",
        },
      },
      summary:
        "As faturas estarão disponíveis futuramente. O LifeLink nunca envia dinheiro.",
    },
    telegram: {
      accountRequirement:
        "O familiar abre o link que o LifeLink cria para ele e toca em Iniciar no Telegram.",
      capabilities: {
        "telegram.first_contact": {
          label: "Iniciar uma conversa com alguém novo",
          note: "Cada pessoa precisa primeiro tocar em Iniciar no bot.",
        },
        "telegram.receive": {
          label: "Receber respostas",
        },
        "telegram.send": {
          label: "Enviar uma mensagem ou fotos depois da sua aprovação",
        },
      },
      summary: "Mensagens com familiares no Telegram.",
    },
  },
  realImessage: "Quando usar o iMessage real, siga estes passos.",
  requirements: "O que você precisa",
  retry: "Tentar conectar novamente",
  returnConnected: "Ao voltar aqui, você verá Conectado.",
  setup: "Configurar",
  signInProvider: (label) =>
    `Você entrará na própria página de ${label}. O LifeLink nunca vê sua senha.`,
  signInTheirAccount: "Entre com a conta da pessoa, não com a sua.",
  status: {
    connected: "Conectado",
    disconnected: "Não conectado",
    error: "Não conectou",
    notOn: "Não ativado",
    pending: "Não concluído",
    practice: "Prática",
    practiceAccount: "Conta de prática",
    ready: "Pronto",
    realSaved: "Conta real salva",
  },
  subline:
    "Conecte os serviços que você já usa. Abra um para ver o que o LifeLink pode fazer com ele.",
  telegramSetup: (practice) =>
    `${practice ? "Quando usar o Telegram real, abra" : "Abra"} cada pessoa no Círculo de confiança, escolha Vincular Telegram e envie o link. A pessoa toca em Iniciar uma vez.`,
  title: "Conexões",
  unavailableFeatures: (label) =>
    `${label} ainda não tem funções disponíveis no LifeLink. Você não precisa conectar uma conta.`,
  unavailableIntro: (label) =>
    `O LifeLink ainda não pode fazer nada com ${label}.`,
};

export { connections };

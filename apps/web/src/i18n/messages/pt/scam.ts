import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "Quer acrescentar algo? (opcional)",
  addNotePlaceholder: "Por exemplo, quem dizia ser o remetente",
  ask: "Peça ajuda a alguém de confiança",
  callCheckTitle: "Verificação de golpe em ligação",
  checkSomethingElse: "Verificar outra coisa",
  checking: "Verificando",
  checkingMessage: "Verificando a mensagem…",
  chooseEmail: "Escolher um e-mail",
  chooseRecent: "Escolha entre seus e-mails recentes",
  cloudNote:
    "Um serviço de IA lê este conteúdo para verificá-lo. Não inclua senhas nem números de cartões.",
  didNotFinish: "Não concluído",
  earlier: "Verificações anteriores",
  earlierEmpty:
    "Suas verificações de mensagens, fotos e ligações aparecerão aqui.",
  emailMissing:
    "Este e-mail não está na caixa de entrada recente. Escolha outro e-mail ou digite o texto abaixo.",
  from: (sender) => `De ${sender}`,
  guidance: {
    ai: "Um serviço de IA ajuda a verificar mensagens e fotos. As fotos ficam junto à verificação até você excluí-la. As verificações de prática nunca usam IA.",
    intro:
      "A verificação procura sinais de alerta comuns. Ela não pode confirmar quem enviou uma mensagem nem se ela é verdadeira.",
    next: "Leia o resultado, siga “O que fazer agora” ou peça uma segunda opinião a alguém de confiança. Você escolhe o que acontece depois.",
    title: "O que uma verificação de golpes pode me dizer?",
  },
  howToShow: "Como você gostaria de mostrar a mensagem?",
  loadingEarlier: "Carregando verificações anteriores",
  loadingEmail: "Carregando o e-mail",
  loadingEmails: "Carregando seus e-mails",
  localNote:
    "As verificações com IA não estão disponíveis agora. O LifeLink usa sinais de alerta comuns.",
  messageWords: "As palavras da mensagem",
  messageWordsPlaceholder: "Cole ou digite as palavras aqui",
  noLongerAvailable:
    "Esta verificação não está mais disponível. Você pode iniciar outra.",
  noRecentEmails: "Não há e-mails recentes para escolher. ",
  noRecentEmailsRest: ", ou digite as palavras da mensagem.",
  noSubject: "(Sem assunto)",
  openEmail: "Abrir E-mail",
  opening: "Abrindo sua verificação",
  photo: {
    availabilityChecking: "Verificando se a análise de fotos está disponível…",
    practice:
      "O modo de prática está ativado. As fotos não são verificadas nem enviadas a um serviço de IA.",
    unavailable:
      "A verificação de fotos não está disponível agora. Sua foto não será enviada.",
    unavailableType:
      "A verificação de fotos não está disponível. Digite as palavras.",
  },
  practiceEmailNote:
    "Este é um e-mail de prática. Ele é verificado neste dispositivo sem IA na nuvem.",
  practiceNote:
    "As verificações de prática usam sinais de alerta comuns. Nada é enviado a um serviço de IA.",
  practiceSuffix: " · Prática",
  preparing: "Preparando sua verificação…",
  review: "Revisar",
  sources: {
    email: "E-mail",
    screenshot: "Foto",
    text: "Texto",
  },
  startNew: "Iniciar nova verificação",
  subline:
    "Está em dúvida sobre uma mensagem ou ligação? O LifeLink procura sinais de alerta antes de você agir.",
  submit: {
    email: "Verificar este e-mail",
    screenshot: "Verificar esta foto",
    text: "Verificar esta mensagem",
  },
  title: "Verificar golpes",
  uploading: "Enviando sua foto…",
  uploadingNote:
    "Enviando sua foto. Mantenha esta página aberta; a leitura das palavras vem a seguir.",
};

export { scam };

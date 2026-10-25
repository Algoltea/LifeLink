import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "Adicionar uma pessoa de confiança",
  call: "Ligar",
  callAria: (name) => `Ligar para ${name}`,
  callHelpMessage:
    "Estou em dúvida sobre uma ligação que recebi. Você pode me ajudar a verificar se é verdadeira antes que eu compartilhe informações ou envie dinheiro?",
  callsLoading:
    "As ligações ficam indisponíveis até as configurações da sua conta carregarem.",
  callsPractice: "As ligações não estão disponíveis no modo de prática.",
  contactFallback: "Contato",
  empty:
    "Uma segunda opinião pode ajudar. Adicione alguém que você conhece ao seu ",
  emptyRest:
    " para pedir ajuda com esta verificação. Você revisará qualquer mensagem antes do envio.",
  failed: (name, error) =>
    `Não foi possível preparar a mensagem para ${name}. ${error} Nada foi enviado. Tente Preparar mensagem novamente.`,
  introCall:
    "Prepare uma mensagem pedindo ajuda com a ligação. Você pode ler e alterar antes de aprovar. Nada é enviado ainda.",
  introCheck:
    "Prepare uma mensagem pedindo ajuda com esta verificação. Você pode ler e alterar antes de aprovar. Nada é enviado ainda.",
  list: "Pessoas de confiança",
  loading: "Carregando pessoas de confiança",
  noMessageAddress: "Nenhum endereço para mensagens salvo",
  noPhone: "Nenhum número de telefone salvo. ",
  noWayToMessage: "Nenhuma forma de enviar mensagens salva. ",
  prepare: "Preparar mensagem",
  prepareAria: (name) => `Preparar uma mensagem para ${name}`,
  preparing: "Preparando…",
  reachedBy: {
    discord: "Contato por mensagem",
    email: "Contato por e-mail",
    imessage: "Contato por mensagem",
    in_app: "Contato no LifeLink",
    telegram: "Contato por mensagem",
  },
  saveDetails: "Salve os dados de contato no seu ",
  trustedCircle: "Círculo de confiança",
  unavailable: "Ligar e Preparar mensagem não estão disponíveis agora.",
};

export { trustedPeople };

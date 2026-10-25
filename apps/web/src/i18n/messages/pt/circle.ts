import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "Adicionar uma pessoa",
  contactFallback: "Contato",
  edit: "Editar",
  editPerson: (name) => `Editar ${name}`,
  empty:
    "Adicione alguém de confiança. Você poderá enviar mensagens e escolher o que essa pessoa pode ver no LifeLink. Adicionar uma pessoa não compartilha nada.",
  keep: "Manter",
  loadingPeople: "Carregando pessoas",
  message: "Mensagem",
  people: "Pessoas",
  peopleCount: (count) => `${count} ${count === 1 ? "pessoa" : "pessoas"}`,
  permissions: "Permissões",
  permissionsFor: (name) => ` para ${name}`,
  practiceContact: "Contato de prática",
  reachNone: "Ainda sem forma de contato",
  reachTelegramWaiting: "Telegram: aguardando a pessoa tocar em Iniciar",
  reachWhatsappSaved: "WhatsApp salvo. Ainda não é possível enviar mensagens",
  reachedBy: {
    discord: "Contato pelo Discord",
    email: "Contato por e-mail",
    imessage: "Contato pelo iMessage",
    in_app: "Contato no LifeLink",
    telegram: "Contato pelo Telegram",
  },
  removeConfirm: (firstName) => `Remover ${firstName}`,
  removeDescription: (name) =>
    `${name} será removido dos contatos, e tudo o que você compartilha com essa pessoa deixará de ser compartilhado imediatamente.`,
  removeFailed: (error) =>
    `Não foi possível remover a pessoa. ${error} Tente Remover novamente.`,
  removeFallback: "Remover",
  removeNamed: (firstName) => `Remover ${firstName}…`,
  removePerson: "Remover esta pessoa…",
  removeStopsSharing: (firstName) =>
    `Remover ${firstName} também encerra tudo o que você compartilha com essa pessoa.`,
  removeTitle: (name) => `Remover ${name}?`,
  removed: (name) => `${name}: remoção concluída.`,
  removing: "Removendo…",
  subline:
    "As pessoas em quem você confia, como falar com elas e exatamente o que cada uma pode ver.",
  title: "Círculo de confiança",
  trusted: "De confiança",
};

export { circle };

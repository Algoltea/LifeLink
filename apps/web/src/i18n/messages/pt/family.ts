import type { Messages } from "../en";

const family: Messages["family"] = {
  appointments: "Compromissos",
  budget: (amount) => ` · orçamento ${amount}`,
  checked: (kind, day) => `Verificação de ${kind} em ${day}`,
  codeHint:
    "A pessoa que convidou você pode ler o código na página Círculo de confiança dela.",
  connect: "Conectar",
  connected:
    "A conexão está pronta. Você verá apenas o que a pessoa escolheu compartilhar.",
  empty:
    "Ninguém está compartilhando com você ainda. Quando alguém convidar você, digite o código abaixo.",
  groceries: "Lista de compras",
  haveCode: "Tem um código de convite?",
  invitationCode: "Código de convite",
  kinds: {
    email: "e-mail",
    screenshot: "captura de tela",
    text: "texto",
  },
  likelyScam: "Provavelmente é um golpe",
  loadingMessages: "Carregando mensagens",
  loadingPhoto: "Carregando foto…",
  loadingShared: "Carregando informações compartilhadas",
  loadingWhatWasShared: "Carregando o que foi compartilhado",
  messagesWith: (name) => `Mensagens com ${name}`,
  noMessages: "Ainda não há mensagens no LifeLink.",
  noSharedReminders: "Nenhum lembrete compartilhado.",
  notSharing: "Essa pessoa não está compartilhando com você agora.",
  nothingLeft: "Não falta comprar nada.",
  nothingSoon: "Nada nos próximos 30 dias.",
  onlyResult: "Só o resultado é compartilhado, nunca a mensagem em si.",
  photoUnavailable: "Esta foto não está disponível.",
  photos: "Fotos",
  replyTo: (name) => `Responder a ${name}`,
  ride: {
    asked: "Carona pedida, ainda não confirmada",
    confirmed: "Carona confirmada",
    declined: "Carona recusada",
  },
  scamChecks: "Verificações de golpes",
  sendReply: "Enviar resposta",
  sharedPhoto: "Uma foto compartilhada",
  sharedReminders: "Lembretes compartilhados",
  shares: (name, scopes) =>
    `${name} compartilha: ${scopes}. Você pode ver, mas não pode enviar, aprovar nem gastar nada por essa pessoa.`,
  subline:
    "Veja apenas o que cada pessoa escolher compartilhar. Você pode ver, mas nunca enviar, aprovar nem gastar nada por elas.",
  suspicious: "Suspeito",
  theyWrote: (name) => `${name} escreveu: `,
  title: "Família",
  updates: "Atualizações",
  withPhotos: " · com fotos",
  you: "Você",
  youWrote: "Você escreveu: ",
};

export { family };

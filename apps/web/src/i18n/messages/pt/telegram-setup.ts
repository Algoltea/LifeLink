import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `Convite copiado. Envie você mesmo para ${contactName}.`,
  copiedLink: (contactName) =>
    `Link copiado. Envie você mesmo para ${contactName}.`,
  copyInvitation: "Copiar convite",
  copyInvitationFailed:
    "Não foi possível copiar o convite. Copie o endereço acima.",
  copyLink: "Copiar link",
  copyLinkFailed: "Não foi possível copiar o link. Selecione e copie acima.",
  expires: (day) => ` Funciona uma vez e deixa de funcionar em ${day}.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `Oi, ${contactName}! Abra ${botUrl} no Telegram e toque em Iniciar para podermos trocar mensagens pelo LifeLink.`,
  link: "Vincular Telegram",
  linked: (account, contactName) =>
    `Vinculado a ${account}. As mensagens que você aprovar para ${contactName} podem ser enviadas pelo Telegram, e as respostas chegam em Mensagens.`,
  loading: "Carregando configuração do Telegram…",
  newLink: "Criar um novo link",
  notConfigured:
    "É preciso configurar o aplicativo. Quem administra o LifeLink precisa conectar o Telegram antes de você vincular este contato.",
  ownerOnly:
    "Só a pessoa titular da conta pode vincular o Telegram para seus contatos.",
  sendLink: (contactName) =>
    `Envie este link para ${contactName}. Quando a pessoa abrir e tocar em Iniciar, o Telegram será vinculado aqui automaticamente.`,
  theirAccount: "a conta do Telegram dessa pessoa",
  unlink: "Desvincular Telegram",
  waitingAsk: (contactName) => `. Peça a ${contactName} para abrir `,
  waitingFor: (username) => `Aguardando @${username}`,
  waitingRest:
    " no Telegram e tocar em Iniciar. O LifeLink vincula a pessoa assim que ela fizer isso.",
};

export { telegramSetup };

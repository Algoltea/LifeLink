import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "Sobre as verificações de golpes",
  appointmentAdded: "Foi adicionado a Sua semana na página Hoje.",
  appointmentFound: "Compromisso encontrado",
  backToInbox: "Voltar para a caixa de entrada",
  checkAnother: "Verificar outra mensagem",
  checkCouldNotFinish: (error) =>
    `A verificação de golpes não foi concluída. ${error}`,
  checkFirst: "Verifique sinais de alerta comuns antes de agir.",
  checkForNew: "Verificar novos e-mails",
  checkManually: " Você pode verificar manualmente abaixo.",
  checkThis: "Verificar este e-mail",
  checked: (when) => `Verificado ${when}`,
  checkedAt: (when) => ` Verificado ${when}.`,
  checking: "Verificando…",
  checksAutomatic:
    "Com as verificações de e-mail por IA ativadas em Configurações, novos e-mails reais podem ser enviados a um provedor de IA na nuvem. E-mails de prática ficam no LifeLink. Regras locais apenas para inglês são usadas quando a IA na nuvem está desativada, indisponível ou não termina. Mesmo uma solicitação na nuvem que falhou pode ter enviado o e-mail ao provedor. Nenhum dos métodos pode verificar o remetente nem provar que um e-mail é seguro.",
  checksIntro:
    "Novos e-mails são verificados no LifeLink para procurar sinais comuns de golpe. Escolha uma mensagem para ler e ver o que chamou atenção.",
  checksTitle: "Como funcionam as verificações de e-mail",
  chooseEmail: "Escolha um e-mail para ler e ver sua verificação de golpes.",
  cloudCheckNotice:
    "A IA na nuvem ajudou a verificar este e-mail. Ela pode cometer erros e não pode verificar o remetente. A ausência de sinais de alerta não significa que o e-mail seja seguro.",
  cloudConsent:
    "Enviar este e-mail a um serviço de IA na nuvem para um resumo e para identificar compromissos. Deixe desmarcado para uma prévia curta feita no LifeLink.",
  concern:
    "Este e-mail levantou uma preocupação. Confira o pedido antes de agir.",
  connectMailbox: "Conectar Gmail ou Outlook",
  connected: (list) => `Conectado: ${list}.`,
  countEmails: (count) => `${count} ${count === 1 ? "e-mail" : "e-mails"}`,
  empty:
    "Ainda não há e-mails aqui. Conecte uma caixa de e-mail e escolha “Verificar novos e-mails” para importar mensagens recentes.",
  from: "De ",
  helpMeUnderstand: "Ajude-me a entender",
  inbox: "Caixa de entrada",
  linksNotOpened:
    "O LifeLink não abre links nos e-mails. Se houver pedido de dinheiro ou dados privados, verifique primeiro.",
  loadingEmail: "Carregando e-mail",
  loadingEmails: "Carregando e-mails",
  localLanguageNotice:
    "Esta verificação de e-mail usou regras locais feitas apenas para o inglês. Elas podem não reconhecer golpes em espanhol e em outros idiomas. A ausência de sinais de alerta não significa que um e-mail seja seguro.",
  lowerPriority: "Prioridade menor",
  mailboxes: "Suas caixas de e-mail",
  mayNeedReply: "Pode precisar de resposta",
  needsAttention: (label, error) =>
    `${label} precisa de atenção${error ? `: ${error}` : "."}`,
  newEmails: (count) =>
    count === 0
      ? "Nenhum e-mail novo."
      : `${count} ${count === 1 ? "e-mail novo" : "e-mails novos"}.`,
  noMailbox: "Nenhuma caixa de e-mail conectada.",
  noSigns: "Nenhum sinal de alerta encontrado. Remetente não confirmado.",
  noSubject: "(Sem assunto)",
  noSubjectSpoken: "Sem assunto",
  noText: "Este e-mail não contém texto.",
  notChecked: "Ainda não verificado",
  notCheckedEmail: "Este e-mail ainda não foi verificado.",
  notCheckedNote: "Ainda não verificado",
  nowTheEmail: "Agora, o e-mail.",
  openManualCheck: "Abrir a verificação manual de golpes",
  opened: (subject) => `Aberto: ${subject}`,
  paging: {
    loadOlder: "Carregar e-mails anteriores",
    loading: "Carregando…",
    newer: "Mais recentes",
    noMoreImported:
      "Nenhum outro e-mail foi importado. Tente o próximo grupo se ainda houver e-mails antigos disponíveis.",
    noOlder: "Não há e-mails anteriores disponíveis.",
    older: "E-mails anteriores",
    page: (page) => `Página ${page} · Até 15 e-mails por vez`,
  },
  preview: "Mostrar uma prévia curta",
  readSummary: "Ler o resumo em voz alta",
  readingNow: "Lendo agora…",
  readyToRead: "Pronto para ler",
  reconnect: "Reconectar",
  reply: "Responder",
  replyAdded:
    "Resposta adicionada ao seu rascunho. Você pode alterá-la antes de revisar.",
  replyComposer: {
    nothingSent: (provider) =>
      `Nada é enviado. Você revisará primeiro, e depois ele será salvo como rascunho no seu ${provider}.`,
    placeholder: "Escreva sua resposta…",
    replyTo: (to) => `Responder a ${to}`,
    review: "Revisar o rascunho",
    speak: "Falar",
    stopListening: "Parar de ouvir",
  },
  ride: {
    asked: "Você pediu uma carona a alguém.",
    confirmed: "Sua carona está confirmada.",
    declined: "A carona foi recusada.",
  },
  sampleEmails:
    " Estes são e-mails de exemplo para você praticar com segurança.",
  scamCheck: "Verificar golpes",
  scamCheckNotDone: "Verificação de golpes ainda não feita",
  scamSigns:
    "Há sinais de golpe. Verifique antes de fazer qualquer coisa que o e-mail peça.",
  spokenFrom: (subject, from, body) => `${subject}. De ${from}. ${body}`,
  summarizeCloud: "Resumir com IA na nuvem",
  summary: "Resumo",
  summaryNote:
    "Veja uma prévia curta feita no LifeLink ou escolha a IA na nuvem",
  summarySpoken: "Resumo do e-mail.",
  theEmail: "O e-mail",
  title: "E-mail",
  unknownCheckNotice:
    "Esta verificação salva não informa se usou IA na nuvem ou regras locais. As regras locais cobrem apenas o inglês e podem não reconhecer golpes em outros idiomas. A ausência de sinais de alerta não significa que o e-mail seja seguro.",
  warning: {
    concern:
      "Este e-mail levantou uma preocupação. Confira o pedido antes de agir.",
    intro: (reason) =>
      `Possível golpe. ${reason} Se tiver dúvidas, peça ajuda a alguém de confiança antes de responder, abrir um link, enviar dinheiro ou compartilhar dados pessoais.`,
    signs: (signs) => `Sinais de alerta: ${signs}.`,
  },
  warningSigns: "Sinais de alerta",
  warningSignsFound: "Sinais de alerta encontrados",
  whatShouldIDo: "O que devo fazer?",
};

export { email };

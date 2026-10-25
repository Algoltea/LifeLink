import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "Combinado",
  agreedSpoken: (text) => `Combinado: ${text}`,
  changedNote:
    "Alguns detalhes fornecidos pelo assistente não estavam nas mensagens palavra por palavra, ou eram ofertas em vez de acordos, por isso foram alterados ou omitidos.",
  close: "Fechar resumo",
  cloud:
    "Resumo com IA na nuvem, solicitado com sua permissão. Cada citação foi conferida com as mensagens.",
  cloudConsent:
    "Usar o assistente na nuvem para um resumo mais completo. Suas mensagens recentes com esta pessoa são enviadas ao provedor de IA. Deixe desmarcado para um resumo rápido feito no LifeLink.",
  done: "Concluído",
  doneFromRecords:
    "Dos próprios registros do LifeLink, não do que as mensagens dizem.",
  inShort: "Em poucas palavras",
  intro: (contactName) =>
    `O LifeLink pode resumir o que você e ${contactName} combinaram, o que foi apenas oferecido e o que ainda está em aberto.`,
  loading: "Carregando resumo",
  local: {
    chosen:
      "Resumo rápido feito no LifeLink: por reconhecimento de padrões, sem compreensão completa. Nada foi enviado a um provedor de IA.",
    failed:
      "Resumo rápido feito no LifeLink. Você pediu um resumo na nuvem, mas ele não terminou. O provedor pode já ter recebido estas mensagens.",
    limit:
      "Resumo rápido feito no LifeLink. O limite de resumos na nuvem de hoje foi atingido, por isso nada mais foi enviado.",
    practice:
      "Prática: resumo rápido feito no LifeLink. Mensagens de prática nunca são enviadas a um provedor de IA.",
    unavailable:
      "Resumo rápido feito no LifeLink. O assistente na nuvem não está configurado, por isso nada foi enviado a um provedor de IA.",
  },
  messageTo: (contactName) => `Mensagem para ${contactName}`,
  nextSteps: "Possíveis próximos passos",
  nextStepsHint: "Nada acontece até você preparar um passo, revisar e aprovar.",
  noFinishedTasks: (contactName) =>
    `O LifeLink não tem tarefas concluídas com ${contactName} neste período. O que uma mensagem diz não é contado como concluído.`,
  offerNote: "Uma oferta não é um acordo até a outra pessoa dizer sim.",
  offered: "Oferecido, ainda não combinado",
  offeredSpoken: (text) => `Oferecido, ainda não combinado: ${text}`,
  onlyYou:
    "Só você pode ver isto. Nunca é enviado nem compartilhado com a família.",
  part: "Parte",
  practiceNote:
    "No modo de prática, o próprio LifeLink faz o resumo. Mensagens de prática nunca são enviadas a um provedor de IA.",
  prepare: "Preparar para revisão",
  prepared: "Preparado. Revisar",
  readAloud: "Ler o resumo em voz alta",
  reading: "Lendo a conversa…",
  recapAgain: "Resumir novamente",
  recapThis: "Resumir esta conversa",
  recapWithCloud: "Resumir com IA na nuvem",
  reminderForYou: "Um lembrete para você",
  stillUnclear: "Ainda não está claro",
  title: (contactName) => `Resumo com ${contactName}`,
  unclearSpoken: (text) => `Ainda não está claro: ${text}`,
  you: "Você",
};

export { recap };

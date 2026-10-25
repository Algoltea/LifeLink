import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Fechar explicação",
  cloud:
    "Leitura com IA na nuvem, solicitada com sua permissão. Cada citação foi conferida com a mensagem.",
  cloudConsent:
    "Usar o assistente na nuvem para uma explicação mais completa. O texto da mensagem é enviado ao provedor de IA. Deixe desmarcado para uma leitura local.",
  cloudConsentWithNotes:
    "Usar o assistente na nuvem para uma explicação mais completa. O texto da mensagem e suas notas sobre como gosta de receber ajuda são enviados ao provedor de IA. Deixe desmarcado para uma leitura local.",
  dateSpoken: (quote, date) =>
    `Data mencionada: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Datas e horários mencionados",
  droppedNote:
    "Alguns detalhes fornecidos pelo assistente não estavam na mensagem palavra por palavra, por isso aparecem como suposições ou foram omitidos.",
  explainAgainWithCloud: "Explicar novamente com IA na nuvem",
  explainThis: "Explicar esta mensagem",
  explainWithCloud: "Explicar com IA na nuvem",
  facts: "O que a mensagem diz",
  guessNote: "Estas são suposições, não algo que a mensagem diz.",
  guessSpoken: (text) => `Uma suposição: ${text}`,
  guesses: "O que pode significar",
  inPlainWords: "Em palavras simples",
  intro:
    "O LifeLink pode explicar o que esta mensagem pede, quais datas menciona e o que deixa de dizer.",
  loading: "Carregando explicação",
  local: {
    chosen:
      "Leitura local: feita por reconhecimento de padrões, sem compreensão completa. Nada foi enviado a um provedor de IA.",
    failed:
      "Leitura local. Você pediu uma leitura na nuvem, mas ela não terminou. O provedor pode já ter recebido esta mensagem.",
    limit:
      "Leitura local. O limite de leituras na nuvem de hoje foi atingido, por isso nada mais foi enviado.",
    practice:
      "Prática: explicação feita no LifeLink. Mensagens de prática nunca são enviadas a um provedor de IA.",
    unavailable:
      "Leitura local. O assistente na nuvem não está configurado, por isso nada foi enviado a um provedor de IA.",
  },
  localLanguageNotice:
    "As explicações locais baseadas em regras estão em inglês e ainda não foram traduzidas. Uma explicação na nuvem pode ser escrita no idioma escolhido. As citações da mensagem original são mantidas sem alterações.",
  missing: "Ainda não foi dito",
  missingSpoken: (detail) => `Ainda não foi dito: ${detail}`,
  onlyYou:
    "Só você pode ver isto. Nunca é enviado nem compartilhado com a família.",
  part: "Parte",
  practiceNote:
    "No modo de prática, o LifeLink lê a mensagem localmente. Mensagens de prática nunca são enviadas a um provedor de IA.",
  readAloud: "Ler a explicação em voz alta",
  readReply: "Ler esta resposta em voz alta",
  reading: "Lendo a mensagem…",
  replies: "Possíveis respostas",
  repliesHint:
    "Nada é enviado. A resposta vai para o campo de mensagem, onde você pode alterar e revisar antes que algo aconteça.",
  requestSpoken: (text, quote) =>
    `O pedido é: ${text} Nas palavras da pessoa: ${quote}.`,
  requests: "O que estão pedindo",
  title: "Ajuda para entender esta mensagem",
  useReply: "Usar esta resposta",
  useReplyLabel: (label) => `Usar esta resposta: ${label}`,
};

export { explanation };

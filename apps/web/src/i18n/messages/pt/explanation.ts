import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Fechar explicação",
  cloud:
    "Explicado com IA na nuvem. Cada citação foi conferida com a mensagem.",
  dateSpoken: (quote, date) =>
    `Data mencionada: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Datas e horários mencionados",
  droppedNote:
    "Alguns detalhes fornecidos pelo assistente não estavam na mensagem palavra por palavra, por isso aparecem como suposições ou foram omitidos.",
  facts: "O que a mensagem diz",
  guessNote: "Estas são suposições, não algo que a mensagem diz.",
  guessSpoken: (text) => `Uma suposição: ${text}`,
  guesses: "O que pode significar",
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
  moreDetail: "Mais detalhes",
  onlyYou: "Só você pode ver isto.",
  part: "Parte",
  reading: "Lendo a mensagem…",
  replies: "Possíveis respostas",
  repliesHint:
    "Nada é enviado. A resposta vai para o campo de mensagem, onde você pode alterar e revisar antes que algo aconteça.",
  replyLabelFor: (label) => `Usar esta resposta: ${label}`,
  requestSpoken: (text, quote) =>
    `O pedido é: ${text} Nas palavras da pessoa: ${quote}.`,
  requests: "O que estão pedindo",
  title: "Ajuda para entender esta mensagem",
};

export { explanation };

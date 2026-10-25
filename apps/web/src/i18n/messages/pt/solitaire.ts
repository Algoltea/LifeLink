import type { Messages } from "../en";

const solitaire: Messages["solitaire"] = {
  action: "O que faz",
  cardName: (rank, suit) => `${rank} de ${suit}`,
  cards: (count) => `${count} ${count === 1 ? "carta" : "cartas"}`,
  cardsAbove: (count) =>
    `${count} ${count === 1 ? "carta" : "cartas"} por cima`,
  cardsBelow: (count) =>
    `${count} ${count === 1 ? "carta virada para baixo" : "cartas viradas para baixo"} por baixo`,
  cardsPerDraw: "Cartas por compra",
  chooseAnother:
    "Escolha outro lugar ou pressione Escape para escolher outra carta.",
  columnCard: (card, index) => `${card}, coluna ${index}`,
  columnEmpty: (index) => `Coluna ${index}, vazia. Só um rei pode ir aqui.`,
  dealAgain: "Distribuir outra partida",
  dealt: (cards) => `Nova partida distribuída, comprando ${cards} por vez.`,
  discarded: (reason) =>
    `Não foi possível abrir sua partida salva, então uma nova foi distribuída. ${reason}`,
  draw: "Comprar carta",
  drawSetting: (next, current) =>
    `As novas partidas comprarão ${next} por vez. Esta partida continua com ${current}.`,
  drawWords: (count) => (count === 1 ? "uma carta" : "três cartas"),
  drawing: (cards) => `Comprando ${cards} por vez`,
  earlier: "antes",
  emptyColumn: "Esta coluna está vazia. Só um rei pode ir aqui.",
  emptyFoundation: "Esta fundação está vazia. Comece com um ás.",
  emptyWaste: "A pilha de descarte está vazia. Compre do monte primeiro.",
  engineExact: {
    "A saved column is out of order.": "Uma coluna salva está fora de ordem.",
    "A saved foundation is out of order.":
      "Uma fundação salva está fora de ordem.",
    "Only a king can go into an empty column.":
      "Só um rei pode ir para uma coluna vazia.",
    "Only one card at a time can go onto a foundation.":
      "Só uma carta por vez pode ir para uma fundação.",
    "That card can't go onto a foundation yet.":
      "Essa carta ainda não pode ir para uma fundação.",
    "That card can't go there: a foundation starts with an ace.":
      "Essa carta não pode ir aí: uma fundação começa com um ás.",
    "That card is already there.": "Essa carta já está aí.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "Essa carta está virada para baixo. Mova as cartas por cima para virá-la.",
    "That foundation is empty.": "Essa fundação está vazia.",
    "The saved draw setting is not 1 or 3.":
      "O número salvo de cartas por compra não é 1 nem 3.",
    "The saved game could not be read.":
      "Não foi possível ler a partida salva.",
    "The saved game does not hold exactly one full deck.":
      "A partida salva não contém exatamente um baralho completo.",
    "The saved move counts are negative.":
      "Os contadores de jogadas salvos são negativos.",
    "The saved move counts could not be read.":
      "Não foi possível ler os contadores de jogadas salvos.",
    "The saved recycle limit could not be read.":
      "Não foi possível ler o limite salvo de voltas do monte.",
    "The saved stock has a face-up card.":
      "O monte salvo contém uma carta virada para cima.",
    "The saved table could not be read.": "Não foi possível ler a mesa salva.",
    "The saved table is missing.": "A mesa salva está ausente.",
    "The saved waste pile has a face-down card.":
      "A pilha de descarte salva contém uma carta virada para baixo.",
    "The waste pile is empty. Draw from the stock first.":
      "A pilha de descarte está vazia. Compre do monte primeiro.",
    "There are no cards left to draw.": "Não há mais cartas para comprar.",
    "There is no card there.": "Não há carta aí.",
    "There is no column there.": "Não há coluna aí.",
    "There is no foundation there.": "Não há fundação aí.",
    "There is nothing to undo yet.": "Ainda não há nada para desfazer.",
    "This is not a saved solitaire game.":
      "Esta não é uma partida salva de Paciência.",
    "This save comes from a different version of the game.":
      "Esta partida salva vem de outra versão do jogo.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "Essas cartas não podem ser movidas juntas: só uma sequência contínua de cores alternadas pode ser movida em grupo.",
    "Turned the waste pile over to make a new stock.":
      "A pilha de descarte foi virada para formar um novo monte.",
    "Undid the last move.": "Última jogada desfeita.",
    "You have already gone through the deck as many times as this game allows.":
      "Você já percorreu o monte o número de vezes permitido nesta partida.",
  },
  engineMoreCards: (count) =>
    `e mais ${count} ${count === "1" ? "carta" : "cartas"}`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `Carta comprada: ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `${count} cartas compradas. No topo está ${card}.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `Carta ${card} movida para a fundação ${index}.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `Movimento de ${cards} sobre ${top} concluído.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) =>
        `Movimento de ${cards} para a coluna vazia ${index} concluído.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `Não é possível colocar nada sobre ${card} em uma coluna.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `Essa carta não pode ir aí: precisa de uma carta de valor ${rank} e cor ${color === "red" ? "vermelha" : "preta"}.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) => `Essa carta não pode ir aí: esta fundação é de ${suit}.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) => `Essa carta não pode ir aí: esta fundação começa com ${card}.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) => `Essa fundação está completa: já termina com ${card}.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) => `Essa carta não pode ir aí: esta fundação precisa de ${card}.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `Está ausente: ${pile}.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `${pile}: não foi possível ler uma carta.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `${pile}: deve haver ${count} pilhas.`,
    ],
  ],
  engineRevealed: (card) => ` Virou a carta ${card}.`,
  engineUndoStep: (reason) =>
    `Uma etapa para desfazer está danificada: ${reason}`,
  engineWords: {
    ace: "ás",
    columns: "colunas",
    foundations: "fundações",
    jack: "valete",
    king: "rei",
    "next card": "próxima carta",
    pile: "pilha",
    queen: "dama",
    stock: "monte",
    "the card": "a carta",
    "waste pile": "pilha de descarte",
  },
  faceDown:
    "Essa carta está virada para baixo. Mova as cartas por cima para virá-la.",
  foundation: (index) => `Fundação ${index}.`,
  foundationCount: (count) => `${count} de 52 cartas nas fundações`,
  foundationEmpty: (name, card) => `${name}, vazia. Começa com ${card}.`,
  foundationName: (suit) => `Fundação de ${suit}`,
  foundationTop: (name, card) => `${name}, com ${card} no topo.`,
  gestures:
    "Toque em uma carta para selecioná-la e depois toque no destino. Se a carta só tiver um destino, um toque já a move. Toque novamente na carta selecionada para mandá-la a uma fundação ou toque duas vezes em qualquer carta para fazer o mesmo.",
  guestIntro: "Um jogo tranquilo. Não precisa de conta.",
  hint: "Dica",
  hintDraw: "Dica: compre do monte.",
  hintMove: (source, target) => `Dica: mova ${source} ${target}.`,
  howToPlay: "Como jogar",
  intro: "Um jogo tranquilo.",
  key: "Tecla",
  keyboard: "Teclas do teclado",
  keys: [
    {
      action: "Mover entre pilhas e cartas",
      keys: "Setas",
    },
    {
      action: "Selecionar uma carta ou colocar a carta selecionada",
      keys: "Enter ou Espaço",
    },
    {
      action: "Enviar a carta selecionada para uma fundação",
      keys: "Enter novamente na mesma carta",
    },
    {
      action: "Devolver a carta ao lugar",
      keys: "Escape",
    },
    {
      action: "Comprar do monte",
      keys: "D",
    },
    {
      action: "Desfazer a última jogada",
      keys: "U ou Ctrl+Z",
    },
    {
      action: "Mostrar uma dica",
      keys: "H",
    },
    {
      action: "Enviar todas as cartas seguras para as fundações",
      keys: "F",
    },
  ],
  king: "Rei",
  moves: (count) => `${count} ${count === 1 ? "jogada" : "jogadas"}`,
  newGame: "Nova partida",
  noMovesNote:
    " Não há mais jogadas nesta partida. Você pode desfazer ou começar uma nova partida.",
  noSafeCards: "Não há cartas seguras para enviar às fundações agora.",
  noUsefulMoves:
    "Não há mais jogadas úteis. Tente desfazer ou comece uma nova partida.",
  nothingSelected: "Nenhuma carta selecionada.",
  onto: (card) => `sobre ${card}`,
  putBack: "Carta devolvida ao lugar. Nenhuma carta selecionada.",
  ranks: [
    "ás",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "valete",
    "dama",
    "rei",
  ],
  ready: "Uma nova partida está pronta. Escolha uma carta para começar.",
  resumed: "Sua última partida foi retomada.",
  resumedAt: (date) => `Sua partida foi retomada, salva ${date}.`,
  rules:
    "Forme quatro pilhas do ás ao rei, cada uma no espaço marcado com seu naipe (♠ ♥ ♣ ♦). Nas sete colunas, coloque uma carta sobre outra de valor um acima e de cor diferente: um 7 vermelho sobre um 8 preto. Só um rei pode ocupar uma coluna vazia. Compre do monte quando não puder avançar.",
  safeCards: "Enviar cartas seguras às fundações",
  saveFailed:
    "Este navegador não está permitindo salvar a partida. Seu progresso será perdido se você fechar esta página.",
  savedHint:
    "Sua partida é salva neste dispositivo após cada jogada, mesmo sem conexão com a internet.",
  savedOn: (day, time) => `em ${day} às ${time}`,
  savedToday: (time) => `hoje às ${time}`,
  scrollHint:
    "Role a mesa para os lados para alcançar todas as pilhas ou vire o telefone de lado para ter mais espaço.",
  selected: " Selecionada.",
  selectedBlocked: (name) =>
    `${name} selecionada. Não há destino para ela agora. Pressione Escape para devolvê-la.`,
  selectedTargets: (name, count) =>
    `${name} selecionada. Pode ir para ${count} ${count === 1 ? "lugar" : "lugares"}. Escolha um ou pressione Escape.`,
  sentSafe: (count, names) =>
    `${count} ${count === 1 ? "carta enviada" : "cartas enviadas"} às fundações: ${names}.`,
  shuffling: "Embaralhando as cartas.",
  sourceWithCards: (name, count) =>
    `${name} e ${count === 1 ? "a carta" : `as ${count} cartas`} por cima`,
  startFresh: "Começar do zero",
  stock: (cards) => `Monte, ${cards}. Pressione para comprar.`,
  stockEmpty: "O monte está vazio.",
  stockRecycle: "O monte está vazio. Pressione para virar a pilha de descarte.",
  suggested: " Indicada pela dica.",
  suits: {
    clubs: "paus",
    diamonds: "ouros",
    hearts: "copas",
    spades: "espadas",
  },
  table: "Mesa de cartas",
  target: " A carta selecionada pode ir aqui.",
  thatCard: "essa carta",
  title: "Paciência",
  toColumn: (index) => `para a coluna vazia ${index}`,
  toFoundation: "para uma fundação",
  undo: "Desfazer",
  waste: "Descarte",
  wasteEmpty: "Pilha de descarte vazia. Compre do monte.",
  wasteTop: (card) => `Pilha de descarte, com ${card} no topo.`,
  won: (moves) =>
    `Você venceu em ${moves} ${moves === 1 ? "jogada" : "jogadas"}.`,
  wonNote: (moves) =>
    ` Você venceu em ${moves} ${moves === 1 ? "jogada" : "jogadas"}. Boa partida.`,
};

export { solitaire };

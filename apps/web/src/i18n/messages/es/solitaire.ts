import type { solitaire as english } from "../en/solitaire";

const solitaire: typeof english = {
  action: "Qué hace",
  cardName: (rank: string, suit: string) => `${rank} de ${suit}`,
  cards: (count: number) => `${count} ${count === 1 ? "carta" : "cartas"}`,
  cardsAbove: (count: number) =>
    `${count} ${count === 1 ? "carta" : "cartas"} encima`,
  cardsBelow: (count: number) =>
    `${count} ${count === 1 ? "carta boca abajo debajo" : "cartas boca abajo debajo"}`,
  cardsPerDraw: "Cartas por robo",
  chooseAnother: "Elige otro lugar o pulsa Escape para elegir otra carta.",
  columnCard: (card: string, index: number) => `${card}, columna ${index}`,
  columnEmpty: (index: number) =>
    `Columna ${index}, vacía. Solo un rey puede ir aquí.`,
  dealAgain: "Repartir otra partida",
  dealt: (cards: string) =>
    `Se repartió una nueva partida, robando ${cards} a la vez.`,
  discarded: (reason: string) =>
    `No se pudo abrir tu partida guardada, así que se repartió una nueva. ${reason}`,
  draw: "Robar",
  drawSetting: (next: string, current: string) =>
    `Las nuevas partidas robarán ${next} a la vez. Esta partida sigue robando ${current}.`,
  drawWords: (count: number) => (count === 1 ? "una carta" : "tres cartas"),
  drawing: (cards: string) => `Robando ${cards} a la vez`,
  earlier: "anteriormente",
  emptyColumn: "Esta columna está vacía. Solo un rey puede ir aquí.",
  emptyFoundation: "Esta base está vacía. Primero van los ases.",
  emptyWaste: "El descarte está vacío. Roba del mazo primero.",
  engineExact: {
    "A saved column is out of order.":
      "Una columna guardada está fuera de orden.",
    "A saved foundation is out of order.":
      "Una base guardada está fuera de orden.",
    "Only a king can go into an empty column.":
      "Solo un rey puede ir en una columna vacía.",
    "Only one card at a time can go onto a foundation.":
      "Solo puede ir una carta a la vez a una base.",
    "That card can't go onto a foundation yet.":
      "Esa carta todavía no puede ir a una base.",
    "That card can't go there: a foundation starts with an ace.":
      "Esa carta no puede ir ahí: una base empieza con un as.",
    "That card is already there.": "Esa carta ya está allí.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "Esa carta está boca abajo. Mueve las cartas de encima para darle vuelta.",
    "That foundation is empty.": "Esa base está vacía.",
    "The saved draw setting is not 1 or 3.":
      "El número guardado de cartas por robo no es 1 ni 3.",
    "The saved game could not be read.": "No se pudo leer la partida guardada.",
    "The saved game does not hold exactly one full deck.":
      "La partida guardada no contiene exactamente una baraja completa.",
    "The saved move counts are negative.":
      "Los contadores de movimientos guardados son negativos.",
    "The saved move counts could not be read.":
      "No se pudieron leer los contadores de movimientos guardados.",
    "The saved recycle limit could not be read.":
      "No se pudo leer el límite guardado de vueltas al mazo.",
    "The saved stock has a face-up card.":
      "El mazo guardado tiene una carta boca arriba.",
    "The saved table could not be read.": "No se pudo leer la mesa guardada.",
    "The saved table is missing.": "Falta la mesa guardada.",
    "The saved waste pile has a face-down card.":
      "El descarte guardado tiene una carta boca abajo.",
    "The waste pile is empty. Draw from the stock first.":
      "El descarte está vacío. Roba del mazo primero.",
    "There are no cards left to draw.": "No quedan cartas para robar.",
    "There is no card there.": "No hay ninguna carta allí.",
    "There is no column there.": "No hay ninguna columna allí.",
    "There is no foundation there.": "No hay ninguna base allí.",
    "There is nothing to undo yet.": "Todavía no hay nada que deshacer.",
    "This is not a saved solitaire game.":
      "Esto no es una partida de solitario guardada.",
    "This save comes from a different version of the game.":
      "Esta partida guardada pertenece a otra versión del juego.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "Esas cartas no pueden moverse juntas: solo una secuencia continua de colores alternados se mueve en grupo.",
    "Turned the waste pile over to make a new stock.":
      "Se dio vuelta al descarte para formar un nuevo mazo.",
    "Undid the last move.": "Se deshizo el último movimiento.",
    "You have already gone through the deck as many times as this game allows.":
      "Ya recorriste el mazo tantas veces como permite esta partida.",
  },
  engineMoreCards: (count: string) =>
    `y ${count} ${count === "1" ? "carta más" : "cartas más"}`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `Se robó el ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `Se robaron ${count} cartas. El ${card} está encima.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `Se movió el ${card} a la base ${index}.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `Se movió ${cards} sobre el ${top}.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) => `Se movió ${cards} a la columna vacía ${index}.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `No se puede colocar nada sobre el ${card} en una columna.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `Esa carta no puede ir ahí: se necesita un ${rank} ${color === "red" ? "rojo" : "negro"}.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) => `Esa carta no puede ir ahí: esta base es de ${suit}.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) => `Esa carta no puede ir ahí: esta base empieza con el ${card}.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) => `Esa base está completa: ya termina con el ${card}.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) => `Esa carta no puede ir ahí: esta base necesita el ${card}.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `Falta ${pile}.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `${pile} contiene una carta que no se pudo leer.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `${pile} debe tener ${count} montones.`,
    ],
  ],
  engineRevealed: (card: string) => ` Se dio vuelta al ${card}.`,
  engineUndoStep: (reason: string) =>
    `Un paso para deshacer está dañado: ${reason}`,
  engineWords: {
    ace: "as",
    columns: "columnas",
    foundations: "bases",
    jack: "jota",
    king: "rey",
    "next card": "siguiente carta",
    pile: "montón",
    queen: "reina",
    stock: "mazo",
    "the card": "la carta",
    "waste pile": "descarte",
  },
  faceDown:
    "Esa carta está boca abajo. Mueve las cartas de encima para darle vuelta.",
  foundation: (index: number) => `Base ${index}.`,
  foundationCount: (count: number) => `${count} de 52 cartas en las bases`,
  foundationEmpty: (name: string, card: string) =>
    `${name}, vacía. Empieza con el ${card}.`,
  foundationName: (suit: string) => `Base de ${suit}`,
  foundationTop: (name: string, card: string) => `${name}, ${card} encima.`,
  gestures:
    "Toca una carta para seleccionarla y luego toca donde quieras ponerla. Si una carta solo tiene un destino posible, un toque la mueve allí. Toca de nuevo la carta seleccionada para enviarla a una base o toca dos veces cualquier carta para hacer lo mismo.",
  guestIntro: "Un juego tranquilo. No necesitas una cuenta.",
  hint: "Pista",
  hintDraw: "Pista: roba del mazo.",
  hintMove: (source: string, target: string) =>
    `Pista: mueve ${source} ${target}.`,
  howToPlay: "Cómo jugar",
  intro: "Un juego tranquilo. Disponible sin conexión.",
  key: "Tecla",
  keyboard: "Teclas del teclado",
  keys: [
    { action: "Moverse entre montones y cartas", keys: "Flechas" },
    {
      action: "Seleccionar una carta o colocar la seleccionada",
      keys: "Intro o Espacio",
    },
    {
      action: "Enviar la carta seleccionada a una base",
      keys: "Intro de nuevo sobre la misma carta",
    },
    { action: "Devolver la carta", keys: "Escape" },
    { action: "Robar del mazo", keys: "D" },
    { action: "Deshacer el último movimiento", keys: "U o Ctrl+Z" },
    { action: "Mostrar una pista", keys: "H" },
    { action: "Enviar todas las cartas seguras a las bases", keys: "F" },
  ],
  king: "Rey",
  moves: (count: number) =>
    `${count} ${count === 1 ? "movimiento" : "movimientos"}`,
  newGame: "Nueva partida",
  noMovesNote:
    " No quedan movimientos en esta partida. Puedes deshacer o empezar una nueva.",
  noSafeCards:
    "No hay cartas que se puedan enviar de forma segura a las bases ahora.",
  noUsefulMoves:
    "No quedan movimientos útiles. Prueba a deshacer o empieza una nueva partida.",
  nothingSelected: "No hay ninguna carta seleccionada.",
  onto: (card: string) => `sobre el ${card}`,
  putBack: "Se devolvió la carta. No hay ninguna seleccionada.",
  ranks: [
    "as",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jota",
    "reina",
    "rey",
  ],
  ready: "Hay una nueva partida lista. Elige una carta para empezar.",
  resumed: "Se reanudó tu última partida.",
  resumedAt: (date: string) =>
    `Se reanudó tu última partida, guardada el ${date}.`,
  rules:
    "Forma cuatro montones del as al rey, cada uno en el lugar marcado con su palo (♠ ♥ ♣ ♦). En las siete columnas, coloca cada carta sobre otra de valor inmediatamente superior y de distinto color: un 7 rojo sobre un 8 negro. Solo un rey puede ir en una columna vacía. Roba del mazo cuando no puedas avanzar.",
  safeCards: "Enviar cartas seguras a las bases",
  saveFailed:
    "Este navegador no permite guardar la partida. Perderás tu progreso si cierras esta página.",
  savedHint:
    "Tu partida se guarda en este dispositivo después de cada movimiento, incluso sin conexión a internet.",
  scrollHint:
    "Desplaza la mesa hacia los lados para llegar a cada montón o gira tu teléfono para tener más espacio.",
  selected: " Seleccionada.",
  selectedBlocked: (name: string) =>
    `Seleccionaste ${name}. No tiene adónde ir ahora. Pulsa Escape para devolverla.`,
  selectedTargets: (name: string, count: number) =>
    `Seleccionaste ${name}. Puede ir a ${count} lugares. Elige uno o pulsa Escape.`,
  sentSafe: (count: number, names: string) =>
    `Se ${count === 1 ? "envió 1 carta" : `enviaron ${count} cartas`} a las bases: ${names}.`,
  shuffling: "Barajando las cartas.",
  sourceWithCards: (name: string, count: number) =>
    `${name} y ${count === 1 ? "la carta" : `las ${count} cartas`} encima`,
  startFresh: "Empezar de cero",
  stock: (cards: string) => `Mazo, ${cards}. Pulsa para robar.`,
  stockEmpty: "El mazo está vacío.",
  stockRecycle: "El mazo está vacío. Pulsa para dar vuelta al descarte.",
  suggested: " Sugerida por la pista.",
  suits: {
    clubs: "tréboles",
    diamonds: "diamantes",
    hearts: "corazones",
    spades: "picas",
  },
  table: "Mesa de cartas",
  target: " La carta seleccionada puede ir aquí.",
  thatCard: "esa carta",
  title: "Solitario",
  toColumn: (index: number) => `a la columna vacía ${index}`,
  toFoundation: "a una base",
  undo: "Deshacer",
  waste: "Descarte",
  wasteEmpty: "Descarte vacío. Roba del mazo.",
  wasteTop: (card: string) => `Descarte, ${card} encima.`,
  won: (moves: number) => `Ganaste en ${moves} movimientos.`,
  wonNote: (moves: number) => ` Ganaste en ${moves} movimientos. Bien jugado.`,
};

export { solitaire };

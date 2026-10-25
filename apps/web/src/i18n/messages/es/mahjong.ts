import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "Acciones de la partida",
  alreadyClear: "El tablero ya está vacío.",
  biggerScreen:
    "Mahjong necesita una pantalla más grande para que las fichas sean fáciles de tocar. Abra LifeLink en una tableta o un ordenador para jugar.",
  blocked: {
    "boxed-in":
      "Esa ficha está bloqueada por ambos lados. Elija una ficha con el lado izquierdo o derecho libre.",
    covered:
      "Esa ficha está cubierta por otra. Retire primero las fichas que tiene encima.",
    removed: "Esa ficha ya se ha emparejado.",
  },
  board: "Tablero de fichas",
  clearBoard:
    "El tablero está vacío. Deshacer recupera la última pareja, o puede repartir otra partida.",
  cleared: (moves) =>
    `Ha vaciado el tablero en ${moves} ${moves === 1 ? "movimiento" : "movimientos"}.`,
  dealAgain: "Repartir otra partida",
  dealt: (layout) =>
    `Se ha repartido una nueva partida con la disposición ${layout}.`,
  discarded:
    "No se ha podido abrir su partida guardada, así que se ha repartido una nueva.",
  dragonTile: (dragon) => `Dragón: ${dragon}`,
  dragons: { green: "Verde", red: "Rojo", white: "Blanco" },
  earlier: "antes",
  errors: {
    blocked: "Todavía no puede elegir esa ficha.",
    "cannot-shuffle":
      "No se han podido mezclar las fichas. Pruebe a deshacer un movimiento o a empezar una nueva partida.",
    "invalid-index": "No hay ninguna ficha ahí.",
    "no-match": "Esas fichas no forman pareja.",
    "nothing-to-shuffle": "No quedan fichas que mezclar.",
    "nothing-to-undo": "Todavía no hay ningún movimiento que deshacer.",
    "same-tile": "Es la misma ficha. Elija una segunda ficha.",
  },
  flowerTile: (flower) => `Flor: ${flower}`,
  flowers: {
    bamboo: "Bambú",
    chrysanthemum: "Crisantemo",
    orchid: "Orquídea",
    plum: "Ciruelo",
  },
  free: "Libre para elegir.",
  gestures:
    "Toque una ficha para elegirla y después toque la que forma pareja con ella. Vuelva a tocar la ficha elegida para soltarla. Si no puede continuar, Pista muestra una pareja, Mezclar reorganiza las fichas restantes y Deshacer revierte su último movimiento. Todas las partidas se pueden completar, también después de cada mezcla.",
  groups: {
    characters: {
      matches: "Números del 1 al 9. Empareje dos del mismo número.",
      name: "Caracteres (萬)",
    },
    dragons: {
      matches: "Rojo, verde y blanco. Empareje dos del mismo dragón.",
      name: "Dragones",
    },
    flowers: {
      matches:
        "Llevan 花 en la esquina. Cualquier flor forma pareja con cualquier otra flor.",
      name: "Flores",
    },
    otherSuits: {
      matches: "Números del 1 al 9, solo en la disposición Clásica.",
      name: "Círculos (筒) y bambú (條)",
    },
    seasons: {
      matches:
        "Llevan 季 en la esquina. Cualquier estación forma pareja con cualquier otra estación.",
      name: "Estaciones",
    },
    winds: {
      matches: "Este, sur, oeste y norte. Empareje dos del mismo viento.",
      name: "Vientos",
    },
  },
  guestSubtitle: "Un tranquilo juego de fichas. No necesita una cuenta.",
  hint: "Pista",
  hintPair: (pair) => `Pista: empareje ${pair}.`,
  howToPlay: "Cómo jugar",
  keyboard:
    "Use las flechas para moverse entre las fichas libres. Pulse Intro para elegir una ficha y Escape para soltarla.",
  layout: "Disposición",
  layoutLabel: (name) => `Disposición: ${name}`,
  layoutSetting: (next, current) =>
    `Las nuevas partidas usarán la disposición ${next}. Esta partida mantiene la disposición ${current}.`,
  layouts: { classic: "Clásica", easy: "Fácil" },
  matched: (pair, left) =>
    `Pareja retirada: ${pair}. ${left === 1 ? "Queda 1 ficha" : `Quedan ${left} fichas`}.`,
  mismatch: (first, second) =>
    `Las fichas ${first} y ${second} no forman pareja. Ahora está seleccionada la ficha ${second}.`,
  moves: (count) => `${count} ${count === 1 ? "movimiento" : "movimientos"}`,
  newGame: "Nueva partida",
  onDateAt: (date, time) => `el ${date} a las ${time}`,
  pair: (first, second) => `${first} y ${second}`,
  picked: (name) =>
    `Ha elegido la ficha ${name}. Ahora toque la ficha que forma pareja con ella.`,
  playSolitaire: "Jugar al Solitario en su lugar",
  preparing: "Colocando las fichas.",
  putDown: "Ha soltado la ficha. No hay ninguna seleccionada.",
  ready: "Hay una nueva partida lista. Elija una ficha iluminada para empezar.",
  resumed: (when) => `Se ha reanudado su partida guardada ${when}.`,
  rules:
    "Vacíe el tablero emparejando las fichas de dos en dos. Solo puede retirar una ficha libre: sin ninguna encima y con el lado izquierdo o derecho despejado. Las fichas libres están iluminadas; las que todavía no puede retirar aparecen atenuadas.",
  saveFailed:
    "Este navegador no permite guardar la partida. Su progreso se perderá si cierra esta página.",
  saved:
    "Su partida se guarda en este dispositivo después de cada movimiento, incluso sin conexión a internet.",
  scroll:
    "Desplace el tablero hacia los lados si alguna ficha queda fuera de la vista.",
  seasonTile: (season) => `Estación: ${season}`,
  seasons: {
    autumn: "Otoño",
    spring: "Primavera",
    summer: "Verano",
    winter: "Invierno",
  },
  selected: "Seleccionada.",
  shuffle: "Mezclar",
  shuffled: "Se han mezclado las fichas restantes.",
  stillSelected: "La ficha que eligió sigue seleccionada.",
  stuck: "No hay parejas libres. Mezcle las fichas o deshaga un movimiento.",
  subtitle: "Un tranquilo juego de fichas.",
  suggested: "Sugerida por la pista.",
  suitTile: (rank, suit) => `${rank} de ${suit}`,
  suits: { bamboo: "Bambú", characters: "Caracteres", dots: "Círculos" },
  tileGuide: "Las fichas",
  tilePosition: (name, layer, row, column) =>
    `${name}, nivel ${layer}, fila ${row}, columna ${column}.`,
  tiles: (count) => `${count} ${count === 1 ? "ficha" : "fichas"}`,
  tilesLeft: (left, total) => `Quedan ${left} de ${total} fichas`,
  title: "Mahjong",
  todayAt: (time) => `hoy a las ${time}`,
  undo: "Deshacer",
  undone: "Se ha deshecho el último movimiento.",
  wellPlayed: "Bien jugado.",
  windTile: (wind) => `Viento: ${wind}`,
  winds: { east: "Este", north: "Norte", south: "Sur", west: "Oeste" },
};

export { mahjong };

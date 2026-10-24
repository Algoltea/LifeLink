interface EngineMessages {
  exact: Record<string, string>;
  patterns: [RegExp, (...groups: string[]) => string][];
  words: Record<string, string>;
}

const engine: EngineMessages = { exact: {}, patterns: [], words: {} };

const solitaire = {
  action: "What it does",
  cardName: (rank: string, suit: string) => `${rank} of ${suit}`,
  cards: (count: number) => `${count} ${count === 1 ? "card" : "cards"}`,
  cardsAbove: (count: number) =>
    `${count} ${count === 1 ? "card" : "cards"} on top of it`,
  cardsBelow: (count: number) =>
    `${count} face-down ${count === 1 ? "card" : "cards"} under it`,
  cardsPerDraw: "Cards per draw",
  chooseAnother:
    "Choose another place, or press Escape to pick a different card.",
  columnCard: (card: string, index: number) => `${card}, column ${index}`,
  columnEmpty: (index: number) =>
    `Column ${index}, empty. Only a king can go here.`,
  dealAgain: "Deal another game",
  dealt: (cards: string) => `Dealt a new game, drawing ${cards} at a time.`,
  discarded: (reason: string) =>
    `Your saved game could not be opened, so a new game was dealt. ${reason}`,
  draw: "Draw",
  drawSetting: (next: string, current: string) =>
    `New games will draw ${next} at a time. This game keeps drawing ${current}.`,
  drawWords: (count: number): string =>
    count === 1 ? "one card" : "three cards",
  drawing: (cards: string) => `Drawing ${cards} at a time`,
  earlier: "earlier",
  emptyColumn: "This column is empty. Only a king can go here.",
  emptyFoundation: "This foundation is empty. Aces go here first.",
  emptyWaste: "The waste pile is empty. Draw from the stock first.",
  engineExact: engine.exact,
  engineMoreCards: (count: string) =>
    `and ${count} more ${count === "1" ? "card" : "cards"}`,
  enginePatterns: engine.patterns,
  engineRevealed: (card: string) => ` Turned over the ${card}.`,
  engineUndoStep: (reason: string) => `An undo step is damaged: ${reason}`,
  engineWords: engine.words,
  faceDown:
    "That card is face down. Move the cards on top of it to turn it over.",
  foundation: (index: number) => `Foundation ${index}.`,
  foundationCount: (count: number) => `${count} of 52 cards on the foundations`,
  foundationEmpty: (name: string, card: string) =>
    `${name}, empty. It starts with the ${card}.`,
  foundationName: (suit: string) =>
    `${suit.charAt(0).toUpperCase()}${suit.slice(1)} foundation`,
  foundationTop: (name: string, card: string) => `${name}, ${card} on top.`,
  gestures:
    "Tap a card to pick it up, then tap where it should go. When a card has only one place to go, a single tap moves it there. Tap the picked card again to send it to a foundation, or double-tap any card to do the same.",
  guestIntro: "A quiet game. No account needed.",
  hint: "Hint",
  hintDraw: "Hint: draw from the stock.",
  hintMove: (source: string, target: string) =>
    `Hint: move ${source} ${target}.`,
  howToPlay: "How to play",
  intro: "A quiet game. Available offline.",
  key: "Key",
  keyboard: "Keyboard keys",
  keys: [
    { action: "Move between piles and cards", keys: "Arrow keys" },
    {
      action: "Pick up a card, or put the picked card down",
      keys: "Enter or Space",
    },
    {
      action: "Send the picked card to a foundation",
      keys: "Enter again on the same card",
    },
    { action: "Put the card back", keys: "Escape" },
    { action: "Draw from the stock", keys: "D" },
    { action: "Undo the last move", keys: "U, or Ctrl+Z" },
    { action: "Show a hint", keys: "H" },
    { action: "Send every safe card to the foundations", keys: "F" },
  ],
  king: "King",
  moves: (count: number) => `${count} ${count === 1 ? "move" : "moves"}`,
  newGame: "New game",
  noMovesNote:
    " No moves are left in this deal. You can undo or start a new game.",
  noSafeCards: "No cards are safe to send to the foundations right now.",
  noUsefulMoves:
    "There are no useful moves left. Try undo or start a new game.",
  nothingSelected: "Nothing is selected.",
  onto: (card: string) => `onto ${card}`,
  putBack: "Put the card back. Nothing is selected.",
  ranks: [
    "ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
  ],
  ready: "A new game is ready. Choose a card to begin.",
  resumed: "Resumed your last game.",
  resumedAt: (date: string) => `Resumed your last game, saved ${date}.`,
  rules:
    "Build four piles from ace up to king, each in the spot marked with its suit (♠ ♥ ♣ ♦). In the seven columns, place a card on one that is one higher and the other colour: a red 7 on a black 8. Only a king can go into an empty column. Draw from the stock when you are stuck.",
  safeCards: "Send safe cards home",
  saveFailed:
    "This browser is not letting the game save, so your progress will be lost if you close this page.",
  savedHint:
    "Your game saves on this device after every move, even without an internet connection.",
  scrollHint:
    "Scroll the table sideways to reach every pile, or turn your phone sideways for more room.",
  selected: " Selected.",
  selectedBlocked: (name: string) =>
    `Selected ${name}. It has no place to go right now. Press Escape to put it back.`,
  selectedTargets: (name: string, count: number) =>
    `Selected ${name}. It can go to ${count} places. Choose one, or press Escape.`,
  sentSafe: (count: number, names: string) =>
    `Sent ${count} ${count === 1 ? "card" : "cards"} to the foundations: ${names}.`,
  shuffling: "Shuffling the cards.",
  sourceWithCards: (name: string, count: number) =>
    `${name} and the ${count === 1 ? "card" : `${count} cards`} on it`,
  startFresh: "Start fresh instead",
  stock: (cards: string) => `Stock, ${cards}. Press to draw.`,
  stockEmpty: "Stock is empty.",
  stockRecycle: "Stock is empty. Press to turn the waste pile over.",
  suggested: " Suggested by the hint.",
  suits: {
    clubs: "clubs",
    diamonds: "diamonds",
    hearts: "hearts",
    spades: "spades",
  },
  table: "Card table",
  target: " The selected card can go here.",
  thatCard: "that card",
  title: "Solitaire",
  toColumn: (index: number) => `to empty column ${index}`,
  toFoundation: "to a foundation",
  undo: "Undo",
  waste: "Waste",
  wasteEmpty: "Waste pile, empty. Draw from the stock.",
  wasteTop: (card: string) => `Waste pile, ${card} on top.`,
  won: (moves: number) => `You won in ${moves} moves.`,
  wonNote: (moves: number) => ` You won in ${moves} moves. Well played.`,
};

export { solitaire };

import type { MoveErrorCode } from "@lifelink/mahjong/game";
import type { LayoutId } from "@lifelink/mahjong/layouts";
import type { Blocker } from "@lifelink/mahjong/rules";
import type {
  Dragon,
  Flower,
  Season,
  Suit,
  Wind,
} from "@lifelink/mahjong/tiles";

interface MahjongMessages {
  title: string;
  biggerScreen: string;
  playSolitaire: string;
  preparing: string;
  subtitle: string;
  guestSubtitle: string;
  newGame: string;
  dealAgain: string;
  undo: string;
  hint: string;
  shuffle: string;
  actions: string;
  layout: string;
  layouts: Record<LayoutId, string>;
  layoutLabel: (name: string) => string;
  moves: (count: number) => string;
  tiles: (count: number) => string;
  tilesLeft: (left: number, total: number) => string;
  cleared: (moves: number) => string;
  wellPlayed: string;
  clearBoard: string;
  alreadyClear: string;
  scroll: string;
  saveFailed: string;
  saved: string;
  board: string;
  keyboard: string;
  selected: string;
  suggested: string;
  free: string;
  blocked: Record<Blocker, string>;
  tilePosition: (
    name: string,
    layer: number,
    row: number,
    column: number
  ) => string;
  suits: Record<Suit, string>;
  winds: Record<Wind, string>;
  dragons: Record<Dragon, string>;
  flowers: Record<Flower, string>;
  seasons: Record<Season, string>;
  suitTile: (rank: number, suit: string) => string;
  windTile: (wind: string) => string;
  dragonTile: (dragon: string) => string;
  flowerTile: (flower: string) => string;
  seasonTile: (season: string) => string;
  pair: (first: string, second: string) => string;
  stuck: string;
  ready: string;
  discarded: string;
  earlier: string;
  todayAt: (time: string) => string;
  onDateAt: (date: string, time: string) => string;
  resumed: (when: string) => string;
  picked: (name: string) => string;
  putDown: string;
  stillSelected: string;
  mismatch: (first: string, second: string) => string;
  matched: (pair: string, left: number) => string;
  shuffled: string;
  undone: string;
  hintPair: (pair: string) => string;
  dealt: (layout: string) => string;
  layoutSetting: (next: string, current: string) => string;
  errors: Record<MoveErrorCode, string>;
  howToPlay: string;
  rules: string;
  gestures: string;
  tileGuide: string;
  groups: Record<
    "characters" | "otherSuits" | "winds" | "dragons" | "flowers" | "seasons",
    { name: string; matches: string }
  >;
}

const mahjong: MahjongMessages = {
  actions: "Game actions",
  alreadyClear: "The board is already clear.",
  biggerScreen:
    "Mahjong needs a bigger screen, so its tiles are large enough to tap. Open LifeLink on a tablet or computer to play.",
  blocked: {
    "boxed-in":
      "That tile is boxed in on both sides. Pick a tile with a free left or right side.",
    covered:
      "That tile is covered by another tile. Clear the tiles on top of it first.",
    removed: "That tile has already been matched.",
  },
  board: "Tile board",
  clearBoard:
    "The board is clear. Undo takes back the last pair, or deal another game.",
  cleared: (moves) => `You cleared the board in ${moves} moves.`,
  dealAgain: "Deal another game",
  dealt: (layout) => `Dealt a new ${layout} game.`,
  discarded: "Your saved game could not be opened, so a new game was dealt.",
  dragonTile: (dragon) => `${dragon} Dragon`,
  dragons: { green: "Green", red: "Red", white: "White" },
  earlier: "earlier",
  errors: {
    blocked: "That tile cannot be picked yet.",
    "cannot-shuffle":
      "The tiles could not be shuffled. Try undoing or starting a new game.",
    "invalid-index": "There is no tile there.",
    "no-match": "Those tiles do not match.",
    "nothing-to-shuffle": "There are no tiles left to shuffle.",
    "nothing-to-undo": "There is no move to undo yet.",
    "same-tile": "That is the same tile. Pick a second one.",
  },
  flowerTile: (flower) => `${flower} flower`,
  flowers: {
    bamboo: "Bamboo",
    chrysanthemum: "Chrysanthemum",
    orchid: "Orchid",
    plum: "Plum",
  },
  free: "Free to pick.",
  gestures:
    "Tap a tile to pick it, then tap the tile that matches it. Tap the picked tile again to put it down. If you get stuck, Hint shows a pair, Shuffle rearranges the tiles left, and Undo takes back your last move. Every game, and every shuffle, can be cleared.",
  groups: {
    characters: {
      matches: "Numbers 1 to 9. Match two of the same number.",
      name: "Characters (萬)",
    },
    dragons: {
      matches: "Red, Green, and White. Match two of the same dragon.",
      name: "Dragons",
    },
    flowers: {
      matches: "Marked 花 in the corner. Any flower matches any other flower.",
      name: "Flowers",
    },
    otherSuits: {
      matches: "Numbers 1 to 9, in the Classic layout only.",
      name: "Dots (筒) and Bamboo (條)",
    },
    seasons: {
      matches: "Marked 季 in the corner. Any season matches any other season.",
      name: "Seasons",
    },
    winds: {
      matches: "East, South, West, and North. Match two of the same wind.",
      name: "Winds",
    },
  },
  guestSubtitle: "A quiet tile game. No account needed.",
  hint: "Hint",
  hintPair: (pair) => `Hint: match ${pair}.`,
  howToPlay: "How to play",
  keyboard:
    "Use the arrow keys to move between free tiles. Press Enter to pick a tile, and Escape to put it down.",
  layout: "Layout",
  layoutLabel: (name) => `${name} layout`,
  layoutSetting: (next, current) =>
    `New games will use the ${next} layout. This game keeps the ${current} layout.`,
  layouts: { classic: "Classic", easy: "Easy" },
  matched: (pair, left) => `Matched ${pair}. ${left} tiles left.`,
  mismatch: (first, second) =>
    `The ${first} and the ${second} don't match. Picked the ${second} instead.`,
  moves: (count) => `${count} ${count === 1 ? "move" : "moves"}`,
  newGame: "New game",
  onDateAt: (date, time) => `on ${date} at ${time}`,
  pair: (first, second) => `${first} and ${second}`,
  picked: (name) => `Picked the ${name}. Now tap the tile that matches it.`,
  playSolitaire: "Play Solitaire instead",
  preparing: "Setting out the tiles.",
  putDown: "Put the tile down. Nothing is picked.",
  ready: "A new game is ready. Choose a bright tile to begin.",
  resumed: (when) => `Resumed your game from ${when}.`,
  rules:
    "Clear the board by matching tiles in pairs. You can only take a free tile: one with nothing on top of it and an open left or right side. Free tiles are bright; tiles you can’t take yet are faded.",
  saveFailed:
    "This browser is not letting the game save, so your progress will be lost if you close this page.",
  saved:
    "Your game saves on this device after every move, even without an internet connection.",
  scroll: "Scroll the board sideways if some tiles are out of view.",
  seasonTile: (season) => `${season} season`,
  seasons: {
    autumn: "Autumn",
    spring: "Spring",
    summer: "Summer",
    winter: "Winter",
  },
  selected: "Selected.",
  shuffle: "Shuffle",
  shuffled: "Shuffled the remaining tiles.",
  stillSelected: "The tile you picked is still selected.",
  stuck: "No pairs are free. Shuffle the tiles or undo.",
  subtitle: "A quiet tile game.",
  suggested: "Suggested by the hint.",
  suitTile: (rank, suit) => `${rank} ${suit}`,
  suits: { bamboo: "Bamboo", characters: "Characters", dots: "Dots" },
  tileGuide: "The tiles",
  tilePosition: (name, layer, row, column) =>
    `${name}, layer ${layer}, row ${row}, column ${column}.`,
  tiles: (count) => `${count} ${count === 1 ? "tile" : "tiles"}`,
  tilesLeft: (left, total) => `${left} of ${total} tiles left`,
  title: "Mahjong",
  todayAt: (time) => `today at ${time}`,
  undo: "Undo",
  undone: "Undid the last move.",
  wellPlayed: "Well played.",
  windTile: (wind) => `${wind} Wind`,
  winds: { east: "East", north: "North", south: "South", west: "West" },
};

export { mahjong };

export type { MahjongMessages };

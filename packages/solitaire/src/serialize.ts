import { ACE, makeCard, toRank } from "./cards";
import type { Card, Suit } from "./cards";
import { FOUNDATION_COUNT, TABLEAU_COLUMNS } from "./deal";
import { DECK_SIZE } from "./game";
import type { DrawCount, GameState, Position } from "./game";
import { isValidRun } from "./rules";

export const SAVE_FORMAT = "lifelink/solitaire";

export const SAVE_VERSION = 1;

/** Undo steps kept in a save; enough to recover, small enough for localStorage. */
export const SAVED_HISTORY_LIMIT = 50;

/** JSON as it arrives from storage, before it is trusted. */
type JsonValue =
  | JsonObject
  | readonly JsonValue[]
  | boolean
  | number
  | string
  | null;

interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}

export type ParseResult =
  | { readonly ok: false; readonly reason: string }
  | { readonly ok: true; readonly savedAt: string; readonly state: GameState };

type Parsed<Value> =
  | { readonly ok: false; readonly reason: string }
  | { readonly ok: true; readonly value: Value };

const SUIT_CODES: readonly (readonly [Suit, string])[] = [
  ["clubs", "C"],
  ["diamonds", "D"],
  ["hearts", "H"],
  ["spades", "S"],
];

/** Suit letter, two-digit rank, then U (face up) or D (face down): "H07U". */
const CARD_CODE = /^[CDHS](?:0[1-9]|1[0-3])[UD]$/u;

const isText = (value: JsonValue | undefined): value is string =>
  String(value) === value;

const isInteger = (value: JsonValue | undefined): value is number =>
  Number.isInteger(value);

const isList = (value: JsonValue | undefined): value is readonly JsonValue[] =>
  Array.isArray(value);

const isRecord = (value: JsonValue | undefined): value is JsonObject =>
  value !== null &&
  value !== undefined &&
  value !== true &&
  value !== false &&
  !isList(value) &&
  !isText(value) &&
  !Number.isFinite(value);

const fail = <Value>(reason: string): Parsed<Value> => ({ ok: false, reason });

const pass = <Value>(value: Value): Parsed<Value> => ({ ok: true, value });

export const encodeCard = (card: Card): string => {
  const suitCode = SUIT_CODES.find(([suit]) => suit === card.suit)?.[1] ?? "S";
  const rank = String(card.rank).padStart(2, "0");

  return `${suitCode}${rank}${card.faceUp ? "U" : "D"}`;
};

export const decodeCard = (code: string): Card | null => {
  if (!CARD_CODE.test(code)) {
    return null;
  }

  const letter = code.slice(0, 1);
  const suit = SUIT_CODES.find((entry) => entry[1] === letter)?.[0];
  const rank = toRank(Number(code.slice(1, 3)));

  if (!(suit && rank)) {
    return null;
  }

  return makeCard(suit, rank, code.slice(3) === "U");
};

const parsePile = (
  value: JsonValue | undefined,
  label: string
): Parsed<Card[]> => {
  if (!isList(value)) {
    return fail(`The ${label} is missing.`);
  }

  const cards: Card[] = [];

  for (const entry of value) {
    const card = isText(entry) ? decodeCard(entry) : null;

    if (!card) {
      return fail(`The ${label} holds a card that could not be read.`);
    }

    cards.push(card);
  }

  return pass(cards);
};

const parsePiles = (
  value: JsonValue | undefined,
  label: string,
  count: number
): Parsed<Card[][]> => {
  if (!isList(value) || value.length !== count) {
    return fail(`The ${label} should have ${count} piles.`);
  }

  const piles: Card[][] = [];

  for (const [index, entry] of value.entries()) {
    const pile = parsePile(entry, `${label} pile ${index + 1}`);

    if (!pile.ok) {
      return fail(pile.reason);
    }

    piles.push(pile.value);
  }

  return pass(piles);
};

const isFoundationSequence = (pile: readonly Card[]): boolean =>
  pile.every(
    (card, index) =>
      card.faceUp && card.suit === pile[0]?.suit && card.rank === ACE + index
  );

const isTableauColumn = (column: readonly Card[]): boolean => {
  const firstFaceUp = column.findIndex((card) => card.faceUp);

  if (column.length === 0) {
    return true;
  }

  if (firstFaceUp === -1) {
    return false;
  }

  return isValidRun(column.slice(firstFaceUp));
};

const checkTable = (position: Position): string | null => {
  const all = [
    ...position.stock,
    ...position.waste,
    ...position.foundations.flat(),
    ...position.tableau.flat(),
  ];

  const ids = new Set(all.map((card) => card.id));

  if (all.length !== DECK_SIZE || ids.size !== DECK_SIZE) {
    return "The saved game does not hold exactly one full deck.";
  }

  if (position.stock.some((card) => card.faceUp)) {
    return "The saved stock has a face-up card.";
  }

  if (position.waste.some((card) => !card.faceUp)) {
    return "The saved waste pile has a face-down card.";
  }

  if (!position.foundations.every(isFoundationSequence)) {
    return "A saved foundation is out of order.";
  }

  if (!position.tableau.every(isTableauColumn)) {
    return "A saved column is out of order.";
  }

  return null;
};

const parseDrawCount = (value: JsonValue | undefined): DrawCount | null => {
  if (value === 1) {
    return 1;
  }

  return value === 3 ? 3 : null;
};

const parsePosition = (value: JsonValue | undefined): Parsed<Position> => {
  if (!isRecord(value)) {
    return fail("The saved table is missing.");
  }

  const drawCount = parseDrawCount(value.drawCount);
  const { moves, recycleLimit, recycles, seed } = value;

  if (drawCount === null) {
    return fail("The saved draw setting is not 1 or 3.");
  }

  if (!(isInteger(moves) && isInteger(recycles) && isInteger(seed))) {
    return fail("The saved move counts could not be read.");
  }

  if (moves < 0 || recycles < 0) {
    return fail("The saved move counts are negative.");
  }

  const limit = recycleLimit === null ? null : recycleLimit;

  if (limit !== null && !(isInteger(limit) && limit >= 0)) {
    return fail("The saved recycle limit could not be read.");
  }

  const stock = parsePile(value.stock, "stock");
  const waste = parsePile(value.waste, "waste pile");

  const foundations = parsePiles(
    value.foundations,
    "foundations",
    FOUNDATION_COUNT
  );

  const tableau = parsePiles(value.tableau, "columns", TABLEAU_COLUMNS);

  for (const part of [stock, waste, foundations, tableau]) {
    if (!part.ok) {
      return fail(part.reason);
    }
  }

  if (!(stock.ok && waste.ok && foundations.ok && tableau.ok)) {
    return fail("The saved table could not be read.");
  }

  const position: Position = {
    drawCount,
    foundations: foundations.value,
    moves,
    recycleLimit: isInteger(limit) ? limit : null,
    recycles,
    seed,
    stock: stock.value,
    tableau: tableau.value,
    waste: waste.value,
  };

  const problem = checkTable(position);

  return problem ? fail(problem) : pass(position);
};

const encodePosition = (position: Position): JsonObject => ({
  drawCount: position.drawCount,
  foundations: position.foundations.map((pile) => pile.map(encodeCard)),
  moves: position.moves,
  recycleLimit: position.recycleLimit,
  recycles: position.recycles,
  seed: position.seed,
  stock: position.stock.map(encodeCard),
  tableau: position.tableau.map((column) => column.map(encodeCard)),
  waste: position.waste.map(encodeCard),
});

/** A versioned JSON save of the game, including recent undo history. */
export const serializeGame = (
  state: GameState,
  savedAt: Date = new Date()
): string =>
  JSON.stringify({
    format: SAVE_FORMAT,
    game: encodePosition(state),
    history: state.history.slice(-SAVED_HISTORY_LIMIT).map(encodePosition),
    savedAt: savedAt.toISOString(),
    version: SAVE_VERSION,
  });

const readJson = (text: string): Parsed<JsonValue> => {
  try {
    const value: JsonValue = JSON.parse(text);

    return pass(value);
  } catch {
    return fail("The saved game could not be read.");
  }
};

/** Validates a save completely; a corrupted or foreign save is rejected, never half-loaded. */
export const parseSavedGame = (text: string): ParseResult => {
  const json = readJson(text);

  if (!json.ok) {
    return { ok: false, reason: json.reason };
  }

  const save = json.value;

  if (!isRecord(save) || save.format !== SAVE_FORMAT) {
    return { ok: false, reason: "This is not a saved solitaire game." };
  }

  if (save.version !== SAVE_VERSION) {
    return {
      ok: false,
      reason: "This save comes from a different version of the game.",
    };
  }

  const game = parsePosition(save.game);

  if (!game.ok) {
    return { ok: false, reason: game.reason };
  }

  const history: Position[] = [];
  const savedHistory = isList(save.history) ? save.history : [];

  for (const entry of savedHistory) {
    const position = parsePosition(entry);

    if (!position.ok) {
      return {
        ok: false,
        reason: `An undo step is damaged: ${position.reason}`,
      };
    }

    history.push(position.value);
  }

  return {
    ok: true,
    savedAt: isText(save.savedAt) ? save.savedAt : "",
    state: { ...game.value, history },
  };
};

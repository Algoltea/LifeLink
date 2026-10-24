import type { GameState, Position } from "./game";
import { LAYOUT_IDS, layoutFor } from "./layouts";
import type { LayoutId } from "./layouts";
import { matchGroup, tileFromId } from "./tiles";
import type { Tile } from "./tiles";

export const SAVE_FORMAT = "lifelink/mahjong";

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

const parseLayout = (value: JsonValue | undefined): LayoutId | null =>
  LAYOUT_IDS.find((id) => id === value) ?? null;

const parseTiles = (
  value: JsonValue | undefined,
  count: number
): Parsed<(Tile | null)[]> => {
  if (!isList(value) || value.length !== count) {
    return fail(`The saved board should have ${count} places.`);
  }

  const tiles: (Tile | null)[] = [];

  for (const entry of value) {
    const tile = isText(entry) ? tileFromId(entry) : null;

    if (entry !== null && !tile) {
      return fail("The saved board holds a tile that could not be read.");
    }

    tiles.push(tile);
  }

  return pass(tiles);
};

const countBy = <Item>(
  items: readonly Item[],
  key: (item: Item) => string
): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  }

  return counts;
};

/** The tiles left must come from the layout's own set and leave only whole pairs. */
const checkBoard = (layoutId: LayoutId, tiles: readonly (Tile | null)[]) => {
  const left = tiles.filter((tile) => tile !== null);
  const dealt = countBy(layoutFor(layoutId).tiles, (tile) => tile.id);

  for (const [id, count] of countBy(left, (tile) => tile.id)) {
    if (count > (dealt.get(id) ?? 0)) {
      return "The saved board holds tiles that are not in this layout.";
    }
  }

  for (const count of countBy(left, matchGroup).values()) {
    if (count % 2 !== 0) {
      return "The saved board has a tile without its pair.";
    }
  }

  return null;
};

const parsePosition = (value: JsonValue | undefined): Parsed<Position> => {
  if (!isRecord(value)) {
    return fail("The saved board is missing.");
  }

  const layout = parseLayout(value.layout);
  const { moves, seed, shuffles } = value;

  if (layout === null) {
    return fail("The saved layout is not Easy or Classic.");
  }

  if (!(isInteger(moves) && isInteger(seed) && isInteger(shuffles))) {
    return fail("The saved move counts could not be read.");
  }

  if (moves < 0 || shuffles < 0) {
    return fail("The saved move counts are negative.");
  }

  const tiles = parseTiles(value.tiles, layoutFor(layout).slots.length);

  if (!tiles.ok) {
    return fail(tiles.reason);
  }

  const problem = checkBoard(layout, tiles.value);

  if (problem) {
    return fail(problem);
  }

  return pass({ layout, moves, seed, shuffles, tiles: tiles.value });
};

const encodePosition = (position: Position): JsonObject => ({
  layout: position.layout,
  moves: position.moves,
  seed: position.seed,
  shuffles: position.shuffles,
  tiles: position.tiles.map((tile) => tile?.id ?? null),
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
    return { ok: false, reason: "This is not a saved mahjong game." };
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

    if (position.value.layout !== game.value.layout) {
      return {
        ok: false,
        reason: "An undo step is damaged: it belongs to a different layout.",
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

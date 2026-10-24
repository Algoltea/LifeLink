import { createRandom, dealBoard, placeWinnable } from "./deal";
import { layoutFor } from "./layouts";
import type { Layout, LayoutId } from "./layouts";
import { blockerFor, blockerMessage, freePairs } from "./rules";
import type { Board, Pair } from "./rules";
import { pairName, tileName, tilesMatch } from "./tiles";
import type { Tile } from "./tiles";

export const HISTORY_LIMIT = 200;

/** Keeps each shuffle of one deal different from the last, and repeatable. */
const SHUFFLE_SEED_STEP = 7919;

export type Move =
  | { readonly first: number; readonly second: number; readonly type: "match" }
  | { readonly type: "shuffle" };

/** Everything that describes the board at one moment, without undo history. */
export interface Position {
  readonly layout: LayoutId;
  /** Matches and shuffles made so far. */
  readonly moves: number;
  readonly seed: number;
  readonly shuffles: number;
  /** One entry per layout slot; null once that tile is matched. */
  readonly tiles: Board;
}

export interface GameState extends Position {
  /** Earlier positions, oldest first, capped at HISTORY_LIMIT. */
  readonly history: readonly Position[];
}

export type MoveErrorCode =
  | "blocked"
  | "cannot-shuffle"
  | "invalid-index"
  | "no-match"
  | "nothing-to-shuffle"
  | "nothing-to-undo"
  | "same-tile";

export interface MoveError {
  readonly code: MoveErrorCode;
  readonly message: string;
}

export type MoveResult =
  | {
      readonly description: string;
      readonly ok: true;
      readonly state: GameState;
    }
  | { readonly error: MoveError; readonly ok: false };

export interface NewGameOptions {
  readonly layout?: LayoutId;
  readonly seed: number;
}

const refuse = (code: MoveErrorCode, message: string): MoveResult => ({
  error: { code, message },
  ok: false,
});

export const newGame = (options: NewGameOptions): GameState => {
  const layout = options.layout ?? "easy";

  return {
    history: [],
    layout,
    moves: 0,
    seed: options.seed,
    shuffles: 0,
    tiles: dealBoard(layoutFor(layout), options.seed).board,
  };
};

export const layoutOf = (state: Position): Layout => layoutFor(state.layout);

export const positionOf = (state: Position): Position => ({
  layout: state.layout,
  moves: state.moves,
  seed: state.seed,
  shuffles: state.shuffles,
  tiles: state.tiles,
});

const advance = (previous: GameState, next: Position): GameState => ({
  ...next,
  history: [...previous.history, positionOf(previous)].slice(-HISTORY_LIMIT),
  moves: previous.moves + 1,
});

export const tilesLeft = (state: Position): number =>
  state.tiles.filter((tile) => tile !== null).length;

export const isWon = (state: Position): boolean => tilesLeft(state) === 0;

const plural = (count: number, word: string): string =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

const leftNote = (count: number): string =>
  count === 0 ? "" : ` ${plural(count, "tile")} left.`;

/** The tile at a slot, or why it cannot be picked. */
export const pickable = (
  state: Position,
  index: number
):
  | { readonly ok: true; readonly tile: Tile }
  | { readonly error: MoveError; readonly ok: false } => {
  const tile = state.tiles[index];

  if (index < 0 || index >= state.tiles.length || tile === undefined) {
    return {
      error: { code: "invalid-index", message: "There is no tile there." },
      ok: false,
    };
  }

  const blocker = blockerFor(layoutOf(state), state.tiles, index);

  if (blocker || !tile) {
    return {
      error: { code: "blocked", message: blockerMessage(blocker ?? "removed") },
      ok: false,
    };
  }

  return { ok: true, tile };
};

const match = (state: GameState, first: number, second: number): MoveResult => {
  if (first === second) {
    return refuse("same-tile", "That is the same tile. Pick a second one.");
  }

  const one = pickable(state, first);

  if (!one.ok) {
    return { error: one.error, ok: false };
  }

  const two = pickable(state, second);

  if (!two.ok) {
    return { error: two.error, ok: false };
  }

  if (!tilesMatch(one.tile, two.tile)) {
    return refuse(
      "no-match",
      `The ${tileName(one.tile)} and the ${tileName(two.tile)} don't match. Pick two tiles that are the same.`
    );
  }

  const tiles = state.tiles.map((tile, index) =>
    index === first || index === second ? null : tile
  );

  const next = advance(state, { ...state, tiles });

  return {
    description: `Matched ${pairName(one.tile, two.tile)}.${leftNote(tilesLeft(next))}`,
    ok: true,
    state: next,
  };
};

/**
 * Rearranges the tiles that are left into the same places, always into an
 * order that can still be cleared.
 */
const shuffle = (state: GameState): MoveResult => {
  const slots: number[] = [];
  const tiles: Tile[] = [];

  for (const [index, tile] of state.tiles.entries()) {
    if (tile) {
      slots.push(index);
      tiles.push(tile);
    }
  }

  if (tiles.length === 0) {
    return refuse("nothing-to-shuffle", "There are no tiles left to shuffle.");
  }

  const shuffles = state.shuffles + 1;

  const placed = placeWinnable(
    layoutOf(state),
    slots,
    tiles,
    createRandom(state.seed + shuffles * SHUFFLE_SEED_STEP)
  );

  if (!placed) {
    return refuse(
      "cannot-shuffle",
      "These tiles can't be rearranged into a board that can be cleared. Undo a few moves instead."
    );
  }

  return {
    description: `Shuffled the ${plural(tiles.length, "tile")} left. The board can still be cleared.`,
    ok: true,
    state: advance(state, { ...state, shuffles, tiles: placed.board }),
  };
};

export const applyMove = (state: GameState, move: Move): MoveResult =>
  move.type === "shuffle"
    ? shuffle(state)
    : match(state, move.first, move.second);

export const canUndo = (state: GameState): boolean => state.history.length > 0;

export const undo = (state: GameState): MoveResult => {
  const previous = state.history.at(-1);

  if (!previous) {
    return refuse("nothing-to-undo", "There is nothing to undo yet.");
  }

  return {
    description: "Undid the last move.",
    ok: true,
    state: { ...previous, history: state.history.slice(0, -1) },
  };
};

/** Pairs of free, matching tiles that can be taken right now. */
export const availablePairs = (state: Position): Pair[] =>
  freePairs(layoutOf(state), state.tiles);

export const hasMovesLeft = (state: Position): boolean =>
  availablePairs(state).length > 0;

/** How many tiles still in play a slot holds back: the ones beneath it and beside it. */
const holdsBack = (layout: Layout, board: Board, index: number): number => {
  let count = 0;

  for (const [other, resting] of layout.above.entries()) {
    if (board[other] && resting.includes(index)) {
      count += 1;
    }
  }

  const beside = [
    ...(layout.left[index] ?? []),
    ...(layout.right[index] ?? []),
  ];

  return count + beside.filter((other) => board[other]).length;
};

/**
 * A suggested pair: the one that opens up the most of the board, so tiles on
 * top and at the ends of long rows go first.
 */
export const findHint = (state: Position): Pair | null => {
  const layout = layoutOf(state);
  let best: Pair | null = null;
  let bestScore = -1;

  for (const pair of availablePairs(state)) {
    const score =
      holdsBack(layout, state.tiles, pair.first) +
      holdsBack(layout, state.tiles, pair.second);

    if (score > bestScore) {
      best = pair;
      bestScore = score;
    }
  }

  return best;
};

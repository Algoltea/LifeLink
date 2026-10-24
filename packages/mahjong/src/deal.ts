import type { Layout } from "./layouts";
import { freeSlots } from "./rules";
import type { Board, Pair } from "./rules";
import { matchGroup } from "./tiles";
import type { Tile } from "./tiles";

const UINT32_RANGE = 4_294_967_296;

const MULBERRY_INCREMENT = 0x6d_2b_79_f5;

/** Fresh attempts allowed before a deal or shuffle gives up; real layouts need one or two. */
export const PLACEMENT_ATTEMPTS = 200;

/**
 * Mulberry32, the same small seeded generator Solitaire uses: one seed always
 * deals the same board, which keeps saves, tests, and shuffles reproducible.
 */
export const createRandom = (seed: number): (() => number) => {
  let current = Math.abs(Math.trunc(seed)) % UINT32_RANGE;

  return () => {
    current = (current + MULBERRY_INCREMENT) % UINT32_RANGE;

    // oxlint-disable-next-line no-bitwise -- Mulberry32 is defined in 32-bit integer operations.
    let mixed = Math.imul(current ^ (current >>> 15), current | 1);

    // oxlint-disable-next-line no-bitwise -- Mulberry32 is defined in 32-bit integer operations.
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    // oxlint-disable-next-line no-bitwise -- Mulberry32 is defined in 32-bit integer operations.
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
};

/** Fisher–Yates shuffle of a copy; the input is left untouched. */
export const shuffled = <Item>(
  items: readonly Item[],
  random: () => number
): Item[] => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    const current = copy[index];
    const other = copy[swapWith];

    if (current !== undefined && other !== undefined) {
      copy[index] = other;
      copy[swapWith] = current;
    }
  }

  return copy;
};

export type TilePair = readonly [Tile, Tile];

/** A winnable board, with one order of matches that clears it. */
export interface Placement {
  readonly board: Board;
  readonly solution: readonly Pair[];
}

/**
 * Splits tiles into matching pairs in a random order. Returns null when a
 * group has an odd count, because then the tiles can never all be matched.
 */
export const pairUp = (
  tiles: readonly Tile[],
  random: () => number
): TilePair[] | null => {
  const groups = new Map<string, Tile[]>();

  for (const tile of shuffled(tiles, random)) {
    const group = groups.get(matchGroup(tile)) ?? [];

    group.push(tile);
    groups.set(matchGroup(tile), group);
  }

  const pairs: TilePair[] = [];

  for (const group of groups.values()) {
    if (group.length % 2 !== 0) {
      return null;
    }

    for (let index = 0; index < group.length; index += 2) {
      const first = group[index];
      const second = group[index + 1];

      if (first && second) {
        pairs.push([first, second]);
      }
    }
  }

  return shuffled(pairs, random);
};

/** Higher tiles are taken first, which avoids ending with one tile stacked on another. */
const pickWeighted = (
  layout: Layout,
  candidates: readonly number[],
  random: () => number
): number | null => {
  const weights = candidates.map((index) => 1 + (layout.slots[index]?.z ?? 0));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = random() * total;

  for (const [position, index] of candidates.entries()) {
    roll -= weights[position] ?? 0;

    if (roll < 0) {
      return index;
    }
  }

  return candidates.at(-1) ?? null;
};

/**
 * Works backwards from a cleared board: each pair goes into two slots that
 * are both free once every later pair is gone. Playing the pairs in order
 * therefore clears the board, so the result can always be won.
 */
const placeOnce = (
  layout: Layout,
  slots: readonly number[],
  pairs: readonly TilePair[],
  random: () => number
): Placement | null => {
  const open = new Set(slots);

  const occupied: (true | null)[] = layout.slots.map((_slot, index) =>
    open.has(index) ? true : null
  );

  const board: (Tile | null)[] = layout.slots.map(() => null);
  const solution: Pair[] = [];

  for (const [firstTile, secondTile] of pairs) {
    const free = freeSlots(layout, occupied);
    const first = pickWeighted(layout, free, random);

    const second = pickWeighted(
      layout,
      free.filter((index) => index !== first),
      random
    );

    if (first === null || second === null) {
      return null;
    }

    board[first] = firstTile;
    board[second] = secondTile;
    occupied[first] = null;
    occupied[second] = null;
    solution.push({
      first: Math.min(first, second),
      second: Math.max(first, second),
    });
  }

  return { board, solution };
};

/**
 * Places tiles into the given slots so that every one can be matched. Returns
 * null when no winnable arrangement was found, for example when the only
 * slots left are two tiles stacked on top of each other.
 */
export const placeWinnable = (
  layout: Layout,
  slots: readonly number[],
  tiles: readonly Tile[],
  random: () => number
): Placement | null => {
  if (slots.length !== tiles.length) {
    return null;
  }

  for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt += 1) {
    const pairs = pairUp(tiles, random);

    if (!pairs) {
      return null;
    }

    const placement = placeOnce(layout, slots, pairs, random);

    if (placement) {
      return placement;
    }
  }

  return null;
};

/** A fresh, winnable board for the layout. The same seed always deals the same board. */
export const dealBoard = (layout: Layout, seed: number): Placement => {
  const slots = layout.slots.map((_slot, index) => index);

  const placement = placeWinnable(
    layout,
    slots,
    layout.tiles,
    createRandom(seed)
  );

  if (!placement) {
    throw new Error(
      `The ${layout.name} layout could not be dealt as a winnable board.`
    );
  }

  return placement;
};

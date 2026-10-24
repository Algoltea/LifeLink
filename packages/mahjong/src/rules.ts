import type { Layout } from "./layouts";
import { tilesMatch } from "./tiles";
import type { Tile } from "./tiles";

/** What sits in each of a layout's slots; null once the tile there is matched. */
export type Board<Item = Tile> = readonly (Item | null)[];

/** Why a tile cannot be picked. */
export type Blocker = "boxed-in" | "covered" | "removed";

/** Two slots, always with the lower index first. */
export interface Pair {
  readonly first: number;
  readonly second: number;
}

const isEmpty = <Item>(board: Board<Item>, index: number): boolean =>
  (board[index] ?? null) === null;

const allEmpty = <Item>(
  board: Board<Item>,
  indexes: readonly number[] | undefined
): boolean => (indexes ?? []).every((index) => isEmpty(board, index));

/**
 * A tile is free when nothing rests on it and at least one of its long sides,
 * left or right, is open. Null means the tile can be picked.
 */
export const blockerFor = <Item>(
  layout: Layout,
  board: Board<Item>,
  index: number
): Blocker | null => {
  if (isEmpty(board, index)) {
    return "removed";
  }

  if (!allEmpty(board, layout.above[index])) {
    return "covered";
  }

  const leftOpen = allEmpty(board, layout.left[index]);
  const rightOpen = allEmpty(board, layout.right[index]);

  return leftOpen || rightOpen ? null : "boxed-in";
};

export const isFree = <Item>(
  layout: Layout,
  board: Board<Item>,
  index: number
): boolean => blockerFor(layout, board, index) === null;

/** Every slot holding a free tile, in slot order. */
export const freeSlots = <Item>(
  layout: Layout,
  board: Board<Item>
): number[] => {
  const free: number[] = [];

  for (let index = 0; index < layout.slots.length; index += 1) {
    if (isFree(layout, board, index)) {
      free.push(index);
    }
  }

  return free;
};

/** Every pair of free tiles that match each other. */
export const freePairs = (layout: Layout, board: Board): Pair[] => {
  const free = freeSlots(layout, board);
  const pairs: Pair[] = [];

  for (const [position, first] of free.entries()) {
    const tile = board[first];

    for (const second of free.slice(position + 1)) {
      const other = board[second];

      if (tile && other && tilesMatch(tile, other)) {
        pairs.push({ first, second });
      }
    }
  }

  return pairs;
};

/** Plain-language reason a tile cannot be picked. */
export const blockerMessage = (blocker: Blocker): string => {
  if (blocker === "removed") {
    return "That tile has already been matched.";
  }

  return blocker === "covered"
    ? "That tile is covered by another tile. Clear the tiles on top of it first."
    : "That tile is boxed in on both sides. Pick a tile with a free left or right side.";
};

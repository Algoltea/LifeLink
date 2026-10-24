import {
  COPIES_PER_TILE,
  dragonTile,
  DRAGONS,
  FLOWERS,
  flowerTile,
  RANKS,
  SEASONS,
  seasonTile,
  SUITS,
  suitTile,
  windTile,
  WINDS,
} from "./tiles";
import type { Tile } from "./tiles";

export const LAYOUT_IDS = ["easy", "classic"] as const;

export type LayoutId = (typeof LAYOUT_IDS)[number];

/**
 * One place a tile can sit. Positions are in half-tile steps, so a tile at
 * x = 3 straddles the tiles at x = 2 and x = 4 on the layer below it.
 */
export interface Slot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Layout {
  /** For each slot, the slots on higher layers that rest on it. */
  readonly above: readonly (readonly number[])[];
  /** Layers, counting the bottom one. */
  readonly depth: number;
  /** Height of the whole layout in half-tile steps. */
  readonly height: number;
  readonly id: LayoutId;
  /** For each slot, the slots touching its left side on the same layer. */
  readonly left: readonly (readonly number[])[];
  readonly name: string;
  /** For each slot, the slots touching its right side on the same layer. */
  readonly right: readonly (readonly number[])[];
  /** Bottom layer first, then top to bottom and left to right within a layer. */
  readonly slots: readonly Slot[];
  /** The tiles dealt into this layout: exactly one per slot. */
  readonly tiles: readonly Tile[];
  /** Width of the whole layout in half-tile steps. */
  readonly width: number;
}

/** A tile is two half-steps wide and two tall. */
const TILE_SPAN = 2;

const row = (z: number, y: number, fromX: number, toX: number): Slot[] => {
  const slots: Slot[] = [];

  for (let x = fromX; x <= toX; x += TILE_SPAN) {
    slots.push({ x, y, z });
  }

  return slots;
};

const block = (
  z: number,
  [fromX, toX]: readonly [number, number],
  [fromY, toY]: readonly [number, number]
): Slot[] => {
  const slots: Slot[] = [];

  for (let y = fromY; y <= toY; y += TILE_SPAN) {
    slots.push(...row(z, y, fromX, toX));
  }

  return slots;
};

/** Eight tiles across and seven down, with a four-by-four layer centred on top. */
const EASY_SLOTS: readonly Slot[] = [
  ...block(0, [0, 14], [0, 12]),
  ...block(1, [4, 10], [3, 9]),
];

/** The traditional 144-tile Turtle: five layers, with one tile on each side and a cap on top. */
const CLASSIC_SLOTS: readonly Slot[] = [
  ...row(0, 0, 2, 24),
  ...row(0, 2, 6, 20),
  ...row(0, 4, 4, 22),
  ...row(0, 6, 2, 24),
  ...row(0, 8, 2, 24),
  ...row(0, 10, 4, 22),
  ...row(0, 12, 6, 20),
  ...row(0, 14, 2, 24),
  { x: 0, y: 7, z: 0 },
  { x: 26, y: 7, z: 0 },
  { x: 28, y: 7, z: 0 },
  ...block(1, [8, 18], [2, 12]),
  ...block(2, [10, 16], [4, 10]),
  ...block(3, [12, 14], [6, 8]),
  { x: 13, y: 7, z: 4 },
];

const copies = (tiles: readonly Tile[]): Tile[] =>
  tiles.flatMap((tile) => Array.from({ length: COPIES_PER_TILE }, () => tile));

const BONUS_TILES: readonly Tile[] = [
  ...FLOWERS.map(flowerTile),
  ...SEASONS.map(seasonTile),
];

const HONOUR_TILES: readonly Tile[] = [
  ...WINDS.map(windTile),
  ...DRAGONS.map(dragonTile),
];

/** 72 tiles: the Characters suit, the winds and dragons, and the flowers and seasons. */
const EASY_TILES: readonly Tile[] = [
  ...copies(RANKS.map((rank) => suitTile("characters", rank))),
  ...copies(HONOUR_TILES),
  ...BONUS_TILES,
];

/** The full 144-tile set. */
const CLASSIC_TILES: readonly Tile[] = [
  ...copies(SUITS.flatMap((suit) => RANKS.map((rank) => suitTile(suit, rank)))),
  ...copies(HONOUR_TILES),
  ...BONUS_TILES,
];

const touchesVertically = (first: Slot, second: Slot): boolean =>
  Math.abs(first.y - second.y) < TILE_SPAN;

const overlaps = (first: Slot, second: Slot): boolean =>
  Math.abs(first.x - second.x) < TILE_SPAN && touchesVertically(first, second);

const neighbours = (
  slots: readonly Slot[],
  test: (slot: Slot, other: Slot) => boolean
): number[][] =>
  slots.map((slot) => {
    const found: number[] = [];

    for (const [index, other] of slots.entries()) {
      if (test(slot, other)) {
        found.push(index);
      }
    }

    return found;
  });

const bySlotOrder = (first: Slot, second: Slot): number =>
  first.z - second.z || first.y - second.y || first.x - second.x;

const buildLayout = (
  id: LayoutId,
  name: string,
  unordered: readonly Slot[],
  tiles: readonly Tile[]
): Layout => {
  const slots = unordered.toSorted(bySlotOrder);

  return {
    above: neighbours(
      slots,
      (slot, other) => other.z > slot.z && overlaps(slot, other)
    ),
    depth: Math.max(...slots.map((slot) => slot.z)) + 1,
    height: Math.max(...slots.map((slot) => slot.y)) + TILE_SPAN,
    id,
    left: neighbours(
      slots,
      (slot, other) =>
        other.z === slot.z &&
        other.x === slot.x - TILE_SPAN &&
        touchesVertically(slot, other)
    ),
    name,
    right: neighbours(
      slots,
      (slot, other) =>
        other.z === slot.z &&
        other.x === slot.x + TILE_SPAN &&
        touchesVertically(slot, other)
    ),
    slots,
    tiles,
    width: Math.max(...slots.map((slot) => slot.x)) + TILE_SPAN,
  };
};

const LAYOUTS: Readonly<Record<LayoutId, Layout>> = {
  classic: buildLayout("classic", "Classic", CLASSIC_SLOTS, CLASSIC_TILES),
  easy: buildLayout("easy", "Easy", EASY_SLOTS, EASY_TILES),
};

export const layoutFor = (id: LayoutId): Layout => LAYOUTS[id];

import { layoutOf } from "@lifelink/mahjong/game";
import type { Position } from "@lifelink/mahjong/game";
import type { Layout, Slot } from "@lifelink/mahjong/layouts";
import { blockerFor, freeSlots } from "@lifelink/mahjong/rules";
import { tileName } from "@lifelink/mahjong/tiles";
import type { CSSProperties } from "react";

export type Direction = "down" | "left" | "right" | "up";

/** Tiles are drawn 4 wide by 5 tall, close to a real tile. */
const TILE_HEIGHT_PER_WIDTH = 1.25;

/** Each layer sits this share of a tile's width up and to the left of the one below. */
const LAYER_SHIFT = 0.12;

/** A tile spans two half-steps of the layout grid. */
const TILE_SPAN = 2;

/** Tile widths, in rem, so the board follows the person's text-size setting. */
const MIN_TILE_REM = 2.25;

const MAX_TILE_REM = 4.5;

const PERCENT = 100;

interface Extent {
  /** Board width in half-steps, including room for the layer shift. */
  readonly across: number;
  /** Board height in vertical half-steps, including room for the layer shift. */
  readonly down: number;
  /** One layer's shift, in horizontal half-steps. */
  readonly shiftAcross: number;
  /** One layer's shift, in vertical half-steps. */
  readonly shiftDown: number;
}

const extentOf = (layout: Layout): Extent => {
  const shiftAcross = LAYER_SHIFT * TILE_SPAN;
  const shiftDown = shiftAcross / TILE_HEIGHT_PER_WIDTH;
  const layers = layout.depth - 1;

  return {
    across: layout.width + shiftAcross * layers,
    down: layout.height + shiftDown * layers,
    shiftAcross,
    shiftDown,
  };
};

const percent = (part: number, whole: number): string =>
  `${(part / whole) * PERCENT}%`;

/**
 * Measured room taken above and around the board (page padding, header,
 * message line, and the board's own padding), so the whole page fits on the
 * screen without scrolling.
 */
const ROOM_AROUND_BOARD = "19rem";

/**
 * The board keeps the layout's proportions and grows between a minimum and a
 * maximum tile size, but never taller than the screen allows, so the page
 * fits without scrolling. The minimum wins on very short screens.
 */
export const boardStyle = (layout: Layout): CSSProperties => {
  const { across, down } = extentOf(layout);
  const tilesAcross = across / TILE_SPAN;
  const widthPerHeight = across / (down * TILE_HEIGHT_PER_WIDTH);

  return {
    aspectRatio: `${across} / ${down * TILE_HEIGHT_PER_WIDTH}`,
    maxWidth: `min(${tilesAcross * MAX_TILE_REM}rem, calc((100svh - ${ROOM_AROUND_BOARD}) * ${widthPerHeight}))`,
    minWidth: `${tilesAcross * MIN_TILE_REM}rem`,
  };
};

/** Stacking: each layer above the last, and a marked tile above its neighbours so its ring stays whole. */
const LAYER_STACK = 10;

const MARK_LIFT = 5;

/**
 * The stacking order is a CSS variable rather than zIndex, so the focus and
 * hover classes can still lift a tile above its neighbours.
 */
interface TileStyle extends CSSProperties {
  readonly "--tile-layer": number;
}

/** Where a tile sits on the board, as percentages, so it scales with the board. */
export const tileStyle = (
  layout: Layout,
  slot: Slot,
  marked: boolean
): TileStyle => {
  const { across, down, shiftAcross, shiftDown } = extentOf(layout);
  const lift = layout.depth - 1 - slot.z;

  return {
    "--tile-layer": slot.z * LAYER_STACK + (marked ? MARK_LIFT : 0),
    height: percent(TILE_SPAN, down),
    left: percent(slot.x + shiftAcross * lift, across),
    top: percent(slot.y + shiftDown * lift, down),
    width: percent(TILE_SPAN, across),
  };
};

const STATE_WORDS = {
  "boxed-in": "Blocked on both sides.",
  covered: "Covered by another tile.",
  removed: "Already matched.",
} as const;

/** Spoken name of a tile: what it is, where it is, and whether it can be picked. */
export const tileLabel = (state: Position, index: number): string => {
  const layout = layoutOf(state);
  const tile = state.tiles[index];
  const slot = layout.slots[index];

  if (!(tile && slot)) {
    return "Empty place.";
  }

  const place = [
    `row ${Math.floor(slot.y / TILE_SPAN) + 1}`,
    `column ${Math.floor(slot.x / TILE_SPAN) + 1}`,
  ];

  if (layout.depth > 1) {
    place.push(`layer ${slot.z + 1}`);
  }

  const blocker = blockerFor(layout, state.tiles, index);

  return `${tileName(tile)}, ${place.join(", ")}. ${blocker ? STATE_WORDS[blocker] : "Free."}`;
};

/** The free tiles in reading order: top row first, left to right. */
const freeInReadingOrder = (state: Position): number[] => {
  const layout = layoutOf(state);

  return freeSlots(layout, state.tiles).toSorted((first, second) => {
    const one = layout.slots[first];
    const two = layout.slots[second];

    if (!(one && two)) {
      return 0;
    }

    return one.y - two.y || one.x - two.x || two.z - one.z;
  });
};

/** The tile the keyboard starts on: the first free tile in reading order. */
export const firstFreeTile = (state: Position): number =>
  freeInReadingOrder(state)[0] ?? 0;

const distance = (first: Slot, second: Slot): number =>
  Math.hypot(first.x - second.x, first.y - second.y);

/** Keeps the keyboard on a free tile after the board changes, staying as close as possible. */
export const clampCursor = (state: Position, cursor: number): number => {
  const layout = layoutOf(state);

  if (blockerFor(layout, state.tiles, cursor) === null) {
    return cursor;
  }

  const from = layout.slots[cursor];
  const free = freeInReadingOrder(state);

  if (!from) {
    return free[0] ?? cursor;
  }

  let best = free[0] ?? cursor;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const index of free) {
    const slot = layout.slots[index];
    const away = slot ? distance(from, slot) : Number.POSITIVE_INFINITY;

    if (away < bestDistance) {
      best = index;
      bestDistance = away;
    }
  }

  return best;
};

/** Sideways drift counts double, so the arrows prefer tiles straight ahead. */
const SIDEWAYS_WEIGHT = 2;

const offsetsFor = (
  from: Slot,
  to: Slot,
  direction: Direction
): readonly [number, number] => {
  const across = to.x - from.x;
  const down = to.y - from.y;

  switch (direction) {
    case "left": {
      return [-across, Math.abs(down)];
    }

    case "right": {
      return [across, Math.abs(down)];
    }

    case "up": {
      return [-down, Math.abs(across)];
    }

    default: {
      return [down, Math.abs(across)];
    }
  }
};

/** Arrow-key movement: the nearest free tile in that direction, or stay put at the edge. */
export const moveCursor = (
  state: Position,
  cursor: number,
  direction: Direction
): number => {
  const layout = layoutOf(state);
  const from = layout.slots[cursor];

  if (!from) {
    return firstFreeTile(state);
  }

  let best = cursor;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const index of freeSlots(layout, state.tiles)) {
    const slot = layout.slots[index];

    if (slot && index !== cursor) {
      const [ahead, sideways] = offsetsFor(from, slot, direction);
      const score = ahead + sideways * SIDEWAYS_WEIGHT;

      if (ahead > 0 && score < bestScore) {
        best = index;
        bestScore = score;
      }
    }
  }

  return best;
};

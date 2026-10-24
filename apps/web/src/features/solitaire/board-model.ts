import { ACE } from "@lifelink/solitaire/cards";
import type { Card } from "@lifelink/solitaire/cards";
import type {
  MoveSource,
  MoveTarget,
  Position,
} from "@lifelink/solitaire/game";
import { FOUNDATION_SUITS } from "@lifelink/solitaire/rules";

import { cardName } from "./localization";
import type { SolitaireMessages } from "./localization";

/** One focusable place on the board. Tableau slots name a card by index; an empty column uses index 0. */
export type Slot =
  | { readonly area: "foundation"; readonly index: number }
  | {
      readonly area: "tableau";
      readonly cardIndex: number;
      readonly index: number;
    }
  | { readonly area: "stock" }
  | { readonly area: "waste" };

export type Direction = "down" | "left" | "right" | "up";

export const STOCK_SLOT: Slot = { area: "stock" };

const COLUMN_COUNT = 7;

const FOUNDATION_COUNT = 4;

/** Top-row slot above each tableau column: stock, waste, waste (the fan), then the four foundations. */
const TOP_ROW_ABOVE_COLUMN: readonly Slot[] = [
  { area: "stock" },
  { area: "waste" },
  { area: "waste" },
  { area: "foundation", index: 0 },
  { area: "foundation", index: 1 },
  { area: "foundation", index: 2 },
  { area: "foundation", index: 3 },
];

const topRowOrder = (slot: Slot): number => {
  if (slot.area === "stock") {
    return 0;
  }

  if (slot.area === "waste") {
    return 1;
  }

  return slot.area === "foundation" ? slot.index + 2 : 0;
};

const topRowSlot = (order: number): Slot => {
  if (order <= 0) {
    return { area: "stock" };
  }

  if (order === 1) {
    return { area: "waste" };
  }

  return {
    area: "foundation",
    index: Math.min(order - 2, FOUNDATION_COUNT - 1),
  };
};

const columnBelow = (slot: Slot): number => {
  if (slot.area === "stock") {
    return 0;
  }

  if (slot.area === "waste") {
    return 1;
  }

  return slot.area === "foundation" ? slot.index + 3 : 0;
};

const firstFaceUpIndex = (column: readonly Card[]): number => {
  const index = column.findIndex((card) => card.faceUp);

  return index === -1 ? 0 : index;
};

/** The slot for a column's top card (or its empty place). */
export const columnTopSlot = (state: Position, index: number): Slot => ({
  area: "tableau",
  cardIndex: Math.max((state.tableau[index]?.length ?? 1) - 1, 0),
  index,
});

/** Keeps a cursor on a real, face-up place after the table changes. */
export const clampSlot = (state: Position, slot: Slot): Slot => {
  if (slot.area !== "tableau") {
    return slot;
  }

  const column = state.tableau[slot.index] ?? [];
  const last = Math.max(column.length - 1, 0);

  const cardIndex = Math.min(
    Math.max(slot.cardIndex, firstFaceUpIndex(column)),
    last
  );

  return { area: "tableau", cardIndex, index: slot.index };
};

const moveInTableau = (
  state: Position,
  slot: Extract<Slot, { area: "tableau" }>,
  direction: Direction
): Slot => {
  const column = state.tableau[slot.index] ?? [];

  if (direction === "left" || direction === "right") {
    const step = direction === "left" ? -1 : 1;
    const index = Math.min(Math.max(slot.index + step, 0), COLUMN_COUNT - 1);

    return columnTopSlot(state, index);
  }

  if (direction === "down") {
    return {
      ...slot,
      cardIndex: Math.min(slot.cardIndex + 1, Math.max(column.length - 1, 0)),
    };
  }

  if (slot.cardIndex > firstFaceUpIndex(column)) {
    return { ...slot, cardIndex: slot.cardIndex - 1 };
  }

  return TOP_ROW_ABOVE_COLUMN[slot.index] ?? STOCK_SLOT;
};

/** Arrow-key movement: across a row, down into a column, and up out of it. */
export const moveSlot = (
  state: Position,
  slot: Slot,
  direction: Direction
): Slot => {
  if (slot.area === "tableau") {
    return clampSlot(state, moveInTableau(state, slot, direction));
  }

  if (direction === "down") {
    return columnTopSlot(state, columnBelow(slot));
  }

  if (direction === "up") {
    return slot;
  }

  const order = topRowOrder(slot) + (direction === "left" ? -1 : 1);

  return topRowSlot(Math.min(Math.max(order, 0), FOUNDATION_COUNT + 1));
};

export const slotKey = (slot: Slot): string => {
  if (slot.area === "tableau") {
    return `tableau-${slot.index}-${slot.cardIndex}`;
  }

  return slot.area === "foundation" ? `foundation-${slot.index}` : slot.area;
};

export const sameSlot = (first: Slot, second: Slot): boolean =>
  slotKey(first) === slotKey(second);

/** The move source a slot stands for, when it holds a card that can move. */
export const sourceForSlot = (
  state: Position,
  slot: Slot
): MoveSource | null => {
  if (slot.area === "waste") {
    return state.waste.length > 0 ? { kind: "waste" } : null;
  }

  if (slot.area === "foundation") {
    return (state.foundations[slot.index]?.length ?? 0) > 0
      ? { index: slot.index, kind: "foundation" }
      : null;
  }

  if (slot.area === "tableau") {
    const card = state.tableau[slot.index]?.[slot.cardIndex];

    return card?.faceUp
      ? { cardIndex: slot.cardIndex, index: slot.index, kind: "tableau" }
      : null;
  }

  return null;
};

export const targetForSlot = (slot: Slot): MoveTarget | null => {
  if (slot.area === "foundation") {
    return { index: slot.index, kind: "foundation" };
  }

  return slot.area === "tableau"
    ? { index: slot.index, kind: "tableau" }
    : null;
};

export const slotForTarget = (state: Position, target: MoveTarget): Slot =>
  target.kind === "foundation"
    ? { area: "foundation", index: target.index }
    : columnTopSlot(state, target.index);

export const slotForSource = (source: MoveSource): Slot => {
  if (source.kind === "waste") {
    return { area: "waste" };
  }

  return source.kind === "foundation"
    ? { area: "foundation", index: source.index }
    : { area: "tableau", cardIndex: source.cardIndex, index: source.index };
};

export const sameSource = (
  first: MoveSource | null,
  second: MoveSource | null
): boolean =>
  first !== null &&
  second !== null &&
  slotKey(slotForSource(first)) === slotKey(slotForSource(second));

/** Whether a source's cards include this tableau card (a selected run highlights every card in it). */
export const sourceCovers = (
  source: MoveSource | null,
  index: number,
  cardIndex: number
): boolean =>
  source?.kind === "tableau" &&
  source.index === index &&
  cardIndex >= source.cardIndex;

export const targetMatches = (
  targets: readonly MoveTarget[],
  kind: MoveTarget["kind"],
  index: number
): boolean =>
  targets.some((target) => target.kind === kind && target.index === index);

export const stockLabel = (state: Position, t: SolitaireMessages): string => {
  if (state.stock.length > 0) {
    return t.stock(t.cards(state.stock.length));
  }

  return state.waste.length > 0 ? t.stockRecycle : t.stockEmpty;
};

export const wasteLabel = (state: Position, t: SolitaireMessages): string => {
  const top = state.waste.at(-1);

  return top ? t.wasteTop(cardName(top, t)) : t.wasteEmpty;
};

export const foundationLabel = (
  state: Position,
  index: number,
  t: SolitaireMessages
): string => {
  const top = state.foundations[index]?.at(-1);
  const suit = FOUNDATION_SUITS[index];

  if (!suit) {
    return t.foundation(index + 1);
  }

  const name = t.foundationName(t.suits[suit]);

  return top
    ? t.foundationTop(name, cardName(top, t))
    : t.foundationEmpty(name, cardName({ rank: ACE, suit }, t));
};

const countFaceDown = (cards: readonly Card[]): number =>
  cards.filter((item) => !item.faceUp).length;

export const tableauCardLabel = (
  column: readonly Card[],
  index: number,
  cardIndex: number,
  t: SolitaireMessages
): string => {
  const card = column[cardIndex];

  if (!card) {
    return t.columnEmpty(index + 1);
  }

  const above = column.length - 1 - cardIndex;
  const hidden = countFaceDown(column.slice(0, cardIndex));
  const parts = [t.columnCard(cardName(card, t), index + 1)];

  if (above > 0) {
    parts.push(t.cardsAbove(above));
  }

  if (hidden > 0 && cardIndex === firstFaceUpIndex(column)) {
    parts.push(t.cardsBelow(hidden));
  }

  return `${parts.join(", ")}.`;
};

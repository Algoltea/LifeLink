import { createDeck, withFace } from "./cards";
import type { Card } from "./cards";

export const TABLEAU_COLUMNS = 7;

export const FOUNDATION_COUNT = 4;

const UINT32_RANGE = 4_294_967_296;

const MULBERRY_INCREMENT = 0x6d_2b_79_f5;

/**
 * Mulberry32: a small, fast, seeded generator. The same seed always deals the
 * same game, which keeps saves, tests, and "replay this deal" reproducible.
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
export const shuffleDeck = (
  deck: readonly Card[],
  random: () => number
): Card[] => {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const other = shuffled[swapWith];

    if (current && other) {
      shuffled[index] = other;
      shuffled[swapWith] = current;
    }
  }

  return shuffled;
};

export interface DealtPiles {
  readonly stock: Card[];
  readonly tableau: Card[][];
}

/**
 * Deals the classic Klondike layout: column n holds n cards with only the last
 * one face up; the remaining 24 cards form the face-down stock.
 */
export const dealPiles = (deck: readonly Card[]): DealtPiles => {
  const tableau: Card[][] = [];
  let next = 0;

  for (let column = 0; column < TABLEAU_COLUMNS; column += 1) {
    const pile: Card[] = [];

    for (let row = 0; row <= column; row += 1) {
      const card = deck[next];

      next += 1;

      if (card) {
        pile.push(withFace(card, row === column));
      }
    }

    tableau.push(pile);
  }

  const stock = deck.slice(next).map((card) => withFace(card, false));

  return { stock, tableau };
};

export const dealSeed = (seed: number): DealtPiles =>
  dealPiles(shuffleDeck(createDeck(), createRandom(seed)));

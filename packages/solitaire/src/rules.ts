import {
  ACE,
  cardColor,
  cardName,
  KING,
  oppositeColor,
  rankName,
  toRank,
} from "./cards";
import type { Card, Suit } from "./cards";

/** True when `moving` may sit directly on `target` in a tableau column. */
export const canStackOnTableauCard = (moving: Card, target: Card): boolean =>
  target.faceUp &&
  moving.rank === target.rank - 1 &&
  cardColor(moving.suit) !== cardColor(target.suit);

/** A run can move together when every card is face up, alternating colour, and one rank lower than the card above it. */
export const isValidRun = (cards: readonly Card[]): boolean => {
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];

    if (!card?.faceUp) {
      return false;
    }

    const below = cards[index + 1];

    if (below && !canStackOnTableauCard(below, card)) {
      return false;
    }
  }

  return cards.length > 0;
};

/** True when `moving` (the first card of a run) may be placed on a column whose top card is `top`. */
export const canPlaceOnTableau = (
  moving: Card,
  top: Card | undefined
): boolean => (top ? canStackOnTableauCard(moving, top) : moving.rank === KING);

/** Each foundation holds one suit, in this order across the table. */
export const FOUNDATION_SUITS = [
  "spades",
  "hearts",
  "clubs",
  "diamonds",
] as const satisfies readonly Suit[];

/** The foundation a suit belongs on. */
export const foundationIndexFor = (suit: Suit): number =>
  FOUNDATION_SUITS.indexOf(suit);

/** True when `card` is the next card for the foundation at `index`. */
export const canPlaceOnFoundation = (
  card: Card,
  foundation: readonly Card[],
  index: number
): boolean =>
  card.suit === FOUNDATION_SUITS[index] &&
  card.rank === (foundation.at(-1)?.rank ?? 0) + 1;

/** Plain-language reason a card cannot go onto a tableau column. */
export const tableauRefusal = (top: Card | undefined): string => {
  if (!top) {
    return "Only a king can go into an empty column.";
  }

  const needed = toRank(top.rank - 1);

  if (!needed) {
    return `Nothing can go on the ${cardName(top)} in a column.`;
  }

  const color = oppositeColor(cardColor(top.suit));

  return `That card can't go there: it needs a ${color} ${rankName(needed)}.`;
};

/** Plain-language reason a card cannot go onto the foundation at `index`. */
export const foundationRefusal = (
  card: Card,
  foundation: readonly Card[],
  index: number
): string => {
  const suit = FOUNDATION_SUITS[index];
  const top = foundation.at(-1);

  if (suit && card.suit !== suit) {
    return `That card can't go there: this foundation is for ${suit}.`;
  }

  if (!top) {
    return suit
      ? `That card can't go there: this foundation starts with the ${cardName({ rank: ACE, suit })}.`
      : "That card can't go there: a foundation starts with an ace.";
  }

  const needed = toRank(top.rank + 1);

  if (!needed) {
    return `That foundation is complete: it already ends with the ${cardName(top)}.`;
  }

  return `That card can't go there: this foundation needs the ${cardName({ rank: needed, suit: top.suit })}.`;
};

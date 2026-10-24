import {
  ACE,
  cardColor,
  cardName,
  KING,
  oppositeColor,
  rankName,
  toRank,
} from "./cards";
import type { Card } from "./cards";

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

/** True when `card` is the next card for this foundation pile. */
export const canPlaceOnFoundation = (
  card: Card,
  foundation: readonly Card[]
): boolean => {
  const top = foundation.at(-1);

  if (!top) {
    return card.rank === ACE;
  }

  return card.suit === top.suit && card.rank === top.rank + 1;
};

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

/** Plain-language reason a card cannot go onto a foundation. */
export const foundationRefusal = (foundation: readonly Card[]): string => {
  const top = foundation.at(-1);

  if (!top) {
    return "That card can't go there: a foundation starts with an ace.";
  }

  const needed = toRank(top.rank + 1);

  if (!needed) {
    return `That foundation is complete: it already ends with the ${cardName(top)}.`;
  }

  return `That card can't go there: this foundation needs the ${cardName({ rank: needed, suit: top.suit })}.`;
};

export const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const;

export type Suit = (typeof SUITS)[number];

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export type Rank = (typeof RANKS)[number];

export type CardColor = "black" | "red";

export interface Card {
  readonly faceUp: boolean;
  readonly id: string;
  readonly rank: Rank;
  readonly suit: Suit;
}

export interface CardIdentity {
  readonly rank: Rank;
  readonly suit: Suit;
}

export const ACE: Rank = 1;

export const KING: Rank = 13;

const RANK_NAMES = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
] as const;

const RANK_SYMBOLS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export const cardColor = (suit: Suit): CardColor =>
  suit === "diamonds" || suit === "hearts" ? "red" : "black";

export const oppositeColor = (color: CardColor): CardColor =>
  color === "red" ? "black" : "red";

export const rankName = (rank: Rank): string =>
  RANK_NAMES[rank - 1] ?? String(rank);

export const rankSymbol = (rank: Rank): string =>
  RANK_SYMBOLS[rank - 1] ?? String(rank);

export const suitSymbol = (suit: Suit): string => {
  switch (suit) {
    case "clubs": {
      return "♣";
    }

    case "diamonds": {
      return "♦";
    }

    case "hearts": {
      return "♥";
    }

    default: {
      return "♠";
    }
  }
};

/** Plain-language name, for example "7 of hearts" or "queen of spades". */
export const cardName = (card: CardIdentity): string =>
  `${rankName(card.rank)} of ${card.suit}`;

export const cardId = (suit: Suit, rank: Rank): string => `${suit}-${rank}`;

export const makeCard = (suit: Suit, rank: Rank, faceUp: boolean): Card => ({
  faceUp,
  id: cardId(suit, rank),
  rank,
  suit,
});

export const withFace = (card: Card, faceUp: boolean): Card =>
  card.faceUp === faceUp ? card : { ...card, faceUp };

/** The 52 cards in suit then rank order, all face down. */
export const createDeck = (): Card[] => {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(makeCard(suit, rank, false));
    }
  }

  return deck;
};

export const toRank = (value: number): Rank | null =>
  RANKS.find((rank) => rank === value) ?? null;

export const SUITS = ["characters", "dots", "bamboo"] as const;

export type Suit = (typeof SUITS)[number];

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type Rank = (typeof RANKS)[number];

export const WINDS = ["east", "south", "west", "north"] as const;

export type Wind = (typeof WINDS)[number];

export const DRAGONS = ["red", "green", "white"] as const;

export type Dragon = (typeof DRAGONS)[number];

export const FLOWERS = ["plum", "orchid", "chrysanthemum", "bamboo"] as const;

export type Flower = (typeof FLOWERS)[number];

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

export type Season = (typeof SEASONS)[number];

export type Tile =
  | { readonly id: string; readonly kind: "dragon"; readonly dragon: Dragon }
  | { readonly id: string; readonly kind: "flower"; readonly flower: Flower }
  | { readonly id: string; readonly kind: "season"; readonly season: Season }
  | {
      readonly id: string;
      readonly kind: "suit";
      readonly rank: Rank;
      readonly suit: Suit;
    }
  | { readonly id: string; readonly kind: "wind"; readonly wind: Wind };

/** Identical tiles appear four times in a full set; each flower and season appears once. */
export const COPIES_PER_TILE = 4;

export const suitTile = (suit: Suit, rank: Rank): Tile => ({
  id: `${suit}-${rank}`,
  kind: "suit",
  rank,
  suit,
});

export const windTile = (wind: Wind): Tile => ({
  id: `wind-${wind}`,
  kind: "wind",
  wind,
});

export const dragonTile = (dragon: Dragon): Tile => ({
  dragon,
  id: `dragon-${dragon}`,
  kind: "dragon",
});

export const flowerTile = (flower: Flower): Tile => ({
  flower,
  id: `flower-${flower}`,
  kind: "flower",
});

export const seasonTile = (season: Season): Tile => ({
  id: `season-${season}`,
  kind: "season",
  season,
});

const ALL_TILES: readonly Tile[] = [
  ...SUITS.flatMap((suit) => RANKS.map((rank) => suitTile(suit, rank))),
  ...WINDS.map(windTile),
  ...DRAGONS.map(dragonTile),
  ...FLOWERS.map(flowerTile),
  ...SEASONS.map(seasonTile),
];

const TILES_BY_ID = new Map(ALL_TILES.map((tile) => [tile.id, tile]));

/** The tile for a stored id such as "dots-5" or "wind-east", or null for anything else. */
export const tileFromId = (id: string): Tile | null =>
  TILES_BY_ID.get(id) ?? null;

/**
 * Tiles that may be matched share a group: identical tiles, any two flowers,
 * or any two seasons.
 */
export const matchGroup = (tile: Tile): string => {
  if (tile.kind === "flower") {
    return "flowers";
  }

  return tile.kind === "season" ? "seasons" : tile.id;
};

export const tilesMatch = (first: Tile, second: Tile): boolean =>
  matchGroup(first) === matchGroup(second);

const SUIT_NAMES: Readonly<Record<Suit, string>> = {
  bamboo: "Bamboo",
  characters: "Characters",
  dots: "Dots",
};

const capitalize = (word: string): string =>
  `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

/** The tile's own name without its group, for example "Plum" for a flower. */
export const shortName = (tile: Tile): string => {
  switch (tile.kind) {
    case "dragon": {
      return `${capitalize(tile.dragon)} Dragon`;
    }

    case "flower": {
      return capitalize(tile.flower);
    }

    case "season": {
      return capitalize(tile.season);
    }

    case "suit": {
      return `${tile.rank} ${SUIT_NAMES[tile.suit]}`;
    }

    default: {
      return `${capitalize(tile.wind)} Wind`;
    }
  }
};

/** Plain-language name, for example "3 Bamboo", "East Wind", or "Plum flower". */
export const tileName = (tile: Tile): string => {
  if (tile.kind === "flower") {
    return `${shortName(tile)} flower`;
  }

  return tile.kind === "season" ? `${shortName(tile)} season` : shortName(tile);
};

/** Several of one tile: "East Winds" and "Red Dragons"; suit names such as "3 Bamboo" already read as plurals. */
const pluralName = (tile: Tile): string =>
  tile.kind === "wind" || tile.kind === "dragon"
    ? `${tileName(tile)}s`
    : tileName(tile);

/** How a matched pair reads in a sentence: "the two 3 Bamboo", "the two Red Dragons", or "the Plum and Orchid flowers". */
export const pairName = (first: Tile, second: Tile): string => {
  if (first.id === second.id) {
    return `the two ${pluralName(first)}`;
  }

  if (!tilesMatch(first, second)) {
    return `the ${tileName(first)} and the ${tileName(second)}`;
  }

  const group = first.kind === "flower" ? "flowers" : "seasons";

  return `the ${shortName(first)} and ${shortName(second)} ${group}`;
};

export const suitName = (suit: Suit): string => SUIT_NAMES[suit];

export const toRank = (value: number): Rank | null =>
  RANKS.find((rank) => rank === value) ?? null;

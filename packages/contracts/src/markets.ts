/**
 * Markets on Today: a few well-known stock indexes, shares, and commodities.
 * Prices are public, so one cached list serves everyone.
 */

type MarketKind = "commodity" | "stock";

/** What one price is for: index points, one share, or a unit of a commodity. */
type MarketUnit = "barrel" | "index" | "ounce" | "pound" | "share";

interface MarketInstrument {
  readonly id: string;
  readonly kind: MarketKind;
  /** Proper names stay as they are; commodity names are translated by id. */
  readonly name: string;
  /** The exchange symbol people may recognize, shown beside a share's name. */
  readonly ticker: string | null;
  readonly unit: MarketUnit;
  /** Multiplies the provider's number into dollars, e.g. cents to dollars. */
  readonly scale: number;
  /** The provider's symbol. */
  readonly symbol: string;
}

interface MarketQuote {
  readonly id: string;
  /** When the provider last priced it, in milliseconds. */
  readonly marketTime: number;
  readonly previousClose: number;
  readonly price: number;
}

type MarketDirection = "down" | "flat" | "up";

const MARKET_INSTRUMENTS: readonly MarketInstrument[] = [
  {
    id: "sp500",
    kind: "stock",
    name: "S&P 500",
    scale: 1,
    symbol: "^GSPC",
    ticker: null,
    unit: "index",
  },
  {
    id: "dow",
    kind: "stock",
    name: "Dow Jones",
    scale: 1,
    symbol: "^DJI",
    ticker: null,
    unit: "index",
  },
  {
    id: "nasdaq",
    kind: "stock",
    name: "Nasdaq",
    scale: 1,
    symbol: "^IXIC",
    ticker: null,
    unit: "index",
  },
  {
    id: "apple",
    kind: "stock",
    name: "Apple",
    scale: 1,
    symbol: "AAPL",
    ticker: "AAPL",
    unit: "share",
  },
  {
    id: "microsoft",
    kind: "stock",
    name: "Microsoft",
    scale: 1,
    symbol: "MSFT",
    ticker: "MSFT",
    unit: "share",
  },
  {
    id: "gold",
    kind: "commodity",
    name: "Gold",
    scale: 1,
    symbol: "GC=F",
    ticker: null,
    unit: "ounce",
  },
  {
    id: "silver",
    kind: "commodity",
    name: "Silver",
    scale: 1,
    symbol: "SI=F",
    ticker: null,
    unit: "ounce",
  },
  {
    id: "oil",
    kind: "commodity",
    name: "Crude oil",
    scale: 1,
    symbol: "CL=F",
    ticker: null,
    unit: "barrel",
  },
  {
    // Coffee futures are priced in cents per pound.
    id: "coffee",
    kind: "commodity",
    name: "Coffee",
    scale: 0.01,
    symbol: "KC=F",
    ticker: null,
    unit: "pound",
  },
];

const MARKET_SOURCE = {
  homeUrl: "https://finance.yahoo.com/markets/",
  label: "Yahoo Finance",
} as const;

/** Prices older than this are fetched again when someone opens Today. */
const MARKETS_REFRESH_MS = 15 * 60_000;

const instrumentFor = (id: string): MarketInstrument | undefined =>
  MARKET_INSTRUMENTS.find((instrument) => instrument.id === id);

/** Percent change since the previous close, or 0 when there is none to compare. */
const changePercent = (quote: MarketQuote): number =>
  quote.previousClose > 0
    ? ((quote.price - quote.previousClose) / quote.previousClose) * 100
    : 0;

/** "flat" when the change would show as 0.00%. */
const directionOf = (percent: number): MarketDirection => {
  if (Math.abs(percent) < 0.005) {
    return "flat";
  }

  return percent > 0 ? "up" : "down";
};

/** Quotes in the catalog's order, skipping any the catalog no longer lists. */
const inCatalogOrder = (quotes: readonly MarketQuote[]): MarketQuote[] =>
  MARKET_INSTRUMENTS.flatMap((instrument) =>
    quotes.filter((quote) => quote.id === instrument.id)
  );

export {
  changePercent,
  directionOf,
  inCatalogOrder,
  instrumentFor,
  MARKET_INSTRUMENTS,
  MARKET_SOURCE,
  MARKETS_REFRESH_MS,
};

export type {
  MarketDirection,
  MarketInstrument,
  MarketKind,
  MarketQuote,
  MarketUnit,
};

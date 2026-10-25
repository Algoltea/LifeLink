import { describe, expect, it } from "vitest";

import {
  changePercent,
  directionOf,
  inCatalogOrder,
  MARKET_INSTRUMENTS,
} from "./markets";
import type { MarketQuote } from "./markets";

const quote = (overrides: Partial<MarketQuote> = {}): MarketQuote => ({
  id: "gold",
  marketTime: 0,
  previousClose: 100,
  price: 101,
  ...overrides,
});

describe("market changes", () => {
  it("measures the change from the previous close", () => {
    expect(changePercent(quote())).toBeCloseTo(1);
    expect(changePercent(quote({ price: 98.5 }))).toBeCloseTo(-1.5);
    expect(changePercent(quote({ previousClose: 0 }))).toBe(0);
  });

  it("calls a change that rounds to 0.00% flat", () => {
    expect(directionOf(0.004)).toBe("flat");
    expect(directionOf(-0.004)).toBe("flat");
    expect(directionOf(0.006)).toBe("up");
    expect(directionOf(-0.2)).toBe("down");
  });

  it("orders quotes by the catalog and drops retired ones", () => {
    const ordered = inCatalogOrder([
      quote({ id: "oil" }),
      quote({ id: "retired" }),
      quote({ id: "sp500" }),
    ]);

    expect(ordered.map(({ id }) => id)).toStrictEqual(["sp500", "oil"]);
  });

  it("gives every instrument a unique id and symbol", () => {
    const ids = new Set(MARKET_INSTRUMENTS.map(({ id }) => id));
    const symbols = new Set(MARKET_INSTRUMENTS.map(({ symbol }) => symbol));

    expect(ids.size).toBe(MARKET_INSTRUMENTS.length);
    expect(symbols.size).toBe(MARKET_INSTRUMENTS.length);
  });
});

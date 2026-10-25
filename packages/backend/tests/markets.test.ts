import { MARKET_INSTRUMENTS } from "@lifelink/contracts/markets";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../convex/_generated/api";
import { quoteFromChart } from "../convex/lib/markets";
import { newBackend, signUp } from "./harness";

const NOW = Date.parse("2026-10-24T12:00:00Z");
const HOUR = 3_600_000;
const [SP500] = MARKET_INSTRUMENTS;
const COFFEE = MARKET_INSTRUMENTS.find(({ id }) => id === "coffee");

const chart = (price: number, previousClose: number): string =>
  JSON.stringify({
    chart: {
      result: [
        {
          meta: {
            chartPreviousClose: previousClose,
            regularMarketPrice: price,
            regularMarketTime: 1_792_785_600,
          },
        },
      ],
    },
  });

const respond = (body: string, status = 200): Response =>
  new Response(body, { status });

const fetchMock = vi.fn<typeof fetch>();

const useFetch = (handler: (url: string) => Response): void => {
  fetchMock.mockImplementation(async (input) => {
    const { url } = new Request(input);

    return await Promise.resolve(handler(url));
  });
  vi.stubGlobal("fetch", fetchMock);
};

const signedIn = async () => {
  const backend = newBackend();

  const { person } = await signUp(backend, {
    demo: false,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

  return person;
};

const resetFetch = (): void => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
};

describe("reading a price chart", () => {
  it("reads the price, previous close, and time", () => {
    if (SP500 === undefined) {
      throw new Error("Expected the S&P 500 in the catalog.");
    }

    expect(quoteFromChart(SP500, chart(5812.4, 5788.1))).toStrictEqual({
      id: "sp500",
      marketTime: 1_792_785_600_000,
      previousClose: 5788.1,
      price: 5812.4,
    });
  });

  it("turns coffee cents into dollars", () => {
    if (COFFEE === undefined) {
      throw new Error("Expected coffee in the catalog.");
    }

    expect(quoteFromChart(COFFEE, chart(248, 243))).toMatchObject({
      previousClose: 2.43,
      price: 2.48,
    });
  });

  it("rejects an empty or broken answer", () => {
    if (SP500 === undefined) {
      throw new Error("Expected the S&P 500 in the catalog.");
    }

    expect(quoteFromChart(SP500, "not json")).toBeNull();
    expect(
      quoteFromChart(SP500, JSON.stringify({ chart: { result: [] } }))
    ).toBeNull();
    expect(quoteFromChart(SP500, chart(0, 10))).toBeNull();
  });
});

describe("markets on Today", () => {
  afterEach(resetFetch);

  it("starts empty before anyone has loaded prices", async () => {
    const person = await signedIn();

    await expect(person.query(api.markets.quotes, {})).resolves.toStrictEqual({
      fetchedAt: null,
      quotes: [],
    });
  });

  it("stores every price in catalog order and asks with a User-Agent", async () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    useFetch(() => respond(chart(110, 100)));
    const person = await signedIn();

    await expect(person.action(api.markets.refresh, {})).resolves.toStrictEqual(
      { available: true }
    );

    const stored = await person.query(api.markets.quotes, {});

    expect(stored.fetchedAt).toBe(NOW);
    expect(stored.quotes.map(({ id }) => id)).toStrictEqual(
      MARKET_INSTRUMENTS.map(({ id }) => id)
    );

    const [, init] = fetchMock.mock.calls[0] ?? [];

    expect(new Headers(init?.headers).get("User-Agent")).toMatch(/Mozilla/u);
  });

  it("does not ask again within 15 minutes, and keeps old prices for anything that fails", async () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    useFetch(() => respond(chart(110, 100)));
    const person = await signedIn();

    await person.action(api.markets.refresh, {});

    const calls = fetchMock.mock.calls.length;

    await person.action(api.markets.refresh, {});
    expect(fetchMock).toHaveBeenCalledTimes(calls);

    vi.setSystemTime(NOW + HOUR);
    // Only gold answers this time; everything else keeps its last price.
    useFetch((url) =>
      url.includes(encodeURIComponent("GC=F"))
        ? respond(chart(120, 110))
        : respond("down", 503)
    );
    await person.action(api.markets.refresh, {});

    const { quotes } = await person.query(api.markets.quotes, {});

    expect(quotes).toHaveLength(MARKET_INSTRUMENTS.length);
    expect(quotes.find(({ id }) => id === "gold")?.price).toBe(120);
    expect(quotes.find(({ id }) => id === "sp500")?.price).toBe(110);
  });

  it("reports nothing available when every fetch fails and nothing is cached", async () => {
    useFetch(() => respond("down", 503));
    const person = await signedIn();

    await expect(person.action(api.markets.refresh, {})).resolves.toStrictEqual(
      { available: false }
    );
  });
});

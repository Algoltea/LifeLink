/**
 * Yahoo Finance adapter: the latest price and previous close for one
 * instrument. The chart endpoint needs no key but refuses requests without
 * a browser-like User-Agent. Its terms ask for a visible credit, which the
 * Today page shows.
 */
import type {
  MarketInstrument,
  MarketQuote,
} from "@lifelink/contracts/markets";
import { z } from "zod";

import { decodeJson, request } from "../integrations/http";

const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
const TIMEOUT_MS = 10_000;
const USER_AGENT = "Mozilla/5.0 (compatible; LifeLink/1.0)";
const SECOND_MS = 1000;

const chartSchema = z.object({
  chart: z.object({
    result: z
      .array(
        z.object({
          meta: z.object({
            chartPreviousClose: z.number().optional(),
            previousClose: z.number().optional(),
            regularMarketPrice: z.number(),
            regularMarketTime: z.number(),
          }),
        })
      )
      .min(1),
  }),
});

/** One chart response as a quote, or null when it is missing or nonsense. */
const quoteFromChart = (
  instrument: MarketInstrument,
  body: string
): MarketQuote | null => {
  const data = decodeJson(chartSchema, body);
  const meta = data?.chart.result[0]?.meta;

  if (meta === undefined) {
    return null;
  }

  const previous = meta.chartPreviousClose ?? meta.previousClose;

  if (
    previous === undefined ||
    !Number.isFinite(meta.regularMarketPrice) ||
    meta.regularMarketPrice <= 0 ||
    previous <= 0
  ) {
    return null;
  }

  return {
    id: instrument.id,
    marketTime: meta.regularMarketTime * SECOND_MS,
    previousClose: previous * instrument.scale,
    price: meta.regularMarketPrice * instrument.scale,
  };
};

const readQuote = async (
  instrument: MarketInstrument
): Promise<MarketQuote | null> => {
  const url = `${CHART_URL}${encodeURIComponent(instrument.symbol)}?${new URLSearchParams(
    { interval: "1d", range: "1d" }
  ).toString()}`;

  const outcome = await request({
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    method: "GET",
    timeoutMs: TIMEOUT_MS,
    url,
  });

  return outcome.kind === "ok"
    ? quoteFromChart(instrument, outcome.body)
    : null;
};

export { quoteFromChart, readQuote };

"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { MARKETS_REFRESH_MS } from "@lifelink/contracts/markets";
import type {
  MarketInstrument,
  MarketQuote,
} from "@lifelink/contracts/markets";
import { useAction, useQuery } from "convex/react";
import { useCallback, useState } from "react";

import { useRefreshWhenStale } from "@/lib/refresh";

type MarketsState =
  | { status: "hidden" }
  | { status: "loading" }
  | { quotes: MarketQuote[]; status: "ready" };

/**
 * Prices for Today's ticker. Missing or old prices are fetched again; the
 * server decides whether a fetch is due. When nothing could be fetched the
 * ticker hides, like the weather.
 */
const useMarkets = (): MarketsState => {
  const markets = useQuery(api.markets.quotes, {});
  const refreshAction = useAction(api.markets.refresh);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const { available } = await refreshAction({});

      setFailed(!available);
    } catch {
      setFailed(true);
    }
  }, [refreshAction]);

  useRefreshWhenStale({
    enabled: true,
    fetchedAt: markets?.fetchedAt,
    maxAgeMs: MARKETS_REFRESH_MS,
    refresh,
  });

  if (markets === undefined) {
    return { status: "hidden" };
  }

  if (markets.quotes.length === 0) {
    return failed ? { status: "hidden" } : { status: "loading" };
  }

  return { quotes: markets.quotes, status: "ready" };
};

/** Index points as a plain number; everything else in US dollars. */
const formatPrice = (
  price: number,
  instrument: MarketInstrument,
  locale: InterfaceLocale
): string => {
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  };

  if (instrument.unit !== "index") {
    options.currency = "USD";
    options.style = "currency";
  }

  return new Intl.NumberFormat(intlLocaleOf(locale), options).format(price);
};

/** "+0.42%", "-1.24%", or "0.00%" in the person's number style. */
const formatChange = (percent: number, locale: InterfaceLocale): string =>
  new Intl.NumberFormat(intlLocaleOf(locale), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: "exceptZero",
    style: "percent",
  }).format(percent / 100);

/** When the newest price was set, as a short weekday and time. */
const formatMarketTime = (
  quotes: readonly MarketQuote[],
  timeZone: string,
  locale: InterfaceLocale
): string =>
  new Intl.DateTimeFormat(intlLocaleOf(locale), {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    weekday: "short",
  }).format(Math.max(...quotes.map((quote) => quote.marketTime)));

export { formatChange, formatMarketTime, formatPrice, useMarkets };

export type { MarketsState };

"use client";

import { Popover } from "@base-ui/react/popover";
import {
  changePercent,
  directionOf,
  instrumentFor,
  MARKET_SOURCE,
} from "@lifelink/contracts/markets";
import type {
  MarketDirection,
  MarketInstrument,
  MarketKind,
  MarketQuote,
} from "@lifelink/contracts/markets";
import { cn } from "@lifelink/ui/lib/utils";
import { ChevronDownIcon, PauseIcon, PlayIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/messages/en";
import {
  formatChange,
  formatMarketTime,
  formatPrice,
  useMarkets,
} from "@/lib/markets";

/** Seconds each quote spends crossing the tape: roughly 35px a second. */
const SECONDS_PER_QUOTE = 6.5;

/** Painted dabs between quotes, cycling through three shapes and colors. */
const DAB_PATHS = [
  "M2.2 6.8C1.2 5.4 2.6 2.6 5.4 2.1c2.6-.5 4.9.6 4.6 2.3-.3 1.9-2.6 3.4-4.9 3.6-1.3.1-2.3-.3-2.9-1.2z",
  "M1.8 4.6C2.3 2.7 4.8 1.6 7.3 2.2c2.3.6 3.4 2.4 2.5 3.8-1 1.5-3.6 2.2-5.6 1.7C2.6 7.3 1.5 6 1.8 4.6z",
  "M2.4 3.4c1.3-1.6 4.3-1.9 6.2-.8 1.8 1 1.9 2.9.4 4-1.6 1.2-4.4 1.4-6 .5-1.4-.8-1.6-2.4-.6-3.7z",
] as const;

const DIRECTION_MARKS: Record<MarketDirection, string> = {
  down: "▼",
  flat: "–",
  up: "▲",
};

const DIRECTION_COLORS: Record<MarketDirection, string> = {
  down: "text-negative",
  flat: "text-muted-foreground",
  up: "text-positive",
};

interface Row {
  instrument: MarketInstrument;
  quote: MarketQuote;
}

const rowsOf = (quotes: readonly MarketQuote[]): Row[] =>
  quotes.flatMap((quote) => {
    const instrument = instrumentFor(quote.id);

    return instrument ? [{ instrument, quote }] : [];
  });

const Dab = ({ index }: { index: number }) => (
  <svg
    aria-hidden="true"
    className="market-dab shrink-0"
    data-dab={index % DAB_PATHS.length}
    height="10"
    viewBox="0 0 12 10"
    width="12"
  >
    <path d={DAB_PATHS[index % DAB_PATHS.length]} />
  </svg>
);

/** The arrow is for sighted readers; screen readers hear "up", "down", or "unchanged". */
const Change = ({ quote }: { quote: MarketQuote }) => {
  const locale = useLocale();
  const t = useMessages();
  const percent = changePercent(quote);
  const direction = directionOf(percent);

  return (
    <span className={cn("num font-medium", DIRECTION_COLORS[direction])}>
      <span aria-hidden="true">{DIRECTION_MARKS[direction]} </span>
      <span className="sr-only">{t.markets.directions[direction]} </span>
      {formatChange(direction === "flat" ? 0 : percent, locale)}
    </span>
  );
};

const nameOf = (
  instrument: MarketInstrument,
  names: Readonly<Record<string, string | undefined>>
): string => names[instrument.id] ?? instrument.name;

/** "Index", a share's ticker, or what a commodity is priced per. */
const detailOf = (
  instrument: MarketInstrument,
  words: Messages["markets"]
): string | null => {
  if (instrument.unit === "index") {
    return words.index;
  }

  return instrument.unit === "share"
    ? instrument.ticker
    : words.units[instrument.unit];
};

const TapeQuotes = ({ copy, rows }: { copy: number; rows: Row[] }) => {
  const locale = useLocale();
  const t = useMessages();

  return (
    <span className="flex shrink-0 items-center gap-6 pr-6">
      {rows.map(({ instrument, quote }, index) => (
        <span
          className="flex shrink-0 items-center gap-6"
          key={`${copy}-${instrument.id}`}
        >
          <span className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-foreground font-semibold">
              {nameOf(instrument, t.markets.names)}
            </span>
            <span className="num text-foreground">
              {formatPrice(quote.price, instrument, locale)}
            </span>
            <Change quote={quote} />
          </span>
          <Dab index={index} />
        </span>
      ))}
    </span>
  );
};

const PriceList = ({ kind, rows }: { kind: MarketKind; rows: Row[] }) => {
  const locale = useLocale();
  const t = useMessages();
  const shown = rows.filter(({ instrument }) => instrument.kind === kind);
  const headingId = `markets-${kind}`;

  if (shown.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="border-rule flex flex-col border-t px-5 pt-4 pb-2 first:border-t-0"
    >
      <h3
        className="text-muted-foreground text-label mb-1 font-semibold"
        id={headingId}
      >
        {kind === "stock" ? t.markets.stocks : t.markets.commodities}
      </h3>
      <ul className="flex flex-col">
        {shown.map(({ instrument, quote }) => {
          const detail = detailOf(instrument, t.markets);

          return (
            <li
              className="border-rule text-label flex items-center gap-3 border-t py-2.5 first:border-t-0"
              key={instrument.id}
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">
                  {nameOf(instrument, t.markets.names)}
                </span>
                {detail ? (
                  <span className="text-muted-foreground">{detail}</span>
                ) : null}
              </span>
              <span className="num w-24 shrink-0 text-right">
                {formatPrice(quote.price, instrument, locale)}
              </span>
              <span className="w-[5.5rem] shrink-0 text-right">
                <Change quote={quote} />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

/**
 * A slow ticker of stock and commodity prices beside the weather. It stops
 * on hover, focus, or the pause button, never moves with reduced motion, and
 * opens the full list in a popover like the weather's week.
 */
const MarketTicker = ({ timeZone }: { timeZone: string }) => {
  const locale = useLocale();
  const t = useMessages();
  const state = useMarkets();
  const [paused, setPaused] = useState(false);

  if (state.status === "hidden") {
    return null;
  }

  // The tape names itself, so the label is only for screen readers.
  const label = <span className="sr-only">{t.markets.title}</span>;

  // The same dot and spacing as between the date and the weather. On a
  // narrow screen the tape wraps to its own line, where a leading dot would dangle.
  const separator = (
    <span
      aria-hidden="true"
      className="text-muted-foreground mr-1 shrink-0 @max-[40rem]/content:hidden"
    >
      ·
    </span>
  );

  if (state.status === "loading") {
    return (
      <div className="text-label min-h-control flex min-w-0 flex-[1_1_20rem] items-center gap-2">
        {separator}
        {label}
        <span className="market-tape text-muted-foreground flex h-9 min-w-0 flex-1 items-center rounded-full px-5">
          {t.markets.loading}
        </span>
      </div>
    );
  }

  const rows = rowsOf(state.quotes);
  const duration = `${rows.length * SECONDS_PER_QUOTE}s`;

  return (
    <div
      className="market-ticker text-label flex min-w-0 flex-[1_1_20rem] items-center gap-2"
      data-paused={paused ? "" : undefined}
    >
      {separator}
      <Popover.Root>
        <Popover.Trigger className="market-trigger group/markets min-h-control -mx-1 flex min-w-0 flex-1 items-center gap-3 rounded-md px-1">
          {label}
          <span
            aria-hidden="true"
            className="market-tape flex h-9 min-w-0 flex-1 items-center overflow-hidden rounded-full"
          >
            <span
              className="market-track flex w-max items-center pl-5"
              style={{ animationDuration: duration }}
            >
              <TapeQuotes copy={0} rows={rows} />
              {/* A second copy so the loop has no gap; motion off shows only the first. */}
              <span className="market-repeat flex">
                <TapeQuotes copy={1} rows={rows} />
              </span>
            </span>
          </span>
          <span className="sr-only">{t.markets.showAll}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[popup-open]/markets:rotate-180 motion-reduce:transition-none"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner align="end" className="z-50" sideOffset={8}>
            <Popover.Popup className="motion-pop border-border bg-raised text-foreground flex w-[min(25rem,calc(100vw-2rem))] origin-[var(--transform-origin)] flex-col overflow-hidden rounded-xl border shadow-[0_1px_2px_rgb(45_33_24/0.05),0_12px_32px_rgb(45_33_24/0.12)] outline-none">
              <div className="market-wash flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                <div className="flex flex-col gap-0.5">
                  <Popover.Title className="text-section font-semibold">
                    {t.markets.title}
                  </Popover.Title>
                  <Popover.Description className="text-muted-foreground text-label">
                    {t.markets.asOf(
                      formatMarketTime(state.quotes, timeZone, locale)
                    )}
                  </Popover.Description>
                </div>
                <Popover.Close
                  aria-label={t.markets.close}
                  className="hover:bg-neutral-wash size-control -m-2 inline-flex shrink-0 items-center justify-center rounded-md"
                >
                  <XIcon aria-hidden="true" className="size-5" />
                </Popover.Close>
              </div>
              <PriceList kind="stock" rows={rows} />
              <PriceList kind="commodity" rows={rows} />
              <div className="border-rule bg-parchment text-muted-foreground text-label flex flex-col gap-1 border-t px-5 pt-3.5 pb-4">
                <p>{t.markets.delayed}</p>
                <p>
                  {t.markets.dataFrom}
                  <a
                    className="text-foreground underline"
                    href={MARKET_SOURCE.homeUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {MARKET_SOURCE.label}
                  </a>
                </p>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <button
        aria-label={paused ? t.markets.play : t.markets.pause}
        className="market-pause size-control inline-flex shrink-0 items-center justify-center rounded-md"
        onClick={() => setPaused((was) => !was)}
        type="button"
      >
        <span className="text-muted-foreground hover:bg-neutral-wash hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors">
          {paused ? (
            <PlayIcon aria-hidden="true" className="size-4 fill-current" />
          ) : (
            <PauseIcon aria-hidden="true" className="size-4 fill-current" />
          )}
        </span>
      </button>
    </div>
  );
};

export { MarketTicker };

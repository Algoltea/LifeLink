"use client";

import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { cn } from "@lifelink/ui/lib/utils";
import { ChevronUpIcon } from "lucide-react";
import {
  Bodoni_Moda,
  Old_Standard_TT,
  Pinyon_Script,
  UnifrakturMaguntia,
} from "next/font/google";
import type { Ref, RefObject } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

import { useLocale, useMessages } from "@/i18n/locale";
import { money } from "@/lib/format";

import { ledgerSlot, listBlocks } from "./list-text";
import type { GroceryItem } from "./list-text";

import "./receipt.css";

const ledgerFont = Old_Standard_TT({
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ledger",
  weight: ["400", "700"],
});

const displayFont = Bodoni_Moda({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ledger-display",
  weight: ["700", "900"],
});

const handFont = Pinyon_Script({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ledger-hand",
  weight: "400",
});

const blackletterFont = UnifrakturMaguntia({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ledger-blackletter",
  weight: "400",
});

const LEDGER_FONTS = cn(
  ledgerFont.variable,
  displayFont.variable,
  handFont.variable,
  blackletterFont.variable
);

/** How far the receipt may rise into the empty space beside the list picker to meet the checklist. */
const MAX_RISE_PX = 96;

/** Tailwind's `xl`, where the receipt sits beside the checklist. */
const WIDE_SCREEN = "(width >= 80rem)";

const slotsIn = (scope: ParentNode): HTMLElement[] => [
  ...scope.querySelectorAll<HTMLElement>("[data-ledger-slot]"),
];

/** Search shows only some rows, and narrow screens stack the receipt below, so then nothing lines up. */
const rowsMatch = (rows: HTMLElement[], targets: HTMLElement[]): boolean =>
  globalThis.matchMedia(WIDE_SCREEN).matches &&
  rows.length > 0 &&
  rows.length === targets.length &&
  rows.every(
    (row, index) =>
      row.dataset.ledgerSlot === targets[index]?.dataset.ledgerSlot
  );

/**
 * On wide screens the receipt stays pinned until the checklist's first row
 * reaches its own first row; from there both scroll as one, each receipt row
 * level with its checklist row. The spacer below the receipt sets how far the
 * page scrolls before that happens. Each pair of rows takes the taller of the
 * two heights, so a name that wraps on the narrow receipt still lines up.
 */
const alignLedger = (scope: HTMLElement, checklist: HTMLElement | null) => {
  const spacer = scope.querySelector<HTMLElement>("[data-ledger-spacer]");
  const paper = scope.querySelector<HTMLElement>("[data-ledger-paper]");
  const rows = slotsIn(scope);
  const targets = checklist ? slotsIn(checklist) : [];

  for (const element of [...rows, ...targets]) {
    element.style.minHeight = "";
  }

  spacer?.style.removeProperty("height");
  paper?.style.removeProperty("margin-top");

  if (!(spacer && paper && rowsMatch(rows, targets))) {
    return;
  }

  // Read every height before writing any, so the page lays out once.
  const heights = rows.map((row) => row.getBoundingClientRect().height);

  const targetHeights = targets.map(
    (target) => target.getBoundingClientRect().height
  );

  for (const [index, target] of targets.entries()) {
    const height = heights[index] ?? 0;

    if (height > (targetHeights[index] ?? 0)) {
      target.style.minHeight = `${height}px`;
    }
  }

  // Neither the wrapper nor the checklist is sticky, so these offsets hold at any scroll position.
  const origin = scope.getBoundingClientRect().top;

  const tops = targets.map(
    (target) => target.getBoundingClientRect().top - origin
  );

  const lead =
    (rows[0]?.getBoundingClientRect().top ?? 0) -
    paper.getBoundingClientRect().top;

  // A heading taller than the checklist's controls lifts the receipt a little instead.
  const shift = Math.max(-MAX_RISE_PX, (tops[0] ?? 0) - lead);
  let reached = shift + lead;

  spacer.style.height = `${Math.max(0, shift)}px`;
  paper.style.marginTop = `${Math.min(0, shift)}px`;

  for (const [index, row] of rows.entries()) {
    const next = tops[index + 1];

    if (next === undefined) {
      break;
    }

    const height = Math.max(0, next - reached);

    row.style.minHeight = `${height}px`;
    reached += Math.max(height, heights[index] ?? 0);
  }
};

const realign = (
  wrapper: RefObject<HTMLDivElement | null>,
  checklist: RefObject<HTMLElement | null> | undefined
) => {
  if (wrapper.current) {
    alignLedger(wrapper.current, checklist?.current ?? null);
  }
};

/** Re-aligns after every render and whenever the checklist changes size or content. */
const useLedgerAlignment = (checklist?: RefObject<HTMLElement | null>) => {
  const wrapper = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => realign(wrapper, checklist));

  useEffect(() => {
    const source = checklist?.current;
    let frame = 0;

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => realign(wrapper, checklist));
    };

    // The checklist resizes with the window too, so this also covers the breakpoint.
    // The bill head changes height as its fonts arrive, which may be before this runs.
    const resizes = new ResizeObserver(schedule);
    const mutations = new MutationObserver(schedule);

    if (source) {
      resizes.observe(source);
      mutations.observe(source, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    }

    const head = wrapper.current?.querySelector("header");

    if (head) {
      resizes.observe(head);
    }

    document.fonts.addEventListener("loadingdone", schedule);

    return () => {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      mutations.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [checklist]);

  return wrapper;
};

/** A totals row: the label in the item column and the amount in the price column. */
const Line = ({
  label,
  value,
  className,
  total = false,
}: {
  label: string;
  value: string;
  className?: string;
  total?: boolean;
}) => (
  <div className={cn("col-span-3 grid grid-cols-subgrid", className)}>
    <dt className="ledger-rule col-start-2 px-3">{label}</dt>
    <dd
      className={cn(
        "ledger-rule-double px-3 text-right",
        total && "underline decoration-double underline-offset-4"
      )}
    >
      {value}
    </dd>
  </div>
);

const sumOf = (items: Doc<"groceryLists">["items"]): number =>
  items.reduce((total, item) => total + (item.estimatedCents ?? 0), 0);

/**
 * Keep the early summary and detailed receipt based on the same numbers.
 * Ticked items are in the cart, so they still count toward the total: ticking
 * one moves money from "still to get" to "in your cart" without freeing budget.
 */
const estimateFor = (list: Doc<"groceryLists">) => {
  const { items } = list;
  const inCart = items.filter((item) => item.checked);
  const estimate = sumOf(items);
  const inCartCents = sumOf(inCart);
  const budget = list.budgetCents;

  return {
    budget,
    estimate,
    inCart,
    inCartCents,
    items,
    missingEstimates: items.some((item) => item.estimatedCents === null),
    overBudget: budget !== null && estimate > budget,
    toGetCents: estimate - inCartCents,
  };
};

/** The "Bought of" scroll from the bill head, without its words. */
const Ribbon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-16 shrink-0"
    fill="currentColor"
    viewBox="0 0 96 28"
  >
    <path d="M18 10H2l5 7-5 7h16z M78 10h16l-5 7 5 7H78z" />
    <rect
      fill="var(--paper)"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      width="76"
      x="10"
      y="4"
    />
    <path d="M28 12h14 M54 12h14" stroke="currentColor" strokeWidth="1" />
    <path d="M48 7l4 5-4 5-4-5z" />
  </svg>
);

const BillHead = ({ list }: { list: Doc<"groceryLists"> }) => {
  const locale = useLocale();
  const t = useMessages().groceries;
  const blocks = listBlocks(list, t);

  // A sorted list names its aisles, like a grocer's "Teas, coffees and spices".
  const aisles = blocks
    .map((block) => block.heading)
    .filter(
      (heading): heading is string =>
        heading !== null && heading !== t.inYourCart
    );

  const dealsIn =
    aisles.length > 0
      ? new Intl.ListFormat(locale, { type: "conjunction" }).format(aisles)
      : t.itemsToBuy;

  const madeOn = new Date(list._creationTime);

  return (
    <header className="ledger-head col-span-3 flex flex-col gap-1 px-5 pt-3 pb-2">
      <p className="flex flex-wrap items-baseline gap-x-3">
        <span aria-hidden="true" className="ledger-blackletter text-base">
          LifeLink,
        </span>
        <time
          className="ledger-hand border-foreground/40 min-w-[min(100%,8rem)] flex-1 border-b px-2 text-right text-xl leading-[1.3]"
          dateTime={madeOn.toISOString()}
        >
          {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
            madeOn
          )}
        </time>
      </p>
      <p className="ledger-hand border-foreground/40 border-b px-2 text-2xl leading-[1.3] break-words">
        {list.name}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 pt-1">
        <Ribbon />
        <h2
          className="ledger-bodoni text-2xl leading-none font-black tracking-wide break-words uppercase"
          id="receipt-heading"
        >
          {t.estimate}
        </h2>
      </div>
      <p className="text-label text-center leading-snug tracking-[0.15em] break-words uppercase">
        {dealsIn}
      </p>
    </header>
  );
};

const ItemLine = ({ item }: { item: GroceryItem }) => {
  const locale = useLocale();
  const t = useMessages().groceries;

  const unit =
    item.unit === null ? null : (t.units[item.unit]?.short ?? item.unit);

  return (
    <li
      className={cn(
        "ledger-line col-span-3 grid grid-cols-subgrid",
        item.checked && "text-muted-foreground"
      )}
      data-ledger-slot={ledgerSlot("item", item.id)}
    >
      <span className="flex items-center justify-end px-2 py-1">
        {item.quantity}
      </span>
      <span className="ledger-rule flex min-w-0 flex-wrap content-center items-baseline gap-x-2 px-3 py-1">
        <span
          className={cn("min-w-0 break-words", item.checked && "line-through")}
        >
          {item.name}
          {item.checked ? <span className="sr-only">{t.inCartSr}</span> : null}
        </span>
        {item.quantity === null || unit === null ? null : (
          <span className="text-muted-foreground italic">{unit}</span>
        )}
      </span>
      <span className="ledger-rule-double flex items-center justify-end px-3 py-1">
        {item.estimatedCents === null ? (
          <>
            <span aria-hidden="true">--</span>
            <span className="sr-only">{t.noGuess}</span>
          </>
        ) : (
          money(item.estimatedCents, locale)
        )}
      </span>
    </li>
  );
};

const AisleLine = ({ heading }: { heading: string }) => (
  <li
    className="ledger-line col-span-3 grid grid-cols-subgrid"
    data-ledger-slot={ledgerSlot("heading", heading)}
  >
    <h3 className="ledger-bodoni ledger-rule text-label col-start-2 flex items-end px-3 pt-3 pb-1 font-bold tracking-[0.15em] break-words uppercase">
      {heading}
    </h3>
    <span aria-hidden="true" className="ledger-rule-double" />
  </li>
);

/**
 * The estimate against the budget, laid out like a Victorian grocer's bill,
 * in the checklist's order and aisles. On wide screens it is pinned beside
 * the checklist, then unrolls with it row for row while the totals stay at
 * the bottom of the screen until the whole bill is in view.
 */
const Receipt = ({
  checklist,
  list,
  ref,
}: {
  checklist?: RefObject<HTMLElement | null>;
  list: Doc<"groceryLists">;
  ref?: Ref<HTMLElement>;
}) => {
  const locale = useLocale();

  const {
    budget,
    estimate,
    inCart,
    inCartCents,
    items,
    missingEstimates,
    overBudget,
    toGetCents,
  } = estimateFor(list);

  const wrapper = useLedgerAlignment(checklist);
  const t = useMessages().groceries;

  return (
    <div className="min-w-0" ref={wrapper}>
      <section
        aria-labelledby="receipt-heading"
        className={cn(
          LEDGER_FONTS,
          "ledger-paper mb-[0.667rem] grid min-w-0 scroll-mt-20 grid-cols-[minmax(2.5rem,auto)_minmax(0,1fr)_auto] border-x border-t border-(--paper-edge) text-base leading-7 xl:sticky xl:top-8"
        )}
        data-ledger-paper=""
        ref={ref}
        tabIndex={-1}
      >
        <BillHead list={list} />
        {items.length === 0 ? (
          <p className="ledger-banner text-muted-foreground col-span-3 px-6 py-4 text-center italic">
            {t.nothingOnList}
          </p>
        ) : (
          <ul
            aria-label={t.itemsToBuy}
            className="ledger-banner col-span-3 grid grid-cols-subgrid"
          >
            {listBlocks(list, t).flatMap((block) => [
              ...(block.heading === null
                ? []
                : [<AisleLine heading={block.heading} key={block.heading} />]),
              ...block.items.map((item) => (
                <ItemLine item={item} key={item.id} />
              )),
            ])}
          </ul>
        )}
        {/* Pinned to the bottom of wide screens while rows unroll above it. */}
        <footer className="ledger-fill ledger-banner relative col-span-3 grid grid-cols-subgrid py-2 xl:sticky xl:bottom-[0.667rem] xl:shadow-[0_-8px_12px_-8px_rgb(60_40_10/0.3)]">
          <dl className="col-span-3 grid grid-cols-subgrid">
            <Line label={t.items} value={`${items.length}`} />
            {inCart.length > 0 ? (
              <>
                <Line label={t.inYourCart} value={money(inCartCents, locale)} />
                <Line label={t.stillToGet} value={money(toGetCents, locale)} />
              </>
            ) : null}
            <Line
              className="ledger-bodoni py-1 text-xl font-bold"
              label={t.estimatedTotal}
              total
              value={money(estimate, locale)}
            />
            <Line
              label={t.budget}
              value={budget === null ? t.notSet : money(budget, locale)}
            />
            {budget === null ? null : (
              <Line
                className={cn(
                  "font-bold",
                  overBudget ? "text-negative" : "text-positive"
                )}
                label={overBudget ? t.overBudget : t.leftToSpend}
                value={money(Math.abs(budget - estimate), locale)}
              />
            )}
          </dl>
          {missingEstimates ? (
            <p className="text-muted-foreground col-span-3 px-6 pt-2 text-center italic">
              {t.missingEstimates}
            </p>
          ) : null}
          {/* The page shows through between the teeth, hiding rows still rolled up behind. */}
          <div
            aria-hidden="true"
            className="bg-background absolute -inset-x-px top-full"
          >
            <div className="ledger-teeth" />
          </div>
        </footer>
      </section>
      <div aria-hidden="true" data-ledger-spacer="" />
    </div>
  );
};

/**
 * A compact total that stays at the bottom of narrow screens, where the
 * receipt sits far below the editor. It is the only budget summary there, so
 * the top of the list stays clear. Tapping it jumps to the receipt.
 */
const ReceiptBar = ({
  list,
  onShow,
}: {
  list: Doc<"groceryLists">;
  onShow: () => void;
}) => {
  const locale = useLocale();
  const { budget, estimate, items, overBudget } = estimateFor(list);
  const t = useMessages().groceries.receiptBar;

  if (items.length === 0) {
    return null;
  }

  // Money only: the item count is in the list header, and a short bar covers less of the list.
  const total = `${money(estimate, locale)} ${budget === null ? t.estimated : t.total}`;

  return (
    <button
      className={cn(
        LEDGER_FONTS,
        "ledger-paper min-h-control @container sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex w-full items-center justify-between gap-3 rounded-lg border border-(--paper-edge) px-5 py-2 text-left text-lg tabular-nums shadow-[0_-4px_16px_rgb(0_0_0/0.12)] transition-[filter] hover:brightness-95 xl:hidden dark:shadow-[0_-4px_20px_rgb(0_0_0/0.5)]"
      )}
      onClick={onShow}
      type="button"
    >
      <span className="min-w-0">
        {total}
        {budget !== null && !overBudget
          ? t.left(money(budget - estimate, locale))
          : null}
        {budget !== null && overBudget ? (
          <span className="text-negative font-semibold">
            {t.over(money(estimate - budget, locale))}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-base font-medium">
        {/* rem-based, so the words drop out only when large text leaves no room. */}
        <span className="underline underline-offset-4 @max-[14rem]:sr-only">
          {t.see}
        </span>
        <ChevronUpIcon aria-hidden="true" className="size-5" />
      </span>
    </button>
  );
};

export { Receipt, ReceiptBar };

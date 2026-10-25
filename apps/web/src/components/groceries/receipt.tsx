"use client";

import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { cn } from "@lifelink/ui/lib/utils";
import { ChevronUpIcon } from "lucide-react";
import { EB_Garamond, La_Belle_Aurore } from "next/font/google";
import type { Ref, RefObject } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

import { PaintDab } from "@/components/app/paint-dab";
import { useLocale, useMessages } from "@/i18n/locale";
import { money } from "@/lib/format";

import { ledgerSlot, listBlocks, quantityWords } from "./list-text";
import type { GroceryItem } from "./list-text";

import "./receipt.css";

const ledgerFont = EB_Garamond({
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ledger",
  weight: ["400", "600"],
});

const handFont = La_Belle_Aurore({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ledger-hand",
  weight: "400",
});

const LEDGER_FONTS = cn(ledgerFont.variable, handFont.variable);

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
    <dt className="ledger-rule col-start-2 px-3 break-words">{label}</dt>
    <dd
      className={cn(
        "ledger-rule-double px-3 text-right",
        total && "flex justify-end"
      )}
    >
      {total ? (
        <span className="ledger-sun ledger-total -mx-1.5 px-1.5">{value}</span>
      ) : (
        value
      )}
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
    <header className="ledger-wash col-span-3 flex flex-col gap-1 px-5 pt-4 pb-3">
      <p className="flex flex-wrap items-baseline gap-x-3">
        <span
          aria-hidden="true"
          className="ledger-caps text-muted-foreground text-label"
        >
          LifeLink
        </span>
        <time
          className="ledger-hand ledger-fill-in min-w-[min(100%,8rem)] flex-1 px-2 text-right text-xl leading-[1.4]"
          dateTime={madeOn.toISOString()}
        >
          {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
            madeOn
          )}
        </time>
      </p>
      <p className="ledger-hand ledger-fill-in px-2 text-2xl leading-[1.4] break-words">
        {list.name}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 pt-2">
        <PaintDab className="size-4" index={0} />
        <h2
          className="ledger-caps text-2xl leading-tight break-words"
          id="receipt-heading"
        >
          {t.estimate}
        </h2>
        <PaintDab className="size-4" index={2} />
      </div>
      <p className="text-muted-foreground text-center leading-snug break-words italic">
        {dealsIn}
      </p>
    </header>
  );
};

const ItemLine = ({ item }: { item: GroceryItem }) => {
  const locale = useLocale();
  const t = useMessages().groceries;

  return (
    <li
      className={cn(
        "ledger-line col-span-3 grid grid-cols-subgrid",
        item.checked && "text-muted-foreground"
      )}
      data-ledger-slot={ledgerSlot("item", item.id)}
    >
      {/* The amount with its unit, like "5 lb" in a grocer's quantity column. */}
      <span className="text-muted-foreground flex max-w-[5.5rem] min-w-[2.5rem] items-center justify-end px-2 py-1.5 text-right break-words italic">
        {quantityWords(item, locale)}
      </span>
      <span
        className={cn(
          "ledger-rule flex min-w-0 items-center px-3 py-1.5 break-words",
          item.checked && "ledger-strike"
        )}
      >
        <span className="min-w-0">
          {item.name}
          {item.checked ? <span className="sr-only">{t.inCartSr}</span> : null}
        </span>
      </span>
      <span className="ledger-rule-double flex items-center justify-end px-3 py-1.5">
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

const AisleLine = ({ heading, index }: { heading: string; index: number }) => (
  <li
    className="ledger-line col-span-3 grid grid-cols-subgrid"
    data-ledger-slot={ledgerSlot("heading", heading)}
  >
    <h3 className="ledger-caps ledger-rule text-muted-foreground text-label col-start-2 flex items-end gap-2 px-3 pt-3 pb-1 break-words">
      <PaintDab className="mb-1.5" index={index} />
      <span className="min-w-0">{heading}</span>
    </h3>
    <span aria-hidden="true" className="ledger-rule-double" />
  </li>
);

/**
 * The estimate against the budget, laid out like a grocer's bill washed over
 * like Today's market ticker,
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
          "ledger-paper mb-[0.556rem] grid min-w-0 scroll-mt-20 grid-cols-[auto_minmax(min(6rem,45%),1fr)_auto] border-x border-t border-(--paper-edge) text-[1.056rem] leading-7 shadow-[0_1px_2px_rgb(45_33_24/0.06),0_10px_24px_-14px_rgb(45_33_24/0.22)] xl:sticky xl:top-8"
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
            {listBlocks(list, t).flatMap((block, index) => [
              ...(block.heading === null
                ? []
                : [
                    <AisleLine
                      heading={block.heading}
                      index={index}
                      key={block.heading}
                    />,
                  ]),
              ...block.items.map((item) => (
                <ItemLine item={item} key={item.id} />
              )),
            ])}
          </ul>
        )}
        {/* Pinned to the bottom of wide screens while rows unroll above it. */}
        <footer className="ledger-wash-light ledger-banner relative col-span-3 grid grid-cols-subgrid py-2 xl:sticky xl:bottom-[2.056rem] xl:shadow-[0_-8px_12px_-8px_rgb(45_33_24/0.22)]">
          <dl className="col-span-3 grid grid-cols-subgrid">
            <Line label={t.items} value={`${items.length}`} />
            {inCart.length > 0 ? (
              <>
                <Line label={t.inYourCart} value={money(inCartCents, locale)} />
                <Line label={t.stillToGet} value={money(toGetCents, locale)} />
              </>
            ) : null}
            <Line
              className="py-1.5 text-xl font-semibold"
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
                  "font-semibold",
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
          {/*
           * The page shows through the torn edge, hiding rows still rolled up
           * behind. On wide screens it runs on below them, so the pinned edge
           * has a little clear page under it.
           */}
          <div
            aria-hidden="true"
            className="bg-background absolute -inset-x-px top-full xl:pb-6"
          >
            <div className="ledger-deckle" />
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
        "ledger-paper ledger-wash-light min-h-control @container sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex w-full items-center justify-between gap-3 rounded-lg border border-(--paper-edge) px-5 py-2 text-left text-lg tabular-nums shadow-[0_-4px_16px_rgb(0_0_0/0.12)] transition-[filter] hover:brightness-95 xl:hidden dark:shadow-[0_-4px_20px_rgb(0_0_0/0.5)]"
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

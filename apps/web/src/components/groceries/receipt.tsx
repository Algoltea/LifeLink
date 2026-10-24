"use client";

import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { cn } from "@lifelink/ui/lib/utils";
import { ChevronUpIcon } from "lucide-react";
import type { Ref } from "react";
import { useCallback, useState } from "react";

import { money } from "@/lib/format";

import { quantityWords, shoppingOrder } from "./list-text";

const Rule = () => (
  <hr aria-hidden="true" className="border-control border-t border-dashed" />
);

const Line = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1",
      className
    )}
  >
    <dt>{label}</dt>
    <dd className="ml-auto shrink-0 text-right">{value}</dd>
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

/**
 * Whether the item list is taller than the space the sticky receipt gives it.
 * Only then does it need a tab stop so keyboard users can scroll it.
 */
const useScrollable = () => {
  const [scrollable, setScrollable] = useState(false);

  const itemList = useCallback((element: HTMLUListElement | null) => {
    if (!element) {
      setScrollable(false);

      return;
    }

    const measure = () =>
      setScrollable(element.scrollHeight > element.clientHeight);

    // Resizing covers the window; mutations cover items being added or renamed.
    const resizes = new ResizeObserver(measure);
    const mutations = new MutationObserver(measure);
    resizes.observe(element);
    mutations.observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    measure();

    return () => {
      resizes.disconnect();
      mutations.disconnect();
    };
  }, []);

  return { itemList, scrollable };
};

/**
 * The estimate against the budget, laid out like a shop receipt. On wide
 * screens it follows the editor down the page; a long item list scrolls inside
 * it so the totals always stay in view.
 */
const Receipt = ({
  list,
  ref,
}: {
  list: Doc<"groceryLists">;
  ref?: Ref<HTMLElement>;
}) => {
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

  const { itemList, scrollable } = useScrollable();

  return (
    <section
      aria-labelledby="receipt-heading"
      className="bg-raised text-foreground border-control @container flex min-w-0 scroll-mt-20 flex-col gap-4 rounded-none border px-6 py-8 font-mono text-base leading-7 shadow-[0_8px_16px_rgb(0_0_0/0.12)] xl:max-h-[calc(100svh-4rem)] dark:shadow-[0_8px_20px_rgb(0_0_0/0.5)]"
      ref={ref}
      tabIndex={-1}
    >
      <header className="flex flex-col items-center gap-1 text-center">
        <h2
          className="text-xl font-semibold tracking-widest uppercase"
          id="receipt-heading"
        >
          Estimate
        </h2>
        <p className="text-muted-foreground break-words">{list.name}</p>
      </header>
      <Rule />
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center">
          Nothing on this list yet.
        </p>
      ) : (
        <ul
          aria-label="Items to buy"
          className="flex flex-col gap-2 xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain"
          ref={itemList}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users must be able to scroll a long list inside the sticky receipt.
          tabIndex={scrollable ? 0 : undefined}
        >
          {shoppingOrder(items).map((item) => (
            <li
              className={cn(
                "flex flex-col gap-1 @min-[16em]:flex-row @min-[16em]:items-baseline @min-[16em]:justify-between @min-[16em]:gap-4",
                item.checked && "text-muted-foreground line-through"
              )}
              key={item.id}
            >
              <span className="min-w-0 break-words">
                {item.name}
                {item.checked ? (
                  <span className="sr-only"> (in cart)</span>
                ) : null}
                {item.quantity === null ? null : (
                  <span className="text-muted-foreground">
                    {" "}
                    {quantityWords(item)}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right">
                {item.estimatedCents === null ? (
                  <>
                    <span aria-hidden="true">--</span>
                    <span className="sr-only">no guess</span>
                  </>
                ) : (
                  money(item.estimatedCents)
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {scrollable ? (
        <p className="text-muted-foreground text-center">
          Scroll the list to see every item.
        </p>
      ) : null}
      <Rule />
      <dl className="flex flex-col gap-2">
        <Line label="Items" value={`${items.length}`} />
        {inCart.length > 0 ? (
          <>
            <Line label="In your cart" value={money(inCartCents)} />
            <Line label="Still to get" value={money(toGetCents)} />
          </>
        ) : null}
        <Line
          className="text-lg font-semibold"
          label="Estimated total"
          value={money(estimate)}
        />
        <Line
          label="Budget"
          value={budget === null ? "Not set" : money(budget)}
        />
        {budget === null ? null : (
          <Line
            className={cn(
              "font-semibold",
              overBudget ? "text-negative" : "text-positive"
            )}
            label={overBudget ? "Over budget" : "Left to spend"}
            value={money(Math.abs(budget - estimate))}
          />
        )}
      </dl>
      {missingEstimates ? (
        <>
          <Rule />
          <p className="text-muted-foreground text-center">
            Some items have no price guess, so the real total may be higher.
          </p>
        </>
      ) : null}
    </section>
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
  const { budget, estimate, items, overBudget } = estimateFor(list);

  if (items.length === 0) {
    return null;
  }

  // Money only: the item count is in the list header, and a short bar covers less of the list.
  const total = `${money(estimate)} ${budget === null ? "estimated" : "total"}`;

  return (
    <button
      className="bg-raised border-control hover:bg-parchment min-h-control @container sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex w-full items-center justify-between gap-3 rounded-lg border px-5 py-2 text-left text-lg tabular-nums shadow-[0_-4px_16px_rgb(0_0_0/0.12)] transition-colors xl:hidden dark:shadow-[0_-4px_20px_rgb(0_0_0/0.5)]"
      onClick={onShow}
      type="button"
    >
      <span className="min-w-0">
        {total}
        {budget !== null && !overBudget
          ? ` · ${money(budget - estimate)} left`
          : null}
        {budget !== null && overBudget ? (
          <span className="text-negative font-semibold">
            {" "}
            · {money(estimate - budget)} over
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-base font-medium">
        {/* rem-based, so the words drop out only when large text leaves no room. */}
        <span className="underline underline-offset-4 @max-[14rem]:sr-only">
          See estimate
        </span>
        <ChevronUpIcon aria-hidden="true" className="size-5" />
      </span>
    </button>
  );
};

export { Receipt, ReceiptBar };

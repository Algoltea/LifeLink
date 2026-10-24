"use client";

import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { cn } from "@lifelink/ui/lib/utils";
import type { Ref } from "react";
import { useCallback, useState } from "react";

import { money } from "@/lib/format";

import { quantityWords } from "./list-editor";

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

/** Keep the early summary and detailed receipt based on the same unchecked items. */
const estimateFor = (list: Doc<"groceryLists">) => {
  const open = list.items.filter((item) => !item.checked);
  const guessed = open.filter((item) => item.estimatedCents !== null);

  const estimate = guessed.reduce(
    (total, item) => total + (item.estimatedCents ?? 0),
    0
  );

  const budget = list.budgetCents;

  return {
    budget,
    estimate,
    guessed,
    open,
    overBudget: budget !== null && estimate > budget,
  };
};

const BudgetSummary = ({ list }: { list: Doc<"groceryLists"> }) => {
  const { open, guessed, estimate, budget, overBudget } = estimateFor(list);

  return (
    <section aria-label="Budget summary" className="flex flex-col gap-2">
      <dl className="flex flex-col gap-1 text-lg tabular-nums">
        <Line
          label="Estimated total"
          value={money(estimate)}
          className="font-semibold"
        />
        <Line
          label="Budget"
          value={budget === null ? "Not set" : money(budget)}
        />
        {budget === null ? null : (
          <Line
            label={overBudget ? "Over budget" : "Left to spend"}
            value={money(Math.abs(budget - estimate))}
            className={overBudget ? "text-negative font-semibold" : undefined}
          />
        )}
      </dl>
      {guessed.length < open.length ? (
        <p className="text-muted-foreground text-base">
          Some items have no estimate, so the real total may be higher.
        </p>
      ) : null}
    </section>
  );
};

/**
 * Whether the item list is taller than the space the sticky receipt gives it.
 * Only then does it need a tab stop so keyboard users can scroll it.
 */
const useScrollable = () => {
  const [scrollable, setScrollable] = useState(false);

  const items = useCallback((element: HTMLUListElement | null) => {
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

  return { items, scrollable };
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
  const { open, guessed, estimate, budget, overBudget } = estimateFor(list);
  const { items, scrollable } = useScrollable();

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
      {open.length === 0 ? (
        <p className="text-muted-foreground text-center">
          Nothing left to buy.
        </p>
      ) : (
        <ul
          aria-label="Items to buy"
          className="flex flex-col gap-2 xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain"
          ref={items}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users must be able to scroll a long list inside the sticky receipt.
          tabIndex={scrollable ? 0 : undefined}
        >
          {open.map((item) => (
            <li
              className="flex flex-col gap-1 @min-[16em]:flex-row @min-[16em]:items-baseline @min-[16em]:justify-between @min-[16em]:gap-4"
              key={item.id}
            >
              <span className="min-w-0 break-words">
                {item.name}
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
        <Line label="Items" value={`${open.length}`} />
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
      {guessed.length < open.length ? (
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
 * receipt sits far below the editor. Tapping it jumps to the receipt.
 */
const ReceiptBar = ({
  list,
  onShow,
}: {
  list: Doc<"groceryLists">;
  onShow: () => void;
}) => {
  const { open, estimate, budget, overBudget } = estimateFor(list);

  if (open.length === 0) {
    return null;
  }

  return (
    <button
      className="bg-raised border-control hover:bg-parchment min-h-control sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border px-5 py-3 text-left text-lg tabular-nums shadow-[0_-4px_16px_rgb(0_0_0/0.12)] transition-colors xl:hidden dark:shadow-[0_-4px_20px_rgb(0_0_0/0.5)]"
      onClick={onShow}
      type="button"
    >
      <span className="min-w-0">
        {open.length} {open.length === 1 ? "item" : "items"} · {money(estimate)}
        {budget === null ? null : ` of ${money(budget)} budget`}
        {overBudget ? (
          <span className="text-negative font-semibold"> · Over budget</span>
        ) : null}
      </span>
      <span className="font-medium underline underline-offset-4">
        See estimate
      </span>
    </button>
  );
};

export { BudgetSummary, Receipt, ReceiptBar };

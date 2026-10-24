import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { cn } from "@lifelink/ui/lib/utils";

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
  <div className={cn("flex items-baseline justify-between gap-4", className)}>
    <dt>{label}</dt>
    <dd className="shrink-0 text-right">{value}</dd>
  </div>
);

/** The estimate against the budget, laid out like a shop receipt. */
const Receipt = ({ list }: { list: Doc<"groceryLists"> }) => {
  const open = list.items.filter((item) => !item.checked);
  const guessed = open.filter((item) => item.estimatedCents !== null);

  const estimate = guessed.reduce(
    (total, item) => total + (item.estimatedCents ?? 0),
    0
  );

  const budget = list.budgetCents;
  const overBudget = budget !== null && estimate > budget;

  return (
    <section
      aria-labelledby="receipt-heading"
      className="bg-raised text-foreground border-control flex min-w-0 flex-col gap-4 rounded-none border px-6 py-8 font-mono text-base leading-7 shadow-[0_8px_16px_rgb(0_0_0/0.12)] dark:shadow-[0_8px_20px_rgb(0_0_0/0.5)]"
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
        <ul aria-label="Items to buy" className="flex flex-col gap-2">
          {open.map((item) => (
            <li
              className="flex items-baseline justify-between gap-4"
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

export { Receipt };

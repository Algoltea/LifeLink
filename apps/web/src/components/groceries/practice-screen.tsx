"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { buttonVariants } from "@lifelink/ui/components/button";
import { useQuery } from "convex/react";
import Link from "next/link";

import { SimulatedPill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";

import { quantityWords } from "./list-editor";

/**
 * What practice mode opens instead of Instacart. It is plainly a practice page:
 * no store, no prices, no checkout, and nothing leaves LifeLink.
 */
const PracticeScreen = ({ listId }: { listId: string | null }) => {
  const data = useQuery(api.groceries.lists);

  const list =
    data?.lists.find((candidate) => candidate._id === listId) ?? null;

  return (
    <>
      <PageHeader
        subline="In practice mode LifeLink opens this page instead of Instacart. Nothing was sent to a store and nothing was bought."
        title={
          <span className="flex flex-wrap items-center gap-3">
            Practice shopping <SimulatedPill />
          </span>
        }
      />
      {data === undefined ? (
        <LoadingRows label="Loading the list" rows={3} />
      ) : null}
      {data !== undefined && list === null ? (
        <EmptyNote>This list isn’t available any more.</EmptyNote>
      ) : null}
      {list === null ? null : (
        <section
          aria-labelledby="practice-list"
          className="border-border bg-surface flex max-w-prose flex-col gap-4 rounded-xl border p-5 sm:p-6"
        >
          <h2 className="text-2xl leading-8 font-semibold" id="practice-list">
            {list.name}
          </h2>
          <p className="text-lg">
            On the real Instacart page you would now choose a store, see each
            item’s price, swap items, and pay there.
          </p>
          {list.items.every((item) => item.checked) ? (
            <p className="text-muted-foreground text-lg leading-7">
              There are no items left to buy. Return to your list to add or
              untick an item.
            </p>
          ) : null}
          <ul>
            {list.items
              .filter((item) => !item.checked)
              .map((item) => (
                <li
                  className="border-rule flex justify-between gap-3 border-t py-3 text-lg"
                  key={item.id}
                >
                  <span className="min-w-0 break-words">{item.name}</span>
                  <span className="text-muted-foreground num shrink-0 text-right">
                    {quantityWords(item)}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
      <Link
        className={buttonVariants({
          className: "self-start",
          variant: "outline",
        })}
        href="/groceries"
      >
        Back to groceries
      </Link>
    </>
  );
};

export { PracticeScreen };

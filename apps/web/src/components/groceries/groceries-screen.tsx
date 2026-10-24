"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { CopyIcon, PlusIcon, PrinterIcon, SquareIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

import { ListEditor, listAsText, quantityWords } from "./list-editor";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

/** Printing shows only the list itself, in large type, without the app around it. */
const PRINT_STYLES = `@media print {
  body * { visibility: hidden !important; }
  #grocery-print, #grocery-print * { visibility: visible !important; }
  #grocery-print { position: absolute; inset: 0; display: block !important; padding: 2rem; font-size: 20pt; }
}`;

const PrintableList = ({ list }: { list: Doc<"groceryLists"> }) => (
  <div aria-hidden="true" className="hidden" id="grocery-print">
    <h2 className="pb-4 text-3xl">{list.name}</h2>
    <ul className="flex flex-col gap-3">
      {list.items
        .filter((item) => !item.checked)
        .map((item) => (
          <li key={item.id}>
            <SquareIcon aria-hidden="true" className="mr-3 inline size-5" />
            {item.name} {quantityWords(item)}
          </li>
        ))}
    </ul>
    {list.preferences.length > 0 ? (
      <p className="pt-6">Notes: {list.preferences.join("; ")}</p>
    ) : null}
  </div>
);

const ListTools = ({ list }: { list: Doc<"groceryLists"> }) => {
  const hasOpenItems = list.items.some((item) => !item.checked);

  return (
    <section
      aria-labelledby="list-tools-heading"
      className="bg-surface flex min-w-0 flex-col gap-4 rounded-xl p-5 sm:p-6"
    >
      <h2 className="text-2xl leading-8 font-semibold" id="list-tools-heading">
        Take your list with you
      </h2>
      <p className="text-lg leading-7">
        Print your list or copy it to paste into a message.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          className="max-w-full py-3 whitespace-normal"
          disabled={!hasOpenItems}
          onClick={() => globalThis.print()}
          variant="outline"
        >
          <PrinterIcon />
          Print the list
        </Button>
        <Button
          className="max-w-full py-3 whitespace-normal"
          disabled={!hasOpenItems}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(listAsText(list));
              toast.success("List copied. You can paste it into a message.");
            } catch {
              toast.error(
                "Copying didn't work in this browser. Try printing instead."
              );
            }
          }}
          variant="outline"
        >
          <CopyIcon />
          Copy the list
        </Button>
      </div>
      {hasOpenItems ? null : (
        <p className="text-muted-foreground text-lg leading-7">
          Add an item or untick one before printing or copying.
        </p>
      )}
    </section>
  );
};

const GroceryWorkspace = ({ list }: { list: Doc<"groceryLists"> }) => (
  <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <section aria-label="List" className="min-w-0">
      <ListEditor key={list._id} list={list} />
    </section>
    <ListTools list={list} />
    <PrintableList list={list} />
  </div>
);

const GroceriesScreen = () => {
  const data = useQuery(api.groceries.lists);
  const createList = useMutation(api.groceries.createList);
  const [chosen, setChosen] = useState<Id<"groceryLists"> | null>(null);

  const list =
    data?.lists.find((candidate) => candidate._id === chosen) ??
    data?.lists[0] ??
    null;

  const newList = async (): Promise<void> => {
    try {
      setChosen(
        await createList({
          name: data?.lists.length
            ? `List ${data.lists.length + 1}`
            : "Groceries",
        })
      );
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <PageHeader
        actions={
          <Button onClick={newList} variant="outline">
            <PlusIcon />
            New list
          </Button>
        }
        subline="Keep a grocery list, plan your budget, and copy or print what you need."
        title="Groceries"
      />
      <section
        aria-label="Grocery lists and budgets"
        className="flex scroll-mt-24 flex-col gap-6"
        id="budget"
      >
        {data === undefined ? (
          <LoadingRows label="Loading your lists" rows={4} />
        ) : null}
        {data !== undefined && list === null ? (
          <EmptyNote
            action={
              <Button onClick={newList}>
                <PlusIcon />
                Start a list
              </Button>
            }
          >
            No grocery lists yet.
          </EmptyNote>
        ) : null}
        {data !== undefined && data.lists.length > 1 ? (
          <nav aria-label="Your lists" className="flex flex-wrap gap-2">
            {data.lists.map((candidate) => (
              <Button
                aria-current={candidate._id === list?._id ? "true" : undefined}
                key={candidate._id}
                onClick={() => setChosen(candidate._id)}
                variant={candidate._id === list?._id ? "secondary" : "outline"}
              >
                {candidate.name}
              </Button>
            ))}
          </nav>
        ) : null}
        {list === null ? null : <GroceryWorkspace list={list} />}
      </section>
    </>
  );
};

export { GroceriesScreen };

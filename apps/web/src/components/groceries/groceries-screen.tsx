"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Dialog } from "@lifelink/ui/components/dialog";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  CopyIcon,
  PlusIcon,
  PrinterIcon,
  SquareIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

import { ListEditor, listAsText, quantityWords } from "./list-editor";
import { BudgetSummary, Receipt, ReceiptBar } from "./receipt";

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
      aria-label="Take your list with you"
      className="flex min-w-0 flex-col gap-3"
    >
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

const GroceryWorkspace = ({
  list,
  onDelete,
}: {
  list: Doc<"groceryLists">;
  onDelete: () => void;
}) => {
  const receipt = useRef<HTMLElement>(null);

  const showReceipt = (): void => {
    const target = receipt.current;

    if (!target) {
      return;
    }

    const reducedMotion =
      document.documentElement.dataset.motion === "reduced" ||
      globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    target.focus({ preventScroll: true });
  };

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section aria-label="List" className="min-w-0">
        <ListEditor
          key={list._id}
          list={list}
          onDelete={onDelete}
          summary={
            <>
              {/* On wide screens the sticky receipt already shows these totals. */}
              <div className="xl:hidden">
                <BudgetSummary list={list} />
              </div>
              <ListTools list={list} />
            </>
          }
        />
      </section>
      <ReceiptBar list={list} onShow={showReceipt} />
      <div className="flex min-w-0 flex-col gap-8 xl:sticky xl:top-8">
        <Receipt list={list} ref={receipt} />
      </div>
      <PrintableList list={list} />
    </div>
  );
};

const GroceriesScreen = () => {
  const data = useQuery(api.groceries.lists);
  const createList = useMutation(api.groceries.createList);
  const deleteList = useMutation(api.groceries.deleteList);
  const newListButton = useRef<HTMLButtonElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Doc<"groceryLists"> | null>(
    null
  );

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Id<"groceryLists"> | null>(null);

  const list =
    data?.lists.find((candidate) => candidate._id === chosen) ??
    data?.lists[0] ??
    null;

  const requestDelete = (target: Doc<"groceryLists">): void => {
    setDeleteError(null);
    setDeleteTarget(target);
  };

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
          <Button onClick={newList} ref={newListButton} variant="outline">
            <PlusIcon />
            New list
          </Button>
        }
        subline="Keep a grocery list, plan your budget, and copy or print what you need."
        title="Groceries"
      />
      <Dialog
        finalFocus={newListButton}
        description={`This permanently deletes “${deleteTarget?.name ?? ""}” and all its items, budget, and preferences. This cannot be undone.`}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
        title="Delete this grocery list?"
      >
        {deleteError ? (
          <p className="text-negative text-base" role="alert">
            {deleteError}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
            variant="outline"
          >
            Keep list
          </Button>
          <Button
            aria-busy={deleting}
            disabled={deleting}
            onClick={async () => {
              if (deleteTarget === null || deleting) {
                return;
              }

              setDeleting(true);
              setDeleteError(null);

              try {
                await deleteList({ listId: deleteTarget._id });
                setChosen((current) =>
                  current === deleteTarget._id ? null : current
                );
                setDeleteTarget(null);
                toast.success(`“${deleteTarget.name}” deleted.`);
              } catch (error) {
                setDeleteError(errorText(error));
              }

              setDeleting(false);
            }}
            variant="destructive"
          >
            <Trash2Icon />
            {deleting ? "Deleting…" : "Delete list"}
          </Button>
        </div>
      </Dialog>
      <section
        aria-label="Grocery lists and budgets"
        className="flex scroll-mt-24 flex-col gap-6"
        id="budget"
      >
        {data === undefined ? (
          <LoadingRows layout="groceries" label="Loading your lists" rows={4} />
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
        {data !== undefined && data.lists.length > 0 ? (
          <nav aria-label="Your lists" className="flex flex-wrap gap-2">
            {data.lists.map((candidate) => {
              const isCurrent = candidate._id === list?._id;

              return (
                <div
                  className={cn(
                    "border-control flex max-w-full min-w-0 items-center rounded-md border transition-colors",
                    isCurrent
                      ? "bg-neutral-wash hover:bg-rule"
                      : "bg-raised hover:border-foreground hover:bg-parchment"
                  )}
                  key={candidate._id}
                >
                  <Button
                    aria-current={isCurrent ? "true" : undefined}
                    className="shrink py-3 pr-2 break-words whitespace-normal hover:bg-transparent active:bg-transparent"
                    onClick={() => setChosen(candidate._id)}
                    variant="ghost"
                  >
                    {candidate.name}
                  </Button>
                  <Button
                    aria-label={`Delete ${candidate.name}`}
                    className="text-muted-foreground hover:text-foreground shrink-0 hover:bg-transparent active:bg-transparent"
                    onClick={() => requestDelete(candidate)}
                    size="icon"
                    title={`Delete ${candidate.name}`}
                    variant="ghost"
                  >
                    <XIcon />
                  </Button>
                </div>
              );
            })}
          </nav>
        ) : null}
        {list === null ? null : (
          <GroceryWorkspace list={list} onDelete={() => requestDelete(list)} />
        )}
      </section>
    </>
  );
};

export { GroceriesScreen };

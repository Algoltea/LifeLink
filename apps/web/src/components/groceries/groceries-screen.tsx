"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Dialog } from "@lifelink/ui/components/dialog";
import { useMutation, useQuery } from "convex/react";
import {
  CopyIcon,
  PlusIcon,
  PrinterIcon,
  SquareIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import type {
  ComponentProps,
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { formatShortDay } from "@/lib/format";

import {
  ListEditor,
  UNDO_WINDOW_MS,
  listAsText,
  quantityWords,
} from "./list-editor";
import { ListPicker } from "./list-picker";
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
    <div className="flex min-w-0 flex-col gap-3">
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
          Copy as text
        </Button>
      </div>
      {hasOpenItems ? null : (
        <p className="text-muted-foreground text-lg leading-7">
          Add an item or untick one before printing or copying.
        </p>
      )}
    </div>
  );
};

const GroceryWorkspace = ({
  actions,
  finishedOn,
  list,
}: {
  actions: ComponentProps<typeof ListEditor>["actions"];
  finishedOn: string | null;
  list: Doc<"groceryLists">;
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
          actions={actions}
          finishedOn={finishedOn}
          key={list._id}
          list={list}
          summary={
            // On wide screens the sticky receipt already shows these totals.
            <div className="xl:hidden">
              <BudgetSummary list={list} />
            </div>
          }
          tools={<ListTools list={list} />}
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

const DeleteListDialog = ({
  finalFocus,
  onClose,
  onDeleted,
  target,
}: {
  finalFocus: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onDeleted: (listId: Id<"groceryLists">) => void;
  target: Doc<"groceryLists"> | null;
}) => {
  const deleteList = useMutation(api.groceries.deleteList);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const close = (): void => {
    setDeleteError(null);
    onClose();
  };

  return (
    <Dialog
      finalFocus={finalFocus}
      description={`This permanently deletes “${target?.name ?? ""}” and all its items, budget, and preferences. This cannot be undone.${target?.archivedAt === undefined ? " To keep it for later, finish the trip instead." : ""}`}
      onOpenChange={(open) => {
        if (!open && !deleting) {
          close();
        }
      }}
      open={target !== null}
      title="Delete this grocery list?"
    >
      {deleteError ? (
        <p className="text-negative text-base" role="alert">
          {deleteError}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={deleting} onClick={close} variant="outline">
          Keep list
        </Button>
        <Button
          aria-busy={deleting}
          disabled={deleting}
          onClick={async () => {
            if (target === null || deleting) {
              return;
            }

            setDeleting(true);
            setDeleteError(null);

            try {
              await deleteList({ listId: target._id });
              onDeleted(target._id);
              close();
              toast.success(`“${target.name}” deleted.`);
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
  );
};

/** Runs a list change and reports any failure in a toast. */
const attempt = async (work: () => Promise<void>): Promise<void> => {
  try {
    await work();
  } catch (error) {
    toast.error(errorText(error));
  }
};

type SetChosen = Dispatch<SetStateAction<Id<"groceryLists"> | null>>;

/** Everything that creates, finishes, or reuses a list, each with its own feedback. */
const useListActions = (setChosen: SetChosen) => {
  const createList = useMutation(api.groceries.createList);
  const copyList = useMutation(api.groceries.copyList);
  const archiveList = useMutation(api.groceries.archiveList);
  const unarchiveList = useMutation(api.groceries.unarchiveList);
  const setUsual = useMutation(api.groceries.setUsual);

  const reopen = (target: Doc<"groceryLists">) =>
    attempt(async () => {
      await unarchiveList({ listId: target._id });
      setChosen(target._id);
    });

  return {
    copyOf: (source: Doc<"groceryLists">) =>
      attempt(async () => {
        setChosen(await copyList({ listId: source._id }));
        toast.success(
          `Started a new list from “${source.name}”. The original is unchanged.`
        );
      }),
    /** Moving a list to past lists is undoable, so it needs no confirmation. */
    finish: (target: Doc<"groceryLists">) =>
      attempt(async () => {
        await archiveList({ listId: target._id });
        setChosen((selected) => (selected === target._id ? null : selected));
        toast(`Moved “${target.name}” to past lists.`, {
          action: { label: "Undo", onClick: () => reopen(target) },
          duration: UNDO_WINDOW_MS,
        });
      }),
    newList: (currentCount: number) =>
      attempt(async () => {
        setChosen(
          await createList({
            name: currentCount > 0 ? `List ${currentCount + 1}` : "Groceries",
          })
        );
      }),
    reopen,
    toggleUsual: (target: Doc<"groceryLists">) =>
      attempt(async () => {
        const making = target.usual !== true;
        await setUsual({ listId: target._id, usual: making });
        toast.success(
          making
            ? `“${target.name}” is now your usual list.`
            : `“${target.name}” is no longer your usual list.`
        );
      }),
  };
};

/** With a usual list, starting from it comes first; an empty list is the fallback. */
const StartButtons = ({
  newListButton,
  onNewList,
  onStartFromUsual,
  usual,
}: {
  newListButton: RefObject<HTMLButtonElement | null>;
  onNewList: () => void;
  onStartFromUsual: () => void;
  usual: Doc<"groceryLists"> | null;
}) => (
  <div className="flex flex-wrap gap-3">
    {usual === null ? null : (
      <Button onClick={onStartFromUsual}>
        <StarIcon className="fill-current" />
        Start from your usual list
      </Button>
    )}
    <Button
      onClick={onNewList}
      ref={newListButton}
      variant={usual === null ? "default" : "outline"}
    >
      <PlusIcon />
      {usual === null ? "New list" : "New empty list"}
    </Button>
  </div>
);

/** Current lists in the order they were made; past lists newest first. */
const sortLists = (lists: Doc<"groceryLists">[]) => ({
  current: lists.filter((item) => item.archivedAt === undefined),
  past: lists
    .filter((item) => item.archivedAt !== undefined)
    .toSorted((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0)),
  usual: lists.find((item) => item.usual === true) ?? null,
});

const GroceriesScreen = () => {
  const data = useQuery(api.groceries.lists);
  const { me } = usePreferences();
  const newListButton = useRef<HTMLButtonElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Doc<"groceryLists"> | null>(
    null
  );

  const [chosen, setChosen] = useState<Id<"groceryLists"> | null>(null);

  const { copyOf, finish, newList, reopen, toggleUsual } =
    useListActions(setChosen);

  const timeZone =
    me?.profile?.timeZone ??
    new Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { current, past, usual } = sortLists(data?.lists ?? []);

  const list =
    data?.lists.find((candidate) => candidate._id === chosen) ??
    current[0] ??
    null;

  const startButtons = (
    <StartButtons
      newListButton={newListButton}
      onNewList={() => newList(current.length)}
      onStartFromUsual={() => (usual === null ? undefined : copyOf(usual))}
      usual={usual}
    />
  );

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <PageHeader
        actions={startButtons}
        subline="Keep a grocery list, plan your budget, and copy or print what you need."
        title="Groceries"
      />
      <DeleteListDialog
        finalFocus={newListButton}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(listId) =>
          setChosen((selected) => (selected === listId ? null : selected))
        }
        target={deleteTarget}
      />
      <section
        aria-label="Grocery lists and budgets"
        className="flex scroll-mt-24 flex-col gap-6"
        id="budget"
      >
        {data === undefined ? (
          <LoadingRows layout="groceries" label="Loading your lists" rows={4} />
        ) : null}
        {data !== undefined && current.length === 0 ? (
          <EmptyNote action={startButtons}>
            {past.length > 0
              ? "No current lists. Start a new one, or open a past list below."
              : "No grocery lists yet."}
          </EmptyNote>
        ) : null}
        <ListPicker
          current={current}
          onChoose={setChosen}
          past={past}
          selectedId={list?._id ?? null}
          timeZone={timeZone}
        />
        {list === null ? null : (
          <GroceryWorkspace
            actions={{
              onCopy: () => copyOf(list),
              onDelete: () => setDeleteTarget(list),
              onFinish: () => finish(list),
              onReopen: () => reopen(list),
              onToggleUsual: () => toggleUsual(list),
            }}
            finishedOn={
              list.archivedAt === undefined
                ? null
                : formatShortDay(list.archivedAt, timeZone)
            }
            list={list}
          />
        )}
      </section>
    </>
  );
};

export { GroceriesScreen };

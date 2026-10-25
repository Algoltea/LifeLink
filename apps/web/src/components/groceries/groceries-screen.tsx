"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import {
  CopyIcon,
  PlusIcon,
  PrinterIcon,
  SquareIcon,
  StarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useLocale, currentMessages, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { formatShortDay } from "@/lib/format";

import { DeleteListDialog } from "./delete-list-dialog";
import { ListEditor } from "./list-editor";
import { ListPicker } from "./list-picker";
import {
  UNDO_WINDOW_MS,
  listAsText,
  openSections,
  quantityWords,
} from "./list-text";
import { Receipt, ReceiptBar } from "./receipt";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

/** Printing shows only the list itself, in large type, without the app around it. */
const PRINT_STYLES = `@media print {
  body * { visibility: hidden !important; }
  #grocery-print, #grocery-print * { visibility: visible !important; }
  #grocery-print { position: absolute; inset: 0; display: block !important; padding: 2rem; font-size: 20pt; }
}`;

const PrintableList = ({ list }: { list: Doc<"groceryLists"> }) => {
  const locale = useLocale();
  const t = useMessages().groceries;

  return (
    <div aria-hidden="true" className="hidden" id="grocery-print">
      <h2 className="pb-4 text-3xl">{list.name}</h2>
      {openSections(list, t).map((section) => (
        <section className="pb-4" key={section.heading ?? "unsorted"}>
          {section.heading === null ? null : (
            <h3 className="pb-2 font-semibold">{section.heading}</h3>
          )}
          <ul className="flex flex-col gap-3">
            {section.items.map((item) => (
              <li key={item.id}>
                <SquareIcon aria-hidden="true" className="mr-3 inline size-5" />
                {item.name} {quantityWords(item, locale)}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {list.preferences.length > 0 ? (
        <p className="pt-6">{t.notes(list.preferences.join("; "))}</p>
      ) : null}
    </div>
  );
};

const ListTools = ({ list }: { list: Doc<"groceryLists"> }) => {
  const locale = useLocale();
  const hasOpenItems = list.items.some((item) => !item.checked);
  const t = useMessages().groceries;

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
          {t.printList}
        </Button>
        <Button
          className="max-w-full py-3 whitespace-normal"
          disabled={!hasOpenItems}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(listAsText(list, locale));
              toast.success(t.copied);
            } catch {
              toast.error(t.copyFailed);
            }
          }}
          variant="outline"
        >
          <CopyIcon />
          {t.copyAsText}
        </Button>
      </div>
      {hasOpenItems ? null : (
        <p className="text-muted-foreground text-lg leading-7">
          {t.openItemsHint}
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
  const checklist = useRef<HTMLElement>(null);
  const t = useMessages().groceries;

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
      <section aria-label={t.list} className="min-w-0" ref={checklist}>
        <ListEditor
          actions={actions}
          finishedOn={finishedOn}
          key={list._id}
          list={list}
          tools={<ListTools list={list} />}
        />
      </section>
      <ReceiptBar list={list} onShow={showReceipt} />
      <Receipt checklist={checklist} list={list} ref={receipt} />
      <PrintableList list={list} />
    </div>
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

type SetChosen = Dispatch<SetStateAction<string | null>>;

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
        toast.success(currentMessages().groceries.startedFrom(source.name));
      }),
    /** Moving a list to past lists is undoable, so it needs no confirmation. */
    finish: (target: Doc<"groceryLists">) =>
      attempt(async () => {
        await archiveList({ listId: target._id });
        setChosen((selected) => (selected === target._id ? null : selected));
        toast(currentMessages().groceries.movedToPast(target.name), {
          action: {
            label: currentMessages().groceries.undo,
            onClick: () => reopen(target),
          },
          duration: UNDO_WINDOW_MS,
        });
      }),
    newList: (currentCount: number) =>
      attempt(async () => {
        setChosen(
          await createList({
            name:
              currentCount > 0
                ? currentMessages().groceries.listNumber(currentCount + 1)
                : currentMessages().groceries.defaultName,
          })
        );
      }),
    reopen,
    toggleUsual: (target: Doc<"groceryLists">) =>
      attempt(async () => {
        const making = target.usual !== true;
        await setUsual({ listId: target._id, usual: making });
        const t = currentMessages().groceries;
        toast.success(
          making ? t.usualNow(target.name) : t.usualNoLonger(target.name)
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
}) => {
  const t = useMessages().groceries;

  return (
    <div className="flex flex-wrap gap-3">
      {usual === null ? null : (
        <Button onClick={onStartFromUsual}>
          <StarIcon className="fill-current" />
          {t.startFromUsual}
        </Button>
      )}
      <Button
        onClick={onNewList}
        ref={newListButton}
        variant={usual === null ? "default" : "outline"}
      >
        <PlusIcon />
        {usual === null ? t.newList : t.newEmptyList}
      </Button>
    </div>
  );
};

/** Current lists in the order they were made; past lists newest first. */
const sortLists = (lists: Doc<"groceryLists">[]) => ({
  current: lists.filter((item) => item.archivedAt === undefined),
  past: lists
    .filter((item) => item.archivedAt !== undefined)
    .toSorted((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0)),
  usual: lists.find((item) => item.usual === true) ?? null,
});

/** `initialListId` comes from `?list=`, so the past lists page can open a list here. */
const GroceriesScreen = ({
  initialListId = null,
}: {
  initialListId?: string | null;
}) => {
  const locale = useLocale();
  const data = useQuery(api.groceries.lists);
  const { me } = usePreferences();
  const newListButton = useRef<HTMLButtonElement>(null);
  const t = useMessages().groceries;

  const [deleteTarget, setDeleteTarget] = useState<Doc<"groceryLists"> | null>(
    null
  );

  const [chosen, setChosen] = useState<string | null>(initialListId);
  const router = useRouter();

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
      <PageHeader actions={startButtons} subline={t.subline} title={t.title} />
      <DeleteListDialog
        finalFocus={newListButton}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(listId) =>
          setChosen((selected) => (selected === listId ? null : selected))
        }
        target={deleteTarget}
      />
      <section
        aria-label={t.lists}
        className="flex scroll-mt-24 flex-col gap-6"
        id="budget"
      >
        {data === undefined ? (
          <LoadingRows layout="groceries" label={t.loading} rows={4} />
        ) : null}
        {data !== undefined && current.length === 0 ? (
          <EmptyNote action={startButtons}>
            {past.length > 0 ? t.emptyWithPast : t.empty}
          </EmptyNote>
        ) : null}
        <ListPicker
          current={current}
          onChoose={setChosen}
          onSeeAllPast={() => router.push("/groceries/past")}
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
                : formatShortDay(list.archivedAt, timeZone, locale)
            }
            list={list}
          />
        )}
      </section>
    </>
  );
};

export { GroceriesScreen };

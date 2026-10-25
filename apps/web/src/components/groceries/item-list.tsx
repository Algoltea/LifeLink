"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { moveItem } from "@lifelink/contracts/grocery-aisles";
import type { MoveDirection } from "@lifelink/contracts/grocery-aisles";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { useAction, useMutation } from "convex/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyNote } from "@/components/app/states";
import { useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { money } from "@/lib/format";

import {
  UNDO_WINDOW_MS,
  aisleHeading,
  isSorted,
  itemMatches,
  openSections,
  quantityWords,
  shoppingOrder,
} from "./list-text";
import type { GroceryItem } from "./list-text";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type ListId = Doc<"groceryLists">["_id"];

interface ItemMove {
  direction: MoveDirection;
  item: GroceryItem;
  neighbour: GroceryItem;
}

interface MoveControls {
  /** Null when the item is already first or last. */
  down: string | null;
  onMove: (direction: MoveDirection) => Promise<void>;
  up: string | null;
}

/** "Move Milk up", or, at a section's edge, which section it would join. */
const moveLabel = (
  item: GroceryItem,
  neighbour: GroceryItem | undefined,
  direction: MoveDirection,
  messages: Messages["groceries"],
  completed = false
): string | null => {
  if (neighbour === undefined) {
    return null;
  }

  const format = completed ? messages.movedItem : messages.moveItem;

  return format(
    item.name,
    direction,
    neighbour.aisle === item.aisle
      ? null
      : aisleHeading(neighbour.aisle, messages)
  );
};

const MoveButtons = ({
  item,
  move,
}: {
  item: GroceryItem;
  move: MoveControls;
}) => {
  const t = useMessages().groceries;

  return (
    <div className="flex shrink-0">
      {(["up", "down"] as const).map((direction) => {
        const label = move[direction];

        return (
          <Button
            aria-label={label ?? t.moveItem(item.name, direction, null)}
            data-item={item.id}
            data-move={direction}
            disabled={label === null}
            key={direction}
            onClick={() => move.onMove(direction)}
            size="icon"
            title={label ?? undefined}
            variant="ghost"
          >
            {direction === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </Button>
        );
      })}
    </div>
  );
};

const ItemRow = ({
  item,
  listId,
  move,
  onToggle,
}: {
  item: GroceryItem;
  listId: ListId;
  move: MoveControls | null;
  onToggle: () => void;
}) => {
  const locale = useLocale();
  const t = useMessages().groceries;
  const updateItem = useMutation(api.groceries.updateItem);
  const removeItem = useMutation(api.groceries.removeItem);
  const restoreItem = useMutation(api.groceries.restoreItem);
  const checkboxId = useId();

  const remove = async (): Promise<void> => {
    try {
      const removed = await removeItem({ itemId: item.id, listId });

      if (removed === null) {
        return;
      }

      // The X is easy to hit by mistake, so every removal can be undone.
      toast(t.removed(removed.item.name), {
        action: {
          label: t.undo,
          onClick: async () => {
            try {
              await restoreItem({ ...removed, listId });
            } catch (error) {
              toast.error(errorText(error));
            }
          },
        },
        duration: UNDO_WINDOW_MS,
      });
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  return (
    <li className="border-rule flex items-center gap-3 border-t py-1">
      <Checkbox
        checked={item.checked}
        id={checkboxId}
        onCheckedChange={async (checked) => {
          onToggle();

          try {
            await updateItem({ checked, itemId: item.id, listId });
          } catch (error) {
            toast.error(errorText(error));
          }
        }}
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3">
        <Label
          className={
            item.checked
              ? "text-muted-foreground cursor-pointer"
              : "cursor-pointer"
          }
          htmlFor={checkboxId}
        >
          {item.name}
          {item.checked ? <span className="sr-only">{t.inCartSr}</span> : null}
        </Label>
        <span className="text-muted-foreground text-base">
          {[
            quantityWords(item, locale),
            item.estimatedCents === null
              ? ""
              : t.about(money(item.estimatedCents, locale)),
          ]
            .filter((part) => part.length > 0)
            .join(" · ")}
        </span>
      </div>
      {move === null ? null : <MoveButtons item={item} move={move} />}
      <Button
        aria-label={t.removeItem(item.name)}
        onClick={remove}
        size="icon"
        variant="ghost"
      >
        <XIcon />
      </Button>
    </li>
  );
};

/**
 * Asks the assistant which store section each item is in, then lists them
 * in the order a walk through a typical store reaches them. Hidden once
 * every item still to get has a section.
 */
const SortByAisleButton = ({
  afterSort,
  list,
}: {
  afterSort: () => void;
  list: Doc<"groceryLists">;
}) => {
  const t = useMessages().groceries;
  const sortByAisle = useAction(api.groceries.sortByAisle);
  const restoreArrangement = useMutation(api.groceries.restoreArrangement);
  const [sorting, setSorting] = useState(false);
  const open = list.items.filter((item) => !item.checked);
  const unsorted = open.filter((item) => item.aisle === undefined).length;
  const sorted = isSorted(list.items);

  if (unsorted === 0 || (!sorted && open.length < 2)) {
    return null;
  }

  let label = sorted ? t.sortNewByAisle : t.sortByAisle;

  if (sorting) {
    label = t.sorting;
  }

  const sort = async (): Promise<void> => {
    setSorting(true);

    try {
      const outcome = await sortByAisle({ listId: list._id });

      const summary = t.sortedByAisle(outcome.sorted);

      const note =
        outcome.localReason === null
          ? ""
          : ` ${t.sortFallback[outcome.localReason]}`;

      toast.success(`${summary}${note} ${t.moveHint}`, {
        action: {
          label: t.undo,
          onClick: async () => {
            try {
              await restoreArrangement({
                arrangement: outcome.previous,
                listId: list._id,
              });
            } catch (error) {
              toast.error(errorText(error));
            }
          },
        },
        duration: UNDO_WINDOW_MS,
      });
      afterSort();
    } catch (error) {
      toast.error(errorText(error));
    }

    setSorting(false);
  };

  return (
    <Button
      aria-busy={sorting}
      className="whitespace-normal"
      disabled={sorting}
      onClick={sort}
      variant="outline"
    >
      <SparklesIcon />
      {label}
    </Button>
  );
};

const ItemSearch = ({
  input,
  onChange,
  query,
}: {
  input: RefObject<HTMLInputElement | null>;
  onChange: (query: string) => void;
  query: string;
}) => {
  const t = useMessages().groceries;
  const searchId = useId();

  return (
    <search className="relative flex min-w-0 flex-1 basis-64 items-center">
      <label className="sr-only" htmlFor={searchId}>
        {t.itemSearch}
      </label>
      <SearchIcon
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute left-4 size-5"
      />
      <Input
        className="pl-12"
        id={searchId}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && query.length > 0) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder={t.itemSearchPlaceholder}
        ref={input}
        type="search"
        value={query}
      />
    </search>
  );
};

interface Block {
  heading: string | null;
  items: GroceryItem[];
}

/** What to show: matches while searching, otherwise sections then the cart. */
const blocksFor = (
  list: Doc<"groceryLists">,
  query: string,
  messages: Messages["groceries"]
): Block[] => {
  const ordered = shoppingOrder(list.items);

  if (query.trim().length > 0) {
    return [
      {
        heading: null,
        items: ordered.filter((item) => itemMatches(item, query)),
      },
    ];
  }

  if (!isSorted(list.items)) {
    return [{ heading: null, items: ordered }];
  }

  const inCart = list.items.filter((item) => item.checked);

  return [
    ...openSections(list, messages),
    ...(inCart.length > 0
      ? [{ heading: messages.inYourCart, items: inCart }]
      : []),
  ];
};

/** Moves are applied at once on screen; the server's answer follows. */
const useMoveItem = () =>
  useMutation(api.groceries.moveItem).withOptimisticUpdate((store, args) => {
    const data = store.getQuery(api.groceries.lists, {});

    if (data === undefined) {
      return;
    }

    store.setQuery(
      api.groceries.lists,
      {},
      {
        ...data,
        lists: data.lists.map((list) =>
          list._id === args.listId
            ? {
                ...list,
                items:
                  moveItem(list.items, args.itemId, args.direction) ??
                  list.items,
              }
            : list
        ),
      }
    );
  });

/**
 * The items on one list: a search box, sorting by store aisle, and arrows to
 * move each item up or down. Searching shows matches only, without arrows,
 * since moving within a partial list would be confusing.
 */
const GroceryItems = ({ list }: { list: Doc<"groceryLists"> }) => {
  const t = useMessages().groceries;
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState<ItemMove | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const refocusAt = useRef<number | null>(null);

  const pendingMove = useRef<{
    direction: MoveDirection;
    itemId: string;
  } | null>(null);

  const moveOnServer = useMoveItem();
  const searching = query.trim().length > 0;
  const blocks = blocksFor(list, query, t);
  const shown = blocks.flatMap((block) => block.items);
  const open = list.items.filter((item) => !item.checked);

  // A ticked item moves to the bottom, and a moved item may change section;
  // keep focus where the person was so they can carry on from there.
  useEffect(() => {
    const scope = container.current;
    const index = refocusAt.current;
    const moved = pendingMove.current;
    refocusAt.current = null;

    if (scope === null) {
      return;
    }

    const { activeElement } = document;

    const focusInList =
      activeElement === document.body || scope.contains(activeElement);

    if (moved !== null && focusInList) {
      const button = (direction: MoveDirection) =>
        scope.querySelector<HTMLButtonElement>(
          `[data-item="${moved.itemId}"][data-move="${direction}"]:not(:disabled)`
        );

      const opposite = moved.direction === "up" ? "down" : "up";
      const target = button(moved.direction) ?? button(opposite);

      if (target !== null && activeElement !== target) {
        target.focus();
      }

      return;
    }

    if (index === null || !focusInList) {
      return;
    }

    const boxes = scope.querySelectorAll<HTMLElement>('[role="checkbox"]');
    boxes[Math.min(index, boxes.length - 1)]?.focus();
  });

  const move = async (
    item: GroceryItem,
    direction: MoveDirection,
    neighbour: GroceryItem
  ): Promise<void> => {
    const pending = { direction, itemId: item.id };
    pendingMove.current = pending;
    setAnnouncement({ direction, item, neighbour });

    try {
      await moveOnServer({ direction, itemId: item.id, listId: list._id });
    } catch (error) {
      toast.error(errorText(error));
    }

    if (pendingMove.current === pending) {
      pendingMove.current = null;
    }
  };

  const controlsFor = (item: GroceryItem): MoveControls | null => {
    const at = open.indexOf(item);

    if (searching || at === -1) {
      return null;
    }

    const up = moveLabel(item, open[at - 1], "up", t);
    const down = moveLabel(item, open[at + 1], "down", t);

    return {
      down,
      onMove: async (direction) => {
        const neighbour = open[at + (direction === "up" ? -1 : 1)];

        if (neighbour !== undefined) {
          await move(item, direction, neighbour);
        }
      },
      up,
    };
  };

  if (list.items.length === 0) {
    return <EmptyNote>{t.nothingOnListHint}</EmptyNote>;
  }

  const moveAnnouncement =
    announcement === null
      ? ""
      : moveLabel(
          announcement.item,
          announcement.neighbour,
          announcement.direction,
          t,
          true
        );

  return (
    <div className="flex flex-col gap-3" ref={container}>
      <div className="flex flex-wrap items-center gap-3">
        <ItemSearch input={searchInput} onChange={setQuery} query={query} />
        <SortByAisleButton
          afterSort={() => searchInput.current?.focus()}
          list={list}
        />
      </div>
      <p aria-live="polite" className="text-muted-foreground text-base">
        {searching
          ? t.itemSearchCount(shown.length, list.items.length)
          : moveAnnouncement}
      </p>
      {searching && shown.length === 0 ? (
        <EmptyNote
          action={
            <Button
              onClick={() => {
                setQuery("");
                searchInput.current?.focus();
              }}
              variant="outline"
            >
              {t.clearItemSearch}
            </Button>
          }
        >
          {t.noMatchingItems(query.trim())}
        </EmptyNote>
      ) : null}
      {blocks.map((block) =>
        block.items.length === 0 ? null : (
          <section
            aria-label={block.heading ?? undefined}
            key={block.items[0]?.id}
          >
            {block.heading === null ? null : (
              <h3 className="pt-3 pb-1 text-lg leading-7 font-semibold">
                {block.heading}
              </h3>
            )}
            <ul aria-label={block.heading ?? t.itemsOn(list.name)}>
              {block.items.map((item) => (
                <ItemRow
                  item={item}
                  key={item.id}
                  listId={list._id}
                  move={controlsFor(item)}
                  onToggle={() => {
                    refocusAt.current = shown.indexOf(item);
                  }}
                />
              ))}
            </ul>
          </section>
        )
      )}
    </div>
  );
};

export { GroceryItems };

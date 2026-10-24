"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { aisleLabel, moveItem } from "@lifelink/contracts/grocery-aisles";
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
import { messageOf } from "@/lib/errors";
import { money } from "@/lib/format";

import {
  UNDO_WINDOW_MS,
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

const MOVE_PREFIX = /^Move/u;

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
  direction: MoveDirection
): string | null => {
  if (neighbour === undefined) {
    return null;
  }

  return neighbour.aisle === item.aisle
    ? `Move ${item.name} ${direction}`
    : `Move ${item.name} ${direction}, into ${aisleLabel(neighbour.aisle)}`;
};

const MoveButtons = ({
  item,
  move,
}: {
  item: GroceryItem;
  move: MoveControls;
}) => (
  <div className="flex shrink-0">
    {(["up", "down"] as const).map((direction) => {
      const label = move[direction];

      return (
        <Button
          aria-label={label ?? `Move ${item.name} ${direction}`}
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
      toast(`Removed ${removed.item.name}.`, {
        action: {
          label: "Undo",
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
          {item.checked ? <span className="sr-only"> (in cart)</span> : null}
        </Label>
        <span className="text-muted-foreground text-base">
          {[
            quantityWords(item),
            item.estimatedCents === null
              ? ""
              : `about ${money(item.estimatedCents)}`,
          ]
            .filter((part) => part.length > 0)
            .join(" · ")}
        </span>
      </div>
      {move === null ? null : <MoveButtons item={item} move={move} />}
      <Button
        aria-label={`Remove ${item.name}`}
        onClick={remove}
        size="icon"
        variant="ghost"
      >
        <XIcon />
      </Button>
    </li>
  );
};

const SORT_FALLBACK_NOTES = {
  failed: "The assistant didn't answer, so LifeLink's built-in guide was used.",
  limit:
    "The assistant has sorted a lot of lists recently, so LifeLink's built-in guide was used.",
  unavailable: "Sorted with LifeLink's built-in guide.",
} as const;

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
  const sortByAisle = useAction(api.groceries.sortByAisle);
  const restoreArrangement = useMutation(api.groceries.restoreArrangement);
  const [sorting, setSorting] = useState(false);
  const open = list.items.filter((item) => !item.checked);
  const unsorted = open.filter((item) => item.aisle === undefined).length;
  const sorted = isSorted(list.items);

  if (unsorted === 0 || (!sorted && open.length < 2)) {
    return null;
  }

  let label = sorted ? "Sort new items by aisle" : "Sort by aisle";

  if (sorting) {
    label = "Sorting…";
  }

  const sort = async (): Promise<void> => {
    setSorting(true);

    try {
      const outcome = await sortByAisle({ listId: list._id });

      const summary =
        outcome.sorted === 1
          ? "Sorted 1 item by aisle."
          : `Sorted ${outcome.sorted} items by aisle.`;

      const note =
        outcome.localReason === null
          ? ""
          : ` ${SORT_FALLBACK_NOTES[outcome.localReason]}`;

      toast.success(
        `${summary}${note} Move any item that's in the wrong place.`,
        {
          action: {
            label: "Undo",
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
        }
      );
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
  const searchId = useId();

  return (
    <search className="relative flex min-w-0 flex-1 basis-64 items-center">
      <label className="sr-only" htmlFor={searchId}>
        Find an item on this list
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
        placeholder="Find an item, like milk"
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
const blocksFor = (list: Doc<"groceryLists">, query: string): Block[] => {
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
    ...openSections(list),
    ...(inCart.length > 0 ? [{ heading: "In your cart", items: inCart }] : []),
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
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const refocusAt = useRef<number | null>(null);

  const pendingMove = useRef<{
    direction: MoveDirection;
    itemId: string;
  } | null>(null);

  const moveOnServer = useMoveItem();
  const searching = query.trim().length > 0;
  const blocks = blocksFor(list, query);
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
    label: string
  ): Promise<void> => {
    const pending = { direction, itemId: item.id };
    pendingMove.current = pending;
    setAnnouncement(`${label.replace(MOVE_PREFIX, "Moved")}.`);

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

    const up = moveLabel(item, open[at - 1], "up");
    const down = moveLabel(item, open[at + 1], "down");

    return {
      down,
      onMove: async (direction) => {
        const label = direction === "up" ? up : down;

        if (label !== null) {
          await move(item, direction, label);
        }
      },
      up,
    };
  };

  if (list.items.length === 0) {
    return (
      <EmptyNote>
        Nothing on this list yet. Open Add items to add the first item.
      </EmptyNote>
    );
  }

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
          ? `${shown.length} of ${list.items.length} ${list.items.length === 1 ? "item matches" : "items match"}`
          : announcement}
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
              Clear search
            </Button>
          }
        >
          Nothing on this list matches “{query.trim()}”.
        </EmptyNote>
      ) : null}
      {blocks.map((block) =>
        block.items.length === 0 ? null : (
          <section
            aria-label={block.heading ?? undefined}
            key={`${block.heading}-${block.items[0]?.id}`}
          >
            {block.heading === null ? null : (
              <h3 className="pt-3 pb-1 text-lg leading-7 font-semibold">
                {block.heading}
              </h3>
            )}
            <ul aria-label={block.heading ?? `Items on ${list.name}`}>
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

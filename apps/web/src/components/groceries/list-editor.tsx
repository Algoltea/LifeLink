"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import {
  groceryQuantityError,
  groceryUnit,
} from "@lifelink/contracts/groceries";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Dialog } from "@lifelink/ui/components/dialog";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation } from "convex/react";
import {
  ArchiveRestoreIcon,
  CheckCheckIcon,
  CopyPlusIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyNote } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { money } from "@/lib/format";

import { centsFromDollars, dollarsFromCents } from "./amounts";
import { UnitSelect } from "./unit-select";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type GroceryItem = Doc<"groceryLists">["items"][number];

/** Long enough to notice a stray tap and reach Undo without hurrying. */
const UNDO_WINDOW_MS = 10_000;

const quantityWords = (item: GroceryItem): string => {
  if (item.quantity === null) {
    return "";
  }

  return item.unit ? `${item.quantity} ${item.unit}` : `× ${item.quantity}`;
};

/** The list as plain lines, for copying into a text or an email. */
const listAsText = (list: Doc<"groceryLists">): string => {
  const open = list.items.filter((item) => !item.checked);

  const lines = open.map(
    (item) =>
      `- ${item.name}${item.quantity === null ? "" : ` (${quantityWords(item).replace("× ", "")})`}`
  );

  const notes =
    list.preferences.length > 0
      ? `\n\nNotes: ${list.preferences.join("; ")}`
      : "";

  return `${list.name}\n${lines.join("\n")}${notes}`;
};

const ItemRow = ({
  item,
  listId,
  onToggle,
}: {
  item: GroceryItem;
  listId: Doc<"groceryLists">["_id"];
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

const AddItemForm = ({ listId }: { listId: Doc<"groceryLists">["_id"] }) => {
  const addItem = useMutation(api.groceries.addItem);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const baseId = useId();

  const priceInvalid =
    price.trim().length > 0 && centsFromDollars(price) === null;

  const quantityError = groceryQuantityError(Number(quantity), unit);
  const fractional = groceryUnit(unit)?.fractional === true;

  return (
    <form
      className="bg-surface grid gap-4 rounded-xl p-5 @min-[32em]:grid-cols-3 @min-[32em]:items-end"
      onSubmit={async (event) => {
        event.preventDefault();

        if (
          quantityError !== null ||
          priceInvalid ||
          name.trim().length === 0
        ) {
          return;
        }

        try {
          await addItem({
            estimatedCents: centsFromDollars(price),
            listId,
            name,
            quantity: Number(quantity),
            unit: unit.trim() || null,
          });
          setName("");
          setQuantity("1");
          setUnit("");
          setPrice("");
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <div className="flex flex-col gap-2 @min-[32em]:col-span-3">
        <Label htmlFor={`${baseId}-name`}>Item</Label>
        <Input
          id={`${baseId}-name`}
          onChange={(event) => setName(event.target.value)}
          placeholder="Bananas"
          value={name}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-quantity`}>Quantity</Label>
        <Input
          aria-describedby={
            quantityError ? `${baseId}-quantity-error` : undefined
          }
          aria-invalid={quantityError !== null}
          id={`${baseId}-quantity`}
          inputMode={fractional ? "decimal" : "numeric"}
          min={fractional ? 0 : 1}
          onChange={(event) => setQuantity(event.target.value)}
          required
          step={fractional ? "any" : 1}
          type="number"
          value={quantity}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-unit`}>Unit</Label>
        <UnitSelect
          id={`${baseId}-unit`}
          onValueChange={setUnit}
          value={unit}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-price`}>Total estimate ($)</Label>
        <Input
          aria-describedby={`${baseId}-price-help${priceInvalid ? ` ${baseId}-price-error` : ""}`}
          aria-invalid={priceInvalid}
          id={`${baseId}-price`}
          inputMode="decimal"
          onChange={(event) => setPrice(event.target.value)}
          placeholder="3.50"
          value={price}
        />
      </div>
      {quantityError ? (
        <p
          className="text-negative text-lg leading-7 @min-[32em]:col-span-3"
          id={`${baseId}-quantity-error`}
          role="alert"
        >
          {quantityError}
        </p>
      ) : null}
      <p
        className="text-muted-foreground text-base @min-[32em]:col-span-3"
        id={`${baseId}-price-help`}
      >
        Estimate the total for this quantity after discounts. Enter 0 for a free
        item, or leave blank if unsure.
      </p>
      {priceInvalid ? (
        <p
          className="text-negative text-lg leading-7 @min-[32em]:col-span-3"
          id={`${baseId}-price-error`}
          role="alert"
        >
          Enter an amount such as 3.50, or leave the estimate blank.
        </p>
      ) : null}
      <Button
        className="justify-self-start @min-[32em]:col-span-3"
        disabled={
          name.trim().length === 0 || priceInvalid || quantityError !== null
        }
        type="submit"
      >
        <PlusIcon />
        Add item
      </Button>
    </form>
  );
};

const DetailsForm = ({
  list,
  onDone,
  onDelete,
}: {
  list: Doc<"groceryLists">;
  onDone: () => void;
  onDelete: () => void;
}) => {
  const setDetails = useMutation(api.groceries.setDetails);
  const [name, setName] = useState(list.name);
  const [budget, setBudget] = useState(dollarsFromCents(list.budgetCents));
  const [preferences, setPreferences] = useState(list.preferences.join("\n"));
  const baseId = useId();

  const budgetInvalid =
    budget.trim().length > 0 && centsFromDollars(budget) === null;

  return (
    <form
      className="bg-surface @container flex flex-col gap-4 rounded-xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();

        try {
          await setDetails({
            budgetCents: centsFromDollars(budget),
            listId: list._id,
            name,
            preferences: preferences.split("\n"),
          });
          toast.success("List details saved.");
          onDone();
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <div className="grid gap-4 @min-[32em]:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-name`}>List name</Label>
          <Input
            id={`${baseId}-name`}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-budget`}>Budget for this list ($)</Label>
          <Input
            aria-describedby={
              budgetInvalid ? `${baseId}-budget-error` : undefined
            }
            aria-invalid={budgetInvalid}
            id={`${baseId}-budget`}
            inputMode="decimal"
            onChange={(event) => setBudget(event.target.value)}
            placeholder="No budget"
            value={budget}
          />
          {budgetInvalid ? (
            <p
              className="text-negative text-lg leading-7"
              id={`${baseId}-budget-error`}
              role="alert"
            >
              Enter an amount such as 60.00, or leave it blank for no budget.
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-preferences`}>
          Preferences, one per line
        </Label>
        <Textarea
          id={`${baseId}-preferences`}
          onChange={(event) => setPreferences(event.target.value)}
          placeholder={"Low-sodium where possible\nStore brand is fine"}
          rows={3}
          value={preferences}
        />
        <p className="text-muted-foreground text-lg leading-7">
          Brands you like, things to avoid, or dietary needs. Up to 10.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={budgetInvalid} type="submit">
          Save details
        </Button>
        <Button onClick={onDone} type="button" variant="ghost">
          Cancel
        </Button>
        <Button
          className="sm:ml-auto"
          onClick={onDelete}
          type="button"
          variant="destructive"
        >
          <Trash2Icon />
          Delete list
        </Button>
      </div>
    </form>
  );
};

/** Ticked items sink to the bottom; stored order is kept, so unticking puts them back. */
const shoppingOrder = (items: GroceryItem[]): GroceryItem[] => [
  ...items.filter((item) => !item.checked),
  ...items.filter((item) => item.checked),
];

interface ListActions {
  onCopy: () => void;
  onDelete: () => void;
  onFinish: () => void;
  onReopen: () => void;
  onToggleUsual: () => void;
}

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xl leading-7 font-semibold">{children}</h3>
);

/** Unticking everything can't be undone item by item, so it asks first. */
const UnmarkDialog = ({
  finalFocus,
  list,
  onClose,
  onUnmarked,
  open,
}: {
  finalFocus: () => HTMLElement | null;
  list: Doc<"groceryLists">;
  onClose: () => void;
  onUnmarked: () => void;
  open: boolean;
}) => {
  const unmarkAll = useMutation(api.groceries.unmarkAll);
  const [resetting, setResetting] = useState(false);
  const inCart = list.items.filter((item) => item.checked).length;

  return (
    <Dialog
      description={`This unticks ${inCart === 1 ? "the 1 item" : `all ${inCart} items`} in your cart, so the list is ready for another trip.`}
      finalFocus={finalFocus}
      onOpenChange={(next) => {
        if (!next && !resetting) {
          onClose();
        }
      }}
      open={open}
      title="Unmark every item?"
    >
      <div className="flex flex-wrap gap-3">
        <Button disabled={resetting} onClick={onClose} variant="outline">
          Keep them ticked
        </Button>
        <Button
          aria-busy={resetting}
          disabled={resetting}
          onClick={async () => {
            setResetting(true);

            try {
              await unmarkAll({ listId: list._id });
              onUnmarked();
              onClose();
            } catch (error) {
              toast.error(errorText(error));
            }

            setResetting(false);
          }}
        >
          <RotateCcwIcon />
          {resetting ? "Unmarking…" : "Unmark all"}
        </Button>
      </div>
    </Dialog>
  );
};

/** Finishing, unmarking, and reusing, kept below the list so the top stays calm. */
const TripActions = ({
  actions,
  list,
  tools,
}: {
  actions: ListActions;
  list: Doc<"groceryLists">;
  tools: ReactNode;
}) => {
  const { onCopy, onFinish, onToggleUsual } = actions;
  const [confirmingUnmark, setConfirmingUnmark] = useState(false);
  const unmarkButton = useRef<HTMLButtonElement>(null);
  const finishButton = useRef<HTMLButtonElement>(null);
  // Unmarking disables its own button, so focus lands on Finish instead.
  const unmarked = useRef(false);
  const hasMarkedItems = list.items.some((item) => item.checked);
  const allInCart = hasMarkedItems && list.items.every((item) => item.checked);
  const archived = list.archivedAt !== undefined;

  return (
    <>
      <UnmarkDialog
        finalFocus={() =>
          unmarked.current ? finishButton.current : unmarkButton.current
        }
        list={list}
        onClose={() => setConfirmingUnmark(false)}
        onUnmarked={() => {
          unmarked.current = true;
        }}
        open={confirmingUnmark}
      />
      {archived ? null : (
        <section
          aria-label="Done shopping?"
          className="border-rule flex flex-col gap-3 border-t pt-5"
        >
          <SectionHeading>Done shopping?</SectionHeading>
          {allInCart ? (
            <p className="text-lg leading-7">Everything is in your cart.</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onFinish}
              ref={finishButton}
              variant={allInCart ? "default" : "outline"}
            >
              <CheckCheckIcon />
              Finish this trip
            </Button>
            <Button
              disabled={!hasMarkedItems}
              onClick={() => {
                unmarked.current = false;
                setConfirmingUnmark(true);
              }}
              ref={unmarkButton}
              variant="outline"
            >
              <RotateCcwIcon />
              Unmark all
            </Button>
          </div>
          <p className="text-muted-foreground text-base">
            Finishing moves this list to Past lists, where you can reuse it
            later.
          </p>
        </section>
      )}
      <section
        aria-label="Take your list with you"
        className="border-rule flex flex-col gap-3 border-t pt-5"
      >
        <SectionHeading>Take your list with you</SectionHeading>
        {tools}
      </section>
      <section
        aria-label="Use this list again"
        className="border-rule flex flex-col gap-3 border-t pt-5"
      >
        <SectionHeading>Use this list again</SectionHeading>
        <div className="flex flex-wrap gap-3">
          <Button
            className="whitespace-normal"
            disabled={list.items.length === 0}
            onClick={onCopy}
            variant="outline"
          >
            <CopyPlusIcon />
            Start a new list from this one
          </Button>
          <Button
            aria-pressed={list.usual === true}
            className="whitespace-normal"
            onClick={onToggleUsual}
            variant="outline"
          >
            <StarIcon className={list.usual ? "fill-current" : undefined} />
            {list.usual ? "This is your usual list" : "Make this my usual list"}
          </Button>
        </div>
        <p className="text-muted-foreground text-base">
          {list.usual
            ? "New lists can start from this one. Press again to stop."
            : "Your usual list is what you need most weeks. Each new list can start from it."}
        </p>
      </section>
    </>
  );
};

/** One list: items to tick off, its details, and what to do when the trip is over. */
const ListEditor = ({
  actions,
  finishedOn,
  list,
  tools,
}: {
  actions: ListActions;
  finishedOn: string | null;
  list: Doc<"groceryLists">;
  tools: ReactNode;
}) => {
  const { onCopy, onDelete, onReopen, onToggleUsual } = actions;
  const [editingDetails, setEditingDetails] = useState(false);
  const detailsTrigger = useRef<HTMLButtonElement>(null);
  const itemList = useRef<HTMLUListElement>(null);
  const refocusAt = useRef<number | null>(null);
  const inCart = list.items.filter((item) => item.checked).length;
  const toGet = list.items.length - inCart;
  const ordered = shoppingOrder(list.items);

  // A ticked item moves to the bottom; keep focus at the same spot so a
  // keyboard or screen reader user carries on with the next item.
  useEffect(() => {
    const index = refocusAt.current;
    refocusAt.current = null;

    const { activeElement } = document;

    const focusInList =
      activeElement === document.body ||
      itemList.current?.contains(activeElement) === true;

    if (index === null || !focusInList) {
      return;
    }

    const boxes =
      itemList.current?.querySelectorAll<HTMLElement>('[role="checkbox"]');

    boxes?.[Math.min(index, boxes.length - 1)]?.focus();
  });

  return (
    <div className="@container flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        {/* With large text the name needs the full width, so the buttons wrap below it. */}
        <div className="flex flex-wrap items-start gap-2">
          <h2 className="min-w-[min(100%,12rem)] flex-1 text-2xl leading-8 font-semibold break-words">
            {list.name}
          </h2>
          <Button
            aria-label="Usual list"
            aria-pressed={list.usual === true}
            className="-my-2 shrink-0"
            onClick={onToggleUsual}
            size="icon"
            title={list.usual ? "Your usual list" : "Make this your usual list"}
            variant="ghost"
          >
            <StarIcon className={list.usual ? "fill-current" : undefined} />
          </Button>
          <Button
            aria-controls="grocery-details"
            aria-expanded={editingDetails}
            className="max-sm:size-control -my-2 shrink-0 max-sm:px-0"
            onClick={() => setEditingDetails((open) => !open)}
            ref={detailsTrigger}
            title="Edit list details"
            variant="outline"
          >
            <PencilIcon />
            <span className="max-sm:sr-only">Edit details</span>
          </Button>
        </div>
        <p className="text-lg">
          {toGet} {toGet === 1 ? "item" : "items"} to get
          {inCart > 0 ? ` · ${inCart} in your cart` : null}
        </p>
      </div>
      {finishedOn === null ? null : (
        <div className="bg-surface flex flex-col gap-3 rounded-xl p-5">
          <p className="text-lg leading-7">
            You finished this trip on {finishedOn}. It is kept under Past lists
            so you can reuse it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              className="whitespace-normal"
              disabled={list.items.length === 0}
              onClick={onCopy}
            >
              <CopyPlusIcon />
              Start a new list from this one
            </Button>
            <Button
              className="whitespace-normal"
              onClick={onReopen}
              variant="outline"
            >
              <ArchiveRestoreIcon />
              Move back to current lists
            </Button>
            <Button
              className="text-negative whitespace-normal"
              onClick={onDelete}
              variant="outline"
            >
              <Trash2Icon />
              Delete permanently
            </Button>
          </div>
        </div>
      )}
      <div
        className={editingDetails ? undefined : "hidden"}
        id="grocery-details"
      >
        {editingDetails ? (
          <DetailsForm
            list={list}
            onDelete={onDelete}
            onDone={() => {
              setEditingDetails(false);
              detailsTrigger.current?.focus();
            }}
          />
        ) : null}
      </div>
      <details>
        <summary className="min-h-control cursor-pointer py-3 text-lg font-medium">
          Add items
        </summary>
        <AddItemForm listId={list._id} />
      </details>
      {list.items.length === 0 ? (
        <EmptyNote>
          Nothing on this list yet. Open Add items to add the first item.
        </EmptyNote>
      ) : (
        <ul aria-label={`Items on ${list.name}`} ref={itemList}>
          {ordered.map((item, index) => (
            <ItemRow
              item={item}
              key={item.id}
              listId={list._id}
              onToggle={() => {
                refocusAt.current = index;
              }}
            />
          ))}
        </ul>
      )}
      <p className="text-muted-foreground text-lg leading-7">
        Tick an item when it is in your cart. It moves to the bottom, stays in
        the total, and is left out when you copy or print the list.
      </p>
      {list.preferences.length > 0 ? (
        <ul
          aria-label="List preferences"
          className="text-muted-foreground flex list-inside list-disc flex-col gap-1 text-lg leading-7"
        >
          {list.preferences.map((preference) => (
            <li key={preference}>{preference}</li>
          ))}
        </ul>
      ) : null}
      <TripActions actions={actions} list={list} tools={tools} />
    </div>
  );
};

export { ListEditor, UNDO_WINDOW_MS, listAsText, quantityWords, shoppingOrder };

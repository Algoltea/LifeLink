"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import {
  groceryQuantityError,
  groceryUnit,
} from "@lifelink/contracts/groceries";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation } from "convex/react";
import { PlusIcon, RotateCcwIcon, Trash2Icon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useRef, useState } from "react";
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
}: {
  item: GroceryItem;
  listId: Doc<"groceryLists">["_id"];
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
    <li className="border-rule flex items-center gap-4 border-t py-3">
      <Checkbox
        checked={item.checked}
        id={checkboxId}
        onCheckedChange={async (checked) => {
          try {
            await updateItem({ checked, itemId: item.id, listId });
          } catch (error) {
            toast.error(errorText(error));
          }
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Label
          className={
            item.checked
              ? "text-muted-foreground cursor-pointer line-through"
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
      className="bg-surface flex flex-col gap-4 rounded-xl p-5"
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

/** One list: items to tick off, its details, and its preferences. */
const ListEditor = ({
  list,
  onDelete,
  summary,
}: {
  list: Doc<"groceryLists">;
  onDelete: () => void;
  summary: ReactNode;
}) => {
  const [editingDetails, setEditingDetails] = useState(false);
  const details = useRef<HTMLDetailsElement>(null);
  const detailsTrigger = useRef<HTMLElement>(null);
  const [resetting, setResetting] = useState(false);
  const unmarkAll = useMutation(api.groceries.unmarkAll);
  const hasMarkedItems = list.items.some((item) => item.checked);
  const inCart = list.items.filter((item) => item.checked).length;
  const toGet = list.items.length - inCart;

  return (
    <div className="@container flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl leading-8 font-semibold">{list.name}</h2>
          <p className="text-lg">
            {toGet} {toGet === 1 ? "item" : "items"} to get
            {inCart > 0 ? ` · ${inCart} in your cart` : null}
          </p>
        </div>
      </div>
      {summary}
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
        <ul aria-label={`Items on ${list.name}`}>
          {list.items.map((item) => (
            <ItemRow item={item} key={item.id} listId={list._id} />
          ))}
        </ul>
      )}
      <p className="text-muted-foreground text-lg leading-7">
        Tick an item when it is in your cart. It stays in the total, and is left
        out when you copy or print the list.
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
      <details
        ref={details}
        onToggle={(event) => setEditingDetails(event.currentTarget.open)}
      >
        <summary
          className="min-h-control cursor-pointer py-3 text-lg font-medium"
          ref={detailsTrigger}
        >
          Edit list details
        </summary>
        {editingDetails ? (
          <DetailsForm
            list={list}
            onDelete={onDelete}
            onDone={() => {
              if (details.current) {
                details.current.open = false;
              }

              setEditingDetails(false);
              detailsTrigger.current?.focus();
            }}
          />
        ) : null}
      </details>
      {list.items.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            aria-busy={resetting}
            aria-describedby="grocery-reset-help"
            disabled={!hasMarkedItems || resetting}
            onClick={async () => {
              setResetting(true);

              try {
                await unmarkAll({ listId: list._id });
              } catch (error) {
                toast.error(errorText(error));
              }

              setResetting(false);
            }}
            variant="outline"
          >
            <RotateCcwIcon />
            {resetting ? "Unmarking…" : "Unmark all"}
          </Button>
          <p
            className="text-muted-foreground text-base"
            id="grocery-reset-help"
          >
            {hasMarkedItems
              ? "Reuse this list for your next shopping trip."
              : "All items are already unmarked."}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export { ListEditor, listAsText, quantityWords };

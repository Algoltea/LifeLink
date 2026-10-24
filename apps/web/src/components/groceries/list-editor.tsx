"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation } from "convex/react";
import { PlusIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { EmptyNote } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { money } from "@/lib/format";

import { centsFromDollars, dollarsFromCents } from "./amounts";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type GroceryItem = Doc<"groceryLists">["items"][number];

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
  const checkboxId = useId();

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
            item.checked ? "text-muted-foreground line-through" : undefined
          }
          htmlFor={checkboxId}
        >
          {item.name}
          {item.checked ? (
            <span className="sr-only"> (already have it)</span>
          ) : null}
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
        onClick={async () => {
          try {
            await removeItem({ itemId: item.id, listId });
          } catch (error) {
            toast.error(errorText(error));
          }
        }}
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
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const baseId = useId();

  const priceInvalid =
    price.trim().length > 0 && centsFromDollars(price) === null;

  return (
    <form
      className="bg-surface grid gap-4 rounded-xl p-5 sm:grid-cols-3 sm:items-end"
      onSubmit={async (event) => {
        event.preventDefault();

        try {
          await addItem({
            estimatedCents: centsFromDollars(price),
            listId,
            name,
            quantity: quantity.trim().length === 0 ? null : Number(quantity),
            unit: unit.trim() || null,
          });
          setName("");
          setQuantity("");
          setUnit("");
          setPrice("");
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:col-span-3">
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
          id={`${baseId}-quantity`}
          inputMode="decimal"
          min={0}
          onChange={(event) => setQuantity(event.target.value)}
          step="any"
          type="number"
          value={quantity}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-unit`}>Unit</Label>
        <Input
          id={`${baseId}-unit`}
          onChange={(event) => setUnit(event.target.value)}
          placeholder="lb, dozen"
          value={unit}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-price`}>Estimate ($)</Label>
        <Input
          aria-describedby={priceInvalid ? `${baseId}-price-error` : undefined}
          aria-invalid={priceInvalid}
          id={`${baseId}-price`}
          inputMode="decimal"
          onChange={(event) => setPrice(event.target.value)}
          placeholder="3.50"
          value={price}
        />
      </div>
      {priceInvalid ? (
        <p
          className="text-negative text-lg leading-7 sm:col-span-3"
          id={`${baseId}-price-error`}
          role="alert"
        >
          Enter an amount such as 3.50, or leave the estimate blank.
        </p>
      ) : null}
      <Button
        className="justify-self-start sm:col-span-3"
        disabled={name.trim().length === 0 || priceInvalid}
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
}: {
  list: Doc<"groceryLists">;
  onDone: () => void;
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
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </form>
  );
};

/** One list: items to tick off, an estimate against the budget, and its preferences. */
const ListEditor = ({ list }: { list: Doc<"groceryLists"> }) => {
  const [editingDetails, setEditingDetails] = useState(false);
  const open = list.items.filter((item) => !item.checked);
  const guessed = open.filter((item) => item.estimatedCents !== null);

  const estimate = guessed.reduce(
    (total, item) => total + (item.estimatedCents ?? 0),
    0
  );

  const overBudget = list.budgetCents !== null && estimate > list.budgetCents;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl leading-8 font-semibold">{list.name}</h2>
          <p className="text-lg">
            {open.length} {open.length === 1 ? "item" : "items"} to buy
            {guessed.length > 0
              ? ` · your guesses add up to ${money(estimate)}`
              : ""}
            {guessed.length > 0 && guessed.length < open.length
              ? " (some items have no guess)"
              : ""}
          </p>
          <p
            className={
              overBudget
                ? "text-negative text-lg font-semibold"
                : "text-muted-foreground text-base"
            }
          >
            {list.budgetCents === null
              ? "No budget set."
              : `Budget ${money(list.budgetCents)}.`}
            {overBudget ? " Your guesses are over budget." : ""}
          </p>
        </div>
        {editingDetails ? null : (
          <Button onClick={() => setEditingDetails(true)} variant="outline">
            Edit list details
          </Button>
        )}
      </div>
      {editingDetails ? (
        <DetailsForm list={list} onDone={() => setEditingDetails(false)} />
      ) : null}
      {list.preferences.length > 0 && !editingDetails ? (
        <ul className="text-muted-foreground flex list-inside list-disc flex-col gap-1 text-lg leading-7">
          {list.preferences.map((preference) => (
            <li key={preference}>{preference}</li>
          ))}
        </ul>
      ) : null}
      <AddItemForm listId={list._id} />
      {list.items.length === 0 ? (
        <EmptyNote>
          Nothing on this list yet. Add the first item above.
        </EmptyNote>
      ) : (
        <ul aria-label={`Items on ${list.name}`}>
          {list.items.map((item) => (
            <ItemRow item={item} key={item.id} listId={list._id} />
          ))}
        </ul>
      )}
      <p className="text-muted-foreground text-lg leading-7">
        Tick an item when you already have it; ticked items are left out when
        you copy or print the list.
      </p>
    </div>
  );
};

export { ListEditor, listAsText, quantityWords };

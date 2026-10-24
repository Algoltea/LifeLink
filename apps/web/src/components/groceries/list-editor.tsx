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
import { currentMessages, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
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

  const unit =
    item.unit === null
      ? null
      : (currentMessages().groceries.units[item.unit]?.short ?? item.unit);

  return unit ? `${item.quantity} ${unit}` : `× ${item.quantity}`;
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
      ? `\n\n${currentMessages().groceries.notes(list.preferences.join("; "))}`
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
  const t = useMessages().groceries;

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
            quantityWords(item),
            item.estimatedCents === null
              ? ""
              : t.about(money(item.estimatedCents)),
          ]
            .filter((part) => part.length > 0)
            .join(" · ")}
        </span>
      </div>
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

const AddItemForm = ({ listId }: { listId: Doc<"groceryLists">["_id"] }) => {
  const addItem = useMutation(api.groceries.addItem);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const baseId = useId();
  const t = useMessages().groceries;

  const priceInvalid =
    price.trim().length > 0 && centsFromDollars(price) === null;

  const rawQuantityError = groceryQuantityError(Number(quantity), unit);

  const quantityError =
    rawQuantityError === null ? null : translateServerMessage(rawQuantityError);

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
        <Label htmlFor={`${baseId}-name`}>{t.item}</Label>
        <Input
          id={`${baseId}-name`}
          onChange={(event) => setName(event.target.value)}
          placeholder={t.itemPlaceholder}
          value={name}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-quantity`}>{t.quantity}</Label>
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
        <Label htmlFor={`${baseId}-unit`}>{t.unit}</Label>
        <UnitSelect
          id={`${baseId}-unit`}
          onValueChange={setUnit}
          value={unit}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-price`}>{t.totalEstimate}</Label>
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
        {t.estimateHelp}
      </p>
      {priceInvalid ? (
        <p
          className="text-negative text-lg leading-7 @min-[32em]:col-span-3"
          id={`${baseId}-price-error`}
          role="alert"
        >
          {t.estimateInvalid}
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
        {t.addItem}
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
  const t = useMessages().groceries;

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
          toast.success(t.detailsSaved);
          onDone();
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <div className="grid gap-4 @min-[32em]:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-name`}>{t.listName}</Label>
          <Input
            id={`${baseId}-name`}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-budget`}>{t.budgetLabel}</Label>
          <Input
            aria-describedby={
              budgetInvalid ? `${baseId}-budget-error` : undefined
            }
            aria-invalid={budgetInvalid}
            id={`${baseId}-budget`}
            inputMode="decimal"
            onChange={(event) => setBudget(event.target.value)}
            placeholder={t.noBudget}
            value={budget}
          />
          {budgetInvalid ? (
            <p
              className="text-negative text-lg leading-7"
              id={`${baseId}-budget-error`}
              role="alert"
            >
              {t.budgetInvalid}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${baseId}-preferences`}>{t.preferences}</Label>
        <Textarea
          id={`${baseId}-preferences`}
          onChange={(event) => setPreferences(event.target.value)}
          placeholder={t.preferencesPlaceholder}
          rows={3}
          value={preferences}
        />
        <p className="text-muted-foreground text-lg leading-7">
          {t.preferencesHint}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={budgetInvalid} type="submit">
          {t.saveDetails}
        </Button>
        <Button onClick={onDone} type="button" variant="ghost">
          {t.cancel}
        </Button>
        <Button
          className="sm:ml-auto"
          onClick={onDelete}
          type="button"
          variant="destructive"
        >
          <Trash2Icon />
          {t.deleteList}
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
  const t = useMessages().groceries;
  const inCart = list.items.filter((item) => item.checked).length;

  return (
    <Dialog
      description={t.unmarkDescription(inCart)}
      finalFocus={finalFocus}
      onOpenChange={(next) => {
        if (!next && !resetting) {
          onClose();
        }
      }}
      open={open}
      title={t.unmarkTitle}
    >
      <div className="flex flex-wrap gap-3">
        <Button disabled={resetting} onClick={onClose} variant="outline">
          {t.keepTicked}
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
          {resetting ? t.unmarking : t.unmarkAll}
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
  const t = useMessages().groceries;

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
          aria-label={t.doneShopping}
          className="border-rule flex flex-col gap-3 border-t pt-5"
        >
          <SectionHeading>{t.doneShopping}</SectionHeading>
          {allInCart ? (
            <p className="text-lg leading-7">{t.allInCart}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onFinish}
              ref={finishButton}
              variant={allInCart ? "default" : "outline"}
            >
              <CheckCheckIcon />
              {t.finishTrip}
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
              {t.unmarkAll}
            </Button>
          </div>
          <p className="text-muted-foreground text-base">{t.finishHint}</p>
        </section>
      )}
      <section
        aria-label={t.takeWithYou}
        className="border-rule flex flex-col gap-3 border-t pt-5"
      >
        <SectionHeading>{t.takeWithYou}</SectionHeading>
        {tools}
      </section>
      <section
        aria-label={t.useAgain}
        className="border-rule flex flex-col gap-3 border-t pt-5"
      >
        <SectionHeading>{t.useAgain}</SectionHeading>
        <div className="flex flex-wrap gap-3">
          <Button
            className="whitespace-normal"
            disabled={list.items.length === 0}
            onClick={onCopy}
            variant="outline"
          >
            <CopyPlusIcon />
            {t.startFromThis}
          </Button>
          <Button
            aria-pressed={list.usual === true}
            className="whitespace-normal"
            onClick={onToggleUsual}
            variant="outline"
          >
            <StarIcon className={list.usual ? "fill-current" : undefined} />
            {list.usual ? t.thisIsUsual : t.makeUsual}
          </Button>
        </div>
        <p className="text-muted-foreground text-base">
          {list.usual ? t.usualOnHint : t.usualHint}
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
  const t = useMessages().groceries;

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
        <div className="flex max-w-xl flex-wrap items-start gap-2 xl:max-w-none">
          <h2 className="min-w-[min(100%,12rem)] flex-1 text-2xl leading-8 font-semibold break-words">
            {list.name}
          </h2>
          <Button
            aria-label={t.usual}
            aria-pressed={list.usual === true}
            className="-my-2 shrink-0"
            onClick={onToggleUsual}
            size="icon"
            title={list.usual ? t.yourUsual : t.makeUsualTitle}
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
            title={t.editListDetails}
            variant="outline"
          >
            <PencilIcon />
            <span className="max-sm:sr-only">{t.editDetails}</span>
          </Button>
        </div>
        <p className="text-lg">
          {t.toGet(toGet)}
          {inCart > 0 ? t.inCart(inCart) : null}
        </p>
      </div>
      {finishedOn === null ? null : (
        <div className="bg-surface flex flex-col gap-3 rounded-xl p-5">
          <p className="text-lg leading-7">{t.finishedNote(finishedOn)}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              className="whitespace-normal"
              disabled={list.items.length === 0}
              onClick={onCopy}
            >
              <CopyPlusIcon />
              {t.startFromThis}
            </Button>
            <Button
              className="whitespace-normal"
              onClick={onReopen}
              variant="outline"
            >
              <ArchiveRestoreIcon />
              {t.moveBack}
            </Button>
            <Button
              className="text-negative whitespace-normal"
              onClick={onDelete}
              variant="outline"
            >
              <Trash2Icon />
              {t.deletePermanently}
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
          {t.addItems}
        </summary>
        <AddItemForm listId={list._id} />
      </details>
      {list.items.length === 0 ? (
        <EmptyNote>{t.nothingOnListHint}</EmptyNote>
      ) : (
        <ul aria-label={t.itemsOn(list.name)} ref={itemList}>
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
      <p className="text-muted-foreground text-lg leading-7">{t.tickHint}</p>
      {list.preferences.length > 0 ? (
        <ul
          aria-label={t.listPreferences}
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

"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { groceryListLimit } from "@lifelink/contracts/groceries";
import { parseGroceryList } from "@lifelink/contracts/grocery-paste";
import { Button } from "@lifelink/ui/components/button";
import { Dialog } from "@lifelink/ui/components/dialog";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { useLocale, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

import { quantityWords } from "./list-text";

/** Paste a whole list from a note or message; each line becomes an item. */
const QuickAddDialog = ({
  list,
  onClose,
  open,
}: {
  list: Doc<"groceryLists">;
  onClose: () => void;
  open: boolean;
}) => {
  const addItems = useMutation(api.groceries.addItems);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const baseId = useId();
  const locale = useLocale();
  const messages = useMessages().groceries;
  const t = messages.quickAdd;

  const items = parseGroceryList(text);
  const room = groceryListLimit - list.items.length;
  const tooMany = items.length > room;

  return (
    <Dialog
      description={t.description}
      onOpenChange={(next) => {
        if (!next && !adding) {
          onClose();
        }
      }}
      open={open}
      title={t.title}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault();

          if (items.length === 0 || tooMany) {
            return;
          }

          setAdding(true);

          try {
            const added = await addItems({ items, listId: list._id });
            toast.success(t.added(added));
            setText("");
            onClose();
          } catch (error) {
            toast.error(messageOf(error instanceof Error ? error : null));
          }

          setAdding(false);
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-text`}>{t.label}</Label>
          <Textarea
            aria-describedby={`${baseId}-preview`}
            className="max-h-[30svh]"
            id={`${baseId}-text`}
            onChange={(event) => setText(event.target.value)}
            placeholder={t.placeholder}
            rows={5}
            value={text}
          />
        </div>
        <div
          aria-live="polite"
          className="flex flex-col gap-2"
          id={`${baseId}-preview`}
        >
          <p className="text-lg leading-7 font-medium">
            {items.length === 0 ? t.none : t.preview(items.length)}
          </p>
          {items.length > 0 ? (
            <ul className="bg-surface flex max-h-48 flex-col overflow-y-auto rounded-xl px-4 py-2">
              {items.map((item, index) => (
                <li
                  className="border-rule flex items-baseline justify-between gap-3 border-b py-2 text-base last:border-b-0"
                  // Pasted lines can repeat, and their order never changes here.
                  // oxlint-disable-next-line no-array-index-key
                  key={`${index}-${item.name}`}
                >
                  <span className="min-w-0 break-words">{item.name}</span>
                  <span className="text-muted-foreground shrink-0">
                    {quantityWords(item, locale)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {tooMany ? (
            <p className="text-negative text-lg leading-7" role="alert">
              {t.tooMany(Math.max(room, 0))}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            aria-busy={adding}
            disabled={adding || items.length === 0 || tooMany}
            type="submit"
          >
            <PlusIcon />
            {adding ? t.adding : t.submit(items.length)}
          </Button>
          <Button
            disabled={adding}
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            {messages.cancel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export { QuickAddDialog };

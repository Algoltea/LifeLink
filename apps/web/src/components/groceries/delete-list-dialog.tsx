"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Dialog } from "@lifelink/ui/components/dialog";
import { useMutation } from "convex/react";
import { Trash2Icon } from "lucide-react";
import type { ComponentProps } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { messageOf } from "@/lib/errors";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

/** Permanent deletion, shared by the list screen and the past lists page. */
const DeleteListDialog = ({
  finalFocus,
  onClose,
  onDeleted,
  target,
}: {
  finalFocus: ComponentProps<typeof Dialog>["finalFocus"];
  onClose: () => void;
  onDeleted?: (listId: Id<"groceryLists">) => void;
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
              onDeleted?.(target._id);
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

export { DeleteListDialog };

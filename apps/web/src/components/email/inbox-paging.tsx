"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { INBOX_PAGE_SIZE } from "@lifelink/contracts/inbox";
import { Button } from "@lifelink/ui/components/button";
import { useAction, useConvex, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { messageOf } from "@/lib/errors";

const InboxPaging = ({
  page,
  cursors,
  onNavigate,
}: {
  page: FunctionReturnType<typeof api.emails.page> | undefined;
  cursors: (string | null)[];
  onNavigate: (next: (string | null)[]) => void;
}) => {
  const olderAvailable = useQuery(api.emails.olderAvailable);
  const loadOlder = useAction(api.emails.refresh);
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const convex = useConvex();
  let olderLabel = page?.isDone ? "Load older emails" : "Older emails";

  if (busy) {
    olderLabel = "Loading…";
  }

  const next = async (): Promise<void> => {
    if (!page) {
      return;
    }

    setOperationError(null);

    if (!page.isDone) {
      onNavigate([...cursors, page.continueCursor]);

      return;
    }

    setBusy(true);

    try {
      const result = await loadOlder({ older: true });

      if (result.errors.length > 0) {
        setOperationError(result.errors.join(" "));
      }

      if (result.added > 0) {
        const updated = await convex.query(api.emails.page, {
          paginationOpts: {
            cursor: cursors.at(-1) ?? null,
            numItems: INBOX_PAGE_SIZE,
          },
        });

        if (!updated.isDone) {
          onNavigate([...cursors, updated.continueCursor]);
        }
      } else if (result.added === 0 && result.errors.length === 0) {
        toast.info(
          "No additional emails imported. Try the next batch if older emails are still available."
        );
      }
    } catch (error) {
      setOperationError(messageOf(error instanceof Error ? error : null));
    }

    setBusy(false);
  };

  return (
    <div className="border-rule mt-4 flex flex-col gap-3 border-t px-3 pt-4">
      <p aria-live="polite" className="text-muted-foreground text-label">
        Page {cursors.length} · Up to 15 emails at a time
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={cursors.length === 1 || busy || page === undefined}
          onClick={() => {
            setOperationError(null);
            onNavigate(cursors.slice(0, -1));
          }}
          size="sm"
          variant="outline"
        >
          <ChevronLeftIcon aria-hidden="true" />
          Newer
        </Button>
        <Button
          aria-busy={busy}
          disabled={
            busy ||
            page === undefined ||
            (page.isDone && olderAvailable !== true)
          }
          onClick={next}
          size="sm"
          variant="outline"
        >
          {olderLabel}
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
      {page?.isDone && olderAvailable === false ? (
        <p className="text-muted-foreground text-label">
          No older emails available.
        </p>
      ) : null}
      {operationError ? (
        <p className="text-negative text-label" role="alert">
          {operationError}
        </p>
      ) : null}
    </div>
  );
};

export { InboxPaging };

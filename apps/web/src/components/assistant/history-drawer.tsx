"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import type { FunctionReturnType } from "convex/server";
import { HistoryIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { ErrorNote, LoadingRows } from "@/components/app/states";

type Conversation = FunctionReturnType<
  typeof api.assistant.listConversations
>[number];

const historyDate = (timestamp: number): string =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(timestamp);

/** Base UI owns focus trapping, Escape, backdrop dismissal and return focus. */
const HistoryDrawer = ({
  activeThreadId,
  busy,
  conversations,
  error,
  historyStatus,
  loadMore,
  onNew,
  onSelect,
}: {
  activeThreadId: string | null | undefined;
  busy: boolean;
  conversations: Conversation[] | undefined;
  error: string | null;
  historyStatus:
    | "CanLoadMore"
    | "Exhausted"
    | "LoadingFirstPage"
    | "LoadingMore";
  loadMore: () => void;
  onNew: () => Promise<boolean>;
  onSelect: (threadId: string) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger render={<Button variant="outline" />}>
        <HistoryIcon aria-hidden="true" />
        History
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup
          aria-modal="true"
          className="border-border bg-background text-foreground fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="text-2xl font-semibold">
              Chat history
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close chat history"
              render={<Button size="icon" variant="ghost" />}
            >
              <XIcon aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-muted-foreground mt-2 text-base">
            Your conversations with LifeLink. Choose one to pick up where you
            left off.
          </Dialog.Description>
          <Button
            aria-busy={busy}
            className="mt-6 self-start"
            disabled={busy || activeThreadId === undefined}
            onClick={async () => {
              if (await onNew()) {
                setOpen(false);
              }
            }}
            variant="outline"
          >
            <PlusIcon aria-hidden="true" />
            New chat
          </Button>
          {error ? (
            <div className="mt-4">
              <ErrorNote>{error}</ErrorNote>
            </div>
          ) : null}
          <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-5">
            {conversations === undefined ? (
              <LoadingRows label="Loading your chat history" />
            ) : null}
            {conversations?.length === 0 ? (
              <p className="text-muted-foreground text-lg">
                No conversations yet. Your first chat will be saved here.
              </p>
            ) : null}
            <ul
              aria-label="Saved conversations"
              className="flex flex-col gap-2"
            >
              {conversations?.map((conversation) => {
                const active = conversation.threadId === activeThreadId;

                return (
                  <li key={conversation.threadId}>
                    <button
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "hover:bg-surface flex min-h-16 w-full flex-col gap-1 rounded-lg px-4 py-3 text-left disabled:cursor-wait",
                        active && "bg-surface"
                      )}
                      disabled={busy}
                      onClick={async () => {
                        if (active || (await onSelect(conversation.threadId))) {
                          setOpen(false);
                        }
                      }}
                      type="button"
                    >
                      <span className="line-clamp-2 text-lg font-semibold wrap-anywhere">
                        {conversation.title}
                      </span>
                      <span className="text-muted-foreground text-base">
                        <time
                          dateTime={new Date(
                            conversation.updatedAt
                          ).toISOString()}
                        >
                          {historyDate(conversation.updatedAt)}
                        </time>
                        {active ? " · Current chat" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {historyStatus === "CanLoadMore" ||
            historyStatus === "LoadingMore" ? (
              <Button
                aria-busy={historyStatus === "LoadingMore"}
                className="mt-4 w-full"
                disabled={historyStatus === "LoadingMore"}
                onClick={loadMore}
                variant="ghost"
              >
                {historyStatus === "LoadingMore"
                  ? "Loading conversations…"
                  : "Show earlier conversations"}
              </Button>
            ) : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { HistoryDrawer };

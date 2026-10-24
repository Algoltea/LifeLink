"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import type { FunctionReturnType } from "convex/server";
import { HistoryIcon, SquarePenIcon, XIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { ErrorNote, LoadingRows } from "@/components/app/states";
import { listTime } from "@/components/email/email-bits";
import { useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { DAY, MINUTE, relativeDay } from "@/lib/format";
import { subscribeToClock } from "@/lib/greeting";

type Conversation = FunctionReturnType<
  typeof api.assistant.listConversations
>[number];

const WEEK_DAYS = 7;

const GROUP_ORDER = ["today", "yesterday", "thisWeek", "earlier"] as const;

type Group = (typeof GROUP_ORDER)[number];

// The minute is enough for "Today" and relative times, and keeps the snapshot stable.
const currentMinute = (): number => Math.floor(Date.now() / MINUTE) * MINUTE;

const serverMinute = (): number => 0;

const groupOf = (
  updatedAt: number,
  timeZone: string,
  now: number,
  t: Messages
): Group => {
  const day = relativeDay(updatedAt, timeZone, now);

  if (day === t.format.today) {
    return "today";
  }

  if (day === t.format.yesterday) {
    return "yesterday";
  }

  return now - updatedAt < WEEK_DAYS * DAY ? "thisWeek" : "earlier";
};

const groupLabel = (group: Group, t: Messages): string => {
  if (group === "today" || group === "yesterday") {
    return t.format[group];
  }

  return t.ask.historyGroups[group];
};

/** Saved chats, newest first, under the same day headings people know from other chat apps. */
const groupConversations = (
  conversations: Conversation[],
  timeZone: string,
  now: number,
  t: Messages
): { group: Group; items: Conversation[] }[] => {
  const buckets = new Map<Group, Conversation[]>();

  for (const conversation of conversations) {
    const group = groupOf(conversation.updatedAt, timeZone, now, t);
    const bucket = buckets.get(group) ?? [];
    bucket.push(conversation);
    buckets.set(group, bucket);
  }

  return GROUP_ORDER.flatMap((group) => {
    const items = buckets.get(group);

    return items ? [{ group, items }] : [];
  });
};

const ROW =
  "flex min-h-control w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors disabled:cursor-wait";

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
  timeZone,
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
  timeZone: string;
}) => {
  const [open, setOpen] = useState(false);
  const messages = useMessages();
  const t = messages.ask;

  const now = useSyncExternalStore(
    subscribeToClock,
    currentMinute,
    serverMinute
  );

  // Empty chats only pile up as "New conversation"; keep just the one that is open.
  const saved = conversations?.filter(
    (conversation) =>
      conversation.hasMessages || conversation.threadId === activeThreadId
  );

  const groups = saved
    ? groupConversations(saved, timeZone, now, messages)
    : [];

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger render={<Button variant="ghost" />}>
        <HistoryIcon aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">{t.history}</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[rgb(45_33_24/0.18)] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          aria-modal="true"
          className="border-border bg-raised text-foreground fixed inset-y-3 right-3 z-50 flex w-[calc(100%-1.5rem)] max-w-[26rem] flex-col rounded-2xl border shadow-[0_1px_2px_rgb(45_33_24/0.05),0_16px_48px_rgb(45_33_24/0.16)] transition-[transform,opacity] duration-200 data-[ending-style]:translate-x-4 data-[ending-style]:opacity-0 data-[starting-style]:translate-x-4 data-[starting-style]:opacity-0 motion-reduce:transition-none"
        >
          <div className="flex items-center justify-between gap-4 px-5 pt-4">
            <Dialog.Title className="text-section font-semibold tracking-tight">
              {t.historyTitle}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t.closeHistory}
              render={<Button className="-mr-2" size="icon" variant="ghost" />}
            >
              <XIcon aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-muted-foreground text-label px-5">
            {t.historyDescription}
          </Dialog.Description>
          {error ? (
            <div className="px-5 pt-3">
              <ErrorNote>{error}</ErrorNote>
            </div>
          ) : null}
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
            <button
              className={cn(ROW, "hover:bg-parchment font-medium")}
              disabled={busy || activeThreadId === undefined}
              onClick={async () => {
                if (await onNew()) {
                  setOpen(false);
                }
              }}
              type="button"
            >
              <SquarePenIcon aria-hidden="true" className="size-5 shrink-0" />
              {t.newChat}
            </button>
            {saved === undefined ? (
              <div className="px-3 pt-3">
                <LoadingRows layout="history" label={t.loadingHistory} />
              </div>
            ) : null}
            {saved?.length === 0 ? (
              <p className="text-muted-foreground px-3 pt-4 text-lg">
                {t.historyEmpty}
              </p>
            ) : null}
            {groups.map(({ group, items }) => (
              <section aria-labelledby={`history-${group}`} key={group}>
                <h3
                  className="text-muted-foreground text-label px-3 pt-5 pb-1 font-medium"
                  id={`history-${group}`}
                >
                  {groupLabel(group, messages)}
                </h3>
                <ul className="flex flex-col gap-0.5">
                  {items.map((conversation) => {
                    const active = conversation.threadId === activeThreadId;

                    return (
                      <li key={conversation.threadId}>
                        <button
                          aria-current={active ? "true" : undefined}
                          className={cn(
                            ROW,
                            active ? "bg-neutral-wash" : "hover:bg-parchment"
                          )}
                          disabled={busy}
                          onClick={async () => {
                            if (
                              active ||
                              (await onSelect(conversation.threadId))
                            ) {
                              setOpen(false);
                            }
                          }}
                          type="button"
                        >
                          <span className="text-label line-clamp-2 flex-1 font-medium wrap-anywhere">
                            {translateServerMessage(conversation.title)}
                          </span>
                          <time
                            className="text-muted-foreground shrink-0 text-[0.833rem]"
                            dateTime={new Date(
                              conversation.updatedAt
                            ).toISOString()}
                          >
                            {listTime(conversation.updatedAt, timeZone, now)}
                          </time>
                          {active ? (
                            <span className="sr-only">{t.openNow}</span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {historyStatus === "CanLoadMore" ||
            historyStatus === "LoadingMore" ? (
              <Button
                aria-busy={historyStatus === "LoadingMore"}
                className="mt-3 w-full"
                disabled={historyStatus === "LoadingMore"}
                onClick={loadMore}
                variant="ghost"
              >
                {historyStatus === "LoadingMore"
                  ? t.loadingConversations
                  : t.loadEarlierConversations}
              </Button>
            ) : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { HistoryDrawer };

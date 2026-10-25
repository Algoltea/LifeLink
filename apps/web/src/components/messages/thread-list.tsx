"use client";

import type { api } from "@lifelink/backend/convex/_generated/api";
import { Pill } from "@lifelink/ui/components/pill";
import { cn } from "@lifelink/ui/lib/utils";
import type { FunctionReturnType } from "convex/server";
import { CircleAlertIcon, ClockIcon, TriangleAlertIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Avatar } from "@/components/app/bits";
import { LoadingRows } from "@/components/app/states";
import { listTime } from "@/components/email/email-bits";
import { useLocale, useMessages } from "@/i18n/locale";
import { formatWhen } from "@/lib/format";

import { previewOf } from "./message-bits";

type ThreadRow = FunctionReturnType<typeof api.messages.threads>[number];

/**
 * At most one status per row: a message that may not have gone out, one
 * waiting for approval, or no way to reach them.
 */
const RowStatus = ({ thread }: { thread: ThreadRow }) => {
  const { last } = thread;
  const t = useMessages().threads;

  if (
    last?.direction === "outgoing" &&
    (last.status === "failed" || last.status === "unknown")
  ) {
    return (
      <span className="flex pt-1.5">
        <Pill
          className="text-label max-w-full font-semibold whitespace-normal"
          tone="negative"
        >
          <CircleAlertIcon aria-hidden="true" className="size-4" />
          {last.status === "failed" ? t.notSent : t.notSureSent}
        </Pill>
      </span>
    );
  }

  if (thread.waiting > 0) {
    return (
      <span className="flex pt-1.5">
        <Pill
          className="text-label max-w-full font-semibold whitespace-normal"
          tone="warning"
        >
          <ClockIcon aria-hidden="true" className="size-4" />
          {t.waitingForApproval(thread.waiting)}
        </Pill>
      </span>
    );
  }

  if (thread.channel === null) {
    return (
      <span className="flex pt-1.5">
        <Pill
          className="text-label max-w-full font-semibold whitespace-normal"
          tone="warning"
        >
          <TriangleAlertIcon aria-hidden="true" className="size-4" />
          {t.noWayToReach}
        </Pill>
      </span>
    );
  }

  return null;
};

/** Who, how they're related, when, and the last thing said, the way chat apps list it. */
const ThreadRowLink = ({
  selected,
  thread,
  timeZone,
}: {
  selected: boolean;
  thread: ThreadRow;
  timeZone: string;
}) => {
  const { contact, last } = thread;
  const t = useMessages().threads;
  const locale = useLocale();

  return (
    <Link
      aria-current={selected ? "page" : undefined}
      className={cn(
        "text-foreground hover:bg-parchment flex min-w-0 gap-3.5 rounded-lg px-3 py-3.5 transition-colors",
        selected && "bg-neutral-wash hover:bg-neutral-wash"
      )}
      // SAFETY: a stored contact id, and /messages/[contactId] is a real route.
      href={`/messages/${contact.id}` as Route}
    >
      <Avatar
        className="mt-0.5"
        hue={contact.hue}
        name={contact.name}
        size="sm"
        src={contact.avatarUrl}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="text-body truncate font-semibold">
              {contact.name}
            </span>
            <span className="text-muted-foreground text-label shrink-[2] truncate">
              <span className="sr-only">, </span>
              {contact.relationship}
            </span>
          </span>
          {last ? (
            <time
              className="text-muted-foreground shrink-0 text-sm whitespace-nowrap"
              dateTime={new Date(last.createdAt).toISOString()}
              title={formatWhen(last.createdAt, timeZone, locale)}
            >
              <span className="sr-only">, </span>
              {listTime(last.createdAt, timeZone, undefined, locale)}
            </time>
          ) : null}
        </span>
        <span
          className={cn(
            "text-label truncate",
            last ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="sr-only">, </span>
          {last
            ? previewOf(last, locale)
            : `${t.startConversation}${thread.channel ? ` · ${t.channels[thread.channel]}` : ""}`}
        </span>
        <RowStatus thread={thread} />
      </span>
    </Link>
  );
};

/** Everyone in the trusted circle, latest conversation first, beside the one that's open. */
const ThreadList = ({
  className,
  selectedId,
  threads,
  timeZone,
}: {
  className?: string;
  selectedId: string | null;
  threads: ThreadRow[] | undefined;
  timeZone: string;
}) => {
  const t = useMessages().threads;

  return (
    <section
      aria-labelledby="conversations-heading"
      className={cn(
        "min-w-0 flex-col @3xl/content:self-stretch @3xl/content:border-r @3xl/content:pr-4",
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-3 px-3 pb-3">
        <h2 className="text-section font-semibold" id="conversations-heading">
          {t.conversations}
        </h2>
        {threads && threads.length > 0 ? (
          <p className="text-muted-foreground text-label">
            {t.peopleCount(threads.length)}
          </p>
        ) : null}
      </div>
      {threads === undefined ? (
        <LoadingRows
          layout="messages"
          label={t.loadingConversations}
          rows={3}
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {threads
            .toSorted(
              (left, right) =>
                (right.last?.createdAt ?? 0) - (left.last?.createdAt ?? 0)
            )
            .map((thread) => (
              <li key={thread.contact.id}>
                <ThreadRowLink
                  selected={thread.contact.id === selectedId}
                  thread={thread}
                  timeZone={timeZone}
                />
              </li>
            ))}
        </ul>
      )}
    </section>
  );
};

export { ThreadList };

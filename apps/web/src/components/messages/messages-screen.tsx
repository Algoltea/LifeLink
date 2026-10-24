"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { buttonVariants } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { CircleAlertIcon, TriangleAlertIcon, UserPlusIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Avatar } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { listTime } from "@/components/email/email-bits";
import { useLocale, useMessages } from "@/i18n/locale";
import { formatWhen } from "@/lib/format";

import { previewOf } from "./message-bits";

type ThreadRow = FunctionReturnType<typeof api.messages.threads>[number];

/** At most one status per row: a message that may not have gone out, or no way to reach them. */
const RowStatus = ({ thread }: { thread: ThreadRow }) => {
  const { last } = thread;
  const t = useMessages().threads;

  if (
    last?.direction === "outgoing" &&
    (last.status === "failed" || last.status === "unknown")
  ) {
    return (
      <span className="flex pt-1.5">
        <Pill className="text-label font-semibold" tone="negative">
          <CircleAlertIcon aria-hidden="true" className="size-4" />
          {last.status === "failed" ? t.notSent : t.notSureSent}
        </Pill>
      </span>
    );
  }

  if (thread.channel === null) {
    return (
      <span className="flex pt-1.5">
        <Pill className="text-label font-semibold" tone="warning">
          <TriangleAlertIcon aria-hidden="true" className="size-4" />
          {t.noWayToReach}
        </Pill>
      </span>
    );
  }

  return null;
};

/** Who, how they're related, when, and the last thing said, the way chat apps list it. */
const ConversationRow = ({
  thread,
  timeZone,
}: {
  thread: ThreadRow;
  timeZone: string;
}) => {
  const { contact, last } = thread;
  const t = useMessages().threads;
  const locale = useLocale();

  return (
    <Link
      className="text-foreground hover:bg-parchment flex min-w-0 items-center gap-3.5 rounded-lg px-3 py-3.5 transition-colors"
      // SAFETY: a stored contact id, and /messages/[contactId] is a real route.
      href={`/messages/${contact.id}` as Route}
    >
      <Avatar
        className="size-[2.667rem]"
        hue={contact.hue}
        name={contact.name}
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
        <span className="text-muted-foreground text-label truncate">
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

const MessagesScreen = () => {
  const threads = useQuery(api.messages.threads);
  const { me } = usePreferences();
  const timeZone = me?.profile?.timeZone ?? "America/New_York";
  const t = useMessages().threads;

  return (
    <>
      <PageHeader
        actions={
          <Link
            className={buttonVariants()}
            href={{ pathname: "/circle", query: { add: "1" } }}
          >
            <UserPlusIcon aria-hidden="true" />
            {t.addPerson}
          </Link>
        }
        subline={t.subline}
        title={t.title}
      />
      {threads === undefined ? (
        <LoadingRows
          layout="messages"
          label={t.loadingConversations}
          rows={3}
        />
      ) : null}
      {threads !== undefined && threads.length === 0 ? (
        <EmptyNote
          className="max-w-[42.667rem]"
          action={
            <Link
              className="min-h-control inline-flex items-center text-lg font-semibold underline"
              href={{ pathname: "/circle", query: { add: "1" } }}
            >
              {t.addPerson}
            </Link>
          }
        >
          {t.empty}
        </EmptyNote>
      ) : null}
      {threads !== undefined && threads.length > 0 ? (
        <ul
          aria-label={t.conversations}
          className="flex max-w-[42.667rem] flex-col gap-1"
        >
          {threads
            .toSorted(
              (left, right) =>
                (right.last?.createdAt ?? 0) - (left.last?.createdAt ?? 0)
            )
            .map((thread) => (
              <li key={thread.contact.id}>
                <ConversationRow thread={thread} timeZone={timeZone} />
              </li>
            ))}
        </ul>
      ) : null}
    </>
  );
};

export { MessagesScreen };

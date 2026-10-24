"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { buttonVariants } from "@lifelink/ui/components/button";
import { useQuery } from "convex/react";
import type { Route } from "next";
import Link from "next/link";

import { Avatar, ModePill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { CHANNEL_WORDS } from "@/components/tasks/details-view";
import { ago } from "@/lib/format";

const MessagesScreen = () => {
  const threads = useQuery(api.messages.threads);
  const { me } = usePreferences();
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  return (
    <>
      <PageHeader
        actions={
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/circle"
          >
            Manage contacts
          </Link>
        }
        subline="Write to the people in your trusted circle. You see every message before it's sent."
        title="Messages"
      />
      {threads === undefined ? (
        <LoadingRows label="Loading conversations" rows={3} />
      ) : null}
      {threads !== undefined && threads.length === 0 ? (
        <EmptyNote
          action={
            <Link className="text-lg font-semibold underline" href="/circle">
              Add someone
            </Link>
          }
        >
          Add family or friends to your trusted circle to start writing to them.
        </EmptyNote>
      ) : null}
      {threads !== undefined && threads.length > 0 ? (
        <ul className="flex max-w-4xl flex-col">
          {threads
            .toSorted(
              (left, right) =>
                (right.last?.createdAt ?? 0) - (left.last?.createdAt ?? 0)
            )
            .map((thread) => (
              <li
                className="border-rule border-t first:border-t-0"
                key={thread.contact.id}
              >
                <Link
                  className="hover:bg-surface flex items-start gap-4 rounded-lg px-3 py-5"
                  // SAFETY: a stored contact id, and /messages/[contactId] is a real route.
                  href={`/messages/${thread.contact.id}` as Route}
                >
                  <Avatar
                    hue={thread.contact.hue}
                    name={thread.contact.name}
                    src={thread.contact.avatarUrl}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-lg leading-7 font-semibold">
                        {thread.contact.name}
                      </span>
                      <span className="text-muted-foreground text-base">
                        {thread.last
                          ? ago(thread.last.createdAt, timeZone)
                          : ""}
                      </span>
                    </span>
                    <span className="text-muted-foreground text-base">
                      {thread.contact.relationship}
                      {thread.channel
                        ? ` · ${CHANNEL_WORDS[thread.channel]}`
                        : " · No way to reach them yet"}
                    </span>
                    {thread.last ? (
                      <span className="flex flex-wrap items-start gap-2 text-lg leading-7">
                        <span className="line-clamp-2 min-w-0 break-words">
                          {thread.last.direction === "outgoing" ? "You: " : ""}
                          {thread.last.body}
                        </span>
                        <ModePill mode={thread.last.mode} />
                      </span>
                    ) : (
                      <span className="text-lg leading-7">
                        Start a conversation
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      ) : null}
    </>
  );
};

export { MessagesScreen };

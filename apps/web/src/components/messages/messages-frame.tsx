"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { buttonVariants } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useQuery } from "convex/react";
import { UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote } from "@/components/app/states";
import { useMessages } from "@/i18n/locale";

import { MessagesNotice } from "./messages-notice";
import { ThreadList } from "./thread-list";

/**
 * Messages works like Email and Documents: on wide screens the conversation
 * list stays beside the open conversation; on narrow ones the conversation
 * takes the whole screen and the list is one step back.
 */
const MessagesFrame = ({ children }: { children: ReactNode }) => {
  const params = useParams<{ contactId?: string }>();
  const selectedId = params.contactId ?? null;
  const open = selectedId !== null;
  const threads = useQuery(api.messages.threads);
  const { me } = usePreferences();
  const timeZone = me?.profile?.timeZone ?? "America/New_York";
  const besideOnly = open ? "hidden @3xl/content:flex" : undefined;
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
        className={cn("items-center", besideOnly)}
        title={t.title}
      />
      {open ? <h1 className="sr-only @3xl/content:hidden">{t.title}</h1> : null}
      <MessagesNotice className={besideOnly} />
      {threads?.length === 0 && !open ? (
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
      ) : (
        <div className="grid gap-6 @3xl/content:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/content:gap-0">
          <ThreadList
            className={open ? "hidden @3xl/content:flex" : "flex"}
            selectedId={selectedId}
            threads={threads}
            timeZone={timeZone}
          />
          <div
            className={cn(
              "min-w-0 flex-col @3xl/content:pl-10",
              open ? "flex" : "hidden @3xl/content:flex"
            )}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export { MessagesFrame };

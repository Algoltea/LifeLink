"use client";

import type { api } from "@lifelink/backend/convex/_generated/api";
import { Pill } from "@lifelink/ui/components/pill";
import { cn } from "@lifelink/ui/lib/utils";
import type { FunctionReturnType } from "convex/server";
import { TriangleAlertIcon } from "lucide-react";
import type { RefObject } from "react";

import { Avatar } from "@/components/app/bits";
import { EmptyNote } from "@/components/app/states";
import { formatWhen } from "@/lib/format";

import { InboxSkeleton, hueFor, listTime } from "./email-bits";

type EmailRow = NonNullable<FunctionReturnType<typeof api.emails.list>>[number];

/** At most one status per row; a clean check needs no mark of its own. */
const RowStatus = ({ email }: { email: EmailRow }) => {
  if (email.scamCheck === undefined) {
    return (
      <span className="text-muted-foreground text-label pt-1">
        Not checked yet
      </span>
    );
  }

  if (!email.suspicious) {
    if (email.priority === "reply") {
      return (
        <span className="text-accent-foreground text-label pt-1 font-medium">
          May need a reply
        </span>
      );
    }

    if (email.priority === "low_priority") {
      return (
        <span className="text-muted-foreground text-label pt-1">
          Lower priority
        </span>
      );
    }

    return null;
  }

  return (
    <span className="flex pt-1.5">
      <Pill className="text-label font-semibold" tone="warning">
        <TriangleAlertIcon aria-hidden="true" className="size-4" />
        Warning signs
      </Pill>
    </span>
  );
};

/** The inbox the way mail apps show it: who, when, what, and one line of it. */
const EmailList = ({
  emails,
  onSelect,
  rowRefs,
  selectedId,
  timeZone,
}: {
  emails: EmailRow[] | undefined;
  onSelect: (id: string) => void;
  rowRefs: RefObject<Map<string, HTMLButtonElement>>;
  selectedId: string | null;
  timeZone: string;
}) => {
  if (emails === undefined) {
    return <InboxSkeleton label="Loading emails" rows={4} />;
  }

  if (emails.length === 0) {
    return (
      <EmptyNote>
        No emails here yet. Connect a mailbox, then choose “Check for new email”
        to import recent messages.
      </EmptyNote>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {emails.map((email) => {
        const isSelected = email.id === selectedId;
        const sender = email.fromName ?? email.fromAddress;

        return (
          <li key={email.id}>
            <button
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "text-foreground hover:bg-parchment flex w-full min-w-0 gap-3.5 rounded-lg px-3 py-3.5 text-left transition-colors",
                isSelected && "bg-neutral-wash hover:bg-neutral-wash"
              )}
              onClick={() => onSelect(email.id)}
              ref={(node) => {
                if (node) {
                  rowRefs.current.set(email.id, node);
                } else {
                  rowRefs.current.delete(email.id);
                }
              }}
              type="button"
            >
              <Avatar
                className="mt-0.5"
                hue={hueFor(email.fromAddress)}
                name={sender}
                size="sm"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-body truncate font-semibold">
                    {sender}
                  </span>
                  <time
                    className="text-muted-foreground shrink-0 text-sm whitespace-nowrap"
                    dateTime={new Date(email.receivedAt).toISOString()}
                    title={formatWhen(email.receivedAt, timeZone)}
                  >
                    {listTime(email.receivedAt, timeZone)}
                  </time>
                </span>
                <span className="text-label truncate">
                  {email.subject || "(No subject)"}
                </span>
                <span className="text-muted-foreground text-label truncate">
                  {email.summary ?? email.preview}
                </span>
                <RowStatus email={email} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export { EmailList };

export type { EmailRow };

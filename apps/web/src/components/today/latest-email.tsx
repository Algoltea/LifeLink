"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { listTime } from "@/components/email/email-bits";
import { AllLink, PANEL_ROW, PanelPart } from "@/components/today/side-lists";
import { formatWhen } from "@/lib/format";

const SHOWN = 3;
const MAILBOX_IDS = new Set(["gmail", "outlook"]);

type EmailRow = FunctionReturnType<typeof api.emails.list>[number];

/** The emails Today shows, newest first. */
const newestEmails = (emails: EmailRow[]): EmailRow[] => emails.slice(0, SHOWN);

/** The three newest emails, each opening in Email where warning signs are shown. */
const LatestEmail = ({ timeZone }: { timeZone: string }) => {
  const emails = useQuery(api.emails.list);
  const connections = useQuery(api.connections.list);

  if (emails === undefined || connections === undefined) {
    return null;
  }

  const connected = connections.providers.some(
    (provider) =>
      MAILBOX_IDS.has(provider.definition.id) && provider.status === "active"
  );

  const newest = newestEmails(emails);

  // The rule above sits here, not in Messages, so it never shows above nothing while email loads.
  return (
    <PanelPart
      action={
        newest.length > 0 ? <AllLink href="/email">All email</AllLink> : null
      }
      className="border-rule mt-2 border-t pt-2"
      headingId="latest-email-heading"
      title="Latest email"
    >
      {newest.length === 0 ? (
        <p className="text-muted-foreground text-body flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1">
          {connected || connections.demoMode ? (
            "No new email."
          ) : (
            <>
              Connect Gmail or Outlook to see new email here.
              <Link
                className="text-accent-foreground min-h-control inline-flex items-center gap-1 font-medium"
                href="/connections"
              >
                Connect
                <ChevronRightIcon aria-hidden="true" className="size-5" />
              </Link>
            </>
          )}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {newest.map((email) => (
            <li key={email.id}>
              <Link
                className={PANEL_ROW}
                // SAFETY: a stored email id; /email reads ?id= to open it.
                href={`/email?id=${email.id}` as Route}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-body truncate font-semibold">
                      {email.fromName ?? email.fromAddress}
                    </span>
                    <time
                      className="text-muted-foreground shrink-0 text-sm whitespace-nowrap"
                      dateTime={new Date(email.receivedAt).toISOString()}
                      title={formatWhen(email.receivedAt, timeZone)}
                    >
                      <span className="sr-only">, </span>
                      {listTime(email.receivedAt, timeZone)}
                    </time>
                  </span>
                  <span className="text-muted-foreground text-label flex min-w-0 items-center gap-2">
                    <span className="truncate">
                      <span className="sr-only">, </span>
                      {email.subject || "No subject"}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PanelPart>
  );
};

export { LatestEmail };

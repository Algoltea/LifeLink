"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { ChevronRightIcon, ShieldAlertIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { listTime } from "@/components/email/email-bits";
import { PANEL_ROW, PanelPart } from "@/components/today/side-lists";
import { formatWhen } from "@/lib/format";

const SHOWN = 3;
const MAILBOX_IDS = new Set(["gmail", "outlook"]);

/** The three newest emails, each opening in Email; a warning shows when a check flagged one. */
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

  const newest = emails.slice(0, SHOWN);

  // The rule above sits here, not in Messages, so it never shows above nothing while email loads.
  return (
    <PanelPart
      action={
        newest.length > 0 ? (
          <Link
            className="text-accent-foreground text-label min-h-control inline-flex items-center gap-1 font-medium"
            href="/email"
          >
            All email
            <ChevronRightIcon aria-hidden="true" className="size-5" />
          </Link>
        ) : null
      }
      className="border-rule mt-2 border-t pt-2"
      headingId="latest-email-heading"
      title="Latest email"
    >
      {newest.length === 0 ? (
        <p className="text-muted-foreground text-body flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1">
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
          {newest.map((email) => {
            const flagged =
              email.suspicious === true ||
              email.scamCheck?.verdict === "likely_scam" ||
              email.scamCheck?.verdict === "suspicious";

            return (
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
                      {flagged ? (
                        <span className="text-warning inline-flex shrink-0 items-center gap-1 font-semibold">
                          <ShieldAlertIcon
                            aria-hidden="true"
                            className="size-4"
                          />
                          Check first
                          <span className="sr-only">,</span>
                        </span>
                      ) : null}
                      <span className="truncate">
                        <span className="sr-only">, </span>
                        {email.subject || "No subject"}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PanelPart>
  );
};

export { LatestEmail };

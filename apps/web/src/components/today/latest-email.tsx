"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Pill } from "@lifelink/ui/components/pill";
import { Skeleton } from "@lifelink/ui/components/skeleton";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronRightIcon, TriangleAlertIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { listTime } from "@/components/email/email-bits";
import { AllLink, PANEL_ROW, TodayPanel } from "@/components/today/side-lists";
import { useLocale, useMessages } from "@/i18n/locale";
import { hasEmailWarning } from "@/lib/email-warning";
import { formatWhen } from "@/lib/format";

// Three keep the email list short so Messages, beneath it, shows without scrolling; All email has the rest.
const SHOWN = 3;
const MAILBOX_IDS = new Set(["gmail", "outlook"]);

type EmailRow = FunctionReturnType<typeof api.emails.list>[number];

/** The emails Today shows, newest first. */
const newestEmails = (emails: EmailRow[]): EmailRow[] => emails.slice(0, SHOWN);

/** One clear warning on the subject line; the full explanation stays in the email. */
const EmailWarning = ({ email }: { email: EmailRow }) => {
  const t = useMessages();

  if (!hasEmailWarning(email)) {
    return null;
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Pill className="text-label font-semibold" tone="warning">
        <TriangleAlertIcon aria-hidden="true" className="size-4" />
        {t.today.possibleScam}
      </Pill>
      <span>{t.today.openForDetails}</span>
    </span>
  );
};

/** The newest emails, with a simple hint on messages that need care. */
const LatestEmail = ({ timeZone }: { timeZone: string }) => {
  const locale = useLocale();
  const emails = useQuery(api.emails.list);
  const t = useMessages();
  const connections = useQuery(api.connections.list);

  if (emails === undefined || connections === undefined) {
    return (
      <TodayPanel
        action={<AllLink href="/email">{t.today.allEmail}</AllLink>}
        headingId="latest-email-heading"
        title={t.today.latestEmail}
      >
        <div aria-busy="true" aria-label={t.appExtras.loading.emails}>
          <div aria-hidden="true" className="flex flex-col gap-5 py-2.5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </TodayPanel>
    );
  }

  const connected = connections.providers.some(
    (provider) =>
      MAILBOX_IDS.has(provider.definition.id) && provider.status === "active"
  );

  const newest = newestEmails(emails);

  return (
    <TodayPanel
      action={
        newest.length > 0 ? (
          <AllLink href="/email">{t.today.allEmail}</AllLink>
        ) : null
      }
      headingId="latest-email-heading"
      title={t.today.latestEmail}
    >
      {newest.length === 0 ? (
        <p className="text-muted-foreground text-body flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1">
          {connected || connections.demoMode ? (
            t.today.noEmail
          ) : (
            <>
              {t.today.connectMailbox}
              <Link
                className="text-accent-foreground min-h-control inline-flex items-center gap-1 font-medium"
                href="/connections"
              >
                {t.today.connect}
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
                      title={formatWhen(email.receivedAt, timeZone, locale)}
                    >
                      <span className="sr-only">, </span>
                      {listTime(email.receivedAt, timeZone, undefined, locale)}
                    </time>
                  </span>
                  <span className="text-muted-foreground text-label flex min-w-0 flex-col items-start gap-1">
                    <span className="line-clamp-2">
                      <span className="sr-only">, </span>
                      {email.subject || t.today.noSubject}
                    </span>
                    <EmailWarning email={email} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </TodayPanel>
  );
};

export { LatestEmail };

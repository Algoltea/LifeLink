"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ModePill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { EmailReader } from "./email-reader";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const MAILBOX_IDS = new Set(["gmail", "outlook"]);

/** Which mailboxes are connected, said plainly, with a way to connect one. */
const MailboxStatus = () => {
  const connections = useQuery(api.connections.list);
  const refresh = useAction(api.emails.refresh);
  const [busy, setBusy] = useState(false);

  if (connections === undefined) {
    return null;
  }

  const mailboxes = connections.providers.filter((provider) =>
    MAILBOX_IDS.has(provider.definition.id)
  );

  const active = mailboxes.filter((mailbox) => mailbox.status === "active");

  const troubled = mailboxes.filter(
    (mailbox) => mailbox.status === "error" || mailbox.status === "expired"
  );

  return (
    <section
      aria-label="Your mailboxes"
      className="bg-surface text-foreground flex flex-col gap-3 rounded-xl px-5 py-5"
    >
      {active.length === 0 ? (
        <p className="text-lg">
          No mailbox is connected yet.{" "}
          {connections.demoMode
            ? "The emails below are practice samples so you can try things safely. "
            : ""}
          <Link className="font-semibold underline" href="/connections">
            Connect Gmail or Outlook
          </Link>
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg">
            Connected:{" "}
            {active
              .map(
                (mailbox) =>
                  `${mailbox.definition.label}${mailbox.accountLabel ? ` (${mailbox.accountLabel})` : ""}`
              )
              .join(", ")}
            . Checking for new email imports recent inbox messages and checks
            their text locally for common scam signs.
          </p>
          <Button
            aria-busy={busy}
            className="hover:bg-surface hover:text-foreground rounded-md whitespace-normal"
            disabled={busy || connections.demoMode}
            onClick={async () => {
              setBusy(true);

              try {
                const result = await refresh({});

                for (const problem of result.errors) {
                  toast.error(problem);
                }

                toast.success(
                  result.added === 0
                    ? "No new emails."
                    : `${result.added} new ${result.added === 1 ? "email" : "emails"}.`
                );
              } catch (error) {
                toast.error(errorText(error));
              }

              setBusy(false);
            }}
            variant="outline"
          >
            <RefreshCwIcon />
            {busy ? "Checking…" : "Check for new email"}
          </Button>
          {connections.demoMode ? (
            <p className="text-muted-foreground text-base">
              Practice mode uses sample emails. New mail is not fetched while it
              is on.
            </p>
          ) : null}
        </div>
      )}
      {troubled.map((mailbox) => (
        <p className="text-negative text-base" key={mailbox.definition.id}>
          {mailbox.definition.label} needs attention
          {mailbox.lastError ? `: ${mailbox.lastError}` : "."}{" "}
          <Link className="font-semibold underline" href="/connections">
            Reconnect
          </Link>
        </p>
      ))}
    </section>
  );
};

type EmailRow = NonNullable<FunctionReturnType<typeof api.emails.list>>[number];

const EmailList = ({
  emails,
  onSelect,
  selectedId,
  timeZone,
}: {
  emails: EmailRow[] | undefined;
  onSelect: (id: string) => void;
  selectedId: string | null;
  timeZone: string;
}) => {
  if (emails === undefined) {
    return <LoadingRows label="Loading emails" rows={4} />;
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
    <ul>
      {emails.map((email) => {
        const isSelected = email.id === selectedId;

        return (
          <li className="border-rule border-t" key={email.id}>
            <button
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "bg-background text-foreground hover:bg-surface hover:text-foreground focus-visible:outline-ring flex w-full min-w-0 flex-col gap-1 rounded-md px-3 py-4 text-left wrap-anywhere focus-visible:outline-2 focus-visible:outline-offset-2",
                isSelected && "bg-surface text-foreground"
              )}
              onClick={() => onSelect(email.id)}
              type="button"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold">
                  {email.fromName ?? email.fromAddress}
                </span>
                <ModePill mode={email.mode} />
              </span>
              <span className="text-lg">{email.subject || "(No subject)"}</span>
              <span className="text-muted-foreground line-clamp-2 text-base">
                {email.summary ?? email.preview}
              </span>
              <span className="text-muted-foreground text-sm">
                {ago(email.receivedAt, timeZone)}
              </span>
              {email.scamCheck === undefined ? (
                <span className="text-muted-foreground text-base">
                  Local check pending
                </span>
              ) : (
                <span className="flex flex-wrap items-center gap-2 pt-1 text-base">
                  {email.suspicious ? (
                    <Pill tone="warning">Warning signs found</Pill>
                  ) : (
                    <span>Local check complete</span>
                  )}
                  <span className="text-muted-foreground">
                    {email.scamCheck.warningCount === 0
                      ? "No common warning signs found"
                      : `${email.scamCheck.warningCount} ${email.scamCheck.warningCount === 1 ? "sign" : "signs"} to review`}
                  </span>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const EmailScreen = ({ initialEmailId }: { initialEmailId: string | null }) => {
  const emails = useQuery(api.emails.list);
  const checkRecent = useMutation(api.emails.checkRecent);
  const { me } = usePreferences();
  const [selectedId, setSelectedId] = useState<string | null>(initialEmailId);
  const [scanError, setScanError] = useState<string | null>(null);
  const needsChecks = emails?.some((email) => email.needsSafetyCheck) ?? false;
  useEffect(() => {
    if (!needsChecks) {
      return;
    }

    const check = async () => {
      try {
        await checkRecent({});
        setScanError(null);
      } catch (error) {
        setScanError(errorText(error));
      }
    };

    void check();
  }, [checkRecent, needsChecks]);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";
  const selected = emails?.find((email) => email.id === selectedId) ?? null;

  return (
    <>
      <PageHeader
        subline="New email is checked locally for common scam signs. Pick a message to read it and see what stood out."
        title="Email"
      />
      <MailboxStatus />
      <p className="text-muted-foreground max-w-prose text-base">
        Automatic checks do not send email to an AI provider. They cannot verify
        a sender or prove a message is genuine.{" "}
        <Link
          className="text-foreground font-semibold underline underline-offset-4"
          href="/scam"
        >
          Check another message
        </Link>
      </p>
      {scanError === null ? null : (
        <div
          className="bg-negative-wash text-negative rounded-md p-4"
          role="alert"
        >
          <p>The local check could not finish. {scanError}</p>
          <Link
            className="inline-flex min-h-12 items-center font-semibold underline"
            href="/scam"
          >
            Open the manual scam check
          </Link>
        </div>
      )}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section
          aria-labelledby="inbox-heading"
          className={cn(
            "min-w-0 flex-col",
            selected === null ? "flex" : "hidden lg:flex"
          )}
        >
          <h2 className="pb-3 text-2xl font-semibold" id="inbox-heading">
            Recent emails
          </h2>
          <EmailList
            emails={emails}
            onSelect={setSelectedId}
            selectedId={selectedId}
            timeZone={timeZone}
          />
        </section>
        {selected === null ? (
          <EmptyNote className="lg:mt-14">
            Choose an email to read it and review its local check.
          </EmptyNote>
        ) : (
          <div className="flex min-w-0 flex-col gap-4">
            <Button
              className="hover:bg-surface hover:text-foreground self-start rounded-md lg:hidden"
              onClick={() => setSelectedId(null)}
              variant="outline"
            >
              Back to recent emails
            </Button>
            <EmailReader
              emailId={selected.id}
              key={selected.id}
              timeZone={timeZone}
            />
          </div>
        )}
      </div>
    </>
  );
};

export { EmailScreen };

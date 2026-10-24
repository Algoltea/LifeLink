"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { INBOX_PAGE_SIZE } from "@lifelink/contracts/inbox";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ChevronLeftIcon,
  MailIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { isRowStillShown } from "@/lib/list-beside-reader";

import { EmailList } from "./email-list";
import { EmailReader } from "./email-reader";
import { InboxPaging } from "./inbox-paging";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const MAILBOX_IDS = new Set(["gmail", "outlook"]);

const CHECKS_PANEL_ID = "email-checks-explained";

/** Which mailboxes are connected, in one slim line, with the one action that fits. */
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
      className="bg-parchment text-foreground flex flex-col gap-2 rounded-xl py-2 pr-2 pl-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="min-h-control flex min-w-0 flex-1 basis-80 items-center gap-3">
          <MailIcon
            aria-hidden="true"
            className="text-muted-foreground size-5 shrink-0"
          />
          <span>
            {active.length === 0 ? (
              <>
                No mailbox connected.
                {connections.demoMode
                  ? " These are sample emails, so you can practice safely."
                  : ""}
              </>
            ) : (
              <>
                Connected:{" "}
                {active
                  .map(
                    (mailbox) =>
                      `${mailbox.definition.label}${mailbox.accountLabel ? ` (${mailbox.accountLabel})` : ""}`
                  )
                  .join(", ")}
                .
                {connections.demoMode
                  ? " These are sample emails, so you can practice safely."
                  : ""}
              </>
            )}
          </span>
        </p>
        {active.length === 0 ? (
          <Link
            className={buttonVariants({
              size: "default",
            })}
            href="/connections"
          >
            Connect Gmail or Outlook
          </Link>
        ) : (
          <Button
            aria-busy={busy}
            className="bg-raised"
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
            size="sm"
            variant="outline"
          >
            <RefreshCwIcon aria-hidden="true" />
            {busy ? "Checking…" : "Check for new email"}
          </Button>
        )}
      </div>
      {troubled.map((mailbox) => (
        <p
          className="text-negative text-label pb-2"
          key={mailbox.definition.id}
        >
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

/** What the automatic checks do and don't do, one press away instead of always on screen. */
const ChecksExplained = () => (
  <section
    aria-labelledby={`${CHECKS_PANEL_ID}-heading`}
    className="border-border bg-raised flex max-w-3xl flex-col gap-2 rounded-xl border px-5 py-4"
    id={CHECKS_PANEL_ID}
  >
    <h2 className="text-body font-semibold" id={`${CHECKS_PANEL_ID}-heading`}>
      How the email checks work
    </h2>
    <p>
      New email is checked in LifeLink, on this device, for common scam signs.
      Pick a message to read it and see what stood out.
    </p>
    <p className="text-muted-foreground text-label">
      Automatic checks don’t send email to an AI provider. They can’t confirm
      who sent an email or whether what it says is true. “Check for new email”
      brings in your recent emails and checks them the same way.
    </p>
    <Link
      className="text-foreground min-h-control inline-flex items-center self-start font-semibold underline underline-offset-4"
      href="/scam"
    >
      Check another message
    </Link>
  </section>
);

const EmailScreen = ({ initialEmailId }: { initialEmailId: string | null }) => {
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const cursor = cursors.at(-1) ?? null;

  const page = useQuery(api.emails.page, {
    paginationOpts: { cursor, numItems: INBOX_PAGE_SIZE },
  });

  const emails = page?.page;
  const pageFocusPending = useRef(false);
  const checkRecent = useMutation(api.emails.checkRecent);
  const { me } = usePreferences();
  const [selectedId, setSelectedId] = useState<string | null>(initialEmailId);

  const selectedRow = useQuery(
    api.emails.selectedRow,
    selectedId === null ? "skip" : { emailId: selectedId }
  );

  const [explaining, setExplaining] = useState(false);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const inboxHeadingRef = useRef<HTMLHeadingElement>(null);
  const listPosition = useRef({ x: 0, y: 0 });
  const returningTo = useRef<string | null>(null);
  // A deep link opens an email with no row to stay on, so it lands on the subject.
  const openedFromList = useRef(false);
  const openedNote = useRef<HTMLOutputElement>(null);

  const listStaysBeside = (): boolean =>
    openedFromList.current &&
    selectedId !== null &&
    isRowStillShown(rowRefs.current.get(selectedId));

  useLayoutEffect(() => {
    if (selectedId !== null || returningTo.current === null) {
      return;
    }

    const target =
      rowRefs.current.get(returningTo.current) ?? inboxHeadingRef.current;

    target?.focus({ preventScroll: true });
    globalThis.scrollTo({
      behavior: "instant",
      left: listPosition.current.x,
      top: listPosition.current.y,
    });
    returningTo.current = null;
  }, [selectedId]);
  const [scanError, setScanError] = useState<string | null>(null);

  const scanIds = useMemo(
    () =>
      emails
        ?.filter((email) => email.needsSafetyCheck)
        .map((email) => email.id) ?? [],
    [emails]
  );

  useEffect(() => {
    if (scanIds.length === 0) {
      return;
    }

    const check = async () => {
      try {
        await checkRecent({ emailIds: scanIds });
        setScanError(null);
      } catch (error) {
        setScanError(errorText(error));
      }
    };

    void check();
  }, [checkRecent, scanIds]);
  useEffect(() => {
    if (page === undefined || !pageFocusPending.current) {
      return;
    }

    pageFocusPending.current = false;
    inboxHeadingRef.current?.focus({ preventScroll: true });
    inboxHeadingRef.current?.scrollIntoView({
      behavior: "instant",
      block: "start",
    });
  }, [page]);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  const selected =
    emails?.find((email) => email.id === selectedId) ?? selectedRow ?? null;

  // Focus stays on the row beside the reader, so say what opened instead.
  const announceOpened = useEffectEvent((id: string | null) => {
    const opened = emails?.find((email) => email.id === id);

    if (openedNote.current !== null) {
      openedNote.current.textContent =
        opened !== undefined && listStaysBeside()
          ? `Opened: ${opened.subject || "(No subject)"}`
          : "";
    }
  });

  useEffect(() => {
    announceOpened(selectedId);
  }, [selectedId]);

  return (
    <>
      <PageHeader
        actions={
          <Button
            aria-controls={explaining ? CHECKS_PANEL_ID : undefined}
            aria-expanded={explaining}
            onClick={() => setExplaining((open) => !open)}
            size="sm"
            variant="ghost"
          >
            <ShieldCheckIcon aria-hidden="true" />
            About scam checks
          </Button>
        }
        className="items-center"
        title="Email"
      />
      <MailboxStatus />
      {explaining ? <ChecksExplained /> : null}
      {scanError === null ? null : (
        <div
          className="bg-negative-wash text-negative rounded-md p-4"
          role="alert"
        >
          <p>The scam check couldn’t finish. {scanError}</p>
          <Link
            className="inline-flex min-h-12 items-center font-semibold underline"
            href="/scam"
          >
            Open the manual scam check
          </Link>
        </div>
      )}
      <div className="grid items-start gap-6 @3xl/content:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/content:gap-0">
        <section
          aria-labelledby="inbox-heading"
          className={cn(
            "min-w-0 flex-col @3xl/content:flex @3xl/content:self-stretch @3xl/content:border-r @3xl/content:pr-4",
            selected === null ? "flex" : "hidden"
          )}
        >
          <div className="flex items-baseline justify-between gap-3 px-3 pb-3">
            <h2
              className="text-section font-semibold outline-none"
              id="inbox-heading"
              ref={inboxHeadingRef}
              tabIndex={-1}
            >
              Inbox
            </h2>
            {emails && emails.length > 0 ? (
              <p className="text-muted-foreground text-label">
                {emails.length} {emails.length === 1 ? "email" : "emails"}
              </p>
            ) : null}
          </div>
          <EmailList
            emails={emails}
            onSelect={(id) => {
              listPosition.current = {
                x: globalThis.scrollX,
                y: globalThis.scrollY,
              };
              openedFromList.current = true;
              setSelectedId(id);
            }}
            rowRefs={rowRefs}
            selectedId={selectedId}
            timeZone={timeZone}
          />
          <InboxPaging
            page={page}
            cursors={cursors}
            onNavigate={(next) => {
              pageFocusPending.current = true;
              setSelectedId(null);
              setCursors(next);
            }}
          />
        </section>
        {selected === null ? (
          <EmptyNote className="hidden @3xl/content:mt-12 @3xl/content:ml-10 @3xl/content:flex">
            Choose an email to read it and see its scam check.
          </EmptyNote>
        ) : (
          <div className="flex min-w-0 flex-col gap-2 @3xl/content:pl-10">
            <Button
              className="-ml-2 self-start pl-2 @3xl/content:hidden"
              onClick={() => {
                returningTo.current = selectedId;
                setSelectedId(null);
              }}
              size="sm"
              variant="ghost"
            >
              <ChevronLeftIcon aria-hidden="true" />
              Back to inbox
            </Button>
            <EmailReader
              emailId={selected.id}
              key={selected.id}
              listStaysBeside={listStaysBeside}
              timeZone={timeZone}
            />
          </div>
        )}
      </div>
      <output aria-live="polite" className="sr-only" ref={openedNote} />
    </>
  );
};

export { EmailScreen };

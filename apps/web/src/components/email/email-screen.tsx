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
import { currentMessages, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
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
  const t = useMessages().email;

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
      aria-label={t.mailboxes}
      className="bg-parchment text-foreground flex flex-col gap-2 rounded-xl py-2 pr-2 pl-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="min-h-control flex min-w-0 flex-1 basis-80 items-center gap-3">
          <MailIcon
            aria-hidden="true"
            className="text-muted-foreground size-5 shrink-0"
          />
          <span>
            {active.length === 0
              ? t.noMailbox
              : t.connected(
                  active
                    .map(
                      (mailbox) =>
                        `${mailbox.definition.label}${mailbox.accountLabel ? ` (${mailbox.accountLabel})` : ""}`
                    )
                    .join(", ")
                )}
            {connections.demoMode ? t.sampleEmails : ""}
          </span>
        </p>
        {active.length === 0 ? (
          <Link
            className={buttonVariants({
              size: "default",
            })}
            href="/connections"
          >
            {t.connectMailbox}
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
                  toast.error(translateServerMessage(problem));
                }

                toast.success(t.newEmails(result.added));
              } catch (error) {
                toast.error(errorText(error));
              }

              setBusy(false);
            }}
            size="sm"
            variant="outline"
          >
            <RefreshCwIcon aria-hidden="true" />
            {busy ? t.checking : t.checkForNew}
          </Button>
        )}
      </div>
      {troubled.map((mailbox) => (
        <p
          className="text-negative text-label pb-2"
          key={mailbox.definition.id}
        >
          {t.needsAttention(
            mailbox.definition.label,
            mailbox.lastError ? translateServerMessage(mailbox.lastError) : null
          )}{" "}
          <Link className="font-semibold underline" href="/connections">
            {t.reconnect}
          </Link>
        </p>
      ))}
    </section>
  );
};

/** What the automatic checks do and don't do, one press away instead of always on screen. */
const ChecksExplained = () => {
  const t = useMessages().email;

  return (
    <section
      aria-labelledby={`${CHECKS_PANEL_ID}-heading`}
      className="border-border bg-raised flex max-w-3xl flex-col gap-2 rounded-xl border px-5 py-4"
      id={CHECKS_PANEL_ID}
    >
      <h2 className="text-body font-semibold" id={`${CHECKS_PANEL_ID}-heading`}>
        {t.checksTitle}
      </h2>
      <p>{t.checksIntro}</p>
      <p className="text-muted-foreground text-label">{t.checksAutomatic}</p>
      <Link
        className="text-foreground min-h-control inline-flex items-center self-start font-semibold underline underline-offset-4"
        href="/scam"
      >
        {t.checkAnother}
      </Link>
    </section>
  );
};

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
  const t = useMessages().email;
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
          ? currentMessages().email.opened(
              opened.subject || currentMessages().email.noSubject
            )
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
            {t.aboutChecks}
          </Button>
        }
        className="items-center"
        title={t.title}
      />
      <MailboxStatus />
      {explaining ? <ChecksExplained /> : null}
      {scanError === null ? null : (
        <div
          className="bg-negative-wash text-negative rounded-md p-4"
          role="alert"
        >
          <p>{t.checkCouldNotFinish(scanError)}</p>
          <Link
            className="inline-flex min-h-12 items-center font-semibold underline"
            href="/scam"
          >
            {t.openManualCheck}
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
              {t.inbox}
            </h2>
            {emails && emails.length > 0 ? (
              <p className="text-muted-foreground text-label">
                {t.countEmails(emails.length)}
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
            {t.chooseEmail}
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
              {t.backToInbox}
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

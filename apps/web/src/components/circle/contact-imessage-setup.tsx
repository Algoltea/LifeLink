"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { Dialog } from "@lifelink/ui/components/dialog";
import { Pill } from "@lifelink/ui/components/pill";
import { useAction } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { CopyIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { SimulatedPill } from "@/components/app/bits";
import { messagesFor, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

type IMessageData = FunctionReturnType<typeof api.imessage.list>;

type IMessageContact = IMessageData["contacts"][number];

type IMessageContext = Pick<IMessageData, "configured" | "practiceMode">;

interface EnrollmentError {
  assignedNumber: string | null;
  message: string;
  status: IMessageContact["status"];
}

const currentErrorMessage = (
  error: EnrollmentError | null,
  row: IMessageContact
): string | null =>
  error?.status === row.status && error.assignedNumber === row.assignedNumber
    ? error.message
    : null;

const STATUS_TONES: Record<
  IMessageContact["status"],
  "negative" | "neutral" | "positive" | "warning"
> = {
  failed: "negative",
  not_registered: "neutral",
  ready: "positive",
  registering: "warning",
  waiting: "warning",
};

const FirstMessageInstructions = ({
  assignedNumber,
  contactLocale,
  contactName,
  handle,
}: {
  assignedNumber: string;
  contactLocale: InterfaceLocale;
  contactName: string;
  handle: string;
}) => {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const t = useMessages().imessageSetup;

  // Written for the contact, so in their language.
  const instructions = messagesFor(contactLocale).imessageSetup.instructions(
    contactName,
    assignedNumber,
    handle
  );

  const copy = async (): Promise<void> => {
    setCopying(true);
    setCopied(false);
    setCopyError(null);

    try {
      await navigator.clipboard.writeText(instructions);
      setCopied(true);
    } catch {
      setCopyError(t.copyFailed);
    }

    setCopying(false);
  };

  return (
    <div className="bg-surface flex flex-col gap-3 rounded-lg px-4 py-4">
      <p className="text-lg">
        {t.assignedNumber}
        <span className="num font-semibold break-all">{assignedNumber}</span>
      </p>
      <p className="text-lg leading-7 break-words" lang={contactLocale}>
        {instructions}
      </p>
      <Button
        aria-busy={copying}
        className="max-w-full self-start whitespace-normal"
        disabled={copying}
        onClick={copy}
        size="sm"
        variant="outline"
      >
        <CopyIcon aria-hidden="true" />
        {t.copy}
      </Button>
      <output aria-live="polite" className="text-base">
        {copied ? t.copied(contactName) : null}
      </output>
      {copyError ? (
        <p className="text-negative text-lg leading-7" role="alert">
          {copyError}
        </p>
      ) : null}
    </div>
  );
};

const IMessageEnrollment = ({
  contactLocale,
  contactName,
  row,
}: {
  contactLocale: InterfaceLocale;
  contactName: string;
  row: IMessageContact;
}) => {
  const messages = useMessages();
  const t = messages.imessageSetup;
  const register = useAction(api.imessage.register);
  const refresh = useAction(api.imessage.refresh);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState<"refresh" | "register" | null>(null);

  const [actionError, setActionError] = useState<EnrollmentError | null>(null);

  const [checked, setChecked] = useState(false);
  const inFlight = useRef(false);
  const busy = pending !== null || row.status === "registering";

  const canRegister =
    row.assignedNumber === null &&
    (row.status === "not_registered" || row.status === "failed");

  const state = { label: t.status[row.status], tone: STATUS_TONES[row.status] };

  const currentActionError = currentErrorMessage(actionError, row);

  const displayError = currentActionError ?? row.error;

  const pendingMessage = pending === "refresh" ? t.checking : t.lookingUp;

  const run = async (operation: "refresh" | "register"): Promise<void> => {
    if (inFlight.current || busy) {
      return;
    }

    if (operation === "register" && !(canRegister && confirming)) {
      return;
    }

    if (operation === "refresh" && row.assignedNumber === null) {
      return;
    }

    inFlight.current = true;
    setPending(operation);
    setConfirming(false);
    setActionError(null);
    setChecked(false);

    try {
      if (operation === "register") {
        await register({
          confirmedHandle: row.handle,
          contactId: row.contactId,
        });
      } else {
        await refresh({ contactId: row.contactId });
        setChecked(true);
      }
    } catch (error) {
      setActionError({
        assignedNumber: row.assignedNumber,
        message: messageOf(
          error instanceof Error ? error : null,
          operation === "register" ? t.linkFailed : t.checkFailed
        ),
        status: row.status,
      });
    }

    inFlight.current = false;
    setPending(null);
  };

  return (
    <>
      <output aria-live="polite" className="flex flex-wrap items-center gap-2">
        <Pill className="max-w-full whitespace-normal" tone={state.tone}>
          {state.label}
        </Pill>
      </output>
      <p className="text-lg leading-7 break-words">
        {t.exactAddress}
        <strong>{row.handle}</strong>
      </p>
      <output aria-live="polite" className="text-base">
        {busy ? pendingMessage : null}
        {!busy && checked ? t.checkComplete : null}
      </output>
      {displayError ? (
        <p className="text-negative text-lg leading-7 break-words" role="alert">
          {displayError}
        </p>
      ) : null}
      {row.status === "ready" ? (
        <p className="text-lg leading-7">{t.firstMessageConfirmed}</p>
      ) : null}
      {row.assignedNumber === null ? null : (
        <>
          {row.status === "ready" ? null : (
            <p className="text-lg leading-7">{t.mustSendFirst(contactName)}</p>
          )}
          <FirstMessageInstructions
            assignedNumber={row.assignedNumber}
            contactLocale={contactLocale}
            contactName={contactName}
            handle={row.handle}
            key={row.assignedNumber}
          />
          {row.status === "ready" ? null : (
            <Button
              aria-busy={pending === "refresh"}
              className="max-w-full self-start whitespace-normal"
              disabled={busy}
              onClick={() => run("refresh")}
              size="sm"
              variant="outline"
            >
              {t.checkFirstMessage}
            </Button>
          )}
        </>
      )}
      {canRegister ? (
        <>
          <p className="text-lg leading-7">{t.linkExplanation}</p>
          <Button
            aria-busy={pending === "register"}
            className="max-w-full self-start whitespace-normal"
            disabled={busy}
            onClick={() => setConfirming(true)}
            size="sm"
            variant="outline"
          >
            {row.status === "failed" || currentActionError
              ? t.retryLink
              : t.link}
          </Button>
        </>
      ) : null}
      <Dialog
        description={t.confirmDescription}
        onOpenChange={setConfirming}
        open={confirming && canRegister && !busy}
        title={t.confirmTitle(contactName)}
      >
        <p className="text-lg break-words">
          {t.confirmLink}
          <strong>{row.handle}</strong>
          {t.confirmTo}
          <strong>{contactName}</strong>.
        </p>
        <p className="text-lg leading-7">{t.confirmLookup}</p>
        <p className="text-lg leading-7 break-words">
          {t.confirmInvitation(contactName, row.handle)}
        </p>
        <p className="text-lg leading-7">{t.confirmNoAccount(contactName)}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            className="max-w-full whitespace-normal"
            disabled={busy}
            onClick={() => run("register")}
          >
            {t.agreeAndLink}
          </Button>
          <Button onClick={() => setConfirming(false)} variant="ghost">
            {messages.common.cancel}
          </Button>
        </div>
      </Dialog>
    </>
  );
};

/** The one status a person's row shows for live iMessage, or null when nothing needs doing. */
const imessageRowStatus = (
  context: IMessageContext | undefined,
  row: IMessageContact | undefined,
  messages: Messages
): { label: string; tone: "negative" | "neutral" | "warning" } | null => {
  if (!context?.configured || context.practiceMode || !row) {
    return null;
  }

  const tone = STATUS_TONES[row.status];

  return row.status === "ready" || tone === "positive"
    ? null
    : { label: messages.imessageSetup.row[row.status], tone };
};

/** Live iMessage setup for one saved person, shown inside their edit panel. */
const ContactIMessageSetup = ({
  canManage,
  contactLocale,
  contactName,
  context,
  row,
}: {
  canManage: boolean;
  contactLocale: InterfaceLocale;
  contactName: string;
  context: IMessageContext | undefined;
  row: IMessageContact | undefined;
}) => {
  const headingId = useId();
  const t = useMessages().imessageSetup;
  let unavailable: string | null = null;

  if (!context) {
    unavailable = t.loading;
  } else if (context.practiceMode) {
    unavailable = t.practice(contactName);
  } else if (!context.configured) {
    unavailable = t.notConfigured;
  } else if (!canManage) {
    unavailable = t.ownerOnly;
  } else if (!row) {
    unavailable = t.needsAddress;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="border-rule flex min-w-0 flex-col gap-3 border-t pt-5"
    >
      <h3
        className="flex flex-wrap items-center gap-3 text-lg leading-7 font-semibold"
        id={headingId}
      >
        {t.heading}
        {context?.practiceMode ? <SimulatedPill /> : null}
      </h3>
      {unavailable ? (
        <p aria-live="polite" className="text-muted-foreground text-label">
          {unavailable}
        </p>
      ) : null}
      {unavailable === null && row ? (
        <IMessageEnrollment
          contactLocale={contactLocale}
          contactName={contactName}
          key={`${row.contactId}:${row.handle}`}
          row={row}
        />
      ) : null}
    </section>
  );
};

export { ContactIMessageSetup, imessageRowStatus };

export type { IMessageContact, IMessageContext };

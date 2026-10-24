"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { Dialog } from "@lifelink/ui/components/dialog";
import { Pill } from "@lifelink/ui/components/pill";
import { useAction } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { CopyIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { SimulatedPill } from "@/components/app/bits";
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

const STATUS_WORDS: Record<
  IMessageContact["status"],
  { label: string; tone: "negative" | "neutral" | "positive" | "warning" }
> = {
  failed: { label: "Setup needs attention", tone: "negative" },
  not_registered: { label: "Not linked", tone: "neutral" },
  ready: { label: "Ready for iMessage", tone: "positive" },
  registering: { label: "Linking", tone: "warning" },
  waiting: { label: "Waiting for their first message", tone: "warning" },
};

const FirstMessageInstructions = ({
  assignedNumber,
  contactName,
  handle,
}: {
  assignedNumber: string;
  contactName: string;
  handle: string;
}) => {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const instructions = `${contactName}: To start using iMessage with LifeLink, you must first send an iMessage (such as “Hello”) to ${assignedNumber} from your exact registered address: ${handle}. In Messages, make sure your conversation starts from ${handle}. A phone number and an Apple ID email are different identities, even on the same phone. A message from another address will not activate this one. You do not need a LifeLink account or a dashboard invitation.`;

  const copy = async (): Promise<void> => {
    setCopying(true);
    setCopied(false);
    setCopyError(null);

    try {
      await navigator.clipboard.writeText(instructions);
      setCopied(true);
    } catch {
      setCopyError(
        "Couldn’t copy the instructions. Select and copy the text above, or try Copy instructions again."
      );
    }

    setCopying(false);
  };

  return (
    <div className="bg-surface flex flex-col gap-3 rounded-lg px-4 py-4">
      <p className="text-lg">
        Assigned iMessage number:{" "}
        <span className="num font-semibold break-all">{assignedNumber}</span>
      </p>
      <p className="text-lg leading-7 break-words">{instructions}</p>
      <Button
        aria-busy={copying}
        className="max-w-full self-start whitespace-normal"
        disabled={copying}
        onClick={copy}
        size="sm"
        variant="outline"
      >
        <CopyIcon aria-hidden="true" />
        Copy instructions
      </Button>
      <output aria-live="polite" className="text-base">
        {copied
          ? `Instructions copied. Send them to ${contactName} yourself.`
          : null}
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
  contactName,
  row,
}: {
  contactName: string;
  row: IMessageContact;
}) => {
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

  const state = STATUS_WORDS[row.status];

  const currentActionError = currentErrorMessage(actionError, row);

  const displayError = currentActionError ?? row.error;

  const pendingMessage =
    pending === "refresh"
      ? "Checking for their first message…"
      : "Looking up this existing contact in Photon…";

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
          operation === "register"
            ? "Couldn’t link this contact. Check that this exact address is registered in the Photon dashboard, then try again."
            : "Couldn’t check for their first message. Please try again."
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
        Exact contact address: <strong>{row.handle}</strong>
      </p>
      <output aria-live="polite" className="text-base">
        {busy ? pendingMessage : null}
        {!busy && checked
          ? "Check complete. The current status is shown above."
          : null}
      </output>
      {displayError ? (
        <p className="text-negative text-lg leading-7 break-words" role="alert">
          {displayError}
        </p>
      ) : null}
      {row.status === "ready" ? (
        <p className="text-lg leading-7">
          Their first message has been confirmed. LifeLink can now message this
          registered address.
        </p>
      ) : null}
      {row.assignedNumber === null ? null : (
        <>
          {row.status === "ready" ? null : (
            <p className="text-lg leading-7">
              {contactName} must send the first message from their address shown
              above. Your own message will not activate their setup.
            </p>
          )}
          <FirstMessageInstructions
            assignedNumber={row.assignedNumber}
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
              Check for first message
            </Button>
          )}
        </>
      )}
      {canRegister ? (
        <>
          <p className="text-lg leading-7">
            Link the person already registered with this exact address in
            Photon. If they are not there, add them in the Photon dashboard
            first, then try again. LifeLink does not create new people.
          </p>
          <Button
            aria-busy={pending === "register"}
            className="max-w-full self-start whitespace-normal"
            disabled={busy}
            onClick={() => setConfirming(true)}
            size="sm"
            variant="outline"
          >
            {row.status === "failed" || currentActionError
              ? "Retry linking iMessage"
              : "Link iMessage"}
          </Button>
        </>
      ) : null}
      <Dialog
        description="Review the exact address and how it will be used before you continue."
        onOpenChange={setConfirming}
        open={confirming && canRegister && !busy}
        title={`Link iMessage for ${contactName}?`}
      >
        <p className="text-lg break-words">
          Link the existing Photon contact at <strong>{row.handle}</strong> to{" "}
          <strong>{contactName}</strong>.
        </p>
        <p className="text-lg leading-7">
          Continuing looks up this exact address in Photon, our iMessage
          provider, and reuses the existing contact. LifeLink does not register
          new people or use new seat capacity.
        </p>
        <p className="text-lg leading-7 break-words">
          No invitation message is sent. You’ll see the assigned number to share
          with {contactName}. They must text it first from {row.handle}. A phone
          number and an Apple ID email are different identities, even on the
          same phone.
        </p>
        <p className="text-lg leading-7">
          {contactName} does not need a LifeLink account or a dashboard
          invitation. This does not grant access to anything in your account.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            className="max-w-full whitespace-normal"
            disabled={busy}
            onClick={() => run("register")}
          >
            Agree and link this contact
          </Button>
          <Button onClick={() => setConfirming(false)} variant="ghost">
            Cancel
          </Button>
        </div>
      </Dialog>
    </>
  );
};

/** The one status a person's row shows for live iMessage, or null when nothing needs doing. */
const ROW_WORDS: Record<
  Exclude<IMessageContact["status"], "ready">,
  { label: string; tone: "negative" | "neutral" | "warning" }
> = {
  failed: { label: "iMessage needs attention", tone: "negative" },
  not_registered: { label: "iMessage not linked yet", tone: "neutral" },
  registering: { label: "Linking iMessage", tone: "warning" },
  waiting: { label: "Waiting for their first iMessage", tone: "warning" },
};

const imessageRowStatus = (
  context: IMessageContext | undefined,
  row: IMessageContact | undefined
): { label: string; tone: "negative" | "neutral" | "warning" } | null => {
  if (!context?.configured || context.practiceMode || !row) {
    return null;
  }

  return row.status === "ready" ? null : ROW_WORDS[row.status];
};

/** Live iMessage setup for one saved person, shown inside their edit panel. */
const ContactIMessageSetup = ({
  canManage,
  contactName,
  context,
  row,
}: {
  canManage: boolean;
  contactName: string;
  context: IMessageContext | undefined;
  row: IMessageContact | undefined;
}) => {
  const headingId = useId();
  let unavailable: string | null = null;

  if (!context) {
    unavailable = "Loading iMessage setup…";
  } else if (context.practiceMode) {
    unavailable = `Practice messages stay in LifeLink, so there is nothing to set up here. When you switch to real iMessage, you can link ${contactName} here.`;
  } else if (!context.configured) {
    unavailable =
      "App setup needed. Whoever runs LifeLink must connect Photon before you can set up iMessage for this contact.";
  } else if (!canManage) {
    unavailable =
      "Only the account owner can set up or check iMessage for their contacts.";
  } else if (!row) {
    unavailable =
      "An iMessage address is needed. Add their phone number or Apple ID email above, then save.";
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
        iMessage setup
        {context?.practiceMode ? <SimulatedPill /> : null}
      </h3>
      {unavailable ? (
        <p aria-live="polite" className="text-muted-foreground text-label">
          {unavailable}
        </p>
      ) : null}
      {unavailable === null && row ? (
        <IMessageEnrollment
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

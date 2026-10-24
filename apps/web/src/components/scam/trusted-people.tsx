"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { Avatar } from "@/components/app/bits";
import { usePreferences } from "@/components/app/preferences";
import { ScamTrustedPeopleLoading } from "@/components/app/scam-loading-layouts";
import type { CircleContact } from "@/components/circle/contact-form";
import { TrustedBadge } from "@/components/circle/contact-row";
import { messageOf } from "@/lib/errors";

interface TrustedPeopleProps {
  reviewId?: Id<"scamReviews">;
  message?: string;
  disabled?: boolean;
}

const CALL_HELP_MESSAGE =
  "I’m not sure about a call I received. Could you help me check whether it’s real before I share anything or send money?";

const PHONE_CHARACTERS = /^\+?[0-9 ().-]+$/u;
const PHONE_FORMATTING = /[ ().-]/gu;
const PHONE_NUMBER = /^(?:\+[1-9][0-9]{6,14}|[0-9]{7,15})$/u;

/** Only saved phone identities may become tel links; numeric Discord IDs are not phones. */
const phoneFor = (contact: CircleContact): string | null => {
  const addresses = [
    ...contact.channels
      .filter((channel) => channel.channel === "imessage")
      .toSorted(
        (left, right) => Number(right.preferred) - Number(left.preferred)
      )
      .map((channel) => channel.address),
    ...(contact.savedHandles ?? [])
      .filter((handle) => handle.service === "whatsapp")
      .map((handle) => handle.address),
  ];

  for (const address of addresses) {
    const trimmed = address.trim();

    if (!PHONE_CHARACTERS.test(trimmed)) {
      continue;
    }

    const number = trimmed.replaceAll(PHONE_FORMATTING, "");

    if (PHONE_NUMBER.test(number)) {
      return number;
    }
  }

  return null;
};

const REACHED_BY = {
  discord: "Reached by message",
  email: "Reached by email",
  imessage: "Reached by message",
  in_app: "Reached in LifeLink",
  telegram: "Reached by message",
} as const;

/** Match the backend's preferred-channel and linked-family fallback selection. */
const messageChannelFor = (contact: CircleContact) => {
  const saved =
    contact.channels.find((channel) => channel.preferred) ??
    contact.channels[0];

  if (saved) {
    return saved.address.trim() ? saved.channel : null;
  }

  return contact.linkedProfileId ? "in_app" : null;
};

const TrustedPersonRow = ({
  busy,
  canCall,
  contact,
  disabled,
  onMessage,
  reviewNoteId,
}: {
  busy: boolean;
  canCall: boolean;
  contact: CircleContact;
  disabled: boolean;
  onMessage: () => Promise<void>;
  reviewNoteId: string;
}) => {
  const phone = phoneFor(contact);
  const channel = messageChannelFor(contact);
  const fallbackId = useId();
  const needsDetails = phone === null || channel === null;
  const callEnabled = canCall && phone !== null && !disabled;

  return (
    <li className="border-rule grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 border-b py-5 last:border-b-0">
      <Avatar
        className="size-[3.111rem]"
        hue={contact.hue}
        name={contact.name}
        src={contact.avatarUrl}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-body font-semibold break-words">
            {contact.name}
          </span>
          <TrustedBadge />
        </div>
        <p className="text-muted-foreground text-body">
          {contact.relationship || "Contact"} ·{" "}
          {channel === null ? "No message address saved" : REACHED_BY[channel]}
        </p>
      </div>
      <div className="col-span-2 flex flex-wrap gap-3 sm:col-span-1 sm:col-start-2">
        {callEnabled ? (
          <a
            aria-label={`Call ${contact.name}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "text-body min-h-control flex-1 px-4"
            )}
            href={`tel:${phone}`}
          >
            <PhoneIcon aria-hidden="true" />
            Call
          </a>
        ) : null}
        {phone !== null && !callEnabled ? (
          <Button
            aria-describedby={needsDetails ? fallbackId : reviewNoteId}
            aria-label={`Call ${contact.name}`}
            className="text-body min-h-control flex-1 px-4"
            disabled
            type="button"
            variant="outline"
          >
            <PhoneIcon aria-hidden="true" />
            Call
          </Button>
        ) : null}
        <Button
          aria-busy={busy}
          aria-describedby={channel === null ? fallbackId : reviewNoteId}
          aria-label={`Message ${contact.name}`}
          className="text-body min-h-control flex-1 px-4"
          disabled={disabled || channel === null}
          onClick={onMessage}
          type="button"
          variant="outline"
        >
          <MessageCircleIcon aria-hidden="true" />
          {busy ? "Preparing…" : "Message"}
        </Button>
      </div>
      {needsDetails ? (
        <p
          className="text-muted-foreground text-body col-span-2"
          id={fallbackId}
        >
          {phone === null ? "No phone number is saved. " : null}
          {channel === null ? "No way to message them is saved. " : null}
          Add a way to reach them in your{" "}
          <Link
            className="font-medium underline underline-offset-4"
            href="/circle"
          >
            Trusted circle
          </Link>
          .
        </p>
      ) : null}
    </li>
  );
};

/** Real trusted people, with calls to saved numbers and message drafts that open review. */
const TrustedPeople = ({
  reviewId,
  message,
  disabled = false,
}: TrustedPeopleProps) => {
  const contacts = useQuery(api.contacts.list);
  const ask = useMutation(api.scam.askTrustedContact);
  const draft = useMutation(api.messages.draft);
  const { me } = usePreferences();

  const router = useRouter();

  const [busyContactId, setBusyContactId] = useState<Id<"contacts"> | null>(
    null
  );

  const [failure, setFailure] = useState<string | null>(null);
  const preparing = useRef(false);
  const reviewNoteId = useId();
  const body = message ?? CALL_HELP_MESSAGE;
  const canCall = me?.profile?.demoMode === false;
  const trusted = contacts?.filter((contact) => contact.trusted);

  const prepareMessage = async (contact: CircleContact): Promise<void> => {
    if (disabled || preparing.current || messageChannelFor(contact) === null) {
      return;
    }

    preparing.current = true;
    setBusyContactId(contact._id);
    setFailure(null);

    try {
      const taskId = reviewId
        ? await ask({ contactId: contact._id, reviewId })
        : await draft({ body, contactId: contact._id, photoIds: [] });

      // SAFETY: this stored task ID came from the draft mutation; /tasks/[taskId] is a real route.
      router.push(`/tasks/${taskId}` as Route);
    } catch (error) {
      setFailure(
        `The message to ${contact.name} couldn’t be prepared. ${messageOf(error instanceof Error ? error : null)} Nothing was sent. Try Message again.`
      );
      preparing.current = false;
      setBusyContactId(null);
    }
  };

  if (trusted === undefined) {
    return (
      <div aria-busy="true" aria-label="Loading trusted people">
        <div aria-hidden="true">
          <ScamTrustedPeopleLoading />
        </div>
        <output className="sr-only">Loading trusted people</output>
      </div>
    );
  }

  if (trusted.length === 0) {
    return (
      <p className="text-body">
        Add someone you trust to your{" "}
        <Link
          className="font-medium underline underline-offset-4"
          href="/circle"
        >
          Trusted circle
        </Link>{" "}
        to ask for help checking this.
      </p>
    );
  }

  return (
    <div className="text-body flex min-w-0 flex-col gap-3">
      <ul aria-label="Trusted people" className="flex min-w-0 flex-col">
        {trusted.map((contact) => (
          <TrustedPersonRow
            busy={busyContactId === contact._id}
            canCall={canCall}
            contact={contact}
            disabled={disabled || busyContactId !== null}
            key={contact._id}
            onMessage={() => prepareMessage(contact)}
            reviewNoteId={reviewNoteId}
          />
        ))}
      </ul>
      <div className="flex flex-col gap-2" id={reviewNoteId}>
        {reviewId ? (
          <p className="text-muted-foreground">
            Message prepares a request about this check. It opens for your
            review before you decide whether to send it.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Message opens a draft for your review. You can change it before
            approving. Nothing is sent now.
          </p>
        )}
        {me?.profile?.demoMode ? (
          <p className="text-muted-foreground">
            Calls are unavailable in Practice mode.
          </p>
        ) : null}
        {me?.profile ? null : (
          <p className="text-muted-foreground">
            Calls are unavailable until your account settings load.
          </p>
        )}
        {disabled ? (
          <p className="text-muted-foreground">
            Call and Message are unavailable right now.
          </p>
        ) : null}
      </div>

      {failure ? (
        <p className="text-negative" role="alert">
          {failure}
        </p>
      ) : null}
    </div>
  );
};

export { TrustedPeople };

export type { TrustedPeopleProps };

"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { interfaceLocaleOf } from "@lifelink/contracts/locale";
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
import { messagesFor, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

interface TrustedPeopleProps {
  reviewId?: Id<"scamReviews">;
  message?: string;
  disabled?: boolean;
}

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
  const needsDetails = channel === null;
  const callEnabled = canCall && phone !== null && !disabled;
  const t = useMessages().trustedPeople;

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
          {contact.relationship || t.contactFallback} ·{" "}
          {channel === null ? t.noMessageAddress : t.reachedBy[channel]}
        </p>
      </div>
      <div className="col-span-2 flex flex-wrap gap-3 sm:col-span-1 sm:col-start-2">
        {callEnabled ? (
          <a
            aria-label={t.callAria(contact.name)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "min-h-control flex-1 px-4"
            )}
            href={`tel:${phone}`}
          >
            <PhoneIcon aria-hidden="true" />
            {t.call}
          </a>
        ) : null}
        {phone !== null && !callEnabled ? (
          <Button
            aria-describedby={needsDetails ? fallbackId : reviewNoteId}
            aria-label={t.callAria(contact.name)}
            className="min-h-control flex-1 px-4"
            disabled
            type="button"
            variant="outline"
          >
            <PhoneIcon aria-hidden="true" />
            {t.call}
          </Button>
        ) : null}
        <Button
          aria-busy={busy}
          aria-describedby={channel === null ? fallbackId : reviewNoteId}
          aria-label={t.prepareAria(contact.name)}
          className="min-h-control flex-1 px-4"
          disabled={disabled || channel === null}
          onClick={onMessage}
          type="button"
          variant="outline"
        >
          <MessageCircleIcon aria-hidden="true" />
          {busy ? t.preparing : t.prepare}
        </Button>
      </div>
      {needsDetails ? (
        <p
          className="text-muted-foreground text-body col-span-2"
          id={fallbackId}
        >
          {phone === null ? t.noPhone : null}
          {channel === null ? t.noWayToMessage : null}
          {t.saveDetails}
          <Link
            className="font-medium underline underline-offset-4"
            href="/circle"
          >
            {t.trustedCircle}
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
  const t = useMessages().trustedPeople;
  const canCall = me?.profile?.demoMode === false;

  // A message they will read, so in their language.
  const bodyFor = (contact: CircleContact): string =>
    message ??
    messagesFor(
      contact.language ?? interfaceLocaleOf(me?.preferences?.supportLanguage)
    ).trustedPeople.callHelpMessage;

  const trusted = contacts?.filter(
    (contact) => contact.trusted && !contact.sample
  );

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
        : await draft({
            body: bodyFor(contact),
            contactId: contact._id,
            photoIds: [],
          });

      // SAFETY: this stored task ID came from the draft mutation; /tasks/[taskId] is a real route.
      router.push(`/tasks/${taskId}` as Route);
    } catch (error) {
      setFailure(
        t.failed(contact.name, messageOf(error instanceof Error ? error : null))
      );
      preparing.current = false;
      setBusyContactId(null);
    }
  };

  if (trusted === undefined) {
    return (
      <div aria-busy="true" aria-label={t.loading}>
        <div aria-hidden="true">
          <ScamTrustedPeopleLoading />
        </div>
        <output className="sr-only">{t.loading}</output>
      </div>
    );
  }

  if (trusted.length === 0) {
    return (
      <div className="bg-parchment flex flex-col gap-3 rounded-xl p-5">
        <p className="text-body">
          {t.empty}
          <Link
            className="font-medium underline underline-offset-4"
            href="/circle"
          >
            {t.trustedCircle}
          </Link>
          {t.emptyRest}
        </p>
        <Link className={buttonVariants({ variant: "outline" })} href="/circle">
          {t.add}
        </Link>
      </div>
    );
  }

  return (
    <div className="text-body flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2" id={reviewNoteId}>
        <p>{reviewId ? t.introCheck : t.introCall}</p>
        {me?.profile?.demoMode ? (
          <p className="text-muted-foreground">{t.callsPractice}</p>
        ) : null}
        {me?.profile ? null : (
          <p className="text-muted-foreground">{t.callsLoading}</p>
        )}
        {disabled ? (
          <p className="text-muted-foreground">{t.unavailable}</p>
        ) : null}
      </div>
      <ul aria-label={t.list} className="flex min-w-0 flex-col">
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

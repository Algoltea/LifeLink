"use client";

import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { MessageCircleIcon, PencilIcon, ShieldCheckIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode, Ref } from "react";

import { Avatar } from "@/components/app/bits";
import { IsoIcon } from "@/components/app/iso-icon";
import { useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";

import type { CircleContact } from "./contact-form";
import { imessageRowStatus } from "./contact-imessage-setup";
import type {
  IMessageContact,
  IMessageContext,
} from "./contact-imessage-setup";

/** How messages reach them, in words, without the address itself. */
const reachLine = (contact: CircleContact, t: Messages["circle"]): string => {
  const preferred =
    contact.channels.find((channel) => channel.preferred) ??
    contact.channels[0];

  if (preferred) {
    return t.reachedBy[preferred.channel];
  }

  if (contact.telegram && !contact.telegram.linked) {
    return t.reachTelegramWaiting;
  }

  return (contact.savedHandles ?? []).length > 0
    ? t.reachWhatsappSaved
    : t.reachNone;
};

/** Marks someone in the trusted circle. The word carries the meaning; the key is decoration. */
const TrustedBadge = () => {
  const t = useMessages();

  return (
    <span className="text-label inline-flex items-center gap-1 font-medium">
      <IsoIcon kind="trusted" size={28} />
      {t.circle.trusted}
    </span>
  );
};

/** One person: who they are, how they're reached, and at most one status. Changes live behind Edit. */
const ContactRow = ({
  contact,
  editRef,
  imessageContext,
  imessageRow,
  onEdit,
  onPermissions,
  permissions,
  permissionsOpen,
  sharingSummary,
}: {
  contact: CircleContact;
  editRef: Ref<HTMLButtonElement>;
  imessageContext: IMessageContext | undefined;
  imessageRow: IMessageContact | undefined;
  onEdit: () => void;
  onPermissions: () => void;
  permissions: ReactNode;
  permissionsOpen: boolean;
  sharingSummary: string;
}) => {
  const usesIMessage = contact.channels.some(
    (channel) => channel.channel === "imessage"
  );

  const messages = useMessages();
  const t = messages.circle;

  const status = usesIMessage
    ? imessageRowStatus(imessageContext, imessageRow, messages)
    : null;

  return (
    <li className="border-rule grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b pb-5 last:border-b-0 @4xl/content:grid-cols-[auto_minmax(0,1fr)_auto]">
      <Avatar
        className="self-start sm:self-center"
        hue={contact.hue}
        name={contact.name}
        src={contact.avatarUrl}
      />
      <div className="flex min-w-0 flex-col">
        <span className="flex flex-wrap items-center gap-x-3">
          <span className="text-body font-semibold break-words">
            {contact.name}
          </span>
          {contact.trusted ? <TrustedBadge /> : null}
          {contact.sample ? <Pill>{t.practiceContact}</Pill> : null}
        </span>
        <span className="text-muted-foreground text-label">
          {contact.relationship || t.contactFallback} · {reachLine(contact, t)}
        </span>
        <p className="text-label mt-2 wrap-anywhere">{sharingSummary}</p>
        {status ? (
          <span className="flex pt-1.5">
            <Pill className="text-label whitespace-normal" tone={status.tone}>
              {status.label}
            </Pill>
          </span>
        ) : null}
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-2 @4xl/content:col-span-1 @4xl/content:col-start-3 @4xl/content:row-start-1">
        <Link
          className={buttonVariants({ size: "sm", variant: "outline" })}
          // SAFETY: a stored contact id, and /messages/[contactId] is a real route.
          href={`/messages/${contact._id}` as Route}
        >
          <MessageCircleIcon aria-hidden="true" />
          {t.message}
          <span className="sr-only"> {contact.name}</span>
        </Link>
        <Button
          aria-controls={`permissions-${contact._id}`}
          aria-expanded={permissionsOpen}
          onClick={onPermissions}
          variant="outline"
        >
          <ShieldCheckIcon aria-hidden="true" />
          {t.permissions}
          <span className="sr-only">{t.permissionsFor(contact.name)}</span>
        </Button>
        <Button onClick={onEdit} ref={editRef} size="sm" variant="ghost">
          <PencilIcon aria-hidden="true" />
          {t.edit}
          <span className="sr-only"> {contact.name}</span>
        </Button>
      </div>
      <div
        className="col-span-2 min-w-0 @4xl/content:col-span-3"
        hidden={!permissionsOpen}
        id={`permissions-${contact._id}`}
      >
        {permissionsOpen ? permissions : null}
      </div>
    </li>
  );
};

export { ContactRow, TrustedBadge };

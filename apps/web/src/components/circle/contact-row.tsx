"use client";

import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { MessageCircleIcon, PencilIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { Ref } from "react";

import { Avatar } from "@/components/app/bits";
import { IsoIcon } from "@/components/app/iso-icon";

import type { CircleContact } from "./contact-form";
import { imessageRowStatus } from "./contact-imessage-setup";
import type {
  IMessageContact,
  IMessageContext,
} from "./contact-imessage-setup";

/** How messages reach them, in words, without the address itself. */
const REACHED_BY: Record<CircleContact["channels"][number]["channel"], string> =
  {
    discord: "Reached by Discord",
    email: "Reached by email",
    imessage: "Reached by iMessage",
    in_app: "Reached in LifeLink",
  };

const reachLine = (contact: CircleContact): string => {
  const preferred =
    contact.channels.find((channel) => channel.preferred) ??
    contact.channels[0];

  if (preferred) {
    return REACHED_BY[preferred.channel];
  }

  return (contact.savedHandles ?? []).length > 0
    ? "WhatsApp saved. Can’t message yet"
    : "No way to reach them yet";
};

/** Marks someone in the trusted circle. The word carries the meaning; the key is decoration. */
const TrustedBadge = () => (
  <span className="text-label inline-flex items-center gap-1 font-medium">
    <IsoIcon kind="trusted" size={28} />
    Trusted
  </span>
);

/** One person: who they are, how they're reached, and at most one status. Changes live behind Edit. */
const ContactRow = ({
  contact,
  editRef,
  imessageContext,
  imessageRow,
  onEdit,
}: {
  contact: CircleContact;
  editRef: Ref<HTMLButtonElement>;
  imessageContext: IMessageContext | undefined;
  imessageRow: IMessageContact | undefined;
  onEdit: () => void;
}) => {
  const usesIMessage = contact.channels.some(
    (channel) => channel.channel === "imessage"
  );

  const status = usesIMessage
    ? imessageRowStatus(imessageContext, imessageRow)
    : null;

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-xl px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
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
        </span>
        <span className="text-muted-foreground text-label">
          {contact.relationship || "Contact"} · {reachLine(contact)}
        </span>
        {status ? (
          <span className="flex pt-1.5">
            <Pill className="text-label whitespace-normal" tone={status.tone}>
              {status.label}
            </Pill>
          </span>
        ) : null}
      </div>
      <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-3 sm:row-start-1">
        <Link
          className={buttonVariants({ size: "sm", variant: "outline" })}
          // SAFETY: a stored contact id, and /messages/[contactId] is a real route.
          href={`/messages/${contact._id}` as Route}
        >
          <MessageCircleIcon aria-hidden="true" />
          Message
          <span className="sr-only"> {contact.name}</span>
        </Link>
        <Button onClick={onEdit} ref={editRef} size="sm" variant="ghost">
          <PencilIcon aria-hidden="true" />
          Edit
          <span className="sr-only"> {contact.name}</span>
        </Button>
      </div>
    </li>
  );
};

export { ContactRow, TrustedBadge };

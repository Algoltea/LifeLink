"use client";

import { Button } from "@lifelink/ui/components/button";
import { UserMinusIcon } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { ContactForm } from "./contact-form";
import type { CircleContact } from "./contact-form";
import { ContactIMessageSetup } from "./contact-imessage-setup";
import type {
  IMessageContact,
  IMessageContext,
} from "./contact-imessage-setup";
import { ContactTelegramSetup } from "./contact-telegram-setup";

/**
 * Add or edit a person in place, where they sit in the list. Everything about
 * one person lives here: their details, live iMessage and Telegram setup,
 * and removal.
 */
const ContactEditor = ({
  canManage,
  contact,
  imessageContext,
  imessageRow,
  onDone,
  onRemove,
}: {
  canManage: boolean;
  contact: CircleContact | null;
  imessageContext: IMessageContext | undefined;
  imessageRow: IMessageContact | undefined;
  onDone: () => void;
  onRemove?: () => void;
}) => {
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const title = contact === null ? "Add a person" : `Edit ${contact.name}`;
  const firstName = contact?.name.split(" ")[0] ?? "";

  const usesIMessage =
    contact?.channels.some((channel) => channel.channel === "imessage") ??
    false;

  // Opening the panel moves focus to its heading, so it's announced and in view.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby={headingId}
      className="border-border bg-parchment flex min-w-0 flex-col gap-5 rounded-xl border p-5 sm:p-6"
    >
      <h3
        className="text-section font-semibold outline-none"
        id={headingId}
        ref={heading}
        tabIndex={-1}
      >
        {title}
      </h3>
      <ContactForm
        contact={contact}
        key={contact?._id ?? "new"}
        onDone={onDone}
      />
      {contact !== null && usesIMessage ? (
        <ContactIMessageSetup
          canManage={canManage}
          contactName={contact.name}
          context={imessageContext}
          row={imessageRow}
        />
      ) : null}
      {contact === null ? null : (
        <ContactTelegramSetup
          canManage={canManage}
          contactId={contact._id}
          contactName={contact.name}
        />
      )}
      {contact === null || onRemove === undefined ? null : (
        <div className="border-rule flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <p className="text-muted-foreground text-label min-w-0 flex-1 basis-64">
            Removing {firstName} also stops anything you share with them.
          </p>
          <Button
            className="text-negative hover:text-negative"
            onClick={onRemove}
            size="sm"
            variant="outline"
          >
            <UserMinusIcon aria-hidden="true" />
            {firstName === "" ? "Remove this person…" : `Remove ${firstName}…`}
          </Button>
        </div>
      )}
    </section>
  );
};

export { ContactEditor };

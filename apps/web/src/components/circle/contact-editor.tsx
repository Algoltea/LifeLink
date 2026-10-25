"use client";

import { interfaceLocaleOf } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { UserMinusIcon } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { usePreferences } from "@/components/app/preferences";
import { useMessages } from "@/i18n/locale";

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
  const t = useMessages().circle;
  const { me } = usePreferences();
  const title = contact === null ? t.addPerson : t.editPerson(contact.name);

  // Invitations they will read are written in their language.
  const contactLocale =
    contact?.language ?? interfaceLocaleOf(me?.preferences?.supportLanguage);

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
          contactLocale={contactLocale}
          contactName={contact.name}
          context={imessageContext}
          row={imessageRow}
        />
      ) : null}
      {contact === null ? null : (
        <ContactTelegramSetup
          canManage={canManage}
          contactId={contact._id}
          contactLocale={contactLocale}
          contactName={contact.name}
        />
      )}
      {contact === null || onRemove === undefined ? null : (
        <div className="border-rule flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <p className="text-muted-foreground text-label min-w-0 flex-1 basis-64">
            {t.removeStopsSharing(firstName)}
          </p>
          <Button
            className="text-negative hover:text-negative"
            onClick={onRemove}
            size="sm"
            variant="outline"
          >
            <UserMinusIcon aria-hidden="true" />
            {firstName === "" ? t.removePerson : t.removeNamed(firstName)}
          </Button>
        </div>
      )}
    </section>
  );
};

export { ContactEditor };

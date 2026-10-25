import type { ActionDetails } from "@lifelink/contracts/actions";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { cn } from "@lifelink/ui/lib/utils";
import type { ReactNode } from "react";

import { Avatar, ReadAloudButton } from "@/components/app/bits";
import { getLocale, messagesFor, useLocale, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { formatWhen, money } from "@/lib/format";

const US_PHONE = /^\+1(?<area>\d{3})(?<exchange>\d{3})(?<line>\d{4})$/u;

/** "+15555550142" becomes "+1 (555) 555-0142"; other addresses are shown as stored. */
const formatAddress = (address: string): string => {
  const parts = US_PHONE.exec(address)?.groups;

  return parts === undefined
    ? address
    : `+1 (${parts.area}) ${parts.exchange}-${parts.line}`;
};

type Channel = "discord" | "email" | "imessage" | "in_app" | "telegram";

/** Channels whose address is an internal id, meaningless to show a person. */
const hidesAddress = (channel: Channel): boolean =>
  channel === "in_app" || channel === "telegram";

/**
 * The exact, consequential details of an action, shown the way they will
 * happen. A message is a slip with its recipient and route above a rule;
 * the words are set large and exactly as they will be sent.
 */
const MessageSlip = ({
  details,
  hue,
  bodyEditor,
}: {
  details: Extract<ActionDetails, { kind: "send_message" }>;
  hue: number;
  bodyEditor?: ReactNode;
}) => {
  const messages = useMessages();
  const t = messages.actionDetails;

  return (
    <div className="border-border bg-raised overflow-hidden rounded-xl border">
      <div className="border-border flex items-center gap-4 border-b px-6 py-5">
        <Avatar hue={hue} name={details.contactName} />
        <div className="flex min-w-0 flex-col">
          <span className="text-xl font-bold [overflow-wrap:anywhere]">
            {t.toName(details.contactName)}
          </span>
          <span className="text-muted-foreground text-base [overflow-wrap:anywhere]">
            {t.by(messages.threads.channels[details.channel])}
            {hidesAddress(details.channel)
              ? ""
              : t.toAddress(formatAddress(details.address))}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-7">
        {bodyEditor ?? (
          <p className="text-body leading-relaxed wrap-anywhere whitespace-pre-wrap">
            {details.body}
          </p>
        )}
        {details.photoIds.length > 0 ? (
          <p className="text-muted-foreground text-base">
            {t.withPhotos(details.photoIds.length)}
          </p>
        ) : null}
        {bodyEditor ? null : (
          <ReadAloudButton
            className="self-start"
            label={t.readMessage}
            text={details.body}
          />
        )}
      </div>
    </div>
  );
};

const Fact = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <dt className="text-muted-foreground text-base">{label}</dt>
    <dd className="text-xl font-semibold [overflow-wrap:anywhere]">
      {children}
    </dd>
  </div>
);

/** What a card says, as one passage for Read aloud: the words exactly as they will go out. */
const spokenDetails = (
  details: ActionDetails,
  timeZone: string,
  locale: InterfaceLocale = getLocale()
): string => {
  const words = messagesFor(locale);
  const t = words.actionDetails.spoken;

  switch (details.kind) {
    case "send_message": {
      const route = hidesAddress(details.channel)
        ? ""
        : words.actionDetails.toAddress(formatAddress(details.address));

      return t.message(
        details.contactName,
        words.threads.channels[details.channel],
        route,
        details.body
      );
    }

    case "confirm_arrangement": {
      return t.confirm(translateServerMessage(details.summary, locale));
    }

    case "create_reminder": {
      return t.reminder(
        details.title,
        formatWhen(details.remindAt, timeZone, locale),
        details.shareWithCircle
      );
    }

    case "family_update": {
      return t.update(details.text);
    }

    case "grocery_handoff": {
      const items = details.items.map((item) =>
        item.quantity === null
          ? item.name
          : `${item.quantity}${item.unit ? ` ${item.unit}` : ""} ${item.name}`
      );

      return `${details.listName}: ${items.join(", ")}.`;
    }

    case "email_draft": {
      return t.email(details.to, details.subject, details.body);
    }

    case "email_reply": {
      return `Reply to ${details.to}. Subject: ${details.subject}. It says: ${details.body}`;
    }

    case "calendar_event": {
      return t.calendar(
        details.title,
        formatWhen(details.startsAt, timeZone, locale),
        details.location
      );
    }

    case "drive_note": {
      return t.driveNote(details.title, details.body);
    }

    default: {
      return details satisfies never;
    }
  }
};

const EmailSlip = ({
  details,
  bodyEditor,
  className,
}: {
  details: Extract<ActionDetails, { kind: "email_draft" | "email_reply" }>;
  bodyEditor?: ReactNode;
  className?: string;
}) => {
  const t = useMessages().actionDetails;

  return (
    <div
      className={cn(
        "border-border bg-raised flex flex-col gap-4 rounded-xl border px-6 py-6",
        className
      )}
    >
      {/* Stacked like an email header, so long addresses never crowd the subject. */}
      <dl className="border-border grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-b pb-4 text-base">
        <dt className="text-muted-foreground">{t.to}</dt>
        <dd className="[overflow-wrap:anywhere]">{details.to}</dd>
        <dt className="text-muted-foreground">{t.subject}</dt>
        <dd className="font-medium [overflow-wrap:anywhere]">
          {details.subject}
        </dd>
      </dl>
      {bodyEditor ?? (
        <p className="text-body leading-relaxed wrap-anywhere whitespace-pre-wrap">
          {details.body}
        </p>
      )}
      {bodyEditor ? null : (
        <ReadAloudButton
          className="self-start"
          label={t.readEmail}
          text={t.spoken.emailAloud(details.subject, details.body)}
        />
      )}
      <p className="text-muted-foreground text-base">
        {t.draftSavedIn(details.provider === "gmail" ? "Gmail" : "Outlook")}
      </p>
    )}
    {bodyEditor ? null : (
      <ReadAloudButton
        className="self-start"
        label="Read the email aloud"
        text={`Subject: ${details.subject}. ${details.body}`}
      />
    )}
    <p className="text-muted-foreground text-base">
      {details.kind === "email_reply"
        ? `Sent from your ${details.provider === "gmail" ? "Gmail" : "Outlook"} as a reply in the same conversation, only after you approve it.`
        : `Saved as a draft in your ${details.provider === "gmail" ? "Gmail" : "Outlook"}. It is not sent until you send it there.`}
    </p>
  </div>
);

const DetailsView = ({
  bodyEditor,
  className,
  details,
  granteeNames,
  hue,
  timeZone,
}: {
  bodyEditor?: ReactNode;
  className?: string;
  details: ActionDetails;
  granteeNames: string[];
  hue: number;
  timeZone: string;
}) => {
  const messages = useMessages();
  const locale = useLocale();
  const t = messages.actionDetails;

  switch (details.kind) {
    case "send_message": {
      return (
        <MessageSlip details={details} hue={hue} bodyEditor={bodyEditor} />
      );
    }

    case "confirm_arrangement": {
      return (
        <div
          className={cn(
            "border-border bg-raised flex flex-col gap-2 rounded-xl border px-6 py-6",
            className
          )}
        >
          <span className="text-muted-foreground text-base">
            {t.confirming}
          </span>
          <p className="text-2xl leading-snug font-semibold">
            {translateServerMessage(details.summary, locale)}
          </p>
        </div>
      );
    }

    case "create_reminder": {
      return (
        <dl
          className={cn(
            "border-border bg-raised grid gap-5 rounded-xl border px-6 py-6 sm:grid-cols-2",
            className
          )}
        >
          <Fact label={t.reminder}>{details.title}</Fact>
          <Fact label={t.when}>
            {formatWhen(details.remindAt, timeZone, locale)}
          </Fact>
          <Fact label={t.sharedWithCircle}>
            {details.shareWithCircle ? t.yesShared : t.noJustYou}
          </Fact>
        </dl>
      );
    }

    case "family_update": {
      const scope = messages.sharing.scopes[details.scope];

      return (
        <div
          className={cn(
            "border-border bg-raised flex flex-col gap-4 rounded-xl border px-6 py-6",
            className
          )}
        >
          <p className="text-2xl leading-snug">{details.text}</p>
          <ReadAloudButton
            className="self-start"
            label={t.readUpdate}
            text={details.text}
          />
          <p className="text-muted-foreground text-base">
            {t.onlyGrantees(
              granteeNames.length > 0
                ? granteeNames.join(t.and)
                : t.peopleYouAllowed,
              scope.label.toLowerCase()
            )}
          </p>
        </div>
      );
    }

    case "grocery_handoff": {
      return (
        <div
          className={cn(
            "border-border bg-raised flex flex-col gap-4 rounded-xl border px-6 py-6",
            className
          )}
        >
          <p className="text-xl font-semibold">
            {t.itemCount(details.listName, details.items.length)}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-lg">
            {details.items.map((item) => (
              <li key={`${item.name}-${item.quantity ?? ""}`}>
                {item.name}
                {item.quantity === null
                  ? ""
                  : ` × ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-base">
            {details.estimatedCents === null
              ? t.noEstimate
              : t.estimate(money(details.estimatedCents, locale))}
            {details.budgetCents === null
              ? ""
              : t.budget(money(details.budgetCents, locale))}
          </p>
          <p className="text-muted-foreground text-base">{t.shoppingRecord}</p>
        </div>
      );
    }

    case "email_draft":
    case "email_reply": {
      return (
        <EmailSlip
          details={details}
          bodyEditor={bodyEditor}
          className={className}
        />
      );
    }

    case "calendar_event": {
      return (
        <dl
          className={cn(
            "border-border bg-raised grid gap-5 rounded-xl border px-6 py-6 sm:grid-cols-2",
            className
          )}
        >
          <Fact label={t.event}>{details.title}</Fact>
          <Fact label={t.starts}>
            {formatWhen(details.startsAt, timeZone, locale)}
          </Fact>
          <Fact label={t.where}>{details.location ?? t.notGiven}</Fact>
          <Fact label={t.calendar}>
            {details.provider === "google_calendar"
              ? "Google Calendar"
              : "Outlook"}
          </Fact>
        </dl>
      );
    }

    case "drive_note": {
      return (
        <div
          className={cn(
            "border-border bg-raised flex flex-col gap-4 rounded-xl border px-6 py-6",
            className
          )}
        >
          <dl className="grid gap-4">
            <Fact label={t.document}>{details.title}</Fact>
          </dl>
          <p className="text-xl leading-snug [overflow-wrap:anywhere] whitespace-pre-wrap">
            {details.body}
          </p>
          <ReadAloudButton
            className="self-start"
            label={t.readNote}
            text={details.body}
          />
          <p className="text-muted-foreground text-base">{t.driveNoteHint}</p>
        </div>
      );
    }

    default: {
      return details satisfies never;
    }
  }
};

export { DetailsView, formatAddress, hidesAddress, spokenDetails };

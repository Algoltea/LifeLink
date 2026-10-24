import type { ActionDetails } from "@lifelink/contracts/actions";
import { sharingScopes } from "@lifelink/contracts/sharing";
import { cn } from "@lifelink/ui/lib/utils";
import type { ReactNode } from "react";

import { Avatar, ReadAloudButton } from "@/components/app/bits";
import { formatWhen, money } from "@/lib/format";

const US_PHONE = /^\+1(?<area>\d{3})(?<exchange>\d{3})(?<line>\d{4})$/u;

/** "+15555550142" becomes "+1 (555) 555-0142"; other addresses are shown as stored. */
const formatAddress = (address: string): string => {
  const parts = US_PHONE.exec(address)?.groups;

  return parts === undefined
    ? address
    : `+1 (${parts.area}) ${parts.exchange}-${parts.line}`;
};

const CHANNEL_WORDS: Record<
  "discord" | "email" | "imessage" | "in_app" | "telegram",
  string
> = {
  discord: "Discord direct message",
  email: "Email",
  imessage: "iMessage",
  in_app: "LifeLink message",
  telegram: "Telegram",
};

/** Channels whose address is an internal id, meaningless to show a person. */
const hidesAddress = (channel: keyof typeof CHANNEL_WORDS): boolean =>
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
}) => (
  <div className="border-border bg-raised overflow-hidden rounded-xl border">
    <div className="border-border flex items-center gap-4 border-b px-6 py-5">
      <Avatar hue={hue} name={details.contactName} />
      <div className="flex min-w-0 flex-col">
        <span className="text-xl font-bold [overflow-wrap:anywhere]">
          To {details.contactName}
        </span>
        <span className="text-muted-foreground text-base [overflow-wrap:anywhere]">
          By {CHANNEL_WORDS[details.channel]}
          {hidesAddress(details.channel)
            ? ""
            : ` to ${formatAddress(details.address)}`}
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
          With {details.photoIds.length}{" "}
          {details.photoIds.length === 1 ? "photo" : "photos"}.
        </p>
      ) : null}
      {bodyEditor ? null : (
        <ReadAloudButton
          className="self-start"
          label="Read the message aloud"
          text={details.body}
        />
      )}
    </div>
  </div>
);

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
const spokenDetails = (details: ActionDetails, timeZone: string): string => {
  switch (details.kind) {
    case "send_message": {
      const route = hidesAddress(details.channel)
        ? ""
        : ` to ${formatAddress(details.address)}`;

      return `To ${details.contactName}, by ${CHANNEL_WORDS[details.channel]}${route}. The message says: ${details.body}`;
    }

    case "confirm_arrangement": {
      return `You're confirming: ${details.summary}`;
    }

    case "create_reminder": {
      return `Reminder: ${details.title}. ${formatWhen(details.remindAt, timeZone)}. ${details.shareWithCircle ? "Shared with your trusted circle." : "Just for you."}`;
    }

    case "family_update": {
      return `The update says: ${details.text}`;
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
      return `Email to ${details.to}. Subject: ${details.subject}. It says: ${details.body}`;
    }

    case "calendar_event": {
      return `${details.title}. ${formatWhen(details.startsAt, timeZone)}${details.location ? `, at ${details.location}` : ""}.`;
    }

    case "drive_note": {
      return `A note in your Google Drive called ${details.title}. It says: ${details.body}`;
    }

    default: {
      return details satisfies never;
    }
  }
};

const EmailDraftSlip = ({
  details,
  bodyEditor,
  className,
}: {
  details: Extract<ActionDetails, { kind: "email_draft" }>;
  bodyEditor?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "border-border bg-raised flex flex-col gap-4 rounded-xl border px-6 py-6",
      className
    )}
  >
    {/* Stacked like an email header, so long addresses never crowd the subject. */}
    <dl className="border-border grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-b pb-4 text-base">
      <dt className="text-muted-foreground">To</dt>
      <dd className="[overflow-wrap:anywhere]">{details.to}</dd>
      <dt className="text-muted-foreground">Subject</dt>
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
        label="Read the email aloud"
        text={`Subject: ${details.subject}. ${details.body}`}
      />
    )}
    <p className="text-muted-foreground text-base">
      Saved as a draft in your{" "}
      {details.provider === "gmail" ? "Gmail" : "Outlook"}. It is not sent until
      you send it there.
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
            You’re confirming
          </span>
          <p className="text-2xl leading-snug font-semibold">
            {details.summary}
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
          <Fact label="Reminder">{details.title}</Fact>
          <Fact label="When">{formatWhen(details.remindAt, timeZone)}</Fact>
          <Fact label="Shared with your trusted circle">
            {details.shareWithCircle ? "Yes" : "No, just you"}
          </Fact>
        </dl>
      );
    }

    case "family_update": {
      const scope = sharingScopes.find((item) => item.id === details.scope);

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
            label="Read the update aloud"
            text={details.text}
          />
          <p className="text-muted-foreground text-base">
            Only{" "}
            {granteeNames.length > 0
              ? granteeNames.join(" and ")
              : "people you allowed"}{" "}
            will see this, because you share{" "}
            {scope?.label.toLowerCase() ?? "this"} with them.
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
            {details.listName}: {details.items.length}{" "}
            {details.items.length === 1 ? "item" : "items"}
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
              ? "No estimate yet."
              : `Your estimate: ${money(details.estimatedCents)}.`}
            {details.budgetCents === null
              ? ""
              : ` Budget: ${money(details.budgetCents)}.`}
          </p>
          <p className="text-muted-foreground text-base">
            This is a record of an earlier shopping request. Shopping through
            LifeLink is no longer available.
          </p>
        </div>
      );
    }

    case "email_draft": {
      return (
        <EmailDraftSlip
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
          <Fact label="Event">{details.title}</Fact>
          <Fact label="Starts">{formatWhen(details.startsAt, timeZone)}</Fact>
          <Fact label="Where">{details.location ?? "Not given"}</Fact>
          <Fact label="Calendar">
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
            <Fact label="Document">{details.title}</Fact>
          </dl>
          <p className="text-xl leading-snug [overflow-wrap:anywhere] whitespace-pre-wrap">
            {details.body}
          </p>
          <ReadAloudButton
            className="self-start"
            label="Read the note aloud"
            text={details.body}
          />
          <p className="text-muted-foreground text-base">
            It is saved as a new document in your Google Drive. Only you can see
            it unless you share it there.
          </p>
        </div>
      );
    }

    default: {
      return details satisfies never;
    }
  }
};

export {
  CHANNEL_WORDS,
  DetailsView,
  formatAddress,
  hidesAddress,
  spokenDetails,
};

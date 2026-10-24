import type { ActionDetails } from "@lifelink/contracts/actions";
import { sharingScopes } from "@lifelink/contracts/sharing";
import { cn } from "@lifelink/ui/lib/utils";

import { Avatar } from "@/components/app/bits";
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
  "discord" | "email" | "imessage" | "in_app",
  string
> = {
  discord: "Discord direct message",
  email: "Email",
  imessage: "iMessage",
  in_app: "LifeLink message",
};

/**
 * The exact, consequential details of an action, shown the way they will
 * happen. A message is a slip with its recipient and route over a double
 * brass rule; the words are set large and exactly as they will be sent.
 */
const MessageSlip = ({
  details,
  hue,
}: {
  details: Extract<ActionDetails, { kind: "send_message" }>;
  hue: number;
}) => (
  <div className="border-border bg-raised overflow-hidden rounded-xl border">
    <div className="border-brass flex items-center gap-4 border-b-[3px] border-double px-6 py-5">
      <Avatar hue={hue} name={details.contactName} />
      <div className="flex flex-col">
        <span className="text-xl font-bold">To {details.contactName}</span>
        <span className="text-muted-foreground text-base">
          By {CHANNEL_WORDS[details.channel]}
          {details.channel === "in_app"
            ? ""
            : ` to ${formatAddress(details.address)}`}
        </span>
      </div>
    </div>
    <div className="flex flex-col gap-4 px-6 py-6 sm:px-7">
      <p className="text-2xl leading-snug whitespace-pre-wrap">
        {details.body}
      </p>
      {details.photoIds.length > 0 ? (
        <p className="text-muted-foreground text-base">
          With {details.photoIds.length}{" "}
          {details.photoIds.length === 1 ? "photo" : "photos"}.
        </p>
      ) : null}
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
  <div className="flex flex-col gap-1">
    <dt className="text-muted-foreground text-base">{label}</dt>
    <dd className="text-xl font-semibold">{children}</dd>
  </div>
);

const DetailsView = ({
  className,
  details,
  granteeNames,
  hue,
  timeZone,
}: {
  className?: string;
  details: ActionDetails;
  granteeNames: string[];
  hue: number;
  timeZone: string;
}) => {
  switch (details.kind) {
    case "send_message": {
      return <MessageSlip details={details} hue={hue} />;
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
        <div
          className={cn(
            "border-border bg-raised flex flex-col gap-4 rounded-xl border px-6 py-6",
            className
          )}
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <Fact label="To">{details.to}</Fact>
            <Fact label="Subject">{details.subject}</Fact>
          </dl>
          <p className="text-xl leading-snug whitespace-pre-wrap">
            {details.body}
          </p>
          <p className="text-muted-foreground text-base">
            Saved as a draft in your{" "}
            {details.provider === "gmail" ? "Gmail" : "Outlook"}. It is not sent
            until you send it there.
          </p>
        </div>
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

    default: {
      return details satisfies never;
    }
  }
};

export { CHANNEL_WORDS, DetailsView, formatAddress };

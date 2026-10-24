/**
 * Action kinds the backend can execute after approval, and the details that
 * are consequential for each. Display-only labels (a contact's name as shown)
 * are excluded from the fingerprint; everything that changes what happens in
 * the world is included.
 */
import type { CanonicalValue } from "./fingerprint";
import type { SharingScope } from "./sharing";

const messageChannels = ["imessage", "discord", "email", "in_app"] as const;

type MessageChannel = (typeof messageChannels)[number];

interface SendMessageDetails {
  address: string;
  body: string;
  channel: MessageChannel;
  contactId: string;
  contactName: string;
  kind: "send_message";
  photoIds: string[];
}

interface ConfirmArrangementDetails {
  appointmentId: string | null;
  contactId: string;
  contactName: string;
  kind: "confirm_arrangement";
  pickupAt: number;
  summary: string;
}

interface CreateReminderDetails {
  kind: "create_reminder";
  remindAt: number;
  shareWithCircle: boolean;
  title: string;
}

interface FamilyUpdateDetails {
  granteeIds: string[];
  kind: "family_update";
  scope: SharingScope;
  text: string;
}

interface GroceryItemDetails {
  name: string;
  quantity: number | null;
  unit: string | null;
}

interface GroceryHandoffDetails {
  budgetCents: number | null;
  estimatedCents: number | null;
  items: GroceryItemDetails[];
  kind: "grocery_handoff";
  listId: string;
  listName: string;
}

interface EmailDraftDetails {
  body: string;
  connectionId: string;
  kind: "email_draft";
  provider: "gmail" | "outlook";
  replyToMessageId: string | null;
  subject: string;
  to: string;
}

interface CalendarEventDetails {
  connectionId: string;
  endsAt: number;
  kind: "calendar_event";
  location: string | null;
  provider: "google_calendar" | "outlook";
  startsAt: number;
  title: string;
}

type ActionDetails =
  | CalendarEventDetails
  | ConfirmArrangementDetails
  | CreateReminderDetails
  | EmailDraftDetails
  | FamilyUpdateDetails
  | GroceryHandoffDetails
  | SendMessageDetails;

type ActionKind = ActionDetails["kind"];

const consequentialDetails = (details: ActionDetails): CanonicalValue => {
  switch (details.kind) {
    case "send_message": {
      return {
        address: details.address.trim().toLowerCase(),
        body: details.body,
        channel: details.channel,
        contactId: details.contactId,
        kind: details.kind,
        photoIds: details.photoIds.toSorted(),
      };
    }

    case "confirm_arrangement": {
      return {
        appointmentId: details.appointmentId,
        contactId: details.contactId,
        kind: details.kind,
        pickupAt: details.pickupAt,
        summary: details.summary,
      };
    }

    case "create_reminder": {
      return {
        kind: details.kind,
        remindAt: details.remindAt,
        shareWithCircle: details.shareWithCircle,
        title: details.title,
      };
    }

    case "family_update": {
      return {
        granteeIds: details.granteeIds.toSorted(),
        kind: details.kind,
        scope: details.scope,
        text: details.text,
      };
    }

    case "grocery_handoff": {
      return {
        budgetCents: details.budgetCents,
        estimatedCents: details.estimatedCents,
        items: details.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })),
        kind: details.kind,
        listId: details.listId,
      };
    }

    case "email_draft": {
      return {
        body: details.body,
        connectionId: details.connectionId,
        kind: details.kind,
        provider: details.provider,
        replyToMessageId: details.replyToMessageId,
        subject: details.subject,
        to: details.to.trim().toLowerCase(),
      };
    }

    case "calendar_event": {
      return {
        connectionId: details.connectionId,
        endsAt: details.endsAt,
        kind: details.kind,
        location: details.location,
        provider: details.provider,
        startsAt: details.startsAt,
        title: details.title,
      };
    }

    default: {
      return details satisfies never;
    }
  }
};

/** Actions whose execution reaches another person or a provider account. */
const reachesOutside = (kind: ActionKind): boolean =>
  kind === "send_message" ||
  kind === "email_draft" ||
  kind === "grocery_handoff" ||
  kind === "calendar_event";

export { consequentialDetails, messageChannels, reachesOutside };

export type {
  ActionDetails,
  ActionKind,
  CalendarEventDetails,
  ConfirmArrangementDetails,
  CreateReminderDetails,
  EmailDraftDetails,
  FamilyUpdateDetails,
  GroceryHandoffDetails,
  GroceryItemDetails,
  MessageChannel,
  SendMessageDetails,
};

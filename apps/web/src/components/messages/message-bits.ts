import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";

import { currentIntlLocale, currentMessages } from "@/i18n/locale";
import {
  DAY,
  HOUR,
  formatShortDay,
  formatTime,
  relativeDay,
} from "@/lib/format";

type Message = Doc<"messages">;

/** Statuses worth repeating under every bubble, not just the latest one. */
const NEEDS_ATTENTION = new Set<Message["status"]>([
  "draft",
  "failed",
  "sending",
  "unknown",
]);

const RECENT_DAYS = 6;

/** A pause long enough that chat apps show the time again. */
const GROUP_GAP = HOUR;

/** "Today at 1:22 AM", "Thursday at 6:40 PM", "Thu, Oct 15 at 6:40 PM". */
const dividerLabel = (
  timestamp: number,
  timeZone: string,
  now = Date.now()
): string => {
  const time = formatTime(timestamp, timeZone);
  const day = relativeDay(timestamp, timeZone, now);
  const { format, threads } = currentMessages();

  if (day === format.today || day === format.yesterday) {
    return threads.dividerAt(day, time);
  }

  if (now - timestamp < RECENT_DAYS * DAY && timestamp <= now) {
    const weekday = new Intl.DateTimeFormat(currentIntlLocale(), {
      timeZone,
      weekday: "long",
    }).format(timestamp);

    return threads.dividerAt(weekday, time);
  }

  return threads.dividerAt(formatShortDay(timestamp, timeZone), time);
};

interface ConversationItem {
  /** A centered time line before this message, when the day changes or after a pause. */
  divider: string | null;
  /** First message in a run from the same side; carries the avatar and the wider gap. */
  groupStart: boolean;
  message: Message;
  /** Offer "Help me understand" under this received bubble. */
  showExplain: boolean;
  /** Offer "Read aloud" under this received bubble. */
  showReadAloud: boolean;
  /** Show the delivery status under this bubble. */
  showStatus: boolean;
}

interface ReceivedMessageActions {
  /** The one received message that offers "Help me understand". */
  explain: Message["_id"] | null;
  /** Received messages that offer "Read aloud". */
  readAloud: Set<Message["_id"]>;
}

/** A real back-and-forth switches sides at least twice, as in them → you → them. */
const BACK_AND_FORTH_SWITCHES = 2;

/**
 * Which received messages get actions under them, so older bubbles stay quiet.
 * "Help me understand" goes only under their latest message. "Read aloud" goes
 * there too and, in a real back-and-forth, under the last bubble of each of
 * their earlier runs as well.
 */
const receivedMessageActions = (
  messages: Pick<Message, "_id" | "direction">[]
): ReceivedMessageActions => {
  const runEnds = messages.filter(
    (message, index) =>
      message.direction === "incoming" &&
      messages[index + 1]?.direction !== "incoming"
  );

  const switches = messages.filter(
    (message, index) =>
      index > 0 && messages[index - 1]?.direction !== message.direction
  ).length;

  const latest = runEnds.at(-1)?._id ?? null;

  const readAloud =
    switches >= BACK_AND_FORTH_SWITCHES
      ? runEnds.map((message) => message._id)
      : [latest].filter((id) => id !== null);

  return { explain: latest, readAloud: new Set(readAloud) };
};

/** Group messages the way chat apps do: by side, with a time line after each pause. */
const conversationItems = (
  messages: Message[],
  timeZone: string,
  now = Date.now()
): ConversationItem[] => {
  const latestOutgoing = messages.findLast(
    (message) => message.direction === "outgoing"
  );

  const actions = receivedMessageActions(messages);

  return messages.map((message, index) => {
    const previous = index > 0 ? messages[index - 1] : undefined;

    const newDay =
      previous === undefined ||
      relativeDay(previous.createdAt, timeZone, now) !==
        relativeDay(message.createdAt, timeZone, now);

    const paused =
      previous !== undefined &&
      message.createdAt - previous.createdAt > GROUP_GAP;

    const divider =
      newDay || paused ? dividerLabel(message.createdAt, timeZone, now) : null;

    return {
      divider,
      groupStart: divider !== null || previous?.direction !== message.direction,
      message,
      showExplain: message._id === actions.explain,
      showReadAloud: actions.readAloud.has(message._id),
      showStatus:
        message.direction === "outgoing" &&
        (message._id === latestOutgoing?._id ||
          NEEDS_ATTENTION.has(message.status)),
    };
  });
};

/** One line for the list: who spoke last and what they said. */
const previewOf = (message: Message): string => {
  const photos = message.photoIds.length;
  const { threads } = currentMessages();

  const photoWords =
    photos === 1 ? threads.previewOnePhoto : threads.previewManyPhotos(photos);

  const words = message.body.trim() || (photos > 0 ? photoWords : "");

  return message.direction === "outgoing" ? threads.previewYou(words) : words;
};

export { conversationItems, dividerLabel, previewOf, receivedMessageActions };

export type { ConversationItem, Message, ReceivedMessageActions };

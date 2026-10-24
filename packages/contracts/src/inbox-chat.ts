import { z } from "zod";

import { inboxCategories } from "./inbox";

const inboxChatSummarySchema = z.object({
  items: z.array(
    z.object({
      category: z.enum(inboxCategories),
      id: z.string(),
      quote: z.string().nullable(),
      reason: z.string(),
      sender: z.string(),
      subject: z.string(),
      summary: z.string(),
    })
  ),
  method: z.enum(["local", "cloud"]),
  note: z.string(),
  practice: z.boolean(),
  summary: z.string().nullable(),
});

type InboxChatSummary = z.infer<typeof inboxChatSummarySchema>;

type InboxChatItem = InboxChatSummary["items"][number];

const PRIVATE_INBOX_OPTIONS = {
  lifelink: { privateInboxSummary: true },
} as const;

/** These messages remain visible in chat, but are never reused as general model context. */
const withoutPrivateInboxSummaries = <
  T extends {
    providerOptions?: Record<string, Record<string, unknown>>;
  },
>(
  messages: T[]
): T[] =>
  messages.filter(
    (message) => message.providerOptions?.lifelink?.privateInboxSummary !== true
  );

const GROUPS = [
  { category: "check_first", title: "Check before acting" },
  { category: "reply", title: "May need a reply" },
  { category: "review", title: "Worth a look" },
  { category: "low_priority", title: "Lower priority" },
] as const;

const formatInboxChatSummary = (result: InboxChatSummary): string => {
  if (result.items.length === 0) {
    return "There are no imported emails to summarize yet. Connect Gmail or Outlook in Connections, then check for new email on the Email page. After that, choose Summarize emails here.";
  }

  const lines = [
    `${result.practice ? "Practice · " : ""}Your ${result.items.length} most recent imported ${result.items.length === 1 ? "email" : "emails"}`,
    result.summary ??
      "Here is what may need attention, using the email importance rules.",
    result.note,
  ];

  for (const group of GROUPS) {
    const items = result.items.filter(
      (item) => item.category === group.category
    );

    if (items.length === 0) {
      continue;
    }

    lines.push("", `${group.title} (${items.length})`);

    for (const item of items) {
      lines.push(`• ${item.subject || "(No subject)"} — ${item.sender}`);

      if (item.summary.trim()) {
        lines.push(item.summary);
      }

      lines.push(item.reason);
    }
  }

  lines.push(
    "",
    "These are suggestions, not a guarantee of safety. Open the original emails on the Email page before acting. Nothing was sent or changed in your mailbox."
  );

  return lines.join("\n\n");
};

export {
  PRIVATE_INBOX_OPTIONS,
  GROUPS,
  inboxChatSummarySchema,
  formatInboxChatSummary,
  withoutPrivateInboxSummaries,
};

export type { InboxChatItem, InboxChatSummary };

/**
 * Gmail and Outlook through Composio. A requested sync imports recent inbox
 * messages; sends and drafts happen only after approval. Scam checks run locally
 * after import, without another provider request.
 */
import { z } from "zod";

import { localDateTimeIn } from "../lib/time";
import { executeTool } from "./composio";
import type { ToolOutcome } from "./composio";

type MailProvider = "gmail" | "outlook";

interface MailAccount {
  connectedAccountId: string;
  provider: MailProvider;
  userId: string;
}

interface MailSummary {
  bodyText: string;
  fromAddress: string;
  fromName: string | null;
  providerMessageId: string;
  providerThreadId: string | null;
  receivedAt: number;
  subject: string;
}

const gmailMessageSchema = z
  .object({
    messageId: z.string(),
    messageText: z.string().optional(),
    messageTimestamp: z.string().optional(),
    preview: z.object({ body: z.string().optional() }).loose().optional(),
    sender: z.string().optional(),
    subject: z.string().nullable().optional(),
    threadId: z.string().optional(),
  })
  .loose();

const gmailListSchema = z
  .object({ messages: z.array(gmailMessageSchema).optional() })
  .loose();

const outlookMessageSchema = z
  .object({
    body: z.object({ content: z.string().optional() }).loose().optional(),
    bodyPreview: z.string().optional(),
    conversationId: z.string().optional(),
    from: z
      .object({
        emailAddress: z
          .object({
            address: z.string().optional(),
            name: z.string().optional(),
          })
          .loose(),
      })
      .loose()
      .optional(),
    id: z.string(),
    receivedDateTime: z.string().optional(),
    subject: z.string().nullable().optional(),
  })
  .loose();

const outlookListSchema = z
  .object({
    messages: z.array(outlookMessageSchema).optional(),
    value: z.array(outlookMessageSchema).optional(),
  })
  .loose();

const SENDER_PATTERN = /^\s*"?(?<name>[^"<]*?)"?\s*<(?<address>[^>]+)>\s*$/u;
const TAG_PATTERN = /<[^>]+>/gu;
const SPACE_PATTERN = /\s+/gu;

const LINK_PATTERN =
  /<a\b[^>]*\bhref\s*=\s*["'](?<url>https?:\/\/[^"']+)["'][^>]*>(?<label>[\s\S]*?)<\/a>/giu;

interface Sender {
  address: string;
  name: string | null;
}

const splitSender = (sender: string): Sender => {
  const groups = SENDER_PATTERN.exec(sender)?.groups;

  if (groups === undefined) {
    const bare: Sender = { address: sender.trim(), name: null };

    return bare;
  }

  const name = groups.name?.trim() ?? "";

  const parsed: Sender = {
    address: groups.address?.trim() ?? sender,
    name: name === "" ? null : name,
  };

  return parsed;
};

const plainText = (html: string): string =>
  html
    .replaceAll(LINK_PATTERN, "$<label> ($<url>)")
    .replaceAll(TAG_PATTERN, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll(SPACE_PATTERN, " ")
    .trim();

const parseGmail = (data: ToolOutcome & { kind: "ok" }): MailSummary[] => {
  const parsed = gmailListSchema.safeParse(data.data);

  if (!parsed.success) {
    return [];
  }

  return (parsed.data.messages ?? []).map((message) => {
    const sender = splitSender(message.sender ?? "");

    return {
      bodyText: (message.messageText ?? message.preview?.body ?? "").slice(
        0,
        20_000
      ),
      fromAddress: sender.address,
      fromName: sender.name,
      providerMessageId: message.messageId,
      providerThreadId: message.threadId ?? null,
      receivedAt: Date.parse(message.messageTimestamp ?? "") || Date.now(),
      subject: message.subject ?? "(no subject)",
    };
  });
};

const parseOutlook = (data: ToolOutcome & { kind: "ok" }): MailSummary[] => {
  const parsed = outlookListSchema.safeParse(data.data);

  if (!parsed.success) {
    return [];
  }

  return (parsed.data.value ?? parsed.data.messages ?? []).map((message) => ({
    bodyText: plainText(
      message.body?.content ?? message.bodyPreview ?? ""
    ).slice(0, 20_000),
    fromAddress: message.from?.emailAddress.address ?? "",
    fromName: message.from?.emailAddress.name ?? null,
    providerMessageId: message.id,
    providerThreadId: message.conversationId ?? null,
    receivedAt: Date.parse(message.receivedDateTime ?? "") || Date.now(),
    subject: message.subject ?? "(no subject)",
  }));
};

type MailListResult =
  | { error: string; ok: false }
  | { messages: MailSummary[]; ok: true };

const listRecentMail = async (
  account: MailAccount
): Promise<MailListResult> => {
  const outcome =
    account.provider === "gmail"
      ? await executeTool(
          "GMAIL_FETCH_EMAILS",
          account.userId,
          account.connectedAccountId,
          {
            include_payload: false,
            max_results: 15,
            query: "in:inbox newer_than:21d",
            verbose: true,
          }
        )
      : await executeTool(
          "OUTLOOK_LIST_MESSAGES",
          account.userId,
          account.connectedAccountId,
          {
            folder: "inbox",
            select: [
              "id",
              "subject",
              "from",
              "receivedDateTime",
              "bodyPreview",
              "body",
              "conversationId",
            ],
            top: 15,
          }
        );

  if (outcome.kind !== "ok") {
    return { error: outcome.error, ok: false };
  }

  const messages =
    account.provider === "gmail" ? parseGmail(outcome) : parseOutlook(outcome);

  return {
    messages: messages.toSorted(
      (left, right) => right.receivedAt - left.receivedAt
    ),
    ok: true,
  };
};

interface OutgoingMail {
  body: string;
  subject: string;
  threadId: string | null;
  to: string;
}

const sendMail = async (
  account: MailAccount,
  mail: OutgoingMail
): Promise<ToolOutcome> =>
  account.provider === "gmail"
    ? await executeTool(
        "GMAIL_SEND_EMAIL",
        account.userId,
        account.connectedAccountId,
        {
          body: mail.body,
          include_signature: false,
          recipient_email: mail.to,
          subject: mail.subject,
        }
      )
    : await executeTool(
        "OUTLOOK_SEND_EMAIL",
        account.userId,
        account.connectedAccountId,
        {
          body: mail.body,
          is_html: false,
          save_to_sent_items: true,
          subject: mail.subject,
          to: mail.to,
        }
      );

const createDraft = async (
  account: MailAccount,
  mail: OutgoingMail
): Promise<ToolOutcome> => {
  if (account.provider === "outlook") {
    return await executeTool(
      "OUTLOOK_CREATE_DRAFT",
      account.userId,
      account.connectedAccountId,
      {
        body: mail.body,
        is_html: false,
        subject: mail.subject,
        to_recipients: [mail.to],
      }
    );
  }

  const base = {
    body: mail.body,
    include_signature: false,
    recipient_email: mail.to,
  };

  // Replying in a thread: Gmail keeps the thread only when the subject is left empty.
  const draft =
    mail.threadId === null
      ? { ...base, subject: mail.subject }
      : { ...base, thread_id: mail.threadId };

  return await executeTool(
    "GMAIL_CREATE_EMAIL_DRAFT",
    account.userId,
    account.connectedAccountId,
    draft
  );
};

type Reconciled = "found" | "not_found" | "cannot_tell";

const gmailDateFloor = (sinceMs: number): string =>
  localDateTimeIn(sinceMs - 86_400_000, "UTC")
    .slice(0, 10)
    .replaceAll("-", "/");

/** Look in Sent (or Drafts) for the exact message after an uncertain attempt. */
const findMail = async (
  account: MailAccount,
  mail: OutgoingMail,
  sinceMs: number,
  folder: "drafts" | "sent"
): Promise<Reconciled> => {
  const subject = mail.subject.replaceAll('"', "");

  const outcome =
    account.provider === "gmail"
      ? await executeTool(
          "GMAIL_FETCH_EMAILS",
          account.userId,
          account.connectedAccountId,
          {
            include_payload: false,
            max_results: 10,
            query: `in:${folder} to:${mail.to} after:${gmailDateFloor(sinceMs)}${subject ? ` subject:"${subject}"` : ""}`,
            verbose: false,
          }
        )
      : await executeTool(
          "OUTLOOK_LIST_MESSAGES",
          account.userId,
          account.connectedAccountId,
          {
            folder: folder === "sent" ? "sentitems" : "drafts",
            select: ["id", "subject", "toRecipients", "createdDateTime"],
            top: 25,
          }
        );

  if (outcome.kind !== "ok") {
    return "cannot_tell";
  }

  const messages =
    account.provider === "gmail" ? parseGmail(outcome) : parseOutlook(outcome);

  const found = messages.some(
    (message) =>
      account.provider === "gmail" || message.subject === mail.subject
  );

  return found ? "found" : "not_found";
};

export { createDraft, findMail, listRecentMail, sendMail, splitSender };

export type {
  Sender,
  MailAccount,
  MailProvider,
  MailSummary,
  OutgoingMail,
  Reconciled,
};

/** Fixed-purpose mailbox safety notes. This adapter has no send operation. */
import { z } from "zod";

import { executeTool } from "./composio";
import type { ToolOutcome } from "./composio";
import type { MailAccount } from "./mail";

const addressSchema = z.email();
const profileSchema = z.object({ emailAddress: addressSchema });
const wrappedProfileSchema = z.object({ data: profileSchema });

const receiptSchema = z.object({
  draft_id: z.string().min(1).optional(),
  id: z.string().min(1).optional(),
});

/** Only the authenticated mailbox's address is acceptable, never a sender or account label. */
const warningRecipient = async (
  account: MailAccount,
  execute: typeof executeTool = executeTool
): Promise<string | null> => {
  const outcome = await execute(
    "GMAIL_GET_PROFILE",
    account.userId,
    account.connectedAccountId,
    { user_id: "me" }
  );

  if (outcome.kind !== "ok") {
    return null;
  }

  const direct = profileSchema.safeParse(outcome.data);

  if (direct.success) {
    return direct.data.emailAddress;
  }

  const wrapped = wrappedProfileSchema.safeParse(outcome.data);

  return wrapped.success ? wrapped.data.data.emailAddress : null;
};

interface WarningMail {
  body: string;
  subject: string;
  threadId: string | null;
}

const createWarningDraft = async (
  account: MailAccount,
  mail: WarningMail,
  ownAddress: string | null,
  execute: typeof executeTool = executeTool
): Promise<ToolOutcome> => {
  if (account.provider === "outlook") {
    // Reply-draft tools prefill the sender. A separate note can safely omit every recipient.
    return await execute(
      "OUTLOOK_CREATE_DRAFT",
      account.userId,
      account.connectedAccountId,
      { body: mail.body, is_html: false, subject: mail.subject }
    );
  }

  if (!addressSchema.safeParse(ownAddress).success) {
    return {
      error: "The mailbox address could not be verified.",
      kind: "rejected",
    };
  }

  // Composio requires a recipient. Address only the owner, never the suspicious sender.
  return await execute(
    "GMAIL_CREATE_EMAIL_DRAFT",
    account.userId,
    account.connectedAccountId,
    {
      body: mail.body,
      include_signature: false,
      is_html: false,
      recipient_email: ownAddress,
      ...(mail.threadId === null
        ? { subject: mail.subject }
        : { thread_id: mail.threadId }),
    }
  );
};

const warningDraftId = (
  outcome: Extract<ToolOutcome, { kind: "ok" }>
): string | null => {
  const direct = receiptSchema.safeParse(outcome.data);

  if (direct.success) {
    const id = direct.data.draft_id ?? direct.data.id;

    if (id !== undefined) {
      return id;
    }
  }

  const wrapped = z.object({ data: receiptSchema }).safeParse(outcome.data);

  return wrapped.success
    ? (wrapped.data.data.draft_id ?? wrapped.data.data.id ?? null)
    : null;
};

export { createWarningDraft, warningDraftId, warningRecipient };

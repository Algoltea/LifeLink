const PRESENTATION_CHECKS_NOTICE =
  "With AI email checks enabled in Settings, eligible email may be sent to a cloud AI provider. Local English-only rules are used when cloud AI is off, unavailable, or does not finish. A failed cloud request may still have sent the email to the provider. Neither method can verify the sender or prove an email is safe.";

const MAILBOX_UNAVAILABLE = "Mailbox sync is unavailable for this account.";

const mailboxErrorText = (error: string, presentationDemo: boolean): string =>
  presentationDemo &&
  error ===
    "Practice mode uses sample emails. Turn it off before syncing a connected mailbox."
    ? MAILBOX_UNAVAILABLE
    : error;

export { MAILBOX_UNAVAILABLE, PRESENTATION_CHECKS_NOTICE, mailboxErrorText };

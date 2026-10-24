const email = {
  aboutChecks: "About scam checks",
  appointmentAdded: "It’s been added to Your week on your Today page.",
  appointmentFound: "Appointment found",
  backToInbox: "Back to inbox",
  checkAnother: "Check another message",
  checkCouldNotFinish: (error: string) =>
    `The scam check couldn’t finish. ${error}`,
  checkFirst: "Check for common warning signs before you act.",
  checkForNew: "Check for new email",
  checkManually: " You can check it manually below.",
  checkThis: "Check this email",
  checkUsesSigns:
    "It uses common warning signs, not cloud AI. This check can’t confirm who sent it or whether what it says is true.",
  checked: (when: string) => `Checked ${when} · done in LifeLink`,
  checkedAt: (when: string) => ` Checked ${when}.`,
  checking: "Checking…",
  checksAutomatic:
    "Automatic checks don’t send email to an AI provider. They can’t confirm who sent an email or whether what it says is true. “Check for new email” brings in your recent emails and checks them the same way.",
  checksIntro:
    "New email is checked in LifeLink, on this device, for common scam signs. Pick a message to read it and see what stood out.",
  checksTitle: "How the email checks work",
  chooseEmail: "Choose an email to read it and see its scam check.",
  cloudConsent:
    "Send this email to a cloud AI service for a summary and to spot any appointment in it. Leave unchecked for a short preview made in LifeLink.",
  concern: "This email raised a concern. Check the request before acting.",
  connectMailbox: "Connect Gmail or Outlook",
  connected: (list: string) => `Connected: ${list}.`,
  countEmails: (count: number) =>
    `${count} ${count === 1 ? "email" : "emails"}`,
  empty:
    "No emails here yet. Connect a mailbox, then choose “Check for new email” to import recent messages.",
  from: "From ",
  helpMeUnderstand: "Help me understand",
  inbox: "Inbox",
  linksNotOpened:
    "Links in emails aren’t opened by LifeLink. If it asks for money or private details, check it first.",
  loadingEmail: "Loading email",
  loadingEmails: "Loading emails",
  lowerPriority: "Lower priority",
  mailboxes: "Your mailboxes",
  mayNeedReply: "May need a reply",
  needsAttention: (label: string, error: string | null) =>
    `${label} needs attention${error ? `: ${error}` : "."}`,
  newEmails: (count: number) =>
    count === 0
      ? "No new emails."
      : `${count} new ${count === 1 ? "email" : "emails"}.`,
  noMailbox: "No mailbox connected.",
  noSigns: "No warning signs found. Sender not confirmed.",
  noSubject: "(No subject)",
  noSubjectSpoken: "No subject",
  noText: "This email has no text.",
  notChecked: "Not checked yet",
  notCheckedEmail: "This email has not been checked yet.",
  notCheckedNote: "Not checked yet · done in LifeLink",
  nowTheEmail: "Now, the email.",
  openManualCheck: "Open the manual scam check",
  opened: (subject: string) => `Opened: ${subject}`,
  paging: {
    loadOlder: "Load older emails",
    loading: "Loading…",
    newer: "Newer",
    noMoreImported:
      "No additional emails imported. Try the next batch if older emails are still available.",
    noOlder: "No older emails available.",
    older: "Older emails",
    page: (page: number) => `Page ${page} · Up to 15 emails at a time`,
  },
  preview: "Show a short preview",
  readSummary: "Read the summary aloud",
  readingNow: "Reading it now…",
  readyToRead: "Ready to read",
  reconnect: "Reconnect",
  reply: "Reply",
  replyAdded: "Reply added to your draft. You can change it before reviewing.",
  replyComposer: {
    nothingSent: (provider: string) =>
      `Nothing is sent. You’ll review it first, then it’s saved as a draft in your ${provider}.`,
    placeholder: "Write your reply…",
    replyTo: (to: string) => `Reply to ${to}`,
    review: "Review the draft",
    speak: "Speak",
    stopListening: "Stop listening",
  },
  ride: {
    asked: "You've asked someone for a ride.",
    confirmed: "Your ride is confirmed.",
    declined: "The ride was declined.",
  },
  sampleEmails: " These are sample emails, so you can practice safely.",
  scamCheck: "Scam check",
  scamCheckNotDone: "Scam check not done yet",
  scamSigns:
    "This has signs of a scam. Please check it before you do anything it asks.",
  spokenFrom: (subject: string, from: string, body: string) =>
    `${subject}. From ${from}. ${body}`,
  summarizeCloud: "Summarize with cloud AI",
  summary: "Summary",
  summaryNote: "Get a short preview made in LifeLink, or choose cloud AI",
  summarySpoken: "Email summary.",
  theEmail: "The email",
  title: "Email",
  warning: {
    concern: "This email raised a concern. Check the request before acting.",
    intro: (reason: string) =>
      `Potential scam. ${reason} If you're unsure, ask someone you trust before you reply, open a link, send money, or share personal details.`,
    signs: (signs: string) => `Warning signs: ${signs}.`,
  },
  warningSigns: "Warning signs",
  warningSignsFound: "Warning signs found",
  whatShouldIDo: "What should I do?",
};

export { email };

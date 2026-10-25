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
  checked: (when: string) => `Checked ${when}`,
  checkedAt: (when: string) => ` Checked ${when}.`,
  checking: "Checking…",
  checksAutomatic:
    "With AI email checks enabled in Settings, new live email may be sent to a cloud AI provider. Practice email stays in LifeLink. Local English-only rules are used when cloud AI is off, unavailable, or does not finish. A failed cloud request may still have sent the email to the provider. Neither method can verify the sender or prove an email is safe.",
  checksIntro:
    "New email is checked in LifeLink for common scam signs. Pick a message to read it and see what stood out.",
  checksTitle: "How the email checks work",
  chooseEmail: "Choose an email to read it and see its scam check.",
  cloudCheckNotice:
    "Cloud AI helped check this email. It can make mistakes and cannot verify the sender. No warning signs does not mean the email is safe.",
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
  localLanguageNotice:
    "This email check used local rules designed for English only. They can miss scams in Spanish and other languages. No warning signs does not mean an email is safe.",
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
  notCheckedNote: "Not checked yet",
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
  unknownCheckNotice:
    "This saved check does not say whether it used cloud AI or local rules. Local rules cover English only and can miss scams in other languages. No warning signs does not mean the email is safe.",
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

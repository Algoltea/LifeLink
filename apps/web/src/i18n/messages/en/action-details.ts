const actionDetails = {
  and: " and ",
  appointment: "Appointment",
  budget: (amount: string) => ` Budget: ${amount}.`,
  by: (channel: string) => `By ${channel}`,
  calendar: "Calendar",
  confirming: "You’re confirming",
  document: "Document",
  draftSavedIn: (provider: string) =>
    `Saved as a draft in your ${provider}. It is not sent until you send it there.`,
  driveNoteHint:
    "It is saved as a new document in your Google Drive. Only you can see it unless you share it there.",
  estimate: (amount: string) => `Your estimate: ${amount}.`,
  event: "Event",
  itemCount: (name: string, count: number) =>
    `${name}: ${count} ${count === 1 ? "item" : "items"}`,
  noEstimate: "No estimate yet.",
  noJustYou: "No, just you",
  notGiven: "Not given",
  notes: "Notes",
  onlyGrantees: (names: string, scope: string) =>
    `Only ${names} will see this, because you share ${scope} with them.`,
  peopleYouAllowed: "people you allowed",
  readEmail: "Read the email aloud",
  readMessage: "Read the message aloud",
  readNote: "Read the note aloud",
  readUpdate: "Read the update aloud",
  reminder: "Reminder",
  replySentFrom: (provider: string) =>
    `Sent from your ${provider} as a reply in the same conversation, only after you approve it.`,
  sharedWithCircle: "Shared with your trusted circle",
  shoppingRecord:
    "This is a record of an earlier shopping request. Shopping through LifeLink is no longer available.",
  spoken: {
    appointment: (title: string, when: string, location: string | null) =>
      `Appointment: ${title}. ${when}${location ? `, at ${location}` : ""}.`,
    calendar: (title: string, when: string, location: string | null) =>
      `${title}. ${when}${location ? `, at ${location}` : ""}.`,
    confirm: (summary: string) => `You're confirming: ${summary}`,
    driveNote: (title: string, body: string) =>
      `A note in your Google Drive called ${title}. It says: ${body}`,
    email: (to: string, subject: string, body: string) =>
      `Email to ${to}. Subject: ${subject}. It says: ${body}`,
    emailAloud: (subject: string, body: string) =>
      `Subject: ${subject}. ${body}`,
    message: (name: string, channel: string, route: string, body: string) =>
      `To ${name}, by ${channel}${route}. The message says: ${body}`,
    reminder: (title: string, when: string, shared: boolean) =>
      `Reminder: ${title}. ${when}. ${shared ? "Shared with your trusted circle." : "Just for you."}`,
    reply: (to: string, subject: string, body: string) =>
      `Reply to ${to}. Subject: ${subject}. It says: ${body}`,
    update: (text: string) => `The update says: ${text}`,
  },
  starts: "Starts",
  subject: "Subject",
  thisScope: "this",
  to: "To",
  toAddress: (address: string) => ` to ${address}`,
  toName: (name: string) => `To ${name}`,
  when: "When",
  where: "Where",
  withPhotos: (count: number) =>
    `With ${count} ${count === 1 ? "photo" : "photos"}.`,
  yesShared: "Yes",
};

export { actionDetails };

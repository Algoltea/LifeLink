const threads = {
  addPerson: "Add a person",
  addPhoto: "Add a photo",
  addWayToReach: (firstName: string) =>
    `Add a way to reach ${firstName} in Trusted circle.`,
  addingPhoto: "Adding photo…",
  backTo: "Back to ",
  channels: {
    discord: "Discord direct message",
    email: "Email",
    imessage: "iMessage",
    in_app: "LifeLink message",
    telegram: "Telegram",
  },
  chooseConversation:
    "Choose someone to read your conversation and write back.",
  conversationWith: (name: string) => `Conversation with ${name}`,
  conversationWithPrefix: "Conversation with ",
  conversations: "Conversations",
  dividerAt: (day: string, time: string) => `${day} at ${time}`,
  empty:
    "Add family or friends to your trusted circle to start writing to them.",
  emptyThread: (firstName: string) => `No messages with ${firstName} yet`,
  emptyThreadHint: (firstName: string) =>
    `Write below to start. You’ll see exactly what ${firstName} will get before anything is sent.`,
  helpMeUnderstand: "Help me understand",
  loadingConversation: "Loading conversation",
  loadingConversations: "Loading conversations",
  maxPhotos: (count: number) =>
    `You can attach up to ${count} photos. Remove one to add another.`,
  messageTo: (firstName: string) => `Message to ${firstName}`,
  messagesWith: (name: string) => `Messages with ${name}`,
  noWayToReach: "No way to reach them yet",
  noWayToReachName: (firstName: string) => `No way to reach ${firstName} yet`,
  notSent: "Not sent",
  notSureSent: "Not sure it was sent",
  nothingSentUntilApproved:
    "Nothing is sent until you review it and approve it.",
  pendingMany: (count: number, firstName: string) =>
    `${count} messages to ${firstName} are waiting for your approval.`,
  pendingOne: (firstName: string) =>
    `A message to ${firstName} is waiting for your approval.`,
  peopleCount: (count: number) =>
    `${count} ${count === 1 ? "person" : "people"}`,
  photoCount: (count: number) => `${count} ${count === 1 ? "photo" : "photos"}`,
  photoInvalid: (name: string) =>
    `${name}: Please choose a photo (JPEG, PNG, WebP, or HEIC).`,
  photosToSend: "Photos to send",
  practiceNothingSent: (firstName: string) =>
    `Practice: nothing will be sent to ${firstName}.`,
  preparing: "Preparing…",
  preparingMessage: "Preparing your message",
  previewManyPhotos: (count: number) => `${count} photos`,
  previewOnePhoto: "A photo",
  previewYou: (words: string) => `You: ${words}`,
  recap: "Recap",
  recapThis: " this conversation",
  removePhoto: (name: string) => `Remove ${name}`,
  replyAdded:
    "Reply added to your message. You can change it before reviewing.",
  review: "Review",
  reviewBeforeSending: "Review before sending",
  reviewBeforeSendingTail: " before sending",
  reviewIt: "Review it",
  seeWhatHappened: "See what happened",
  srThem: (firstName: string, when: string) => `${firstName}, ${when}: `,
  srYou: (when: string) => `You, ${when}: `,
  startConversation: "Start a conversation",
  status: {
    delivered: "Delivered",
    draft: "Draft, not sent",
    failed: "Not sent",
    read: "Read",
    received: "Received",
    sending: "Sending…",
    sent: "Sent",
    unknown: "Not sure it was sent",
  },
  subline:
    "Write to the people in your trusted circle. You see every message before it’s sent.",
  title: "Messages",
  toAddress: (address: string) => ` to ${address}`,
  waitingForApproval: (count: number) =>
    count === 1
      ? "Waiting for your approval"
      : `${count} waiting for your approval`,
  writeTo: (firstName: string) => `Write to ${firstName}`,
  writeToPlaceholder: (firstName: string) => `Write to ${firstName}…`,
};

export { threads };

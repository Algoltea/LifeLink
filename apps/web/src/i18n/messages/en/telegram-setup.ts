const telegramSetup = {
  copiedInvitation: (contactName: string) =>
    `Invitation copied. Send it to ${contactName} yourself.`,
  copiedLink: (contactName: string) =>
    `Link copied. Send it to ${contactName} yourself.`,
  copyInvitation: "Copy invitation",
  copyInvitationFailed: "Couldn’t copy the invitation. Copy the address above.",
  copyLink: "Copy link",
  copyLinkFailed: "Couldn’t copy the link. Select and copy it above.",
  expires: (day: string) => ` It works once and stops working on ${day}.`,
  heading: "Telegram",
  invite: (contactName: string, botUrl: string) =>
    `Hi ${contactName}! Open ${botUrl} in Telegram and tap Start, so we can message each other through LifeLink.`,
  link: "Link Telegram",
  linked: (account: string, contactName: string) =>
    `Linked to ${account}. Messages you approve for ${contactName} can go by Telegram, and their replies arrive in Messages.`,
  loading: "Loading Telegram setup…",
  newLink: "Make a new link",
  notConfigured:
    "App setup needed. Whoever runs LifeLink must connect Telegram before you can link it for this contact.",
  ownerOnly: "Only the account owner can link Telegram for their contacts.",
  sendLink: (contactName: string) =>
    `Send this link to ${contactName}. When they open it and tap Start, Telegram is linked here automatically.`,
  theirAccount: "their Telegram account",
  unlink: "Unlink Telegram",
  waitingAsk: (contactName: string) => `. Ask ${contactName} to open `,
  waitingFor: (username: string) => `Waiting for @${username}`,
  waitingRest:
    " in Telegram and tap Start. LifeLink links them as soon as they do.",
};

export { telegramSetup };

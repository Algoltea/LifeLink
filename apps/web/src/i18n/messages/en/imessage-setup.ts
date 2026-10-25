const imessageSetup = {
  agreeAndLink: "Agree and link this contact",
  assignedNumber: "Assigned iMessage number: ",
  checkComplete: "Check complete. The current status is shown above.",
  checkFailed: "Couldn’t check for their first message. Please try again.",
  checkFirstMessage: "Check for first message",
  checking: "Checking for their first message…",
  confirmDescription:
    "Review the exact address and how it will be used before you continue.",
  confirmInvitation: (contactName: string, handle: string) =>
    `No invitation message is sent. You’ll see the assigned number to share with ${contactName}. They must text it first from ${handle}. A phone number and an Apple ID email are different identities, even on the same phone.`,
  confirmLink: "Link the existing Photon contact at ",
  confirmLookup:
    "Continuing looks up this exact address in Photon, our iMessage provider, and reuses the existing contact. LifeLink does not register new people or use new seat capacity.",
  confirmNoAccount: (contactName: string) =>
    `${contactName} does not need a LifeLink account or a dashboard invitation. This does not grant access to anything in your account.`,
  confirmTitle: (contactName: string) => `Link iMessage for ${contactName}?`,
  confirmTo: " to ",
  copied: (contactName: string) =>
    `Instructions copied. Send them to ${contactName} yourself.`,
  copy: "Copy instructions",
  copyFailed:
    "Couldn’t copy the instructions. Select and copy the text above, or try Copy instructions again.",
  exactAddress: "Exact contact address: ",
  firstMessageConfirmed:
    "Their first message has been confirmed. LifeLink can now message this registered address.",
  heading: "iMessage setup",
  instructions: (contactName: string, assignedNumber: string, handle: string) =>
    `${contactName}: To start using iMessage with LifeLink, you must first send an iMessage (such as “Hello”) to ${assignedNumber} from your exact registered address: ${handle}. In Messages, make sure your conversation starts from ${handle}. A phone number and an Apple ID email are different identities, even on the same phone. A message from another address will not activate this one. You do not need a LifeLink account or a dashboard invitation.`,
  link: "Link iMessage",
  linkExplanation:
    "Link the person already registered with this exact address in Photon. If they are not there, add them in the Photon dashboard first, then try again. LifeLink does not create new people.",
  linkFailed:
    "Couldn’t link this contact. Check that this exact address is registered in the Photon dashboard, then try again.",
  loading: "Loading iMessage setup…",
  lookingUp: "Looking up this existing contact in Photon…",
  mustSendFirst: (contactName: string) =>
    `${contactName} must send the first message from their address shown above. Your own message will not activate their setup.`,
  needsAddress:
    "An iMessage address is needed. Add their phone number or Apple ID email above, then save.",
  notConfigured:
    "App setup needed. Whoever runs LifeLink must connect Photon before you can set up iMessage for this contact.",
  ownerOnly:
    "Only the account owner can set up or check iMessage for their contacts.",
  practice: (contactName: string) =>
    `Practice messages stay in LifeLink, so there is nothing to set up here. When you switch to real iMessage, you can link ${contactName} here.`,
  retryLink: "Retry linking iMessage",
  row: {
    failed: "iMessage needs attention",
    not_registered: "iMessage not linked yet",
    registering: "Linking iMessage",
    waiting: "Waiting for their first iMessage",
  },
  status: {
    failed: "Setup needs attention",
    not_registered: "Not linked",
    ready: "Ready for iMessage",
    registering: "Linking",
    waiting: "Waiting for their first message",
  },
};

export { imessageSetup };

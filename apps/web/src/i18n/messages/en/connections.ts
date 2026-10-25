import type { ConnectionProviderId } from "@lifelink/contracts/integrations";

interface ProviderMessages {
  accountRequirement: string;
  capabilities: Record<string, { label: string; note?: string }>;
  summary: string;
}

const connections = {
  account: (label: string) => `Account: ${label}`,
  allowProvider: (label: string) => `Choose Allow on ${label}’s page.`,
  appAccount:
    "This works through the app's own account, so there's nothing for you to sign in to.",
  callback: {
    back: "Back to Connections",
    checking: (label: string) => `Checking the ${label} connection`,
    connected: (label: string) => `${label} is connected.`,
    connectedTitle: (label: string) => `${label} connected`,
    declined: (label: string) =>
      `${label} didn’t finish connecting. Nothing was changed. You can try again.`,
    missing:
      "This page was opened without a connection to finish. Please start again from Connections.",
    practice:
      "Practice mode is on. Turn it off in Settings before finishing a real connection.",
    service: "The service",
    subline: "Return to Connections to review your services or start again.",
    title: "Connection status",
    unavailable:
      "This service has no connection available in LifeLink. Return to Connections to review its limitations.",
  },
  canDo: "Can do",
  cancel: "Cancel",
  cardLabel: (
    label: string,
    status: string,
    permissions: string,
    action: string
  ) => `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Close",
  comingLater: "Coming later",
  connect: "Connect",
  connectProvider: (label: string) => `Connect ${label}`,
  connectionState: (status: string) => `The connection is ${status}.`,
  connectionStates: {
    active: "active",
    deleted: "deleted",
    expired: "expired",
    failed: "failed",
    inactive: "inactive",
    initiated: "initiated",
    pending: "pending",
    revoked: "revoked",
  } satisfies Record<string, string>,
  detailLabel: (label: string, summary: string) =>
    `${label}. ${summary} Details.`,
  details: "Details",
  developerSetupAfter: (label: string) => ` and choose ${label}.`,
  developerSetupBefore: "For whoever runs LifeLink: run ",
  disconnect: (label: string) => `Disconnect ${label}`,
  disconnectPractice: "Disconnect practice account",
  disconnectTip: (label: string) =>
    `Tip: they can disconnect ${label} from this window at any time.`,
  disconnected: (label: string) =>
    `${label} is disconnected. Nothing will use it from now on.`,
  discordSetup: (practice: boolean) =>
    `${practice ? "When you use real Discord, add" : "Add"} each person’s Discord user ID in Trusted circle.`,
  empty: "No services are listed.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "Connections are not set up for this app yet. Run bun run dev:setup.",
    "Please sign in again.": "Please sign in again.",
    "Practice connections are only available in practice mode.":
      "Practice connections are only available in practice mode.",
    "That account could not be found.": "That account could not be found.",
    "That connection could not be found.":
      "That connection could not be found.",
    "The connection did not finish. You can try again.":
      "The connection did not finish. You can try again.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "This connection changed while the request was running. Return to Connections to check its status.",
    "This connection was not started from your account. Please try connecting again.":
      "This connection was not started from your account. Please try connecting again.",
    "This service does not use a personal sign-in.":
      "This service does not use a personal sign-in.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "Turn off Practice mode in Settings before connecting or changing a real account.",
    "We could not confirm the connection.":
      "We could not confirm the connection.",
  } satisfies Record<string, string>,
  groups: {
    appointments: "Manage appointments",
    email: "Read and write email",
    messages: "Message family and friends",
  },
  helperTitle: "Setting this up for someone?",
  imessageIntro:
    "Link each person in Trusted circle to their existing Photon contact. LifeLink does not register new contacts.",
  imessageSteps: [
    "Save the exact phone number or Apple ID email address they send iMessages from. A phone number and an email address are separate identities, even for the same person.",
    "Make sure this exact address is already registered in the Photon dashboard. If it is missing, add the contact there first. Then choose Link iMessage in Trusted circle and use the assigned number shown for that contact.",
    "Ask them to send the first iMessage to their assigned number from that exact saved address. LifeLink can message them after their first message arrives.",
  ],
  intro: (label: string) =>
    `LifeLink can do these things with ${label}. Nothing is sent until you approve it.`,
  limitTags: { not_offered: "Not possible", not_wired: "Coming later" },
  limitsCount: (count: number) => `What LifeLink can’t do yet (${count})`,
  limitsTitle: "What LifeLink can’t do yet",
  loading: "Loading connections",
  manage: "Manage",
  notSetUp:
    "This is not turned on yet. Ask the person who set up LifeLink to turn it on.",
  openCircle: "Open Trusted circle",
  permissions: {
    add: "Add",
    calendar: "Find dates",
    draft: "Draft",
    message: "Message",
    money: "Money",
    notice: "Alerts",
    post: "Post",
    read: "Read",
    replies: "Replies",
    send: "Send",
    unavailable: "Nothing yet",
  },
  practiceAccount: "Use a practice account",
  practiceBlocked: (label: string) =>
    `Your real ${label} connection is saved. Practice accounts cannot replace it. Turn off Practice mode in Settings to manage it.`,
  practiceConnected: (label: string) =>
    `A practice ${label} account is connected. It never reaches the real service.`,
  practiceDisconnected: (label: string) =>
    `The practice ${label} account is disconnected.`,
  practiceMessages: (imessage: boolean): string =>
    imessage
      ? "Practice iMessages are simulated. No messages reach your contacts."
      : "Practice Discord messages are simulated. No messages reach your contacts.",
  practiceNeverConnects:
    "This practice account never connects to the real service.",
  pressConnect: (label: string) => `Press ${label} below.`,
  providers: {
    discord: {
      accountRequirement:
        "The family member shares a server with the app's bot, or has messaged the bot first.",
      capabilities: {
        "discord.receive": {
          label: "Receive replies",
          note: "Replies arrive while LifeLink's Discord bot is online.",
        },
        "discord.send": {
          label: "Send a direct message after you approve it",
        },
      },
      summary: "Direct messages with family members on Discord.",
    },
    ebay: {
      accountRequirement: "Personal eBay accounts cannot be connected here.",
      capabilities: {
        "ebay.search": {
          label: "Search eBay listings",
        },
        "ebay.selling": {
          label: "Your listings, orders, or purchases",
        },
      },
      summary: "Search is coming later. LifeLink never buys or sells.",
    },
    facebook: {
      accountRequirement:
        "Facebook Page features only. Personal profiles are not supported.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Read and answer your Page's messages",
        },
        "facebook.page_post": {
          label: "Post to a Page after you approve it",
        },
        "facebook.personal": {
          label: "Personal timeline and friends' messages",
          note: "Facebook does not let apps read or send personal Messenger chats.",
        },
      },
      summary: "Business Pages only. Coming later.",
    },
    gmail: {
      accountRequirement: "A Google account.",
      capabilities: {
        "email.appointments": {
          label: "Find appointments in emails",
        },
        "email.draft": {
          label: "Write a draft for you to review",
        },
        "email.new_message_event": {
          label: "Notice new mail (checked about once a minute)",
        },
        "email.read_selected": {
          label: "Read emails you pick for a summary",
        },
        "email.send": {
          label: "Send an email after you approve it",
        },
      },
      summary: "Read, write, and send email. Find appointments in your mail.",
    },
    google_calendar: {
      accountRequirement: "A Google account.",
      capabilities: {
        "calendar.create": {
          label: "Add an approved appointment",
        },
        "calendar.read": {
          label: "See your upcoming events",
        },
      },
      summary: "Add appointments to your calendar after you approve them.",
    },
    google_drive: {
      accountRequirement: "A Google account.",
      capabilities: {
        "drive.create": {
          label: "Save appointment notes as a document after you approve it",
        },
        "drive.read": {
          label: "Find files you already keep in Drive",
          note: "LifeLink sees file names and links, not what is inside them.",
        },
      },
      summary: "Find your files and save appointment notes.",
    },
    imessage: {
      accountRequirement:
        "Your contacts don't need an invitation, a LifeLink account, or access to the Photon dashboard.",
      capabilities: {
        "imessage.delivery": {
          label: "Delivery updates",
          note: "LifeLink knows your message was sent, but not if it arrived or was read.",
        },
        "imessage.first_contact": {
          label: "Start a conversation with someone new",
          note: "Each person must send the first message.",
        },
        "imessage.receive": {
          label: "Receive replies",
        },
        "imessage.send": {
          label: "Send a text or photo after you approve it",
          note: "Works after they send the first message.",
        },
      },
      summary:
        "Text with family and friends. Each person sends the first message.",
    },
    instacart: {
      accountRequirement: "Shopping through LifeLink is no longer available.",
      capabilities: {},
      summary: "Shopping through LifeLink is no longer available.",
    },
    instagram: {
      accountRequirement: "An Instagram Business or Creator account.",
      capabilities: {
        "instagram.messages": {
          label: "Answer direct messages",
        },
        "instagram.personal": {
          label: "Personal accounts",
        },
        "instagram.post": {
          label: "Share a photo post after you approve it",
        },
      },
      summary: "Business and Creator accounts only. Coming later.",
    },
    outlook: {
      accountRequirement:
        "A Microsoft account. Some work accounts need an administrator's consent.",
      capabilities: {
        "calendar.create": {
          label: "Add an approved appointment to your Outlook calendar",
        },
        "email.draft": {
          label: "Write a draft for you to review",
        },
        "email.new_message_event": {
          label: "Notice new mail as it arrives",
        },
        "email.read_selected": {
          label: "Read emails you pick for a summary",
        },
        "email.send": {
          label: "Send an email after you approve it",
        },
      },
      summary: "Outlook mail and calendar in one connection.",
    },
    paypal: {
      accountRequirement: "Personal PayPal accounts cannot be connected here.",
      capabilities: {
        "paypal.invoices": {
          label: "Look up invoices",
        },
        "paypal.send_money": {
          label: "Send money to a person",
          note: "LifeLink never sends money.",
        },
      },
      summary: "Invoices are coming later. LifeLink never sends money.",
    },
    telegram: {
      accountRequirement:
        "The family member opens the link LifeLink makes for them and taps Start in Telegram.",
      capabilities: {
        "telegram.first_contact": {
          label: "Start a conversation with someone new",
          note: "Each person must tap Start on the bot first.",
        },
        "telegram.receive": {
          label: "Receive replies",
        },
        "telegram.send": {
          label: "Send a message or photos after you approve it",
        },
      },
      summary: "Messages with family members on Telegram.",
    },
  } satisfies Record<ConnectionProviderId, ProviderMessages>,
  realImessage: "When you use real iMessage, follow these steps.",
  requirements: "What you need",
  retry: "Try connecting again",
  returnConnected: "You come back here and it says Connected.",
  setup: "Set up",
  signInProvider: (label: string) =>
    `You’ll sign in on ${label}’s own page. LifeLink never sees your password.`,
  signInTheirAccount: "Sign in with their account, not yours.",
  status: {
    connected: "Connected",
    disconnected: "Not connected",
    error: "Did not connect",
    notOn: "Not turned on",
    pending: "Not finished",
    practice: "Practice",
    practiceAccount: "Practice account",
    ready: "Ready",
    realSaved: "Real account saved",
  },
  subline:
    "Connect the services you already use. Open one to see what LifeLink can do with it.",
  telegramSetup: (practice: boolean) =>
    `${practice ? "When you use real Telegram, open" : "Open"} each person in Trusted circle, choose Link Telegram, and send them their link. They tap Start once.`,
  title: "Connections",
  unavailableFeatures: (label: string) =>
    `${label} has no available features in LifeLink yet. You do not need to connect an account.`,
  unavailableIntro: (label: string) =>
    `LifeLink can’t do anything with ${label} yet.`,
};

type ConnectionsMessages = Omit<
  typeof connections,
  "connectionStates" | "errors" | "providers"
> & {
  connectionStates: Record<string, string>;
  errors: Record<string, string>;
  providers: Record<ConnectionProviderId, ProviderMessages>;
};

export { connections };

export type { ConnectionsMessages };

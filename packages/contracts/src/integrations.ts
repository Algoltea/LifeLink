/**
 * Integration catalog: the single source for what each provider can do here,
 * what the developer configures once (through `bun run dev:setup`), and what
 * each person connects for themselves on the Connections screen.
 *
 * Dependency-free on purpose: the setup script imports this file directly.
 * Capabilities marked "not_offered" are things the provider does not support
 * today; the interface says so instead of pretending.
 */

type EnvTarget = "convex" | "web" | "discord-bridge";

interface EnvVarDefinition {
  readonly defaultValue?: string;
  readonly hint: string;
  readonly label: string;
  readonly name: string;
  readonly required: boolean;
  readonly secret: boolean;
  readonly target: EnvTarget;
}

type DeveloperIntegrationId =
  | "openrouter"
  | "gemini_live"
  | "composio"
  | "photon"
  | "discord"
  // Retained for historical records; absent from the active catalog.
  | "instacart";

interface DeveloperIntegration {
  readonly consoleSteps: readonly string[];
  readonly consoleUrl: string;
  readonly envVars: readonly EnvVarDefinition[];
  readonly id: DeveloperIntegrationId;
  readonly label: string;
  readonly purpose: string;
  readonly validation: string;
}

/**
 * available:   implemented here against the provider's verified tools.
 * not_wired:   the provider supports it, but no screen in this app uses it yet.
 * not_offered: the provider does not support it.
 */
type CapabilityStatus = "available" | "not_offered" | "not_wired";

interface Capability {
  readonly id: string;
  readonly label: string;
  readonly note?: string;
  readonly status: CapabilityStatus;
}

type ConnectionProviderId =
  | "gmail"
  | "outlook"
  | "google_calendar"
  | "paypal"
  | "facebook"
  | "instagram"
  | "ebay"
  | "imessage"
  | "discord"
  // Retained for historical records; absent from the active catalog.
  | "instacart";

interface ConnectionDefinition {
  readonly accountRequirement: string;
  readonly capabilities: readonly Capability[];
  readonly composioToolkit?: string;
  readonly connectStyle: "oauth" | "handle" | "developer_only";
  readonly developerIntegration: DeveloperIntegrationId;
  readonly id: ConnectionProviderId;
  readonly label: string;
  readonly summary: string;
}

const developerIntegrations: readonly DeveloperIntegration[] = [
  {
    consoleSteps: [
      "Sign in at openrouter.ai and open Keys.",
      'Create a key named "LifeLink (development)" with a monthly credit limit.',
      "Paste it when setup asks; it is stored only in your Convex deployment.",
    ],
    consoleUrl: "https://openrouter.ai/settings/keys",
    envVars: [
      {
        hint: "Starts with sk-or-.",
        label: "OpenRouter API key",
        name: "OPENROUTER_API_KEY",
        required: true,
        secret: true,
        target: "convex",
      },
      {
        defaultValue: "google/gemini-4-argon",
        hint: "Model for conversations, drafts, summaries, and action proposals.",
        label: "Main Gemini model on OpenRouter",
        name: "OPENROUTER_MODEL",
        required: true,
        secret: false,
        target: "convex",
      },
      {
        defaultValue: "z-ai/glm-5.3-flash",
        hint: "Cheaper model for short classification jobs such as reading a reply.",
        label: "Fast model on OpenRouter",
        name: "OPENROUTER_FAST_MODEL",
        required: true,
        secret: false,
        target: "convex",
      },
      {
        defaultValue: "elevenlabs/eleven-v4-turbo",
        hint: "ElevenLabs speech model served through the same OpenRouter key.",
        label: "Read-aloud model on OpenRouter",
        name: "OPENROUTER_TTS_MODEL",
        required: false,
        secret: false,
        target: "convex",
      },
      {
        defaultValue: "sarah",
        hint: "A voice supported by the selected ElevenLabs model.",
        label: "Read-aloud voice",
        name: "OPENROUTER_TTS_VOICE",
        required: false,
        secret: false,
        target: "convex",
      },
    ],
    id: "openrouter",
    label: "OpenRouter",
    purpose:
      "Conversation, drafting, summaries, scam explanations, action proposals, and ElevenLabs read-aloud.",
    validation:
      "GET https://openrouter.ai/api/v1/key with the key (reads the key's own limits; no tokens spent).",
  },
  {
    consoleSteps: [
      "Open Google AI Studio and create an API key for a project with the Gemini API enabled.",
      "Paste it when setup asks. It never reaches the browser: the backend mints one-use, short-lived Live tokens.",
    ],
    consoleUrl: "https://aistudio.google.com/apikey",
    envVars: [
      {
        hint: "Long-lived key; stays in Convex.",
        label: "Gemini API key",
        name: "GEMINI_API_KEY",
        required: true,
        secret: true,
        target: "convex",
      },
      {
        defaultValue: "gemini-3.8-live",
        hint: "Live API model used for spoken conversation.",
        label: "Gemini Live model",
        name: "GEMINI_LIVE_MODEL",
        required: true,
        secret: false,
        target: "convex",
      },
    ],
    id: "gemini_live",
    label: "Gemini Live (voice)",
    purpose:
      "Two-way spoken conversation with captions. Voice requests go through the same review and approval as typed ones.",
    validation:
      "GET https://generativelanguage.googleapis.com/v1beta/models/{model} with the key (metadata only).",
  },
  {
    consoleSteps: [
      "Sign in at platform.composio.dev and open your project's Settings, then API Keys.",
      "Paste the project API key when setup asks.",
      "Setup then creates Composio-managed auth configs for Gmail, Outlook, Google Calendar, Facebook, and Instagram, and registers your Convex webhook URL.",
      "PayPal and eBay need your own app credentials from developer.paypal.com and developer.ebay.com; setup asks for them only if you enable those.",
    ],
    consoleUrl: "https://platform.composio.dev",
    envVars: [
      {
        hint: "Project API key.",
        label: "Composio API key",
        name: "COMPOSIO_API_KEY",
        required: true,
        secret: true,
        target: "convex",
      },
      {
        hint: "Created by setup when it registers the webhook; or copy it from the dashboard.",
        label: "Composio webhook signing secret",
        name: "COMPOSIO_WEBHOOK_SECRET",
        required: false,
        secret: true,
        target: "convex",
      },
      {
        hint: "JSON map of toolkit to auth config id, written by setup.",
        label: "Composio auth configs",
        name: "COMPOSIO_AUTH_CONFIGS",
        required: false,
        secret: false,
        target: "convex",
      },
    ],
    id: "composio",
    label: "Composio",
    purpose:
      "Gmail, Outlook, Google Calendar, PayPal, Facebook, Instagram, and eBay through each person's own connected account.",
    validation:
      "GET https://backend.composio.dev/api/v3.1/auth_configs?limit=1 with the key.",
  },
  {
    consoleSteps: [
      "Open your existing Spectrum Stable project in the Photon dashboard. Keep the shared-line users you already registered.",
      "Copy SPECTRUM_PROJECT_ID (a UUID) and SPECTRUM_PROJECT_SECRET. Enter each value only, without the variable name or equals sign.",
      "Setup uses Spectrum Basic authentication and registers the Convex webhook with its signing secret.",
      'Add each registered iMessage contact in Trusted circle, then choose "Set up iMessage" to link their existing shared-line user.',
      "LifeLink shows the assigned number. Each person must text it first from their exact registered phone number or email.",
      "New contacts must first be registered in the Photon dashboard. LifeLink does not create duplicate registrations or send invitations.",
      "Practice mode never contacts Spectrum or registers real people.",
    ],
    consoleUrl: "https://photon.codes",
    envVars: [
      {
        hint: "The Spectrum Stable project secret. This is not a Beta pho_sk_... API key.",
        label: "Spectrum project secret",
        name: "SPECTRUM_PROJECT_SECRET",
        required: true,
        secret: true,
        target: "convex",
      },
      {
        hint: "The UUID shown as SPECTRUM_PROJECT_ID in your Photon dashboard.",
        label: "Spectrum project ID",
        name: "SPECTRUM_PROJECT_ID",
        required: true,
        secret: false,
        target: "convex",
      },
      {
        hint: "Written by setup when it registers the Spectrum webhook.",
        label: "Spectrum webhook signing secret",
        name: "SPECTRUM_WEBHOOK_SECRET",
        required: false,
        secret: true,
        target: "convex",
      },
    ],
    id: "photon",
    label: "Photon Spectrum (iMessage)",
    purpose:
      "Send and receive iMessages through each contact's shared-line assignment after they text first.",
    validation:
      "GET https://spectrum.photon.codes/projects/{projectId} with project ID and secret using Basic auth; does not register contacts or send messages.",
  },
  {
    consoleSteps: [
      "Create an application at discord.com/developers/applications.",
      "Copy the Application ID and Public Key from General Information.",
      "On the Bot tab, reset and copy the bot token.",
      "Install the bot to a small private server that the family member also joins (setup prints the install link).",
      "bun run dev starts a small Gateway bridge that forwards direct messages to Convex.",
    ],
    consoleUrl: "https://discord.com/developers/applications",
    envVars: [
      {
        hint: "Bot token from the Bot tab.",
        label: "Discord bot token",
        name: "DISCORD_BOT_TOKEN",
        required: true,
        secret: true,
        target: "convex",
      },
      {
        hint: "Application ID from General Information.",
        label: "Discord application id",
        name: "DISCORD_APPLICATION_ID",
        required: true,
        secret: false,
        target: "convex",
      },
      {
        hint: "Public Key from General Information.",
        label: "Discord public key",
        name: "DISCORD_PUBLIC_KEY",
        required: false,
        secret: false,
        target: "convex",
      },
    ],
    id: "discord",
    label: "Discord",
    purpose:
      "Message family members who use Discord, and receive their replies.",
    validation: "GET https://discord.com/api/v10/users/@me with the bot token.",
  },
];

const connectionDefinitions: readonly ConnectionDefinition[] = [
  {
    accountRequirement: "A Google account.",
    capabilities: [
      {
        id: "email.read_selected",
        label: "Read emails you pick for a summary",
        status: "available",
      },
      {
        id: "email.draft",
        label: "Write a draft for you to review",
        status: "available",
      },
      {
        id: "email.send",
        label: "Send an email after you approve it",
        status: "available",
      },
      {
        id: "email.new_message_event",
        label: "Notice new mail (checked about once a minute)",
        status: "available",
      },
      {
        id: "email.appointments",
        label: "Find appointments in emails",
        status: "available",
      },
    ],
    composioToolkit: "gmail",
    connectStyle: "oauth",
    developerIntegration: "composio",
    id: "gmail",
    label: "Gmail",
    summary:
      "Summaries of emails you choose, drafts, and appointments found in your mail.",
  },
  {
    accountRequirement:
      "A Microsoft account. Some work accounts need an administrator's consent.",
    capabilities: [
      {
        id: "email.read_selected",
        label: "Read emails you pick for a summary",
        status: "available",
      },
      {
        id: "email.draft",
        label: "Write a draft for you to review",
        status: "available",
      },
      {
        id: "email.send",
        label: "Send an email after you approve it",
        status: "available",
      },
      {
        id: "email.new_message_event",
        label: "Notice new mail as it arrives",
        status: "available",
      },
      {
        id: "calendar.create",
        label: "Add an approved appointment to your Outlook calendar",
        status: "available",
      },
    ],
    composioToolkit: "outlook",
    connectStyle: "oauth",
    developerIntegration: "composio",
    id: "outlook",
    label: "Outlook",
    summary: "Outlook mail and calendar in one connection.",
  },
  {
    accountRequirement: "A Google account.",
    capabilities: [
      {
        id: "calendar.read",
        label: "See your upcoming events",
        note: "Verified in Google Calendar's connector; Today does not show them yet.",
        status: "not_wired",
      },
      {
        id: "calendar.create",
        label: "Add an approved appointment",
        status: "available",
      },
    ],
    composioToolkit: "googlecalendar",
    connectStyle: "oauth",
    developerIntegration: "composio",
    id: "google_calendar",
    label: "Google Calendar",
    summary: "Your calendar on Today, and approved appointments added to it.",
  },
  {
    accountRequirement:
      "The developer's PayPal app credentials. Personal sign-in is not offered.",
    capabilities: [
      {
        id: "paypal.invoices",
        label: "Look up invoices",
        note: "Verified in PayPal's connector; no screen uses it yet.",
        status: "not_wired",
      },
      {
        id: "paypal.send_money",
        label: "Send money to a person",
        note: "PayPal's connector has no payout or send-money action. This app will not move money.",
        status: "not_offered",
      },
    ],
    composioToolkit: "paypal",
    connectStyle: "developer_only",
    developerIntegration: "composio",
    id: "paypal",
    label: "PayPal",
    summary: "Invoice look-ups only. No payments are sent from this app.",
  },
  {
    accountRequirement:
      "A Facebook Page you manage. Personal profiles are not supported by Facebook's API.",
    capabilities: [
      {
        id: "facebook.page_post",
        label: "Post to a Page after you approve it",
        note: "Verified in Facebook's connector; no screen uses it yet.",
        status: "not_wired",
      },
      {
        id: "facebook.page_inbox",
        label: "Read and answer your Page's messages",
        note: "Verified in Facebook's connector; no screen uses it yet.",
        status: "not_wired",
      },
      {
        id: "facebook.personal",
        label: "Personal timeline and friends' messages",
        note: "Facebook does not allow apps to read or send personal Messenger chats.",
        status: "not_offered",
      },
    ],
    composioToolkit: "facebook",
    connectStyle: "oauth",
    developerIntegration: "composio",
    id: "facebook",
    label: "Facebook",
    summary: "Facebook Pages only.",
  },
  {
    accountRequirement: "An Instagram Business or Creator account.",
    capabilities: [
      {
        id: "instagram.post",
        label: "Share a photo post after you approve it",
        note: "Verified in Instagram's connector; no screen uses it yet.",
        status: "not_wired",
      },
      {
        id: "instagram.messages",
        label: "Answer direct messages",
        note: "Verified in Instagram's connector (only within 24 hours of their last message); no screen uses it yet.",
        status: "not_wired",
      },
      {
        id: "instagram.personal",
        label: "Personal accounts",
        note: "Instagram's API does not support personal accounts.",
        status: "not_offered",
      },
    ],
    composioToolkit: "instagram",
    connectStyle: "oauth",
    developerIntegration: "composio",
    id: "instagram",
    label: "Instagram",
    summary: "Business and Creator accounts only.",
  },
  {
    accountRequirement:
      "The developer's eBay app credentials. Personal sign-in is not offered.",
    capabilities: [
      {
        id: "ebay.search",
        label: "Search eBay listings",
        note: "Verified in eBay's connector; no screen uses it yet.",
        status: "not_wired",
      },
      {
        id: "ebay.selling",
        label: "Your listings, orders, or purchases",
        note: "The eBay connector only covers public catalog search.",
        status: "not_offered",
      },
    ],
    composioToolkit: "ebay",
    connectStyle: "developer_only",
    developerIntegration: "composio",
    id: "ebay",
    label: "eBay",
    summary: "Search public listings. Buying and selling are not available.",
  },
  {
    accountRequirement:
      "Register each person in the Spectrum shared-line dashboard, then link their exact iMessage address in Trusted circle. Existing registrations are reused. They text their assigned number first; no Photon account or dashboard teammate invitation is needed.",
    capabilities: [
      {
        id: "imessage.send",
        label: "Send a text or photo after you approve it",
        note: "They must text their assigned number before you can send an approved message.",
        status: "available",
      },
      { id: "imessage.receive", label: "Receive replies", status: "available" },
      {
        id: "imessage.delivery",
        label: "Delivery updates",
        note: "LifeLink currently confirms provider acceptance. Delivery and read updates are not connected.",
        status: "not_wired",
      },
      {
        id: "imessage.first_contact",
        label: "Start a conversation with someone new",
        note: "Each contact must text their assigned shared-line number first.",
        status: "not_offered",
      },
    ],
    connectStyle: "handle",
    developerIntegration: "photon",
    id: "imessage",
    label: "iMessage (Photon)",
    summary:
      "Set up each contact's shared iMessage number in Trusted circle, then exchange messages after they text first.",
  },
  {
    accountRequirement:
      "The family member shares a server with the app's bot, or has messaged the bot first.",
    capabilities: [
      {
        id: "discord.send",
        label: "Send a direct message after you approve it",
        status: "available",
      },
      {
        id: "discord.receive",
        label: "Receive replies",
        note: "Needs the Discord bridge running with bun run dev.",
        status: "available",
      },
    ],
    connectStyle: "handle",
    developerIntegration: "discord",
    id: "discord",
    label: "Discord",
    summary: "Direct messages with family members on Discord.",
  },
];

const coreEnvVars: readonly EnvVarDefinition[] = [
  {
    hint: "Generated by setup (32 random bytes, base64).",
    label: "Better Auth secret",
    name: "BETTER_AUTH_SECRET",
    required: true,
    secret: true,
    target: "convex",
  },
  {
    defaultValue: "http://localhost:3001",
    hint: "Where the web app runs; Better Auth trusts this origin.",
    label: "Web app URL",
    name: "SITE_URL",
    required: true,
    secret: false,
    target: "convex",
  },
  {
    defaultValue: "true",
    hint: "Allow people to choose Practice mode explicitly. Simulated outcomes are always labelled Practice.",
    label: "Allow Practice mode",
    name: "DEMO_MODE_ALLOWED",
    required: true,
    secret: false,
    target: "convex",
  },
  {
    hint: "Generated by setup; signs requests from the local Discord bridge.",
    label: "Bridge shared secret",
    name: "BRIDGE_SHARED_SECRET",
    required: true,
    secret: true,
    target: "convex",
  },
];

const findDeveloperIntegration = (
  id: DeveloperIntegrationId
): DeveloperIntegration | undefined =>
  developerIntegrations.find((integration) => integration.id === id);

const findConnectionDefinition = (
  id: string
): ConnectionDefinition | undefined =>
  connectionDefinitions.find((definition) => definition.id === id);

export {
  connectionDefinitions,
  coreEnvVars,
  developerIntegrations,
  findConnectionDefinition,
  findDeveloperIntegration,
};

export type {
  Capability,
  CapabilityStatus,
  ConnectionDefinition,
  ConnectionProviderId,
  DeveloperIntegration,
  DeveloperIntegrationId,
  EnvTarget,
  EnvVarDefinition,
};

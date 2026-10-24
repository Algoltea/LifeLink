/**
 * Copy and sample data for the public landing page. Every person, time, and
 * message here is an example; nothing comes from a real account.
 */

interface TimelineStep {
  readonly label: string;
  readonly time: string;
  /** A step the person decides, shown in copper. */
  readonly decision?: boolean;
}

interface TimelineGroup {
  readonly heading: string;
  readonly steps: readonly TimelineStep[];
}

const RIDE_TIMELINE: readonly TimelineGroup[] = [
  {
    heading: "Monday morning",
    steps: [
      { label: "You ask for a ride", time: "9:02 AM" },
      { label: "LifeLink writes the message", time: "9:02 AM" },
      {
        decision: true,
        label: "You change a word and approve version 2",
        time: "9:05 AM",
      },
      { label: "Sent to Sam by iMessage", time: "9:05 AM" },
    ],
  },
  {
    heading: "Monday afternoon",
    steps: [
      { label: "Sam replies: “Of course, 9:45?”", time: "1:40 PM" },
      { decision: true, label: "You confirm the pickup time", time: "1:52 PM" },
    ],
  },
  {
    heading: "Tuesday, October 27",
    steps: [
      { label: "Reminder: Sam arrives at 9:45", time: "9:15 AM" },
      { label: "Appointment with Dr. Patel", time: "10:30 AM" },
    ],
  },
];

interface ScamExample {
  readonly id: string;
  readonly label: string;
  /** What arrived, as the person would paste or describe it. */
  readonly received: string;
  readonly signs: readonly string[];
  readonly nextStep: string;
}

const SCAM_EXAMPLES: readonly ScamExample[] = [
  {
    id: "text",
    label: "A text",
    nextStep:
      "Open your delivery company’s app or website yourself. Don’t use this link.",
    received:
      "Your parcel is waiting. Pay a $1.99 redelivery fee within 30 minutes: parcel-redeliver.co/pay",
    signs: [
      "It rushes you: pay within 30 minutes.",
      "It asks for a payment through a link.",
      "The link isn’t a delivery company’s own site.",
    ],
  },
  {
    id: "email",
    label: "An email",
    nextStep:
      "Call your bank on the number printed on your card. Don’t reply to this email.",
    received:
      "Your bank account is locked. Confirm your details today to avoid closure.",
    signs: [
      "It threatens to close your account.",
      "It asks you to confirm private details.",
      "The sender’s address doesn’t match your bank.",
    ],
  },
  {
    id: "letter",
    label: "A letter",
    nextStep:
      "Look up the prize company yourself before you pay or send anything.",
    received:
      "You have won $5,000. Send a $40 processing fee to claim your prize.",
    signs: [
      "You must pay before you receive anything.",
      "You didn’t enter a competition.",
      "There is no way to check who sent it.",
    ],
  },
  {
    id: "call",
    label: "A phone call",
    nextStep:
      "Hang up and call your grandson on the number you already have for him.",
    received:
      "A caller says your grandson is in trouble and needs money sent today.",
    signs: [
      "It asks for money urgently.",
      "It asks you to keep the call secret.",
      "It wants payment by gift card or wire transfer.",
    ],
  },
];

interface Feature {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
}

const MORE_FEATURES: readonly Feature[] = [
  {
    id: "email",
    name: "Email",
    summary:
      "Flags emails that look like scams, and drafts replies that never send on their own.",
  },
  {
    id: "today",
    name: "Today",
    summary:
      "What needs you first, then appointments, the weather and three headlines you choose.",
  },
  {
    id: "groceries",
    name: "Groceries",
    summary:
      "Lists with a budget and cost estimates, ready to copy or print for the shop.",
  },
  {
    id: "documents",
    name: "Documents",
    summary: "Your Google Drive files, each with a preview.",
  },
  {
    id: "circle",
    name: "Trusted circle",
    summary:
      "Invite someone with a code, choose what they can see and for how long, and stop sharing at any time.",
  },
  {
    id: "family",
    name: "Family view",
    summary:
      "The page your family sees: only what you share, with photos and a place to reply.",
  },
  {
    id: "recap",
    name: "Recap a conversation",
    summary:
      "Separates what was agreed from what was only offered, and suggests next steps.",
  },
  {
    id: "help",
    name: "How I like help",
    summary:
      "Short or detailed answers, one step at a time, in the language you choose.",
  },
  {
    id: "connections",
    name: "Connections",
    summary:
      "Each account says plainly what works, what isn’t ready yet, and what it doesn’t offer.",
  },
];

interface Question {
  readonly question: string;
  readonly answer: string;
}

const QUESTIONS: readonly Question[] = [
  {
    answer:
      "Sample family, email and an appointment, so you can try everything. Nothing real is sent, and every result is labelled Practice.",
    question: "What is Practice mode?",
  },
  {
    answer:
      "Yes. Say what you need, and LifeLink can read replies aloud at the speed you choose.",
    question: "Can I speak instead of typing?",
  },
  {
    answer:
      "No. They see only what you share, and they can never send, approve or spend for you.",
    question: "Can my family act for me?",
  },
  {
    answer:
      "Gmail, Outlook and Google Calendar, plus iMessage, Discord and Telegram. Each shows plainly what works and what doesn’t yet.",
    question: "Which accounts can I connect?",
  },
  {
    answer:
      "No. It keeps your lists, estimates costs and a budget, then lets you copy or print the list to shop yourself.",
    question: "Does LifeLink order groceries?",
  },
  {
    answer:
      "It becomes a new version, and LifeLink asks you to approve that one before anything is sent.",
    question: "What if I change a message?",
  },
  {
    answer:
      "No. Sent, replied and confirmed are separate steps, and LifeLink tells you which one you’re at, in words.",
    question: "Is “sent” the same as “agreed”?",
  },
  {
    answer:
      "It names the warning signs and a safer next step. It never promises that a message is safe.",
    question: "Can it tell me a message is safe?",
  },
  {
    answer:
      "Solitaire does, and your game is saved on this device. Messages need a connection.",
    question: "Does it work without the internet?",
  },
  {
    answer:
      "You’ll see what happened, that nothing was lost, and what to do next.",
    question: "What if something goes wrong?",
  },
];

const RUTH_MESSAGE =
  "Hi Sam, could you drive me to Dr. Patel on Tuesday, October 27? I need to be there by 10:30 AM. Thank you! Ruth";

export type { Feature, Question, ScamExample, TimelineGroup, TimelineStep };

export { MORE_FEATURES, QUESTIONS, RIDE_TIMELINE, RUTH_MESSAGE, SCAM_EXAMPLES };

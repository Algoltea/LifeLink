/**
 * Four everyday conversations to practise. Every person here is a role, not a
 * real contact, and nothing said here books, sends, or saves anything.
 */
import type { Script } from "./script";

const OWN_WORDS = "Thank you. There’s no wrong way to say it.";

const bookAppointment: Script = {
  forReal: null,
  id: "book-appointment",
  phrases: [
    "I’d like to book an appointment, please.",
    "Could you say those times again, more slowly?",
    "Is there anything I should bring?",
    "Could you repeat the day and time so I can write it down?",
  ],
  practised: [
    "Saying what the visit is for",
    "Asking to hear the times again",
    "Choosing one time clearly",
    "Asking what to bring",
  ],
  role: "Receptionist at a sample clinic",
  setting:
    "You’re calling a clinic to book a check-up. The receptionist answers.",
  start: "greeting",
  summary: "Choose a time, ask questions, and check the details.",
  title: "Booking an appointment",
  turns: [
    {
      choices: [
        {
          feedback:
            "Clear and polite. Saying what kind of visit helps them find the right time.",
          id: "checkup",
          next: "times",
          says: "I’d like to book a check-up with my doctor, please.",
        },
        {
          feedback:
            "Good. Saying the reason helps them book enough time for you.",
          id: "knee",
          next: "times",
          says: "I need to see someone about my knee, please.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "times",
      id: "greeting",
      says: "Good morning, the clinic. How can I help you?",
      speaker: "Receptionist",
    },
    {
      choices: [
        {
          feedback: "Good. Choosing one clearly avoids mix-ups.",
          id: "tuesday",
          next: "booked-tuesday",
          says: "Tuesday at 10:30, please.",
        },
        {
          feedback: "That’s always a fair thing to ask.",
          id: "slower",
          next: "times-slowly",
          says: "Could you say those times again, more slowly?",
        },
        {
          feedback: "Good. Choosing one clearly avoids mix-ups.",
          id: "thursday",
          next: "booked-thursday",
          says: "Thursday at 2:15, please.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "times-check",
      id: "times",
      says: "We have Tuesday at 10:30 in the morning, or Thursday at 2:15 in the afternoon. Which would suit you?",
      speaker: "Receptionist",
    },
    {
      choices: [
        {
          feedback: "Good. Choosing one clearly avoids mix-ups.",
          id: "tuesday",
          next: "booked-tuesday",
          says: "Tuesday at 10:30, please.",
        },
        {
          feedback: "Good. Choosing one clearly avoids mix-ups.",
          id: "thursday",
          next: "booked-thursday",
          says: "Thursday at 2:15, please.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "booked-tuesday",
      id: "times-slowly",
      says: "Of course. Tuesday, at ten thirty in the morning. Or Thursday, at two fifteen in the afternoon.",
      speaker: "Receptionist",
    },
    {
      choices: [
        {
          feedback: "Good. Choosing one clearly avoids mix-ups.",
          id: "tuesday",
          next: "booked-tuesday",
          says: "Tuesday at 10:30, please.",
        },
        {
          feedback: "Good. Choosing one clearly avoids mix-ups.",
          id: "thursday",
          next: "booked-thursday",
          says: "Thursday at 2:15, please.",
        },
      ],
      freeFeedback:
        "Thank you. If they choose for you, it’s fine to say it doesn’t suit you.",
      freeNext: "booked-tuesday",
      id: "times-check",
      says: "Just to check: would you like Tuesday at 10:30, or Thursday at 2:15?",
      speaker: "Receptionist",
    },
    {
      choices: [
        {
          feedback: "Repeating it back is one of the best ways to be sure.",
          id: "repeat",
          next: "bring",
          says: "Could you repeat the day and time so I can write it down?",
        },
        {
          feedback: "Good question. Knowing what to bring saves worry later.",
          id: "bring",
          next: "bring",
          says: "Is there anything I should bring?",
        },
        {
          feedback:
            "Polite and clear. Next time, you might also ask them to repeat the day and time.",
          id: "done",
          next: "goodbye",
          says: "No, that’s everything. Thank you.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "bring",
      id: "booked-tuesday",
      says: "Lovely. You’re booked for Tuesday at 10:30 in the morning. Is there anything else?",
      speaker: "Receptionist",
    },
    {
      choices: [
        {
          feedback: "Repeating it back is one of the best ways to be sure.",
          id: "repeat",
          next: "bring",
          says: "Could you repeat the day and time so I can write it down?",
        },
        {
          feedback: "Good question. Knowing what to bring saves worry later.",
          id: "bring",
          next: "bring",
          says: "Is there anything I should bring?",
        },
        {
          feedback:
            "Polite and clear. Next time, you might also ask them to repeat the day and time.",
          id: "done",
          next: "goodbye",
          says: "No, that’s everything. Thank you.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "bring",
      id: "booked-thursday",
      says: "Lovely. You’re booked for Thursday at 2:15 in the afternoon. Is there anything else?",
      speaker: "Receptionist",
    },
    {
      choices: [
        {
          feedback: "Well done. You have everything you need.",
          id: "thanks",
          next: "goodbye",
          says: "Thank you, that’s everything.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "goodbye",
      id: "bring",
      says: "Certainly. Please bring your insurance card and a list of your medicines. Anything else I can help with?",
      speaker: "Receptionist",
    },
    {
      choices: [],
      freeFeedback: "",
      freeNext: "",
      id: "goodbye",
      says: "You’re welcome. Take care, and see you then.",
      speaker: "Receptionist",
    },
  ],
};

const askForRide: Script = {
  forReal: "Can someone drive me to my appointment on Wednesday?",
  id: "ask-for-ride",
  phrases: [
    "Could you drive me to my appointment on Wednesday at 9 in the morning?",
    "Let me check and call you back.",
    "Thank you for offering.",
  ],
  practised: [
    "Asking with the day, time, and place",
    "Hearing a no or a maybe",
    "Not agreeing to something until you know it works",
  ],
  role: "Your grandchild Jamie, a practice character",
  setting:
    "You need a ride to an eye appointment on Wednesday at 9 in the morning. You call your grandchild, Jamie.",
  start: "hello",
  summary: "Ask clearly, and handle “I can’t, but…” calmly.",
  title: "Asking family for a ride",
  turns: [
    {
      choices: [
        {
          feedback: "Very clear: what, when, and where in one go.",
          id: "clear",
          next: "busy",
          says: "Could you drive me to my eye appointment on Wednesday? It’s at 9 in the morning at the eye clinic on Main Street.",
        },
        {
          feedback:
            "A gentle start. Next, say exactly what you need, when, and where.",
          id: "gentle",
          next: "what",
          says: "I was wondering if you could help me with something on Wednesday.",
        },
      ],
      freeFeedback:
        "Thank you. Saying the day, the time, and the place makes it easy to answer.",
      freeNext: "busy",
      id: "hello",
      says: "Hi! It’s nice to hear from you. What’s up?",
      speaker: "Jamie",
    },
    {
      choices: [
        {
          feedback: "Very clear: what, when, and where in one go.",
          id: "clear",
          next: "busy",
          says: "Could you drive me to my eye appointment on Wednesday? It’s at 9 in the morning at the eye clinic on Main Street.",
        },
      ],
      freeFeedback:
        "Thank you. Saying the day, the time, and the place makes it easy to answer.",
      freeNext: "busy",
      id: "what",
      says: "Sure, what do you need?",
      speaker: "Jamie",
    },
    {
      choices: [
        {
          feedback: "Good. You kept to the day you need, and you thanked them.",
          id: "someone-else",
          next: "goodbye-other",
          says: "My appointment is on Wednesday, so I’ll ask someone else. Thank you for offering.",
        },
        {
          feedback:
            "Good. You didn’t agree until you know it works. A maybe is not a yes yet.",
          id: "check-thursday",
          next: "goodbye-callback",
          says: "Let me ask the clinic whether Thursday is possible, and I’ll call you back.",
        },
        {
          feedback:
            "That’s fine. It can help to say clearly what happens next.",
          id: "unclear",
          next: "so",
          says: "Oh, okay.",
        },
      ],
      freeFeedback:
        "Thank you. When someone offers another day, it’s fine to check before saying yes.",
      freeNext: "so",
      id: "busy",
      says: "I’d love to, but I’m working Wednesday morning. Thursday works for me, though. Could you move it?",
      speaker: "Jamie",
    },
    {
      choices: [
        {
          feedback: "Good. You kept to the day you need, and you thanked them.",
          id: "someone-else",
          next: "goodbye-other",
          says: "My appointment is on Wednesday, so I’ll ask someone else. Thank you for offering.",
        },
        {
          feedback:
            "Good. You didn’t agree until you know it works. A maybe is not a yes yet.",
          id: "check-thursday",
          next: "goodbye-callback",
          says: "Let me ask the clinic whether Thursday is possible, and I’ll call you back.",
        },
      ],
      freeFeedback: "Thank you. Now you both know what happens next.",
      freeNext: "goodbye-callback",
      id: "so",
      says: "So, do you still need a ride?",
      speaker: "Jamie",
    },
    {
      choices: [],
      freeFeedback: "",
      freeNext: "",
      id: "goodbye-other",
      says: "No problem. Good luck, and ask me again another time.",
      speaker: "Jamie",
    },
    {
      choices: [],
      freeFeedback: "",
      freeNext: "",
      id: "goodbye-callback",
      says: "Sounds good. Call me back when you know.",
      speaker: "Jamie",
    },
  ],
};

const repeatInstructions: Script = {
  forReal: null,
  id: "repeat-instructions",
  phrases: [
    "Could you say that again, more slowly, please?",
    "Could you write that down for me?",
    "So that’s… Is that right?",
    "Who do I call if I have questions?",
  ],
  practised: [
    "Asking someone to slow down",
    "Asking for it in writing",
    "Repeating it back to be sure",
  ],
  role: "Pharmacist at a sample pharmacy",
  setting:
    "You’re picking up a new medicine. The pharmacist explains it quickly.",
  start: "instructions",
  summary: "Ask someone to slow down, write it down, and check.",
  title: "Asking someone to repeat or write it down",
  turns: [
    {
      choices: [
        {
          feedback: "That’s always a fair thing to ask.",
          id: "slower",
          next: "slowly",
          says: "Could you say that again, more slowly, please?",
        },
        {
          feedback:
            "Asking for it in writing means you don’t have to remember it all.",
          id: "write",
          next: "written",
          says: "Could you write that down for me?",
        },
        {
          feedback:
            "It’s easy to nod along. It’s fine to ask them to slow down or write it down.",
          id: "nod",
          next: "anything",
          says: "Okay, thanks.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "anything",
      id: "instructions",
      says: "Here’s your new medicine. One tablet twice a day with food, not with milk, and finish the whole box even if you feel better.",
      speaker: "Pharmacist",
    },
    {
      choices: [
        {
          feedback:
            "Repeating it back is the best way to be sure you heard it right.",
          id: "repeat-back",
          next: "confirmed",
          says: "So that’s one tablet, twice a day, with food, and not with milk. Is that right?",
        },
        {
          feedback:
            "Asking for it in writing means you don’t have to remember it all.",
          id: "write",
          next: "written",
          says: "Could you write that down for me?",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "written",
      id: "slowly",
      says: "Of course. One tablet. Twice a day. With food. Not with milk. Finish the whole box.",
      speaker: "Pharmacist",
    },
    {
      choices: [
        {
          feedback: "That’s always a fair thing to ask.",
          id: "slower",
          next: "slowly",
          says: "Could you say that again, more slowly, please?",
        },
        {
          feedback:
            "Asking for it in writing means you don’t have to remember it all.",
          id: "write",
          next: "written",
          says: "Could you write that down for me?",
        },
        {
          feedback:
            "That’s fine. If you’re ever unsure later, the pharmacy can tell you again.",
          id: "have-it",
          next: "goodbye",
          says: "No, I think I have it.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "written",
      id: "anything",
      says: "Is there anything you’d like me to go over?",
      speaker: "Pharmacist",
    },
    {
      choices: [
        {
          feedback:
            "Repeating it back is the best way to be sure you heard it right.",
          id: "repeat-back",
          next: "confirmed",
          says: "So that’s one tablet, twice a day, with food, and not with milk. Is that right?",
        },
        {
          feedback: "Good. Knowing who to ask makes it easier later.",
          id: "questions",
          next: "goodbye-questions",
          says: "Thank you. Who do I call if I have questions?",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "goodbye-questions",
      id: "written",
      says: "Sure. I’ll write it on the label and on a card for you.",
      speaker: "Pharmacist",
    },
    {
      choices: [
        {
          feedback: "Good. Knowing who to ask makes it easier later.",
          id: "questions",
          next: "goodbye-questions",
          says: "Thank you. Who do I call if I have questions?",
        },
        {
          feedback: "Well done. You checked, and you have it right.",
          id: "done",
          next: "goodbye",
          says: "Thank you, that’s everything.",
        },
      ],
      freeFeedback: OWN_WORDS,
      freeNext: "goodbye",
      id: "confirmed",
      says: "Exactly right. And if you feel unwell, call us or your doctor.",
      speaker: "Pharmacist",
    },
    {
      choices: [],
      freeFeedback: "",
      freeNext: "",
      id: "goodbye",
      says: "You’re welcome. Take care.",
      speaker: "Pharmacist",
    },
    {
      choices: [],
      freeFeedback: "",
      freeNext: "",
      id: "goodbye-questions",
      says: "Call the pharmacy number on the bag any time. Take care.",
      speaker: "Pharmacist",
    },
  ],
};

const suspiciousCaller: Script = {
  forReal: null,
  id: "suspicious-caller",
  phrases: [
    "I don’t give codes over the phone.",
    "I’ll call my bank on the number on my card.",
    "I’m going to hang up now.",
    "I’ll check with my family first.",
  ],
  practised: [
    "Refusing to share a code",
    "Ending a call that pressures you",
    "Calling back on a number you already know",
  ],
  role: "A caller claiming to be your bank, a practice character",
  setting:
    "Your phone rings. The caller says they’re from your bank. In real life, a bank will never ask you for a code like this.",
  start: "call",
  summary: "Say no to sharing a code, and end the call safely.",
  title: "Answering a suspicious caller",
  turns: [
    {
      choices: [
        {
          feedback:
            "Exactly right. A real bank won’t ask for a code like this.",
          id: "refuse",
          next: "pressure",
          says: "I don’t give codes over the phone. I’ll call my bank on the number on my card.",
        },
        {
          feedback:
            "Asking is fine, but a scammer can give any name. The safest step is to hang up and call the number on your card.",
          id: "who",
          next: "name",
          says: "Which bank is this? What’s your name?",
        },
        {
          feedback:
            "It’s easy to feel rushed. A real bank will never ask for that code, and you can stop at any point.",
          id: "find",
          next: "numbers",
          says: "Okay, let me find it…",
        },
      ],
      freeFeedback:
        "Thank you. Whatever you said, you never have to read out a code to a caller.",
      freeNext: "pressure",
      id: "call",
      says: "Hello, this is the fraud department at your bank. We’ve seen unusual activity. To protect your account, read me the code we just texted you.",
      speaker: "Caller",
    },
    {
      choices: [
        {
          feedback:
            "Exactly right. A real bank won’t ask for a code like this.",
          id: "refuse",
          next: "pressure",
          says: "I don’t give codes over the phone. I’ll call my bank on the number on my card.",
        },
        {
          feedback: "Hanging up is always allowed.",
          id: "hang-up",
          next: "ended",
          says: "I’m going to hang up now and call my bank myself.",
        },
      ],
      freeFeedback: "Thank you. You can end the call whenever you like.",
      freeNext: "pressure",
      id: "name",
      says: "I’m Mark from the security team. You need to act quickly, or your account will be frozen.",
      speaker: "Caller",
    },
    {
      choices: [
        {
          feedback:
            "Good. You stopped in time. A real bank won’t ask for a code like this.",
          id: "refuse",
          next: "pressure",
          says: "I don’t give codes over the phone. I’ll call my bank on the number on my card.",
        },
        {
          feedback: "Hanging up is always allowed.",
          id: "hang-up",
          next: "ended",
          says: "I’m going to hang up now and call my bank myself.",
        },
      ],
      freeFeedback: "Thank you. You can end the call whenever you like.",
      freeNext: "pressure",
      id: "numbers",
      says: "Good. Just read me the six numbers.",
      speaker: "Caller",
    },
    {
      choices: [
        {
          feedback:
            "Pressure like this is a warning sign. Hanging up is the right call.",
          id: "hang-up",
          next: "ended",
          says: "I’m going to hang up now.",
        },
        {
          feedback: "Checking with someone you trust is always a good idea.",
          id: "family",
          next: "ended",
          says: "I’ll check with my family first.",
        },
      ],
      freeFeedback:
        "Thank you. When a caller won’t take no for an answer, you can simply hang up.",
      freeNext: "ended",
      id: "pressure",
      says: "If you hang up, your account will be locked today. This is your only chance.",
      speaker: "Caller",
    },
    {
      choices: [],
      freeFeedback: "",
      freeNext: "",
      id: "ended",
      says: "You ended the call. Next, call your bank on the number on your card or statement, and tell someone you trust what happened.",
      speaker: "Practice guide",
    },
  ],
};

const scripts: readonly Script[] = [
  bookAppointment,
  askForRide,
  repeatInstructions,
  suspiciousCaller,
];

const scriptById = (id: string): Script | null =>
  scripts.find((script) => script.id === id) ?? null;

export { scriptById, scripts };

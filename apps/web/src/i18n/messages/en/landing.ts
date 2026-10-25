/**
 * The public landing page. Every person, time, and message here is an
 * example; nothing comes from a real account. Lists keep the same length in
 * every language, so the page's animations and columns line up.
 */
const landing = {
  everydayHelp: {
    displaySettings: [
      { label: "Text size", value: "Larger" },
      { label: "Read replies aloud", value: "On · slower" },
      { label: "Less movement", value: "On" },
      { label: "Contrast", value: "Stronger" },
      { label: "Captions on calls", value: "On" },
    ],
    intro:
      "Messages to family, appointments and reminders, with large text and read-aloud throughout. Anything that would be sent still waits for you.",
    messages: {
      description:
        "Write to family by iMessage, email, Discord or Telegram. Help me understand explains a message you’ve received and suggests replies for you to choose.",
      imageAlt:
        "Mary Cassatt, The Letter: a woman in a blue patterned dress seals a letter at her writing desk.",
      imageCaption: "Mary Cassatt, The Letter, 1890–91.",
      title: "Messages to family",
    },
    read: {
      description:
        "Larger text, stronger contrast, captions and a slower reading voice. Speak instead of typing whenever you like. Your settings follow you to every screen.",
      imageAlt:
        "Édouard Manet, Woman Reading: a woman in a dark coat and hat reads an illustrated journal outdoors.",
      imageCaption: "Édouard Manet, Woman Reading, 1880–82.",
      title: "Read, listen or speak",
    },
    reminder: {
      approve: "Approve reminder",
      changeTime: "Change time",
      title: "New reminder",
      version: "Version 1",
      what: "Call Ana",
      when: "Sunday, November 1 · 11:00 AM",
      youSaid: "You said: “Remind me to call Ana on Sunday.”",
    },
    reminders: {
      description:
        "Today opens with what needs you first, then appointments and reminders. Say what to remember and LifeLink writes it down for you to approve.",
      title: "Appointments and reminders",
    },
    tab: "Everyday help",
    thread: {
      helpMeUnderstand: "Help me understand",
      reply: "Of course! 9:45 at yours? Might bring Max along.",
      sent: "Sent 9:05 AM · version 2",
      sentMessage:
        "Hi Sam, could you drive me to Dr. Patel on Tuesday, October 27?",
    },
    title: "What LifeLink helps with",
    today: {
      comingUp: "Coming up",
      confirmPickup: "Confirm Sam’s 9:45 pickup",
      greeting: "Good afternoon, Ruth",
      review: "Review",
      rows: [
        {
          detail: "Reminder · today",
          time: "8:00 PM",
          title: "Evening tablets",
        },
        {
          detail: "Not confirmed yet",
          time: "9:45 AM",
          title: "Sam picks you up",
        },
        { detail: "Tuesday, Oct 27", time: "10:30 AM", title: "Dr. Patel" },
      ],
      waiting: "Waiting for you",
    },
  },
  features: {
    hint: "Example. Scroll or point at a row to see that part of LifeLink here.",
    items: {
      circle: {
        name: "Trusted circle",
        summary:
          "Invite someone with a code, choose what they can see and for how long, and stop sharing at any time.",
      },
      connections: {
        name: "Connections",
        summary:
          "Each account says plainly what works, what isn’t ready yet, and what it doesn’t offer.",
      },
      documents: {
        name: "Documents",
        summary: "Your Google Drive files, each with a preview.",
      },
      email: {
        name: "Email",
        summary:
          "Flags emails that look like scams, and drafts replies that never send on their own.",
      },
      family: {
        name: "Family view",
        summary:
          "The page your family sees: only what you share, with photos and a place to reply.",
      },
      groceries: {
        name: "Groceries",
        summary:
          "Lists with a budget and cost estimates, ready to copy or print for the shop.",
      },
      help: {
        name: "How I like help",
        summary:
          "Short or detailed answers, one step at a time, in the language you choose.",
      },
      recap: {
        name: "Recap a conversation",
        summary:
          "Separates what was agreed from what was only offered, and suggests next steps.",
      },
      today: {
        name: "Today",
        summary:
          "What needs you first, then appointments, the weather and three headlines you choose.",
      },
    },
    titleLine1: "Everything else",
    titleLine2: "it does",
  },
  footer: {
    credits: {
      afterLicense: ", Wikimedia Commons. Interface examples use sample data.",
      byAuthor: "by RedKnight7,",
      morse:
        ". Morse key and register, 1876: public domain, Wikimedia Commons.",
      paintings:
        "Mary Cassatt, The Letter; Édouard Manet, Woman Reading; Claude Monet, Cliff Walk at Pourville and Water Lily Pond; Jean-Jacques de Boissieu, Old Man with a Boy Reading: public domain (CC0),",
      telegram: "1959 Western Union Telegram",
    },
    getStarted: "Get started",
    label: "Footer",
    links: {
      everydayHelp: "Everyday help",
      howItWorks: "How it works",
      language: "Language",
      ourPromise: "Our promise",
      questions: "Questions",
      scamCheck: "Scam check",
    },
    pictures: "Pictures",
    signIn: "Sign in",
    solitaire: "Solitaire",
    tagline: "Help with everyday messages. Nothing is sent until you say so.",
  },
  hero: {
    getStarted: "Get started",
    imageAlt:
      "Claude Monet, Cliff Walk at Pourville: two figures on a flowered clifftop above a bright sea with sailboats.",
    imageCaption: "Claude Monet, Cliff Walk at Pourville, 1882.",
    intro:
      "LifeLink helps you write to family, keep track of appointments, and check texts or letters that seem suspicious. You read each message in full before you approve it.",
    seeHowItWorks: "See how it works",
    titleLine1: "Nothing is sent",
    titleLine2: "until you say so.",
  },
  howItWorks: {
    done: "Done",
    exampleTimes: "Example times",
    imageAlt:
      "Engraving of a Morse key, relay and register, labelled Indicator, Relay, Key and Line Battery.",
    imageCaption:
      "Morse key and register, engraved for Popular Science Monthly, 1876.",
    intro:
      "Here is one ride request from start to finish. Each step is named in plain words, so you always know what has happened and what hasn’t.",
    result: "You approved twice. Nothing else was sent.",
    slipTitle: "A ride to Dr. Patel",
    timeline: [
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
          {
            decision: true,
            label: "You confirm the pickup time",
            time: "1:52 PM",
          },
        ],
      },
      {
        heading: "Tuesday, October 27",
        steps: [
          { label: "Reminder: Sam arrives at 9:45", time: "9:15 AM" },
          { label: "Appointment with Dr. Patel", time: "10:30 AM" },
        ],
      },
    ],
    titleLine1: "What happens",
    titleLine2: "after you ask",
  },
  language: {
    intro:
      "Choose the language for this page. When you create an account, LifeLink keeps it. If you already have an account, signing in uses the language you chose there.",
    title: "Language",
  },
  messageSlip: {
    approve: "Approve and send",
    message:
      "Hi Sam, could you drive me to Dr. Patel on Tuesday, October 27? I need to be there by 10:30 AM. Thank you! Ruth",
    notSent: "Not sent yet",
    sent: "Sent 9:05 AM. Nothing else was sent.",
    showAgain: "Show it again",
    to: "To Sam Rivera · iMessage",
    version: "Version 2",
  },
  nav: {
    howItWorks: "How it works",
    language: "Language",
    questions: "Questions",
    scamCheck: "Scam check",
    signIn: "Sign in",
  },
  previews: {
    approveAndSend: "Approve and send",
    circle: {
      appointments: "Appointments",
      code: "One-time invitation code",
      notShared: "Not shared",
      note: "Until December 31",
      rides: "Rides",
      scamAlerts: "Scam alerts",
      shared: "Shared",
      stop: "Stop sharing now",
      title: "Shared with Sam Rivera",
    },
    connections: {
      add: "Add an approved appointment",
      footnote: "Each connection lists only what it can really do.",
      notReady: "Not ready yet",
      note: "Connected",
      see: "See your upcoming events",
      works: "Works",
    },
    documents: {
      files: [
        { date: "Oct 12", name: "Medicare summary.pdf" },
        { date: "Sep 30", name: "Ana’s soup recipe" },
        { date: "Sep 14", name: "Garden photos" },
      ],
      footnote:
        "Choose a file to preview it. Change or share it in Google Drive.",
      title: "Documents",
    },
    email: {
      anaSubject: "Lunch on Sunday? Bring the photo album!",
      draftBody:
        "Sunday sounds lovely. I’ll bring the album. Is 12:30 all right? Love, Ruth",
      draftTitle: "Reply to Ana · draft, not sent",
      note: "3 new",
      parcelSender: "Parcel Delivery Service",
      parcelSubject: "Action needed: your parcel is on hold",
      scamWarning:
        "This looks like a scam: it asks for payment through a link.",
      title: "Email",
    },
    family: {
      footnote:
        "Sam can read and reply. Sam can’t send, approve or spend for Ruth.",
      nextAppointment: "Next appointment",
      note: "What Sam sees",
      photos: "2 new photos from the garden",
      replyLabel: "Reply to Ruth",
      replyText: "See you Tuesday at 9:45!",
      title: "Ruth’s updates",
      when: "Dr. Patel, Tuesday at 10:30 AM",
    },
    groceries: {
      copy: "Copy list",
      items: [
        { label: "Oat milk, 2", value: "$7.98" },
        { label: "Whole-grain bread", value: "$4.49" },
        { label: "Apples, 6", value: "$5.20" },
        { label: "Soup ingredients for Ana’s visit", value: "$18.40" },
      ],
      note: "$62 of $80 budget",
      print: "Print",
      title: "Weekly shop",
    },
    help: {
      answers: "Answers",
      language: "Help language",
      noteLabel: "Private note",
      noteText: "I don’t hear well on the phone. Suggest texting first.",
      on: "On",
      oneStep: "One step at a time",
      short: "Short",
      title: "How I like help",
    },
    recap: {
      agreed: "Agreed",
      agreedText: "Sam drives you on Tuesday, picking up at 9:45.",
      nextStep: "Suggested next step",
      nextStepText: "Remind me on Monday evening.",
      offered: "Only offered",
      offeredText: "Sam might bring Max along.",
      review: "Review reminder",
      title: "Recap",
    },
    today: {
      goodNews: "Good news, chosen by you",
      headlines: [
        "Library extends Sunday opening hours",
        "Volunteers restore the town’s rose garden",
        "Ferry service returns for the summer",
      ],
      note: "Monday",
      pickup: "Confirm Sam’s 9:45 pickup",
      title: "Good morning, Ruth",
      waiting: "Waiting for you",
      weather: "Weather",
      weatherValue: "58°F, light rain",
    },
  },
  promise: {
    howSharingWorks: "How sharing works",
    leftImageAlt:
      "Etching of an old man reading a book with a young boy on his lap, beside a small table.",
    leftImageCaption:
      "Jean-Jacques de Boissieu, Old Man with a Boy Reading, 1770.",
    promises: [
      "We will never send anything you haven’t read and approved. If a message changes after you approve it, we ask you again.",
      "Your family can be close without taking over. You choose what someone you trust can see, such as appointments or rides, and for how long. They can never send, approve or spend for you.",
      "When something is only practice, we say so. When something goes wrong, we tell you what happened, that nothing was lost, and what to do next.",
      "And we will never tell you a message is safe. We show you the warning signs and leave the decision with you.",
    ],
    rightImageAlt:
      "A 1959 Western Union telegram, typed in capitals and stamped with handwritten notes.",
    rightImageCaption:
      "A Western Union telegram, 1959. Every word counted, and someone signed for it.",
    sharing: "Change or stop sharing any time, from your Trusted circle.",
    signature: "Everyday help. Your decision.",
    tab: "Our promise",
    title: "What LifeLink will never do",
  },
  questions: {
    imageAlt:
      "Claude Monet, Water Lily Pond: a green footbridge arches over a pond covered in water lilies.",
    imageCaption: "Claude Monet, Water Lily Pond, 1900.",
    intro: "Answers to what people ask most, all on this page.",
    items: [
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
    ],
    tab: "Questions",
    title: "Questions",
  },
  scamCheck: {
    beCareful: "Be careful with this message.",
    checkMessage: "Check a message",
    example: "Example",
    examples: {
      call: {
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
      email: {
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
      letter: {
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
      text: {
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
    },
    intro:
      "Paste a text, choose an email, photograph a letter, or check a call on speakerphone. LifeLink points out the warning signs and suggests a safe next step. It never tells you a message is safe.",
    kinds: "Kinds of message to check",
    panelTitle: "Scam check",
    saferStep: "A safer next step",
    tab: "Scam check",
    title: "Not sure a message is real?",
    whatItLooksFor: "What it looks for",
  },
  solitaire: {
    boardDescription:
      "A game of Klondike solitaire in progress. The eight of spades moves onto the nine of hearts.",
    controls: ["Undo", "Hint", "New game"],
    intro:
      "Klondike with large, clear cards. Tap a card to move it, or play with the keyboard. Undo and a hint are always one press away, and your game is saved on this device, even without the internet.",
    noAccount: "No account needed.",
    play: "Play Solitaire",
    saved: "Game saved on this device",
    titleLine1: "A quiet game",
    titleLine2: "of solitaire",
  },
  start: {
    alreadyHaveOne: "You’ll create an account. Already have one?",
    defaultRequest: "Can Sam drive me to my appointment on Tuesday?",
    intro:
      "Tell LifeLink what you need, then read the full message before anything is sent. Want to look around first? You can try it with sample messages.",
    myFamily: "My own family",
    request: "Your request",
    sampleFamily: "Sample family",
    seeDraft: "See the draft",
    signIn: "Sign in",
    titleLine1: "Start with",
    titleLine2: "one request",
    tryWith: "Try it with",
    whatHelp: "What would you like help with?",
  },
};

export { landing };

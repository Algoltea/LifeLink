const explanation = {
  close: "Close the explanation",
  cloud: "Explained by cloud AI. Every quote was checked against the message.",
  dateSpoken: (quote: string, date: string) =>
    `Date mentioned: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Dates and times mentioned",
  droppedNote:
    "Some details the assistant gave were not in the message word for word, so they are shown as guesses or left out.",
  facts: "What the message says",
  guessNote: "These are guesses, not something the message says.",
  guessSpoken: (text: string) => `A guess: ${text}`,
  guesses: "What it might mean",
  local: {
    chosen:
      "Local reading: found by patterns, not full understanding. Nothing was sent to an AI provider.",
    failed:
      "Local reading. You asked for a cloud reading, but it didn’t finish. The provider may already have received this message.",
    limit:
      "Local reading. Today’s limit for cloud readings has been reached, so nothing more was sent.",
    practice:
      "Practice: explained in LifeLink. Practice messages are never sent to an AI provider.",
    unavailable:
      "Local reading. The cloud assistant isn’t set up, so nothing was sent to an AI provider.",
  },
  localLanguageNotice:
    "Local rule-based explanations are in English and have not been translated yet. A cloud explanation can be written in your chosen language. Quotes from the original message are kept unchanged.",
  missing: "Not said yet",
  missingSpoken: (detail: string) => `Not said yet: ${detail}`,
  moreDetail: "More detail",
  onlyYou: "Only you can see this.",
  part: "Part",
  reading: "Reading the message…",
  replies: "Possible replies",
  repliesHint:
    "Nothing is sent. A reply goes into your message box, where you can change it and review it before anything happens.",
  replyLabelFor: (label: string) => `Use this reply: ${label}`,
  requestSpoken: (text: string, quote: string) =>
    `They ask: ${text} In their words: ${quote}.`,
  requests: "What they’re asking",
  title: "Help understanding this message",
};

export { explanation };

const recap = {
  agreed: "Agreed",
  agreedSpoken: (text: string) => `Agreed: ${text}`,
  changedNote:
    "Some details the assistant gave were not in the messages word for word, or were offers rather than agreements, so they were changed or left out.",
  close: "Close the recap",
  cloud:
    "Cloud AI recap, requested with your permission. Every quote was checked against the messages.",
  cloudConsent:
    "Use the cloud assistant for a fuller recap. Your recent messages with this person are sent to the AI provider. Leave unchecked for a quick recap made in LifeLink.",
  done: "Done",
  doneFromRecords:
    "From LifeLink’s own records, not from what the messages say.",
  inShort: "In short",
  intro: (contactName: string) =>
    `LifeLink can sum up what you and ${contactName} agreed, what was only offered, and what is still open.`,
  loading: "Loading the recap",
  local: {
    chosen:
      "Quick recap, made in LifeLink: found by patterns, not full understanding. Nothing was sent to an AI provider.",
    failed:
      "Quick recap, made in LifeLink. You asked for a cloud recap, but it didn’t finish. The provider may already have received these messages.",
    limit:
      "Quick recap, made in LifeLink. Today’s limit for cloud recaps has been reached, so nothing more was sent.",
    practice:
      "Practice: a quick recap, made in LifeLink. Practice messages are never sent to an AI provider.",
    unavailable:
      "Quick recap, made in LifeLink. The cloud assistant isn’t set up, so nothing was sent to an AI provider.",
  },
  messageTo: (contactName: string) => `Message to ${contactName}`,
  nextSteps: "Possible next steps",
  nextStepsHint:
    "Nothing happens until you prepare a step, review it, and approve it.",
  noFinishedTasks: (contactName: string) =>
    `LifeLink has no finished tasks with ${contactName} from this time. What a message says is not counted as done.`,
  offerNote: "An offer is not an agreement until the other person says yes.",
  offered: "Offered, not yet agreed",
  offeredSpoken: (text: string) => `Offered, not yet agreed: ${text}`,
  onlyYou: "Only you can see this. It is never sent or shared with family.",
  part: "Part",
  practiceNote:
    "In Practice mode, LifeLink makes the recap itself. Practice messages are never sent to an AI provider.",
  prepare: "Prepare for review",
  prepared: "Prepared. Review it",
  readAloud: "Read the recap aloud",
  reading: "Reading the conversation…",
  recapAgain: "Recap again",
  recapThis: "Recap this conversation",
  recapWithCloud: "Recap with cloud AI",
  reminderForYou: "A reminder for you",
  stillUnclear: "Still unclear",
  title: (contactName: string) => `Recap with ${contactName}`,
  unclearSpoken: (text: string) => `Still unclear: ${text}`,
  you: "You",
};

export { recap };

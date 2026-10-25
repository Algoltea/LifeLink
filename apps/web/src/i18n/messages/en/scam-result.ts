const scamResult = {
  aboutCheck: "About this check",
  adviceNote:
    "This advice came from the message, so it isn’t counted as a warning sign",
  adviceTitle: "Advice in the message itself",
  allWords: "All the words LifeLink read",
  cannotProve:
    "This result can’t prove that a message is genuine. Confirm unexpected requests through a contact you already know.",
  checkDidNotFinish: "The check didn’t finish",
  checkingMessage: "Checking your message…",
  compareWithPhoto: "Compare them with your photo",
  confidence: {
    high: "Several details support this assessment. It still can’t verify the sender.",
    low: "There isn’t enough information to be sure. A second opinion can help.",
    medium:
      "Some details support this assessment. Verify the request independently.",
  },
  couldNotRead: "LifeLink couldn’t read this photo clearly",
  delete: "Delete this check",
  deleteConfirm: "Delete this check? It will be removed from Earlier checks.",
  deleting: "Deleting…",
  howChecked: "How this was checked",
  imageUnverified:
    "These words were read from a photo and may be wrong or incomplete. LifeLink couldn’t compare them with the original text. Check them against your photo.",
  keep: "Keep this check",
  kinds: {
    email: "An email",
    screenshot: "A photo or screenshot",
    text: "A message",
  },
  localLanguageNotice:
    "This local check is designed for English only. It can miss scams in Spanish and other languages. No warning signs does not mean a message is safe.",
  method: {
    cloud: "A cloud AI service helped with this check, with your permission.",
    cloudOld:
      "A cloud AI service helped with this earlier check. Permission details weren’t saved with this record.",
    rules:
      "LifeLink used common warning rules. The message wasn’t sent to a cloud AI service for this check.",
    rulesFallback:
      "LifeLink used common warning rules because cloud AI wasn’t available or didn’t finish. The service may already have received this content.",
    rulesOld:
      "LifeLink used common warning rules. This older record doesn’t say whether a cloud AI service also received the message.",
  },
  newPhoto: "Take a new photo",
  noFullWording:
    "The complete wording wasn’t saved with this check. The quotes above aren’t a full transcription. Compare them with your photo, or type the words for another check.",
  noSigns:
    "No clear warning signs were found. That doesn’t prove this message is genuine.",
  noStepsHint:
    "Before acting on an unexpected request, check with someone you know using their saved contact details.",
  originalEmail: "Original email",
  originalMessage: "Original message",
  photo: {
    alt: "The photo used for this check",
    larger: "See the photo larger",
    noPreview: "The photo preview isn’t available for this check. ",
    readSaved: "You can still read its saved result.",
    reopen: "Try reopening the check.",
    see: "See the photo",
    smaller: "Make photo smaller",
    smallerAria: "Make the photo smaller",
  },
  photoRetention: {
    old: "This older check has no saved photo preview. Deleting this check removes the result; the older photo may remain in storage.",
    owned:
      "Your photo is kept with this check. Deleting the check also deletes the photo, unless it’s still used by another saved check or photo.",
  },
  readAloud: "Read the result aloud",
  readingPhoto: "Reading the words in your photo…",
  recoveryMessage:
    "Treat the message with care. You can try another check or ask someone you trust.",
  recoveryPhoto:
    "Try a clearer photo in good light with all the words in view, or type the words instead. This check can’t tell you whether the message is genuine.",
  removedQuotes:
    "Some words the assistant pointed to weren’t found in the message, so they aren’t shown.",
  savedWording: "The wording saved with this check",
  signCount: (count: number) =>
    `${count} ${count === 1 ? "warning sign" : "warning signs"}`,
  signsNoteMessage: "What stood out in this message",
  signsNotePhoto: "With the words LifeLink read from your photo",
  step: "Step",
  titles: {
    email: "Your email check",
    screenshot: "Your photo check",
    text: "Your message check",
  },
  typeWords: "Type words instead",
  verdicts: {
    likely_safe: "No clear warning signs",
    likely_scam: "Likely a scam",
    suspicious: "Warning signs found",
    unsure: "Not verified",
  },
  waitHint:
    "This usually takes a few seconds. Keep this page open. Until then, don’t use links or phone numbers in the message, or pay anyone.",
  whatNow: "What to do now",
};

export { scamResult };

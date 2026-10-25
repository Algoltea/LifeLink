const scam = {
  addNote: "Anything to add? (optional)",
  addNotePlaceholder: "For example, who it claimed to be from",
  ask: "Ask someone you trust",
  callCheckTitle: "Scam call check",
  checkSomethingElse: "Check something else",
  checking: "Checking",
  checkingMessage: "Checking the message…",
  chooseEmail: "Choose an email",
  chooseRecent: "Choose from your recent emails",
  cloudNote:
    "An AI service reads this to check it. Leave out passwords and card numbers.",
  didNotFinish: "Didn’t finish",
  earlier: "Earlier checks",
  earlierEmpty: "Your message, photo and call checks will appear here.",
  emailMissing:
    "This email isn’t in the recent inbox. Pick another email or type its words below.",
  from: (sender: string) => `From ${sender}`,
  guidance: {
    ai: "An AI service helps with message and photo checks. Photos stay with your check until you delete it. Practice checks never use AI.",
    intro:
      "A check looks for common warning signs. It can’t confirm who sent a message or whether it’s true.",
    next: "Read the result, follow “What to do now”, or ask someone you trust for a second opinion. You choose what happens next.",
    title: "What can a scam check tell me?",
  },
  howToShow: "How would you like to show the message?",
  loadingEarlier: "Loading earlier checks",
  loadingEmail: "Loading the email",
  loadingEmails: "Loading your emails",
  localNote:
    "AI checks are not available right now. LifeLink uses common warning signs instead.",
  messageWords: "The message’s words",
  messageWordsPlaceholder: "Paste or type the words here",
  noLongerAvailable:
    "This check is no longer available. You can start a new one.",
  noRecentEmails: "There are no recent emails to choose from. ",
  noRecentEmailsRest: ", or type the message’s words instead.",
  noSubject: "(No subject)",
  openEmail: "Open Email",
  opening: "Opening your check",
  photo: {
    availabilityChecking: "Checking whether photo checks are available…",
    practice:
      "Practice mode is on. Photos are not checked or sent to an AI service.",
    unavailable:
      "Photo checks are not available right now. Your photo will not be uploaded.",
    unavailableType: "Photo checks aren’t available. Type the words instead.",
  },
  practiceEmailNote:
    "This is a practice email. It is checked on this device without cloud AI.",
  practiceNote:
    "Practice checks use common warning signs. Nothing is sent to an AI service.",
  practiceSuffix: " · Practice",
  preparing: "Preparing your check…",
  review: "Review",
  sources: {
    email: "Email",
    screenshot: "Photo",
    text: "Text",
  },
  startNew: "Start a new check",
  subline:
    "Not sure about a message or a call? LifeLink looks for warning signs before you act.",
  submit: {
    email: "Check this email",
    screenshot: "Check this photo",
    text: "Check this message",
  },
  title: "Scam check",
  uploading: "Uploading your photo…",
  uploadingNote:
    "Uploading your photo. Keep this page open; reading the words comes next.",
};

export { scam };

const settings = {
  accountsAndPermissions: "Accounts and permissions",
  accountsLink: "Accounts LifeLink can use",
  captions: "Captions when speaking",
  captionsDescription: "Shows the words while you talk with LifeLink.",
  characterCount: (count: number, maximum: number) =>
    `${count} of ${maximum} characters`,
  choicesNotSaved: (error: string) =>
    `Your choices haven’t been saved to your account. ${error} Try again below.`,
  contrast: "Contrast",
  contrastDescription: "More contrast makes text darker and borders stronger.",
  contrastMore: "More contrast",
  contrastStandard: "Standard",
  demoAllowedHint: "This switch saves automatically.",
  demoBetweenModes:
    "Anything prepared in one mode has to be reviewed again before it runs in the other.",
  demoDescription:
    "In practice mode nothing real is sent, saved elsewhere, or bought. Everything that would happen is simulated and marked “Practice”, and sample people and messages are added so you can try things safely.",
  demoFailed: (error: string) =>
    `Practice mode couldn’t be changed. ${error} Try the switch again.`,
  demoOff: "Practice mode is off. Anything you approve now really happens.",
  demoOn: "Practice mode is on.",
  demoTitle: "Practice mode",
  demoTurnedOff: "Practice mode has been turned off for this app.",
  demoUse: "Use practice mode",
  detailDetailed: "Detailed",
  detailShort: "Short",
  explanations: "Explanations",
  explanationsDescription:
    "Short gives the main points. Detailed explains a little more.",
  fullName: "Full name",
  groceriesLink: "Grocery lists and budgets",
  hearSample: "Hear a sample",
  helpDescription:
    "Used when LifeLink explains a message, a scam check, a conversation recap, or your morning briefing. Only you see these. The choices below save as you change them; notes have their own Save notes button.",
  helpTitle: "How I like help",
  language: "Language",
  languageDescription:
    "Choose the language for LifeLink’s screens and cloud help. Screens are available in English and Spanish; other choices use English screens. Cloud help can use other languages when available. Local scam checks and automatic email checks use English-only rules and can miss scams in other languages. Quotes and messages keep their original words.",
  lessMovement: "Less movement",
  lessMovementDescription: "Turns off sliding and fading.",
  loading: "Loading settings",
  newsOnToday: "News on Today",
  newsOnTodayDescription:
    "Shows three headlines on Today. You choose good news or top news there.",
  notes: "Notes about how I like help",
  notesHint:
    "For example, “Give me one step at a time.” Only LifeLink’s explanations to you use these. They are never shown to family or put in a message. If you allow a cloud explanation, these notes go to the AI provider with the message.",
  notesNotSaved: (error: string) =>
    `Your notes weren’t saved. ${error} Your text is still here. Choose Save notes to try again.`,
  notesSaveHint: "Choose Save notes to keep changes to this text.",
  notesSaved: "Your notes are saved.",
  oneStep: "One step at a time",
  oneStepDescription:
    "Shows explanations and next steps one at a time, with a Next button.",
  permissionsLink: "Who can see what",
  postalCode: "Postal code",
  preferredName: "What LifeLink calls you",
  profileNotSaved: (error: string) =>
    `Your profile wasn’t saved. ${error} Your entries are still here. Choose Save profile to try again.`,
  profileSaveHint: "Choose Save profile to keep changes in this section.",
  profileTitle: "About you",
  readAloudAuto: "Read aloud automatically",
  readAloudAutoDescription:
    "LifeLink reads new briefings and replies out loud.",
  saveNotes: "Save notes",
  saveProfile: "Save profile",
  saved: "Saved.",
  savesAsYouChange: "These preferences save as you change them.",
  seeingAndHearing: "Seeing and hearing",
  signOff: "How you sign messages",
  signOffPlaceholder: "For example, Mom",
  speakingSpeed: "Speaking speed",
  speakingSpeedDescription: "How fast LifeLink speaks when it reads aloud.",
  speechQuicker: "Quicker",
  speechSample: "This is how LifeLink sounds when it reads to you.",
  speechSlower: "Slower",
  speechUsual: "Usual",
  subline: "Make LifeLink comfortable to read and listen to.",
  textSize: "Text size",
  textSizeDescription:
    "Changes every page. Your choice is remembered on this device.",
  textSizeLarge: "Large",
  textSizeLarger: "Larger",
  textSizeLargest: "Largest",
  textSizeStandard: "Standard",
  theme: "Light or dark",
  themeDark: "Dark",
  themeLight: "Light",
  themeSystem: "Match my device",
  timeZone: "Time zone",
  title: "Settings",
  trySavingAgain: "Try saving again",
};

export { settings };

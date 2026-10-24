const contactForm = {
  add: "Add this person",
  addWay: "Add another way to reach them",
  added: (name: string) => `${name} was added.`,
  anotherWay: "Another way",
  askingForHelp: "Asking them for help",
  chooseDifferentPicture: "Choose a different picture",
  choosePicture: "Choose a picture",
  detailsNotSaved: (error: string) =>
    `The person’s details couldn’t be saved. ${error} Your entries are still here. Save again to retry.`,
  howToReach: "How to reach them",
  language: "Language LifeLink uses with them",
  languageHelp:
    "LifeLink’s own words to them, like the note that introduces you in their first iMessage, use this language. Your messages are always sent exactly as you approve them.",
  languageSameAsMine: (language: string) => `Same as mine (${language})`,
  name: "Name",
  notSetYet: "Not set yet",
  picture: "Picture",
  pictureFailed: (error: string) => `${error} Choose a picture to try again.`,
  pictureHelp:
    "Optional. The photo is made small and square on this device, and location and camera details are removed before it is saved.",
  pictureNotSaved: (error: string) =>
    `The person’s details are saved, but the picture wasn’t saved. ${error} Your choices are still here. Save again to retry, or choose another picture.`,
  pictureUnusable: "That picture couldn’t be used. Please try another photo.",
  preferredWay: "Preferred way to reach them",
  relationship: "Who they are to you",
  relationshipPlaceholder: "Son, neighbor, friend",
  removePicture: "Remove picture",
  saveChanges: "Save changes",
  saved: "Saved.",
  savingPersonAndPicture: "Saving person and picture…",
  trusted: "In my trusted circle. LifeLink may suggest asking them for help.",
  ways: {
    discord: {
      help: "Their Discord user ID, a long number. In Discord: Settings, Advanced, Developer Mode, then Copy User ID.",
      label: "Discord",
      valueLabel: "Discord user ID",
    },
    email: {
      help: "Their email address.",
      label: "Email (Gmail, Outlook, and others)",
      valueLabel: "Email address",
    },
    imessageEmail: {
      help: "The Apple ID email they use for iMessage. It is a different identity from their phone number. To send real iMessages later, save this person, then choose Edit and Link iMessage.",
      label: "iMessage (Apple ID email)",
      valueLabel: "Apple ID email",
    },
    imessagePhone: {
      help: "Their iPhone number. To send real iMessages later, save this person, then choose Edit and Link iMessage.",
      label: "iMessage (phone number)",
      valueLabel: "Phone number",
    },
    telegram: {
      help: "Their Telegram username, like @sam_alvarez (in Telegram: Settings, then Username). After you save, ask them to open @LifeLinkMessage_Bot in Telegram and tap Start. No username? Leave it blank and use the Telegram link below.",
      label: "Telegram",
      valueLabel: "Telegram username",
    },
    whatsapp: {
      help: "Kept on file for you. LifeLink can’t send WhatsApp messages yet.",
      label: "WhatsApp (saved only)",
      valueLabel: "WhatsApp number",
    },
  },
  whoTheyAre: "Who they are",
};

export { contactForm };

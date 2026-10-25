const sharing = {
  canSee: (labels: string) => `Can see: ${labels}`,
  changePermissions: "Change permissions",
  chooseAtLeastOne: "Choose at least one thing to share to create a code.",
  chooseWhatToShare: "Choose what to share",
  codeAriaLabel: (spelled: string) => `Invitation code ${spelled}`,
  codeCopied: "Code copied.",
  codeCopyFailed:
    "The code couldn’t be copied. Try Copy the code again, or write down the code shown above.",
  codeSpoken: (spelled: string) => `The code is ${spelled}`,
  codeSpokenDash: ", dash, ",
  copyCode: "Copy the code",
  createCode: "Create invitation code",
  expiry: {
    none: "No end date",
    seven: "7 days",
    thirty: "30 days",
  },
  forHowLong: "For how long",
  giveCode: (firstName: string) =>
    `Give ${firstName} this code. They create a LifeLink account, choose “A family member invited me”, and type it in. It works once, for 14 days. Copy it now; it’s only shown here once.`,
  invitationWaiting: "Invitation waiting to be accepted",
  inviteFailed: (error: string) =>
    `The invitation couldn’t be created. ${error} Your choices are still here. Try making the code again.`,
  keepSharing: "Keep sharing",
  loadingPermissions: "Loading permissions",
  loadingPermissionsShort: "Loading permissions…",
  makingCode: "Making the code…",
  noInformationSelected: "No information is selected to share.",
  noInformationShared: "No information shared",
  notSharing: (firstName: string) =>
    `You aren’t sharing any information with ${firstName}.`,
  permissionsFor: (name: string) => `Permissions for ${name}`,
  readCode: "Read the code aloud",
  savePermissions: "Save permissions",
  scopes: {
    "appointments.view": {
      description: "Upcoming appointments, with the time and place.",
      label: "Appointments",
    },
    "groceries.view": {
      description: "Your saved grocery lists and their budgets.",
      label: "Grocery lists",
    },
    "photos.view": {
      description: "Photos you have shared in your family conversations.",
      label: "Shared photos",
    },
    "reminders.view": {
      description: "Reminders you have saved and chosen to share.",
      label: "Reminders",
    },
    "rides.view": {
      description: "How a ride or errand is going: asked, answered, confirmed.",
      label: "Ride arrangements",
    },
    "scam_alerts.view": {
      description: "A note when you check a message that looks like a scam.",
      label: "Scam alerts",
    },
  },
  sharedInformation: "Shared information",
  startSharing:
    "To start sharing, choose what they can see and give them an invitation code. They enter it in their own LifeLink account.",
  state: {
    active: "Can see shared information",
    expired: "Sharing ended",
    invited: "Invitation not used yet",
    revoked: "Sharing stopped",
  },
  stopDescription: (name: string) =>
    `${name} will immediately stop seeing anything you shared. You can invite them again later.`,
  stopFailed: (error: string) =>
    `Sharing couldn’t be stopped. ${error} Try Stop sharing again.`,
  stopSharing: "Stop sharing",
  stopSharingWith: (name: string) => `Stop sharing with ${name}`,
  stopTitle: (name: string) => `Stop sharing with ${name}?`,
  stopped: (name: string) => `Stopped sharing with ${name}.`,
  stopping: "Stopping sharing…",
  them: "them",
  until: (day: string) => `Until ${day}`,
  updateFailed: (error: string) =>
    `Sharing couldn’t be updated. ${error} Your choices are still here. Choose Save permissions to try again.`,
  updated: "Sharing updated. It applies right away.",
  viewOnly:
    "Choose which information to share in LifeLink. They can only view it; they can’t send messages, approve actions, or spend for you.",
  whatNameCanSee: (firstName: string) => `What ${firstName} can see`,
  whatTheyCanSee: "What they can see",
};

export { sharing };

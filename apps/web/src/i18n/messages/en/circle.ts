const circle = {
  addPerson: "Add a person",
  contactFallback: "Contact",
  edit: "Edit",
  editPerson: (name: string) => `Edit ${name}`,
  empty:
    "Add someone you trust. You can message them and choose what they can see in LifeLink. Nothing is shared just by adding a person.",
  keep: "Keep",
  loadingPeople: "Loading people",
  message: "Message",
  people: "People",
  peopleCount: (count: number) =>
    count === 1 ? "1 person" : `${count} people`,
  permissions: "Permissions",
  permissionsFor: (name: string) => ` for ${name}`,
  practiceContact: "Practice contact",
  reachNone: "No way to reach them yet",
  reachTelegramWaiting: "Telegram: waiting for them to tap Start",
  reachWhatsappSaved: "WhatsApp saved. Can’t message yet",
  reachedBy: {
    discord: "Reached by Discord",
    email: "Reached by email",
    imessage: "Reached by iMessage",
    in_app: "Reached in LifeLink",
    telegram: "Reached by Telegram",
  },
  removeConfirm: (firstName: string) => `Remove ${firstName}`,
  removeDescription: (name: string) =>
    `${name} will be removed, and anything you share with them stops right away.`,
  removeFailed: (error: string) =>
    `The person couldn’t be removed. ${error} Try Remove again.`,
  removeFallback: "Remove",
  removeNamed: (firstName: string) => `Remove ${firstName}…`,
  removePerson: "Remove this person…",
  removeStopsSharing: (firstName: string) =>
    `Removing ${firstName} also stops anything you share with them.`,
  removeTitle: (name: string) => `Remove ${name}?`,
  removed: (name: string) => `${name} was removed.`,
  removing: "Removing…",
  subline:
    "The people you trust, how to reach them, and exactly what each one can see.",
  title: "Trusted circle",
  trusted: "Trusted",
};

export { circle };

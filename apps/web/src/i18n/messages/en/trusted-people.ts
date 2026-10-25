const trustedPeople = {
  add: "Add a trusted person",
  call: "Call",
  callAria: (name: string) => `Call ${name}`,
  callHelpMessage:
    "I’m not sure about a call I received. Could you help me check whether it’s real before I share anything or send money?",
  callsLoading: "Calls are unavailable until your account settings load.",
  callsPractice: "Calls are unavailable in Practice mode.",
  contactFallback: "Contact",
  empty: "A second opinion can help. Add someone you know to your ",
  emptyRest:
    " to ask for help checking this. You’ll review any message before it is sent.",
  failed: (name: string, error: string) =>
    `The message to ${name} couldn’t be prepared. ${error} Nothing was sent. Try Prepare message again.`,
  introCall:
    "Prepare a message asking for help with the call. You can read and change it before approving it. Nothing is sent yet.",
  introCheck:
    "Prepare a message asking someone to help with this check. You can read and change it before approving it. Nothing is sent yet.",
  list: "Trusted people",
  loading: "Loading trusted people",
  noMessageAddress: "No message address saved",
  noPhone: "No phone number is saved. ",
  noWayToMessage: "No way to message them is saved. ",
  prepare: "Prepare message",
  prepareAria: (name: string) => `Prepare a message to ${name}`,
  preparing: "Preparing…",
  reachedBy: {
    discord: "Reached by message",
    email: "Reached by email",
    imessage: "Reached by message",
    in_app: "Reached in LifeLink",
    telegram: "Reached by message",
  },
  saveDetails: "Save their contact details in your ",
  trustedCircle: "Trusted circle",
  unavailable: "Call and Prepare message are unavailable right now.",
};

export { trustedPeople };

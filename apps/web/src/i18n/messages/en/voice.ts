const voice = {
  captions: "Captions",
  connectionProblem: "The voice connection had a problem.",
  dictationStopped: "Voice typing stopped. Please try again, or type instead.",
  emptyRequest: "Nothing was prepared because the request was empty.",
  inputLabel: "What would you like help with?",
  lifeLinkSaid: "LifeLink said: ",
  listening:
    "Listening. Your words will appear in the box; press Send when they look right.",
  microphoneBusy:
    "Another app is using the microphone. Close it and try again, or type instead.",
  microphoneDenied:
    "LifeLink isn't allowed to use the microphone. Allow it in your browser's settings for this site, or type instead.",
  microphoneFailed:
    "The microphone didn't start. Please try again, or type instead.",
  microphoneMissing:
    "No microphone was found. Check that one is connected, or type instead.",
  network:
    "Voice typing needs an internet connection right now. Please type instead.",
  noSpeech:
    "I didn't hear anything. Press Speak and try again, a little closer to the microphone.",
  offlineFailed:
    "This request could not be saved offline. Your words are still here. Please try again when connected.",
  opening: "Opening a place for your message",
  placeholder: "Ask LifeLink…",
  prepareFailed:
    "That could not be prepared. Please ask them to try again or type it.",
  prepared:
    "Prepared. It is on the screen now; nothing happens until it is approved there.",
  readAloudUnavailable: "Read-aloud is unavailable. Please try again.",
  retry: "Your words are still in the box. Press Send to try again.",
  savedOffline: "Saved. LifeLink will look at this when you're back online.",
  screeningConnectionProblem: "The call-screening connection had a problem.",
  screeningDisconnected: "Call screening disconnected.",
  screeningLost: "Call screening lost its connection.",
  screeningMicrophoneStopped:
    "The microphone stopped. Start call screening again to reconnect.",
  screeningResumeFailed:
    "Call screening could not resume after the alert. Start it again.",
  screeningStopped: "Call screening was stopped.",
  send: "Send",
  sending: "Sending",
  serviceDenied:
    "Voice typing is turned off in this browser. Please type instead.",
  speak: "Speak",
  speakHint:
    "Press Speak to talk instead of typing. Nothing is sent until you approve it.",
  speaking: "LifeLink is speaking…",
  startFailed: (error: string) =>
    `Voice didn't start: ${error} You can type instead.`,
  stop: "Stop",
  talking:
    "Talking with LifeLink. Anything it prepares appears on screen for you to approve.",
  unavailable:
    "Voice isn't available in this browser, so please type. Nothing is sent until you approve it.",
  voiceStopped: "Voice was stopped.",
  youSaid: "You said: ",
};

export { voice };

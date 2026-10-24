const callScreening = {
  alertOff: "Alert sound is off",
  alertPlayed: "Alert played out loud",
  alertPlaying: "Alert playing out loud",
  alertReady: "Alert ready",
  alertUnavailable: "Sound could not play. Read the warning on screen.",
  askTrusted: "Ask someone you trust",
  bigger: "Bigger words",
  callCaptions: "Heard on the call",
  callTime: "into the call",
  callback:
    "If anything felt wrong, hang up and call the person or company on a number you already trust.",
  callbackAdvice:
    "If anything felt off, hang up and call back on a number you trust.",
  caller: "Caller",
  cannotConfirm: "This can’t confirm who called.",
  captionSize: "Caption size",
  captionSource: "Made from captions that may have mistakes.",
  captions: "Captions",
  captionsEmpty: "The call’s words will appear here.",
  captionsNotSaved: "Shown until you leave this page. Not saved.",
  checkMessage: "Check a message",
  checkingLastPart: "Checking the last part of the call for warning signs…",
  checksUnavailable:
    "Warning-sign checks aren’t available right now. The call’s words still appear below.",
  clearTitle: "No warning signs heard",
  close: "Close",
  codes: "requests for a code, password, or personal details",
  connectionError:
    "The listening connection stopped. Your captions are still here. Press Start again to keep listening, or Finish to save a summary.",
  consent:
    "I understand the call’s sound and words will be sent to cloud AI services while this check is on.",
  credentialsReason: "A request to share a verification code or password.",
  delete: "Delete summary",
  deleteError: "The summary could not be deleted. Try again.",
  deleteNotice:
    "Deleting this summary does not delete messages you prepared or sent.",
  deleting: "Deleting…",
  discard: "Discard summary",
  earlierAria: "Earlier call checks",
  finish: "Finish",
  finishSave: "Finish and save summary",
  flagged: "What LifeLink flagged",
  flaggedAdvice:
    "Don’t share codes or send money. Hang up and call back on a number you already trust.",
  flaggedBody: "The caller asked for things scammers often ask for.",
  flaggedTitle: (count: number): string =>
    count === 1 ? "1 warning sign heard" : `${count} warning signs heard`,
  gettingReady: "Getting ready…",
  guideCaution:
    "It can miss warning signs. If a call feels wrong, hang up and call back on a number you already trust.",
  guideTitle: "LifeLink can warn you out loud about:",
  hangUpFirst: "It’s fine to say “I’ll call you back” and hang up first.",
  heard: "What LifeLink heard",
  heardText: (heardWords: number | undefined): string => {
    if (heardWords === undefined) {
      return "Nothing LifeLink heard matched a request scammers commonly make.";
    }

    const words = heardWords === 1 ? "1 word" : `about ${heardWords} words`;

    return `LifeLink heard ${words}. None of them matched a request scammers commonly make.`;
  },
  help: "I just had a phone call that I’m not sure about. Could you help me check whether it was real before I share anything or send money?",
  interrupted:
    "The connection stopped during this check. Only the parts LifeLink heard were checked.",
  intro:
    "LifeLink shows the call’s words on screen, has AI check them for scam warning signs, and warns you out loud if it finds one.",
  languageLimit:
    "Live calls use cloud AI. Local text checks still rely on English patterns; translating the interface does not expand their detection coverage. The practice script and spoken alert are in English. Captions and quoted words stay in their original language.",
  listenTitle: "Listen to a call",
  listening: "LifeLink is listening",
  liveCall: "Live call",
  messageReview: "Message to review",
  mixedVoices: "These captions mix both voices and may have mistakes.",
  money: "requests for money or gift cards",
  moneyReason: "A request to send money or pay with gift cards.",
  mute: "Mute alert",
  noWarnings: "No warning signs picked up",
  noWarningsYet: " · No warning signs picked up so far",
  notConfigured:
    "Live call checks are not set up yet. You can try a practice call or type the caller’s words.",
  notSafe:
    "This does not mean the call was safe. LifeLink can miss warning signs and cannot verify who called.",
  openStep: "Keep this screen open while you talk.",
  otherDevice:
    "If your phone cannot use the microphone during a call, open LifeLink on another device.",
  outcomeLabels: {
    clear: "No warning signs picked up",
    flagged: "Warning signs picked up",
    silent: "Nothing was heard",
    unchecked: "Not fully checked",
  },
  partlyChecked:
    "Part of this call couldn’t be checked, so there may be more warning signs.",
  paused:
    "Listening pauses while the alert plays so it won’t hear its own warning.",
  permissionDenied:
    "Microphone access was not allowed. Allow the microphone in your browser’s site settings, then try again. You can also try a practice call.",
  phoneCall: "Phone call",
  potentialScam: "Potential scam.",
  practice: "Practice",
  practiceCall: "Practice call",
  practiceCaptionSource: "These are the practice call’s scripted words.",
  practiceCaptions: "What’s being said",
  practiceExplanation:
    "This is a made-up call. No microphone or cloud AI is used.",
  practiceFlaggedBody:
    "The practice caller asked for things scammers often ask for.",
  practiceHeard: "Said in the practice call",
  practiceHelp:
    "I tried LifeLink’s practice scam call. Could we talk about what to do if a call like that happens?",
  practiceMode:
    "Practice mode is on. Try the made-up call below without a microphone.",
  practicePlaying: "Practice call playing",
  practicePrivacy:
    "No microphone or cloud AI is used. A short summary is saved in Earlier checks.",
  practiceSaved:
    "The practice call uses no microphone or cloud AI. Its short summary is saved in Earlier checks.",
  practiceSilentBody:
    "The practice call ended before any words played, so there was nothing to check.",
  practiceSilentTitle: "Practice stopped early",
  practiceSource: "Made from the practice script.",
  practiceSummary: "Practice call summary",
  practiceTime: "in",
  practiceVoices:
    "Practice voices are labeled. Real call captions mix both voices and are not labeled.",
  privacy:
    "LifeLink does not record calls. Sound from your microphone goes to Google’s Gemini to make the captions, and the captions go to an AI model that checks them for warning signs. When you stop, LifeLink saves a short summary of warning signs, not the captions.",
  protect: "Do not share codes, passwords, or money. Ask someone you trust.",
  quoteNotice: "Quotes may have mistakes. Long numbers are hidden.",
  readResult: "Read the result aloud",
  remote: "requests to control your computer or phone",
  remoteReason: "A request to allow remote access to a device.",
  retrySave: "Try saving again",
  retrySteps: [
    "Put the phone call on speakerphone.",
    "Keep the phone close to this device.",
    "Start call screening again before you answer.",
  ],
  retryTitle: "To try again",
  review: "Review",
  saveError:
    "The summary could not be saved. Keep this page open and try again.",
  saving: "Saving your summary…",
  scamWarning: "This sounds like a scam.",
  screenAnotherCall: "Screen another call",
  secrecyReason: "A request for secrecy while pressuring you to act urgently.",
  silentBody:
    "No speech reached LifeLink, so it couldn’t check this call for warning signs.",
  silentTitle: "LifeLink didn’t hear the call",
  smaller: "Smaller words",
  soundUnavailable:
    "Sound is unavailable. Warning signs will still appear on screen.",
  speakerStep: "Put the call on speaker near this device.",
  start: "Start listening",
  startAgain: "Start again",
  startError:
    "LifeLink could not start listening. Try again, or try a practice call.",
  startStep: "Press Start listening and allow the microphone.",
  stop: "Stop",
  stopListening: "Stop listening",
  stopPractice: "Stop practice call",
  stopped: "Listening has stopped",
  summary: "Call summary",
  summaryNoWarnings: "No warning signs were picked up.",
  summarySaved:
    "Saved in Earlier checks as a short summary. No audio or captions are kept.",
  summaryStorage:
    "Only a short summary is saved to Earlier checks. No audio or captions are kept.",
  summaryWarnings: "This call had warning signs.",
  tellTrusted: "Tell someone you trust",
  timeLimit: "The check stopped after 30 minutes. Here is the summary so far.",
  times:
    "Times are minutes and seconds into the check. Long numbers are hidden.",
  tryPractice: "Try a practice call",
  uncheckedBody:
    "Some of what was said couldn’t be checked for warning signs, so this summary may miss them.",
  uncheckedTitle: "LifeLink couldn’t fully check this call",
  unmute: "Unmute alert",
  urgency: "threats, or pressure to hurry and keep a secret",
  warningReasons: {
    codes_or_passwords: "A request to share a verification code or password.",
    gift_cards: "A request to pay with gift cards or share their codes.",
    money: "A request to send money or move your savings.",
    personal_details: "A request for personal or bank details.",
    remote_access: "A request to allow remote access to a device.",
    secrecy_or_pressure: "A request for secrecy or pressure to act right away.",
    threats: "A threat of arrest, fines, or a closed account.",
  },
  warningSign: "Warning sign",
  warnings: "Warning signs picked up",
  you: "You",
};

export { callScreening };

/**
 * Browser dictation (Web Speech API) when Gemini Live is not configured. It
 * only fills the text box; the person still presses Ask.
 */

interface RecognitionResult {
  0: { transcript: string };
  isFinal: boolean;
}

interface RecognitionEvent {
  resultIndex: number;
  // SpeechRecognitionResultList is iterable in every browser that has the API.
  results: Iterable<RecognitionResult>;
}

interface RecognitionErrorEvent {
  error: string;
}

interface Recognition {
  addEventListener: ((
    type: "result",
    listener: (event: RecognitionEvent) => void
  ) => void) &
    ((
      type: "error",
      listener: (event: RecognitionErrorEvent) => void
    ) => void) &
    ((type: "end", listener: () => void) => void);
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
}

type RecognitionConstructor = new () => Recognition;

interface SpeechGlobals {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
}

const recognitionConstructor = (): RecognitionConstructor | null => {
  // SAFETY: these constructors are optional browser globals; each is checked for presence before use.
  const speechGlobals = globalThis as SpeechGlobals;

  return (
    speechGlobals.SpeechRecognition ??
    speechGlobals.webkitSpeechRecognition ??
    null
  );
};

const dictationAvailable = (): boolean => recognitionConstructor() !== null;

interface DictationHandle {
  stop: () => void;
}

/** Plain words for the browser's dictation error codes; null when nothing went wrong. */
const PROBLEMS: ReadonlyMap<string, string> = new Map([
  [
    "audio-capture",
    "No microphone was found. Check that one is connected, or type instead.",
  ],
  [
    "network",
    "Voice typing needs an internet connection right now. Please type instead.",
  ],
  [
    "no-speech",
    "I didn't hear anything. Press Speak and try again, a little closer to the microphone.",
  ],
  [
    "not-allowed",
    "LifeLink isn't allowed to use the microphone. Allow it in your browser's settings for this site, or type instead.",
  ],
  [
    "service-not-allowed",
    "Voice typing is turned off in this browser. Please type instead.",
  ],
]);

const GENERIC_PROBLEM =
  "Voice typing stopped. Please try again, or type instead.";

/** onEnd receives a plain explanation when dictation stopped because of a problem. */
const startDictation = (
  onText: (text: string, final: boolean) => void,
  onEnd: (problem: string | null) => void
): DictationHandle | null => {
  const Constructor = recognitionConstructor();

  if (Constructor === null) {
    return null;
  }

  const recognition = new Constructor();
  let problem: string | null = null;

  recognition.lang = globalThis.navigator?.language || "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.addEventListener("result", (event: RecognitionEvent) => {
    let text = "";
    let final = false;

    for (const result of event.results) {
      text += result[0].transcript;
      final = result.isFinal;
    }

    onText(text, final);
  });
  recognition.addEventListener("error", (event: RecognitionErrorEvent) => {
    // "aborted" means the person pressed Stop.
    problem =
      event.error === "aborted"
        ? null
        : (PROBLEMS.get(event.error) ?? GENERIC_PROBLEM);
  });
  recognition.addEventListener("end", () => onEnd(problem));

  try {
    recognition.start();
  } catch {
    onEnd(GENERIC_PROBLEM);

    return null;
  }

  return { stop: () => recognition.stop() };
};

export { dictationAvailable, startDictation };

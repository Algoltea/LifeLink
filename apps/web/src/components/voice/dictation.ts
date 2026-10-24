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

interface Recognition {
  addEventListener: ((
    type: "result",
    listener: (event: RecognitionEvent) => void
  ) => void) &
    ((type: "end" | "error", listener: () => void) => void);
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

const startDictation = (
  onText: (text: string, final: boolean) => void,
  onEnd: () => void
): DictationHandle | null => {
  const Constructor = recognitionConstructor();

  if (Constructor === null) {
    return null;
  }

  const recognition = new Constructor();

  recognition.lang = "en-US";
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
  recognition.addEventListener("end", onEnd);
  recognition.addEventListener("error", onEnd);
  recognition.start();

  return { stop: () => recognition.stop() };
};

export { dictationAvailable, startDictation };

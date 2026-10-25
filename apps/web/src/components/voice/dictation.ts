/**
 * Browser dictation (Web Speech API) when Gemini Live is not configured. It
 * only fills the text box; the person still presses Ask.
 */

import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { getLocale, messagesFor } from "@/i18n/locale";

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
const dictationProblem = (error: string): string => {
  const t = messagesFor(getLocale()).voice;

  const problems = new Map([
    ["audio-capture", t.microphoneMissing],
    ["network", t.network],
    ["no-speech", t.noSpeech],
    ["not-allowed", t.microphoneDenied],
    ["service-not-allowed", t.serviceDenied],
  ]);

  return problems.get(error) ?? t.dictationStopped;
};

/** onEnd receives a plain explanation when dictation stopped because of a problem. */
const startDictation = (
  onText: (text: string, final: boolean) => void,
  onEnd: (problem: string | null) => void,
  locale: InterfaceLocale = getLocale()
): DictationHandle | null => {
  const Constructor = recognitionConstructor();

  if (Constructor === null) {
    return null;
  }

  const recognition = new Constructor();
  let problem: string | null = null;

  recognition.lang = intlLocaleOf(locale);
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
    problem = event.error === "aborted" ? null : dictationProblem(event.error);
  });
  recognition.addEventListener("end", () => onEnd(problem));

  try {
    recognition.start();
  } catch {
    onEnd(messagesFor(getLocale()).voice.dictationStopped);

    return null;
  }

  return { stop: () => recognition.stop() };
};

export { dictationAvailable, startDictation };

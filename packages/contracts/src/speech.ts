/** ElevenLabs voices supported by the OpenRouter speech endpoint. */
const SPEECH_VOICES = [
  { label: "George", value: "george" },
  { label: "Sarah", value: "sarah" },
  { label: "Adam", value: "adam" },
  { label: "Alice", value: "alice" },
  { label: "Bella", value: "bella" },
  { label: "Bill", value: "bill" },
  { label: "Brian", value: "brian" },
  { label: "Callum", value: "callum" },
  { label: "Charlie", value: "charlie" },
  { label: "Chris", value: "chris" },
  { label: "Daniel", value: "daniel" },
  { label: "Eric", value: "eric" },
  { label: "Harry", value: "harry" },
  { label: "Jessica", value: "jessica" },
  { label: "Laura", value: "laura" },
  { label: "Liam", value: "liam" },
  { label: "Lily", value: "lily" },
  { label: "Matilda", value: "matilda" },
  { label: "River", value: "river" },
  { label: "Roger", value: "roger" },
  { label: "Will", value: "will" },
] as const;

type SpeechVoice = (typeof SPEECH_VOICES)[number]["value"];

const isSpeechVoice = (value: unknown): value is SpeechVoice =>
  SPEECH_VOICES.some((voice) => voice.value === value);

export { isSpeechVoice, SPEECH_VOICES };

export type { SpeechVoice };

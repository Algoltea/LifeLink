import { describe, expect, it } from "vitest";

import { isSpeechVoice, SPEECH_VOICES } from "./speech";

describe("speech voices", () => {
  it("offers the existing 21 voices with display labels and lowercase IDs", () => {
    expect(SPEECH_VOICES).toHaveLength(21);
    expect(new Set(SPEECH_VOICES.map(({ value }) => value)).size).toBe(21);

    for (const { label, value } of SPEECH_VOICES) {
      expect(label).toBe(value.charAt(0).toUpperCase() + value.slice(1));
      expect(value).toBe(value.toLowerCase());
      expect(isSpeechVoice(value)).toBeTruthy();
    }
  });

  it.each([undefined, null, 1, {}, "", "unknown", "Sarah", " sarah"])(
    "rejects unsupported or non-string values: %s",
    (value) => {
      expect(isSpeechVoice(value)).toBeFalsy();
    }
  );
});

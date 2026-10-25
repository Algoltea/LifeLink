import { interfaceLocales } from "@lifelink/contracts/locale";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { startDictation } from "./dictation";

const instances: FakeRecognition[] = [];
const recognitionStart = vi.fn<() => void>();

class FakeRecognition extends EventTarget {
  continuous = false;
  interimResults = false;
  lang = "";
  start = recognitionStart;
  stop = vi.fn<() => void>();

  constructor() {
    super();
    instances.push(this);
  }
}

describe("browser dictation language", () => {
  beforeEach(() => {
    instances.length = 0;
    recognitionStart.mockReset();
    vi.stubGlobal("document", { documentElement: { lang: "en" } });
    vi.stubGlobal("localStorage", { setItem: vi.fn<Storage["setItem"]>() });
    vi.stubGlobal("SpeechRecognition", FakeRecognition);
    setLocale("en");
  });

  afterEach(() => {
    setLocale("en");
    vi.unstubAllGlobals();
  });

  it.each(interfaceLocales)(
    "keeps $intl dictation intact and reports errors in the current UI language",
    ({ id, intl }) => {
      setLocale(id === "en" ? "ko" : "en");
      const onText = vi.fn<(text: string, final: boolean) => void>();
      const onEnd = vi.fn<(problem: string | null) => void>();
      const handle = startDictation(onText, onEnd, id);
      const [recognition] = instances;

      expect({
        handle: handle !== null,
        language: recognition?.lang,
        starts: recognition?.start.mock.calls.length,
      }).toStrictEqual({ handle: true, language: intl, starts: 1 });
      setLocale("fr");
      expect({
        instances: instances.length,
        language: recognition?.lang,
        stops: recognition?.stop.mock.calls.length,
      }).toStrictEqual({ instances: 1, language: intl, stops: 0 });

      const transcript = "Nguyễn nói: 明天 你好 한국어 — 4:30";
      recognition?.dispatchEvent(
        Object.assign(new Event("result"), {
          resultIndex: 0,
          results: [{ 0: { transcript }, isFinal: true }],
        })
      );
      expect(onText).toHaveBeenCalledWith(transcript, true);
      recognition?.dispatchEvent(
        Object.assign(new Event("error"), { error: "network" })
      );
      recognition?.dispatchEvent(new Event("end"));
      expect(onEnd).toHaveBeenCalledWith(messagesFor("fr").voice.network);
      handle?.stop();
      expect(recognition?.stop).toHaveBeenCalledOnce();
    }
  );

  it("reports a start failure in the current UI language, independently of the recognition language", () => {
    recognitionStart.mockImplementationOnce(() => {
      throw new Error("Recognition could not start");
    });
    setLocale("fr");
    const onEnd = vi.fn<(problem: string | null) => void>();

    const handle = startDictation(
      vi.fn<(text: string, final: boolean) => void>(),
      onEnd,
      "ko"
    );

    const [recognition] = instances;

    expect({
      handle,
      instances: instances.length,
      language: recognition?.lang,
      starts: recognition?.start.mock.calls.length,
      stops: recognition?.stop.mock.calls.length,
    }).toStrictEqual({
      handle: null,
      instances: 1,
      language: "ko-KR",
      starts: 1,
      stops: 0,
    });
    expect(onEnd).toHaveBeenCalledExactlyOnceWith(
      messagesFor("fr").voice.dictationStopped
    );
  });

  it.each(interfaceLocales)(
    "uses the selected $id locale when no override is supplied",
    ({ id, intl }) => {
      setLocale(id);
      startDictation(
        vi.fn<(text: string, final: boolean) => void>(),
        vi.fn<(problem: string | null) => void>()
      );
      expect(instances[0]?.lang).toBe(intl);
    }
  );
});

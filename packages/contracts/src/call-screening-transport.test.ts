/* oxlint-disable vitest/max-expects -- lifecycle transitions must assert cleanup of every owned resource together. */
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  GoogleGenAIOptions,
  LiveConnectConfig,
  LiveServerMessage,
  Session,
} from "../../../apps/web/node_modules/@google/genai";
import type { CallCaption } from "./call-screening";

interface ScreeningHandle {
  setInputMuted: (muted: boolean) => void;
  stop: () => void;
}

interface ScreeningOptions {
  inputMuted?: boolean;
  signal?: AbortSignal;
}

interface ScreeningCallbacks {
  onCaption: (caption: CallCaption) => void;
  onClosed: (reason: string | null) => void;
}

interface ScreeningModule {
  startCallScreeningSession: (
    token: string,
    model: string,
    callbacks: ScreeningCallbacks,
    options?: ScreeningOptions
  ) => Promise<ScreeningHandle>;
}

interface ConnectionParameters {
  callbacks: {
    onclose: (event: { reason: string }) => void;
    onerror: () => void;
    onmessage: (
      message: Pick<LiveServerMessage, "serverContent" | "toolCall">
    ) => void;
  };
  config: LiveConnectConfig;
  model: string;
}

type ScreeningSession = Pick<
  Session,
  "close" | "sendClientContent" | "sendRealtimeInput" | "sendToolResponse"
>;

const sdk = vi.hoisted(() => ({
  connect:
    vi.fn<(parameters: ConnectionParameters) => Promise<ScreeningSession>>(),
  construct: vi.fn<(options: GoogleGenAIOptions) => void>(),
}));

// oxlint-disable-next-line anti-slop/no-module-mocking, vitest/prefer-import-in-mock -- explicitly isolate the SDK with a minimal fake; these Node tests never connect to a provider.
vi.mock("../../../apps/web/node_modules/@google/genai", () => ({
  GoogleGenAI: class {
    live = { connect: sdk.connect };

    constructor(options: GoogleGenAIOptions) {
      sdk.construct(options);
    }
  },
  Modality: { AUDIO: "AUDIO" },
}));

// A non-literal import keeps this browser module out of contracts' Node-only
// TypeScript graph. The interface above covers only the transport's public API.
const transportPath = fileURLToPath(
  new URL(
    "../../../apps/web/src/components/voice/live-session.ts",
    import.meta.url
  )
);

const { startCallScreeningSession }: ScreeningModule = await import(
  transportPath
);

const createHarness = () => {
  const track = Object.assign(new EventTarget(), {
    enabled: true,
    stop: vi.fn<() => void>(),
  });

  const stream = {
    getAudioTracks: () => [track],
    getTracks: () => [track],
  };

  const source = {
    connect: vi.fn<() => void>(),
    disconnect: vi.fn<() => void>(),
  };

  const port = Object.assign(new EventTarget(), {
    close: vi.fn<() => void>(),
    postMessage: vi.fn<() => void>(),
    start: vi.fn<() => void>(),
  });

  const worklet = {
    connect: vi.fn<() => void>(),
    disconnect: vi.fn<() => void>(),
    port,
  };

  const capture = {
    audioWorklet: {
      addModule: vi.fn<(url: string) => Promise<void>>().mockResolvedValue(),
    },
    close: vi.fn<() => Promise<void>>().mockResolvedValue(),
    createBuffer: vi.fn<() => void>(),
    createBufferSource: vi.fn<() => void>(),
    createMediaStreamSource: vi
      .fn<() => typeof source>()
      .mockReturnValue(source),
    destination: {},
    resume: vi.fn<() => Promise<void>>().mockResolvedValue(),
    sampleRate: 16_000,
  };

  const session = {
    close: vi.fn<ScreeningSession["close"]>(),
    sendClientContent: vi.fn<ScreeningSession["sendClientContent"]>(),
    sendRealtimeInput: vi.fn<ScreeningSession["sendRealtimeInput"]>(),
    sendToolResponse: vi.fn<ScreeningSession["sendToolResponse"]>(),
  };

  const callbacks = {
    onCaption: vi.fn<(caption: CallCaption) => void>(),
    onClosed: vi.fn<(reason: string | null) => void>(),
  };

  const getUserMedia = vi
    .fn<() => Promise<typeof stream>>()
    .mockResolvedValue(stream);

  const contextConstruct = vi.fn<(options: { sampleRate: number }) => void>();

  const workletConstruct =
    vi.fn<(context: typeof capture, name: string) => void>();

  const connecting = Promise.withResolvers<ConnectionParameters>();
  let parameters: ConnectionParameters | undefined;
  let connectionResult = Promise.resolve(session);

  sdk.connect.mockImplementation((received: ConnectionParameters) => {
    parameters = received;
    connecting.resolve(received);

    return connectionResult;
  });

  const MockAudioContext = function MockAudioContext(options: {
    sampleRate: number;
  }): typeof capture {
    contextConstruct(options);

    return capture;
  };

  const MockAudioWorkletNode = function MockAudioWorkletNode(
    context: typeof capture,
    name: string
  ): typeof worklet {
    workletConstruct(context, name);

    return worklet;
  };

  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
  vi.stubGlobal("AudioContext", MockAudioContext);
  vi.stubGlobal("AudioWorkletNode", MockAudioWorkletNode);

  const createObjectURL = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:screening-worklet");

  const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockReturnValue();

  const handles: ScreeningHandle[] = [];

  const connection = (): ConnectionParameters => {
    if (!parameters) {
      throw new Error("The test has not reached SDK connection startup.");
    }

    return parameters;
  };

  return {
    callbacks,
    capture,
    connecting: connecting.promise,
    connection,
    contextConstruct,
    createObjectURL,
    emitAudio: (epoch = 0): void => {
      port.dispatchEvent(
        new MessageEvent("message", {
          data: { buffer: new Int16Array([256, 512]).buffer, epoch },
        })
      );
    },
    getUserMedia,
    handles,
    port,
    receive: (content: LiveServerMessage["serverContent"]): void => {
      connection().callbacks.onmessage({ serverContent: content });
    },
    revokeObjectURL,
    session,
    setConnection: (pending: Promise<typeof session>): void => {
      connectionResult = pending;
    },
    source,
    start: async (options: ScreeningOptions = {}): Promise<ScreeningHandle> => {
      const handle = await startCallScreeningSession(
        "test-ephemeral-token",
        "test-live-model",
        callbacks,
        options
      );

      handles.push(handle);

      return handle;
    },
    stream,
    track,
    worklet,
    workletConstruct,
  };
};

describe("call-screening browser transport with Node stubs", () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    sdk.connect.mockReset();
    sdk.construct.mockReset();
    harness = createHarness();
  });

  afterEach(() => {
    for (const handle of harness.handles) {
      handle.stop();
    }

    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("accepts only input captions after sending microphone audio", async () => {
    await harness.start();
    harness.receive({ inputTranscription: { text: "Unsolicited transcript" } });
    expect(harness.callbacks.onCaption).not.toHaveBeenCalled();

    harness.capture.sampleRate = 48_000;
    harness.emitAudio();
    harness.receive({ inputTranscription: { text: "Please send money" } });

    expect(harness.session.sendRealtimeInput).toHaveBeenCalledExactlyOnceWith({
      audio: {
        data: Buffer.from(new Int16Array([256, 512]).buffer).toString("base64"),
        mimeType: "audio/pcm;rate=48000",
      },
    });
    expect(harness.callbacks.onCaption).toHaveBeenCalledExactlyOnceWith({
      final: false,
      id: expect.any(String),
      speaker: "unknown",
      text: "Please send money",
      timeMs: 0,
    });
    expect(harness.getUserMedia).toHaveBeenCalledExactlyOnceWith({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    expect(harness.worklet.connect).toHaveBeenCalledWith(
      harness.capture.destination
    );
  });

  it("groups deltas without losing whitespace or repeated words and keeps segment IDs stable", async () => {
    await harness.start();
    harness.emitAudio();
    vi.advanceTimersByTime(25);
    harness.receive({ inputTranscription: { text: "No " } });
    vi.advanceTimersByTime(25);
    harness.receive({ inputTranscription: { text: "no " } });
    harness.receive({ inputTranscription: { text: "send money." } });
    harness.receive({ inputTranscription: { finished: true } });
    harness.receive({ turnComplete: true });

    const captions = harness.callbacks.onCaption.mock.calls.map(
      ([caption]) => caption
    );

    const [first] = captions;
    expect(captions).toStrictEqual([
      {
        final: false,
        id: expect.any(String),
        speaker: "unknown",
        text: "No ",
        timeMs: 25,
      },
      { ...first, text: "No no " },
      { ...first, text: "No no send money." },
      { ...first, final: true, text: "No no send money." },
    ]);

    harness.receive({
      inputTranscription: { finished: true, text: "Next segment" },
    });
    const next = harness.callbacks.onCaption.mock.lastCall?.[0];
    expect(next).toMatchObject({
      final: true,
      speaker: "unknown",
      text: "Next segment",
      timeMs: 50,
    });
    expect(next?.id).not.toBe(first?.id);
  });

  it("replaces interim hypotheses before a final input transcript", async () => {
    await harness.start();
    harness.emitAudio();
    harness.receive({ interimInputTranscription: { text: "Send mo" } });
    harness.receive({ interimInputTranscription: { text: "Send money" } });
    harness.receive({
      inputTranscription: { finished: true, text: "Send money now" },
    });

    const captions = harness.callbacks.onCaption.mock.calls.map(
      ([caption]) => caption
    );

    expect(captions.map((caption) => caption.text)).toStrictEqual([
      "Send mo",
      "Send money",
      "Send money now",
    ]);
    expect(new Set(captions.map((caption) => caption.id)).size).toBe(1);
    expect(captions[2]?.final).toBeTruthy();
  });

  it("finalizes a silent segment after the last transcription gap only once", async () => {
    await harness.start();
    harness.emitAudio();
    harness.receive({ inputTranscription: { text: "First " } });
    vi.advanceTimersByTime(1000);
    harness.receive({ inputTranscription: { text: "sentence" } });
    vi.advanceTimersByTime(1499);
    expect(harness.callbacks.onCaption).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);

    expect(harness.callbacks.onCaption).toHaveBeenLastCalledWith({
      final: true,
      id: harness.callbacks.onCaption.mock.calls[0]?.[0].id,
      speaker: "unknown",
      text: "First sentence",
      timeMs: 0,
    });
    harness.receive({ turnComplete: true });
    vi.advanceTimersByTime(5000);
    expect(harness.callbacks.onCaption).toHaveBeenCalledTimes(3);
  });

  it("does not display or play model output, call tools, or request output transcripts", async () => {
    await harness.start();
    harness.emitAudio();
    harness.connection().callbacks.onmessage({
      serverContent: {
        modelTurn: {
          parts: [
            { text: "Assistant answer" },
            {
              inlineData: {
                data: "AAEAAg==",
                mimeType: "audio/pcm;rate=24000",
              },
            },
          ],
        },
        outputTranscription: { text: "Assistant caption" },
        turnComplete: true,
      },
      toolCall: {
        functionCalls: [
          {
            args: { request: "Send a message" },
            id: "tool-1",
            name: "submit_request",
          },
        ],
      },
    });

    expect(harness.callbacks.onCaption).not.toHaveBeenCalled();
    expect(harness.capture.createBuffer).not.toHaveBeenCalled();
    expect(harness.capture.createBufferSource).not.toHaveBeenCalled();
    expect(harness.contextConstruct).toHaveBeenCalledExactlyOnceWith({
      sampleRate: 16_000,
    });
    expect(harness.session.sendToolResponse).not.toHaveBeenCalled();
    expect(harness.session.sendClientContent).not.toHaveBeenCalled();
    expect(harness.connection().config).toStrictEqual({
      inputAudioTranscription: {},
      responseModalities: ["AUDIO"],
    });
    expect(sdk.construct).toHaveBeenCalledExactlyOnceWith({
      apiKey: "test-ephemeral-token",
      httpOptions: { apiVersion: "v1beta" },
    });
  });

  it("starts muted without sending audio or captions, then resumes without a drain", async () => {
    const handle = await harness.start({ inputMuted: true });
    harness.emitAudio();
    harness.receive({
      inputTranscription: { finished: true, text: "Muted speech" },
    });
    expect(harness.track.enabled).toBeFalsy();
    expect(harness.session.sendRealtimeInput).not.toHaveBeenCalled();
    expect(harness.callbacks.onCaption).not.toHaveBeenCalled();

    handle.setInputMuted(false);
    harness.emitAudio(1);
    harness.receive({
      inputTranscription: { finished: true, text: "Audible speech" },
    });
    expect(harness.track.enabled).toBeTruthy();
    expect(harness.session.sendRealtimeInput).toHaveBeenCalledOnce();
    expect(harness.callbacks.onCaption).toHaveBeenCalledOnce();
  });

  it("mute flushes sent audio once and blocks audio, captions, and pending settle timers", async () => {
    const handle = await harness.start();
    harness.emitAudio();
    harness.receive({ inputTranscription: { text: "Unfinished speech" } });
    handle.setInputMuted(true);
    handle.setInputMuted(true);
    harness.emitAudio(0);
    harness.emitAudio(1);
    harness.receive({ inputTranscription: { text: "Alert echo" } });
    vi.advanceTimersByTime(2000);

    expect(harness.session.sendRealtimeInput).toHaveBeenCalledTimes(2);
    expect(harness.session.sendRealtimeInput).toHaveBeenLastCalledWith({
      audioStreamEnd: true,
    });
    expect(harness.callbacks.onCaption).toHaveBeenCalledOnce();
    expect(harness.track.enabled).toBeFalsy();
    expect(harness.port.postMessage).toHaveBeenLastCalledWith(
      { epoch: 1, muted: true },
      []
    );
  });

  it.each([
    { inputTranscription: { finished: true, text: "Old final" } },
    { turnComplete: true },
  ])(
    "unmute waits for an old partial's boundary and rejects queued old-epoch audio (%j)",
    async (boundary) => {
      const handle = await harness.start();
      harness.emitAudio();
      harness.receive({ inputTranscription: { text: "Old partial" } });
      handle.setInputMuted(true);
      handle.setInputMuted(false);
      harness.emitAudio(2);
      harness.receive({ inputTranscription: { text: "Old trailing text" } });

      expect(harness.session.sendRealtimeInput).toHaveBeenCalledTimes(2);
      expect(harness.callbacks.onCaption).toHaveBeenCalledOnce();
      harness.receive(boundary);
      harness.emitAudio(0);
      harness.emitAudio(1);
      expect(harness.session.sendRealtimeInput).toHaveBeenCalledTimes(2);
      harness.emitAudio(2);
      harness.receive({
        inputTranscription: { finished: true, text: "Fresh speech" },
      });

      expect(harness.session.sendRealtimeInput).toHaveBeenCalledTimes(3);
      expect(harness.callbacks.onCaption).toHaveBeenCalledTimes(2);
      expect(harness.callbacks.onCaption.mock.lastCall?.[0]).toMatchObject({
        final: true,
        text: "Fresh speech",
      });
      expect(harness.callbacks.onCaption.mock.lastCall?.[0].id).not.toBe(
        harness.callbacks.onCaption.mock.calls[0]?.[0].id
      );
      vi.advanceTimersByTime(5000);
      expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
    }
  );

  it("flushes finalized speech but resumes without waiting for another acknowledgement", async () => {
    const handle = await harness.start();
    harness.emitAudio();
    harness.receive({
      inputTranscription: { finished: true, text: "Final caption" },
    });
    handle.setInputMuted(true);
    expect(harness.session.sendRealtimeInput).toHaveBeenLastCalledWith({
      audioStreamEnd: true,
    });
    handle.setInputMuted(false);
    harness.emitAudio(0);
    expect(harness.session.sendRealtimeInput).toHaveBeenCalledTimes(2);
    harness.emitAudio(2);
    harness.receive({
      inputTranscription: { finished: true, text: "Speech after alert" },
    });
    vi.advanceTimersByTime(5000);

    expect(harness.session.sendRealtimeInput).toHaveBeenCalledTimes(3);
    expect(harness.callbacks.onCaption).toHaveBeenCalledTimes(2);
    expect(harness.callbacks.onCaption.mock.lastCall?.[0]).toMatchObject({
      final: true,
      text: "Speech after alert",
    });
    expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
  });

  it("accepts a drain boundary while muted without publishing the old caption", async () => {
    const handle = await harness.start();
    harness.emitAudio();
    harness.receive({ inputTranscription: { text: "Old partial" } });
    handle.setInputMuted(true);
    harness.receive({
      inputTranscription: { finished: true, text: "Old final" },
    });
    handle.setInputMuted(false);
    harness.emitAudio(2);
    harness.receive({
      inputTranscription: { finished: true, text: "New speech" },
    });

    expect(harness.session.sendRealtimeInput).toHaveBeenCalledTimes(3);
    expect(
      harness.callbacks.onCaption.mock.calls.map(([caption]) => caption.text)
    ).toStrictEqual(["Old partial", "New speech"]);
  });

  it("fails visibly if a pending partial never reaches its drain boundary", async () => {
    const handle = await harness.start();
    harness.emitAudio();
    harness.receive({ inputTranscription: { text: "Old partial" } });
    handle.setInputMuted(true);
    handle.setInputMuted(false);
    vi.advanceTimersByTime(4999);
    expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(harness.callbacks.onClosed).toHaveBeenCalledExactlyOnceWith(
      "Call screening could not resume after the alert. Start it again."
    );
    expect(harness.track.stop).toHaveBeenCalledOnce();
    expect(harness.session.close).toHaveBeenCalledOnce();
  });

  it("stop cleans up once and suppresses onClosed and all late activity", async () => {
    const handle = await harness.start();
    harness.session.close.mockImplementation(() => {
      harness.connection().callbacks.onclose({ reason: "Local shutdown" });
    });
    harness.emitAudio();
    harness.receive({ inputTranscription: { text: "Pending caption" } });
    handle.stop();
    handle.stop();
    handle.setInputMuted(true);
    harness.emitAudio();
    harness.receive({
      inputTranscription: { finished: true, text: "Late caption" },
    });
    harness.connection().callbacks.onerror();
    vi.advanceTimersByTime(6000);

    expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
    expect(harness.callbacks.onCaption).toHaveBeenCalledOnce();
    expect(harness.session.sendRealtimeInput).toHaveBeenCalledOnce();
    expect(harness.track.stop).toHaveBeenCalledOnce();
    expect(harness.port.close).toHaveBeenCalledOnce();
    expect(harness.worklet.disconnect).toHaveBeenCalledOnce();
    expect(harness.source.disconnect).toHaveBeenCalledOnce();
    expect(harness.capture.close).toHaveBeenCalledOnce();
    expect(harness.session.close).toHaveBeenCalledOnce();
    expect(harness.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(
      "blob:screening-worklet"
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["close", "error"] as const)(
    "remote %s releases resources and notifies once",
    async (event) => {
      const handle = await harness.start();
      harness.emitAudio();
      harness.receive({ inputTranscription: { text: "Pending caption" } });
      harness.session.close.mockImplementation(() => {
        harness.connection().callbacks.onclose({ reason: "Cleanup close" });
      });

      if (event === "close") {
        harness
          .connection()
          .callbacks.onclose({ reason: "Provider disconnected" });
      } else {
        harness.connection().callbacks.onerror();
      }

      harness.connection().callbacks.onerror();
      harness.connection().callbacks.onclose({ reason: "Repeated close" });
      handle.stop();
      harness.emitAudio();
      vi.advanceTimersByTime(6000);

      expect(harness.callbacks.onClosed).toHaveBeenCalledExactlyOnceWith(
        event === "close"
          ? "Provider disconnected"
          : "The call-screening connection had a problem."
      );
      expect(harness.track.stop).toHaveBeenCalledOnce();
      expect(harness.port.close).toHaveBeenCalledOnce();
      expect(harness.worklet.disconnect).toHaveBeenCalledOnce();
      expect(harness.source.disconnect).toHaveBeenCalledOnce();
      expect(harness.capture.close).toHaveBeenCalledOnce();
      expect(harness.session.close).toHaveBeenCalledOnce();
      expect(harness.callbacks.onCaption).toHaveBeenCalledOnce();
      expect(harness.session.sendRealtimeInput).toHaveBeenCalledOnce();
    }
  );

  it("microphone denial rejects startup without opening SDK or audio resources", async () => {
    const denial = new DOMException(
      "Microphone permission denied",
      "NotAllowedError"
    );

    const controller = new AbortController();
    harness.getUserMedia.mockRejectedValueOnce(denial);
    await expect(harness.start({ signal: controller.signal })).rejects.toBe(
      denial
    );
    controller.abort();

    expect(sdk.connect).not.toHaveBeenCalled();
    expect(harness.contextConstruct).not.toHaveBeenCalled();
    expect(harness.createObjectURL).not.toHaveBeenCalled();
    expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("abort rejects pending microphone permission promptly and stops tracks arriving later", async () => {
    const pending = Promise.withResolvers<typeof harness.stream>();
    const controller = new AbortController();
    harness.getUserMedia.mockReturnValueOnce(pending.promise);
    const startup = harness.start({ signal: controller.signal });
    controller.abort();
    await expect(startup).rejects.toMatchObject({ name: "AbortError" });
    expect(harness.track.stop).not.toHaveBeenCalled();
    pending.resolve(harness.stream);
    await pending.promise;

    expect(harness.track.stop).toHaveBeenCalledOnce();
    expect(sdk.connect).not.toHaveBeenCalled();
    expect(harness.contextConstruct).not.toHaveBeenCalled();
    expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
  });

  it("abort rejects pending SDK connect, cleans capture, and closes a late session", async () => {
    const pending = Promise.withResolvers<typeof harness.session>();
    const controller = new AbortController();
    harness.setConnection(pending.promise);
    const startup = harness.start({ signal: controller.signal });
    await harness.connecting;
    controller.abort();
    await expect(startup).rejects.toMatchObject({ name: "AbortError" });

    expect(harness.track.stop).toHaveBeenCalledOnce();
    expect(harness.capture.close).toHaveBeenCalledOnce();
    expect(harness.port.close).toHaveBeenCalledOnce();
    expect(harness.session.close).not.toHaveBeenCalled();
    pending.resolve(harness.session);
    await pending.promise;

    expect(harness.session.close).toHaveBeenCalledOnce();
    expect(harness.track.stop).toHaveBeenCalledOnce();
    expect(harness.capture.close).toHaveBeenCalledOnce();
    expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
  });

  it("a worklet module failure revokes its URL and releases the microphone", async () => {
    const failure = new Error("Worklet module failed to load");
    harness.capture.audioWorklet.addModule.mockRejectedValueOnce(failure);
    await expect(harness.start()).rejects.toBe(failure);

    expect(harness.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(
      "blob:screening-worklet"
    );
    expect(harness.track.stop).toHaveBeenCalledOnce();
    expect(harness.capture.close).toHaveBeenCalledOnce();
    expect(harness.workletConstruct).not.toHaveBeenCalled();
    expect(sdk.connect).not.toHaveBeenCalled();
    expect(harness.callbacks.onClosed).not.toHaveBeenCalled();
  });
});

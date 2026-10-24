/**
 * Gemini Live in the browser with a one-use ephemeral token minted by the
 * backend. The long-lived key never reaches the browser. Microphone audio is
 * sent as 16-bit PCM at the device's own rate (Gemini resamples it); replies
 * arrive as 24 kHz PCM and are played in order. Captions come from the input
 * and output transcriptions. When Gemini calls submit_request, the request
 * goes through the same backend mutation as a typed one; nothing is executed
 * from here.
 *
 * The microphone and audio output are prepared first, while the Speak press
 * still counts as a user gesture; browsers such as Safari keep audio paused
 * when it starts later, after network calls.
 */
import { GoogleGenAI, Modality } from "@google/genai";
import type { LiveServerMessage, Session } from "@google/genai";
import type { CallCaption } from "@lifelink/contracts/call-screening";

const INPUT_RATE = 16_000;
const OUTPUT_RATE = 24_000;

/** AudioWorklet that converts float samples to 16-bit PCM chunks at the context's rate. */
const WORKLET_SOURCE = `
class PcmCapture extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      const pcm = new Int16Array(channel.length);
      for (let i = 0; i < channel.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
    }
    return true;
  }
}
registerProcessor("pcm-capture", PcmCapture);
`;

const toBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";

  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCodePoint(byte);
  }

  return btoa(binary);
};

const fromBase64 = (data: string): Int16Array => {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }

  return new Int16Array(bytes.buffer);
};

interface LiveCallbacks {
  onCaption: (who: "assistant" | "you", text: string) => void;
  onClosed: (reason: string | null) => void;
  onRequest: (request: string) => Promise<string>;
  onSpeaking: (speaking: boolean) => void;
}

interface LiveHandle {
  stop: () => void;
}

/** The microphone and speakers, ready before any network call. */
interface AudioRig {
  capture: AudioContext;
  playback: AudioContext;
  release: () => void;
  stream: MediaStream;
}

/** The microphone could not start; the message is already in plain words. */
class MicrophoneError extends Error {
  override name = "MicrophoneError";
}

/** Plain words for the reasons a microphone can't start. */
/** `name` is the DOMException name getUserMedia rejected with, or "" for anything else. */
const microphoneProblem = (name: string): string => {
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "LifeLink isn't allowed to use the microphone. Allow it in your browser's settings for this site, or type instead.";
  }

  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No microphone was found. Check that one is connected, or type instead.";
  }

  if (name === "NotReadableError") {
    return "Another app is using the microphone. Close it and try again, or type instead.";
  }

  return "The microphone didn't start. Please try again, or type instead.";
};

const closeQuietly = async (context: AudioContext): Promise<void> => {
  try {
    await context.close();
  } catch {
    // Already closing; nothing else holds the device.
  }
};

/**
 * Ask for the microphone and wake both audio contexts. Call it straight from
 * the Speak press. Throws a MicrophoneError with a plain message when it can't start.
 * Aborting `signal` gives everything back at once, even mid-prompt.
 */
const prepareAudio = async (signal: AbortSignal): Promise<AudioRig> => {
  const contexts: AudioContext[] = [];
  let stream: MediaStream | null = null;

  // Everything acquired so far goes back on any failure, and on release.
  const releaseAll = (): void => {
    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }

    for (const context of contexts) {
      if (context.state !== "closed") {
        void closeQuietly(context);
      }
    }
  };

  // Stop can come while the browser is still asking for permission.
  signal.addEventListener("abort", releaseAll, { once: true });

  const stopIfAborted = (): void => {
    if (signal.aborted) {
      releaseAll();
      throw new DOMException("Voice was stopped.", "AbortError");
    }
  };

  try {
    // Created before any await, so the press still counts as a user gesture.
    const capture = new AudioContext();

    contexts.push(capture);
    const playback = new AudioContext({ sampleRate: OUTPUT_RATE });

    contexts.push(playback);

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    stopIfAborted();
    await Promise.all([capture.resume(), playback.resume()]);
    stopIfAborted();

    let released = false;

    return {
      capture,
      playback,
      release: () => {
        if (!released) {
          released = true;
          releaseAll();
        }
      },
      stream,
    };
  } catch (error) {
    releaseAll();
    throw new MicrophoneError(
      microphoneProblem(error instanceof DOMException ? error.name : ""),
      { cause: error }
    );
  }
};

const startLiveSession = async (
  rig: AudioRig,
  token: string,
  model: string,
  callbacks: LiveCallbacks
): Promise<LiveHandle> => {
  const { capture, playback, stream } = rig;

  const ai = new GoogleGenAI({
    apiKey: token,
    httpOptions: { apiVersion: "v1beta" },
  });

  let playhead = playback.currentTime;
  let session: Session | null = null;
  let stopped = false;

  const play = (data: string): void => {
    const pcm = fromBase64(data);
    const buffer = playback.createBuffer(1, pcm.length, OUTPUT_RATE);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < pcm.length; index += 1) {
      channel[index] = (pcm[index] ?? 0) / 0x80_00;
    }

    const source = playback.createBufferSource();

    source.buffer = buffer;
    source.connect(playback.destination);
    playhead = Math.max(playhead, playback.currentTime);
    source.start(playhead);
    playhead += buffer.duration;
    callbacks.onSpeaking(true);
    source.addEventListener("ended", () => {
      if (playback.currentTime >= playhead - 0.05) {
        callbacks.onSpeaking(false);
      }
    });
  };

  /** Plays the model's audio and shows both sides' captions. */
  const present = (content: LiveServerMessage["serverContent"]): void => {
    for (const part of content?.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) {
        play(part.inlineData.data);
      }
    }

    if (content?.inputTranscription?.text) {
      callbacks.onCaption("you", content.inputTranscription.text);
    }

    if (content?.outputTranscription?.text) {
      callbacks.onCaption("assistant", content.outputTranscription.text);
    }
  };

  const handle = async (message: LiveServerMessage): Promise<void> => {
    present(message.serverContent);

    for (const call of message.toolCall?.functionCalls ?? []) {
      const request = call.args?.request;
      const text = String(request ?? "").trim();
      let result = "Nothing was prepared because the request was empty.";

      if (call.name === "submit_request" && text.length > 0) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- tool calls are answered one at a time, in order.
        result = await callbacks.onRequest(text);
      }

      session?.sendToolResponse({
        functionResponses: [
          { id: call.id, name: call.name, response: { result } },
        ],
      });
    }
  };

  let source: MediaStreamAudioSourceNode | null = null;
  let worklet: AudioWorkletNode | null = null;

  // Stopping can come from the person, the server closing, or an error; it runs once.
  const stop = (): void => {
    if (stopped) {
      return;
    }

    stopped = true;
    worklet?.disconnect();
    source?.disconnect();
    rig.release();
    session?.close();
    session = null;
  };

  // Every step that can fail after the microphone is open is guarded, so a failure closes the socket too.
  try {
    session = await ai.live.connect({
      callbacks: {
        onclose: (event) => {
          if (!stopped) {
            stop();
            callbacks.onClosed(event.reason || null);
          }
        },
        onerror: () => {
          if (!stopped) {
            stop();
            callbacks.onClosed("The voice connection had a problem.");
          }
        },
        onmessage: (message) => {
          void handle(message);
        },
      },
      config: {
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        responseModalities: [Modality.AUDIO],
      },
      model,
    });

    const moduleUrl = URL.createObjectURL(
      new Blob([WORKLET_SOURCE], { type: "text/javascript" })
    );

    try {
      await capture.audioWorklet.addModule(moduleUrl);
    } finally {
      URL.revokeObjectURL(moduleUrl);
    }

    source = capture.createMediaStreamSource(stream);
    worklet = new AudioWorkletNode(capture, "pcm-capture");

    const mimeType = `audio/pcm;rate=${capture.sampleRate}`;

    worklet.port.addEventListener(
      "message",
      (event: MessageEvent<ArrayBuffer>) => {
        session?.sendRealtimeInput({
          audio: { data: toBase64(event.data), mimeType },
        });
      }
    );
    worklet.port.start();
    source.connect(worklet);
  } catch (error) {
    stop();
    throw error;
  }

  return { stop };
};

interface CallScreeningCallbacks {
  onCaption: (caption: CallCaption) => void;
  onClosed: (reason: string | null) => void;
}

interface CallScreeningHandle extends LiveHandle {
  setInputMuted: (muted: boolean) => void;
}

interface CallScreeningOptions {
  inputMuted?: boolean;
  /** Abort pending permission/connection work as well as an established session. */
  signal?: AbortSignal;
}

const CAPTION_SETTLE_MS = 1500;
const INPUT_DRAIN_TIMEOUT_MS = 5000;

/** Silent output keeps the capture graph running without playing the microphone. */
const SCREENING_WORKLET_SOURCE = `
class ScreeningCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.muted = true;
    this.epoch = 0;
    this.cursor = 0;
    this.pcm = new Int16Array(2048);
    this.port.onmessage = ({ data }) => {
      this.muted = data.muted;
      this.epoch = data.epoch;
      this.cursor = 0;
    };
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel || this.muted) return true;
    for (const sample of channel) {
      const s = Math.max(-1, Math.min(1, sample));
      this.pcm[this.cursor++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.cursor === this.pcm.length) {
        const buffer = this.pcm.buffer;
        this.port.postMessage({ buffer, epoch: this.epoch }, [buffer]);
        this.pcm = new Int16Array(2048);
        this.cursor = 0;
      }
    }
    return true;
  }
}
registerProcessor("screening-capture", ScreeningCapture);
`;

const closeCaptureContext = async (context: AudioContext): Promise<void> => {
  try {
    await context.close();
  } catch {
    // A browser shutdown or another cleanup path may have closed it already.
  }
};

/**
 * Passive input-only transport. The backend token locks the silent, tool-free
 * configuration. Model output is deliberately never read or played here.
 * Mute before playing an alert and unmute only after its acoustic tail.
 */
const startCallScreeningSession = async (
  token: string,
  model: string,
  callbacks: CallScreeningCallbacks,
  options: CallScreeningOptions = {}
): Promise<CallScreeningHandle> => {
  const abortError = new DOMException(
    "Call screening was stopped.",
    "AbortError"
  );

  options.signal?.throwIfAborted();
  const listenerAbort = new AbortController();

  let closed = false;
  let started = false;
  let startedAt = 0;
  let inputMuted = options.inputMuted ?? false;
  let epoch = 0;
  let sentAudio = false;
  let draining = false;
  let session: Session | null = null;
  let stream: MediaStream | null = null;
  let capture: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let worklet: AudioWorkletNode | null = null;
  let moduleUrl: string | null = null;
  let caption: CallCaption | null = null;
  let captionSequence = 0;
  let hasInterim = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let drainTimer: ReturnType<typeof setTimeout> | undefined;
  let rejectCancelled: ((error: Error) => void) | undefined;

  // oxlint-disable-next-line promise/avoid-new -- adapt cancellation events while browser permission/SDK promises are pending.
  const cancelled = new Promise<never>((_resolve, reject) => {
    rejectCancelled = reject;
  });

  const resetCaption = (): void => {
    clearTimeout(settleTimer);
    caption = null;
    hasInterim = false;
  };

  const cleanup = (): void => {
    listenerAbort.abort();
    clearTimeout(drainTimer);
    resetCaption();

    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }

    stream = null;

    if (worklet) {
      worklet.port.close();
      worklet.disconnect();
      worklet = null;
    }

    source?.disconnect();
    source = null;

    if (capture) {
      void closeCaptureContext(capture);
      capture = null;
    }

    if (moduleUrl) {
      URL.revokeObjectURL(moduleUrl);
      moduleUrl = null;
    }

    const connection = session;
    session = null;
    connection?.close();
  };

  const stop = (): void => {
    if (closed) {
      return;
    }

    closed = true;
    cleanup();
    rejectCancelled?.(abortError);
  };

  const fail = (reason: string | null): void => {
    if (closed) {
      return;
    }

    closed = true;
    cleanup();
    rejectCancelled?.(new Error(reason ?? "Call screening disconnected."));

    if (started) {
      callbacks.onClosed(reason);
    }
  };

  const ensureActive = (): void => {
    if (closed) {
      // Resources may arrive after Stop while permission/connect was pending.
      cleanup();
      throw abortError;
    }
  };

  const finalizeCaption = (): void => {
    const completed = caption;
    resetCaption();

    if (completed && !closed && !inputMuted && !draining) {
      callbacks.onCaption({ ...completed, final: true });
    }
  };

  const receive = (message: LiveServerMessage): void => {
    const content = message.serverContent;

    if (closed || !content) {
      return;
    }

    const ended = content.inputTranscription?.finished || content.turnComplete;

    if (draining) {
      if (ended) {
        draining = false;
        clearTimeout(drainTimer);
      }

      return;
    }

    if (inputMuted || !sentAudio) {
      return;
    }

    const input = content.inputTranscription;
    const interim = content.interimInputTranscription;
    const text = input?.text ?? interim?.text;

    if (text) {
      if (!caption) {
        captionSequence += 1;
      }

      caption ??= {
        final: false,
        id: `call-caption-${captionSequence}`,
        speaker: "unknown",
        text: "",
        timeMs: Math.max(0, Math.round(performance.now() - startedAt)),
      };
      // Interim hypotheses replace one another; traditional input transcripts
      // are deltas, including their original whitespace and repeated words.
      caption = {
        ...caption,
        text: interim || hasInterim ? text : caption.text + text,
      };
      hasInterim ||= Boolean(interim);
      clearTimeout(settleTimer);

      if (!ended) {
        // Some Live models omit finished when staying silent. Settle the display
        // segment after a transcription gap; this is not speaker diarization.
        settleTimer = setTimeout(finalizeCaption, CAPTION_SETTLE_MS);
        callbacks.onCaption({ ...caption });
      }
    }

    if (ended) {
      finalizeCaption();
    }
  };

  const setInputMuted = (muted: boolean): void => {
    if (closed || inputMuted === muted) {
      return;
    }

    inputMuted = muted;
    epoch += 1;
    clearTimeout(drainTimer);
    const hadPendingCaption = caption !== null;
    resetCaption();

    for (const track of stream?.getAudioTracks() ?? []) {
      track.enabled = !muted;
    }

    worklet?.port.postMessage({ epoch, muted }, []);

    if (muted && sentAudio) {
      sentAudio = false;
      // A finalized caption has no pending transcription to drain. Flushing
      // silence need not produce another server boundary acknowledgement.
      draining = hadPendingCaption;

      try {
        session?.sendRealtimeInput({ audioStreamEnd: true });
      } catch {
        fail("Call screening lost its connection.");
      }
    }

    if (!muted && draining) {
      // Never analyze the old segment after an alert. If the provider cannot
      // flush it, fail visibly instead of leaving a silently stalled monitor.
      drainTimer = setTimeout(() => {
        fail(
          "Call screening could not resume after the alert. Start it again."
        );
      }, INPUT_DRAIN_TIMEOUT_MS);
    }
  };

  const sendAudio = (
    event: MessageEvent<{ buffer: ArrayBuffer; epoch: number }>
  ): void => {
    if (
      closed ||
      !started ||
      inputMuted ||
      draining ||
      event.data.epoch !== epoch
    ) {
      return;
    }

    try {
      session?.sendRealtimeInput({
        audio: {
          data: toBase64(event.data.buffer),
          mimeType: `audio/pcm;rate=${capture?.sampleRate ?? INPUT_RATE}`,
        },
      });
      sentAudio = true;
    } catch {
      fail("Call screening lost its connection.");
    }
  };

  const initialize = async (): Promise<CallScreeningHandle> => {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    ensureActive();

    for (const track of stream.getAudioTracks()) {
      track.enabled = !inputMuted;
      track.addEventListener(
        "ended",
        () => {
          fail(
            "The microphone stopped. Start call screening again to reconnect."
          );
        },
        { signal: listenerAbort.signal }
      );
    }

    capture = new AudioContext({ sampleRate: INPUT_RATE });
    moduleUrl = URL.createObjectURL(
      new Blob([SCREENING_WORKLET_SOURCE], { type: "text/javascript" })
    );
    await capture.audioWorklet.addModule(moduleUrl);
    ensureActive();
    URL.revokeObjectURL(moduleUrl);
    moduleUrl = null;
    source = capture.createMediaStreamSource(stream);
    worklet = new AudioWorkletNode(capture, "screening-capture");
    worklet.port.addEventListener("message", sendAudio, {
      signal: listenerAbort.signal,
    });
    worklet.port.start();
    worklet.port.postMessage({ epoch, muted: inputMuted }, []);
    source.connect(worklet);
    worklet.connect(capture.destination);
    await capture.resume();
    ensureActive();

    const ai = new GoogleGenAI({
      apiKey: token,
      httpOptions: { apiVersion: "v1beta" },
    });

    session = await ai.live.connect({
      callbacks: {
        onclose: (event) => fail(event.reason || null),
        onerror: () => fail("The call-screening connection had a problem."),
        onmessage: receive,
      },
      // Keep automatic VAD enabled: audioStreamEnd requires it. The token owns
      // system instructions/proactivity/tools; never request output captions.
      config: {
        inputAudioTranscription: {},
        responseModalities: [Modality.AUDIO],
      },
      model,
    });
    ensureActive();
    startedAt = performance.now();
    started = true;

    return { setInputMuted, stop };
  };

  options.signal?.addEventListener("abort", stop, {
    once: true,
    signal: listenerAbort.signal,
  });

  try {
    return await Promise.race([initialize(), cancelled]);
  } catch (error) {
    stop();
    throw error;
  }
};

export {
  MicrophoneError,
  prepareAudio,
  startCallScreeningSession,
  startLiveSession,
};

export type {
  AudioRig,
  CallScreeningCallbacks,
  CallScreeningHandle,
  CallScreeningOptions,
  LiveHandle,
};

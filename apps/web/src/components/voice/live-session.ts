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

export { MicrophoneError, prepareAudio, startLiveSession };

export type { AudioRig, LiveHandle };

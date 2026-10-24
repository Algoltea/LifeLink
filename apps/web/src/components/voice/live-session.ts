/**
 * Gemini Live in the browser with a one-use ephemeral token minted by the
 * backend. The long-lived key never reaches the browser. Microphone audio is
 * sent as 16 kHz 16-bit PCM; replies arrive as 24 kHz PCM and are played in
 * order. Captions come from the input and output transcriptions. When Gemini
 * calls submit_request, the request goes through the same backend mutation
 * as a typed one; nothing is executed from here.
 */
import { GoogleGenAI, Modality } from "@google/genai";
import type { LiveServerMessage, Session } from "@google/genai";

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

const startLiveSession = async (
  token: string,
  model: string,
  callbacks: LiveCallbacks
): Promise<LiveHandle> => {
  const ai = new GoogleGenAI({
    apiKey: token,
    httpOptions: { apiVersion: "v1beta" },
  });

  const playback = new AudioContext({ sampleRate: OUTPUT_RATE });
  let playhead = playback.currentTime;
  let session: Session | null = null;

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

  session = await ai.live.connect({
    callbacks: {
      onclose: (event) => callbacks.onClosed(event.reason || null),
      onerror: () => callbacks.onClosed("The voice connection had a problem."),
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

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });

  const capture = new AudioContext({ sampleRate: INPUT_RATE });

  const moduleUrl = URL.createObjectURL(
    new Blob([WORKLET_SOURCE], { type: "text/javascript" })
  );

  await capture.audioWorklet.addModule(moduleUrl);
  URL.revokeObjectURL(moduleUrl);

  const source = capture.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(capture, "pcm-capture");

  worklet.port.addEventListener(
    "message",
    (event: MessageEvent<ArrayBuffer>) => {
      session?.sendRealtimeInput({
        audio: {
          data: toBase64(event.data),
          mimeType: `audio/pcm;rate=${INPUT_RATE}`,
        },
      });
    }
  );
  worklet.port.start();
  source.connect(worklet);

  return {
    stop: () => {
      for (const track of stream.getTracks()) {
        track.stop();
      }

      worklet.disconnect();
      source.disconnect();
      void capture.close();
      void playback.close();
      session?.close();
      session = null;
    },
  };
};

export { startLiveSession };

export type { LiveHandle };

/** A bundled spoken alert: no speech service, microphone, or model output. */
interface CallAlertAudio {
  close: () => void;
  play: (onEnded: () => void) => Promise<boolean>;
  ready: Promise<void>;
  stop: () => void;
}

const createCallAlertAudio = (): CallAlertAudio => {
  // Construct and resume in the Start button's gesture, before any network await.
  const context = new AudioContext();
  let buffer: AudioBuffer | null = null;
  let source: AudioBufferSourceNode | null = null;
  let closed = false;
  let playbackGeneration = 0;
  const controller = new AbortController();
  const resumed = context.resume();

  const ready = (async () => {
    await resumed;

    const response = await fetch("/scam-alert.wav", {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("The spoken alert could not be loaded.");
    }

    buffer = await context.decodeAudioData(await response.arrayBuffer());
  })();

  const stop = (): void => {
    playbackGeneration += 1;
    const previous = source;
    source = null;

    if (previous !== null) {
      previous.stop();
      previous.disconnect();
    }
  };

  return {
    close: () => {
      if (closed) {
        return;
      }

      closed = true;
      controller.abort();
      stop();
      void context.close();
    },
    play: async (onEnded) => {
      stop();
      const attempt = playbackGeneration;

      try {
        await ready;

        if (closed || attempt !== playbackGeneration || buffer === null) {
          return false;
        }

        await context.resume();

        if (
          closed ||
          attempt !== playbackGeneration ||
          context.state !== "running"
        ) {
          return false;
        }

        const next = context.createBufferSource();
        source = next;
        next.buffer = buffer;
        next.connect(context.destination);
        next.addEventListener(
          "ended",
          () => {
            next.disconnect();

            if (source === next && attempt === playbackGeneration) {
              source = null;
              onEnded();
            }
          },
          { once: true }
        );

        next.start();

        return true;
      } catch {
        return false;
      }
    },
    ready,
    stop,
  };
};

export { createCallAlertAudio };

export type { CallAlertAudio };

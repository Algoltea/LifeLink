// @vitest-environment happy-dom

import { Live, LiveServerMessage } from "@google/genai";
import type { LiveConnectParameters, Session } from "@google/genai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { currentMessages } from "@/i18n/locale";

import { startLiveSession } from "./live-session";
import type { AudioRig, LiveCallbacks } from "./live-session";

describe("Live transport startup termination", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["onerror", "onclose"] as const)(
    "closes a connection returned after SDK %s terminated startup",
    async (event) => {
      const close = vi.fn<() => void>();
      const release = vi.fn<() => void>();

      const addModule = vi
        .fn<AudioWorklet["addModule"]>()
        .mockRejectedValue(new Error("Audio context already released"));

      const onClosed = vi.fn<LiveCallbacks["onClosed"]>();
      const onCaption = vi.fn<NonNullable<LiveCallbacks["onCaption"]>>();

      // SAFETY: this intentionally partial browser double exercises termination
      // before capture starts. Only playback.currentTime and release are used;
      // addModule detects accidental continuation. No native audio API is created.
      // oxlint-disable-next-line anti-slop/no-chained-type-assertions -- partial native browser fixture; full AudioContext creation would open real audio resources.
      const rig = {
        capture: { audioWorklet: { addModule } },
        playback: { currentTime: 0 },
        release,
        stream: {},
      } as unknown as AudioRig;

      // SAFETY: this intentionally partial SDK double is returned only after
      // termination, when close is the sole valid operation. SDK private fields
      // and I/O methods are omitted so no real connection can be used.
      // oxlint-disable-next-line anti-slop/no-chained-type-assertions -- partial SDK fixture cannot implement the class's private fields without constructing a real session.
      const connection = { close } as unknown as Session;

      vi.spyOn(Live.prototype, "connect").mockImplementation(
        async ({ callbacks }: LiveConnectParameters) => {
          const message = new LiveServerMessage();
          message.serverContent = {
            inputTranscription: { text: "Heard request" },
            outputTranscription: { text: "Spoken reply" },
          };
          callbacks.onmessage(message);

          if (event === "onerror") {
            callbacks.onerror?.(new ErrorEvent("error"));
          } else {
            callbacks.onclose?.(
              new CloseEvent("close", { reason: "Closed before ready" })
            );
          }

          return await Promise.resolve(connection);
        }
      );
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-worklet");
      vi.spyOn(URL, "revokeObjectURL").mockReturnValue();

      const listeners: LiveCallbacks = {
        onClosed,
        onRequest: vi.fn<LiveCallbacks["onRequest"]>(),
        onSpeaking: vi.fn<LiveCallbacks["onSpeaking"]>(),
      };

      // Exercise both the caption consumer and Ask's omitted callback.
      if (event === "onerror") {
        listeners.onCaption = onCaption;
      }

      await expect(
        startLiveSession(rig, "mock-only-token", "mock-only-model", listeners)
      ).rejects.toThrow(currentMessages().voice.connectionProblem);

      expect([
        release.mock.calls.length,
        onClosed.mock.calls.length,
        close.mock.calls.length,
      ]).toStrictEqual([1, 1, 1]);
      expect(addModule).not.toHaveBeenCalled();

      const expectedCaptions =
        event === "onerror"
          ? [
              ["you", "Heard request"],
              ["assistant", "Spoken reply"],
            ]
          : [];

      expect(onCaption.mock.calls).toStrictEqual(expectedCaptions);
    }
  );
});

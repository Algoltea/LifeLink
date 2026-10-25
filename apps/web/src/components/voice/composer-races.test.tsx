// @vitest-environment happy-dom
// These isolated lifecycle tests replace Convex, app context, and microphone
// boundaries so no permission prompt, socket, or real provider request can occur.
// Partial module doubles keep the production Composer API unchanged.

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor } from "@/i18n/locale";

import { Composer } from "./composer";
import type { AudioRig, LiveCallbacks } from "./live-session";

interface SessionCredentials {
  model: string;
  token: string;
}

const mocks = vi.hoisted(() => ({
  // SAFETY: starts absent and is assigned only the typed startLiveSession callbacks.
  callbacks: undefined as LiveCallbacks | undefined,
  createSession: vi.fn<() => Promise<SessionCredentials>>(),
  online: true,
  prepareAudio: vi.fn<() => Promise<{ release: () => void }>>(),
  release: vi.fn<() => void>(),
  stopSession: vi.fn<() => void>(),
  submit: vi.fn<() => Promise<string>>(),
}));

/* oxlint-disable anti-slop/no-module-mocking, vitest/prefer-import-in-mock -- isolated boundaries described above; do not open real microphones or sockets. */
vi.mock("convex/react", () => ({
  useAction: () => mocks.createSession,
  useMutation: () => mocks.submit,
  useQuery: () => ({
    integrations: [{ configured: true, id: "gemini_live" }],
  }),
}));

vi.mock("@/components/app/offline-queue", () => ({
  useOffline: () => ({
    online: mocks.online,
    queueRequest: vi.fn<() => boolean>(),
  }),
}));

vi.mock("@/components/app/preferences", () => ({
  usePreferences: () => ({
    me: { profile: { _id: "test-owner" } },
    preferences: { captions: true },
  }),
}));

vi.mock("./live-session", () => ({
  MicrophoneError: class MicrophoneError extends Error {
    override name = "MicrophoneError";
  },
  prepareAudio: mocks.prepareAudio,
  startLiveSession: async (
    _rig: AudioRig,
    _token: string,
    _model: string,
    callbacks: LiveCallbacks
  ) => {
    mocks.callbacks = callbacks;

    return await Promise.resolve({ stop: mocks.stopSession });
  },
}));
/* oxlint-enable anti-slop/no-module-mocking, vitest/prefer-import-in-mock */

const settle = async (): Promise<void> => {
  for (let step = 0; step < 8; step += 1) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- flush each dependent startup promise.
    await Promise.resolve();
  }
};

describe("Ask voice session controls", () => {
  let container: HTMLDivElement;
  let root: Root;
  const render = () => root.render(<Composer threadId="test-thread" />);

  const voiceButton = (): HTMLButtonElement => {
    const button = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.getAttribute("aria-pressed") !== null
    );

    if (!button) {
      throw new Error("Expected Speak or Stop control.");
    }

    return button;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    mocks.online = true;
    mocks.prepareAudio.mockResolvedValue({ release: mocks.release });
    mocks.createSession.mockResolvedValue({ model: "mock", token: "mock" });
    mocks.submit.mockResolvedValue("mock-result");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(render);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    mocks.callbacks = undefined;
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  const start = async (): Promise<void> => {
    await act(async () => {
      voiceButton().click();
      await settle();
    });
    expect(voiceButton().textContent).toBe(messagesFor("en").voice.stop);
  };

  const hint = (): Element => {
    const element = container.querySelector('[aria-live="polite"]');

    if (!element) {
      throw new Error("Expected an announced voice status.");
    }

    return element;
  };

  it("announces connecting, listening, speaking, and idle without captions", async () => {
    const credentials = Promise.withResolvers<SessionCredentials>();
    mocks.createSession.mockReturnValueOnce(credentials.promise);
    const t = messagesFor("en").voice;

    const statuses = [hint().textContent];
    await start();
    statuses.push(hint().textContent);

    await act(async () => {
      credentials.resolve({ model: "mock", token: "mock" });
      await settle();
    });
    statuses.push(hint().textContent);
    expect(mocks.callbacks?.onCaption).toBeUndefined();
    act(() => mocks.callbacks?.onSpeaking(true));
    statuses.push(hint().textContent);
    act(() => mocks.callbacks?.onSpeaking(false));
    statuses.push(hint().textContent);
    act(() => voiceButton().click());
    statuses.push(hint().textContent);
    expect(statuses).toStrictEqual([
      t.speakHint,
      t.connecting,
      t.listening,
      t.speaking,
      t.listening,
      t.speakHint,
    ]);
    expect(voiceButton().getAttribute("aria-pressed")).toBe("false");
  });

  it("announces preparation ahead of speaking and returns to listening", async () => {
    await start();
    const result = Promise.withResolvers<string>();
    mocks.submit.mockReturnValueOnce(result.promise);
    act(() => mocks.callbacks?.onSpeaking(true));
    let request: Promise<string> | undefined;

    act(() => {
      request = mocks.callbacks?.onRequest("Prepare a ride request");
    });
    expect(hint().textContent).toBe(messagesFor("en").voice.preparing);
    expect(mocks.submit).toHaveBeenCalledExactlyOnceWith({
      channel: "voice",
      text: "Prepare a ride request",
      threadId: "test-thread",
    });
    expect(voiceButton().disabled).toBeFalsy();
    act(() => mocks.callbacks?.onSpeaking(false));
    expect(hint().textContent).toBe(messagesFor("en").voice.preparing);

    await act(async () => {
      result.resolve("prepared-request");
      await expect(request).resolves.toBe(messagesFor("en").voice.prepared);
    });
    expect(hint().textContent).toBe(messagesFor("en").voice.listening);
  });

  it("keeps Stop usable while connecting offline and discards late credentials", async () => {
    const credentials = Promise.withResolvers<SessionCredentials>();
    mocks.createSession.mockReturnValueOnce(credentials.promise);
    await start();
    mocks.online = false;
    act(render);

    expect(hint().textContent).toBe(messagesFor("en").voice.connecting);
    expect(voiceButton().disabled).toBeFalsy();
    act(() => voiceButton().click());
    expect(hint().textContent).toBe(messagesFor("en").voice.unavailable);
    await act(async () => {
      credentials.resolve({ model: "mock", token: "mock" });
      await settle();
    });

    expect(mocks.callbacks).toBeUndefined();
    expect(voiceButton().disabled).toBeTruthy();
  });

  it("ignores old speaking and close callbacks after a new session starts", async () => {
    await start();
    const previous = mocks.callbacks;
    act(() => voiceButton().click());
    await start();
    act(() => {
      previous?.onSpeaking(true);
      previous?.onClosed(null);
    });

    expect(hint().textContent).toBe(messagesFor("en").voice.listening);
    expect(voiceButton().getAttribute("aria-pressed")).toBe("true");
    expect(mocks.stopSession).toHaveBeenCalledOnce();
  });

  it("keeps Stop usable after going offline while the microphone is active", async () => {
    await start();
    mocks.online = false;
    act(render);

    expect(voiceButton().disabled).toBeFalsy();
    act(() => voiceButton().click());
    expect(mocks.stopSession).toHaveBeenCalledOnce();
  });

  it("ignores a queued submit tool call after Stop", async () => {
    await start();
    act(() => voiceButton().click());

    await act(async () => {
      await mocks.callbacks?.onRequest("Queue this after Stop");
    });

    expect(mocks.submit).not.toHaveBeenCalled();
  });
});

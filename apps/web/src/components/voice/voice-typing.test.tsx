// @vitest-environment happy-dom

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LiveCallbacks } from "./live-session";
import { useVoiceTyping } from "./voice-typing";
import type { VoiceTransport, VoiceTyping } from "./voice-typing";

const settle = async (): Promise<void> => {
  for (let step = 0; step < 5; step += 1) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- each step lets one more promise in the chain resolve.
    await Promise.resolve();
  }
};

/** What the probe last rendered, read back by the assertions. */
interface LatestVoice {
  voice: VoiceTyping | null;
}

describe("voice typing", () => {
  const order: string[] = [];
  const words: string[] = [];
  const release = vi.fn<() => void>();
  const stopSession = vi.fn<() => void>();
  let callbacks: LiveCallbacks | null = null;
  let client: ConvexReactClient;
  let container: HTMLDivElement;
  let root: Root;
  const latest: LatestVoice = { voice: null };

  // A faithful stand-in for the microphone and Gemini Live connection.
  const transport: VoiceTransport = {
    open: async () => {
      order.push("microphone");

      return await Promise.resolve({
        connect: async (_token, _model, given) => {
          order.push("session");
          callbacks = given;

          return await Promise.resolve({ stop: stopSession });
        },
        release,
      });
    },
  };

  const Probe = () => {
    const typing = useVoiceTyping((heard) => words.push(heard), transport);

    useEffect(() => {
      latest.voice = typing;
    });

    return null;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    client = new ConvexReactClient("http://127.0.0.1:3210");
    vi.spyOn(client, "watchQuery").mockReturnValue({
      journal: () => {},
      localQueryResult: () => ({
        demoModeAllowed: true,
        integrations: [
          {
            configured: true,
            id: "gemini_live",
            label: "Gemini Live",
            purpose: "",
          },
        ],
      }),
      onUpdate: () => () => {},
    });
    vi.spyOn(client, "action").mockImplementation(async () => {
      order.push("token");

      return await Promise.resolve({
        expiresAt: 0,
        model: "test-live",
        token: "auth_tokens/test",
      });
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <ConvexProvider client={client}>
          <Probe />
        </ConvexProvider>
      )
    );
  });

  afterEach(async () => {
    act(() => root.unmount());
    await client.close();
    container.remove();
    order.length = 0;
    words.length = 0;
    callbacks = null;
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("opens the microphone before any network call and types only the person's words", async () => {
    expect(latest.voice?.available).toBeTruthy();

    await act(async () => {
      latest.voice?.toggle();
      await settle();
    });

    expect(order).toStrictEqual(["microphone", "token", "session"]);
    expect(latest.voice?.state).toBe("listening");

    act(() => {
      callbacks?.onCaption("you", "Hello");
      callbacks?.onCaption("assistant", "I should stay quiet");
      callbacks?.onCaption("you", " love, see you Sunday");
    });

    expect(words).toStrictEqual(["Hello", "Hello love, see you Sunday"]);
  });

  it("stops the session on Stop and ignores words that arrive after it", async () => {
    await act(async () => {
      latest.voice?.toggle();
      await settle();
    });

    act(() => latest.voice?.toggle());

    expect(stopSession).toHaveBeenCalledOnce();
    expect(latest.voice?.state).toBe("idle");

    act(() => callbacks?.onCaption("you", "late words"));

    expect(words).toStrictEqual([]);
  });

  it("gives the microphone back when leaving the page mid-connection", async () => {
    let finishToken: (() => void) | undefined;

    vi.spyOn(client, "action").mockImplementation(
      async () =>
        // oxlint-disable-next-line promise/avoid-new -- hold the token call open to leave mid-connection.
        await new Promise((resolve) => {
          finishToken = () =>
            resolve({ expiresAt: 0, model: "m", token: "auth_tokens/late" });
        })
    );

    await act(async () => {
      latest.voice?.toggle();
      await settle();
    });

    act(() => root.unmount());
    expect(release).toHaveBeenCalledWith();

    await act(async () => {
      finishToken?.();
      await settle();
    });

    expect(order).not.toContain("session");
    root = createRoot(container);
  });
});

// @vitest-environment happy-dom

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LiveCallbacks, LiveHandle } from "./live-session";
import { useVoiceTyping } from "./voice-typing";
import type { Microphone, VoiceTransport, VoiceTyping } from "./voice-typing";

interface SessionCredentials {
  expiresAt: number;
  model: string;
  token: string;
}

const settle = async (): Promise<void> => {
  for (let step = 0; step < 8; step += 1) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- flush each dependent startup promise.
    await Promise.resolve();
  }
};

describe("voice typing cancellation races", () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: ConvexReactClient;
  let voice: VoiceTyping | undefined;
  let callbacks: LiveCallbacks | undefined;
  const createSession = vi.fn<() => Promise<SessionCredentials>>();
  const words = vi.fn<(words: string) => void>();
  const release = vi.fn<() => void>();
  const stopSession = vi.fn<() => void>();
  const connect = vi.fn<Microphone["connect"]>();
  const open = vi.fn<VoiceTransport["open"]>();
  const transport = { open };

  const Probe = () => {
    const typing = useVoiceTyping(words, transport);

    useEffect(() => {
      voice = typing;
    });

    return null;
  };

  const start = async (): Promise<void> => {
    await act(async () => {
      voice?.toggle();
      await settle();
    });
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    client = new ConvexReactClient("https://voice-race-test.convex.cloud");
    vi.spyOn(client, "watchQuery").mockReturnValue({
      journal: () => {},
      localQueryResult: () => ({
        integrations: [{ configured: true, id: "gemini_live" }],
      }),
      onUpdate: () => () => {},
    });
    vi.spyOn(client, "action").mockImplementation(createSession);
    createSession.mockResolvedValue({
      expiresAt: Date.now() + 60_000,
      model: "test-model",
      token: "auth_tokens/mock-only",
    });
    connect.mockImplementation(async (_token, _model, given) => {
      callbacks = given;

      return await Promise.resolve({ stop: stopSession });
    });
    open.mockResolvedValue({ connect, release });
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
    callbacks = undefined;
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not mint a token after Stop during microphone permission", async () => {
    const permission = Promise.withResolvers<Microphone>();
    open.mockReturnValueOnce(permission.promise);
    await start();

    act(() => voice?.stop());
    await act(async () => {
      permission.resolve({ connect, release });
      await settle();
    });

    expect(createSession).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
    expect(voice?.state).toBe("idle");
  });

  it("closes a session that finishes connecting after Stop", async () => {
    const connection = Promise.withResolvers<LiveHandle>();
    connect.mockImplementationOnce((_token, _model, given) => {
      callbacks = given;

      return connection.promise;
    });
    await start();

    act(() => voice?.stop());
    await act(async () => {
      callbacks?.onCaption?.("you", "cancelled words");
      connection.resolve({ stop: stopSession });
      await settle();
    });

    expect(stopSession).toHaveBeenCalledOnce();
    expect(words).not.toHaveBeenCalled();
    expect(voice?.state).toBe("idle");
  });

  it("does not restore listening if the connection closes during startup", async () => {
    connect.mockImplementationOnce(async (_token, _model, given) => {
      given.onClosed("Disconnected during startup");

      return await Promise.resolve({ stop: stopSession });
    });
    await start();

    expect(voice?.state).toBe("idle");
    expect(stopSession).toHaveBeenCalledOnce();
  });

  it("ignores queued transcription callbacks after the connection closes", async () => {
    await start();
    act(() => callbacks?.onClosed("Disconnected"));
    act(() => callbacks?.onCaption?.("you", "late words"));

    expect(voice?.state).toBe("idle");
    expect(words).not.toHaveBeenCalled();
  });

  it("ignores queued transcription callbacks after connection startup rejects", async () => {
    connect.mockImplementationOnce(async (_token, _model, given) => {
      callbacks = given;

      return await Promise.reject(new Error("Connection startup failed"));
    });
    await start();

    expect(voice?.state).toBe("idle");
    act(() => callbacks?.onCaption?.("you", "late words after rejection"));
    expect(words).not.toHaveBeenCalled();
  });

  it("does not let an old token failure stop a newer session", async () => {
    const oldToken = Promise.withResolvers<SessionCredentials>();
    createSession.mockReturnValueOnce(oldToken.promise);
    await start();
    act(() => voice?.stop());
    await start();

    await act(async () => {
      oldToken.reject(new Error("Old token call failed"));
      await settle();
    });

    expect(voice?.state).toBe("listening");
    expect(stopSession).not.toHaveBeenCalled();
    act(() => callbacks?.onCaption?.("you", "new words"));
    expect(words).toHaveBeenCalledExactlyOnceWith("new words");
  });
});

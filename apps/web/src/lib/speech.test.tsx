// @vitest-environment happy-dom

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexError } from "convex/values";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import { setLocale } from "@/i18n/locale";

import { useSpeech } from "./speech";

const SpeechControl = ({ text = "Read this passage." }: { text?: string }) => {
  const { error, read, status, stop } = useSpeech();

  return (
    <div>
      <button
        onClick={() => {
          void read(text, 0.9);
        }}
        type="button"
      >
        Read
      </button>
      <button onClick={stop} type="button">
        Stop
      </button>
      <output>{error}</output>
      <span data-status="">{status}</span>
    </div>
  );
};

describe("read-aloud failures", () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: ConvexReactClient;
  let synthesize: MockInstance<ConvexReactClient["action"]>;
  let playback: MockInstance<HTMLMediaElement["play"]>;

  const render = async (text?: string) => {
    await act(() => {
      root.render(
        <ConvexProvider client={client}>
          <SpeechControl text={text} />
        </ConvexProvider>
      );
    });
  };

  const read = async () => {
    await act(() => {
      container.querySelector("button")?.click();
    });
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("es");
    client = new ConvexReactClient("http://127.0.0.1:3210");
    synthesize = vi.spyOn(client, "action");
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:speech-test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    playback = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(() => root.unmount());
    await client.close();
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("localizes passage limits and retains the failure across language switches", async () => {
    await render("x".repeat(24_001));
    await read();

    expect(container.querySelector("output")?.textContent).toBe(
      "Ese fragmento es demasiado largo para leerlo de una vez. Elija una sección más corta."
    );
    expect(synthesize).not.toHaveBeenCalled();

    await act(() => setLocale("en"));
    expect(container.querySelector("output")?.textContent).toBe(
      "That passage is too long to read at once. Please choose a shorter section."
    );
  });

  it("localizes missing browser audio without requesting speech", async () => {
    vi.stubGlobal("Audio", null);
    Reflect.deleteProperty(globalThis, "Audio");
    await render();
    await read();

    expect(container.querySelector("output")?.textContent).toBe(
      "Este navegador no puede reproducir audio. Puede seguir leyendo el texto aquí."
    );
    expect(synthesize).not.toHaveBeenCalled();
  });

  it.each([
    [
      "Read-aloud is not set up yet. An OpenRouter key is needed.",
      "La lectura en voz alta todavía no está configurada. Se necesita una clave de OpenRouter.",
    ],
    [
      "Read-aloud is unavailable (429). Please try again later.",
      "La lectura en voz alta no está disponible (429). Inténtelo de nuevo más tarde.",
    ],
    [
      "Read-aloud needs a short pause. Please try again in a minute.",
      "La lectura en voz alta necesita una breve pausa. Inténtelo de nuevo en un minuto.",
    ],
  ])("localizes the fixed backend failure: %s", async (message, expected) => {
    synthesize.mockRejectedValue(
      new ConvexError({ code: "speech_unavailable", message })
    );
    await render();
    await read();

    expect(container.querySelector("output")?.textContent).toBe(expected);
    expect(container.querySelector("[data-status]")?.textContent).toBe("idle");
  });

  it("preserves an unfamiliar provider error in both languages", async () => {
    const message =
      "Provider rejected voice: unfamiliar_voice_47; request abc123";

    synthesize.mockRejectedValue(
      new ConvexError({ code: "speech_unavailable", message })
    );
    await render();
    await read();

    expect(container.querySelector("output")?.textContent).toBe(message);
    await act(() => setLocale("en"));
    expect(container.querySelector("output")?.textContent).toBe(message);
  });

  it("uses the localized fallback when no error message is available", async () => {
    synthesize.mockRejectedValue(null);
    await render();
    await read();

    expect(container.querySelector("output")?.textContent).toBe(
      "La lectura en voz alta no está disponible. Inténtelo de nuevo."
    );
  });

  it("keeps playback running through a locale change and localizes media failure", async () => {
    synthesize.mockResolvedValue({ audio: new ArrayBuffer(1) });
    await render();
    await read();
    expect(container.querySelector("[data-status]")?.textContent).toBe(
      "speaking"
    );

    await act(() => setLocale("en"));
    expect(container.querySelector("[data-status]")?.textContent).toBe(
      "speaking"
    );
    expect(synthesize).toHaveBeenCalledOnce();

    await act(() => setLocale("es"));
    await act(() => {
      const audio = playback.mock.contexts.at(-1);

      if (!(audio instanceof HTMLMediaElement)) {
        throw new Error("Playback did not start an audio element");
      }

      audio.dispatchEvent(new Event("error"));
    });
    expect(container.querySelector("output")?.textContent).toBe(
      "No se pudo reproducir este audio. Inténtelo de nuevo."
    );
    expect(container.querySelector("[data-status]")?.textContent).toBe("idle");
  });

  it("localizes playback timeouts", async () => {
    vi.useFakeTimers();
    synthesize.mockResolvedValue({ audio: new ArrayBuffer(1) });
    await render();
    await read();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });

    expect(container.querySelector("output")?.textContent).toBe(
      "La reproducción de audio dejó de responder. Inténtelo de nuevo."
    );
  });

  it("retains blocked audio for a gesture retry and stops without an error", async () => {
    synthesize.mockResolvedValue({ audio: new ArrayBuffer(1) });
    playback.mockRejectedValueOnce(
      new DOMException("A user gesture is required", "NotAllowedError")
    );
    await render();
    await read();

    expect(container.querySelector("[data-status]")?.textContent).toBe("ready");
    expect(container.querySelector("output")?.textContent).toBe("");

    await act(() => setLocale("en"));
    await read();

    expect(container.querySelector("[data-status]")?.textContent).toBe(
      "speaking"
    );
    expect(synthesize).toHaveBeenCalledOnce();

    await act(() => {
      container.querySelectorAll("button")[1]?.click();
    });
    expect({
      error: container.querySelector("output")?.textContent,
      status: container.querySelector("[data-status]")?.textContent,
    }).toStrictEqual({ error: "", status: "idle" });
  });
});

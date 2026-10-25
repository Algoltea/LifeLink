// @vitest-environment happy-dom

import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OfflineQueueProvider } from "@/components/app/offline-queue";
import { PreferencesProvider } from "@/components/app/preferences";
import { messagesFor, setLocale } from "@/i18n/locale";

import { SendAllPanel } from "./inline-action-review";

const words = messagesFor("en");
const t = words.tasks.sendAll;

// SAFETY: fixed fixture identifier; all Convex transport is stubbed below.
const taskId = "task-1" as Id<"tasks">;

const message = (
  id: string,
  contactName: string,
  channel: "discord" | "imessage"
) => ({
  // SAFETY: fixed fixture identifier; no live backend receives it.
  action: { _id: id as Id<"actions"> },
  current: {
    details: {
      address: "",
      body: `Dinner is at six, ${contactName}.`,
      channel,
      contactId: `contact-${id}`,
      contactName,
      kind: "send_message" as const,
      photoIds: [],
    },
    fingerprint: `fingerprint-${id}`,
    version: 1,
  },
});

const ruth = message("b", "Ruth", "discord");
const sam = message("a", "Sam", "imessage");

// The offline queue reads auth state; nobody needs to be signed in here.
const useSignedOut = () => ({
  fetchAccessToken: async () => await Promise.resolve(null),
  isAuthenticated: false,
  isLoading: false,
});

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");

  // Keep the real hooks and providers; replace only Convex transport.
  vi.spyOn(client, "watchQuery").mockImplementation((...args) => {
    const [query] = args;
    const name = getFunctionName(query);

    if (name !== "profiles:me") {
      throw new Error(`Unexpected query: ${name}`);
    }

    return {
      journal: () => {},
      localQueryLogs: () => [],
      localQueryResult: () => {},
      onUpdate: () => () => {},
    };
  });
  const mutate = vi.spyOn(client, "mutation").mockResolvedValue(null);

  return { client, mutate };
};

describe("review and send all", () => {
  let container: HTMLDivElement;
  let root: Root;
  let backend: ReturnType<typeof createBackend>;

  const button = (text: string): HTMLButtonElement => {
    const element = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent.trim() === text
    );

    if (element === undefined) {
      throw new Error(`Missing test button: ${text}`);
    }

    return element;
  };

  const render = (blocked = false) =>
    act(() =>
      root.render(
        <ConvexProviderWithAuth client={backend.client} useAuth={useSignedOut}>
          <PreferencesProvider>
            <OfflineQueueProvider>
              <SendAllPanel
                blocked={blocked}
                busy={false}
                hasEdits={false}
                onBusyChange={() => {}}
                practice={false}
                taskId={taskId}
                waiting={[ruth, sam]}
              />
            </OfflineQueueProvider>
          </PreferencesProvider>
        </ConvexProviderWithAuth>
      )
    );

  beforeEach(() => {
    setLocale("en");
    backend = createBackend();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    act(() => root.unmount());
    container.remove();
    await backend.client.close();
    vi.restoreAllMocks();
  });

  it("lists every message before sending them all in one approval", async () => {
    render();

    act(() => button(t.review(2)).click());

    expect(backend.mutate).not.toHaveBeenCalled();
    expect(document.activeElement?.textContent).toBe(t.summaryTitle(2));
    expect(
      [...container.querySelectorAll("li")].map((item) => item.textContent)
    ).toStrictEqual([
      `${t.recipient("Ruth", words.threads.channels.discord)}Dinner is at six, Ruth.`,
      `${t.recipient("Sam", words.threads.channels.imessage)}Dinner is at six, Sam.`,
    ]);

    await act(async () => {
      button(t.confirm(2)).click();
      await Promise.resolve();
    });

    expect(backend.mutate).toHaveBeenCalledOnce();
    expect(backend.mutate.mock.calls[0]?.[1]).toStrictEqual({
      messages: [
        { actionId: "b", fingerprint: "fingerprint-b", version: 1 },
        { actionId: "a", fingerprint: "fingerprint-a", version: 1 },
      ],
      // A scripted click has no pointer detail, like Enter on a focused button.
      method: "keyboard",
      taskId,
    });
  });

  it("goes back without sending anything", () => {
    render();

    act(() => button(t.review(2)).click());
    act(() => button(t.back).click());

    expect(backend.mutate).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button(t.review(2)));
  });

  it("waits until every message is ready", () => {
    render(true);

    expect(button(t.review(2)).disabled).toBeTruthy();
    expect(container.textContent).toContain(t.resolveFirst);
  });
});

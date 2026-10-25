// @vitest-environment happy-dom

import type { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { connectionDefinitions } from "@lifelink/contracts/integrations";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import type { FunctionReturnType } from "convex/server";
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "@/components/app/preferences";
import { DocumentsScreen } from "@/components/documents/documents-screen";
import { FilePreview } from "@/components/documents/file-preview";
import type { DriveFile } from "@/components/documents/file-preview";
import { messagesFor, setLocale } from "@/i18n/locale";

import { ConnectionCallback } from "./connection-callback";
import { ConnectionsScreen } from "./connections-screen";

const timestamp = Date.UTC(2026, 9, 25, 12);

const meFor = (
  demoMode: boolean,
  presentationDemo?: boolean
): FunctionReturnType<typeof api.profiles.me> => ({
  demoModeAllowed: true,
  needsOnboarding: false,
  preferences: null,
  profile: {
    _creationTime: timestamp,
    // SAFETY: fixed fixture identifier; all Convex transport is stubbed.
    _id: "presentation-test" as Id<"profiles">,
    assistantThreadId: null,
    authUserId: "presentation-test",
    city: null,
    createdAt: timestamp,
    demoMode,
    displayName: "Elena Rivera",
    postalCode: null,
    preferredName: "Elena",
    presentationDemo,
    role: "owner",
    signOffName: null,
    timeZone: "America/New_York",
  },
});

const connectionsFor = (
  active: boolean
): FunctionReturnType<typeof api.connections.list> => ({
  demoMode: true,
  demoModeAllowed: true,
  providers: connectionDefinitions.map((definition) => ({
    accountLabel: null,
    connectionId: null,
    definition,
    developerReady: true,
    hasSavedRealConnection: false,
    lastError: null,
    mode: "simulated",
    status: active ? "active" : null,
  })),
});

const file: DriveFile = {
  id: "saved-note",
  kind: "Document",
  modifiedAt: null,
  name: "Appointment notes",
  preview: { text: "Bring your medication list.", type: "text" },
  url: "https://drive.google.com/file/d/test/view",
};

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");

  const values = new Map<string, unknown>([
    ["profiles:me", meFor(true, true)],
    ["connections:list", connectionsFor(true)],
  ]);

  // Keep the real components, profile context, and hooks; stub transport only.
  vi.spyOn(client, "watchQuery").mockImplementation((...args) => {
    const [query] = args;

    return {
      journal: () => {},
      localQueryLogs: () => [],
      localQueryResult: () => values.get(getFunctionName(query)),
      onUpdate: () => () => {},
    };
  });

  const action = vi.spyOn(client, "action").mockImplementation((...args) => {
    const [reference] = args;
    const name = getFunctionName(reference);

    if (name === "drive:files") {
      return Promise.resolve({
        files: [],
        mode: "simulated",
        nextCursor: null,
      });
    }

    if (name === "connections:complete") {
      return Promise.resolve({ message: "Connected", ok: true });
    }

    throw new Error(`Unexpected action: ${name}`);
  });

  const mutation = vi.spyOn(client, "mutation").mockResolvedValue(null);

  return { action, client, mutation, values };
};

describe("presentation account integration boundaries", () => {
  let backend: ReturnType<typeof createBackend>;
  let container: HTMLDivElement;
  let root: Root;

  const render = async (children: ReactNode) => {
    await act(() => {
      root.render(
        <ConvexProvider client={backend.client}>
          <PreferencesProvider>{children}</PreferencesProvider>
        </ConvexProvider>
      );
    });
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    backend = createBackend();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(() => root.unmount());
    await backend.client.close();
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("makes connections unavailable without exposing account controls", async () => {
    await render(<ConnectionsScreen />);

    expect(container.textContent).toContain(
      "Connections are unavailable for this account."
    );
    expect(container.textContent).not.toMatch(/practice|sample|simulat/iu);
    expect(container.querySelector("button")).toBeNull();
    expect(backend.action).not.toHaveBeenCalled();
    expect(backend.mutation).not.toHaveBeenCalled();
  });

  it("preserves practice connection labels for an ordinary practice profile", async () => {
    backend.values.set("profiles:me", meFor(true));
    await render(<ConnectionsScreen />);

    expect(container.textContent).toContain(
      messagesFor("en").connections.status.practiceAccount
    );
    expect(container.querySelector("button")).not.toBeNull();
    expect(backend.action).not.toHaveBeenCalled();
  });

  it.each([
    { demoMode: true, presentationDemo: true },
    { demoMode: false, presentationDemo: true },
    { demoMode: true, presentationDemo: undefined },
  ])(
    "blocks OAuth completion with demoMode=$demoMode and presentation=$presentationDemo",
    async ({ demoMode, presentationDemo }) => {
      backend.values.set("profiles:me", meFor(demoMode, presentationDemo));
      await render(
        <ConnectionCallback
          connectedAccountId="oauth-account"
          provider="gmail"
          status="success"
        />
      );

      expect(backend.action).not.toHaveBeenCalled();
      expect(container.textContent).toContain(
        presentationDemo
          ? "Connections are unavailable for this account."
          : messagesFor("en").connections.callback.practice
      );
    }
  );

  it("continues completing OAuth for an ordinary live owner", async () => {
    backend.values.set("profiles:me", meFor(false));
    await render(
      <ConnectionCallback
        connectedAccountId="oauth-account"
        provider="gmail"
        status="success"
      />
    );

    expect(backend.action).toHaveBeenCalledOnce();
    const [reference, args] = backend.action.mock.calls[0] ?? [];
    expect(reference && getFunctionName(reference)).toBe(
      "connections:complete"
    );
    expect(args).toStrictEqual({
      connectedAccountId: "oauth-account",
      provider: "gmail",
    });
  });

  it.each([true, false])(
    "keeps simulated document links blocked with presentation=%s",
    async (presentationDemo) => {
      backend.values.set("profiles:me", meFor(true, presentationDemo));
      await render(
        <FilePreview
          file={file}
          isPractice
          listStaysBeside={() => true}
          timeZone="America/New_York"
        />
      );

      expect(
        container.querySelector('a[href^="https://drive.google.com"]')
      ).toBeNull();

      const openButton = [...container.querySelectorAll("button")].find(
        (button) =>
          button.textContent === messagesFor("en").documents.openInDrive
      );

      expect(openButton?.disabled).toBeTruthy();
      expect(container.textContent).toContain(
        presentationDemo
          ? "Opening this file in Google Drive is unavailable for this account."
          : messagesFor("en").documents.practiceNoLink
      );
      expect(
        container.textContent.includes(messagesFor("en").common.practice)
      ).toBe(!presentationDemo);
    }
  );

  it("keeps real file links available for ordinary live accounts", async () => {
    backend.values.set("profiles:me", meFor(false));
    await render(
      <FilePreview
        file={file}
        isPractice={false}
        listStaysBeside={() => true}
        timeZone="America/New_York"
      />
    );

    expect(container.querySelector("a")?.getAttribute("href")).toBe(file.url);
  });

  it.each([true, false])(
    "preserves ordinary practice Drive copy with active=%s",
    async (active) => {
      backend.values.set("profiles:me", meFor(true));
      backend.values.set("connections:list", connectionsFor(active));
      await render(<DocumentsScreen />);
      const words = messagesFor("en").documents;

      expect(container.textContent).toContain(
        active ? words.practiceConnected : words.connectPracticeHint
      );
    }
  );

  it("shows presentation documents without claiming a connected Google account", async () => {
    await render(<DocumentsScreen />);

    expect(container.textContent).not.toMatch(
      /practice|sample|simulat|connected:/iu
    );
    expect(container.textContent).toContain(
      messagesFor("en").documents.yourFiles
    );
    expect(backend.action).toHaveBeenCalledOnce();
    const [reference] = backend.action.mock.calls[0] ?? [];
    expect(reference && getFunctionName(reference)).toBe("drive:files");
  });

  it("withholds Drive setup when presentation documents are unavailable", async () => {
    backend.values.set("connections:list", connectionsFor(false));
    await render(<DocumentsScreen />);

    expect(container.textContent).toContain(
      "Google Drive connections are unavailable for this account."
    );
    expect(container.querySelector('a[href="/connections"]')).toBeNull();
    expect(container.textContent).not.toMatch(/practice|sample|simulat/iu);
    expect(backend.action).not.toHaveBeenCalled();
  });
});

// @vitest-environment happy-dom

import type {
  Id,
  TableNames,
} from "@lifelink/backend/convex/_generated/dataModel";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OfflineQueueProvider } from "@/components/app/offline-queue";
import { PreferencesProvider } from "@/components/app/preferences";
import { messagesFor, setLocale } from "@/i18n/locale";

import { ActionReview } from "./action-review";
import type { ActionView } from "./action-review";
import { JourneyGauge } from "./journey-gauge";
import type { Step } from "./journey-gauge";

// Better Auth captures fetch when its client is created, before any render.
const authFetch = vi.hoisted(() => {
  const date = "2026-10-25T12:00:00.000Z";
  const userId = "presentation-task-user";

  const session = {
    session: {
      createdAt: date,
      expiresAt: "2026-10-26T12:00:00.000Z",
      id: `${userId}-session`,
      token: "test-session",
      updatedAt: date,
      userId,
    },
    user: {
      createdAt: date,
      email: `${userId}@example.com`,
      emailVerified: true,
      id: userId,
      name: "Ana Example",
      updatedAt: date,
    },
  };

  const request = vi.fn<typeof fetch>().mockImplementation(() => {
    const response = Response.json(session);

    return Promise.resolve(response);
  });

  vi.stubGlobal("fetch", request);

  return request;
});

const fetchAccessToken = (): Promise<null> => Promise.resolve(null);

const useTestAuth = () => ({
  fetchAccessToken,
  isAuthenticated: true,
  isLoading: false,
});

// SAFETY: fixture identifiers only; all submitted mutations are intercepted below.
const id = <Table extends TableNames>(table: Table): Id<Table> =>
  `${table}-presentation-test` as Id<Table>;

const SUMMARY =
  "Practice: the message to Sam was not really sent. A practice reply will arrive shortly.";

const viewFor = (): ActionView => ({
  action: {
    _creationTime: 0,
    _id: id("actions"),
    createdAt: 0,
    currentVersion: 1,
    kind: "send_message",
    mode: "simulated",
    ownerId: id("profiles"),
    status: "succeeded",
    stepId: id("taskSteps"),
    taskId: id("tasks"),
    updatedAt: 0,
  },
  attempts: [],
  blockers: [],
  current: {
    _creationTime: 0,
    _id: id("actionVersions"),
    actionId: id("actions"),
    ambiguities: [],
    createdAt: 0,
    details: {
      address: "sam@example.test",
      body: "Can you drive me on Tuesday?",
      channel: "email",
      contactId: id("contacts"),
      contactName: "Sam",
      kind: "send_message",
      photoIds: [],
    },
    fingerprint: "reviewed-fingerprint",
    proposedBy: "person",
    rationale: null,
    version: 1,
  },
  currentApproval: null,
  granteeNames: [],
  invalidatedApprovals: [],
  previous: null,
  receipts: [
    {
      _creationTime: 0,
      _id: id("providerReceipts"),
      actionId: id("actions"),
      attemptId: id("executionAttempts"),
      mode: "simulated",
      provider: "email",
      providerReference: "sim_test",
      receivedAt: 0,
      summary: SUMMARY,
      url: null,
    },
  ],
  recipientRelationship: "Son",
  versionCount: 1,
});

const step: Step = {
  _id: id("taskSteps"),
  detail: SUMMARY,
  kind: "send_message",
  label: "Message Sam",
  status: "succeeded",
};

describe("presentation task copy", () => {
  let client: ConvexReactClient;

  let me = {
    preferences: null,
    profile: {
      _id: id("profiles"),
      authUserId: "presentation-task-user",
      demoMode: true,
      presentationDemo: false,
    },
  };

  beforeEach(() => {
    me = {
      preferences: null,
      profile: {
        _id: id("profiles"),
        authUserId: "presentation-task-user",
        demoMode: true,
        presentationDemo: false,
      },
    };
    setLocale("en");
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    authFetch.mockClear();
    vi.stubGlobal("fetch", authFetch);
    client = new ConvexReactClient("http://127.0.0.1:3210");
    vi.spyOn(client, "watchQuery").mockReturnValue({
      journal: () => {},
      localQueryResult: () => me,
      onUpdate: () => () => {},
    });
    vi.spyOn(client, "setAuth").mockImplementation((_fetchToken, onChange) =>
      onChange?.(true)
    );
    vi.spyOn(client, "clearAuth").mockImplementation(() => {});
  });

  afterEach(async () => {
    await client.close();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([false, true])(
    "renders account-specific outcomes without changing stored receipts (presentation=%s)",
    (enabled) => {
      me.profile.presentationDemo = enabled;
      const view = viewFor();
      const original = structuredClone(view);

      const markup = renderToStaticMarkup(
        <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
          <PreferencesProvider>
            <ActionReview hue={30} timeZone="America/New_York" view={view} />
          </PreferencesProvider>
        </ConvexProviderWithAuth>
      );

      expect(markup.includes("Practice")).toBe(!enabled);
      expect(markup.includes(SUMMARY)).toBe(!enabled);

      expect(
        markup.includes(
          "Message prepared in LifeLink. Nothing was sent outside LifeLink."
        )
      ).toBe(enabled);

      expect(view).toStrictEqual(original);
      expect({
        mode: view.receipts[0]?.mode,
        summary: view.receipts[0]?.summary,
      }).toStrictEqual({ mode: "simulated", summary: SUMMARY });
    }
  );

  it.each(["horizontal", "vertical"] as const)(
    "keeps %s progress truthful and leaves saved details intact",
    (orientation) => {
      me.profile.presentationDemo = true;

      const markup = renderToStaticMarkup(
        <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
          <PreferencesProvider>
            <JourneyGauge
              mode="simulated"
              orientation={orientation}
              steps={[step]}
            />
          </PreferencesProvider>
        </ConvexProviderWithAuth>
      );

      expect(markup).not.toContain("Practice");
      expect(markup).not.toContain("practice reply");
      expect(markup).toContain("Nothing was sent outside LifeLink.");
      expect(step.detail).toBe(SUMMARY);

      me.profile.presentationDemo = false;
      expect(
        renderToStaticMarkup(
          <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
            <PreferencesProvider>
              <JourneyGauge
                mode="simulated"
                orientation={orientation}
                steps={[step]}
              />
            </PreferencesProvider>
          </ConvexProviderWithAuth>
        )
      ).toContain(SUMMARY);
    }
  );

  it.each(["email_draft", "email_reply"] as const)(
    "claims a mailbox outcome only for a successful live %s",
    (kind) => {
      const externalText =
        kind === "email_draft"
          ? "Saved as a draft in your Gmail."
          : "Sent from your Gmail as a reply";

      for (const mode of ["live", "simulated"] as const) {
        for (const status of [
          "awaiting_approval",
          "executing",
          "failed",
          "cancelled",
          "succeeded",
        ] as const) {
          for (const presentation of [false, true]) {
            me.profile.presentationDemo = presentation;
            me.profile.demoMode = mode === "simulated";
            const view = viewFor();
            view.action.kind = kind;
            view.action.mode = mode;
            view.action.status = status;

            if (view.current === null) {
              throw new Error("Missing fixture version");
            }

            view.current.details =
              kind === "email_draft"
                ? {
                    body: "Thank you",
                    connectionId: "connection-test",
                    kind,
                    provider: "gmail",
                    replyToMessageId: "message-test",
                    subject: "Photos",
                    to: "linda@example.test",
                  }
                : {
                    body: "Thank you",
                    connectionId: "connection-test",
                    inReplyToMessageId: "message-test",
                    kind,
                    provider: "gmail",
                    subject: "Photos",
                    threadId: "thread-test",
                    to: "linda@example.test",
                  };
            view.receipts = [];

            const markup = renderToStaticMarkup(
              <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
                <PreferencesProvider>
                  <OfflineQueueProvider>
                    <ActionReview
                      hue={30}
                      timeZone="America/New_York"
                      view={view}
                    />
                  </OfflineQueueProvider>
                </PreferencesProvider>
              </ConvexProviderWithAuth>
            );

            expect(markup.includes(externalText)).toBe(
              mode === "live" && status === "succeeded"
            );
            expect(markup).toContain("Thank you");
            expect(markup.includes("Practice mode: approving")).toBe(
              mode === "simulated" && !presentation
            );
          }
        }
      }
    }
  );

  it("keeps presentation approval arguments and simulated action mode unchanged", async () => {
    me.profile.presentationDemo = true;
    const view = viewFor();
    view.action.status = "awaiting_approval";
    view.receipts = [];
    const mutate = vi.spyOn(client, "mutation").mockResolvedValue(null);
    const container = document.createElement("div");
    const root = createRoot(container);

    try {
      act(() =>
        root.render(
          <ConvexProviderWithAuth client={client} useAuth={useTestAuth}>
            <PreferencesProvider>
              <OfflineQueueProvider>
                <ActionReview
                  hue={30}
                  timeZone="America/New_York"
                  view={view}
                />
              </OfflineQueueProvider>
            </PreferencesProvider>
          </ConvexProviderWithAuth>
        )
      );

      const approve = [...container.querySelectorAll("button")].find(
        (button) =>
          button.textContent === messagesFor("en").tasks.approve.send_message
      );

      expect(approve).toBeDefined();
      expect(container.textContent).not.toContain("Practice");
      await act(async () => {
        approve?.click();
        await Promise.resolve();
      });
      expect(
        mutate.mock.calls.map(([mutation, args]) => [
          getFunctionName(mutation),
          args,
        ])
      ).toStrictEqual([
        [
          "actions:approve",
          {
            actionId: id("actions"),
            fingerprint: "reviewed-fingerprint",
            method: "keyboard",
            version: 1,
          },
        ],
      ]);
      expect(view.action.mode).toBe("simulated");
    } finally {
      act(() => root.unmount());
    }
  });
});

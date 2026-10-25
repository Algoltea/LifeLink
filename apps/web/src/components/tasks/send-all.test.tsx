// @vitest-environment happy-dom

import type { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { act } from "react";
import type { ComponentProps } from "react";
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

const meFor = (
  presentationDemo: boolean,
  demoMode = true
): FunctionReturnType<typeof api.profiles.me> => ({
  demoModeAllowed: true,
  needsOnboarding: false,
  preferences: null,
  profile: {
    _creationTime: 0,
    // SAFETY: fixed fixture identifier; all Convex transport is stubbed below.
    _id: "presentation-owner" as Id<"profiles">,
    assistantThreadId: null,
    authUserId: "presentation-owner",
    city: null,
    createdAt: 0,
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

const modeErrors = [
  {
    en: "Practice mode is on. Turn it off and review this again to do it for real.",
    es: "El modo de práctica está activado. Desactívelo y revise esto de nuevo para hacerlo de verdad.",
  },
  {
    en: "This was prepared in practice mode. Please prepare it again now that practice mode is off.",
    es: "Esto se preparó en el modo de práctica. Prepárelo de nuevo ahora que la práctica está desactivada.",
  },
];

// The offline queue reads auth state; nobody needs to be signed in here.
const useSignedOut = () => ({
  fetchAccessToken: async () => await Promise.resolve(null),
  isAuthenticated: false,
  isLoading: false,
});

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");
  const values = { me: meFor(false, false) };

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
      localQueryResult: () => values.me,
      onUpdate: () => () => {},
    };
  });
  const mutate = vi.spyOn(client, "mutation").mockResolvedValue(null);

  return { client, mutate, values };
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

  const render = ({
    blocked = false,
    busy = false,
    hasEdits = false,
    practice = false,
    waiting = [ruth, sam],
  }: Partial<
    Pick<
      ComponentProps<typeof SendAllPanel>,
      "blocked" | "busy" | "hasEdits" | "practice" | "waiting"
    >
  > = {}) =>
    act(() =>
      root.render(
        <ConvexProviderWithAuth client={backend.client} useAuth={useSignedOut}>
          <PreferencesProvider>
            <OfflineQueueProvider>
              <SendAllPanel
                blocked={blocked}
                busy={busy}
                hasEdits={hasEdits}
                onBusyChange={() => {}}
                practice={practice}
                taskId={taskId}
                waiting={waiting}
              />
            </OfflineQueueProvider>
          </PreferencesProvider>
        </ConvexProviderWithAuth>
      )
    );

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
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
    setLocale("en");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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
    render({ blocked: true });

    expect(button(t.review(2)).disabled).toBeTruthy();
    expect(container.textContent).toContain(t.resolveFirst);
  });

  it.each([
    { practice: true, presentationDemo: true },
    { practice: true, presentationDemo: false },
    { practice: false, presentationDemo: false },
    { practice: false, presentationDemo: true },
  ])(
    "keeps account-specific review, approval, and busy copy with presentation=$presentationDemo and practice=$practice",
    ({ practice, presentationDemo }) => {
      backend.values.me = meFor(presentationDemo, practice);
      const presentation = presentationDemo && practice;

      const review = presentation
        ? "Review all 2"
        : (practice ? t.practiceReview : t.review)(2);

      const confirm = presentation
        ? "Approve all 2"
        : (practice ? t.practiceConfirm : t.confirm)(2);

      render({ practice });

      expect(container.textContent).toContain(
        presentation ? "Review each person's message together." : t.intro
      );
      act(() => button(review).click());

      expect({
        disabled: button(confirm).disabled,
        heading: document.activeElement?.textContent,
        hint: container.querySelector("section > p")?.textContent,
      }).toStrictEqual({
        disabled: false,
        heading: presentation ? "Approve these 2 messages?" : t.summaryTitle(2),
        hint: presentation
          ? "Approval records these messages in LifeLink. Nothing is sent outside LifeLink."
          : t.summaryHint,
      });
      expect(backend.mutate).not.toHaveBeenCalled();

      render({ busy: true, practice });
      const pending = button(presentation ? "Approving…" : t.sending);

      expect({
        backDisabled: button(t.back).disabled,
        busy: pending.getAttribute("aria-busy"),
        disabled: pending.disabled,
      }).toStrictEqual({ backDisabled: true, busy: "true", disabled: true });
      act(() => pending.click());
      expect(backend.mutate).not.toHaveBeenCalled();
    }
  );

  it.each([
    { detail: 0, method: "keyboard" },
    { detail: 1, method: "tap" },
  ])(
    "preserves the exact presentation approval payload for $method",
    async ({ detail, method }) => {
      backend.values.me = meFor(true);

      const waiting = [
        ruth,
        { ...sam, current: { ...sam.current, version: 3 } },
      ];

      const original = structuredClone(waiting);
      render({ practice: true, waiting });
      act(() => button("Review all 2").click());

      expect(backend.mutate).not.toHaveBeenCalled();
      expect(
        [...container.querySelectorAll("li")].map((item) => item.textContent)
      ).toStrictEqual([
        `${t.recipient("Ruth", words.threads.channels.discord)}Dinner is at six, Ruth.`,
        `${t.recipient("Sam", words.threads.channels.imessage)}Dinner is at six, Sam.`,
      ]);

      await act(async () => {
        button("Approve all 2").dispatchEvent(
          new MouseEvent("click", { bubbles: true, detail })
        );
        await Promise.resolve();
      });

      expect(
        backend.mutate.mock.calls.map(([reference, args]) => [
          getFunctionName(reference),
          args,
        ])
      ).toStrictEqual([
        [
          "actions:approveMessages",
          {
            messages: [
              { actionId: "b", fingerprint: "fingerprint-b", version: 1 },
              { actionId: "a", fingerprint: "fingerprint-a", version: 3 },
            ],
            method,
            taskId,
          },
        ],
      ]);
      expect(waiting).toStrictEqual(original);
      expect(backend.values.me?.profile?.demoMode).toBeTruthy();
    }
  );

  it.each([
    {
      blocked: true,
      hasEdits: false,
      hint: "Some messages need your answer first. You can still approve ready messages one at a time.",
    },
    {
      blocked: false,
      hasEdits: true,
      hint: "Save or cancel your changes before approving all.",
    },
  ])(
    "keeps presentation review and approval guarded with blocked=$blocked and hasEdits=$hasEdits",
    ({ blocked, hasEdits, hint }) => {
      backend.values.me = meFor(true);
      render({ blocked, hasEdits, practice: true });
      expect({
        disabled: button("Review all 2").disabled,
        hint: container.textContent.includes(hint),
      }).toStrictEqual({ disabled: true, hint: true });
      act(() => button("Review all 2").click());
      expect(container.querySelector("h3")).toBeNull();

      render({ practice: true });
      act(() => button("Review all 2").click());
      render({ blocked, hasEdits, practice: true });
      expect(button("Approve all 2").disabled).toBeTruthy();
      expect(container.textContent).toContain(hint);
      act(() => button("Approve all 2").click());
      expect(backend.mutate).not.toHaveBeenCalled();
    }
  );

  it.each(
    modeErrors.flatMap((modeError) =>
      (["en", "es"] as const).flatMap((locale) =>
        [true, false].map((presentationDemo) => ({
          locale,
          modeError,
          presentationDemo,
        }))
      )
    )
  )(
    "handles mode error '$modeError.en' in $locale with presentation=$presentationDemo",
    async ({ modeError, locale, presentationDemo }) => {
      setLocale(locale);
      backend.values.me = meFor(presentationDemo);
      backend.mutate.mockRejectedValueOnce(
        new ConvexError({ code: "blocked", message: modeError.en })
      );
      const localized = messagesFor(locale).tasks.sendAll;
      render({ practice: true });
      act(() =>
        button(
          presentationDemo ? "Review all 2" : localized.practiceReview(2)
        ).click()
      );
      expect(backend.mutate).not.toHaveBeenCalled();

      await act(async () => {
        button(
          presentationDemo ? "Approve all 2" : localized.practiceConfirm(2)
        ).click();
        await Promise.resolve();
      });

      expect(backend.mutate).toHaveBeenCalledOnce();
      expect(container.querySelector('[role="alert"]')?.textContent).toBe(
        presentationDemo
          ? "This action is unavailable for this account. Prepare a new request."
          : modeError[locale]
      );
    }
  );
});

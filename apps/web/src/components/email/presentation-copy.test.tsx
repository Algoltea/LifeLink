// @vitest-environment happy-dom

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { connectionDefinitions } from "@lifelink/contracts/integrations";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import type { FunctionReturnType } from "convex/server";
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "@/components/app/preferences";
import { ThemeProvider } from "@/components/theme-provider";
import { messagesFor, setLocale } from "@/i18n/locale";

import { EmailReader } from "./email-reader";
import { EmailScreen } from "./email-screen";
import { InboxPaging } from "./inbox-paging";
import {
  MAILBOX_UNAVAILABLE,
  PRESENTATION_CHECKS_NOTICE,
} from "./presentation-copy";

// Better Auth captures fetch when its client is created, before any render.
const authFetch = vi.hoisted(() => {
  const date = "2026-10-25T12:00:00.000Z";
  const userId = "presentation-test-user";

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
      name: "Elena Rivera",
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

const PRACTICE_COPY = /practice|sample|simulated/iu;
const PRACTICE_ACCOUNT = "Practice Gmail mailbox";
const SAMPLE_ACCOUNT = "Sample Outlook mailbox";

const PRACTICE_ERROR =
  "Practice mode uses sample emails. Turn it off before syncing a connected mailbox.";

const PROVIDER_ERROR = "Outlook could not finish checking for older email.";
const AUTHORED_BODY = "Please bring the sample form to choir practice.";
const TIMESTAMP = Date.UTC(2026, 9, 24, 12);

const meFor = (
  presentationDemo: boolean
): FunctionReturnType<typeof api.profiles.me> => ({
  demoModeAllowed: true,
  needsOnboarding: false,
  preferences: null,
  profile: {
    _creationTime: TIMESTAMP,
    // SAFETY: this owner exists only in the stubbed query transport.
    _id: "owner-presentation-test" as Id<"profiles">,
    assistantThreadId: null,
    authUserId: "presentation-test-user",
    city: null,
    createdAt: TIMESTAMP,
    demoMode: true,
    displayName: "Elena Rivera",
    postalCode: null,
    preferredName: "Elena",
    presentationDemo,
    role: "owner",
    signOffName: null,
    timeZone: "America/New_York",
  },
});

const PAGE = {
  continueCursor: "",
  isDone: true,
  page: [],
} satisfies FunctionReturnType<typeof api.emails.page>;

const CONNECTIONS = {
  demoMode: true,
  demoModeAllowed: true,
  providers: connectionDefinitions
    .filter(
      (definition) => definition.id === "gmail" || definition.id === "outlook"
    )
    .map((definition) => ({
      accountLabel:
        definition.id === "gmail" ? PRACTICE_ACCOUNT : SAMPLE_ACCOUNT,
      connectionId: null,
      definition,
      developerReady: true,
      hasSavedRealConnection: false,
      lastError: null,
      mode: "simulated" as const,
      status: "active" as const,
    })),
} satisfies FunctionReturnType<typeof api.connections.list>;

const EMAIL = {
  _creationTime: TIMESTAMP,
  // SAFETY: fixture identifiers never reach a live backend; Convex transport is stubbed.
  _id: "email-presentation-test" as Id<"emails">,
  actionNeeded: null,
  bodyText: AUTHORED_BODY,
  connectionId: null,
  fromAddress: "sam@example.com",
  fromName: "Sam",
  mode: "simulated",
  // SAFETY: this owner exists only in the mocked query result.
  ownerId: "owner-presentation-test" as Id<"profiles">,
  provider: "gmail",
  providerMessageId: "presentation-email",
  providerThreadId: null,
  receivedAt: TIMESTAMP,
  selectedForReview: false,
  subject: "Tomorrow's rehearsal",
  summary: null,
  suspicious: null,
} satisfies Doc<"emails">;

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");
  vi.spyOn(client, "setAuth").mockImplementation((_fetchToken, onChange) =>
    onChange?.(true)
  );
  vi.spyOn(client, "clearAuth").mockImplementation(() => {});

  const detail = {
    appointment: null,
    email: { ...EMAIL, scamCheck: undefined },
    warningSigns: [],
  } satisfies FunctionReturnType<typeof api.emails.get>;

  const values = new Map<string, unknown>([
    ["connections:list", CONNECTIONS],
    ["emails:get", detail],
    ["emails:olderAvailable", false],
    ["emails:page", PAGE],
  ]);

  // Exercise the actual query hooks and components, replacing only their transport.
  vi.spyOn(client, "watchQuery").mockImplementation((...args) => {
    const [query] = args;
    const name = getFunctionName(query);

    if (!values.has(name)) {
      throw new Error(`Unexpected query: ${name}`);
    }

    return {
      journal: () => {},
      localQueryLogs: () => [],
      localQueryResult: () => values.get(name),
      onUpdate: () => () => {},
    };
  });

  const action = vi
    .spyOn(client, "action")
    .mockResolvedValue({ added: 0, errors: [] });

  const mutation = vi.spyOn(client, "mutation").mockResolvedValue(null);

  return { action, client, mutation, values };
};

describe("email presentation copy", () => {
  let backend: ReturnType<typeof createBackend>;
  let container: HTMLDivElement;
  let root: Root;

  const render = (children: ReactNode, presentationDemo: boolean) => {
    backend.values.set("profiles:me", meFor(presentationDemo));
    act(() =>
      root.render(
        <ConvexProviderWithAuth client={backend.client} useAuth={useTestAuth}>
          <ThemeProvider>
            <PreferencesProvider>{children}</PreferencesProvider>
          </ThemeProvider>
        </ConvexProviderWithAuth>
      )
    );
  };

  const button = (label: string): HTMLButtonElement => {
    const found = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent.trim() === label
    );

    if (found === undefined) {
      throw new Error(`Missing button: ${label}`);
    }

    return found;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    authFetch.mockClear();
    vi.stubGlobal("fetch", authFetch);
    setLocale("en");
    backend = createBackend();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    act(() => root.unmount());
    await backend.client.close();
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([true, false])(
    "shows account-appropriate inbox copy and keeps demo refresh disabled when presentation=%s",
    (enabled) => {
      const t = messagesFor("en").email;
      render(<EmailScreen initialEmailId={null} />, enabled);

      const mailbox = container.querySelector(`[aria-label="${t.mailboxes}"]`);
      const refresh = button(t.checkForNew);

      expect(refresh.disabled).toBeTruthy();
      act(() => refresh.click());
      expect(backend.action).not.toHaveBeenCalled();

      act(() => button(t.aboutChecks).click());
      const help = container.querySelector("#email-checks-explained");

      expect({
        helpCopy: help?.textContent.includes(
          enabled ? PRESENTATION_CHECKS_NOTICE : t.checksAutomatic
        ),
        helpExpanded: button(t.aboutChecks).getAttribute("aria-expanded"),
        helpPractice: PRACTICE_COPY.test(help?.textContent ?? ""),
        mailboxPractice: PRACTICE_COPY.test(mailbox?.textContent ?? ""),
        practiceAccount: mailbox?.textContent.includes(PRACTICE_ACCOUNT),
        refreshDisabled: refresh.disabled,
        sampleAccount: mailbox?.textContent.includes(SAMPLE_ACCOUNT),
        sampleEmails: mailbox?.textContent.includes(t.sampleEmails),
        unavailable: mailbox?.textContent.includes(MAILBOX_UNAVAILABLE),
      }).toStrictEqual({
        helpCopy: true,
        helpExpanded: "true",
        helpPractice: !enabled,
        mailboxPractice: !enabled,
        practiceAccount: !enabled,
        refreshDisabled: true,
        sampleAccount: !enabled,
        sampleEmails: !enabled,
        unavailable: enabled,
      });

      expect(backend.mutation).not.toHaveBeenCalled();
    }
  );

  it.each([true, false])(
    "uses account-appropriate reader help before a scam check without rewriting authored text when presentation=%s",
    (enabled) => {
      const t = messagesFor("en").email;
      render(
        <EmailReader
          emailId={EMAIL._id}
          listStaysBeside={() => false}
          timeZone="America/New_York"
        />,
        enabled
      );

      const disclosure = [...container.querySelectorAll("details")].find(
        (element) =>
          element
            .querySelector("summary")
            ?.textContent.includes(t.scamCheckNotDone)
      );

      if (disclosure === undefined) {
        throw new Error("Missing scam-check disclosure");
      }

      act(() => {
        disclosure.open = true;
        disclosure.dispatchEvent(new Event("toggle"));
      });

      expect({
        checkManually: disclosure.textContent.includes(t.checkManually),
        helpCopy: disclosure.textContent.includes(
          enabled ? PRESENTATION_CHECKS_NOTICE : t.checksAutomatic
        ),
        notChecked: disclosure.textContent.includes(t.notCheckedEmail),
        open: disclosure.open,
        practiceCopy: PRACTICE_COPY.test(disclosure.textContent),
      }).toStrictEqual({
        checkManually: true,
        helpCopy: true,
        notChecked: true,
        open: true,
        practiceCopy: !enabled,
      });

      expect(container.textContent).toContain(AUTHORED_BODY);
      expect(backend.action).not.toHaveBeenCalled();
      expect(backend.mutation).not.toHaveBeenCalled();
    }
  );

  it.each([true, false])(
    "preserves older-mail arguments and provider errors after a stale availability result when presentation=%s",
    async (enabled) => {
      backend.values.set("emails:olderAvailable", true);
      backend.action.mockResolvedValue({
        added: 0,
        errors: [PRACTICE_ERROR, PROVIDER_ERROR],
      });
      const onNavigate = vi.fn<(next: (string | null)[]) => void>();
      render(
        <InboxPaging cursors={[null]} onNavigate={onNavigate} page={PAGE} />,
        enabled
      );
      const older = button(messagesFor("en").email.paging.loadOlder);
      expect(older.disabled).toBeFalsy();

      await act(async () => {
        older.click();
        await Promise.resolve();
      });

      expect(backend.action).toHaveBeenCalledExactlyOnceWith(
        api.emails.refresh,
        { older: true }
      );
      expect(container.querySelector('[role="alert"]')?.textContent).toBe(
        `${enabled ? MAILBOX_UNAVAILABLE : PRACTICE_ERROR} ${PROVIDER_ERROR}`
      );
      expect(onNavigate).not.toHaveBeenCalled();
      expect(backend.mutation).not.toHaveBeenCalled();
    }
  );
});

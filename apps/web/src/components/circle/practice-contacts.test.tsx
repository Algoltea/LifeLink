// @vitest-environment happy-dom

import type { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import type { FunctionReturnType } from "convex/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "@/components/app/preferences";
import { TrustedPeople } from "@/components/scam/trusted-people";
import { ThemeProvider } from "@/components/theme-provider";
import { messagesFor, setLocale } from "@/i18n/locale";

import { CircleScreen } from "./circle-screen";
import type { CircleContact } from "./contact-form";
import type { GrantRow } from "./contact-permissions";

const timestamp = Date.UTC(2026, 9, 24, 12);

// SAFETY: fixed fixture identifiers; all Convex transport is stubbed below.
const ownerId = "owner-test" as Id<"profiles">;

const meFor = (
  demoMode: boolean
): FunctionReturnType<typeof api.profiles.me> => ({
  demoModeAllowed: true,
  needsOnboarding: false,
  preferences: null,
  profile: {
    _creationTime: timestamp,
    _id: ownerId,
    assistantThreadId: null,
    authUserId: "test-user",
    city: null,
    createdAt: timestamp,
    demoMode,
    displayName: "Ana Example",
    postalCode: null,
    preferredName: "Ana",
    role: "owner",
    signOffName: null,
    timeZone: "America/New_York",
  },
});

const contact = (
  name: string,
  sample: boolean,
  trusted: boolean
): CircleContact => ({
  _creationTime: timestamp,
  // SAFETY: fixed fixture identifier; no live backend receives it.
  _id: `contact-${name}` as Id<"contacts">,
  avatarUrl: null,
  channels: [
    { address: "+1 (202) 555-0100", channel: "imessage", preferred: true },
  ],
  createdAt: timestamp,
  hue: 20,
  linkedProfileId: null,
  name,
  ownerId,
  relationship: "Friend",
  sample,
  telegram: null,
  trusted,
});

const sam = contact("Sam", true, true);
const dana = contact("Dana", true, false);
const ruth = contact("Ruth", false, true);
const pat = contact("Pat", false, false);
const contacts = [sam, dana, ruth, pat];

interface QueryResults {
  "contacts:list": CircleContact[] | undefined;
  "imessage:list": FunctionReturnType<typeof api.imessage.list> | undefined;
  "profiles:me": FunctionReturnType<typeof api.profiles.me> | undefined;
  "sharing:listGrants": GrantRow[] | undefined;
}

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");

  const initial: QueryResults = {
    "contacts:list": contacts,
    "imessage:list": undefined,
    "profiles:me": meFor(true),
    "sharing:listGrants": [],
  };

  const values = new Map<string, unknown>(Object.entries(initial));
  const listeners = new Set<() => void>();

  // Keep the real hooks and PreferencesProvider; replace only Convex transport.
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
      onUpdate: (listener) => {
        listeners.add(listener);

        return () => {
          listeners.delete(listener);
        };
      },
    };
  });
  const mutate = vi.spyOn(client, "mutation").mockResolvedValue(null);

  return {
    client,
    mutate,
    receive: (patch: Partial<QueryResults>) => {
      for (const [name, value] of Object.entries(patch)) {
        values.set(name, value);
      }

      for (const listener of listeners) {
        listener();
      }
    },
  };
};

describe("Practice contacts in the circle and trusted picker", () => {
  let container: HTMLDivElement;
  let root: Root;
  let backend: ReturnType<typeof createBackend>;

  const required = <Element extends HTMLElement>(
    selector: string,
    scope: ParentNode = container
  ): Element => {
    const element = scope.querySelector<Element>(selector);

    if (element === null) {
      throw new Error(`Missing test element: ${selector}`);
    }

    return element;
  };

  const button = (
    text: string,
    scope: ParentNode = container
  ): HTMLButtonElement => {
    const element = [...scope.querySelectorAll("button")].find(
      (candidate) => candidate.textContent.trim() === text
    );

    if (element === undefined) {
      throw new Error(`Missing test button: ${text}`);
    }

    return element;
  };

  const rowFor = (selector: string): HTMLLIElement => {
    const row = required(selector).closest("li");

    if (row === null) {
      throw new Error(`Missing contact row: ${selector}`);
    }

    return row;
  };

  const circleRow = (person: CircleContact) =>
    rowFor(`a[href="/messages/${person._id}"]`);

  const circleLinks = () =>
    [...container.querySelectorAll('a[href^="/messages/"]')].map((link) =>
      link.getAttribute("href")
    );

  const trustedRow = (person: CircleContact) =>
    rowFor(
      `[aria-label="${messagesFor("en").trustedPeople.prepareAria(person.name)}"]`
    );

  const render = (children: ReactNode) =>
    act(() =>
      root.render(
        <ConvexProvider client={backend.client}>
          <ThemeProvider>
            <PreferencesProvider>
              <AppRouterContext
                value={{
                  back: vi.fn<() => void>(),
                  bfcacheId: "practice-test",
                  forward: vi.fn<() => void>(),
                  prefetch: vi.fn<() => void>(),
                  push: vi.fn<() => void>(),
                  refresh: vi.fn<() => void>(),
                  replace: vi.fn<() => void>(),
                }}
              >
                {children}
              </AppRouterContext>
            </PreferencesProvider>
          </ThemeProvider>
        </ConvexProvider>
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
    await backend.client.close();
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows every contact in Practice and updates the circle in place when the mode changes", () => {
    render(<CircleScreen />);
    const t = messagesFor("en").circle;

    expect({
      count: container.textContent.includes(t.peopleCount(4)),
      links: circleLinks(),
    }).toStrictEqual({
      count: true,
      links: contacts.map((person) => `/messages/${person._id}`),
    });
    expect(
      contacts.map((person) => ({
        sample: circleRow(person).textContent.includes(t.practiceContact),
        trusted: circleRow(person).textContent.includes(t.trusted),
      }))
    ).toStrictEqual([
      { sample: true, trusted: true },
      { sample: true, trusted: false },
      { sample: false, trusted: true },
      { sample: false, trusted: false },
    ]);

    const realRow = circleRow(ruth);

    const permissions = required<HTMLButtonElement>(
      "button[aria-expanded]",
      realRow
    );

    act(() => permissions.click());
    act(() => backend.receive({ "profiles:me": meFor(false) }));

    expect({
      count: container.textContent.includes(t.peopleCount(2)),
      expanded: permissions.getAttribute("aria-expanded"),
      links: circleLinks(),
      sameRow: circleRow(ruth) === realRow,
    }).toStrictEqual({
      count: true,
      expanded: "true",
      links: [ruth, pat].map((person) => `/messages/${person._id}`),
      sameRow: true,
    });

    act(() => backend.receive({ "profiles:me": meFor(true) }));

    expect({
      expanded: permissions.getAttribute("aria-expanded"),
      links: circleLinks(),
      sameRow: circleRow(ruth) === realRow,
    }).toStrictEqual({
      expanded: "true",
      links: contacts.map((person) => `/messages/${person._id}`),
      sameRow: true,
    });
    expect(backend.mutate).not.toHaveBeenCalled();
  });

  it.each([
    { matching: true, state: "active", visible: true },
    { matching: true, state: "invited", visible: true },
    { matching: true, state: "expired", visible: false },
    { matching: true, state: "revoked", visible: false },
    { matching: false, state: "active", visible: false },
    { matching: false, state: "invited", visible: false },
  ] as const)(
    "keeps live sample sharing manageable for $state grants with matching ID=$matching",
    async ({ state, matching, visible }) => {
      const grant: GrantRow = {
        acceptedAt: state === "invited" ? null : timestamp,
        contactId: matching ? sam._id : ruth._id,
        // Names deliberately disagree with IDs: only the stored ID determines access.
        contactName: matching ? "Previous name" : sam.name,
        createdAt: timestamp,
        expiresAt: null,
        // SAFETY: fixed fixture identifier; the revoke transport is stubbed.
        id: "grant-test" as Id<"sharingGrants">,
        scopes: ["appointments.view"],
        state,
      };

      backend.receive({
        "profiles:me": meFor(false),
        "sharing:listGrants": [grant],
      });
      render(<CircleScreen />);

      expect(circleLinks()).toStrictEqual(
        (visible ? [sam, ruth, pat] : [ruth, pat]).map(
          (person) => `/messages/${person._id}`
        )
      );

      if (!visible) {
        return;
      }

      const row = circleRow(sam);
      const t = messagesFor("en").sharing;
      act(() =>
        required<HTMLButtonElement>("button[aria-expanded]", row).click()
      );
      expect(row.textContent).toContain(t.state[state]);
      expect(button(t.changePermissions, row).disabled).toBeFalsy();
      act(() => button(t.stopSharing, row).click());
      const dialog = required('[role="dialog"]', document.body);
      await act(async () => {
        button(t.stopSharingWith("Previous"), dialog).click();
        await Promise.resolve();
      });

      expect(
        backend.mutate.mock.calls.map(([mutation, args]) => [
          getFunctionName(mutation),
          args,
        ])
      ).toStrictEqual([["sharing:revoke", { grantId: grant.id }]]);
      act(() =>
        backend.receive({
          "sharing:listGrants": [{ ...grant, state: "revoked" }],
        })
      );
      expect(circleLinks()).toStrictEqual(
        [ruth, pat].map((person) => `/messages/${person._id}`)
      );
    }
  );

  it.each(["profiles:me", "contacts:list", "sharing:listGrants"] as const)(
    "waits for %s before deciding the circle is empty",
    (query) => {
      backend.receive({ [query]: undefined });
      render(<CircleScreen />);
      const t = messagesFor("en").circle;

      expect(required('[aria-busy="true"]').getAttribute("aria-label")).toBe(
        t.loadingPeople
      );
      expect(circleLinks()).toStrictEqual([]);
      expect(container.textContent).not.toContain(t.empty);

      act(() =>
        backend.receive({
          "contacts:list": contacts,
          "profiles:me": meFor(true),
          "sharing:listGrants": [],
        })
      );

      expect(circleLinks()).toStrictEqual(
        contacts.map((person) => `/messages/${person._id}`)
      );
      expect(container.querySelector('[aria-busy="true"]')).toBeNull();
    }
  );

  it("switches trusted recipients and call controls in place, translating only sample labels", () => {
    render(<TrustedPeople />);
    const en = messagesFor("en");
    const sampleRow = trustedRow(sam);
    const realRow = trustedRow(ruth);
    const sampleLabel = required('[data-slot="pill"]', sampleRow);

    expect(
      [...container.querySelectorAll("li")].map((row) => ({
        call: required('button[aria-label^="Call "]', row).getAttribute(
          "aria-label"
        ),
        callDisabled: required<HTMLButtonElement>(
          'button[aria-label^="Call "]',
          row
        ).disabled,
        prepareDisabled: required<HTMLButtonElement>(
          'button[aria-label^="Prepare "]',
          row
        ).disabled,
        trusted: row.textContent.includes(en.circle.trusted),
      }))
    ).toStrictEqual([
      {
        call: "Call Sam",
        callDisabled: true,
        prepareDisabled: false,
        trusted: true,
      },
      {
        call: "Call Ruth",
        callDisabled: true,
        prepareDisabled: false,
        trusted: true,
      },
    ]);
    expect({
      phoneLink: container.querySelector('a[href^="tel:"]'),
      realLabel: realRow.querySelector('[data-slot="pill"]'),
      sampleLabel: sampleLabel.textContent,
    }).toStrictEqual({
      phoneLink: null,
      realLabel: null,
      sampleLabel: en.circle.practiceContact,
    });

    act(() => setLocale("es"));
    expect({
      dana: container.textContent.includes(dana.name),
      realLabel: realRow.textContent.includes(
        messagesFor("es").circle.practiceContact
      ),
      sampleLabel: sampleLabel.textContent,
    }).toStrictEqual({
      dana: false,
      realLabel: false,
      sampleLabel: messagesFor("es").circle.practiceContact,
    });
    act(() => setLocale("en"));
    act(() => backend.receive({ "profiles:me": meFor(false) }));

    expect({
      phone: required("a", realRow).getAttribute("href"),
      rows: container.querySelectorAll("li").length,
      sam: container.textContent.includes(sam.name),
      sameRow: trustedRow(ruth) === realRow,
    }).toStrictEqual({
      phone: "tel:+12025550100",
      rows: 1,
      sam: false,
      sameRow: true,
    });

    act(() => backend.receive({ "profiles:me": meFor(true) }));

    expect({
      callDisabled: required<HTMLButtonElement>(
        'button[aria-label="Call Ruth"]',
        realRow
      ).disabled,
      callLink: container.querySelector('a[href^="tel:"]'),
      rows: container.querySelectorAll("li").length,
      sameRow: trustedRow(ruth) === realRow,
    }).toStrictEqual({
      callDisabled: true,
      callLink: null,
      rows: 2,
      sameRow: true,
    });
  });

  it.each(["profile", "contacts"] as const)(
    "waits for the trusted picker’s %s before showing sample recipients",
    (pending) => {
      backend.receive({
        "contacts:list": pending === "contacts" ? undefined : [sam, dana],
        "profiles:me": pending === "profile" ? undefined : meFor(true),
      });
      render(<TrustedPeople />);
      const t = messagesFor("en").trustedPeople;

      expect({
        empty: container.textContent.includes(t.empty),
        loading: required('[aria-busy="true"]').getAttribute("aria-label"),
        row: container.querySelector("li"),
      }).toStrictEqual({ empty: false, loading: t.loading, row: null });

      act(() =>
        backend.receive({
          "contacts:list": [sam, dana],
          "profiles:me": meFor(true),
        })
      );

      expect({
        callLink: container.querySelector('a[href^="tel:"]'),
        dana: container.textContent.includes(dana.name),
        loading: container.querySelector('[aria-busy="true"]'),
        rows: container.querySelectorAll("li").length,
        sample: trustedRow(sam).textContent.includes(
          messagesFor("en").circle.practiceContact
        ),
      }).toStrictEqual({
        callLink: null,
        dana: false,
        loading: null,
        rows: 1,
        sample: true,
      });
    }
  );

  it("keeps real trusted people visible with calls disabled while the profile loads", () => {
    backend.receive({ "profiles:me": undefined });
    render(<TrustedPeople />);
    const row = trustedRow(ruth);

    expect({
      callDisabled: required<HTMLButtonElement>(
        'button[aria-label="Call Ruth"]',
        row
      ).disabled,
      callLink: container.querySelector('a[href^="tel:"]'),
      dana: container.textContent.includes(dana.name),
      explanation: container.textContent.includes(
        messagesFor("en").trustedPeople.callsLoading
      ),
      rows: container.querySelectorAll("li").length,
      sam: container.textContent.includes(sam.name),
    }).toStrictEqual({
      callDisabled: true,
      callLink: null,
      dana: false,
      explanation: true,
      rows: 1,
      sam: false,
    });

    act(() => backend.receive({ "profiles:me": meFor(false) }));

    expect(trustedRow(ruth)).toBe(row);
    expect(required("a", row).getAttribute("href")).toBe("tel:+12025550100");
  });
});

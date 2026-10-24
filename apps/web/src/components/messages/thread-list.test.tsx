// @vitest-environment happy-dom

import type { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setLocale } from "@/i18n/locale";

import type { Message } from "./message-bits";
import { MessagesNotice } from "./messages-notice";
import { MessagesScreen } from "./messages-screen";
import { ThreadList } from "./thread-list";

type ThreadRow = FunctionReturnType<typeof api.messages.threads>[number];

const timestamp = Date.UTC(2020, 8, 1, 16);
const ORIGINAL_TEXT = "Wait for an answer";

const message: Message = {
  _creationTime: timestamp,
  // SAFETY: fixed test identifiers; no backend calls use them.
  _id: "message-test" as Id<"messages">,
  actionId: null,
  body: ORIGINAL_TEXT,
  channel: "in_app",
  // SAFETY: fixed test identifiers; no backend calls use them.
  contactId: "contact-test" as Id<"contacts">,
  createdAt: timestamp,
  direction: "outgoing",
  mode: "simulated",
  // SAFETY: fixed test identifiers; no backend calls use them.
  ownerId: "owner-test" as Id<"profiles">,
  photoIds: [],
  providerMessageId: null,
  status: "sent",
  statusUpdatedAt: timestamp,
  taskId: null,
};

const thread: ThreadRow = {
  channel: "in_app",
  contact: {
    avatarUrl: null,
    hue: 20,
    id: message.contactId,
    name: ORIGINAL_TEXT,
    relationship: "Family",
    trusted: true,
  },
  last: message,
  waiting: 2,
};

describe("the two-pane conversation list", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("updates labels and dates while keeping selection, focus, order and authored text", () => {
    const empty: ThreadRow = {
      ...thread,
      channel: "discord",
      contact: {
        ...thread.contact,
        // SAFETY: fixed test identifier; no backend calls use it.
        id: "other-contact" as Id<"contacts">,
        name: "Sam",
      },
      last: null,
      waiting: 0,
    };

    act(() =>
      root.render(
        <ThreadList
          selectedId={thread.contact.id}
          threads={[empty, thread]}
          timeZone="America/New_York"
        />
      )
    );
    const selected = container.querySelector<HTMLAnchorElement>("a");
    const time = selected?.querySelector("time");

    if (!selected || !time) {
      throw new Error("Expected the latest conversation and its timestamp.");
    }

    expect({
      date: time.textContent.includes("Sep 1"),
      href: selected.getAttribute("href"),
      preview: selected.textContent.includes(`You: ${ORIGINAL_TEXT}`),
      selected: selected.getAttribute("aria-current"),
    }).toStrictEqual({
      date: true,
      href: "/messages/contact-test",
      preview: true,
      selected: "page",
    });
    act(() => selected.focus());

    act(() => setLocale("es"));

    expect({
      date: time.textContent.includes("sept"),
      dateTitle: time.title.includes("martes, 1 de septiembre"),
      emptyChannel: container.textContent.includes(
        "Empezar una conversación · Mensaje directo de Discord"
      ),
      focused: document.activeElement === selected,
      heading: container.querySelector("h2")?.textContent,
      originalOccurrences: selected.textContent.split(ORIGINAL_TEXT).length,
      people: container.textContent.includes("2 personas"),
      preview: selected.textContent.includes(`Usted: ${ORIGINAL_TEXT}`),
      sameFirstRow: container.querySelector("a") === selected,
      sameSelection:
        container.querySelector('a[aria-current="page"]') === selected,
      translatedOriginal: container.textContent.includes(
        "Esperar una respuesta"
      ),
      waiting: selected.textContent.includes("2 esperan su aprobación"),
    }).toStrictEqual({
      date: true,
      dateTitle: true,
      emptyChannel: true,
      focused: true,
      heading: "Conversaciones",
      originalOccurrences: 3,
      people: true,
      preview: true,
      sameFirstRow: true,
      sameSelection: true,
      translatedOriginal: false,
      waiting: true,
    });

    act(() => setLocale("en"));

    expect({
      date: time.textContent.includes("Sep 1"),
      focused: document.activeElement === selected,
      waiting: selected.textContent.includes("2 waiting for your approval"),
    }).toStrictEqual({ date: true, focused: true, waiting: true });
  });

  it.each([
    { expected: "No se envió", status: "failed", waiting: 2 },
    {
      expected: "No es seguro que se haya enviado",
      status: "unknown",
      waiting: 2,
    },
    { expected: "Espera su aprobación", status: "sent", waiting: 1 },
    { expected: "3 esperan su aprobación", status: "sent", waiting: 3 },
    {
      expected: "Todavía no hay forma de comunicarse",
      status: "sent",
      waiting: 0,
    },
  ] as const)(
    "keeps one status for $status with $waiting approvals, ahead of an unreachable channel",
    ({ expected, status, waiting }) => {
      act(() => setLocale("es"));
      act(() =>
        root.render(
          <ThreadList
            selectedId={null}
            threads={[
              {
                ...thread,
                channel: null,
                last: { ...message, status },
                waiting,
              },
            ]}
            timeZone="America/New_York"
          />
        )
      );

      expect(container.textContent).toContain("1 persona");
      expect(container.querySelectorAll('[data-slot="pill"]')).toHaveLength(1);
      expect(container.querySelector('[data-slot="pill"]')?.textContent).toBe(
        expected
      );
    }
  );

  it("updates the shared promise, empty pane and loading announcement in place", () => {
    act(() =>
      root.render(
        <>
          <MessagesNotice />
          <MessagesScreen />
          <ThreadList
            selectedId={null}
            threads={undefined}
            timeZone="America/New_York"
          />
        </>
      )
    );

    const loading = container.querySelector('[role="status"]');

    expect(loading?.getAttribute("aria-label")).toBe("Loading conversations");
    act(() => setLocale("es"));

    expect(container.textContent).toContain(
      "Usted ve cada mensaje antes de que se envíe."
    );
    expect(container.textContent).toContain(
      "Elija a alguien para leer su conversación y responder."
    );
    expect(loading?.getAttribute("aria-label")).toBe(
      "Cargando las conversaciones"
    );
    expect(container.querySelector('[role="status"]')).toBe(loading);
  });
});

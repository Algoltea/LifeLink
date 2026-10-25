// @vitest-environment happy-dom

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { InlineActionReview, InlineTaskReview } from "./inline-action-review";

const serverTaskId = "server-owned-task";

const actionView = (status: "awaiting_approval" | "succeeded") => ({
  action: { _id: "server-action", status, taskId: serverTaskId },
  blockers: [],
  current: null,
  recipientRelationship: "Son",
});

type QueryFixture =
  | {
      hue: number;
      timeZone: string;
      title: string;
      view: ReturnType<typeof actionView>;
    }
  | {
      actions: ReturnType<typeof actionView>[];
      task: { _id: string; kind: "send_message"; title: string };
      timeZone: string;
    };

describe("inline review progress navigation", () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: ConvexReactClient;
  let queryValue: QueryFixture | null | undefined;
  let watchedQueries: string[];

  const render = async (children: ReactNode) => {
    await act(() =>
      root.render(<ConvexProvider client={client}>{children}</ConvexProvider>)
    );
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryValue = undefined;
    watchedQueries = [];
    client = new ConvexReactClient("http://127.0.0.1:3210");
    // Keep the real hooks and component tree; intercept only the query transport.
    vi.spyOn(client, "watchQuery").mockImplementation((...args) => {
      const [query] = args;

      watchedQueries.push(getFunctionName(query));

      return {
        journal: () => {},
        localQueryLogs: () => [],
        localQueryResult: () => queryValue,
        onUpdate: () => () => {},
      };
    });
  });

  afterEach(async () => {
    await act(() => root.unmount());
    await client.close();
    container.remove();
    setLocale("en");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each(["awaiting_approval", "succeeded"] as const)(
    "keeps task progress reachable for a %s single action using the authorized server task id",
    async (status) => {
      queryValue = {
        hue: 30,
        timeZone: "America/New_York",
        title: "Ride to Doctor",
        view: actionView(status),
      };
      await render(<InlineActionReview actionId="model-action-id" />);
      const link = container.querySelector("a");

      expect({
        href: link?.getAttribute("href"),
        label: link?.textContent,
      }).toStrictEqual({
        href: `/tasks/${serverTaskId}`,
        label: messagesFor("en").tasks.progressAndNext,
      });
      expect(watchedQueries).toContain("assistant:actionReview");
    }
  );

  it("localizes the link on a task review, including completed multi-action requests", async () => {
    setLocale("es");
    queryValue = {
      actions: [
        actionView("succeeded"),
        {
          ...actionView("succeeded"),
          action: {
            _id: "other-action",
            status: "succeeded",
            taskId: serverTaskId,
          },
        },
      ],
      task: {
        _id: serverTaskId,
        kind: "send_message",
        title: "Family messages",
      },
      timeZone: "America/New_York",
    };
    await render(<InlineTaskReview taskId="raw-model-task-id" />);
    const link = container.querySelector("a");

    expect({
      href: link?.getAttribute("href"),
      label: link?.textContent,
    }).toStrictEqual({
      href: `/tasks/${serverTaskId}`,
      label: messagesFor("es").tasks.progressAndNext,
    });
  });

  it.each([null, undefined])(
    "does not turn an unavailable review (%s) into a raw model task link",
    async (review) => {
      queryValue = review;
      await render(
        <InlineActionReview actionId="unowned-or-invalid-model-id" />
      );
      expect(container.querySelector("a")).toBeNull();
    }
  );
});

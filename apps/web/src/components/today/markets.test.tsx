// @vitest-environment happy-dom

import type { api } from "@lifelink/backend/convex/_generated/api";
import { MARKETS_REFRESH_MS } from "@lifelink/contracts/markets";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setLocale } from "@/i18n/locale";

import { MarketTicker } from "./markets";

type QuotesResult = FunctionReturnType<typeof api.markets.quotes>;

const NOW = Date.parse("2026-10-25T05:00:00Z");

const CACHED: QuotesResult = {
  fetchedAt: NOW,
  quotes: [{ id: "sp500", marketTime: NOW, previousClose: 5700, price: 5800 }],
};

const advance = async (milliseconds: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
};

const createBackend = () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");
  const listeners = new Set<() => void>();
  let result: QuotesResult | Error | undefined;

  // Exercise the real Convex hooks, including their query error handling.
  vi.spyOn(client, "watchQuery").mockImplementation(() => ({
    journal: () => {},
    localQueryLogs: () => [],
    localQueryResult: () => {
      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    onUpdate: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  }));

  const refresh = vi
    .spyOn(client, "action")
    .mockResolvedValue({ available: true });

  return {
    client,
    receive: (next: QuotesResult | Error | undefined) => {
      result = next;

      for (const listener of listeners) {
        listener();
      }
    },
    refresh,
  };
};

describe("market query failures on Today", () => {
  let container: HTMLDivElement;
  let root: Root;
  let backend: ReturnType<typeof createBackend>;

  const render = async () => {
    await act(() => {
      root.render(
        <ConvexProvider client={backend.client}>
          <h1>Today</h1>
          <MarketTicker timeZone="America/New_York" />
        </ConvexProvider>
      );
    });
  };

  const receive = async (result: QuotesResult | Error | undefined) => {
    await act(() => backend.receive(result));
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.useFakeTimers({ now: NOW });
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
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps Today mounted when the deployment is missing the market query", async () => {
    await render();
    const heading = container.querySelector("h1");

    await receive(
      new Error("Could not find public function for 'markets:quotes'.")
    );
    await advance(MARKETS_REFRESH_MS);

    expect(container.querySelector("h1")).toBe(heading);
    expect(container.textContent).toBe("Today");
    expect(backend.refresh).not.toHaveBeenCalled();
  });

  it("recovers through the existing subscription when the backend becomes available", async () => {
    backend.receive(
      new Error("Could not find public function for 'markets:quotes'.")
    );
    await render();

    await receive({ fetchedAt: null, quotes: [] });
    await advance(0);
    expect(backend.refresh).toHaveBeenCalledOnce();

    await receive(CACHED);
    expect(container.textContent).toContain("S&P 500");
    expect(container.textContent).toContain("5,800.00");
  });

  it("hides the ticker and cancels its refresh when a loaded query fails", async () => {
    backend.receive(CACHED);
    await render();
    expect(container.textContent).toContain("S&P 500");

    await receive(new Error("Market query failed"));
    await advance(MARKETS_REFRESH_MS);

    expect(container.textContent).toBe("Today");
    expect(backend.refresh).not.toHaveBeenCalled();
  });

  it("keeps Today available when refreshing an empty cache fails", async () => {
    backend.receive({ fetchedAt: null, quotes: [] });
    backend.refresh.mockRejectedValue(
      new Error("Could not find public function for 'markets:refresh'.")
    );
    await render();
    await advance(0);

    expect(container.textContent).toBe("Today");
    expect(backend.refresh).toHaveBeenCalledOnce();
  });
});

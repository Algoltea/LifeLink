"use client";

import { useEffect, useState } from "react";

/** After a refresh that changed nothing, the next try waits this long. */
const RETRY_MS = 5 * 60_000;

/**
 * Today stays open all day, so cached outside data is refreshed when it
 * expires, not only when the page opens. `fetchedAt` is undefined while the
 * query loads and null when nothing is cached yet. `refresh` must be stable.
 */
const useRefreshWhenStale = ({
  enabled,
  fetchedAt,
  maxAgeMs,
  refresh,
}: {
  enabled: boolean;
  fetchedAt: number | null | undefined;
  maxAgeMs: number;
  refresh: () => Promise<void>;
}): void => {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!enabled || fetchedAt === undefined) {
      return;
    }

    const expiresIn =
      fetchedAt === null ? 0 : fetchedAt + maxAgeMs - Date.now();

    // A refresh already ran for this copy and changed nothing: wait before trying again.
    const retryIn = attempts > 0 ? RETRY_MS : 0;
    const wait = expiresIn > 0 ? expiresIn : retryIn;

    // A refresh that finishes after this cycle ended (say, for the other news kind) must not count.
    let current = true;

    const timer = globalThis.setTimeout(async () => {
      await refresh();

      if (current) {
        setAttempts((count) => count + 1);
      }
    }, wait);

    return () => {
      current = false;
      globalThis.clearTimeout(timer);
    };
  }, [attempts, enabled, fetchedAt, maxAgeMs, refresh]);

  // A new copy starts a fresh cycle.
  const [seen, setSeen] = useState(fetchedAt);

  if (seen !== fetchedAt) {
    setSeen(fetchedAt);
    setAttempts(0);
  }
};

export { useRefreshWhenStale };

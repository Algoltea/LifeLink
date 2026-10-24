"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { useConvexAuth, useMutation } from "convex/react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { codeOf, messageOf } from "@/lib/errors";
import { enqueue, readQueue, removeFromQueue } from "@/lib/offline-queue";
import type { QueuedItem } from "@/lib/offline-queue";

import { usePreferences } from "./preferences";

interface OfflineValue {
  online: boolean;
  queue: QueuedItem[];
  queueApproval: (item: {
    actionId: string;
    fingerprint: string;
    label: string;
    version: number;
  }) => boolean;
  queueRequest: (text: string, threadId: string) => boolean;
}

const OfflineContext = createContext<OfflineValue | null>(null);

const OfflineQueueProvider = ({ children }: { children: ReactNode }) => {
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const { isAuthenticated } = useConvexAuth();
  const { me } = usePreferences();
  const profileId = isAuthenticated ? (me?.profile?._id ?? null) : null;
  const submitRequest = useMutation(api.assistant.submitRequest);
  const approve = useMutation(api.actions.approve);
  const flushing = useRef(false);
  const activeProfile = useRef<string | null>(null);

  useEffect(() => {
    activeProfile.current = profileId;
    const refresh = (): void => setQueue(profileId ? readQueue(profileId) : []);
    const update = (): void => setOnline(navigator.onLine);

    refresh();
    update();
    globalThis.addEventListener("online", update);
    globalThis.addEventListener("offline", update);
    globalThis.addEventListener("lifelink:queue", refresh);
    globalThis.addEventListener("storage", refresh);

    return () => {
      globalThis.removeEventListener("online", update);
      globalThis.removeEventListener("offline", update);
      globalThis.removeEventListener("lifelink:queue", refresh);
      globalThis.removeEventListener("storage", refresh);
    };
  }, [profileId]);

  /** Send queued work in order. Each approval is re-checked by the server and may be refused. */
  const flush = useCallback(async (): Promise<void> => {
    if (flushing.current || !profileId || activeProfile.current !== profileId) {
      return;
    }

    flushing.current = true;

    // Nothing here throws: reading the queue is guarded, and each item’s failure is caught and reported.
    for (const item of readQueue(profileId)) {
      if (activeProfile.current !== profileId) {
        break;
      }

      try {
        // oxlint-disable-next-line eslint/no-await-in-loop -- queued work is replayed in the order it was made.
        await (item.kind === "request"
          ? submitRequest({
              channel: "offline_queue",
              text: item.text,
              threadId: item.threadId,
            })
          : approve({
              // SAFETY: the id was taken from a Convex document of the actions table before queueing.
              actionId: item.actionId as Id<"actions">,
              fingerprint: item.fingerprint,
              method: "offline_queue",
              version: item.version,
            }));

        if (item.kind === "approve" && activeProfile.current === profileId) {
          toast.success(`Approval recorded: ${item.label}`);
        }
      } catch (error) {
        if (activeProfile.current !== profileId) {
          break;
        }

        toast.error(
          `${item.kind === "approve" ? item.label : "Your request"}: ${messageOf(error instanceof Error ? error : null)}`
        );

        // Keep unsent work after connection failures. A reconnect retries it.
        if (codeOf(error instanceof Error ? error : null) === null) {
          break;
        }
      }

      removeFromQueue(profileId, item.id);
    }

    flushing.current = false;
  }, [approve, submitRequest, profileId]);

  useEffect(() => {
    if (online && isAuthenticated && queue.length > 0) {
      void flush();
    }
  }, [online, isAuthenticated, queue.length, flush]);

  const value = useMemo<OfflineValue>(
    () => ({
      online,
      queue: queue.filter((item) => item.profileId === profileId),
      queueApproval: (item) => {
        if (!profileId) {
          return false;
        }

        return enqueue({
          ...item,
          id: `approve:${item.actionId}:${item.version}`,
          kind: "approve",
          profileId,
          queuedAt: Date.now(),
        });
      },
      queueRequest: (text, threadId) => {
        if (!profileId) {
          return false;
        }

        return enqueue({
          id: `request:${crypto.randomUUID()}`,
          kind: "request",
          profileId,
          queuedAt: Date.now(),
          text,
          threadId,
        });
      },
    }),
    [online, queue, profileId]
  );

  return <OfflineContext value={value}>{children}</OfflineContext>;
};

const useOffline = (): OfflineValue => {
  const value = use(OfflineContext);

  if (value === null) {
    throw new Error("useOffline must be used inside OfflineQueueProvider.");
  }

  return value;
};

export { OfflineQueueProvider, useOffline };

/**
 * Work started while offline. Requests and approvals are kept in localStorage
 * (they survive a refresh) and sent when the connection returns. The server
 * treats a queued approval like a fresh one: it re-checks identity,
 * permissions, the exact version, and spending, and refuses if anything changed.
 */
import { z } from "zod";

// Never replay the old, unbound v1 queue into whichever account signs in next.
const queueKey = (profileId: string): string =>
  `lifelink:offline-queue:v2:${profileId}`;

const queuedSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string(),
    kind: z.literal("request"),
    profileId: z.string(),
    queuedAt: z.number(),
    text: z.string(),
    threadId: z.string(),
  }),
  z.object({
    actionId: z.string(),
    fingerprint: z.string(),
    id: z.string(),
    kind: z.literal("approve"),
    label: z.string(),
    profileId: z.string(),
    queuedAt: z.number(),
    version: z.number(),
  }),
]);

const queueSchema = z.array(queuedSchema);

type QueuedItem = z.infer<typeof queuedSchema>;

const readQueue = (profileId: string): QueuedItem[] => {
  try {
    const parsed = queueSchema.safeParse(
      JSON.parse(localStorage.getItem(queueKey(profileId)) ?? "[]")
    );

    return parsed.success
      ? parsed.data.filter((item) => item.profileId === profileId)
      : [];
  } catch {
    return [];
  }
};

const writeQueue = (profileId: string, items: QueuedItem[]): boolean => {
  try {
    localStorage.setItem(queueKey(profileId), JSON.stringify(items));
  } catch {
    return false;
  }

  globalThis.dispatchEvent(new Event("lifelink:queue"));

  return true;
};

const enqueue = (item: QueuedItem): boolean =>
  writeQueue(item.profileId, [
    ...readQueue(item.profileId).filter((existing) => existing.id !== item.id),
    item,
  ]);

const removeFromQueue = (profileId: string, id: string): void => {
  writeQueue(
    profileId,
    readQueue(profileId).filter((item) => item.id !== id)
  );
};

export { enqueue, readQueue, removeFromQueue };

export type { QueuedItem };

import { describe, expect, it } from "vitest";

import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { newBackend, ownerWithContact } from "./harness";
import type { Backend } from "./harness";

/**
 * Store a file the way an upload URL would. convex-test doesn't record the
 * Content-Type that real uploads carry, so it is written onto the metadata.
 */
const upload = async (
  backend: Backend,
  contentType: string
): Promise<Id<"_storage">> =>
  await backend.run(async (ctx) => {
    const storageId = await ctx.storage.store(
      new Blob([new Uint8Array(64)], { type: contentType })
    );

    // SAFETY: test-only; the system table is writable inside convex-test's run().
    await (
      ctx.db.patch as (
        id: Id<"_storage">,
        value: { contentType: string }
      ) => Promise<void>
    )(storageId, { contentType });

    return storageId;
  });

const exists = async (
  backend: Backend,
  storageId: Id<"_storage">
): Promise<boolean> =>
  await backend.run(
    async (ctx) => (await ctx.db.system.get("_storage", storageId)) !== null
  );

describe("message photos", () => {
  it("records an accepted photo", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);
    const storageId = await upload(backend, "image/jpeg");

    const photoId = await owner.mutation(api.messages.registerPhoto, {
      caption: null,
      contactId,
      storageId,
    });

    expect(photoId).not.toBeNull();
    await expect(exists(backend, storageId)).resolves.toBeTruthy();
  });

  it("deletes a refused file instead of leaving it in storage", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);
    const storageId = await upload(backend, "text/html");

    await expect(
      owner.mutation(api.messages.registerPhoto, {
        caption: null,
        contactId,
        storageId,
      })
    ).resolves.toBeNull();
    await expect(exists(backend, storageId)).resolves.toBeFalsy();
  });
});

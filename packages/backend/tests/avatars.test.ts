// @vitest-environment node
// Saving a picture runs sharp, a native module, so this file needs Node rather than edge-runtime.
import { AVATAR_SIZE, MAX_AVATAR_BYTES } from "@lifelink/contracts/avatar";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { newBackend, ownerWithContact, signUp } from "./harness";
import type { Backend } from "./harness";

const bytesOf = (buffer: Buffer): ArrayBuffer => new Uint8Array(buffer).buffer;

/** A phone-style JPEG carrying a GPS position and camera details. */
const cameraPhoto = async (): Promise<ArrayBuffer> =>
  bytesOf(
    await sharp({
      create: {
        background: { b: 90, g: 140, r: 200 },
        channels: 3,
        height: 900,
        width: 1600,
      },
    })
      .withExif({
        IFD0: { Make: "Phone Maker", Model: "Camera 12" },
        IFD3: { GPSLatitude: "40/1 26/1 46/1", GPSLatitudeRef: "N" },
      })
      .jpeg()
      .toBuffer()
  );

const storedFiles = async (backend: Backend): Promise<Id<"_storage">[]> =>
  await backend.run(async (ctx) => {
    const files = await ctx.db.system.query("_storage").collect();

    return files.map((file) => file._id);
  });

const storedImage = async (
  backend: Backend,
  storageId: Id<"_storage">
): Promise<sharp.Metadata> => {
  // run() returns Convex values, so read the bytes inside it.
  const bytes = await backend.run(async (ctx) => {
    const blob = await ctx.storage.get(storageId);

    return blob === null ? null : await blob.arrayBuffer();
  });

  if (bytes === null) {
    throw new Error("The stored picture is missing.");
  }

  return await sharp(bytes).metadata();
};

describe("contact pictures", () => {
  it("re-encodes on the server: square, small, WebP, no metadata", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    const photo = await cameraPhoto();

    // The upload really carries camera and GPS data for the server to strip.
    const original = await sharp(photo).metadata();

    expect(original.exif).toBeInstanceOf(Buffer);

    await expect(
      owner.action(api.avatars.save, { contactId, image: photo })
    ).resolves.toStrictEqual({ saved: true });

    const [listed] = await owner.query(api.contacts.list, {});

    expect(listed?.avatarUrl).toBeTypeOf("string");

    if (!listed?.avatarId) {
      throw new Error("The contact has no picture.");
    }

    const stored = await storedImage(backend, listed.avatarId);

    expect({
      exif: stored.exif,
      format: stored.format,
      height: stored.height,
      icc: stored.icc,
      width: stored.width,
    }).toStrictEqual({
      exif: undefined,
      format: "webp",
      height: AVATAR_SIZE,
      icc: undefined,
      width: AVATAR_SIZE,
    });
  });

  it("replaces and removes the stored file", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    await owner.action(api.avatars.save, {
      contactId,
      image: await cameraPhoto(),
    });
    await owner.action(api.avatars.save, {
      contactId,
      image: await cameraPhoto(),
    });

    await expect(storedFiles(backend)).resolves.toHaveLength(1);

    await owner.mutation(api.contacts.removeAvatar, { contactId });

    await expect(storedFiles(backend)).resolves.toHaveLength(0);

    const [cleared] = await owner.query(api.contacts.list, {});

    expect(cleared?.avatarUrl).toBeNull();
  });

  it("refuses oversized, non-image, and decompression-bomb uploads without storing them", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    // Tiny on disk, but 100 million pixels once decoded.
    const bomb = bytesOf(
      await sharp({
        create: {
          background: "#ffffff",
          channels: 3,
          height: 10_000,
          width: 10_000,
        },
      })
        .png()
        .toBuffer()
    );

    const uploads = [
      new Uint8Array(MAX_AVATAR_BYTES + 1).buffer,
      new TextEncoder().encode("<svg onload=alert(1)>").buffer,
      bomb,
    ];

    const results = await Promise.all(
      uploads.map(
        async (image) =>
          await owner.action(api.avatars.save, { contactId, image })
      )
    );

    expect(results).toStrictEqual([
      { saved: false },
      { saved: false },
      { saved: false },
    ]);
    await expect(storedFiles(backend)).resolves.toHaveLength(0);
  });

  it("won't let someone else picture a contact they don't own", async () => {
    const backend = newBackend();
    const { contactId } = await ownerWithContact(backend, false);

    const { person: stranger } = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "owner-2",
    });

    await expect(
      stranger.action(api.avatars.save, {
        contactId,
        image: await cameraPhoto(),
      })
    ).rejects.toThrow(/could not be found/u);

    await expect(
      stranger.mutation(api.contacts.removeAvatar, { contactId })
    ).rejects.toThrow(/could not be found/u);

    await expect(storedFiles(backend)).resolves.toHaveLength(0);
  });

  it("deletes the picture when the contact is removed", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    await owner.action(api.avatars.save, {
      contactId,
      image: await cameraPhoto(),
    });
    await owner.mutation(api.contacts.remove, { contactId });

    await expect(storedFiles(backend)).resolves.toHaveLength(0);
  });
});

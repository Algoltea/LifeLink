import { describe, expect, it } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import {
  DAY,
  connectFamily,
  newBackend,
  onlyAction,
  ownerWithContact,
  signUp,
} from "./harness";
import type { Backend } from "./harness";

describe("family access", () => {
  it("shows only the granted scopes and stops at once when revoked", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    await owner.mutation(api.appointments.create, {
      location: "Riverside Family Medicine",
      notes: null,
      startsAt: Date.now() + DAY,
      title: "Dr. Patel",
    });

    const { family, grantId } = await connectFamily(backend, owner, [
      "appointments.view",
    ]);

    const view = await family.query(api.family.overview, { ownerId });

    const visible = {
      appointments: view?.appointments?.length,
      groceries: view?.groceries,
      photos: view?.photos,
      reminders: view?.reminders,
      scamAlerts: view?.scamAlerts,
      scopes: view?.scopes,
    };

    expect(visible).toStrictEqual({
      appointments: 1,
      groceries: null,
      photos: null,
      reminders: null,
      scamAlerts: null,
      scopes: ["appointments.view"],
    });

    await owner.mutation(api.sharing.revoke, { grantId });

    await expect(
      family.query(api.family.overview, { ownerId })
    ).resolves.toBeNull();
  });

  it("keeps permissions tied to the correct contact when names match", async () => {
    const backend = newBackend();
    const { owner, contactId } = await ownerWithContact(backend, false);

    const otherContactId = await owner.mutation(api.contacts.create, {
      channels: [
        {
          address: "another-sam@example.com",
          channel: "email",
          preferred: true,
        },
      ],
      name: "Sam Alvarez",
      relationship: "Friend",
      trusted: true,
    });

    const first = await owner.mutation(api.sharing.createInvite, {
      contactId,
      expiresInDays: null,
      scopes: ["appointments.view"],
    });

    const second = await owner.mutation(api.sharing.createInvite, {
      contactId: otherContactId,
      expiresInDays: 7,
      scopes: ["groceries.view"],
    });

    const grants = await owner.query(api.sharing.listGrants, {});

    expect(grants.find((grant) => grant.id === first.grantId)).toMatchObject({
      contactId,
      scopes: ["appointments.view"],
      state: "invited",
    });
    expect(grants.find((grant) => grant.id === second.grantId)).toMatchObject({
      contactId: otherContactId,
      scopes: ["groceries.view"],
      state: "invited",
    });

    await owner.mutation(api.sharing.updateScopes, {
      grantId: first.grantId,
      scopes: ["rides.view"],
    });
    await owner.mutation(api.sharing.revoke, { grantId: second.grantId });
    const updated = await owner.query(api.sharing.listGrants, {});

    expect(
      updated.find((grant) => grant.contactId === contactId)
    ).toMatchObject({ scopes: ["rides.view"], state: "invited" });
    expect(
      updated.find((grant) => grant.contactId === otherContactId)
    ).toMatchObject({ scopes: ["groceries.view"], state: "revoked" });

    const { person: stranger } = await signUp(backend, {
      demo: false,
      name: "Another Owner",
      role: "owner",
      subject: "another-owner",
    });

    await expect(
      stranger.query(api.sharing.listGrants, {})
    ).resolves.toStrictEqual([]);
  });

  it("denies an expired grant", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const { family, grantId } = await connectFamily(backend, owner, [
      "appointments.view",
    ]);

    await backend.run(async (ctx) => {
      await ctx.db.patch(grantId, { expiresAt: Date.now() - 1000 });
    });

    await expect(
      family.query(api.family.overview, { ownerId })
    ).resolves.toBeNull();
  });

  it("gives someone without a grant nothing", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    await connectFamily(backend, owner, ["appointments.view"]);

    const { person: stranger } = await signUp(backend, {
      demo: false,
      name: "Pat Stranger",
      role: "family",
      subject: "stranger",
    });

    await expect(
      stranger.query(api.family.overview, { ownerId })
    ).resolves.toBeNull();
  });

  it("does not let a family member approve the owner's actions", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);
    const { family } = await connectFamily(backend, owner, ["rides.view"]);

    const taskId = await owner.mutation(api.messages.draft, {
      body: "Hello",
      contactId,
      photoIds: [],
    });

    const { current, view } = await onlyAction(owner, taskId);

    await expect(
      family.mutation(api.actions.approve, {
        actionId: view.action._id,
        fingerprint: current.fingerprint,
        method: "tap",
        version: current.version,
      })
    ).rejects.toThrow(/owner_only/u);
  });
});

const storePhoto = async (
  backend: Backend,
  ownerId: Id<"profiles">
): Promise<Id<"photos">> => {
  const storageId = await backend.run(
    async (ctx) =>
      await ctx.storage.store(new Blob(["jpeg"], { type: "image/jpeg" }))
  );

  return await backend.run(
    async (ctx) =>
      await ctx.db.insert("photos", {
        caption: null,
        contactId: null,
        contentType: "image/jpeg",
        createdAt: Date.now(),
        ownerId,
        sharedWithCircle: false,
        storageId,
        uploadedByProfileId: ownerId,
      })
  );
};

describe("photo delivery", () => {
  it("allows the owner, and a grantee only for shared photos with photos.view", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const photoId = await storePhoto(backend, ownerId);

    const allowed = async (authUserId: string): Promise<boolean> => {
      const result = await backend.query(internal.photos.authorizeDownload, {
        authUserId,
        photoId,
      });

      return result !== null;
    };

    const { grantId } = await connectFamily(backend, owner, [
      "appointments.view",
    ]);

    const before = {
      family: await allowed("family-1"),
      owner: await allowed("owner-1"),
    };

    await owner.mutation(api.photos.setShared, { photoId, shared: true });

    const sharedWithoutScope = await allowed("family-1");

    await owner.mutation(api.sharing.updateScopes, {
      grantId,
      scopes: ["appointments.view", "photos.view"],
    });

    const sharedWithScope = await allowed("family-1");

    await owner.mutation(api.photos.setShared, { photoId, shared: false });

    const unshared = {
      family: await allowed("family-1"),
      stranger: await allowed("someone-else"),
    };

    expect(before).toStrictEqual({ family: false, owner: true });
    expect({ sharedWithScope, sharedWithoutScope }).toStrictEqual({
      sharedWithScope: true,
      sharedWithoutScope: false,
    });
    expect(unshared).toStrictEqual({ family: false, stranger: false });
  });
});

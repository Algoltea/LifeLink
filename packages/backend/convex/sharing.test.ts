import { afterEach, describe, expect, it, vi } from "vitest";

import {
  connectFamily,
  DAY,
  newBackend,
  ownerWithContact,
  signUp,
} from "../tests/harness";
import { api, internal } from "./_generated/api";

const invitationFixture = async () => {
  const backend = newBackend();
  const owner = await ownerWithContact(backend, false);

  const invite = await owner.owner.mutation(api.sharing.createInvite, {
    contactId: owner.contactId,
    expiresInDays: null,
    scopes: ["appointments.view"],
  });

  const family = await signUp(backend, {
    demo: false,
    name: "Invited Family",
    role: "family",
    subject: "invited-family",
  });

  return {
    ...owner,
    backend,
    family: family.person,
    familyId: family.id,
    invite,
  };
};

describe("invitation redemption", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([-1, 0, 1])(
    "checks the 14-day boundary at offset %i ms",
    async (offset) => {
      const { backend, owner, invite, family } = await invitationFixture();

      const grant = await backend.run(
        async (ctx) => await ctx.db.get(invite.grantId)
      );

      if (grant === null) {
        throw new Error("Expected invitation grant.");
      }

      expect(invite.validUntil).toBe(grant.createdAt + 14 * DAY);
      vi.spyOn(Date, "now").mockReturnValue(invite.validUntil + offset);
      await expect(
        owner.query(api.sharing.listGrants, {})
      ).resolves.toStrictEqual([
        expect.objectContaining({ state: offset < 0 ? "invited" : "expired" }),
      ]);

      const acceptance = family.mutation(api.sharing.acceptInvite, {
        code: invite.code,
      });

      const [result] = await Promise.allSettled([acceptance]);
      expect(result?.status).toBe(offset < 0 ? "fulfilled" : "rejected");
    }
  );

  it.each([-1, 0, 1])(
    "checks an earlier sharing end at offset %i ms",
    async (offset) => {
      const { backend, owner, invite, family, ownerId } =
        await invitationFixture();

      const expiresAt = invite.validUntil - 7 * DAY;
      await backend.run(
        async (ctx) => await ctx.db.patch(invite.grantId, { expiresAt })
      );
      vi.spyOn(Date, "now").mockReturnValue(expiresAt + offset);

      const acceptance = family.mutation(api.sharing.acceptInvite, {
        code: invite.code,
      });

      const [result] = await Promise.allSettled([acceptance]);
      expect(result?.status).toBe(offset < 0 ? "fulfilled" : "rejected");
      vi.spyOn(Date, "now").mockReturnValue(expiresAt + Math.max(offset, 0));

      const access = await Promise.all([
        family.query(api.sharing.sharedWithMe, {}),
        family.query(api.family.overview, { ownerId }),
        owner.query(api.sharing.listGrants, {}),
      ]);

      expect(access).toStrictEqual([
        [],
        null,
        [expect.objectContaining({ state: "expired" })],
      ]);
    }
  );

  it("normalizes lowercase and separators and never returns the stored hash to clients", async () => {
    const { backend, owner, ownerId, invite, family, familyId, contactId } =
      await invitationFixture();

    const code = `  ${invite.code.toLowerCase().replace("-", " ")}  `;
    await expect(
      family.mutation(api.sharing.acceptInvite, { code })
    ).resolves.toBe(ownerId);

    const grant = await backend.run(
      async (ctx) => await ctx.db.get(invite.grantId)
    );

    expect(grant).toMatchObject({
      acceptedAt: expect.any(Number),
      granteeProfileId: familyId,
      inviteCodeHash: expect.stringMatching(/^[a-f0-9]{64}$/u),
    });
    expect(JSON.stringify(grant)).not.toContain(invite.code);
    await expect(
      backend.run(async (ctx) => await ctx.db.get(contactId))
    ).resolves.toMatchObject({ linkedProfileId: familyId });
    const [listed] = await owner.query(api.sharing.listGrants, {});
    expect(Object.keys(listed ?? {})).toStrictEqual([
      "acceptedAt",
      "contactId",
      "contactName",
      "createdAt",
      "expiresAt",
      "id",
      "scopes",
      "state",
    ]);
  });

  it.each(["", "   ", "wrong-code", "AAAAA-AAAAA"])(
    'rejects invalid code "%s" without consuming the invitation',
    async (code) => {
      const { family, invite, ownerId } = await invitationFixture();
      await expect(
        family.mutation(api.sharing.acceptInvite, { code })
      ).rejects.toThrow(/invalid_code/u);
      await expect(
        family.mutation(api.sharing.acceptInvite, { code: invite.code })
      ).resolves.toBe(ownerId);
    }
  );

  it("consumes a code once for both its redeemer and another family member", async () => {
    const { backend, family, invite, familyId } = await invitationFixture();

    const other = await signUp(backend, {
      demo: false,
      name: "Other Family",
      role: "family",
      subject: "other-family",
    });

    await family.mutation(api.sharing.acceptInvite, { code: invite.code });

    await Promise.all(
      [family, other.person].map(async (person) => {
        await expect(
          person.mutation(api.sharing.acceptInvite, { code: invite.code })
        ).rejects.toThrow(/invalid_code/u);
      })
    );

    await expect(
      backend.run(async (ctx) => await ctx.db.get(invite.grantId))
    ).resolves.toMatchObject({ granteeProfileId: familyId });
    await expect(
      other.person.query(api.sharing.sharedWithMe, {})
    ).resolves.toStrictEqual([]);
  });

  it("allows only one of two simultaneously submitted redemptions", async () => {
    const { backend, family, invite } = await invitationFixture();

    const other = await signUp(backend, {
      demo: false,
      name: "Other Family",
      role: "family",
      subject: "other-family",
    });

    // convex-test serializes top-level transactions; this checks competing submissions,
    // while production OCC retry behavior still requires deployment-level verification.
    const results = await Promise.allSettled(
      [family, other.person].map(
        async (person) =>
          await person.mutation(api.sharing.acceptInvite, { code: invite.code })
      )
    );

    expect(results.map((result) => result.status).toSorted()).toStrictEqual([
      "fulfilled",
      "rejected",
    ]);

    const shared = await Promise.all(
      [family, other.person].map(
        async (person) => await person.query(api.sharing.sharedWithMe, {})
      )
    );

    expect(shared.flat()).toHaveLength(1);
  });

  it("rejects anonymous and unfinished accounts before consuming a valid code", async () => {
    const { backend, family, ownerId, invite } = await invitationFixture();

    await Promise.all(
      [backend, backend.withIdentity({ subject: "unfinished" })].map(
        async (person) => {
          await expect(
            person.mutation(api.sharing.acceptInvite, { code: invite.code })
          ).rejects.toThrow(/not_signed_in/u);
          await expect(
            person.query(api.sharing.sharedWithMe, {})
          ).rejects.toThrow(/not_signed_in/u);
          await expect(
            person.query(api.family.overview, { ownerId })
          ).rejects.toThrow(/not_signed_in/u);
        }
      )
    );

    await expect(
      family.mutation(api.sharing.acceptInvite, { code: invite.code })
    ).resolves.toBe(ownerId);
  });

  it("rejects self redemption and other owners without consuming the code", async () => {
    const { backend, owner, family, ownerId, invite } =
      await invitationFixture();

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    await expect(
      owner.mutation(api.sharing.acceptInvite, { code: invite.code })
    ).rejects.toThrow(/invalid_code/u);
    await expect(
      other.person.mutation(api.sharing.acceptInvite, { code: invite.code })
    ).rejects.toThrow(/family_only/u);
    await expect(
      family.mutation(api.sharing.acceptInvite, { code: invite.code })
    ).resolves.toBe(ownerId);
  });

  it("rejects a revoked unused invitation and cannot revive it by changing scopes", async () => {
    const { owner, family, invite } = await invitationFixture();
    await owner.mutation(api.sharing.revoke, { grantId: invite.grantId });
    await owner.mutation(api.sharing.revoke, { grantId: invite.grantId });
    await expect(
      family.mutation(api.sharing.acceptInvite, { code: invite.code })
    ).rejects.toThrow(/invalid_code/u);
    await expect(
      owner.mutation(api.sharing.updateScopes, {
        grantId: invite.grantId,
        scopes: ["photos.view"],
      })
    ).rejects.toThrow(/revoked/u);
  });
});

describe("sharing authorization and rechecks", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requires owner authorization and ownership for invitation management", async () => {
    const { backend, owner, contactId, invite, family } =
      await invitationFixture();

    const other = await signUp(backend, {
      demo: false,
      name: "Other Owner",
      role: "owner",
      subject: "other-owner",
    });

    await Promise.all(
      [
        [backend, /not_signed_in/u] as const,
        [family, /owner_only/u] as const,
        [other.person, /not_found/u] as const,
      ].map(async ([person, error]) => {
        await expect(
          person.mutation(api.sharing.createInvite, {
            contactId,
            expiresInDays: null,
            scopes: ["photos.view"],
          })
        ).rejects.toThrow(error);
        await expect(
          person.mutation(api.sharing.updateScopes, {
            grantId: invite.grantId,
            scopes: [],
          })
        ).rejects.toThrow(error);
        await expect(
          person.mutation(api.sharing.revoke, { grantId: invite.grantId })
        ).rejects.toThrow(error);
      })
    );

    await expect(
      owner.mutation(api.sharing.createInvite, {
        contactId,
        expiresInDays: null,
        scopes: [],
      })
    ).rejects.toThrow(/invalid/u);
    await expect(owner.query(api.sharing.listGrants, {})).resolves.toHaveLength(
      1
    );
  });

  it("deduplicates scopes and rechecks removals including photo downloads and all-scope removal", async () => {
    const { backend, owner, ownerId, invite, family } =
      await invitationFixture();

    await owner.mutation(api.sharing.updateScopes, {
      grantId: invite.grantId,
      scopes: ["photos.view", "appointments.view", "photos.view"],
    });
    await family.mutation(api.sharing.acceptInvite, { code: invite.code });

    const photoId = await backend.run(async (ctx) => {
      const storageId = await ctx.storage.store(
        new Blob(["jpeg"], { type: "image/jpeg" })
      );

      return await ctx.db.insert("photos", {
        caption: "Shared photo",
        contactId: null,
        contentType: "image/jpeg",
        createdAt: Date.now(),
        ownerId,
        sharedWithCircle: true,
        storageId,
        uploadedByProfileId: ownerId,
      });
    });

    await expect(
      family.query(api.family.overview, { ownerId })
    ).resolves.toMatchObject({
      photos: [expect.objectContaining({ id: photoId })],
      scopes: ["appointments.view", "photos.view"],
    });
    await expect(
      backend.query(internal.photos.authorizeDownload, {
        authUserId: "invited-family",
        photoId,
      })
    ).resolves.not.toBeNull();
    await owner.mutation(api.sharing.updateScopes, {
      grantId: invite.grantId,
      scopes: [],
    });
    await expect(
      family.query(api.family.overview, { ownerId })
    ).resolves.toMatchObject({
      appointments: null,
      groceries: null,
      photos: null,
      reminders: null,
      scamAlerts: null,
      scopes: [],
      updates: [],
    });
    await expect(
      backend.query(internal.photos.authorizeDownload, {
        authUserId: "invited-family",
        photoId,
      })
    ).resolves.toBeNull();
    await owner.mutation(api.sharing.updateScopes, {
      grantId: invite.grantId,
      scopes: ["photos.view"],
    });
    await owner.mutation(api.sharing.revoke, { grantId: invite.grantId });
    await expect(
      Promise.all([
        family.query(api.sharing.sharedWithMe, {}),
        family.query(api.family.overview, { ownerId }),
        backend.query(internal.photos.authorizeDownload, {
          authUserId: "invited-family",
          photoId,
        }),
      ])
    ).resolves.toStrictEqual([[], null, null]);
  });

  it("unions live grants and removes only the revoked grant's scopes and addressed updates", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const first = await connectFamily(backend, owner, ["appointments.view"]);
    const second = await connectFamily(backend, owner, ["photos.view"]);
    await backend.run(async (ctx) => {
      await Promise.all(
        [first.grantId, second.grantId].map(async (grantId) => {
          await ctx.db.insert("familyUpdates", {
            createdAt: Date.now(),
            granteeIds: [grantId],
            mode: "live",
            ownerId,
            scope: "photos.view",
            sourceActionId: null,
            text:
              grantId === first.grantId
                ? "First grant only"
                : "Second grant only",
          });
        })
      );
    });
    await expect(
      first.family.query(api.family.overview, { ownerId })
    ).resolves.toMatchObject({ scopes: ["appointments.view", "photos.view"] });
    await owner.mutation(api.sharing.revoke, { grantId: first.grantId });
    await expect(
      first.family.query(api.family.overview, { ownerId })
    ).resolves.toMatchObject({
      appointments: null,
      scopes: ["photos.view"],
      updates: [expect.objectContaining({ text: "Second grant only" })],
    });
    await expect(
      first.family.query(api.sharing.sharedWithMe, {})
    ).resolves.toStrictEqual([
      expect.objectContaining({ grantId: second.grantId }),
    ]);
  });
});

describe("family conversation permissions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips a revoked first linked contact and uses the remaining live contact's conversation", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    const first = await connectFamily(backend, owner, ["appointments.view"]);
    await first.family.mutation(api.messages.replyInApp, {
      body: "Old contact thread",
      ownerId,
    });
    const second = await connectFamily(backend, owner, ["photos.view"]);
    await owner.mutation(api.sharing.revoke, { grantId: first.grantId });
    await first.family.mutation(api.messages.replyInApp, {
      body: "Live contact thread",
      ownerId,
    });
    await expect(
      first.family.query(api.messages.inAppThreadWith, { ownerId })
    ).resolves.toStrictEqual([
      expect.objectContaining({ body: "Live contact thread" }),
    ]);

    const liveGrant = await backend.run(
      async (ctx) => await ctx.db.get(second.grantId)
    );

    const replies = await backend.run(
      async (ctx) => await ctx.db.query("messages").collect()
    );

    expect(
      replies.find((message) => message.body === "Live contact thread")
    ).toMatchObject({ contactId: liveGrant?.contactId });
    await owner.mutation(api.sharing.revoke, { grantId: second.grantId });
    await expect(
      first.family.query(api.messages.inAppThreadWith, { ownerId })
    ).resolves.toBeNull();
  });

  it.each(["revoked", "expired"] as const)(
    "blocks conversation reads and replies once sharing is %s",
    async (ending) => {
      const { backend, owner, ownerId, invite, family } =
        await invitationFixture();

      await family.mutation(api.sharing.acceptInvite, { code: invite.code });
      await family.mutation(api.messages.replyInApp, {
        body: "Family reply",
        ownerId,
      });
      await expect(
        family.query(api.messages.inAppThreadWith, { ownerId })
      ).resolves.toStrictEqual([
        expect.objectContaining({ body: "Family reply" }),
      ]);

      if (ending === "revoked") {
        await owner.mutation(api.sharing.revoke, { grantId: invite.grantId });
      } else {
        const now = Date.now();
        await backend.run(
          async (ctx) => await ctx.db.patch(invite.grantId, { expiresAt: now })
        );
        vi.spyOn(Date, "now").mockReturnValue(now);
      }

      await expect(
        family.query(api.messages.inAppThreadWith, { ownerId })
      ).resolves.toBeNull();
      await expect(
        family.mutation(api.messages.replyInApp, {
          body: "Must not arrive",
          ownerId,
        })
      ).rejects.toThrow(/not connected/u);
    }
  );
});

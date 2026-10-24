import { describe, expect, it } from "vitest";

import { api } from "../convex/_generated/api";
import { connectFamily, newBackend, signUp } from "./harness";

const setupList = async () => {
  const backend = newBackend();

  const { person } = await signUp(backend, {
    demo: false,
    name: "Ruth",
    role: "owner",
    subject: "grocery-owner",
  });

  const listId = await person.mutation(api.groceries.createList, {
    name: "Weekly",
  });

  return { backend, listId, person };
};

describe("grocery item validation", () => {
  it("unmarks every item while preserving list details and other lists", async () => {
    const { backend, listId, person } = await setupList();

    const otherId = await person.mutation(api.groceries.createList, {
      name: "Other",
    });

    await person.mutation(api.groceries.addItem, {
      estimatedCents: 450,
      listId,
      name: "Milk",
      quantity: 1,
      unit: "gallon",
    });
    await person.mutation(api.groceries.addItem, {
      estimatedCents: null,
      listId,
      name: "Apples",
      quantity: 2,
      unit: null,
    });

    const before = await backend.run(async (ctx) => {
      const list = await ctx.db.get(listId);

      if (!list) {
        throw new Error("Missing list");
      }

      await ctx.db.patch(listId, {
        budgetCents: 6000,
        items: list.items.map((item, index) => ({
          ...item,
          checked: index === 0,
        })),
        preferences: ["Low sodium"],
      });

      return await ctx.db.get(listId);
    });

    const otherBefore = await backend.run(
      async (ctx) => await ctx.db.get(otherId)
    );

    await person.mutation(api.groceries.unmarkAll, { listId });
    const after = await backend.run(async (ctx) => await ctx.db.get(listId));
    expect(after).toMatchObject({
      budgetCents: 6000,
      items: before?.items.map((item) => ({ ...item, checked: false })),
      name: "Weekly",
      preferences: ["Low sodium"],
    });
    await expect(
      backend.run(async (ctx) => await ctx.db.get(otherId))
    ).resolves.toStrictEqual(otherBefore);
    await person.mutation(api.groceries.unmarkAll, { listId: otherId });
    await person.mutation(api.groceries.unmarkAll, { listId });
  });

  it("deletes only the selected list and revokes its legacy permissions", async () => {
    const { backend, listId, person } = await setupList();

    const otherId = await person.mutation(api.groceries.createList, {
      name: "Keep me",
    });

    const permissionId = await backend.run(async (ctx) => {
      const list = await ctx.db.get(listId);

      if (!list) {
        throw new Error("Missing list");
      }

      return await ctx.db.insert("recurringAuthorizations", {
        actionKind: "grocery_handoff",
        createdAt: Date.now(),
        expiresAt: Date.now() + 86_400_000,
        listId,
        maxPerUseCents: 5000,
        maxUses: 3,
        ownerId: list.ownerId,
        revokedAt: null,
        usesCount: 0,
      });
    });

    await person.mutation(api.groceries.deleteList, { listId });
    await expect(
      backend.run(async (ctx) => await ctx.db.get(listId))
    ).resolves.toBeNull();
    await expect(
      backend.run(async (ctx) => await ctx.db.get(otherId))
    ).resolves.toMatchObject({ name: "Keep me" });

    const permission = await backend.run(
      async (ctx) => await ctx.db.get(permissionId)
    );

    expect(permission?.revokedAt).toBeTypeOf("number");
    await person.mutation(api.groceries.deleteList, { listId: otherId });
    const result = await person.query(api.groceries.lists, {});
    expect(result.lists).toStrictEqual([]);
  });

  it.each([
    { mutation: api.groceries.deleteList, name: "deleting" },
    { mutation: api.groceries.unmarkAll, name: "resetting" },
  ])(
    "prevents other owners, family viewers, and signed-out users from $name lists",
    async ({ mutation }) => {
      const { backend, listId, person } = await setupList();

      const { person: stranger } = await signUp(backend, {
        demo: false,
        name: "Other owner",
        role: "owner",
        subject: "other-owner",
      });

      const { family } = await connectFamily(backend, person, [
        "groceries.view",
      ]);

      await expect(stranger.mutation(mutation, { listId })).rejects.toThrow(
        /could not be found/u
      );
      await expect(family.mutation(mutation, { listId })).rejects.toThrow(
        /Only the account owner/u
      );
      await expect(backend.mutation(mutation, { listId })).rejects.toThrow(
        /sign in/u
      );
      await expect(
        backend.run(async (ctx) => await ctx.db.get(listId))
      ).resolves.toMatchObject({ name: "Weekly" });
    }
  );

  it.each([0, -1, null, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid quantity %s without saving an item",
    async (quantity) => {
      const { backend, listId, person } = await setupList();
      await expect(
        person.mutation(api.groceries.addItem, {
          estimatedCents: null,
          listId,
          name: "Apples",
          quantity,
          unit: "lb",
        })
      ).rejects.toThrow(/greater than 0/u);
      await expect(
        backend.run(async (ctx) => {
          const list = await ctx.db.get(listId);

          return list?.items;
        })
      ).resolves.toStrictEqual([]);
    }
  );

  it("requires whole packages and a recognized unit", async () => {
    const { listId, person } = await setupList();

    await Promise.all(
      [null, "can", "box", "pack"].map(async (unit) => {
        await expect(
          person.mutation(api.groceries.addItem, {
            estimatedCents: null,
            listId,
            name: "Soup",
            quantity: 1.5,
            unit,
          })
        ).rejects.toThrow(/whole number/u);
      })
    );

    await expect(
      person.mutation(api.groceries.addItem, {
        estimatedCents: null,
        listId,
        name: "Soup",
        quantity: 1,
        unit: "nonsense",
      })
    ).rejects.toThrow(/Choose a unit/u);
  });

  it("keeps fractional measurements, free items, and unknown estimates distinct", async () => {
    const { backend, listId, person } = await setupList();
    await person.mutation(api.groceries.addItem, {
      estimatedCents: 0,
      listId,
      name: "Free apples",
      quantity: 0.5,
      unit: "lb",
    });
    await person.mutation(api.groceries.addItem, {
      estimatedCents: null,
      listId,
      name: "Milk",
      quantity: 1.5,
      unit: "L",
    });

    const items = await backend.run(async (ctx) => {
      const list = await ctx.db.get(listId);

      return list?.items;
    });

    expect(items).toMatchObject([
      { estimatedCents: 0, quantity: 0.5, unit: "lb" },
      { estimatedCents: null, quantity: 1.5, unit: "L" },
    ]);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid estimates in cents: %s",
    async (estimatedCents) => {
      const { listId, person } = await setupList();
      await expect(
        person.mutation(api.groceries.addItem, {
          estimatedCents,
          listId,
          name: "Apples",
          quantity: 1,
          unit: null,
        })
      ).rejects.toThrow(/whole cents/u);
    }
  );

  it("validates item updates and preserves values after a rejected edit", async () => {
    const { backend, listId, person } = await setupList();
    await person.mutation(api.groceries.addItem, {
      estimatedCents: 350,
      listId,
      name: "Soup",
      quantity: 2,
      unit: "can",
    });
    const list = await backend.run(async (ctx) => await ctx.db.get(listId));
    const itemId = list?.items[0]?.id;

    if (!itemId) {
      throw new Error("Expected the saved item.");
    }

    await Promise.all(
      [0, -1, 0.5, null, Number.NaN].map(async (quantity) => {
        await expect(
          person.mutation(api.groceries.updateItem, {
            itemId,
            listId,
            quantity,
          })
        ).rejects.toThrow(/greater than 0|whole number/u);
      })
    );

    await expect(
      person.mutation(api.groceries.updateItem, {
        estimatedCents: -1,
        itemId,
        listId,
      })
    ).rejects.toThrow(/whole cents/u);

    const unchanged = await backend.run(async (ctx) => {
      const saved = await ctx.db.get(listId);

      return saved?.items[0];
    });

    expect(unchanged).toMatchObject({ estimatedCents: 350, quantity: 2 });
    await person.mutation(api.groceries.updateItem, {
      checked: true,
      estimatedCents: 0,
      itemId,
      listId,
      quantity: 3,
    });
    await expect(
      backend.run(async (ctx) => {
        const saved = await ctx.db.get(listId);

        return saved?.items[0];
      })
    ).resolves.toMatchObject({ checked: true, estimatedCents: 0, quantity: 3 });
  });
});

const addThree = async (
  person: Awaited<ReturnType<typeof setupList>>["person"],
  listId: Awaited<ReturnType<typeof setupList>>["listId"]
) => {
  for (const name of ["Milk", "Bread", "Eggs"]) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- items keep their order.
    await person.mutation(api.groceries.addItem, {
      estimatedCents: 300,
      listId,
      name,
      quantity: 1,
      unit: null,
    });
  }
};

describe("undoing removals and reusing lists", () => {
  it("puts a removed item back in its place, once", async () => {
    const { backend, listId, person } = await setupList();
    await addThree(person, listId);

    const before = await backend.run(async (ctx) => await ctx.db.get(listId));
    const bread = before?.items[1];

    if (!bread) {
      throw new Error("Missing item");
    }

    const removed = await person.mutation(api.groceries.removeItem, {
      itemId: bread.id,
      listId,
    });

    expect(removed).toStrictEqual({ index: 1, item: bread });

    if (removed === null) {
      throw new Error("Nothing removed");
    }

    await person.mutation(api.groceries.restoreItem, { ...removed, listId });
    await person.mutation(api.groceries.restoreItem, { ...removed, listId });

    const after = await backend.run(async (ctx) => await ctx.db.get(listId));
    expect(after?.items).toStrictEqual(before?.items);
    await expect(
      person.mutation(api.groceries.removeItem, { itemId: "gone", listId })
    ).resolves.toBeNull();
  });

  it("keeps another person from restoring into a list they do not own", async () => {
    const { backend, listId, person } = await setupList();
    await addThree(person, listId);

    const { person: stranger } = await signUp(backend, {
      demo: false,
      name: "Stranger",
      role: "owner",
      subject: "grocery-stranger",
    });

    await expect(
      stranger.mutation(api.groceries.restoreItem, {
        index: 0,
        item: {
          checked: false,
          estimatedCents: null,
          id: "planted",
          name: "Planted",
          quantity: null,
          unit: null,
        },
        listId,
      })
    ).rejects.toThrow("That list could not be found.");
  });

  it("starts a new list from an old one without changing the old one", async () => {
    const { backend, listId, person } = await setupList();
    await addThree(person, listId);
    await person.mutation(api.groceries.setDetails, {
      budgetCents: 5000,
      listId,
      name: "Weekly",
      preferences: ["Low sodium"],
    });

    const original = await backend.run(async (ctx) => await ctx.db.get(listId));
    const first = original?.items[0];

    if (!first) {
      throw new Error("Missing item");
    }

    await person.mutation(api.groceries.updateItem, {
      checked: true,
      itemId: first.id,
      listId,
    });

    const copyId = await person.mutation(api.groceries.copyList, { listId });
    const copy = await backend.run(async (ctx) => await ctx.db.get(copyId));

    expect(copy).toMatchObject({
      budgetCents: 5000,
      name: "Weekly (copy)",
      preferences: ["Low sodium"],
    });
    expect(copy?.items.map((item) => [item.name, item.checked])).toStrictEqual([
      ["Milk", false],
      ["Bread", false],
      ["Eggs", false],
    ]);
    expect(
      copy?.items.some((item) =>
        original?.items.some((old) => old.id === item.id)
      )
    ).toBeFalsy();
    await expect(
      backend.run(async (ctx) => await ctx.db.get(listId))
    ).resolves.toMatchObject({ items: [{ checked: true }, {}, {}] });
  });
});

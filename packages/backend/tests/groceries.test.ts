import type { AisleSort } from "@lifelink/contracts/grocery-aisles";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
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

  it("adds a pasted list in one step, or nothing when any item is invalid", async () => {
    const { backend, listId, person } = await setupList();

    const names = () =>
      backend.run(async (ctx) => {
        const list = await ctx.db.get(listId);

        return list?.items.map((item) => [item.name, item.quantity, item.unit]);
      });

    await expect(
      person.mutation(api.groceries.addItems, {
        items: [
          { name: " Milk ", quantity: 1, unit: "gallon" },
          { name: "Apples", quantity: 6, unit: null },
        ],
        listId,
      })
    ).resolves.toBe(2);

    await expect(
      person.mutation(api.groceries.addItems, {
        items: [
          { name: "Bread", quantity: 1, unit: null },
          { name: "Soup", quantity: 1.5, unit: "can" },
        ],
        listId,
      })
    ).rejects.toThrow(/whole number/u);

    await expect(
      person.mutation(api.groceries.addItems, {
        items: Array.from({ length: 99 }, (_, index) => ({
          name: `Item ${index}`,
          quantity: 1,
          unit: null,
        })),
        listId,
      })
    ).rejects.toThrow(/list is full/u);

    await expect(names()).resolves.toStrictEqual([
      ["Milk", 1, "gallon"],
      ["Apples", 6, null],
    ]);
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
      name: expect.stringMatching(/^Weekly · [A-Z][a-z]{2} \d{1,2}$/u),
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

  it("gives practice accounts a long list, once", async () => {
    const backend = newBackend();

    const { id, person } = await signUp(backend, {
      demo: false,
      name: "Ruth",
      role: "owner",
      subject: "grocery-practice",
    });

    await backend.mutation(internal.demo.seed, { ownerId: id });
    await backend.mutation(internal.demo.seed, { ownerId: id });

    const { lists } = await person.query(api.groceries.lists, {});
    const long = lists.filter((list) => list.name.includes("practice"));

    expect(lists[0]?.name).toBe("Weekly groceries");
    expect(long).toHaveLength(1);
    expect(long[0]?.items.length).toBeGreaterThanOrEqual(60);
  });
});

describe("past lists and the usual list", () => {
  it("names copies for the day without piling up earlier dates", async () => {
    const { backend, listId, person } = await setupList();

    const firstId = await person.mutation(api.groceries.copyList, { listId });

    const secondId = await person.mutation(api.groceries.copyList, {
      listId: firstId,
    });

    const [first, second] = await backend.run(async (ctx) => [
      await ctx.db.get(firstId),
      await ctx.db.get(secondId),
    ]);

    expect(second?.name).toBe(first?.name);
  });

  it("moves a finished list to past lists and back", async () => {
    const { backend, listId, person } = await setupList();

    await person.mutation(api.groceries.archiveList, { listId });
    const archived = await backend.run(async (ctx) => await ctx.db.get(listId));
    expect(archived?.archivedAt).toBeTypeOf("number");

    await person.mutation(api.groceries.archiveList, { listId });
    await expect(
      backend.run(async (ctx) => await ctx.db.get(listId))
    ).resolves.toMatchObject({ archivedAt: archived?.archivedAt });

    await person.mutation(api.groceries.unarchiveList, { listId });
    const reopened = await backend.run(async (ctx) => await ctx.db.get(listId));
    expect(reopened?.archivedAt).toBeUndefined();
  });

  it("keeps one usual list at a time and does not copy the mark", async () => {
    const { listId, person } = await setupList();

    const otherId = await person.mutation(api.groceries.createList, {
      name: "Other",
    });

    await person.mutation(api.groceries.setUsual, { listId, usual: true });
    await person.mutation(api.groceries.setUsual, {
      listId: otherId,
      usual: true,
    });

    const copyId = await person.mutation(api.groceries.copyList, {
      listId: otherId,
    });

    const { lists } = await person.query(api.groceries.lists, {});
    const usual = lists.filter((list) => list.usual === true);

    expect(usual.map((list) => list._id)).toStrictEqual([otherId]);
    expect(lists.find((list) => list._id === copyId)?.usual).toBeUndefined();

    await person.mutation(api.groceries.setUsual, {
      listId: otherId,
      usual: false,
    });

    const after = await person.query(api.groceries.lists, {});
    expect(after.lists.some((list) => list.usual === true)).toBeFalsy();
  });

  it("shows the circle current lists only", async () => {
    const { backend, listId, person } = await setupList();

    const ownerId = await backend.run(async (ctx) => {
      const list = await ctx.db.get(listId);

      if (!list) {
        throw new Error("Missing list");
      }

      return list.ownerId;
    });

    await person.mutation(api.groceries.createList, { name: "This week" });
    await person.mutation(api.groceries.archiveList, { listId });

    const { family } = await connectFamily(backend, person, ["groceries.view"]);
    const view = await family.query(api.family.overview, { ownerId });

    expect(view?.groceries?.map((list) => list.name)).toStrictEqual([
      "This week",
    ]);
  });

  it("adds assistant items to this week's list, not the usual or a past one", async () => {
    const { backend, listId, person } = await setupList();

    const ownerId = await backend.run(async (ctx) => {
      const list = await ctx.db.get(listId);

      if (!list) {
        throw new Error("Missing list");
      }

      return list.ownerId;
    });

    await person.mutation(api.groceries.setUsual, { listId, usual: true });

    const thisWeekId = await person.mutation(api.groceries.copyList, {
      listId,
    });

    const finishedId = await person.mutation(api.groceries.createList, {
      name: "Finished",
    });

    await person.mutation(api.groceries.archiveList, { listId: finishedId });

    await backend.mutation(internal.assistant.applyProposalForOwner, {
      channel: "text",
      model: "test",
      ownerId,
      proposalJson: JSON.stringify({
        appointmentId: null,
        dateTimeAsSaid: null,
        dateTimeIso: null,
        groceryItems: [{ name: "Milk", quantity: 1, unit: null }],
        intent: "grocery_list",
        messageDraft: null,
        recipients: [],
        reminderTitle: null,
      }),
      request: "Add milk to my grocery list",
    });

    const { lists } = await person.query(api.groceries.lists, {});

    const names = (id: string) =>
      lists.find((list) => list._id === id)?.items.map((item) => item.name);

    expect(names(thisWeekId)).toStrictEqual(["Milk"]);
    expect(names(listId)).toStrictEqual([]);
    expect(names(finishedId)).toStrictEqual([]);
  });
});

type Setup = Awaited<ReturnType<typeof setupList>>;

const itemsOf = async (backend: Setup["backend"], listId: Setup["listId"]) => {
  const list = await backend.run(async (ctx) => await ctx.db.get(listId));

  return list?.items ?? [];
};

/** Appends plain items in one write, keeping the order given. */
const addNamed = async (
  backend: Setup["backend"],
  listId: Setup["listId"],
  names: string[]
) => {
  const existing = await itemsOf(backend, listId);

  await backend.run(async (ctx) => {
    await ctx.db.patch(listId, {
      items: [
        ...existing,
        ...names.map((name) => ({
          checked: false,
          estimatedCents: null,
          id: crypto.randomUUID(),
          name,
          quantity: 1,
          unit: null,
        })),
      ],
    });
  });
};

const aislesOf = async (backend: Setup["backend"], listId: Setup["listId"]) => {
  const items = await itemsOf(backend, listId);

  return items.map((item) => [item.name, item.aisle]);
};

const modelReply = (content: AisleSort) =>
  Response.json(
    {
      choices: [{ message: { content: JSON.stringify(content) } }],
      model: "test-model",
    },
    { status: 200 }
  );

describe("sorting by store section", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses the assistant's sections and puts the list in walking order", async () => {
    const { backend, listId, person } = await setupList();
    await addNamed(backend, listId, ["Ice cream", "Tortillas", "Apples"]);
    const before = await itemsOf(backend, listId);
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValueOnce(
      modelReply({
        items: [
          { aisle: "frozen", number: 1 },
          { aisle: "pantry", number: 2 },
        ],
      })
    );

    const outcome = await person.action(api.groceries.sortByAisle, {
      listId,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(outcome).toMatchObject({ localReason: null, sorted: 3 });
    await expect(aislesOf(backend, listId)).resolves.toStrictEqual([
      ["Apples", "produce"],
      ["Tortillas", "pantry"],
      ["Ice cream", "frozen"],
    ]);

    await person.mutation(api.groceries.restoreArrangement, {
      arrangement: outcome.previous,
      listId,
    });

    await expect(itemsOf(backend, listId)).resolves.toStrictEqual(before);
  });

  it("falls back to the built-in guess and keeps sections the person chose", async () => {
    const { backend, listId, person } = await setupList();
    await addNamed(backend, listId, ["Milk", "Bananas"]);
    vi.stubEnv("OPENROUTER_API_KEY", "");

    const first = await person.action(api.groceries.sortByAisle, { listId });
    expect(first).toMatchObject({ localReason: "unavailable", sorted: 2 });

    const [bananas, milk] = await itemsOf(backend, listId);
    expect([bananas?.aisle, milk?.aisle]).toStrictEqual(["produce", "dairy"]);

    // Moving milk up past the section edge puts it with the fruit.
    await person.mutation(api.groceries.moveItem, {
      direction: "up",
      itemId: milk?.id ?? "",
      listId,
    });
    await addNamed(backend, listId, ["Frozen peas"]);

    const second = await person.action(api.groceries.sortByAisle, { listId });
    expect(second.sorted).toBe(1);
    await expect(aislesOf(backend, listId)).resolves.toStrictEqual([
      ["Bananas", "produce"],
      ["Milk", "produce"],
      ["Frozen peas", "frozen"],
    ]);
  });

  it("moves items past each other and rejects unknown sections on undo", async () => {
    const { backend, listId, person } = await setupList();
    await addNamed(backend, listId, ["Bread", "Eggs"]);
    const [bread] = await itemsOf(backend, listId);

    await person.mutation(api.groceries.moveItem, {
      direction: "down",
      itemId: bread?.id ?? "",
      listId,
    });

    const moved = await itemsOf(backend, listId);
    expect(moved.map((item) => item.name)).toStrictEqual(["Eggs", "Bread"]);
    await expect(
      person.mutation(api.groceries.restoreArrangement, {
        arrangement: [{ aisle: "spaceship", itemId: bread?.id ?? "" }],
        listId,
      })
    ).rejects.toThrow(/store section/u);
  });
});

import {
  groceryEstimateError,
  groceryQuantityError,
  groceryUnit,
} from "@lifelink/contracts/groceries";
/**
 * Saved grocery lists, preferences, and budgets. Retired shopping endpoints
 * remain callable so older clients get a clear explanation without creating work.
 */
import {
  aisleSortRequest,
  aisleSortSchema,
  aislesFromSort,
  arrangeByAisle,
  isGroceryAisle,
  moveItem as moveListItem,
} from "@lifelink/contracts/grocery-aisles";
import type { AisleSort } from "@lifelink/contracts/grocery-aisles";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import {
  openRouterConfigured,
  structuredCompletion,
} from "./integrations/openrouter";
import { audit } from "./lib/audit";
import { INSTACART_RETIRED_REASON } from "./lib/capabilities";
import { requireOwned, requireOwner } from "./lib/session";
import { reserveCloudUse } from "./lib/usage";

const MAX_ITEMS = 100;

/** " · Oct 24" or " (copy)" left by an earlier copy, so names don't pile up. */
const COPY_SUFFIX = / (?:· [A-Z][a-z]{2} \d{1,2}|\(copy\))$/u;

/** "Weekly groceries · Oct 24": copies are named for the day they start. */
const datedName = (name: string, now: number, timeZone: string): string => {
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone,
  }).format(now);

  return `${name.replace(COPY_SUFFIX, "")} · ${day}`;
};

const FULL_LIST = "This list is full. Start a new list for more items.";

/** Long enough for any real product name; keeps the assistant request small. */
const MAX_NAME_IN_PROMPT = 80;

type GroceryItem = Doc<"groceryLists">["items"][number];

/** Stored items never carry `aisle: undefined`; an unsorted item has no key. */
const withAisle = (
  item: GroceryItem,
  aisle: string | undefined
): GroceryItem => {
  const { aisle: _previous, ...rest } = item;

  return aisle === undefined ? rest : { ...rest, aisle };
};

const checkAisle = (aisle: string | null | undefined): void => {
  if (aisle !== null && aisle !== undefined && !isGroceryAisle(aisle)) {
    throw new ConvexError({
      code: "invalid",
      message: "Choose a store section from the list.",
    });
  }
};

/** The same checks for a new item and for one put back by Undo. */
const itemError = (item: {
  estimatedCents: number | null;
  name: string;
  quantity: number | null;
  unit: string | null;
}): string | null => {
  if (item.name.length === 0) {
    return "What would you like to add?";
  }

  return (
    (groceryUnit(item.unit) === undefined
      ? "Choose a unit from the list."
      : null) ??
    groceryQuantityError(item.quantity, item.unit) ??
    groceryEstimateError(item.estimatedCents)
  );
};

export const lists = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);

    const groceryLists = await ctx.db
      .query("groceryLists")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .collect();

    const limit = await ctx.db
      .query("spendingLimits")
      .withIndex("by_owner_category", (index) =>
        index.eq("ownerId", owner._id).eq("category", "groceries")
      )
      .unique();

    const authorizations = await ctx.db
      .query("recurringAuthorizations")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .collect();

    const now = Date.now();

    return {
      authorizations: authorizations.filter(
        (item) => item.revokedAt === null && item.expiresAt > now
      ),
      instacartAvailable: false,
      limit,
      lists: groceryLists,
    };
  },
});

export const createList = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    return await ctx.db.insert("groceryLists", {
      budgetCents: null,
      items: [],
      lastHandoff: null,
      name: args.name.trim() || "Groceries",
      ownerId: owner._id,
      preferences: [],
      updatedAt: Date.now(),
    });
  },
});

const ownedList = async (
  ctx: MutationCtx,
  listId: Id<"groceryLists">
): Promise<{ list: Doc<"groceryLists">; owner: Doc<"profiles"> }> => {
  const owner = await requireOwner(ctx);
  const list = requireOwned(await ctx.db.get(listId), owner, "list");

  return { list, owner };
};

export const deleteList = mutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args) => {
    const { list, owner } = await ownedList(ctx, args.listId);
    const now = Date.now();

    // Retain historical permissions, but revoke any that refer to the deleted list.
    const authorizations = ctx.db
      .query("recurringAuthorizations")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id));

    for await (const authorization of authorizations) {
      if (
        authorization.listId === list._id &&
        authorization.revokedAt === null
      ) {
        await ctx.db.patch(authorization._id, { revokedAt: now });
      }
    }

    await ctx.db.delete(list._id);
    await audit(ctx, {
      actor: "person",
      detail: `Deleted grocery list: ${list.name}.`,
      event: "groceries.list_deleted",
      ownerId: owner._id,
    });
  },
});

export const unmarkAll = mutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);
    await ctx.db.patch(list._id, {
      items: list.items.map((item) => ({ ...item, checked: false })),
      updatedAt: Date.now(),
    });
  },
});

export const addItem = mutation({
  args: {
    estimatedCents: v.union(v.number(), v.null()),
    listId: v.id("groceryLists"),
    name: v.string(),
    quantity: v.union(v.number(), v.null()),
    unit: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);
    const name = args.name.trim();
    const unit = args.unit?.trim() || null;

    const validationError = itemError({
      estimatedCents: args.estimatedCents,
      name,
      quantity: args.quantity,
      unit,
    });

    if (validationError !== null) {
      throw new ConvexError({ code: "invalid", message: validationError });
    }

    if (list.items.length >= MAX_ITEMS) {
      throw new ConvexError({ code: "invalid", message: FULL_LIST });
    }

    await ctx.db.patch(list._id, {
      items: [
        ...list.items,
        {
          checked: false,
          estimatedCents: args.estimatedCents,
          id: crypto.randomUUID(),
          name,
          quantity: args.quantity,
          unit,
        },
      ],
      updatedAt: Date.now(),
    });
  },
});

export const updateItem = mutation({
  args: {
    checked: v.optional(v.boolean()),
    estimatedCents: v.optional(v.union(v.number(), v.null())),
    itemId: v.string(),
    listId: v.id("groceryLists"),
    quantity: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);

    const items = list.items.map((item) => {
      if (item.id !== args.itemId) {
        return item;
      }

      const validationError =
        (args.quantity === undefined
          ? null
          : groceryQuantityError(args.quantity, item.unit)) ??
        (args.estimatedCents === undefined
          ? null
          : groceryEstimateError(args.estimatedCents));

      if (validationError !== null) {
        throw new ConvexError({ code: "invalid", message: validationError });
      }

      return {
        ...item,
        checked: args.checked ?? item.checked,
        estimatedCents:
          args.estimatedCents === undefined
            ? item.estimatedCents
            : args.estimatedCents,
        quantity: args.quantity === undefined ? item.quantity : args.quantity,
      };
    });

    await ctx.db.patch(list._id, { items, updatedAt: Date.now() });
  },
});

/** Returns what was removed and where, so the person can undo a stray tap. */
export const removeItem = mutation({
  args: { itemId: v.string(), listId: v.id("groceryLists") },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);
    const index = list.items.findIndex((item) => item.id === args.itemId);

    if (index === -1) {
      return null;
    }

    await ctx.db.patch(list._id, {
      items: list.items.filter((item) => item.id !== args.itemId),
      updatedAt: Date.now(),
    });

    return { index, item: list.items[index] };
  },
});

/** Puts a removed item back where it was. Undoing twice changes nothing. */
export const restoreItem = mutation({
  args: {
    index: v.number(),
    item: v.object({
      aisle: v.optional(v.string()),
      checked: v.boolean(),
      estimatedCents: v.union(v.number(), v.null()),
      id: v.string(),
      name: v.string(),
      quantity: v.union(v.number(), v.null()),
      unit: v.union(v.string(), v.null()),
    }),
    listId: v.id("groceryLists"),
  },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);

    if (list.items.some((item) => item.id === args.item.id)) {
      return;
    }

    const item = { ...args.item, name: args.item.name.trim() };
    checkAisle(item.aisle);
    const validationError = itemError(item);

    if (validationError !== null) {
      throw new ConvexError({ code: "invalid", message: validationError });
    }

    if (list.items.length >= MAX_ITEMS) {
      throw new ConvexError({ code: "invalid", message: FULL_LIST });
    }

    const index = Math.min(
      Math.max(0, Math.trunc(args.index)),
      list.items.length
    );

    await ctx.db.patch(list._id, {
      items: [...list.items.slice(0, index), item, ...list.items.slice(index)],
      updatedAt: Date.now(),
    });
  },
});

/** Moves one item up or down the list; at a section's edge it joins the next section. */
export const moveItem = mutation({
  args: {
    direction: v.union(v.literal("up"), v.literal("down")),
    itemId: v.string(),
    listId: v.id("groceryLists"),
  },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);
    const moved = moveListItem(list.items, args.itemId, args.direction);

    if (moved === null) {
      return;
    }

    await ctx.db.patch(list._id, {
      items: moved.map((item) => withAisle(item, item.aisle)),
      updatedAt: Date.now(),
    });
  },
});

const arrangementEntry = v.object({
  aisle: v.union(v.string(), v.null()),
  itemId: v.string(),
});

const arrangementOf = (items: GroceryItem[]) =>
  items.map((item) => ({ aisle: item.aisle ?? null, itemId: item.id }));

type LocalReason = "failed" | "limit" | "unavailable";

/**
 * Reads the items no section has been chosen for yet, and reserves one
 * assistant request when there is something to sort. Items the person has
 * already sorted, or moved by hand, keep their section.
 */
export const beginAisleSort = internalMutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args) => {
    const { list, owner } = await ownedList(ctx, args.listId);
    const unsorted = list.items.filter((item) => item.aisle === undefined);
    // With nothing to ask about, finishing still puts the list in walking order.
    let localReason: LocalReason | null = null;

    if (unsorted.length > 0 && !openRouterConfigured()) {
      localReason = "unavailable";
    } else if (
      unsorted.length > 0 &&
      !(await reserveCloudUse(ctx, owner._id, "aisles"))
    ) {
      localReason = "limit";
    }

    return {
      itemIds: unsorted.map((item) => item.id),
      localReason,
      names: unsorted.map((item) => item.name.slice(0, MAX_NAME_IN_PROMPT)),
      previous: arrangementOf(list.items),
    };
  },
});

/** Gives each still-unsorted item its section, then puts the list in walking order. */
export const finishAisleSort = internalMutation({
  args: {
    assigned: v.array(v.object({ aisle: v.string(), itemId: v.string() })),
    listId: v.id("groceryLists"),
  },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);
    const chosen = new Map(args.assigned.map((entry) => [entry.itemId, entry]));

    const items = list.items.map((item) => {
      const aisle = chosen.get(item.id)?.aisle;

      return item.aisle === undefined && isGroceryAisle(aisle)
        ? withAisle(item, aisle)
        : item;
    });

    await ctx.db.patch(list._id, {
      items: arrangeByAisle(items),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Sorts the list by store section so one walk through the store picks up
 * everything. The assistant chooses sections when it is set up; otherwise,
 * or if it fails, a built-in guess from the item names is used instead.
 * Returns the order before sorting, so the person can undo it.
 */
export const sortByAisle = action({
  args: { listId: v.id("groceryLists") },
  handler: async (
    ctx,
    args
  ): Promise<{
    localReason: LocalReason | null;
    previous: { aisle: string | null; itemId: string }[];
    sorted: number;
  }> => {
    const plan = await ctx.runMutation(internal.groceries.beginAisleSort, args);
    let localReason: LocalReason | null = plan.localReason;
    let sort: AisleSort | null = null;

    if (plan.names.length > 0 && localReason === null) {
      const result = await structuredCompletion({
        messages: aisleSortRequest(plan.names),
        schema: aisleSortSchema,
        schemaName: "grocery_aisles",
        tier: "fast",
      });

      if (result.ok) {
        sort = result.value;
      } else {
        localReason = "failed";
      }
    }

    const aisles = aislesFromSort(plan.names, sort);

    await ctx.runMutation(internal.groceries.finishAisleSort, {
      assigned: plan.itemIds.map((itemId, index) => ({
        aisle: aisles[index] ?? "other",
        itemId,
      })),
      listId: args.listId,
    });

    return {
      localReason,
      previous: plan.previous,
      sorted: plan.names.length,
    };
  },
});

/**
 * Undo for sorting: puts items back in the given order with the given
 * sections. Items added since then stay, after the rest.
 */
export const restoreArrangement = mutation({
  args: {
    arrangement: v.array(arrangementEntry),
    listId: v.id("groceryLists"),
  },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);

    for (const entry of args.arrangement) {
      checkAisle(entry.aisle);
    }

    const byId = new Map(list.items.map((item) => [item.id, item]));
    const placed = new Set<string>();
    const items: GroceryItem[] = [];

    for (const entry of args.arrangement) {
      const item = byId.get(entry.itemId);

      if (item !== undefined && !placed.has(item.id)) {
        placed.add(item.id);
        items.push(withAisle(item, entry.aisle ?? undefined));
      }
    }

    await ctx.db.patch(list._id, {
      items: [...items, ...list.items.filter((item) => !placed.has(item.id))],
      updatedAt: Date.now(),
    });
  },
});

/**
 * Starts a new list from an old one: same items, budget, and preferences,
 * with nothing marked as in the cart. The old list stays as it was.
 */
export const copyList = mutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args): Promise<Id<"groceryLists">> => {
    const { list, owner } = await ownedList(ctx, args.listId);
    const now = Date.now();

    return await ctx.db.insert("groceryLists", {
      budgetCents: list.budgetCents,
      items: list.items.map((item) => ({
        ...item,
        checked: false,
        id: crypto.randomUUID(),
      })),
      lastHandoff: null,
      name: datedName(list.name, now, owner.timeZone),
      ownerId: owner._id,
      preferences: list.preferences,
      updatedAt: now,
    });
  },
});

/** Finishing a trip keeps the list under past lists so it can be reused. */
export const archiveList = mutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);

    if (list.archivedAt === undefined) {
      await ctx.db.patch(list._id, { archivedAt: Date.now() });
    }
  },
});

export const unarchiveList = mutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);
    await ctx.db.patch(list._id, { archivedAt: undefined });
  },
});

/** Marks one list as the usual weekly list, or clears it; only one at a time. */
export const setUsual = mutation({
  args: { listId: v.id("groceryLists"), usual: v.boolean() },
  handler: async (ctx, args) => {
    const { list, owner } = await ownedList(ctx, args.listId);

    if (args.usual) {
      const owned = ctx.db
        .query("groceryLists")
        .withIndex("by_owner", (index) => index.eq("ownerId", owner._id));

      for await (const other of owned) {
        if (other.usual === true && other._id !== list._id) {
          await ctx.db.patch(other._id, { usual: undefined });
        }
      }
    }

    await ctx.db.patch(list._id, { usual: args.usual ? true : undefined });
  },
});

export const setDetails = mutation({
  args: {
    budgetCents: v.union(v.number(), v.null()),
    listId: v.id("groceryLists"),
    name: v.string(),
    preferences: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);

    await ctx.db.patch(list._id, {
      budgetCents:
        args.budgetCents === null
          ? null
          : Math.max(0, Math.round(args.budgetCents)),
      name: args.name.trim() || list.name,
      preferences: args.preferences
        .map((preference) => preference.trim())
        .filter((preference) => preference.length > 0)
        .slice(0, 10),
      updatedAt: Date.now(),
    });
  },
});

/** Spending limits are changed only here, by the person. Model output and incoming messages cannot reach this. */
export const setLimit = mutation({
  args: {
    monthlyCents: v.union(v.number(), v.null()),
    perOrderCents: v.number(),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const existing = await ctx.db
      .query("spendingLimits")
      .withIndex("by_owner_category", (index) =>
        index.eq("ownerId", owner._id).eq("category", "groceries")
      )
      .unique();

    const values = {
      monthlyCents:
        args.monthlyCents === null
          ? null
          : Math.max(0, Math.round(args.monthlyCents)),
      perOrderCents: Math.max(0, Math.round(args.perOrderCents)),
      updatedAt: Date.now(),
    };

    await (existing === null
      ? ctx.db.insert("spendingLimits", {
          ...values,
          category: "groceries",
          ownerId: owner._id,
        })
      : ctx.db.patch(existing._id, values));
    await audit(ctx, {
      actor: "person",
      detail: `Grocery limit set to $${(values.perOrderCents / 100).toFixed(2)} per order.`,
      event: "spending.limit_set",
      ownerId: owner._id,
    });
  },
});

/** Retained for older clients; no shopping task is created in either mode. */
export const proposeHandoff = mutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args): Promise<Id<"tasks">> => {
    await ownedList(ctx, args.listId);

    throw new ConvexError({
      code: "retired",
      message: INSTACART_RETIRED_REASON,
    });
  },
});

/** Retained for older clients; existing permissions can still be revoked below. */
export const createAuthorization = mutation({
  args: {
    days: v.number(),
    listId: v.id("groceryLists"),
    maxPerUseCents: v.number(),
    maxUses: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"recurringAuthorizations">> => {
    await ownedList(ctx, args.listId);

    throw new ConvexError({
      code: "retired",
      message: INSTACART_RETIRED_REASON,
    });
  },
});

export const revokeAuthorization = mutation({
  args: { authorizationId: v.id("recurringAuthorizations") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const authorization = requireOwned(
      await ctx.db.get(args.authorizationId),
      owner,
      "permission"
    );

    await ctx.db.patch(authorization._id, { revokedAt: Date.now() });
    await audit(ctx, {
      actor: "person",
      detail: "Standing grocery permission ended.",
      event: "authorization.revoked",
      ownerId: owner._id,
    });
  },
});

/** Retained for scheduled invocations from before shopping was retired. */
export const runRecurring = internalMutation({
  args: {},
  handler: () => null,
});

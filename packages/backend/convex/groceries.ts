/**
 * Saved grocery lists, preferences, and budgets. Retired shopping endpoints
 * remain callable so older clients get a clear explanation without creating work.
 */
import {
  groceryEstimateError,
  groceryQuantityError,
  groceryUnit,
} from "@lifelink/contracts/groceries";
import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { audit } from "./lib/audit";
import { INSTACART_RETIRED_REASON } from "./lib/capabilities";
import { requireOwned, requireOwner } from "./lib/session";

const MAX_ITEMS = 100;

const FULL_LIST = "This list is full. Start a new list for more items.";

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

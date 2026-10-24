/**
 * Saved grocery lists, preferences, and budgets. Retired shopping endpoints
 * remain callable so older clients get a clear explanation without creating work.
 */
import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { audit } from "./lib/audit";
import { INSTACART_RETIRED_REASON } from "./lib/capabilities";
import { requireOwned, requireOwner } from "./lib/session";

const MAX_ITEMS = 100;

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

    if (name.length === 0) {
      throw new ConvexError({
        code: "invalid",
        message: "What would you like to add?",
      });
    }

    if (list.items.length >= MAX_ITEMS) {
      throw new ConvexError({
        code: "invalid",
        message: "This list is full. Start a new list for more items.",
      });
    }

    await ctx.db.patch(list._id, {
      items: [
        ...list.items,
        {
          checked: false,
          estimatedCents:
            args.estimatedCents === null
              ? null
              : Math.max(0, Math.round(args.estimatedCents)),
          id: crypto.randomUUID(),
          name,
          quantity: args.quantity === null ? null : Math.max(0, args.quantity),
          unit: args.unit?.trim() || null,
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

export const removeItem = mutation({
  args: { itemId: v.string(), listId: v.id("groceryLists") },
  handler: async (ctx, args) => {
    const { list } = await ownedList(ctx, args.listId);

    await ctx.db.patch(list._id, {
      items: list.items.filter((item) => item.id !== args.itemId),
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

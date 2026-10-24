/**
 * Saved grocery lists, preferences, budgets, and the Instacart handoff.
 * Editing a list is the person's own data and needs no approval; handing it
 * to Instacart is an action that is reviewed against the budget and limits.
 */
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { audit } from "./lib/audit";
import { developerConfigured } from "./lib/capabilities";
import { createTask } from "./lib/journey";
import { approveUnderAuthorization, createAction } from "./lib/lifecycle";
import { requireOwned, requireOwner } from "./lib/session";
import { DAY } from "./lib/time";

const MAX_ITEMS = 100;
const MAX_AUTHORIZATION_DAYS = 90;
const MAX_AUTHORIZATION_USES = 12;

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
      instacartAvailable: owner.demoMode || developerConfigured("instacart"),
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

const estimateOf = (list: Doc<"groceryLists">): number | null => {
  const open = list.items.filter((item) => !item.checked);

  if (open.length === 0 || open.some((item) => item.estimatedCents === null)) {
    return null;
  }

  return open.reduce((total, item) => total + (item.estimatedCents ?? 0), 0);
};

const createHandoff = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">,
  list: Doc<"groceryLists">
): Promise<{ actionId: Id<"actions">; taskId: Id<"tasks"> }> => {
  const items = list.items.filter((item) => !item.checked);

  if (items.length === 0) {
    throw new ConvexError({
      code: "invalid",
      message: "Add something to the list first (checked items are left out).",
    });
  }

  const mode = owner.demoMode ? "simulated" : "live";

  const { stepIds, taskId } = await createTask(ctx, {
    appointmentId: null,
    contactId: null,
    kind: "grocery_handoff",
    mode,
    origin: "text",
    ownerId: owner._id,
    request: `Shop for ${list.name}`,
    steps: [{ kind: "grocery_handoff", label: "Open the list on Instacart" }],
    title: `Shop for ${list.name} on Instacart`,
  });

  const actionId = await createAction(ctx, {
    ambiguities: [],
    details: {
      budgetCents: list.budgetCents,
      estimatedCents: estimateOf(list),
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })),
      kind: "grocery_handoff",
      listId: list._id,
      listName: list.name,
    },
    mode,
    ownerId: owner._id,
    proposedBy: "person",
    rationale:
      "Instacart shows matching products. You choose the store, see prices, and pay on Instacart.",
    stepId: stepIds[0] ?? null,
    taskId,
  });

  return { actionId, taskId };
};

export const proposeHandoff = mutation({
  args: { listId: v.id("groceryLists") },
  handler: async (ctx, args): Promise<Id<"tasks">> => {
    const { list, owner } = await ownedList(ctx, args.listId);
    const { taskId } = await createHandoff(ctx, owner, list);

    return taskId;
  },
});

/** A standing permission with hard bounds. Only the person can create one. */
export const createAuthorization = mutation({
  args: {
    days: v.number(),
    listId: v.id("groceryLists"),
    maxPerUseCents: v.number(),
    maxUses: v.number(),
  },
  handler: async (ctx, args) => {
    const { list, owner } = await ownedList(ctx, args.listId);

    const days = Math.min(
      MAX_AUTHORIZATION_DAYS,
      Math.max(1, Math.round(args.days))
    );

    const maxUses = Math.min(
      MAX_AUTHORIZATION_USES,
      Math.max(1, Math.round(args.maxUses))
    );

    const id = await ctx.db.insert("recurringAuthorizations", {
      actionKind: "grocery_handoff",
      createdAt: Date.now(),
      expiresAt: Date.now() + days * DAY,
      listId: list._id,
      maxPerUseCents: Math.max(0, Math.round(args.maxPerUseCents)),
      maxUses,
      ownerId: owner._id,
      revokedAt: null,
      usesCount: 0,
    });

    await audit(ctx, {
      actor: "person",
      detail: `Weekly handoff of "${list.name}" allowed up to $${(args.maxPerUseCents / 100).toFixed(2)}, ${maxUses} times, for ${days} days.`,
      event: "authorization.created",
      ownerId: owner._id,
    });

    return id;
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

/** Prepare one handoff under a standing permission; anything outside its bounds waits for approval. */
const runAuthorization = async (
  ctx: MutationCtx,
  authorization: Doc<"recurringAuthorizations">,
  now: number
): Promise<void> => {
  const exhausted =
    authorization.revokedAt !== null ||
    authorization.expiresAt <= now ||
    authorization.usesCount >= authorization.maxUses;

  if (exhausted) {
    return;
  }

  const owner = await ctx.db.get(authorization.ownerId);
  const list = await ctx.db.get(authorization.listId);

  if (
    owner === null ||
    list === null ||
    list.items.every((item) => item.checked)
  ) {
    return;
  }

  const { actionId } = await createHandoff(ctx, owner, list);
  const action = await ctx.db.get(actionId);

  if (action === null) {
    return;
  }

  const result = await approveUnderAuthorization(
    ctx,
    owner,
    action,
    authorization
  );

  if (result.ok) {
    await ctx.scheduler.runAfter(0, internal.execution.run, { actionId });
  }
};

/** Weekly: prepare handoffs under active authorizations; anything outside the bounds waits for approval. */
export const runRecurring = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const authorizations = await ctx.db
      .query("recurringAuthorizations")
      .collect();

    await Promise.all(
      authorizations.map(
        async (authorization) => await runAuthorization(ctx, authorization, now)
      )
    );
  },
});

import { ConvexError, v } from "convex/values";

import { internalQuery } from "./_generated/server";
import { requireOwned, requireOwner } from "./lib/session";

/** Called from public actions: the caller's identity is forwarded, so ownership is enforced here. */
export const assertOwnsUnknown = internalQuery({
  args: { actionId: v.id("actions") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const action = requireOwned(
      await ctx.db.get(args.actionId),
      owner,
      "action"
    );

    if (action.status !== "unknown") {
      throw new ConvexError({
        code: "not_unknown",
        message: "There is nothing to check for this one.",
      });
    }
  },
});

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ReaderCtx = MutationCtx | QueryCtx;

/**
 * The Telegram chat this contact proved is theirs by opening their one-time
 * link. Only this chat may be saved as, or sent to as, their Telegram address.
 */
const verifiedTelegramChat = async (
  ctx: ReaderCtx,
  contactId: Id<"contacts">
): Promise<string | null> => {
  const link = await ctx.db
    .query("telegramLinks")
    .withIndex("by_contact", (index) => index.eq("contactId", contactId))
    .unique();

  return link?.chatId ?? null;
};

export { verifiedTelegramChat };

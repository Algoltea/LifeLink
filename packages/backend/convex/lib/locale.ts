import { interfaceLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/** A language LifeLink writes its own fixed words in. */
const localeValidator = v.union(
  v.literal("en"),
  v.literal("es"),
  v.literal("fr"),
  v.literal("de"),
  v.literal("it"),
  v.literal("pt"),
  v.literal("zh"),
  v.literal("vi"),
  v.literal("ko"),
  v.literal("tl")
);

/** The language the owner chose for LifeLink, or English when they have not chosen. */
const ownerLocale = async (
  ctx: QueryCtx,
  ownerId: Id<"profiles">
): Promise<InterfaceLocale> => {
  const preferences = await ctx.db
    .query("preferences")
    .withIndex("by_profile", (index) => index.eq("profileId", ownerId))
    .unique();

  return interfaceLocaleOf(preferences?.supportLanguage);
};

/** The language a contact reads LifeLink's words in: their own setting, else the owner's. */
const contactLocale = async (
  ctx: QueryCtx,
  ownerId: Id<"profiles">,
  contact: Doc<"contacts"> | null
): Promise<InterfaceLocale> =>
  contact?.language ?? (await ownerLocale(ctx, ownerId));

export { contactLocale, localeValidator, ownerLocale };

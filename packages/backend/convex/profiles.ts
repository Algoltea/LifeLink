import { cleanNotes, isSupportLanguage } from "@lifelink/contracts/help-style";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { audit } from "./lib/audit";
import { demoModeAllowed } from "./lib/env";
import { authUserIdOf, findProfile, requireProfile } from "./lib/session";
import { isValidTimeZone } from "./lib/time";
import schema from "./schema";

const DEFAULT_SPEECH_RATE = 0.9;

const defaultPreferences = (
  profile: Doc<"profiles">
): Omit<Doc<"preferences">, "_creationTime" | "_id"> => ({
  captions: true,
  contrast: "standard",
  groceryNotes: null,
  profileId: profile._id,
  readAloud: false,
  reducedMotion: false,
  speechRate: DEFAULT_SPEECH_RATE,
  speechVoice: null,
  textScale: 1,
  theme: "light",
  updatedAt: Date.now(),
});

const preferencesOf = async (
  ctx: MutationCtx,
  profile: Doc<"profiles">
): Promise<Doc<"preferences">> => {
  const existing = await ctx.db
    .query("preferences")
    .withIndex("by_profile", (index) => index.eq("profileId", profile._id))
    .unique();

  if (existing !== null) {
    return existing;
  }

  const id = await ctx.db.insert("preferences", defaultPreferences(profile));
  const created = await ctx.db.get(id);

  if (created === null) {
    throw new ConvexError({
      code: "corrupt",
      message: "Preferences could not be saved.",
    });
  }

  return created;
};

/** Who is signed in, their settings, and whether they still need to finish setting up. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await authUserIdOf(ctx);

    if (authUserId === null) {
      return null;
    }

    const profile = await findProfile(ctx);

    if (profile === null) {
      return {
        demoModeAllowed: demoModeAllowed(),
        needsOnboarding: true,
        preferences: null,
        profile: null,
      };
    }

    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_profile", (index) => index.eq("profileId", profile._id))
      .unique();

    return {
      demoModeAllowed: demoModeAllowed(),
      needsOnboarding: false,
      preferences,
      profile,
    };
  },
});

export const completeOnboarding = mutation({
  args: {
    city: v.union(v.string(), v.null()),
    displayName: v.string(),
    postalCode: v.union(v.string(), v.null()),
    preferredName: v.string(),
    role: v.union(v.literal("owner"), v.literal("family")),
    signOffName: v.union(v.string(), v.null()),
    startInDemoMode: v.boolean(),
    timeZone: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await authUserIdOf(ctx);

    if (authUserId === null) {
      throw new ConvexError({
        code: "not_signed_in",
        message: "Please sign in again to continue.",
      });
    }

    const existing = await findProfile(ctx);

    if (existing !== null) {
      return existing._id;
    }

    const displayName = args.displayName.trim();

    const preferredName =
      args.preferredName.trim() || displayName.split(" ")[0] || displayName;

    if (displayName.length < 2) {
      throw new ConvexError({
        code: "invalid",
        message: "Please enter your name.",
      });
    }

    if (!isValidTimeZone(args.timeZone)) {
      throw new ConvexError({
        code: "invalid",
        message: "That time zone was not recognised.",
      });
    }

    const demoMode =
      args.role === "owner" && args.startInDemoMode && demoModeAllowed();

    const profileId = await ctx.db.insert("profiles", {
      assistantThreadId: null,
      authUserId,
      city: args.city?.trim() || null,
      createdAt: Date.now(),
      demoMode,
      displayName,
      postalCode: args.postalCode?.trim() || null,
      preferredName,
      role: args.role,
      signOffName: args.signOffName?.trim() || null,
      timeZone: args.timeZone,
    });

    const profile = await ctx.db.get(profileId);

    if (profile !== null) {
      await preferencesOf(ctx, profile);
    }

    await audit(ctx, {
      actor: "person",
      detail: demoMode
        ? "Started in practice mode with sample data."
        : `Joined as ${args.role}.`,
      event: "profile.created",
      ownerId: profileId,
    });

    if (demoMode) {
      await ctx.scheduler.runAfter(0, internal.demo.seed, {
        ownerId: profileId,
      });
    }

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    city: v.union(v.string(), v.null()),
    displayName: v.string(),
    postalCode: v.union(v.string(), v.null()),
    preferredName: v.string(),
    signOffName: v.union(v.string(), v.null()),
    timeZone: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);

    if (!isValidTimeZone(args.timeZone)) {
      throw new ConvexError({
        code: "invalid",
        message: "That time zone was not recognised.",
      });
    }

    await ctx.db.patch(profile._id, {
      city: args.city?.trim() || null,
      displayName: args.displayName.trim() || profile.displayName,
      postalCode: args.postalCode?.trim() || null,
      preferredName: args.preferredName.trim() || profile.preferredName,
      signOffName: args.signOffName?.trim() || null,
      timeZone: args.timeZone,
    });
  },
});

export const updatePreferences = mutation({
  args: {
    aiEmailChecks: v.optional(v.boolean()),
    captions: v.optional(v.boolean()),
    communicationNotes: v.optional(v.union(v.string(), v.null())),
    contrast: v.optional(v.union(v.literal("standard"), v.literal("more"))),
    explanationDetail: v.optional(
      v.union(v.literal("short"), v.literal("detailed"))
    ),
    groceryNotes: v.optional(v.union(v.string(), v.null())),
    newsKind: v.optional(v.union(v.literal("good"), v.literal("top"))),
    readAloud: v.optional(v.boolean()),
    reducedMotion: v.optional(v.boolean()),
    showNews: v.optional(v.boolean()),
    speechRate: v.optional(v.number()),
    speechVoice: schema.tables.preferences.validator.fields.speechVoice,
    stepByStep: v.optional(v.boolean()),
    supportLanguage: v.optional(v.string()),
    textScale: v.optional(v.number()),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
  },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);
    const preferences = await preferencesOf(ctx, profile);
    const patch: Partial<Doc<"preferences">> = { updatedAt: Date.now() };

    if (args.aiEmailChecks !== undefined) {
      patch.aiEmailChecks = args.aiEmailChecks;
    }

    if (args.captions !== undefined) {
      patch.captions = args.captions;
    }

    if (args.contrast !== undefined) {
      patch.contrast = args.contrast;
    }

    if (args.explanationDetail !== undefined) {
      patch.explanationDetail = args.explanationDetail;
    }

    if (args.stepByStep !== undefined) {
      patch.stepByStep = args.stepByStep;
    }

    if (args.supportLanguage !== undefined) {
      if (!isSupportLanguage(args.supportLanguage)) {
        throw new ConvexError({
          code: "invalid",
          message: "Please choose one of the languages offered.",
        });
      }

      patch.supportLanguage = args.supportLanguage;
    }

    if (args.communicationNotes !== undefined) {
      const notes = cleanNotes(args.communicationNotes);

      patch.communicationNotes = notes.length === 0 ? null : notes;
    }

    if (args.groceryNotes !== undefined) {
      patch.groceryNotes = args.groceryNotes;
    }

    if (args.newsKind !== undefined) {
      patch.newsKind = args.newsKind;
    }

    if (args.showNews !== undefined) {
      patch.showNews = args.showNews;
    }

    if (args.readAloud !== undefined) {
      patch.readAloud = args.readAloud;
    }

    if (args.reducedMotion !== undefined) {
      patch.reducedMotion = args.reducedMotion;
    }

    if (args.speechRate !== undefined) {
      patch.speechRate = Math.min(1.5, Math.max(0.5, args.speechRate));
    }

    if (args.speechVoice !== undefined) {
      patch.speechVoice = args.speechVoice;
    }

    if (args.textScale !== undefined) {
      patch.textScale = Math.min(1.6, Math.max(1, args.textScale));
    }

    if (args.theme !== undefined) {
      patch.theme = args.theme;
    }

    await ctx.db.patch(preferences._id, patch);
  },
});

/**
 * Practice mode is an explicit choice. Work prepared in one mode cannot run in
 * the other: execution re-checks the mode and asks for a fresh review.
 */
export const setDemoMode = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);

    if (profile.role !== "owner") {
      throw new ConvexError({
        code: "owner_only",
        message: "Only the account owner can change practice mode.",
      });
    }

    if (args.enabled && !demoModeAllowed()) {
      throw new ConvexError({
        code: "not_allowed",
        message: "Practice mode is turned off for this app.",
      });
    }

    if (profile.demoMode === args.enabled) {
      return;
    }

    await ctx.db.patch(profile._id, { demoMode: args.enabled });
    await audit(ctx, {
      actor: "person",
      detail: args.enabled
        ? "Turned practice mode on. Outcomes are simulated and labelled Practice."
        : "Turned practice mode off.",
      event: "profile.demo_mode",
      ownerId: profile._id,
    });

    if (args.enabled) {
      await ctx.scheduler.runAfter(0, internal.demo.seed, {
        ownerId: profile._id,
      });
    }
  },
});

import { helpStyleOf, languageName } from "@lifelink/contracts/help-style";
import { SPEECH_VOICES } from "@lifelink/contracts/speech";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalQuery } from "./_generated/server";
import {
  createCallScreeningToken,
  createLiveToken,
  createVoiceTypingToken,
} from "./integrations/live";
import {
  MAX_SPEECH_CHARACTERS,
  speechConfigurationError,
  synthesizeSpeech as requestSpeech,
} from "./integrations/tts";
import type { SpeechAudio } from "./integrations/tts";
import { requireOwner } from "./lib/session";

export const nameForVoice = internalQuery({
  args: {},
  handler: async (
    ctx
  ): Promise<{ language: string; preferredName: string } | null> => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (index) =>
        index.eq("authUserId", identity.subject)
      )
      .unique();

    if (profile?.role !== "owner") {
      return null;
    }

    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_profile", (index) => index.eq("profileId", profile._id))
      .unique();

    return {
      language: languageName(helpStyleOf(preferences).language),
      preferredName: profile.preferredName,
    };
  },
});

/**
 * Mint a one-use Gemini Live token locked to the configured model, system
 * instruction, and the submit_request tool. The long-lived key stays here.
 */
export const createLiveSession = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{ expiresAt: number; model: string; token: string }> => {
    const person = await ctx.runQuery(internal.voice.nameForVoice, {});

    if (person === null) {
      throw new ConvexError({
        code: "not_signed_in",
        message: "Please sign in again.",
      });
    }

    const result = await createLiveToken(person.preferredName, person.language);

    if (!result.ok) {
      throw new ConvexError({
        code: "voice_unavailable",
        message: result.error,
      });
    }

    return {
      expiresAt: result.expiresAt,
      model: result.model,
      token: result.token,
    };
  },
});

export const authorizeCallScreening = internalQuery({
  args: {},
  handler: async (ctx): Promise<null> => {
    const owner = await requireOwner(ctx);

    if (owner.demoMode) {
      throw new ConvexError({
        code: "practice_mode",
        message:
          "Turn off Practice mode in Settings before screening a real call.",
      });
    }

    return null;
  },
  returns: v.null(),
});

/** Mint a one-use token for silent input transcription, with no tools or actions. */
export const createCallScreeningSession = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{ expiresAt: number; model: string; token: string }> => {
    await ctx.runQuery(internal.voice.authorizeCallScreening, {});
    const result = await createCallScreeningToken();

    if (!result.ok) {
      throw new ConvexError({
        code: "voice_unavailable",
        message: result.error,
      });
    }

    return {
      expiresAt: result.expiresAt,
      model: result.model,
      token: result.token,
    };
  },
  returns: v.object({
    expiresAt: v.number(),
    model: v.string(),
    token: v.string(),
  }),
});

/**
 * Mint a one-use token for voice typing in Messages and Email: silent input
 * transcription with no tools. Unlike call screening, Practice mode may use it.
 */
export const createVoiceTypingSession = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{ expiresAt: number; model: string; token: string }> => {
    const person = await ctx.runQuery(internal.voice.nameForVoice, {});

    if (person === null) {
      throw new ConvexError({
        code: "not_signed_in",
        message: "Please sign in again.",
      });
    }

    const result = await createVoiceTypingToken();

    if (!result.ok) {
      throw new ConvexError({
        code: "voice_unavailable",
        message: result.error,
      });
    }

    return {
      expiresAt: result.expiresAt,
      model: result.model,
      token: result.token,
    };
  },
  returns: v.object({
    expiresAt: v.number(),
    model: v.string(),
    token: v.string(),
  }),
});

/** Read text supplied by the caller; this endpoint never retrieves app records. */
export const synthesizeSpeech = action({
  args: {
    text: v.string(),
    voice: v.optional(
      v.union(...SPEECH_VOICES.map(({ value }) => v.literal(value)))
    ),
  },
  handler: async (ctx, args): Promise<SpeechAudio> => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "not_signed_in",
        message: "Please sign in again to use read-aloud.",
      });
    }

    const text = args.text.trim();

    if (text.length === 0 || text.length > MAX_SPEECH_CHARACTERS) {
      throw new ConvexError({
        code: "speech_text_invalid",
        message: "Please choose a shorter section to read aloud.",
      });
    }

    const configurationError = speechConfigurationError(args.voice);

    if (configurationError !== null) {
      throw new ConvexError({
        code: "speech_unavailable",
        message: configurationError,
      });
    }

    // The limiter also requires the caller's own profile, including family members.
    await ctx.runMutation(internal.speechlimits.consume, {
      characters: text.length,
    });
    const result = await requestSpeech(text, args.voice);

    if (!result.ok) {
      throw new ConvexError({
        code: "speech_unavailable",
        message: result.error,
      });
    }

    return result.value;
  },
  returns: v.object({
    audio: v.bytes(),
    contentType: v.literal("audio/mpeg"),
    model: v.string(),
  }),
});

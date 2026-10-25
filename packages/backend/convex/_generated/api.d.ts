/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as appointments from "../appointments.js";
import type * as assistant from "../assistant.js";
import type * as auth from "../auth.js";
import type * as avatars from "../avatars.js";
import type * as briefings from "../briefings.js";
import type * as callscreening from "../callscreening.js";
import type * as connections from "../connections.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as demo from "../demo.js";
import type * as drive from "../drive.js";
import type * as emails from "../emails.js";
import type * as execution from "../execution.js";
import type * as explanations from "../explanations.js";
import type * as family from "../family.js";
import type * as groceries from "../groceries.js";
import type * as http from "../http.js";
import type * as imessage from "../imessage.js";
import type * as inbox from "../inbox.js";
import type * as integrations_calendar from "../integrations/calendar.js";
import type * as integrations_composio from "../integrations/composio.js";
import type * as integrations_discord from "../integrations/discord.js";
import type * as integrations_drive from "../integrations/drive.js";
import type * as integrations_http from "../integrations/http.js";
import type * as integrations_instacart from "../integrations/instacart.js";
import type * as integrations_live from "../integrations/live.js";
import type * as integrations_mail from "../integrations/mail.js";
import type * as integrations_openrouter from "../integrations/openrouter.js";
import type * as integrations_photon from "../integrations/photon.js";
import type * as integrations_photonruntime from "../integrations/photonruntime.js";
import type * as integrations_telegram from "../integrations/telegram.js";
import type * as integrations_tts from "../integrations/tts.js";
import type * as lib_assistantMessages from "../lib/assistantMessages.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_avatarimage from "../lib/avatarimage.js";
import type * as lib_briefingMessages from "../lib/briefingMessages.js";
import type * as lib_capabilities from "../lib/capabilities.js";
import type * as lib_claims from "../lib/claims.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_drafts from "../lib/drafts.js";
import type * as lib_emailpriority from "../lib/emailpriority.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_feeds from "../lib/feeds.js";
import type * as lib_imessage from "../lib/imessage.js";
import type * as lib_incoming from "../lib/incoming.js";
import type * as lib_journey from "../lib/journey.js";
import type * as lib_lifecycle from "../lib/lifecycle.js";
import type * as lib_locale from "../lib/locale.js";
import type * as lib_notices from "../lib/notices.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_proposalMessages from "../lib/proposalMessages.js";
import type * as lib_proposals from "../lib/proposals.js";
import type * as lib_readtools from "../lib/readtools.js";
import type * as lib_sampledrive from "../lib/sampledrive.js";
import type * as lib_session from "../lib/session.js";
import type * as lib_telegram from "../lib/telegram.js";
import type * as lib_time from "../lib/time.js";
import type * as lib_usage from "../lib/usage.js";
import type * as lib_weather from "../lib/weather.js";
import type * as maintenance from "../maintenance.js";
import type * as messages from "../messages.js";
import type * as news from "../news.js";
import type * as ownership from "../ownership.js";
import type * as photos from "../photos.js";
import type * as profiles from "../profiles.js";
import type * as recaps from "../recaps.js";
import type * as reminders from "../reminders.js";
import type * as replies from "../replies.js";
import type * as scam from "../scam.js";
import type * as sharing from "../sharing.js";
import type * as speechlimits from "../speechlimits.js";
import type * as status from "../status.js";
import type * as tasks from "../tasks.js";
import type * as telegram from "../telegram.js";
import type * as today from "../today.js";
import type * as voice from "../voice.js";
import type * as weather from "../weather.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  appointments: typeof appointments;
  assistant: typeof assistant;
  auth: typeof auth;
  avatars: typeof avatars;
  briefings: typeof briefings;
  callscreening: typeof callscreening;
  connections: typeof connections;
  contacts: typeof contacts;
  crons: typeof crons;
  demo: typeof demo;
  drive: typeof drive;
  emails: typeof emails;
  execution: typeof execution;
  explanations: typeof explanations;
  family: typeof family;
  groceries: typeof groceries;
  http: typeof http;
  imessage: typeof imessage;
  inbox: typeof inbox;
  "integrations/calendar": typeof integrations_calendar;
  "integrations/composio": typeof integrations_composio;
  "integrations/discord": typeof integrations_discord;
  "integrations/drive": typeof integrations_drive;
  "integrations/http": typeof integrations_http;
  "integrations/instacart": typeof integrations_instacart;
  "integrations/live": typeof integrations_live;
  "integrations/mail": typeof integrations_mail;
  "integrations/openrouter": typeof integrations_openrouter;
  "integrations/photon": typeof integrations_photon;
  "integrations/photonruntime": typeof integrations_photonruntime;
  "integrations/telegram": typeof integrations_telegram;
  "integrations/tts": typeof integrations_tts;
  "lib/assistantMessages": typeof lib_assistantMessages;
  "lib/audit": typeof lib_audit;
  "lib/avatarimage": typeof lib_avatarimage;
  "lib/briefingMessages": typeof lib_briefingMessages;
  "lib/capabilities": typeof lib_capabilities;
  "lib/claims": typeof lib_claims;
  "lib/crypto": typeof lib_crypto;
  "lib/drafts": typeof lib_drafts;
  "lib/emailpriority": typeof lib_emailpriority;
  "lib/env": typeof lib_env;
  "lib/feeds": typeof lib_feeds;
  "lib/imessage": typeof lib_imessage;
  "lib/incoming": typeof lib_incoming;
  "lib/journey": typeof lib_journey;
  "lib/lifecycle": typeof lib_lifecycle;
  "lib/locale": typeof lib_locale;
  "lib/notices": typeof lib_notices;
  "lib/permissions": typeof lib_permissions;
  "lib/proposalMessages": typeof lib_proposalMessages;
  "lib/proposals": typeof lib_proposals;
  "lib/readtools": typeof lib_readtools;
  "lib/sampledrive": typeof lib_sampledrive;
  "lib/session": typeof lib_session;
  "lib/telegram": typeof lib_telegram;
  "lib/time": typeof lib_time;
  "lib/usage": typeof lib_usage;
  "lib/weather": typeof lib_weather;
  maintenance: typeof maintenance;
  messages: typeof messages;
  news: typeof news;
  ownership: typeof ownership;
  photos: typeof photos;
  profiles: typeof profiles;
  recaps: typeof recaps;
  reminders: typeof reminders;
  replies: typeof replies;
  scam: typeof scam;
  sharing: typeof sharing;
  speechlimits: typeof speechlimits;
  status: typeof status;
  tasks: typeof tasks;
  telegram: typeof telegram;
  today: typeof today;
  voice: typeof voice;
  weather: typeof weather;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};

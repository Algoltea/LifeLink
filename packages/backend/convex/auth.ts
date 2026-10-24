import { createClient } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import { readEnvOr } from "./lib/env";

const MIN_PASSWORD_LENGTH = 10;

export const authComponent = createClient<DataModel>(components.betterAuth);

/** Better Auth on Convex. SITE_URL is the web app's origin, set by `bun run dev:setup`. */
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const siteUrl = readEnvOr("SITE_URL", "http://localhost:3001");

  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      requireEmailVerification: false,
    },
    plugins: [convex({ authConfig, jwksRotateOnTokenGenerationError: true })],
    trustedOrigins: [siteUrl],
  });
};

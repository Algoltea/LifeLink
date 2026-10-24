import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

import { ENV } from "../env";

export const {
  fetchAuthAction,
  fetchAuthMutation,
  fetchAuthQuery,
  getToken,
  handler,
  isAuthenticated,
  preloadAuthQuery,
} = convexBetterAuthNextJs({
  convexSiteUrl: ENV.NEXT_PUBLIC_CONVEX_SITE_URL,
  convexUrl: ENV.NEXT_PUBLIC_CONVEX_URL,
});

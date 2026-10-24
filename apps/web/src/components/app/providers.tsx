"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { Toaster } from "@lifelink/ui/components/sonner";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

import { LocaleBoundary } from "@/i18n/locale-boundary";
import { authClient } from "@/lib/auth-client";

import { ENV } from "../../env";
import { OfflineQueueProvider } from "./offline-queue";
import { PreferencesProvider } from "./preferences";

const convex = new ConvexReactClient(ENV.NEXT_PUBLIC_CONVEX_URL);

const Providers = ({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) => (
  <ConvexBetterAuthProvider
    authClient={authClient}
    client={convex}
    initialToken={initialToken}
  >
    <PreferencesProvider>
      <OfflineQueueProvider>
        <LocaleBoundary>{children}</LocaleBoundary>
      </OfflineQueueProvider>
    </PreferencesProvider>
    <Toaster />
  </ConvexBetterAuthProvider>
);

export { Providers };

"use client";

import { useConvexAuth } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { useMessages } from "@/i18n/locale";

import { AppLoadingShell } from "./app-loading-shell";
import { Onboarding } from "./onboarding";
import { usePreferences } from "./preferences";
import { AppShell } from "./shell";
import { LoadingRows } from "./states";

const FAMILY_PATHS = ["/family", "/settings"];

// Open to everyone, offline included: never gated on the session or setup.
const PUBLIC_PATHS = ["/solitaire", "/mahjong"];

/**
 * Signed in → finish setup → the owner's or the family member's screens.
 * Every ready branch returns the same `AppShell`, so navigation only swaps the page.
 */
const AppGate = ({ children }: { children: ReactNode }) => {
  const { appExtras } = useMessages();
  const { me } = usePreferences();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isFamily = me?.profile?.role === "family";
  const familyAllowed = FAMILY_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (isPublic) {
      return;
    }

    // Only treat the person as signed out once Convex has finished checking the session.
    if (!isLoading && !isAuthenticated) {
      globalThis.location.assign("/sign-in");
    } else if (isFamily && !familyAllowed) {
      router.replace("/family");
    }
  }, [isPublic, isAuthenticated, isLoading, isFamily, familyAllowed, router]);

  if (isPublic) {
    return <AppShell>{children}</AppShell>;
  }

  if (isLoading || !isAuthenticated || me === undefined || me === null) {
    return <AppLoadingShell pathname={pathname} />;
  }

  if (me.needsOnboarding || me.profile === null) {
    return <Onboarding demoModeAllowed={me.demoModeAllowed} />;
  }

  return (
    <AppShell>
      {isFamily && !familyAllowed ? (
        <LoadingRows layout="note" label={appExtras.openingFamily} />
      ) : (
        children
      )}
    </AppShell>
  );
};

export { AppGate };

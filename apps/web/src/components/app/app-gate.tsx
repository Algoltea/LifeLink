"use client";

import { useConvexAuth } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { Onboarding } from "./onboarding";
import { usePreferences } from "./preferences";
import { FamilyShell, OwnerShell } from "./shell";
import { LoadingRows } from "./states";

const FAMILY_PATHS = ["/family", "/settings"];

/** Signed in → finish setup → the owner's or the family member's screens. */
const AppGate = ({ children }: { children: ReactNode }) => {
  const { me } = usePreferences();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isFamily = me?.profile?.role === "family";
  const familyAllowed = FAMILY_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    // Only treat the person as signed out once Convex has finished checking the session.
    if (!isLoading && !isAuthenticated) {
      globalThis.location.assign("/sign-in");
    } else if (isFamily && !familyAllowed) {
      router.replace("/family");
    }
  }, [isAuthenticated, isLoading, isFamily, familyAllowed, router]);

  if (isLoading || !isAuthenticated || me === undefined || me === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-16" id="main">
        <LoadingRows label="Loading LifeLink" rows={4} />
      </main>
    );
  }

  if (me.needsOnboarding || me.profile === null) {
    return <Onboarding demoModeAllowed={me.demoModeAllowed} />;
  }

  if (isFamily) {
    return (
      <FamilyShell>
        {familyAllowed ? (
          children
        ) : (
          <LoadingRows label="Opening your family view" />
        )}
      </FamilyShell>
    );
  }

  return <OwnerShell>{children}</OwnerShell>;
};

export { AppGate };

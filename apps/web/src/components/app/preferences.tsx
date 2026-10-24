"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useTheme } from "next-themes";
import { createContext, use, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

import { saveDisplay } from "@/lib/display";

interface Preferences {
  captions: boolean;
  readAloud: boolean;
  speechRate: number;
}

const DEFAULT_PREFERENCES: Preferences = {
  captions: true,
  readAloud: false,
  speechRate: 0.9,
};

interface Me {
  demoModeAllowed: boolean;
  needsOnboarding: boolean;
  preferences: Doc<"preferences"> | null;
  profile: Doc<"profiles"> | null;
}

interface PreferencesValue {
  me: Me | null | undefined;
  preferences: Preferences;
}

const PreferencesContext = createContext<PreferencesValue>({
  me: undefined,
  preferences: DEFAULT_PREFERENCES,
});

/** Loads the signed-in profile once and applies display settings everywhere. */
const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const me = useQuery(api.profiles.me);
  const { setTheme } = useTheme();
  const stored = me?.preferences ?? null;

  useEffect(() => {
    if (stored === null) {
      return;
    }

    saveDisplay({
      contrast: stored.contrast,
      reducedMotion: stored.reducedMotion,
      textScale: stored.textScale,
    });
    setTheme(stored.theme);
  }, [stored, setTheme]);

  const value = useMemo<PreferencesValue>(
    () => ({
      me,
      preferences:
        stored === null
          ? DEFAULT_PREFERENCES
          : {
              captions: stored.captions,
              readAloud: stored.readAloud,
              speechRate: stored.speechRate,
            },
    }),
    [me, stored]
  );

  return <PreferencesContext value={value}>{children}</PreferencesContext>;
};

const usePreferences = (): PreferencesValue => use(PreferencesContext);

export { PreferencesProvider, usePreferences };

export type { Me, Preferences };

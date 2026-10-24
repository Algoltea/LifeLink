"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { helpStyleOf } from "@lifelink/contracts/help-style";
import type { ExplanationDetail } from "@lifelink/contracts/help-style";
import { interfaceLocaleOf } from "@lifelink/contracts/locale";
import type { NewsKind } from "@lifelink/contracts/news";
import { useQuery } from "convex/react";
import { useTheme } from "next-themes";
import { createContext, use, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

import { setLocale } from "@/i18n/locale";
import { saveDisplay } from "@/lib/display";

interface Preferences {
  captions: boolean;
  explanationDetail: ExplanationDetail;
  newsKind: NewsKind;
  readAloud: boolean;
  showNews: boolean;
  speechRate: number;
  stepByStep: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  captions: true,
  explanationDetail: helpStyleOf(null).detail,
  newsKind: "good",
  readAloud: false,
  showNews: true,
  speechRate: 0.9,
  stepByStep: helpStyleOf(null).stepByStep,
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

  // Unrelated preference saves must not overwrite a language awaiting retry.
  const supportLanguage = stored?.supportLanguage;

  useEffect(() => {
    if (supportLanguage !== undefined) {
      setLocale(interfaceLocaleOf(supportLanguage));
    }
  }, [supportLanguage]);

  const value = useMemo<PreferencesValue>(
    () => ({
      me,
      preferences:
        stored === null
          ? DEFAULT_PREFERENCES
          : {
              captions: stored.captions,
              explanationDetail: helpStyleOf(stored).detail,
              newsKind: stored.newsKind ?? "good",
              readAloud: stored.readAloud,
              showNews: stored.showNews ?? true,
              speechRate: stored.speechRate,
              stepByStep: helpStyleOf(stored).stepByStep,
            },
    }),
    [me, stored]
  );

  return <PreferencesContext value={value}>{children}</PreferencesContext>;
};

const usePreferences = (): PreferencesValue => use(PreferencesContext);

export { PreferencesProvider, usePreferences };

export type { Me, Preferences };

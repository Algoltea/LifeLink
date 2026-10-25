"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { helpStyleOf } from "@lifelink/contracts/help-style";
import type { ExplanationDetail } from "@lifelink/contracts/help-style";
import { interfaceLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import type { NewsKind } from "@lifelink/contracts/news";
import type { SpeechVoice } from "@lifelink/contracts/speech";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useTheme } from "next-themes";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { setLocale } from "@/i18n/locale";
import { authClient } from "@/lib/auth-client";
import { saveDisplay } from "@/lib/display";

interface Preferences {
  captions: boolean;
  explanationDetail: ExplanationDetail;
  newsKind: NewsKind;
  readAloud: boolean;
  showNews: boolean;
  speechRate: number;
  speechVoice: SpeechVoice | null;
  stepByStep: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  captions: true,
  explanationDetail: helpStyleOf(null).detail,
  newsKind: "good",
  readAloud: false,
  showNews: true,
  speechRate: 0.9,
  speechVoice: null,
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

interface LanguagePreference {
  changeLanguage: (locale: InterfaceLocale) => void;
  error: boolean;
  pending: boolean;
  retry: () => void;
}

const LanguagePreferenceContext = createContext<LanguagePreference>({
  changeLanguage: setLocale,
  error: false,
  pending: false,
  retry: () => {
    // Without a provider, language changes are local and need no account retry.
  },
});

interface LanguageScope {
  profileId: string | null;
}

interface LanguageAttempt {
  locale: InterfaceLocale;
  scope: LanguageScope;
  status: "pending" | "saved" | "failed";
}

const useAccountLanguage = (me: Me | null | undefined): LanguagePreference => {
  const update = useMutation(api.profiles.updatePreferences);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const profileId = me?.profile?._id;
  const profileUserId = me?.profile?.authUserId;

  // A fresh scope also invalidates old work if someone signs out and back in.
  const scope = useMemo<LanguageScope>(
    () => ({
      profileId:
        !isLoading &&
        isAuthenticated &&
        !isPending &&
        userId &&
        profileUserId === userId
          ? (profileId ?? null)
          : null,
    }),
    [isLoading, isAuthenticated, isPending, userId, profileUserId, profileId]
  );

  const activeScope = useRef<LanguageScope | null>(scope);
  const latest = useRef<LanguageAttempt | null>(null);
  const confirmed = useRef<LanguageAttempt | null>(null);
  const [attempt, setAttempt] = useState<LanguageAttempt | null>(null);
  const current = attempt?.scope === scope ? attempt : null;
  const supportLanguage = me?.preferences?.supportLanguage;

  useEffect(() => {
    activeScope.current = scope;
    latest.current = null;

    return () => {
      activeScope.current = null;
    };
  }, [scope]);

  useEffect(() => {
    if (scope.profileId === null || supportLanguage === undefined) {
      return;
    }

    const savedLocale = interfaceLocaleOf(supportLanguage);

    // Retain an explicit choice until its mutation AND query confirm it.
    if (current) {
      if (
        current.status !== "saved" ||
        (confirmed.current !== current && savedLocale !== current.locale)
      ) {
        return;
      }

      confirmed.current = current;
    }

    setLocale(savedLocale);
  }, [scope, supportLanguage, current]);

  const save = useCallback(
    async (locale: InterfaceLocale): Promise<void> => {
      if (scope.profileId === null || activeScope.current !== scope) {
        return;
      }

      const request: LanguageAttempt = { locale, scope, status: "pending" };
      latest.current = request;
      setAttempt(request);
      let status: LanguageAttempt["status"] = "saved";

      try {
        await update({ supportLanguage: locale });
      } catch {
        status = "failed";
      }

      if (activeScope.current !== scope || latest.current !== request) {
        return;
      }

      const result = { ...request, status };
      latest.current = result;
      setAttempt(result);
    },
    [scope, update]
  );

  const changeLanguage = useCallback(
    (locale: InterfaceLocale): void => {
      setLocale(locale);
      // Local choices made before auth/profile readiness are never uploaded later.
      void save(locale);
    },
    [save]
  );

  const retry = useCallback((): void => {
    const failed = latest.current;

    if (failed?.scope === scope && failed.status === "failed") {
      void save(failed.locale);
    }
  }, [save, scope]);

  return useMemo(
    () => ({
      changeLanguage,
      error: current?.status === "failed",
      pending: current?.status === "pending",
      retry,
    }),
    [changeLanguage, current?.status, retry]
  );
};

/** Loads the signed-in profile once and applies display settings everywhere. */
const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const me = useQuery(api.profiles.me);
  const language = useAccountLanguage(me);
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
              explanationDetail: helpStyleOf(stored).detail,
              newsKind: stored.newsKind ?? "good",
              readAloud: stored.readAloud,
              showNews: stored.showNews ?? true,
              speechRate: stored.speechRate,
              speechVoice: stored.speechVoice ?? null,
              stepByStep: helpStyleOf(stored).stepByStep,
            },
    }),
    [me, stored]
  );

  return (
    <PreferencesContext value={value}>
      <LanguagePreferenceContext value={language}>
        {children}
      </LanguagePreferenceContext>
    </PreferencesContext>
  );
};

const usePreferences = (): PreferencesValue => use(PreferencesContext);

const useLanguagePreference = (): LanguagePreference =>
  use(LanguagePreferenceContext);

export { PreferencesProvider, useLanguagePreference, usePreferences };

export type { Me, Preferences };

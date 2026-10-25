import {
  DEFAULT_LOCALE,
  interfaceLocaleOf,
  intlLocaleOf,
} from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { useSyncExternalStore } from "react";

import { LOCALE_STORAGE_KEY } from "./boot";
import { de } from "./messages/de";
import { en } from "./messages/en";
import type { Messages } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { it } from "./messages/it";
import { ko } from "./messages/ko";
import { pt } from "./messages/pt";
import { tl } from "./messages/tl";
import { vi } from "./messages/vi";
import { zh } from "./messages/zh";

/**
 * The language LifeLink's screens are written in. The signed-in choice is
 * mirrored to localStorage, so sign-in, loading, and offline Solitaire open in
 * the same language before the account loads. Without a saved choice, the
 * browser's language decides.
 */
const CATALOGS: Record<InterfaceLocale, Messages> = {
  de,
  en,
  es,
  fr,
  it,
  ko,
  pt,
  tl,
  vi,
  zh,
};

const readStoredLocale = (): InterfaceLocale => {
  let saved: string | null = null;

  try {
    saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    // The browser's language still works when device storage is unavailable.
  }

  return interfaceLocaleOf(saved || globalThis.navigator?.language);
};

let active: InterfaceLocale =
  typeof window === "undefined" ? DEFAULT_LOCALE : readStoredLocale();

const listeners = new Set<() => void>();

const subscribeToLocale = (onChange: () => void) => {
  listeners.add(onChange);

  return () => {
    listeners.delete(onChange);
  };
};

const getLocale = (): InterfaceLocale => active;

const setLocale = (locale: InterfaceLocale): void => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (private mode); the change still applies to this page.
  }

  document.documentElement.lang = locale;

  if (locale === active) {
    return;
  }

  active = locale;

  for (const listener of listeners) {
    listener();
  }
};

const serverLocale = (): InterfaceLocale => DEFAULT_LOCALE;

/** The current locale; components re-render when it changes. */
const useLocale = (): InterfaceLocale =>
  useSyncExternalStore(subscribeToLocale, getLocale, serverLocale);

/** The current locale's words, for components. */
const useMessages = (): Messages => CATALOGS[useLocale()];

/** Another locale's words, for text someone else will read, like an invitation to a contact. */
const messagesFor = (locale: InterfaceLocale): Messages => CATALOGS[locale];

/** The current locale's words, for plain modules called while rendering. */
const currentMessages = (): Messages => CATALOGS[active];

/** The BCP 47 tag for Intl formatting in the current locale. */
const currentIntlLocale = (): string => intlLocaleOf(active);

export {
  currentIntlLocale,
  currentMessages,
  getLocale,
  messagesFor,
  setLocale,
  useLocale,
  useMessages,
};

export type { Messages } from "./messages/en";

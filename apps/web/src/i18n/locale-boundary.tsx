"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { useLocale } from "./locale";

/** Keep the document language in sync without resetting drafts or active sessions. */
const LocaleBoundary = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return children;
};

export { LocaleBoundary };

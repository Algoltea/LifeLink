"use client";

import { Fragment } from "react";
import type { ReactNode } from "react";

import { useLocale } from "./locale";

/**
 * Remounts the screens when the language changes. Formatting helpers read the
 * language directly, and memoized components would otherwise keep the old
 * words until something else re-rendered them. Language changes are rare.
 */
const LocaleBoundary = ({ children }: { children: ReactNode }) => (
  <Fragment key={useLocale()}>{children}</Fragment>
);

export { LocaleBoundary };

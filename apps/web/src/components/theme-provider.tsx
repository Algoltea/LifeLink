"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/** Light by default; the person can choose dark or follow the device in Settings. */
const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="light"
    disableTransitionOnChange
    enableSystem
    storageKey="lifelink:theme"
  >
    {children}
  </NextThemesProvider>
);

export { ThemeProvider };

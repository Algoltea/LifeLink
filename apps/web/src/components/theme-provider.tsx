"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

/** The public landing stays light; app routes use the person's saved theme. */
const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Use the rendered route group so the signed-out "/" rewrite is covered too.
  const segment = useSelectedLayoutSegment();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem
      forcedTheme={segment === "(public)" ? "light" : undefined}
      scriptProps={{
        type: typeof window === "undefined" ? "text/javascript" : "text/plain",
      }}
      storageKey="lifelink:theme"
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };

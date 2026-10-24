import type { ReactNode } from "react";

import { AppGate } from "@/components/app/app-gate";
import { Providers } from "@/components/app/providers";

/**
 * Shared by signed-in screens and public Solitaire, so moving between them keeps
 * the navigation, providers, and session mounted instead of rebuilding the page.
 * This layout reads no cookies: Solitaire stays static and safe to cache publicly.
 */
const ShellLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <Providers>
    <AppGate>{children}</AppGate>
  </Providers>
);

export default ShellLayout;

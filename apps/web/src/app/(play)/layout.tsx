import type { ReactNode } from "react";

import { PlayShell } from "@/components/app/shell";

/** Public navigation and local play; no authentication or private data is required. */
const PlayLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <PlayShell>{children}</PlayShell>
);

export default PlayLayout;

import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppGate } from "@/components/app/app-gate";
import { Providers } from "@/components/app/providers";
import { getToken, isAuthenticated } from "@/lib/auth-server";

/** Signed-in screens. Private pages are rendered per request and never cached by the service worker. */
const AppLayout = async ({ children }: { children: ReactNode }) => {
  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }

  const token = await getToken();

  return (
    <Providers initialToken={token}>
      <AppGate>{children}</AppGate>
    </Providers>
  );
};

export default AppLayout;

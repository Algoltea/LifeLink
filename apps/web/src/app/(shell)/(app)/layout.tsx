import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { isAuthenticated } from "@/lib/auth-server";

/** Signed-in screens. Private pages are rendered per request and never cached by the service worker. */
const AppLayout = async ({ children }: { children: ReactNode }) => {
  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }

  return children;
};

export default AppLayout;

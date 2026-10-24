import type { ReactNode } from "react";

import { Providers } from "@/components/app/providers";

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <Providers>{children}</Providers>
);

export default AuthLayout;

import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";
import type { NextConfig } from "next";

import { withPwa } from "./pwa.config";

const withVarlock = varlockNextConfigPlugin();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // The microphone is used only for voice requests, on this origin.
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(self)",
  },
];

const nextConfig: NextConfig = {
  headers: () =>
    Promise.resolve([{ headers: securityHeaders, source: "/:path*" }]),
  reactCompiler: true,
  typedRoutes: true,
};

export default withVarlock(withPwa(nextConfig));

import type { NextConfig } from "next";

/** Serve the service worker uncached and same-origin only, so updates reach installed apps. */
export const withPwa = (config: NextConfig): NextConfig => {
  // Static exports need these headers configured at the hosting layer.
  if (config.output === "export") {
    return config;
  }

  return {
    ...config,
    headers: async () => [
      ...((await config.headers?.()) ?? []),
      {
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
        source: "/sw.js",
      },
    ],
  };
};

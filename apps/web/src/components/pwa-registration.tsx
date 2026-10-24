"use client";

import { useEffect } from "react";

/** Registers the service worker (offline fallback, offline solitaire and mahjong). Never caches private pages. */
const PwaRegistration = () => {
  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    const register = async (): Promise<void> => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch {
        // Registration failure only disables offline support; the app keeps working online.
      }
    };

    void register();
  }, []);

  return null;
};

export { PwaRegistration };

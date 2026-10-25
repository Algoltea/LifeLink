"use client";

import { usePreferences } from "./preferences";

/** Account-scoped presentation only. Execution must still use demoMode. */
const usePresentationDemo = (): boolean => {
  const { me } = usePreferences();

  return me?.profile?.presentationDemo === true;
};

export { usePresentationDemo };

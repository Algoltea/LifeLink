import { useSyncExternalStore } from "react";

const noSubscription = (): (() => void) => () => {
  // Browser capabilities such as speech synthesis don't change while the page is open.
};

const notOnServer = (): boolean => false;

/**
 * Whether the browser offers a capability. The server and the first
 * hydration pass say no, so markup matches; the browser's answer follows.
 */
const useBrowserCapability = (check: () => boolean): boolean =>
  useSyncExternalStore(noSubscription, check, notOnServer);

export { useBrowserCapability };

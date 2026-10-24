"use client";

import { DISPLAY_BOOT_SCRIPT } from "@/lib/display";

/** Run while parsing server HTML; React's client copy must remain inert. */
const DisplayBootScript = () => (
  <script
    // oxlint-disable-next-line react/no-danger -- static, first-party script with no user input.
    dangerouslySetInnerHTML={{ __html: DISPLAY_BOOT_SCRIPT }}
    suppressHydrationWarning
    type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
  />
);

export { DisplayBootScript };

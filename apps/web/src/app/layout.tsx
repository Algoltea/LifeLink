import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "../index.css";

import { PwaRegistration } from "@/components/pwa-registration";
import { ThemeProvider } from "@/components/theme-provider";
import { DISPLAY_BOOT_SCRIPT } from "@/lib/display";

// One self-hosted face for headings and body, with an explicit system fallback.
const bodyFont = IBM_Plex_Sans({
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  appleWebApp: { capable: true, statusBarStyle: "default", title: "LifeLink" },
  applicationName: "LifeLink",
  description:
    "A calm helper for staying in touch with family, keeping track of the day, and checking messages that look wrong.",
  title: { default: "LifeLink", template: "%s · LifeLink" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { color: "#fffdf8", media: "(prefers-color-scheme: light)" },
    { color: "#211a16", media: "(prefers-color-scheme: dark)" },
  ],
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html className={bodyFont.variable} lang="en" suppressHydrationWarning>
    <head>
      {/* Applies the person's text size, contrast, and motion settings before first paint. */}
      {/* oxlint-disable-next-line react/no-danger -- static, first-party script with no user input. */}
      <script dangerouslySetInnerHTML={{ __html: DISPLAY_BOOT_SCRIPT }} />
    </head>
    <body>
      <ThemeProvider>
        {children}
        <PwaRegistration />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;

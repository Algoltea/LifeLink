import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "../index.css";

import { DisplayBootScript } from "@/components/display-boot-script";
import { PwaRegistration } from "@/components/pwa-registration";
import { ThemeProvider } from "@/components/theme-provider";
import { ENV } from "@/env";

// Keep the self-hosted face; installed fonts cover Vietnamese accents and CJK
// without downloading additional font families or requiring a network connection.
const bodyFont = IBM_Plex_Sans({
  display: "swap",
  fallback: [
    "Arial",
    "Noto Sans",
    "PingFang SC",
    "Microsoft YaHei",
    "Noto Sans CJK SC",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "Noto Sans CJK KR",
    "sans-serif",
  ],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});

const socialImage = {
  alt: "Claude Monet, Cliff Walk at Pourville: two figures on a flowered clifftop above a bright sea with sailboats.",
  height: 1922,
  type: "image/jpeg",
  url: "/landing/monet-cliff-walk-at-pourville.jpg",
  width: 2400,
};

export const metadata: Metadata = {
  appleWebApp: { capable: true, statusBarStyle: "default", title: "LifeLink" },
  applicationName: "LifeLink",
  description:
    "A calm helper for staying in touch with family, keeping track of the day, and checking messages that look wrong.",
  metadataBase: new URL(ENV.NEXT_PUBLIC_SITE_URL),
  openGraph: {
    images: [socialImage],
    siteName: "LifeLink",
    type: "website",
  },
  title: { default: "LifeLink", template: "%s · LifeLink" },
  twitter: { card: "summary_large_image", images: [socialImage] },
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
      <DisplayBootScript />
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

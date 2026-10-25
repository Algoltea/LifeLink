import type { Metadata, Viewport } from "next";

import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  description:
    "LifeLink helps you write to family, keep track of appointments, and check messages that seem suspicious. Nothing is sent until you say so.",
  title: { absolute: "LifeLink · Nothing is sent until you say so" },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fffdf8",
};

/** Shown at "/" to signed-out visitors (see src/proxy.ts) and here directly. */
const WelcomePage = () => <LandingPage />;

export default WelcomePage;

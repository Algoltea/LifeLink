import type { Metadata } from "next";

import { NotFoundContent } from "@/components/app/not-found-content";

export const metadata: Metadata = { title: "Page not found" };

const NotFound = () => (
  <main className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-10">
    <NotFoundContent />
  </main>
);

export default NotFound;

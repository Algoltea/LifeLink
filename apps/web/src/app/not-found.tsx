import { buttonVariants } from "@lifelink/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/app/brand";

export const metadata: Metadata = { title: "Page not found" };

const NotFound = () => (
  <main className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-10">
    <section
      aria-labelledby="missing-heading"
      className="border-border bg-parchment flex max-w-xl flex-col gap-5 rounded-lg border px-7 py-8"
    >
      <BrandMark size={48} />
      <h1
        className="text-mobile-title sm:text-page-title font-semibold"
        id="missing-heading"
      >
        There’s no page here
      </h1>
      <p className="text-lg">
        The link may be old, or the address may have a typo. Nothing has been
        changed.
      </p>
      <Link className={buttonVariants({ className: "self-start" })} href="/">
        Go to Today
      </Link>
    </section>
  </main>
);

export default NotFound;

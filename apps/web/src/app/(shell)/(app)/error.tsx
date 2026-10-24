"use client";

import { Button, buttonVariants } from "@lifelink/ui/components/button";
import Link from "next/link";

/** A page failed to load. The rest of the app keeps working, and nothing was sent or changed. */
const AppError = ({ retry }: { retry: () => void }) => (
  <section
    aria-labelledby="error-heading"
    className="border-border bg-parchment flex max-w-2xl flex-col gap-5 rounded-lg border px-6 py-8"
  >
    <h1
      className="text-mobile-title sm:text-page-title font-semibold"
      id="error-heading"
    >
      This page didn’t load
    </h1>
    <p className="text-lg">
      Nothing was sent or changed. It’s usually a brief connection problem, so
      trying again often works.
    </p>
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => retry()}>Try again</Button>
      <Link className={buttonVariants({ variant: "outline" })} href="/">
        Go to Today
      </Link>
    </div>
  </section>
);

export default AppError;

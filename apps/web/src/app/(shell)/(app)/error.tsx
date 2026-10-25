"use client";

import { Button, buttonVariants } from "@lifelink/ui/components/button";
import Link from "next/link";

import { useMessages } from "@/i18n/locale";

/** A page failed to load. The rest of the app keeps working, and nothing was sent or changed. */
const AppError = ({ retry }: { retry: () => void }) => {
  const t = useMessages();

  return (
    <section
      aria-labelledby="error-heading"
      className="border-border bg-parchment flex max-w-2xl flex-col gap-5 rounded-lg border px-6 py-8"
    >
      <h1
        className="text-mobile-title sm:text-page-title font-semibold"
        id="error-heading"
      >
        {t.errors.pageTitle}
      </h1>
      <p className="text-lg">{t.errors.pageBody}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => retry()}>{t.common.tryAgain}</Button>
        <Link className={buttonVariants({ variant: "outline" })} href="/">
          {t.errors.goToToday}
        </Link>
      </div>
    </section>
  );
};

export default AppError;

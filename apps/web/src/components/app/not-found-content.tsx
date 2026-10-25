"use client";

import { buttonVariants } from "@lifelink/ui/components/button";
import Link from "next/link";

import { useMessages } from "@/i18n/locale";

import { BrandMark } from "./brand";

/** The missing-page note, in the language the person chose on this device. */
const NotFoundContent = () => {
  const t = useMessages().errors;

  return (
    <section
      aria-labelledby="missing-heading"
      className="border-border bg-parchment flex max-w-xl flex-col gap-5 rounded-lg border px-7 py-8"
    >
      <BrandMark size={40} />
      <h1
        className="text-mobile-title sm:text-page-title font-semibold"
        id="missing-heading"
      >
        {t.notFoundTitle}
      </h1>
      <p className="text-lg">{t.notFoundBody}</p>
      <Link className={buttonVariants({ className: "self-start" })} href="/">
        {t.goToToday}
      </Link>
    </section>
  );
};

export { NotFoundContent };

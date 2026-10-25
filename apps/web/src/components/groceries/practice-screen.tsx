"use client";

import { buttonVariants } from "@lifelink/ui/components/button";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { useMessages } from "@/i18n/locale";

/** Keep old practice-shopping links useful after shopping was retired. */
const PracticeScreen = () => {
  const t = useMessages().groceries;

  return (
    <>
      <PageHeader subline={t.practice.subline} title={t.practice.title} />
      <Link
        className={buttonVariants({
          className: "self-start",
          variant: "outline",
        })}
        href="/groceries"
      >
        {t.backToGroceries}
      </Link>
    </>
  );
};

export { PracticeScreen };

import { buttonVariants } from "@lifelink/ui/components/button";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";

/** Keep old practice-shopping links useful after shopping was retired. */
const PracticeScreen = () => (
  <>
    <PageHeader
      subline="Shopping through LifeLink is no longer available. You can still keep a grocery list, plan your budget, and copy or print your list."
      title="Shopping unavailable"
    />
    <Link
      className={buttonVariants({
        className: "self-start",
        variant: "outline",
      })}
      href="/groceries"
    >
      Back to groceries
    </Link>
  </>
);

export { PracticeScreen };

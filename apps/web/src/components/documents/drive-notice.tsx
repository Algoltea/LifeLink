"use client";

import { buttonVariants } from "@lifelink/ui/components/button";
import { FolderIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useMessages } from "@/i18n/locale";

/** Where the files come from, in one slim line; `action` names the link to Connections. */
const DriveNotice = ({
  action,
  children,
}: {
  action?: string;
  children: ReactNode;
}) => {
  const t = useMessages().documents;

  return (
    <section
      aria-label={t.yourDrive}
      className="bg-parchment text-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl py-2 pr-2 pl-5"
    >
      <p className="min-h-control flex min-w-0 flex-1 basis-80 items-center gap-3">
        <FolderIcon
          aria-hidden="true"
          className="text-muted-foreground size-5 shrink-0"
        />
        <span>{children}</span>
      </p>
      {action ? (
        <Link
          className={buttonVariants({
            className: "bg-raised hover:bg-raised font-semibold",
            size: "sm",
            variant: "outline",
          })}
          href="/connections"
        >
          {action}
        </Link>
      ) : null}
    </section>
  );
};

export { DriveNotice };

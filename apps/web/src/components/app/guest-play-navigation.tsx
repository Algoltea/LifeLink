import { buttonVariants } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import Link from "next/link";

import { useMessages } from "@/i18n/locale";

const GuestAccountLinks = ({ compact = false }: { compact?: boolean }) => {
  const t = useMessages().guest;

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-col gap-[0.444rem]"
      }
    >
      <Link
        className={cn(
          buttonVariants({ size: compact ? "sm" : "default" }),
          !compact &&
            "min-h-[2.889rem] w-full text-[length:1rem] leading-[1.556]"
        )}
        href="/sign-in?mode=sign-up"
        prefetch={false}
      >
        {t.signUp}
      </Link>
      <Link
        className={cn(
          buttonVariants({ variant: "link" }),
          !compact && "w-full text-[length:1rem] leading-[1.556]"
        )}
        href="/sign-in"
        prefetch={false}
      >
        {t.signIn}
      </Link>
    </div>
  );
};

const GuestPlayInvitation = () => {
  const { guest: t, shell } = useMessages();

  return (
    <section
      aria-labelledby="guest-invitation-title"
      className="flex flex-col gap-[1.333rem] pt-[5.778rem]"
    >
      <div className="flex flex-col gap-[0.889rem]">
        <h2 className="text-section font-semibold" id="guest-invitation-title">
          {t.joinTitle}
        </h2>
        <p className="text-muted-foreground text-body">{t.joinBody}</p>
      </div>
      <p className="text-muted-foreground text-label">
        <Link className="text-accent-foreground underline" href="/solitaire">
          {shell.nav.solitaire}
        </Link>{" "}
        {t.and}{" "}
        <Link className="text-accent-foreground underline" href="/mahjong">
          {shell.nav.mahjong}
        </Link>{" "}
        {t.gamesFree}
      </p>
    </section>
  );
};

export { GuestAccountLinks, GuestPlayInvitation };

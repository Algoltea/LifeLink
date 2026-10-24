import { buttonVariants } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import Link from "next/link";

const GuestAccountLinks = ({ compact = false }: { compact?: boolean }) => (
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
        !compact && "min-h-[2.889rem] w-full text-[length:1rem] leading-[1.556]"
      )}
      href="/sign-in?mode=sign-up"
      prefetch={false}
    >
      Sign up
    </Link>
    <Link
      className={cn(
        buttonVariants({ variant: "link" }),
        !compact && "w-full text-[length:1rem] leading-[1.556]"
      )}
      href="/sign-in"
      prefetch={false}
    >
      Sign in
    </Link>
  </div>
);

const GuestPlayInvitation = () => (
  <section
    aria-labelledby="guest-invitation-title"
    className="flex flex-col gap-[1.333rem] pt-[5.778rem]"
  >
    <div className="flex flex-col gap-[0.889rem]">
      <h2 className="text-section font-semibold" id="guest-invitation-title">
        Join LifeLink
      </h2>
      <p className="text-muted-foreground text-body">
        Stay close to family and get help with your day.
      </p>
    </div>
    <GuestAccountLinks />
    <p className="text-muted-foreground text-label">
      <Link className="text-accent-foreground underline" href="/solitaire">
        Solitaire
      </Link>{" "}
      and{" "}
      <Link className="text-accent-foreground underline" href="/mahjong">
        Mahjong
      </Link>{" "}
      are yours to enjoy without signing up.
    </p>
  </section>
);

export { GuestAccountLinks, GuestPlayInvitation };

"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useQuery } from "convex/react";
import {
  HeartHandshakeIcon,
  HomeIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PlugIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingBasketIcon,
  SpadeIcon,
  UsersRoundIcon,
  WifiOffIcon,
  XIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

import { BrandName } from "./brand";
import { useOffline } from "./offline-queue";
import { usePreferences } from "./preferences";

interface NavItem {
  count?: number;
  href: Route;
  icon: LucideIcon;
  label: string;
}

interface NavGroup {
  items: NavItem[];
  label: string | null;
}

const WAITING = new Set([
  "needs_clarification",
  "awaiting_approval",
  "needs_attention",
]);

const ownerNavigation = (waiting = 0): NavGroup[] => [
  {
    items: [
      { count: waiting, href: "/", icon: HomeIcon, label: "Today" },
      { href: "/ask", icon: MessageSquareTextIcon, label: "Ask LifeLink" },
      { href: "/messages", icon: MessagesSquareIcon, label: "Messages" },
      { href: "/email", icon: MailIcon, label: "Email" },
    ],
    label: null,
  },
  {
    items: [
      { href: "/scam", icon: ShieldCheckIcon, label: "Scam check" },
      { href: "/groceries", icon: ShoppingBasketIcon, label: "Groceries" },
      { href: "/solitaire", icon: SpadeIcon, label: "Solitaire" },
    ],
    label: "Help with",
  },
  {
    items: [
      { href: "/circle", icon: HeartHandshakeIcon, label: "Trusted circle" },
      { href: "/connections", icon: PlugIcon, label: "Connections" },
      { href: "/settings", icon: SettingsIcon, label: "Settings" },
    ],
    label: "Your setup",
  },
];

const useOwnerNav = (): NavGroup[] => {
  const tasks = useQuery(api.tasks.list, { include: "active" });
  const waiting = tasks?.filter((task) => WAITING.has(task.status)).length ?? 0;

  return ownerNavigation(waiting);
};

const FAMILY_NAV: NavGroup[] = [
  {
    items: [
      { href: "/family", icon: UsersRoundIcon, label: "Family" },
      { href: "/solitaire", icon: SpadeIcon, label: "Solitaire" },
      { href: "/settings", icon: SettingsIcon, label: "Settings" },
    ],
    label: null,
  },
];

const isActive = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const NavList = ({
  groups,
  onNavigate,
}: {
  groups: NavGroup[];
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {groups.map((group) => (
        <div className="flex flex-col gap-1" key={group.label ?? "main"}>
          {group.label ? (
            <p className="text-muted-foreground text-label px-4 pb-1">
              {group.label}
            </p>
          ) : null}
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-foreground hover:bg-neutral-wash text-label min-h-control flex items-center gap-3 rounded-md px-4 transition-colors",
                      active &&
                        "bg-neutral-wash text-accent-foreground font-semibold"
                    )}
                    href={item.href}
                    onClick={onNavigate}
                    prefetch={item.href === "/solitaire" ? true : undefined}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        "size-5 shrink-0",
                        active
                          ? "text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.count ? (
                      <span className="num bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-sm font-semibold">
                        {item.count}
                        <span className="sr-only"> waiting for you</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

const SignOutButton = () => (
  <Button
    className="w-full justify-start"
    onClick={async () => {
      await authClient.signOut();
      globalThis.location.assign("/sign-in");
    }}
    variant="ghost"
  >
    <LogOutIcon />
    Sign out
  </Button>
);

const AccountRow = () => {
  const { me } = usePreferences();
  const profile = me?.profile;

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 px-4">
      <p className="text-label font-medium">{profile.displayName}</p>
      <p className="text-muted-foreground text-label">
        {profile.role === "owner"
          ? `${profile.preferredName}'s LifeLink`
          : "Family member"}
      </p>
    </div>
  );
};

const Notices = () => {
  const { me } = usePreferences();
  const { online, queue } = useOffline();
  const demo = me?.profile?.demoMode === true;

  return (
    <>
      {online ? null : (
        <output className="bg-warning-wash text-warning flex items-center gap-3 px-5 py-3 text-base">
          <WifiOffIcon aria-hidden="true" className="size-5 shrink-0" />
          <span>
            You’re offline. You can keep writing; anything you approve will be
            checked again and sent when you’re back online.
            {queue.length > 0 ? ` ${queue.length} waiting.` : ""}
          </span>
        </output>
      )}
      {demo ? (
        <div className="border-border bg-parchment text-muted-foreground text-label flex flex-wrap items-center justify-between gap-2 border-b px-5 py-2">
          <p>
            <strong className="font-semibold">Practice mode.</strong> Sample
            people and practice replies. Nothing is sent to real people or
            ordered.
          </p>
          <Link
            className="min-h-control inline-flex items-center font-medium underline"
            href="/settings#demo"
          >
            Turn off
          </Link>
        </div>
      ) : null}
    </>
  );
};

const MobileMenu = ({
  account,
  groups,
}: {
  account: ReactNode;
  groups: NavGroup[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root onOpenChange={setOpen} open={open}>
      <DialogPrimitive.Trigger
        render={
          <Button
            aria-label="Open menu"
            className="gap-[8px] px-[6px] text-[0.889rem] leading-normal"
            variant="ghost"
          />
        }
      >
        <MenuIcon aria-hidden="true" className="size-[20px]" />
        Menu
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup className="bg-background fixed inset-0 z-50 flex flex-col gap-6 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Menu
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={
                <Button aria-label="Close menu" size="icon" variant="ghost" />
              }
            >
              <XIcon className="size-6" />
            </DialogPrimitive.Close>
          </div>
          <NavList groups={groups} onNavigate={() => setOpen(false)} />
          <div className="border-rule mt-auto flex flex-col gap-4 border-t pt-5">
            {account}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const ShellFrame = ({
  account,
  children,
  groups,
  notices,
}: {
  account: ReactNode;
  children: ReactNode;
  groups: NavGroup[];
  notices?: ReactNode;
}) => (
  <div className="bg-background min-h-svh">
    <a
      className="bg-primary text-primary-foreground sr-only z-50 rounded-lg px-5 py-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      href="#main"
    >
      Skip to main content
    </a>
    <div className="min-[1101px]:grid min-[1101px]:grid-cols-[13.333rem_minmax(0,1fr)]">
      <aside className="border-border bg-parchment sticky top-0 hidden h-svh flex-col gap-6 overflow-y-auto border-r px-3 py-5 min-[1101px]:flex">
        <Link
          className="min-h-control rounded-md px-4 py-1"
          href={groups === FAMILY_NAV ? "/family" : "/"}
        >
          <BrandName />
        </Link>
        <NavList groups={groups} />
        <div className="border-border mt-auto flex flex-col gap-3 border-t pt-4">
          {account}
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="border-border bg-parchment sticky top-0 z-40 flex min-h-[3.556rem] flex-wrap items-center justify-between gap-[8px] border-b px-[16px] py-1 min-[1101px]:hidden">
          <Link
            className="min-h-control inline-flex items-center rounded-md"
            href={groups === FAMILY_NAV ? "/family" : "/"}
          >
            <BrandName compact />
          </Link>
          <MobileMenu account={account} groups={groups} />
        </div>
        {notices}
        <main
          className="mx-auto flex w-full max-w-[72rem] flex-col gap-7 px-[1.111rem] py-6 min-[1101px]:py-8 sm:px-[2.222rem]"
          id="main"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  </div>
);

const Account = () => (
  <>
    <AccountRow />
    <SignOutButton />
  </>
);

const OwnerShell = ({ children }: { children: ReactNode }) => {
  const groups = useOwnerNav();

  return (
    <ShellFrame account={<Account />} groups={groups} notices={<Notices />}>
      {children}
    </ShellFrame>
  );
};

const FamilyShell = ({ children }: { children: ReactNode }) => (
  <ShellFrame account={<Account />} groups={FAMILY_NAV} notices={<Notices />}>
    {children}
  </ShellFrame>
);

// The game shell reads no account, tasks, or queue. Its cached HTML contains
// navigation only, and remains usable before sign-in and without a connection.
const PlayShell = ({ children }: { children: ReactNode }) => (
  <ShellFrame
    account={
      <p className="text-muted-foreground text-label px-4">
        Solitaire is saved on this device and works offline.
      </p>
    }
    groups={ownerNavigation()}
  >
    {children}
  </ShellFrame>
);

export { FamilyShell, OwnerShell, PlayShell };

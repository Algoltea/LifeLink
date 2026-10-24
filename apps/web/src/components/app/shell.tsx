"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useQuery } from "convex/react";
import {
  ChevronsUpDownIcon,
  FlaskConicalIcon,
  FolderOpenIcon,
  HeartHandshakeIcon,
  HomeIcon,
  LayersIcon,
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

import { HIDE_ON_PHONES } from "@/features/mahjong/screen";
import { authClient } from "@/lib/auth-client";

import { Avatar } from "./bits";
import { BrandName } from "./brand";
import {
  GuestAccountLinks,
  GuestPlayInvitation,
} from "./guest-play-navigation";
import { useOffline } from "./offline-queue";
import { usePreferences } from "./preferences";

interface NavItem {
  count?: number;
  href: Route;
  icon: LucideIcon;
  label: string;
  /** Left out of the phone menu, because the page needs a tablet-sized screen. */
  wideOnly?: boolean;
}

interface NavGroup {
  items: NavItem[];
  label: string | null;
  /** Sits at the bottom of the sidebar, just above the account, apart from destinations. */
  pinned?: boolean;
}

const SETTINGS_GROUP: NavGroup = {
  items: [{ href: "/settings", icon: SettingsIcon, label: "Settings" }],
  label: null,
  pinned: true,
};

const SOLITAIRE: NavItem = {
  href: "/solitaire",
  icon: SpadeIcon,
  label: "Solitaire",
};

const MAHJONG: NavItem = {
  href: "/mahjong",
  icon: LayersIcon,
  label: "Mahjong",
  wideOnly: true,
};

/** Public games: prefetched so they open quickly and get cached for offline play. */
const PUBLIC_GAMES = new Set<string>([SOLITAIRE.href, MAHJONG.href]);

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
      { href: "/documents", icon: FolderOpenIcon, label: "Documents" },
    ],
    label: null,
  },
  {
    items: [
      { href: "/scam", icon: ShieldCheckIcon, label: "Scam check" },
      { href: "/groceries", icon: ShoppingBasketIcon, label: "Groceries" },
    ],
    label: "Help with",
  },
  {
    items: [SOLITAIRE, MAHJONG],
    label: "Games",
  },
  {
    items: [
      { href: "/circle", icon: HeartHandshakeIcon, label: "Trusted circle" },
      { href: "/connections", icon: PlugIcon, label: "Connections" },
    ],
    label: "Your setup",
  },
  SETTINGS_GROUP,
];

const PLAY_NAV: NavGroup[] = [
  {
    items: [SOLITAIRE, MAHJONG],
    label: null,
  },
  SETTINGS_GROUP,
];

const FAMILY_NAV: NavGroup[] = [
  {
    items: [
      { href: "/family", icon: UsersRoundIcon, label: "Family" },
      SOLITAIRE,
      MAHJONG,
    ],
    label: null,
  },
  SETTINGS_GROUP,
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
    <nav aria-label="Main" className="flex flex-1 flex-col gap-5">
      {groups.map((group) => (
        <div
          className={cn("flex flex-col gap-1", group.pinned && "mt-auto")}
          key={group.label ?? (group.pinned ? "pinned" : "main")}
        >
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
                <li
                  className={item.wideOnly ? HIDE_ON_PHONES : undefined}
                  key={item.href}
                >
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-foreground hover:bg-neutral-wash text-label min-h-control flex items-center gap-3 rounded-md px-4 transition-colors",
                      active &&
                        "bg-neutral-wash text-accent-foreground font-semibold"
                    )}
                    href={item.href}
                    onClick={onNavigate}
                    prefetch={PUBLIC_GAMES.has(item.href) ? true : undefined}
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

const ACCOUNT_HUE = 25;

const ACCOUNT_ITEM =
  "text-label min-h-control flex cursor-pointer items-center gap-3 rounded-md px-3 font-medium whitespace-nowrap outline-none select-none data-[highlighted]:bg-neutral-wash";

const signOut = async (): Promise<void> => {
  await authClient.signOut();
  globalThis.location.assign("/sign-in");
};

/** One quiet account row; practice mode and sign out sit one deliberate step away. */
const Account = () => {
  const { me } = usePreferences();
  const profile = me?.profile;

  if (!profile) {
    return null;
  }

  const family = profile.role === "family";
  let detail: string | null = null;

  if (family) {
    detail = "Family member";
  } else if (profile.demoMode) {
    detail = "Practice mode";
  }

  return (
    <Menu.Root>
      <Menu.Trigger className="hover:bg-neutral-wash data-[popup-open]:bg-neutral-wash min-h-control flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors">
        <Avatar hue={ACCOUNT_HUE} name={profile.displayName} size="sm" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="sr-only">Account menu for </span>
          <span className="text-label truncate font-semibold">
            {profile.displayName}
          </span>
          {detail ? (
            <span className="text-brass-ink truncate text-[0.833rem] leading-snug">
              {detail}
            </span>
          ) : null}
        </span>
        <ChevronsUpDownIcon
          aria-hidden="true"
          className="text-muted-foreground size-5 shrink-0"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          align="start"
          className="z-50"
          side="top"
          sideOffset={8}
        >
          <Menu.Popup className="motion-pop border-border bg-raised flex w-[var(--anchor-width)] min-w-[13.333rem] origin-[var(--transform-origin)] flex-col rounded-xl border p-1.5 shadow-[0_1px_2px_rgb(45_33_24/0.05),0_12px_32px_rgb(45_33_24/0.12)] outline-none">
            {family ? null : (
              <>
                <Menu.LinkItem
                  className={ACCOUNT_ITEM}
                  render={<Link href="/settings#demo" />}
                >
                  <FlaskConicalIcon aria-hidden="true" className="size-5" />
                  <span className="flex-1">Practice mode</span>
                  <span className="bg-warning-wash text-warning rounded-full px-2 text-[0.833rem] font-semibold">
                    {profile.demoMode ? "On" : "Off"}
                  </span>
                </Menu.LinkItem>
                <Menu.Separator className="bg-border my-1 h-px" />
              </>
            )}
            <Menu.Item
              className={ACCOUNT_ITEM}
              onClick={() => {
                void signOut();
              }}
            >
              <LogOutIcon aria-hidden="true" className="size-5" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};

const Notices = () => {
  const { me } = usePreferences();
  const { dismissFailure, online, queue } = useOffline();
  const waiting = queue.filter((item) => !item.failure).length;
  const rejected = queue.filter((item) => item.failure);
  const demo = me?.profile?.demoMode === true;

  return (
    <>
      {online ? null : (
        <output className="bg-warning-wash text-warning flex items-center gap-3 px-5 py-3 text-base">
          <WifiOffIcon aria-hidden="true" className="size-5 shrink-0" />
          <span>
            You’re offline. You can keep writing; anything you approve will be
            checked again and sent when you’re back online.
            {waiting > 0 ? ` ${waiting} waiting.` : ""}
          </span>
        </output>
      )}
      {rejected.map((item) => (
        <section
          aria-label="Offline work needs your review"
          className="border-border bg-negative-wash text-negative flex flex-col gap-3 border-b px-5 py-4 text-base"
          key={item.id}
        >
          <p role="alert">
            <strong>
              {item.kind === "approve" ? item.label : "Your offline request"}{" "}
              needs your review.
            </strong>{" "}
            {item.failure} It will not be tried again automatically.
          </p>
          {item.kind === "request" ? (
            <details>
              <summary className="min-h-control cursor-pointer content-center font-semibold">
                Your original request
              </summary>
              <p className="max-w-prose wrap-anywhere whitespace-pre-wrap">
                {item.text}
              </p>
            </details>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="min-h-control inline-flex items-center font-semibold underline"
              href={item.kind === "approve" ? "/" : "/ask"}
            >
              {item.kind === "approve" ? "Review on Today" : "Open Ask"}
            </Link>
            <Button onClick={() => dismissFailure(item.id)} variant="outline">
              Dismiss notice
            </Button>
          </div>
        </section>
      ))}
      {demo ? (
        <div className="border-border bg-parchment text-muted-foreground text-label flex min-h-[4.444rem] flex-wrap items-center justify-between gap-2 border-b px-5 py-2">
          <p>
            <strong className="font-semibold">Practice mode is on.</strong> No
            real messages are sent.
          </p>
          <Link
            className="min-h-control inline-flex items-center font-medium underline"
            href="/settings#demo"
          >
            Turn off practice mode
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
        <DialogPrimitive.Popup className="motion-fade bg-background fixed inset-0 z-50 flex flex-col gap-6 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Menu
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={<Button aria-label="Close menu" variant="ghost" />}
            >
              <XIcon aria-hidden="true" className="size-6" />
              Close
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
  guest = false,
  notices,
  navigation,
}: {
  account: ReactNode;
  children: ReactNode;
  groups: NavGroup[];
  guest?: boolean;
  notices?: ReactNode;
  navigation?: ReactNode;
}) => (
  <div className="bg-background min-h-svh">
    <a
      className="bg-primary text-primary-foreground sr-only z-50 rounded-lg px-5 py-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      href="#main"
    >
      Skip to main content
    </a>
    <div className="min-[1101px]:grid min-[1101px]:grid-cols-[13.333rem_minmax(0,1fr)]">
      <aside
        className={cn(
          "border-border bg-parchment sticky top-0 hidden h-svh flex-col overflow-y-auto border-r min-[1101px]:flex",
          guest ? "px-[1.333rem] py-[1.778rem]" : "gap-6 px-3 pb-5"
        )}
      >
        {guest ? (
          <>
            <div className="min-h-control flex items-center">
              <BrandName />
            </div>
            <GuestPlayInvitation />
          </>
        ) : (
          <>
            {/* Same height as the practice banner, so the logo and its text share one centre line. */}
            <div className="flex h-[4.444rem] shrink-0 items-center">
              <Link
                className="min-h-control hover:bg-neutral-wash flex items-center rounded-md px-4 transition-colors"
                href={groups === FAMILY_NAV ? "/family" : "/"}
              >
                <BrandName />
              </Link>
            </div>
            {navigation ?? <NavList groups={groups} />}
            <div className="border-border mt-auto flex flex-col gap-3 border-t pt-4">
              {account}
            </div>
          </>
        )}
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="border-border bg-parchment sticky top-0 z-40 flex min-h-[3.556rem] flex-wrap items-center justify-between gap-[8px] border-b px-[16px] py-1 min-[1101px]:hidden">
          {guest ? (
            <>
              <BrandName compact />
              <GuestAccountLinks compact />
            </>
          ) : (
            <>
              <Link
                className="min-h-control hover:bg-neutral-wash -mx-2 inline-flex items-center rounded-md px-2 transition-colors"
                href={groups === FAMILY_NAV ? "/family" : "/"}
              >
                <BrandName compact />
              </Link>
              <MobileMenu account={account} groups={groups} />
            </>
          )}
        </div>
        {notices}
        <main
          className="@container/content mx-auto flex w-full max-w-[72rem] flex-col gap-7 px-[1.111rem] py-6 min-[1101px]:py-8 sm:px-[2.222rem]"
          id="main"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  </div>
);

const PLAY_ACCOUNT = (
  <p className="text-muted-foreground text-label px-4">
    Your games are saved on this device and work offline.
  </p>
);

/**
 * One frame for every signed-in screen and the public games, so navigating
 * between them only swaps the page. The cached game HTML is always public:
 * session discovery only changes the chrome and never blocks or remounts the
 * locally saved game, including while offline.
 */
const AppShell = ({ children }: { children: ReactNode }) => {
  const { me } = usePreferences();
  const { data: session } = authClient.useSession();
  const profile = me?.profile ?? null;
  const isOwner = profile?.role === "owner";

  // The task count is owner-only; guests and family members never query it.
  const tasks = useQuery(
    api.tasks.list,
    isOwner ? { include: "active" } : "skip"
  );

  const waiting = tasks?.filter((task) => WAITING.has(task.status)).length ?? 0;

  // Signed in but the profile is still loading or offline: keep the minimal navigation.
  let groups = PLAY_NAV;

  if (profile?.role === "family") {
    groups = FAMILY_NAV;
  } else if (isOwner) {
    groups = ownerNavigation(waiting);
  }

  return (
    <ShellFrame
      account={profile ? <Account /> : PLAY_ACCOUNT}
      groups={groups}
      guest={!(profile || session)}
      notices={profile ? <Notices /> : null}
    >
      {children}
    </ShellFrame>
  );
};

export { AppShell, ShellFrame };

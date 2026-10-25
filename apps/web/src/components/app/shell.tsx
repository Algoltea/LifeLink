"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import {
  ChevronsUpDownIcon,
  FlaskConicalIcon,
  FolderOpenIcon,
  HomeIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MessagesSquareIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingBasketIcon,
  UsersRoundIcon,
  WifiOffIcon,
  XIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType, ReactNode, SVGAttributes } from "react";

import { HIDE_ON_PHONES } from "@/features/mahjong/screen";
import { useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { authClient } from "@/lib/auth-client";

import { Avatar } from "./bits";
import { BrandName } from "./brand";
import {
  GuestAccountLinks,
  GuestPlayInvitation,
} from "./guest-play-navigation";
import {
  AskIcon,
  ConnectionsIcon,
  MahjongIcon,
  SolitaireIcon,
  TrustedCircleIcon,
} from "./nav-icons";
import { useOffline } from "./offline-queue";
import { usePreferences } from "./preferences";

interface NavItem {
  href: Route;
  icon: ComponentType<SVGAttributes<SVGSVGElement>>;
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

type NavKind = "family" | "owner" | "play";

const settingsGroup = (nav: Messages["shell"]["nav"]): NavGroup => ({
  items: [{ href: "/settings", icon: SettingsIcon, label: nav.settings }],
  label: null,
  pinned: true,
});

const navigationFor = (kind: NavKind, t: Messages["shell"]): NavGroup[] => {
  const { nav } = t;

  const games: NavItem[] = [
    { href: "/solitaire", icon: SolitaireIcon, label: nav.solitaire },
    { href: "/mahjong", icon: MahjongIcon, label: nav.mahjong, wideOnly: true },
  ];

  if (kind === "play") {
    return [
      {
        items: games,
        label: null,
      },
      settingsGroup(nav),
    ];
  }

  if (kind === "family") {
    return [
      {
        items: [
          { href: "/family", icon: UsersRoundIcon, label: nav.family },
          ...games,
        ],
        label: null,
      },
      settingsGroup(nav),
    ];
  }

  return [
    {
      items: [
        { href: "/", icon: HomeIcon, label: nav.today },
        { href: "/ask", icon: AskIcon, label: nav.ask },
        { href: "/messages", icon: MessagesSquareIcon, label: nav.messages },
        { href: "/email", icon: MailIcon, label: nav.email },
        { href: "/documents", icon: FolderOpenIcon, label: nav.documents },
      ],
      label: null,
    },
    {
      items: [
        { href: "/scam", icon: ShieldCheckIcon, label: nav.scam },
        { href: "/groceries", icon: ShoppingBasketIcon, label: nav.groceries },
      ],
      label: t.groupHelpWith,
    },
    { items: games, label: t.groupGames },
    {
      items: [
        { href: "/circle", icon: TrustedCircleIcon, label: nav.circle },
        { href: "/connections", icon: ConnectionsIcon, label: nav.connections },
      ],
      label: t.groupSetup,
    },
    settingsGroup(nav),
  ];
};

/** Public games are prefetched for offline play. */
const PUBLIC_GAMES = new Set<string>(["/solitaire", "/mahjong"]);

const isActive = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const NavList = ({
  dense = false,
  groups,
  onNavigate,
}: {
  /**
   * Shorter rows and gaps, so the desktop sidebar fits a laptop screen without
   * scrolling; short windows tighten further, down to 40px rows.
   */
  dense?: boolean;
  groups: NavGroup[];
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();
  const t = useMessages();

  return (
    <nav
      aria-label={t.shell.mainNavigation}
      className={cn(
        "flex flex-1 flex-col",
        dense ? "gap-3 [@media(max-height:920px)]:gap-1.5" : "gap-5"
      )}
    >
      {groups.map((group) => (
        <div
          className={cn(
            "flex flex-col",
            dense ? "gap-0.5" : "gap-1",
            group.pinned && "mt-auto"
          )}
          key={group.label ?? (group.pinned ? "pinned" : "main")}
        >
          {group.label ? (
            <p
              className={cn(
                "text-muted-foreground text-label px-4",
                dense ? "pt-1 [@media(max-height:920px)]:pt-0" : "pb-1"
              )}
            >
              {group.label}
            </p>
          ) : null}
          <ul className={cn("flex flex-col", dense ? "gap-0.5" : "gap-1")}>
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
                      "text-foreground hover:bg-neutral-wash text-label flex items-center gap-3 rounded-md px-4 transition-colors",
                      dense
                        ? "min-h-[2.444rem] [@media(max-height:920px)]:min-h-[2.222rem]"
                        : "min-h-control",
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
  const t = useMessages();
  const profile = me?.profile;

  if (!profile) {
    return null;
  }

  const family = profile.role === "family";
  let detail: string | null = null;

  if (family) {
    detail = t.shell.familyMember;
  } else if (profile.demoMode) {
    detail = t.shell.practiceMode;
  }

  return (
    <Menu.Root>
      <Menu.Trigger className="hover:bg-neutral-wash data-[popup-open]:bg-neutral-wash min-h-control flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors">
        <Avatar hue={ACCOUNT_HUE} name={profile.displayName} size="sm" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="sr-only">{t.shell.accountMenuFor}</span>
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
                  <span className="flex-1">{t.shell.practiceMode}</span>
                  <span className="bg-warning-wash text-warning rounded-full px-2 text-[0.833rem] font-semibold">
                    {profile.demoMode ? t.common.on : t.common.off}
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
              {t.shell.signOut}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};

const Notices = () => {
  const { me } = usePreferences();
  const t = useMessages();
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
            {t.shell.offline}
            {waiting > 0 ? t.shell.offlineWaiting(waiting) : ""}
          </span>
        </output>
      )}
      {rejected.map((item) => (
        <section
          aria-label={t.shell.offlineReview}
          className="border-border bg-negative-wash text-negative flex flex-col gap-3 border-b px-5 py-4 text-base"
          key={item.id}
        >
          <p role="alert">
            <strong>
              {t.shell.needsReview(
                item.kind === "approve"
                  ? item.label
                  : t.shell.yourOfflineRequest
              )}
            </strong>{" "}
            {item.failure} {t.shell.notTriedAgain}
          </p>
          {item.kind === "request" ? (
            <details>
              <summary className="min-h-control cursor-pointer content-center font-semibold">
                {t.shell.originalRequest}
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
              {item.kind === "approve"
                ? t.shell.reviewOnToday
                : t.shell.openAsk}
            </Link>
            <Button onClick={() => dismissFailure(item.id)} variant="outline">
              {t.shell.dismissNotice}
            </Button>
          </div>
        </section>
      ))}
      {demo ? (
        <div className="border-border bg-parchment text-muted-foreground text-label flex min-h-[4.444rem] flex-wrap items-center justify-between gap-2 border-b px-5 py-2">
          <p>
            <strong className="font-semibold">
              {t.shell.practiceBannerOn}
            </strong>{" "}
            {t.shell.practiceBannerRest}
          </p>
          <Link
            className="min-h-control inline-flex items-center font-medium underline"
            href="/settings#demo"
          >
            {t.shell.turnOffPractice}
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
  const t = useMessages();

  return (
    <DialogPrimitive.Root onOpenChange={setOpen} open={open}>
      <DialogPrimitive.Trigger
        render={
          <Button
            aria-label={t.shell.openMenu}
            className="gap-[8px] px-[6px] text-[0.889rem] leading-normal"
            variant="ghost"
          />
        }
      >
        <MenuIcon aria-hidden="true" className="size-[20px]" />
        {t.shell.menu}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup className="motion-fade bg-background fixed inset-0 z-50 flex flex-col gap-6 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-semibold">
              {t.shell.menu}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={<Button aria-label={t.shell.closeMenu} variant="ghost" />}
            >
              <XIcon aria-hidden="true" className="size-6" />
              {t.common.close}
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
  homeHref = "/",
  notices,
  navigation,
}: {
  account: ReactNode;
  children: ReactNode;
  groups: NavGroup[];
  guest?: boolean;
  homeHref?: Route;
  notices?: ReactNode;
  navigation?: ReactNode;
}) => {
  const t = useMessages();

  return (
    <div className="bg-background min-h-svh">
      <a
        className="bg-primary text-primary-foreground sr-only z-50 rounded-lg px-5 py-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        href="#main"
      >
        {t.shell.skipToMain}
      </a>
      <div className="min-[1101px]:grid min-[1101px]:grid-cols-[13.333rem_minmax(0,1fr)]">
        <aside
          className={cn(
            "border-border bg-parchment sticky top-0 hidden h-svh flex-col overflow-y-auto border-r min-[1101px]:flex",
            guest
              ? "px-[1.333rem] py-[1.778rem]"
              : "gap-3 px-3 pb-3 [@media(max-height:920px)]:gap-2 [@media(max-height:920px)]:pb-2"
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
                  href={homeHref}
                >
                  <BrandName />
                </Link>
              </div>
              {navigation ?? <NavList dense groups={groups} />}
              <div className="border-border mt-auto flex flex-col gap-3 border-t pt-3 [@media(max-height:920px)]:pt-2">
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
                  href={homeHref}
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
};

const PlayAccount = () => {
  const t = useMessages();

  return (
    <p className="text-muted-foreground text-label px-4">
      {t.shell.playAccount}
    </p>
  );
};

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
  const t = useMessages();

  // Signed in but the profile is still loading or offline: keep the minimal navigation.
  let kind: NavKind = "play";

  if (profile?.role === "family") {
    kind = "family";
  } else if (profile?.role === "owner") {
    kind = "owner";
  }

  return (
    <ShellFrame
      account={profile ? <Account /> : <PlayAccount />}
      groups={navigationFor(kind, t.shell)}
      homeHref={kind === "family" ? "/family" : "/"}
      guest={!(profile || session)}
      notices={profile ? <Notices /> : null}
    >
      {children}
    </ShellFrame>
  );
};

export { AppShell, ShellFrame };

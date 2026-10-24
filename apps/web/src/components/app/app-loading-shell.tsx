"use client";

import { Skeleton } from "@lifelink/ui/components/skeleton";
import { useSearchParams } from "next/navigation";

import { ChatLoadingWorkspace } from "@/components/assistant/chat-loading-workspace";

import {
  CircleLoadingContent,
  CircleLoadingHeader,
} from "./circle-loading-layouts";
import { EmailLoadingHeader } from "./email-loading-layouts";
import { MessagesLoadingHeader } from "./messages-loading-layouts";
import { PageHeader } from "./page-header";
import { ShellFrame } from "./shell";
import { LoadingRows } from "./states";
import { TodayLoadingHeader } from "./today-loading-layouts";

const LoadingNavigationRow = () => (
  <div className="min-h-control flex items-center gap-3 px-4">
    <Skeleton className="size-5 shrink-0" />
    <Skeleton className="h-4 min-w-0 flex-1" />
  </div>
);

const LoadingNavigation = () => (
  <div className="flex flex-1 flex-col gap-5" data-loading-part="navigation">
    {[5, 3, 2].map((rows, group) => (
      <div className="flex flex-col gap-1" key={group}>
        {group > 0 ? (
          <div className="flex h-[1.583rem] items-center px-4 pb-1">
            <Skeleton className="h-3.5 w-24" />
          </div>
        ) : null}
        {Array.from({ length: rows }, (_unused, index) => (
          <LoadingNavigationRow key={index} />
        ))}
      </div>
    ))}
    <div
      className="mt-auto flex flex-col gap-1"
      data-loading-part="pinned-settings"
    >
      <LoadingNavigationRow />
    </div>
  </div>
);

const LoadingAccount = () => (
  <div
    className="min-h-control flex w-full items-center gap-3 rounded-md px-3 py-2"
    data-loading-part="account"
  >
    <Skeleton className="size-9 shrink-0 rounded-full" />
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-[1.333rem] items-center">
        <Skeleton className="h-3.5 w-full" />
      </div>
      <div className="flex h-[1.146rem] items-center">
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
    <Skeleton className="size-5 shrink-0" />
  </div>
);

/** Public route names only. No account facts are available during bootstrap. */
const LoadingPage = ({
  pathname,
  emailSelected,
}: {
  pathname: string;
  emailSelected: boolean;
}) => {
  if (pathname.startsWith("/tasks/")) {
    return <LoadingRows label="Loading task details" layout="task" />;
  }

  if (pathname.startsWith("/messages/")) {
    return <LoadingRows label="Loading conversation" layout="thread" />;
  }

  switch (pathname) {
    case "/": {
      return (
        <>
          <TodayLoadingHeader />
          <LoadingRows label="Loading today" layout="today" />
        </>
      );
    }

    case "/ask": {
      return <ChatLoadingWorkspace />;
    }

    case "/messages": {
      return (
        <>
          <MessagesLoadingHeader />
          <LoadingRows label="Loading conversations" layout="messages" />
        </>
      );
    }

    case "/email": {
      return (
        <>
          <EmailLoadingHeader />
          <LoadingRows
            label="Loading emails"
            layout={emailSelected ? "email-selected" : "email"}
          />
        </>
      );
    }

    case "/documents": {
      return (
        <>
          <PageHeader title="Documents" />
          <LoadingRows
            label="Loading your Drive files"
            layout="documents-page"
            rows={6}
          />
        </>
      );
    }

    case "/connections": {
      return (
        <>
          <PageHeader
            subline="Connect the services you already use. Open one to see what LifeLink can do with it."
            title="Connections"
          />
          <LoadingRows label="Loading connections" layout="connections" />
        </>
      );
    }

    case "/settings": {
      return (
        <>
          <PageHeader
            subline="Make LifeLink comfortable to read and listen to."
            title="Settings"
          />
          <LoadingRows label="Loading settings" layout="settings" />
        </>
      );
    }

    case "/groceries": {
      return (
        <>
          <PageHeader
            subline="Keep a grocery list, plan your budget, and copy or print what you need."
            title="Groceries"
          />
          <LoadingRows label="Loading your lists" layout="groceries" />
        </>
      );
    }

    case "/circle": {
      return (
        <>
          <CircleLoadingHeader />
          <div aria-busy="true" aria-label="Loading your trusted circle">
            <div aria-hidden="true">
              <CircleLoadingContent />
            </div>
            <output className="sr-only">Loading your trusted circle</output>
          </div>
        </>
      );
    }

    case "/scam": {
      return (
        <>
          <PageHeader
            subline="Email is checked automatically with local rules. Use this page to review a result or check another message before you act."
            title="Scam check"
          />
          <LoadingRows label="Loading your checks" layout="check-form" />
        </>
      );
    }

    case "/family": {
      return (
        <>
          <PageHeader
            subline="See only what each person chooses to share. You can look, but never send, approve, or spend anything for them."
            title="Family"
          />
          <LoadingRows label="Loading shared information" layout="note" />
        </>
      );
    }

    default: {
      return (
        <>
          <PageHeader title="LifeLink" />
          <LoadingRows label="Loading your page" layout="text" />
        </>
      );
    }
  }
};

/** Keep the real shell's breakpoints, gutters, and content width on hard refresh.
 * All apparent controls are inert until authentication and the profile resolve.
 */
const AppLoadingShell = ({ pathname }: { pathname: string }) => {
  const emailSelected = Boolean(useSearchParams().get("id"));

  return (
    <div aria-busy="true" aria-label="Loading LifeLink" data-loading-shell="">
      <output className="sr-only">Loading LifeLink</output>
      <div aria-hidden="true" inert>
        <ShellFrame
          account={<LoadingAccount />}
          groups={[]}
          navigation={<LoadingNavigation />}
        >
          <LoadingPage emailSelected={emailSelected} pathname={pathname} />
        </ShellFrame>
      </div>
    </div>
  );
};

export { AppLoadingShell };

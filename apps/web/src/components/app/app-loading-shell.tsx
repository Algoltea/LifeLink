"use client";

import { Skeleton } from "@lifelink/ui/components/skeleton";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ChatLoadingWorkspace } from "@/components/assistant/chat-loading-workspace";
import { useMessages } from "@/i18n/locale";

import {
  CircleLoadingContent,
  CircleLoadingHeader,
} from "./circle-loading-layouts";
import { EmailLoadingHeader } from "./email-loading-layouts";
import { MessagesLoadingFrame } from "./messages-loading-layouts";
import { PageHeader } from "./page-header";
import { ShellFrame } from "./shell";
import { LoadingRows } from "./states";

const LoadingNavigationRow = () => (
  <div className="min-h-control flex items-center gap-3 px-4">
    <Skeleton className="size-5 shrink-0" />
    <Skeleton className="h-4 min-w-0 flex-1" />
  </div>
);

const LoadingNavigation = () => (
  <div className="flex flex-1 flex-col gap-5" data-loading-part="navigation">
    {[5, 2, 2, 2].map((rows, group) => (
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

const EmailLoadingRows = () => {
  const { appExtras } = useMessages();

  return (
    <LoadingRows
      label={appExtras.loading.emails}
      layout={useSearchParams().get("id") ? "email-selected" : "email"}
    />
  );
};

/** Public route names only. No account facts are available during bootstrap. */
const LoadingPage = ({ pathname }: { pathname: string }) => {
  const { appExtras } = useMessages();

  if (pathname.startsWith("/tasks/")) {
    return <LoadingRows label={appExtras.loading.task} layout="task" />;
  }

  if (pathname.startsWith("/messages/")) {
    return <MessagesLoadingFrame open />;
  }

  switch (pathname) {
    case "/": {
      return <LoadingRows label={appExtras.loading.today} layout="today" />;
    }

    case "/ask": {
      return <ChatLoadingWorkspace />;
    }

    case "/messages": {
      return <MessagesLoadingFrame open={false} />;
    }

    case "/email": {
      return (
        <>
          <EmailLoadingHeader />
          {/* Reading the query string needs a boundary: the shared layout can render ahead of time. */}
          <Suspense
            fallback={
              <LoadingRows label={appExtras.loading.emails} layout="email" />
            }
          >
            <EmailLoadingRows />
          </Suspense>
        </>
      );
    }

    case "/documents": {
      return (
        <>
          <PageHeader title={appExtras.loading.documentsTitle} />
          <LoadingRows
            label={appExtras.loading.drive}
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
            subline={appExtras.loading.connectionsBody}
            title={appExtras.loading.connectionsTitle}
          />
          <LoadingRows
            label={appExtras.loading.connections}
            layout="connections"
          />
        </>
      );
    }

    case "/settings": {
      return (
        <>
          <PageHeader
            subline={appExtras.loading.settingsBody}
            title={appExtras.loading.settingsTitle}
          />
          <LoadingRows label={appExtras.loading.settings} layout="settings" />
        </>
      );
    }

    case "/groceries": {
      return (
        <>
          <PageHeader
            subline={appExtras.loading.groceriesBody}
            title={appExtras.loading.groceriesTitle}
          />
          <LoadingRows label={appExtras.loading.lists} layout="groceries" />
        </>
      );
    }

    case "/circle": {
      return (
        <>
          <CircleLoadingHeader />
          <div aria-busy="true" aria-label={appExtras.loading.circle}>
            <div aria-hidden="true">
              <CircleLoadingContent />
            </div>
            <output className="sr-only">{appExtras.loading.circle}</output>
          </div>
        </>
      );
    }

    case "/scam": {
      return (
        <>
          <PageHeader
            subline={appExtras.loading.scamBody}
            title={appExtras.loading.scamTitle}
          />
          <LoadingRows label={appExtras.loading.checks} layout="scam-page" />
        </>
      );
    }

    case "/family": {
      return (
        <>
          <PageHeader
            subline={appExtras.loading.familyBody}
            title={appExtras.loading.familyTitle}
          />
          <LoadingRows label={appExtras.loading.shared} layout="note" />
        </>
      );
    }

    default: {
      return (
        <>
          <PageHeader title="LifeLink" />
          <LoadingRows label={appExtras.loading.page} layout="text" />
        </>
      );
    }
  }
};

/** Keep the real shell's breakpoints, gutters, and content width on hard refresh.
 * All apparent controls are inert until authentication and the profile resolve.
 */
const AppLoadingShell = ({ pathname }: { pathname: string }) => {
  const { appExtras } = useMessages();

  return (
    <div
      aria-busy="true"
      aria-label={appExtras.loading.app}
      data-loading-shell=""
    >
      <output className="sr-only">{appExtras.loading.app}</output>
      <div aria-hidden="true" inert>
        <ShellFrame
          account={<LoadingAccount />}
          groups={[]}
          navigation={<LoadingNavigation />}
        >
          <LoadingPage pathname={pathname} />
        </ShellFrame>
      </div>
    </div>
  );
};

export { AppLoadingShell };

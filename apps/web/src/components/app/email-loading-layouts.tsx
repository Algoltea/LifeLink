import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";

import { InboxSkeleton, ReaderSkeleton } from "@/components/email/email-bits";

import { PageHeader } from "./page-header";

const EmailLoadingHeader = () => (
  <PageHeader
    actions={<Skeleton className="h-control w-[11.871rem]" />}
    className="items-center"
    title="Email"
  />
);

const EmailLoadingNotice = () => (
  <div
    className="bg-parchment flex flex-col gap-2 rounded-xl py-2 pr-2 pl-5"
    data-loading-part="mailbox-notice"
  >
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="min-h-control flex min-w-0 flex-1 basis-80 items-center gap-3">
        <Skeleton className="size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex h-[1.556rem] items-center">
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex h-[1.556rem] items-center @3xl/content:hidden">
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex h-[1.556rem] items-center sm:hidden">
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
      <Skeleton className="text-label min-h-control inline-flex items-center rounded-md border border-transparent px-4 py-2 font-semibold">
        <span className="invisible">Connect Gmail or Outlook</span>
      </Skeleton>
    </div>
  </div>
);

/** Share the redesigned page's row and reader placeholders instead of approximating them. */
const EmailLoadingPanes = ({ selected = false }: { selected?: boolean }) => (
  <div className="flex flex-col gap-7">
    <EmailLoadingNotice />
    <div
      className="grid items-start gap-6 @3xl/content:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/content:gap-0"
      data-loading-part="email-panes"
    >
      <div
        className={cn(
          "@3xl/content:border-rule min-w-0 flex-col @3xl/content:flex @3xl/content:self-stretch @3xl/content:border-r @3xl/content:pr-4",
          selected ? "hidden" : "flex"
        )}
        data-loading-part="email-inbox"
      >
        <div className="flex items-baseline justify-between gap-3 px-3 pb-3">
          <h2 className="text-section font-semibold">Inbox</h2>
        </div>
        <InboxSkeleton label="Loading emails" rows={4} />
      </div>
      {selected ? (
        <div
          className="flex min-w-0 flex-col gap-2 @3xl/content:pl-10 [&_div]:min-w-0"
          data-loading-part="email-reader"
        >
          <Skeleton className="h-control -ml-2 w-36 @3xl/content:hidden" />
          <ReaderSkeleton label="Loading email" />
        </div>
      ) : (
        <div
          className="border-border bg-parchment hidden items-center rounded-lg border px-5 py-4 @3xl/content:mt-12 @3xl/content:ml-10 @3xl/content:flex"
          data-loading-part="email-empty-reader"
        >
          <div className="flex h-[1.556rem] w-full items-center">
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      )}
    </div>
  </div>
);

export { EmailLoadingHeader, EmailLoadingPanes };

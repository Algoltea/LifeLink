import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";

import { LoadingButton } from "./loading-button";
import { MessagesLoadingRows } from "./messages-loading-layouts";

const TodayLine = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex h-[1.556rem] items-center", className)}>
    <Skeleton className="h-4 w-full" />
  </div>
);

/** Also replaces the legacy PageHeader title while its briefing slot is loading. */
const TodayLoadingHeader = () => (
  <div
    className="flex flex-col gap-4 [header:has(&)>div>h1]:hidden"
    data-loading-part="today-header"
  >
    <div className="flex max-w-3xl min-w-0 flex-col gap-1">
      <TodayLine className="h-[1.333rem] w-52" />
      <TodayLine className="h-[2.222rem] w-4/5 sm:h-[2.778rem]" />
      <div className="max-w-prose pt-1">
        <TodayLine />
        <TodayLine className="w-5/6" />
        <TodayLine className="w-2/3 sm:hidden" />
      </div>
    </div>
    <LoadingButton className="self-start" icon>
      Read my day aloud
    </LoadingButton>
  </div>
);

const PANEL = "flex min-w-0 flex-col gap-2";

const PanelHeading = () => <TodayLine className="h-[1.778rem] w-2/5" />;

const PartHeading = () => (
  <TodayLine className="min-h-control mx-3 h-auto w-1/3" />
);

/** Your week and Messages, stacked like the real groups. */
const TodayLoadingPanels = () => (
  <div className="flex flex-col gap-10" data-loading-part="today-panels">
    <div className={PANEL}>
      <PanelHeading />
      <div className="flex items-center gap-3.5 px-3 py-3.5">
        <div className="w-20 shrink-0">
          <TodayLine className="h-[1.333rem] w-3/4" />
          <TodayLine />
        </div>
        <div className="min-w-0 flex-1">
          <TodayLine />
          <TodayLine className="h-[1.333rem] w-3/4" />
        </div>
      </div>
    </div>
    <div className={PANEL}>
      <PanelHeading />
      <div>
        <PartHeading />
        <MessagesLoadingRows rows={1} />
      </div>
      <div className="border-rule mt-2 border-t pt-2">
        <PartHeading />
        <div className="px-3 py-3.5">
          <TodayLine className="w-3/5" />
          <TodayLine className="h-[1.333rem]" />
        </div>
      </div>
    </div>
  </div>
);

/** The flat news list: heading, the Good/Top switch, and ruled rows. */
const TodayLoadingNews = () => (
  <div className="flex flex-col gap-2" data-loading-part="today-news">
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <TodayLine className="h-[1.778rem] w-16" />
      {/* The switch: a control-high option row inside a 1-unit inset and a hairline border. */}
      <Skeleton className="h-control box-content w-[12.5rem] max-w-full rounded-lg border border-transparent p-1" />
    </div>
    <div>
      {[0, 1, 2].map((key) => (
        <div className="border-rule border-t py-1 first:border-t-0" key={key}>
          <div className="flex min-h-14 items-center px-3 py-3">
            <TodayLine className="flex-1" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export { TodayLoadingHeader, TodayLoadingNews, TodayLoadingPanels };

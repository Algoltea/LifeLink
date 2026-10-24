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

const TodayLoadingSideLists = () => (
  <div
    className="flex min-w-0 flex-col gap-8"
    data-loading-part="today-side-lists"
  >
    <div>
      <TodayLine className="mx-3 h-[2.528rem] w-3/5 pb-3" />
      <div className="flex items-center gap-3.5 rounded-xl px-3 py-3.5">
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
    <div>
      <TodayLine className="mx-3 h-[2.528rem] w-3/5 pb-3" />
      <MessagesLoadingRows rows={1} />
    </div>
  </div>
);

export { TodayLoadingHeader, TodayLoadingSideLists };

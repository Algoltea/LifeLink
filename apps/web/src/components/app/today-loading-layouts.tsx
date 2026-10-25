"use client";

import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";

import { useMessages } from "@/i18n/locale";

import { LoadingButton } from "./loading-button";
import { MessagesLoadingRows } from "./messages-loading-layouts";

const TodayLine = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex h-[1.556rem] items-center", className)}>
    <Skeleton className="h-4 w-full" />
  </div>
);

/** Also replaces the legacy PageHeader title while its briefing slot is loading. */
const TodayLoadingHeader = () => {
  const { appExtras } = useMessages();

  return (
    <div
      className="flex shrink-0 flex-wrap items-end justify-between gap-x-6 gap-y-3 [header:has(&)>div>h1]:hidden"
      data-loading-part="today-header"
    >
      <div className="flex max-w-3xl min-w-0 flex-1 flex-col gap-1">
        {/* The date row is as tall as the weather chip. */}
        <TodayLine className="min-h-control w-52" />
        <TodayLine className="h-[2.222rem] w-4/5" />
        <div className="max-w-prose pt-1">
          <TodayLine />
          <TodayLine className="w-2/3 sm:hidden" />
        </div>
      </div>
      <LoadingButton icon>{appExtras.loading.readDay}</LoadingButton>
    </div>
  );
};

const PANEL = "flex min-w-0 flex-col gap-2";

const PanelHeading = () => <TodayLine className="h-[1.778rem] w-2/5" />;

/** A heading beside its "All …" link, as tall as that link. */
const LinkedHeading = () => (
  <div className="min-h-control flex items-center justify-between gap-4">
    <TodayLine className="w-2/5" />
    <TodayLine className="w-1/4" />
  </div>
);

const EmailRow = () => (
  <div className="py-2.5">
    <TodayLine className="w-3/5" />
    <TodayLine className="h-[1.333rem]" />
  </div>
);

/** The flat news list: heading, the Good/Top switch, and ruled two-line rows. */
const TodayLoadingNews = () => (
  <div
    className="flex min-w-0 flex-col gap-2 @min-[36rem]/content:col-span-2 @min-[52rem]/content:col-span-1"
    data-loading-part="today-news"
  >
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <TodayLine className="h-[1.778rem] w-16" />
      <div className="min-h-control flex items-center gap-4">
        <TodayLine className="h-[1.333rem] w-20" />
        <TodayLine className="h-[1.333rem] w-16" />
      </div>
    </div>
    <div className="min-h-[11rem]">
      {[0, 1, 2].map((key) => (
        <div className="border-rule border-t py-1 first:border-t-0" key={key}>
          <TodayLine />
          <TodayLine />
          <TodayLine className="h-[1.333rem] w-2/5" />
        </div>
      ))}
    </div>
  </div>
);

/** Your week and Messages, Latest email, then News: three columns on a wide screen like the real groups. */
const TodayLoadingPanels = () => (
  <div
    className="grid shrink-0 items-start gap-x-6 gap-y-6 @min-[36rem]/content:grid-cols-2 @min-[52rem]/content:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]"
    data-loading-part="today-panels"
  >
    <div className="flex min-w-0 flex-col gap-5">
      <div className={PANEL}>
        <PanelHeading />
        <div className="flex items-center gap-3.5 py-2.5">
          <div className="w-20 shrink-0">
            <TodayLine className="h-[1.333rem] w-3/4" />
            <TodayLine />
          </div>
          <div className="min-w-0 flex-1">
            <TodayLine />
            <TodayLine className="h-[1.333rem] w-3/4" />
            <TodayLine className="h-[1.333rem] w-1/2" />
          </div>
        </div>
      </div>
      <div className={PANEL}>
        <LinkedHeading />
        <MessagesLoadingRows rows={1} />
      </div>
    </div>
    <div className={PANEL}>
      <LinkedHeading />
      <div className="flex flex-col gap-1">
        <EmailRow />
        <EmailRow />
      </div>
    </div>
    <TodayLoadingNews />
  </div>
);

export { TodayLoadingHeader, TodayLoadingPanels };

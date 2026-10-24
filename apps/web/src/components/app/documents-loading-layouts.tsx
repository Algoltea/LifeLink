"use client";

import { Skeleton } from "@lifelink/ui/components/skeleton";

import { useMessages } from "@/i18n/locale";

import { IsoIcon } from "./iso-icon";

const DocumentsLoadingNotice = () => {
  const { appExtras } = useMessages();

  return (
    <div
      className="bg-parchment flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl py-2 pr-2 pl-5"
      data-loading-part="drive-notice"
    >
      <div className="min-h-control flex min-w-0 flex-1 basis-80 items-center gap-3">
        <Skeleton className="size-5 shrink-0" />
        <div className="relative min-w-0 flex-1">
          <span className="invisible block">
            {appExtras.loading.driveNotice}
          </span>
          <Skeleton className="absolute inset-x-0 top-1 h-4" />
          <Skeleton className="absolute bottom-1 left-0 h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
};

/** File rows retain their two fixed line boxes at every viewport width. */
const DocumentsLoadingRows = ({ rows }: { rows: number }) => (
  <div className="flex flex-col gap-1 pb-1" data-loading-part="drive-rows">
    {Array.from({ length: rows }, (_unused, index) => (
      <div
        className="flex items-center gap-3.5 rounded-lg px-3 py-3"
        key={index}
      >
        <Skeleton className="size-[40px] shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex h-[1.556rem] items-center justify-between gap-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="flex h-[1.333rem] items-center">
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DocumentsLoadingPanes = ({ rows }: { rows: number }) => {
  const { appExtras } = useMessages();

  return (
    <div
      className="grid items-start gap-6 @3xl/content:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/content:gap-0"
      data-loading-part="drive-panes"
    >
      <div
        className="@3xl/content:border-rule flex min-w-0 flex-col @3xl/content:self-stretch @3xl/content:border-r @3xl/content:pr-4"
        data-loading-part="drive-list"
      >
        <h2 className="text-section px-3 pb-3 font-semibold">
          {appExtras.loading.yourFiles}
        </h2>
        <DocumentsLoadingRows rows={rows} />
        <div className="px-3 pt-3">
          <div className="flex h-[1.333rem] items-center">
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
      </div>
      <div
        className="text-muted-foreground hidden flex-col items-center gap-4 pt-16 pl-10 text-center @3xl/content:flex"
        data-loading-part="drive-empty-preview"
      >
        <IsoIcon kind="file" size={72} />
        <p className="max-w-xs">{appExtras.loading.chooseFile}</p>
      </div>
    </div>
  );
};

const DocumentsLoadingToolbar = () => (
  <div
    className="flex flex-wrap items-center gap-3"
    data-loading-part="drive-toolbar"
  >
    <Skeleton className="h-control min-w-0 flex-1 basis-64" />
    <Skeleton className="h-control w-[15.444rem] shrink-0" />
  </div>
);

/** Bootstrap includes the toolbar; the in-page `documents` layout starts below it. */
const DocumentsLoadingContent = ({ rows }: { rows: number }) => (
  <div className="flex flex-col gap-7">
    <DocumentsLoadingNotice />
    <div className="flex flex-col gap-5">
      <DocumentsLoadingToolbar />
      <DocumentsLoadingPanes rows={rows} />
    </div>
  </div>
);

export {
  DocumentsLoadingContent,
  DocumentsLoadingNotice,
  DocumentsLoadingPanes,
  DocumentsLoadingRows,
};

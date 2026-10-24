import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";

import { LoadingButton } from "./loading-button";
import { PageHeader } from "./page-header";

const CircleLine = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex h-[1.556rem] max-w-full items-center", className)}>
    <Skeleton className="h-4 w-full" />
  </div>
);

const CircleLoadingHeader = () => (
  <PageHeader
    actions={
      <LoadingButton icon size="lg">
        Add a person
      </LoadingButton>
    }
    subline="The people you trust, how to reach them, and exactly what each one can see."
    title="Trusted circle"
  />
);

const CircleLoadingRows = ({ rows }: { rows: number }) => (
  <div className="flex min-w-0 flex-col gap-4" data-loading-part="circle-rows">
    <div className="bg-parchment flex items-start gap-3 rounded-xl px-5 py-3">
      <Skeleton className="mt-1 size-5 shrink-0" />
      <div className="relative">
        <p className="invisible">
          These are sample people, so you can practice safely.
        </p>
        <Skeleton className="absolute inset-x-0 top-1 h-4" />
        <Skeleton className="absolute inset-x-0 bottom-1 h-4" />
      </div>
    </div>
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }, (_unused, index) => (
        <div
          className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-xl px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          key={index}
        >
          <Skeleton className="size-12 self-start rounded-full sm:self-center" />
          <div className="min-w-0">
            <CircleLine className="w-4/5" />
            <CircleLine className="h-[1.333rem]" />
          </div>
          <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-3 sm:row-start-1">
            <LoadingButton className="text-[0.889rem]" icon>
              Message
            </LoadingButton>
            <LoadingButton icon variant="ghost">
              Edit
            </LoadingButton>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SharingLoadingBody = () => (
  <div className="relative">
    <p className="invisible">You aren’t sharing anything with anyone.</p>
    <Skeleton className="absolute inset-x-0 top-1 h-4" />
    <Skeleton className="absolute inset-x-0 bottom-1 h-4" />
  </div>
);

const CircleLoadingContent = () => (
  <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,20.5rem)]">
    <div className="flex max-w-3xl min-w-0 flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <CircleLine className="h-[1.778rem] w-28" />
        <CircleLine className="h-[1.333rem] w-20" />
      </div>
      <CircleLoadingRows rows={3} />
    </div>
    <div className="bg-parchment flex min-w-0 flex-col gap-4 rounded-xl p-5 sm:p-6">
      <CircleLine className="h-[1.778rem] w-32" />
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 size-6 shrink-0" />
        <div className="relative">
          <p className="invisible">
            <strong className="font-semibold">Family can only look.</strong>{" "}
            They can never send, approve, or spend anything for you.
          </p>
          <Skeleton className="absolute inset-x-0 top-1 h-4" />
          <Skeleton className="absolute inset-x-0 bottom-1 h-4" />
        </div>
      </div>
      <div className="border-rule flex flex-col gap-4 border-t pt-4">
        <SharingLoadingBody />
        <LoadingButton className="self-start" icon size="default">
          Share with someone
        </LoadingButton>
      </div>
    </div>
  </div>
);

export {
  CircleLoadingContent,
  CircleLoadingHeader,
  CircleLoadingRows,
  SharingLoadingBody,
};

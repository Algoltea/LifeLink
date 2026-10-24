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
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }, (_unused, index) => (
        <div
          className="border-rule grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b pb-5 last:border-b-0 @4xl/content:grid-cols-[auto_minmax(0,1fr)_auto]"
          key={index}
        >
          <Skeleton className="size-12 self-start rounded-full sm:self-center" />
          <div className="min-w-0">
            <CircleLine className="w-4/5" />
            <CircleLine className="h-[1.333rem]" />
            <CircleLine className="mt-2 w-3/4" />
          </div>
          <div className="col-span-2 flex flex-wrap items-center gap-2 @4xl/content:col-span-1 @4xl/content:col-start-3 @4xl/content:row-start-1">
            <LoadingButton className="text-[0.889rem]" icon>
              Message
            </LoadingButton>
            <LoadingButton icon variant="outline">
              Permissions
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
  <div className="flex min-w-0 flex-col gap-4">
    <div className="flex items-baseline justify-between gap-3">
      <CircleLine className="h-[1.778rem] w-28" />
      <CircleLine className="h-[1.333rem] w-20" />
    </div>
    <CircleLoadingRows rows={3} />
  </div>
);

export {
  CircleLoadingContent,
  CircleLoadingHeader,
  CircleLoadingRows,
  SharingLoadingBody,
};

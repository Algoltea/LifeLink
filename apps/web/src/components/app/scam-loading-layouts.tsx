import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";

import { LoadingButton } from "./loading-button";

const ScamLine = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex h-[1.556rem] max-w-full min-w-0 items-center",
      className
    )}
  >
    <Skeleton className="h-4 w-full" />
  </div>
);

/** The message column stays unboxed; only the photo drop target has an outline. */
const ScamMessageLoading = () => (
  <div className="flex min-w-0 flex-col gap-5" data-loading-part="scam-message">
    <div className="flex flex-col gap-1">
      <h2 className="text-section font-semibold">Check a message</h2>
      <p className="text-muted-foreground text-label">
        A letter, a text, a screenshot or an email. Choose the easiest way to
        show it.
      </p>
    </div>
    <div className="flex flex-wrap gap-2" data-loading-part="scam-sources">
      {["Text", "Photo", "Email"].map((label) => (
        <LoadingButton
          className="text-label min-h-control flex-1 basis-24 px-3"
          icon
          key={label}
        >
          {label}
        </LoadingButton>
      ))}
    </div>
    <div
      className="border-control bg-parchment flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-5"
      data-loading-part="scam-photo-drop"
    >
      <Skeleton className="size-7" />
      <ScamLine className="w-5/6" />
      <ScamLine className="w-2/5" />
      <LoadingButton className="text-label" icon>
        Choose a photo
      </LoadingButton>
    </div>
    <div className="min-w-0">
      <ScamLine />
      <ScamLine className="w-4/5" />
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <LoadingButton className="text-label" icon>
        Check this photo
      </LoadingButton>
    </div>
  </div>
);

const ScamCallLoading = () => (
  <div className="flex min-w-0 flex-col gap-5" data-loading-part="scam-call">
    <div className="flex flex-col gap-1">
      <h2 className="text-section font-semibold">Listen to a call</h2>
      <ScamLine />
      <ScamLine />
      <ScamLine className="w-3/4" />
    </div>
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((step) => (
        <div className="flex items-start gap-3" key={step}>
          <Skeleton className="mt-1 size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <ScamLine />
            {step === 1 ? <ScamLine className="w-1/2" /> : null}
          </div>
        </div>
      ))}
    </div>
    <div className="flex flex-col items-start gap-3">
      <LoadingButton className="text-body" icon>
        Start listening
      </LoadingButton>
      <LoadingButton className="text-body" icon>
        Try a practice call
      </LoadingButton>
    </div>
    <div className="flex items-start gap-3">
      <Skeleton className="mt-1 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <ScamLine />
        <ScamLine />
        <ScamLine className="w-3/4" />
      </div>
    </div>
  </div>
);

const ScamChecksLoading = ({ rows = 3 }: { rows?: number }) => (
  <div className="flex min-w-0 flex-col" data-loading-part="scam-checks">
    {Array.from({ length: rows }, (_unused, index) => (
      <div
        className="border-rule grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
        key={index}
      >
        <Skeleton className="size-6" />
        <div className="min-w-0">
          <ScamLine className="w-4/5" />
          <ScamLine className="w-full" />
        </div>
        <Skeleton className="col-start-2 h-6 w-28 sm:col-start-auto" />
        <LoadingButton
          className="text-body col-start-2 justify-self-start sm:col-start-auto"
          icon
        >
          Review
        </LoadingButton>
      </div>
    ))}
  </div>
);

/** Body-only layout; PageHeader and the accessible loading announcement belong to the caller. */
const ScamPageLoading = () => (
  <div className="flex min-w-0 flex-col gap-8" data-loading-part="scam-page">
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] xl:gap-10">
      <ScamMessageLoading />
      <ScamCallLoading />
    </div>
    <div className="flex min-w-0 flex-col pt-3">
      <div className="border-rule flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
        <h2 className="text-section font-semibold">Earlier checks</h2>
        <ScamLine className="w-20" />
      </div>
      <ScamChecksLoading />
    </div>
  </div>
);

const ScamTrustedPeopleLoading = () => (
  <div
    className="flex min-w-0 flex-col"
    data-loading-part="scam-trusted-people"
  >
    {[0, 1].map((row) => (
      <div
        className="border-rule grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 border-b py-5 last:border-b-0"
        key={row}
      >
        <Skeleton className="size-[3.111rem] rounded-full" />
        <div className="min-w-0">
          <ScamLine className="w-4/5" />
          <ScamLine />
        </div>
        <div className="col-span-2 flex flex-wrap gap-3 sm:col-span-1 sm:col-start-2">
          <LoadingButton className="text-body flex-1" icon>
            Call
          </LoadingButton>
          <LoadingButton className="text-body flex-1" icon>
            Message
          </LoadingButton>
        </div>
      </div>
    ))}
  </div>
);

export {
  ScamChecksLoading,
  ScamMessageLoading,
  ScamPageLoading,
  ScamTrustedPeopleLoading,
};

"use client";

import { useState } from "react";

import { useMessages } from "@/i18n/locale";

const PERFORATION_DOTS = Array.from(
  { length: 24 },
  (_, index) => `dot-${index}`
);

/** The hero's one live thing: approving the exact version changes what happened. */
const MessageSlip = () => {
  const [approved, setApproved] = useState(false);
  const t = useMessages().landing.messageSlip;

  return (
    <div
      className="bg-raised text-foreground flex w-full flex-col"
      data-ui="message-slip"
    >
      <div className="flex items-baseline justify-between gap-4 px-[1.222rem] pt-[1.111rem]">
        <span className="text-[0.944rem] leading-[1.5] font-semibold">
          {t.to}
        </span>
        <span className="text-muted-foreground text-[0.889rem] leading-[1.5]">
          {t.version}
        </span>
      </div>
      <p className="px-[1.222rem] pt-[0.556rem] pb-[1rem] text-[1rem] leading-[1.556]">
        {t.message}
      </p>
      <div aria-hidden="true" className="flex justify-between px-[0.444rem]">
        {PERFORATION_DOTS.map((dot) => (
          <span className="bg-control size-[0.278rem] rounded-full" key={dot} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-[1.222rem] pt-[0.889rem] pb-[1.111rem]">
        {approved ? (
          <button
            className="text-foreground min-h-[2.667rem] text-[0.944rem] font-medium underline underline-offset-4"
            onClick={() => setApproved(false)}
            type="button"
          >
            {t.showAgain}
          </button>
        ) : (
          <button
            className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active min-h-[2.667rem] rounded-[0.444rem] px-[1.111rem] text-[0.944rem] font-semibold whitespace-nowrap transition-[background-color,scale] duration-150 active:scale-[0.98]"
            onClick={() => setApproved(true)}
            type="button"
          >
            {t.approve}
          </button>
        )}
        <span
          aria-live="polite"
          className="text-accent-foreground text-[0.889rem] leading-[1.5] font-medium"
        >
          {approved ? t.sent : t.notSent}
        </span>
      </div>
    </div>
  );
};

export { MessageSlip };

"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { useMessages } from "@/i18n/locale";

import { SCAM_EXAMPLE_IDS } from "./content";
import type { ScamExampleId } from "./content";
import { FolderTab, HEADING, PAGE } from "./parts";
import { Reveal } from "./reveal";

const ScamCheck = () => {
  const [activeId, setActiveId] = useState<ScamExampleId>("text");
  const panelId = useId();
  const t = useMessages().landing.scamCheck;
  const active = t.examples[activeId];

  return (
    <section
      aria-labelledby="scam-check-title"
      className="bg-neutral-wash relative py-[5.333rem] lg:py-[7.778rem]"
      id="scam-check"
    >
      <FolderTab
        className="right-[1.111rem] lg:right-auto lg:left-[calc(50%-19.333rem)]"
        tone="bg-neutral-wash text-foreground"
      >
        {t.tab}
      </FolderTab>
      <div
        className={`${PAGE} grid gap-[2.667rem] lg:grid-cols-2 lg:gap-[3rem]`}
      >
        <Reveal className="lg:order-2 lg:flex lg:flex-col lg:justify-between lg:gap-[2.667rem]">
          <div className="flex flex-col gap-[1.333rem]">
            <h2 className={HEADING} id="scam-check-title">
              {t.title}
            </h2>
            <p className="max-w-[24.444rem] text-[1rem] leading-[1.556] md:text-[1.111rem]">
              {t.intro}
            </p>
          </div>
          <div className="hidden gap-[0.444rem] lg:flex">
            <Link
              className="bg-foreground text-background hover:bg-neutral-ink flex min-h-[4rem] flex-1 items-center px-[1.333rem] text-[1rem] font-semibold no-underline transition-colors duration-150"
              href="/sign-in?mode=sign-up"
              prefetch={false}
            >
              {t.checkMessage}
            </Link>
            <a
              className="bg-border text-foreground hover:bg-control/40 flex min-h-[4rem] flex-1 items-center px-[1.333rem] text-[1rem] font-semibold no-underline transition-colors duration-150"
              href="#questions"
            >
              {t.whatItLooksFor}
            </a>
          </div>
        </Reveal>

        <Reveal className="flex flex-col gap-[1.111rem] lg:order-1" delay={120}>
          <div
            aria-label={t.kinds}
            className="flex flex-wrap gap-x-[1.333rem] gap-y-2"
            role="tablist"
          >
            {SCAM_EXAMPLE_IDS.map((id) => {
              const selected = id === activeId;

              return (
                <button
                  aria-controls={panelId}
                  aria-selected={selected}
                  className={
                    selected
                      ? "text-foreground min-h-[2.667rem] text-[1rem] font-semibold underline decoration-[0.167rem] underline-offset-[0.5rem]"
                      : "text-muted-foreground hover:text-foreground min-h-[2.667rem] text-[1rem] transition-colors duration-150"
                  }
                  key={id}
                  onClick={() => setActiveId(id)}
                  role="tab"
                  type="button"
                >
                  {t.examples[id].label}
                </button>
              );
            })}
          </div>
          <div
            className="bg-raised flex flex-col gap-[1.111rem] p-[1.111rem] md:p-[2rem] lg:aspect-square"
            data-ui="scam-check"
            id={panelId}
            role="tabpanel"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[1.111rem] font-semibold">
                {t.panelTitle}
              </span>
              <span className="text-muted-foreground text-[0.889rem]">
                {t.example}
              </span>
            </div>
            <p
              className="bg-neutral-wash motion-enter max-w-[24.444rem] rounded-[1rem] px-[1.111rem] py-[0.889rem] text-[1rem] leading-[1.556]"
              key={activeId}
            >
              {active.received}
            </p>
            <p className="text-negative text-[1.333rem] leading-[1.3] font-semibold">
              {t.beCareful}
            </p>
            <ul className="flex flex-col gap-[0.444rem]">
              {active.signs.map((sign) => (
                <li
                  className="flex items-start gap-[0.667rem] text-[1rem] leading-[1.556]"
                  key={sign}
                >
                  <span
                    aria-hidden="true"
                    className="bg-negative mt-[0.611rem] size-[0.444rem] shrink-0 rounded-full"
                  />
                  {sign}
                </li>
              ))}
            </ul>
            <div className="bg-warning-wash mt-auto flex flex-col gap-[0.111rem] px-[1.111rem] py-[1rem]">
              <span className="text-[0.889rem] font-semibold">
                {t.saferStep}
              </span>
              <span className="text-[0.889rem] leading-[1.5]">
                {active.nextStep}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-[0.444rem] lg:hidden">
            <Link
              className="bg-foreground text-background flex min-h-[3.333rem] items-center px-[1.111rem] text-[1rem] font-semibold no-underline"
              href="/sign-in?mode=sign-up"
              prefetch={false}
            >
              {t.checkMessage}
            </Link>
            <a
              className="bg-border text-foreground flex min-h-[3.333rem] items-center px-[1.111rem] text-[1rem] font-semibold no-underline"
              href="#questions"
            >
              {t.whatItLooksFor}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export { ScamCheck };

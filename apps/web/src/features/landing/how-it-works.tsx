"use client";

import Image from "next/image";

import { useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";

import { Caption, HEADING, PAGE } from "./parts";
import { Reveal } from "./reveal";

const ZIGZAG_POINTS = Array.from({ length: 60 }, (_, index) => {
  const x = 480 - index * 8;
  const y = index % 2 === 0 ? 12 : 0;

  return `${x},${y}`;
}).join(" ");

const STEP_STAGGER_MS = 110;

type Timeline = Messages["landing"]["howItWorks"]["timeline"];

/** Every step, numbered across groups, so each can arrive just after the one above it. */
const numberTimeline = (timeline: Timeline) =>
  timeline.map((group, groupIndex) => {
    const earlierSteps = timeline
      .slice(0, groupIndex)
      .reduce((count, earlier) => count + earlier.steps.length, 0);

    return {
      ...group,
      steps: group.steps.map((step, stepIndex) => ({
        ...step,
        delay: (earlierSteps + stepIndex + 1) * STEP_STAGGER_MS,
      })),
    };
  });

/** Each step arrives in order as the slip scrolls into view; the result lands last. */
const RideSlip = () => {
  const t = useMessages().landing.howItWorks;
  const numbered = numberTimeline(t.timeline);

  const resultDelay =
    (t.timeline.reduce((count, group) => count + group.steps.length, 0) + 1) *
    STEP_STAGGER_MS;

  return (
    <Reveal className="landing-stagger w-full max-w-[26.667rem]">
      <div className="bg-raised text-foreground flex flex-col px-[1.333rem] pt-[1.778rem] pb-[1.333rem] md:px-[1.778rem]">
        <h3 className="text-[1.222rem] leading-[1.3] font-semibold">
          {t.slipTitle}
        </h3>
        <p className="text-muted-foreground text-[0.889rem] leading-[1.5]">
          {t.exampleTimes}
        </p>
        {numbered.map((group) => (
          <div
            className="flex flex-col gap-[0.556rem] pt-[1.333rem]"
            key={group.heading}
          >
            <h4 className="text-[0.889rem] leading-[1.5] font-bold">
              {group.heading}
            </h4>
            <ol className="flex flex-col gap-[0.556rem]">
              {group.steps.map((step) => (
                <li
                  className="landing-step flex items-baseline gap-[0.444rem] text-[0.889rem] leading-[1.5]"
                  key={step.label}
                  style={{ transitionDelay: `${step.delay}ms` }}
                >
                  <span
                    className={
                      step.decision
                        ? "text-accent-foreground font-semibold"
                        : undefined
                    }
                  >
                    {step.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="border-control min-w-[1rem] flex-1 border-b-[0.222rem] border-dotted"
                  />
                  <span className="num shrink-0">{step.time}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
        <p
          className="landing-step bg-foreground text-background mt-[1.556rem] flex min-h-[2.667rem] items-center justify-between gap-4 px-[0.889rem] py-[0.556rem] text-[0.889rem] leading-[1.5] font-semibold"
          style={{ transitionDelay: `${resultDelay}ms` }}
        >
          <span>{t.result}</span>
          <span>{t.done}</span>
        </p>
      </div>
      <svg
        aria-hidden="true"
        className="block h-[0.667rem] w-full"
        preserveAspectRatio="none"
        viewBox="0 0 480 12"
      >
        <polygon
          className="fill-raised"
          points={`0,0 480,0 ${ZIGZAG_POINTS} 0,0`}
        />
      </svg>
    </Reveal>
  );
};

const HowItWorks = () => {
  const t = useMessages().landing.howItWorks;

  return (
    <section
      aria-labelledby="how-it-works-title"
      className="landing-ink scroll-mt-0 py-[5.333rem] lg:py-[8.889rem]"
      id="how-it-works"
    >
      <div
        className={`${PAGE} flex flex-col gap-[3rem] lg:flex-row lg:items-start lg:justify-between`}
      >
        <div className="flex flex-col gap-[1.778rem] lg:max-w-[31.111rem]">
          <Reveal>
            <h2 className={HEADING} id="how-it-works-title">
              {t.titleLine1}
              <br />
              {t.titleLine2}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[24.444rem] text-[1rem] leading-[1.556] md:text-[1.111rem]">
              {t.intro}
            </p>
          </Reveal>
          <Reveal
            className="hidden flex-col gap-[0.667rem] pt-[1.333rem] lg:flex"
            delay={160}
          >
            <div className="bg-raised p-[0.889rem]">
              <Image
                alt={t.imageAlt}
                className="h-auto w-full"
                height={777}
                sizes="31rem"
                src="/landing/morse-key-and-register-1876.jpg"
                width={1200}
              />
            </div>
            <Caption className="text-neutral-wash">{t.imageCaption}</Caption>
          </Reveal>
        </div>
        <RideSlip />
      </div>
    </section>
  );
};

export { HowItWorks };

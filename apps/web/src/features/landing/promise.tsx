"use client";

import Image from "next/image";
import Link from "next/link";

import { useMessages } from "@/i18n/locale";

import { Caption, FolderTab, PAGE } from "./parts";
import { Reveal } from "./reveal";

const SCALLOP_PATH = `M0 0 H640 ${Array.from(
  { length: 32 },
  (_, index) => `A10 10 0 0 1 ${620 - index * 20} 0`
).join(" ")} Z`;

const OurPromise = () => {
  const t = useMessages().landing.promise;

  return (
    <section
      aria-labelledby="promise-title"
      className="bg-warning-wash relative py-[4.444rem] lg:py-[10rem]"
      id="our-promise"
    >
      <FolderTab
        className="left-[0.889rem] lg:left-[calc(50%+6.722rem)]"
        tone="bg-warning-wash text-foreground"
      >
        {t.tab}
      </FolderTab>
      <div
        className={`${PAGE} grid items-start gap-[2.222rem] lg:grid-cols-[12.222rem_minmax(0,35.556rem)_12.222rem] lg:justify-between`}
      >
        <Reveal
          className="order-2 flex flex-col gap-[0.667rem] lg:order-none lg:pt-[6.667rem]"
          delay={160}
        >
          <Image
            alt={t.leftImageAlt}
            className="h-auto w-[60%] lg:w-full"
            height={900}
            sizes="13rem"
            src="/landing/de-boissieu-old-man-with-a-boy-reading.jpg"
            width={630}
          />
          <Caption>{t.leftImageCaption}</Caption>
        </Reveal>

        <Reveal className="order-1 flex flex-col lg:order-none">
          <div className="bg-raised flex flex-col gap-[1.333rem] p-[1.333rem] md:p-[3.333rem]">
            <h2
              className="text-[1.556rem] leading-[1.2] font-semibold tracking-[-0.02em] md:text-[2.222rem] md:leading-[1.1]"
              id="promise-title"
            >
              {t.title}
            </h2>
            {t.promises.map((promise) => (
              <p
                className="text-[0.944rem] leading-[1.6] md:text-[1rem]"
                key={promise}
              >
                {promise}
              </p>
            ))}
            <p className="flex flex-col pt-[0.444rem]">
              <span className="text-[1.333rem] italic">LifeLink</span>
              <span className="text-muted-foreground text-[0.889rem]">
                {t.signature}
              </span>
            </p>
          </div>
          <svg
            aria-hidden="true"
            className="block h-[0.556rem] w-full"
            preserveAspectRatio="none"
            viewBox="0 0 640 10"
          >
            <path className="fill-raised" d={SCALLOP_PATH} />
          </svg>
          <div className="bg-parchment mt-[1.111rem] flex flex-col gap-[0.889rem] px-[1.333rem] py-[1.111rem] sm:flex-row sm:items-center sm:justify-between md:px-[1.778rem]">
            <span className="text-[0.944rem] leading-[1.5] sm:max-w-[16.667rem]">
              {t.sharing}
            </span>
            <Link
              className="bg-foreground text-background hover:bg-neutral-ink flex min-h-[2.889rem] items-center justify-center px-[1.222rem] text-[1rem] font-semibold no-underline transition-colors duration-150"
              href="/sign-in?mode=sign-up"
              prefetch={false}
            >
              {t.howSharingWorks}
            </Link>
          </div>
        </Reveal>

        <Reveal
          className="order-3 flex flex-col gap-[0.667rem] lg:order-none lg:pt-[23.333rem]"
          delay={240}
        >
          <Image
            alt={t.rightImageAlt}
            className="h-auto w-[70%] lg:w-full"
            height={630}
            sizes="13rem"
            src="/landing/western-union-telegram-1959.jpg"
            width={900}
          />
          <Caption>{t.rightImageCaption}</Caption>
        </Reveal>
      </div>
    </section>
  );
};

export { OurPromise };

"use client";

import Image from "next/image";

import { useMessages } from "@/i18n/locale";

import { Caption, FolderTab, HEADING, PAGE } from "./parts";
import { Reveal } from "./reveal";

const Questions = () => {
  const t = useMessages().landing.questions;
  const half = Math.ceil(t.items.length / 2);
  const columns = [t.items.slice(0, half), t.items.slice(half)] as const;

  return (
    <section
      aria-labelledby="questions-title"
      className="bg-neutral-wash relative py-[4.444rem] lg:py-[10rem]"
      id="questions"
    >
      <FolderTab
        className="right-[0.889rem] lg:right-auto lg:left-[calc(50%+21.167rem)]"
        tone="bg-neutral-wash text-foreground"
      >
        {t.tab}
      </FolderTab>
      <div
        className={`${PAGE} grid gap-[2.222rem] lg:grid-cols-[18.889rem_minmax(0,1fr)] lg:gap-[4.444rem]`}
      >
        <div className="flex flex-col gap-[1.111rem]">
          <Reveal>
            <h2 className={HEADING} id="questions-title">
              {t.title}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[1rem] leading-[1.556]">{t.intro}</p>
          </Reveal>
          <Reveal
            className="flex flex-col gap-[0.667rem] pt-[0.889rem]"
            delay={160}
          >
            <div className="relative aspect-[5/4] w-full overflow-hidden">
              <Image
                alt={t.imageAlt}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 19rem, 100vw"
                src="/landing/monet-water-lily-pond.jpg"
              />
            </div>
            <Caption>{t.imageCaption}</Caption>
          </Reveal>
        </div>
        <div className="grid gap-[1.556rem] md:grid-cols-2 md:gap-x-[3.111rem]">
          {columns.map((column, columnIndex) => (
            <dl
              className="flex flex-col gap-[1.556rem]"
              key={column[0]?.question ?? `column-${columnIndex}`}
            >
              {column.map((item, index) => (
                <Reveal delay={index * 60} key={item.question}>
                  <dt className="text-[1rem] leading-[1.5] font-semibold">
                    {item.question}
                  </dt>
                  <dd className="text-[0.944rem] leading-[1.55]">
                    {item.answer}
                  </dd>
                </Reveal>
              ))}
            </dl>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Questions };

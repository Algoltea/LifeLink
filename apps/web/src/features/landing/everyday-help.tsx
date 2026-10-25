"use client";

import { cn } from "@lifelink/ui/lib/utils";
import Image from "next/image";
import type { ReactNode } from "react";

import { useMessages } from "@/i18n/locale";

import { FolderTab, HEADING, PAGE } from "./parts";
import { Reveal } from "./reveal";

/** Aligns a half-width column with the page margin on wide screens. */
const LEFT_EDGE = "lg:pl-[max(2.222rem,calc((100vw-65.222rem)/2))]";

const Sheet = ({
  children,
  description,
  figure,
  title,
  tone,
}: {
  children: ReactNode;
  description: string;
  figure: ReactNode;
  title: string;
  tone: string;
}) => (
  <article className={cn("grid lg:min-h-[38.889rem] lg:grid-cols-2", tone)}>
    <div
      className={cn(
        "flex flex-col gap-[1.333rem] px-[1.111rem] pt-[0.667rem] pb-[2.667rem] md:px-[2.222rem] lg:pr-[3rem] lg:pb-[3rem]",
        LEFT_EDGE
      )}
    >
      <h3 className="text-[1.333rem] leading-[1.3] font-semibold tracking-[-0.02em] md:text-[2.222rem] md:leading-[1.1]">
        {title}
      </h3>
      <div className="-mx-[1.111rem] md:-mx-[2.222rem] lg:hidden">{figure}</div>
      <Reveal className="hidden max-w-[26.667rem] lg:block">{children}</Reveal>
      <div className="flex flex-col gap-[0.667rem] lg:mt-auto">
        <p className="max-w-[26.667rem] text-[1rem] leading-[1.556] md:text-[1.111rem]">
          {description}
        </p>
      </div>
    </div>
    <div className="hidden lg:block lg:pt-[4rem]">{figure}</div>
  </article>
);

const MessageThread = () => {
  const t = useMessages().landing.everydayHelp.thread;

  return (
    <div
      className="bg-raised text-foreground flex flex-col gap-[0.778rem] rounded-[0.667rem] p-[1.333rem]"
      data-ui="thread"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-semibold">Sam Rivera</span>
        <span className="text-muted-foreground text-[0.889rem]">iMessage</span>
      </div>
      <p className="bg-neutral-wash self-end rounded-[1rem] px-[0.889rem] py-[0.667rem] text-[0.944rem] leading-[1.5]">
        {t.sentMessage}
      </p>
      <span className="text-muted-foreground self-end text-[0.889rem]">
        {t.sent}
      </span>
      <p className="bg-parchment self-start rounded-[1rem] px-[0.889rem] py-[0.667rem] text-[0.944rem] leading-[1.5]">
        {t.reply}
      </p>
      <span className="text-accent-foreground text-[0.889rem] font-medium underline">
        {t.helpMeUnderstand}
      </span>
    </div>
  );
};

const ReminderDraft = () => {
  const t = useMessages().landing.everydayHelp.reminder;

  return (
    <div
      className="bg-raised text-foreground flex flex-col gap-[0.778rem] rounded-[0.667rem] p-[1.333rem]"
      data-ui="reminder"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-semibold">{t.title}</span>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.version}
        </span>
      </div>
      <span className="text-muted-foreground text-[0.889rem]">{t.youSaid}</span>
      <div className="bg-parchment flex flex-col px-[1rem] py-[0.889rem]">
        <span className="text-[1.111rem] font-semibold">{t.what}</span>
        <span>{t.when}</span>
      </div>
      <div className="flex items-center gap-[1.111rem]">
        <span className="bg-primary text-primary-foreground flex min-h-[2.667rem] items-center rounded-[0.444rem] px-[1.111rem] text-[0.889rem] font-semibold">
          {t.approve}
        </span>
        <span className="text-[0.889rem] font-medium underline">
          {t.changeTime}
        </span>
      </div>
    </div>
  );
};

const TodayScreen = () => {
  const t = useMessages().landing.everydayHelp.today;

  return (
    <div
      className="bg-raised text-foreground flex h-full flex-col gap-[1.333rem] p-[1.333rem] md:p-[2.667rem] lg:pr-[max(2.222rem,calc((100vw-65.222rem)/2))]"
      data-ui="today"
    >
      <span className="text-[1.556rem] font-semibold md:text-[1.778rem]">
        {t.greeting}
      </span>
      <div className="bg-accent flex items-center justify-between gap-4 rounded-[0.667rem] px-[1.333rem] py-[1.111rem]">
        <span className="flex flex-col">
          <span className="text-muted-foreground text-[0.889rem]">
            {t.waiting}
          </span>
          <span className="text-[1.111rem] font-semibold">
            {t.confirmPickup}
          </span>
        </span>
        <span className="bg-primary text-primary-foreground flex min-h-[2.667rem] items-center rounded-[0.444rem] px-[1.111rem] text-[0.889rem] font-semibold">
          {t.review}
        </span>
      </div>
      <span className="pt-[0.444rem] text-[1.333rem] font-semibold">
        {t.comingUp}
      </span>
      <ul className="flex flex-col gap-[0.444rem]">
        {t.rows.map((row) => (
          <li
            className="bg-parchment flex flex-wrap items-center gap-x-[1.111rem] rounded-[0.667rem] px-[1.111rem] py-[0.889rem]"
            key={row.title}
          >
            <span className="num w-[5.333rem] shrink-0 font-semibold">
              {row.time}
            </span>
            <span className="flex-1">{row.title}</span>
            <span className="text-muted-foreground w-full pl-[6.444rem] text-[0.889rem] sm:w-auto sm:pl-0">
              {row.detail}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DisplaySettings = () => {
  const t = useMessages().landing.everydayHelp;

  return (
    <ul
      className="text-foreground flex flex-col gap-[0.444rem]"
      data-ui="settings"
    >
      {t.displaySettings.map((setting) => (
        <li
          className="bg-raised flex items-center justify-between gap-4 rounded-[0.667rem] px-[1.111rem] py-[0.889rem]"
          key={setting.label}
        >
          <span>{setting.label}</span>
          <span className="font-semibold">{setting.value}</span>
        </li>
      ))}
    </ul>
  );
};

/** A painting with its museum label on the picture itself, as in the hero. */
const Painting = ({
  alt,
  caption,
  position,
  src,
}: {
  alt: string;
  caption: string;
  position: string;
  src: string;
}) => (
  <figure className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[34.889rem]">
    <Image
      alt={alt}
      className={cn("object-cover", position)}
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
      src={src}
    />
    <figcaption className="bg-raised text-foreground absolute bottom-[1.111rem] left-[1.111rem] px-[0.778rem] py-[0.444rem] text-[0.889rem] leading-[1.5] md:left-[2.222rem] lg:bottom-0 lg:left-0">
      {caption}
    </figcaption>
  </figure>
);

const EverydayHelp = () => {
  const t = useMessages().landing.everydayHelp;

  return (
    <section aria-labelledby="everyday-help-title" id="everyday-help">
      <div className="bg-primary text-primary-foreground relative pt-[4.889rem] pb-[2.222rem] lg:pt-[10rem] lg:pb-[2.667rem]">
        <FolderTab
          className="left-1/2 -translate-x-1/2 lg:left-[calc(50%-6.611rem)] lg:translate-x-0"
          tone="bg-primary text-primary-foreground"
        >
          {t.tab}
        </FolderTab>
        <div
          className={`${PAGE} flex flex-col gap-[1.333rem] lg:flex-row lg:items-end lg:justify-between`}
        >
          <Reveal>
            <h2 className={HEADING} id="everyday-help-title">
              {t.title}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[22.222rem] text-[1rem] leading-[1.556] md:text-[1.111rem]">
              {t.intro}
            </p>
          </Reveal>
        </div>
      </div>

      <Sheet
        description={t.messages.description}
        figure={
          <Painting
            caption={t.messages.imageCaption}
            alt={t.messages.imageAlt}
            position="object-[center_30%]"
            src="/landing/cassatt-the-letter.jpg"
          />
        }
        title={t.messages.title}
        tone="bg-parchment text-foreground"
      >
        <MessageThread />
      </Sheet>

      <Sheet
        description={t.reminders.description}
        figure={<TodayScreen />}
        title={t.reminders.title}
        tone="landing-ink"
      >
        <ReminderDraft />
      </Sheet>

      <Sheet
        description={t.read.description}
        figure={
          <Painting
            caption={t.read.imageCaption}
            alt={t.read.imageAlt}
            position="object-[center_30%]"
            src="/landing/manet-woman-reading.jpg"
          />
        }
        title={t.read.title}
        tone="bg-neutral-wash text-foreground"
      >
        <DisplaySettings />
      </Sheet>
    </section>
  );
};

export { EverydayHelp };

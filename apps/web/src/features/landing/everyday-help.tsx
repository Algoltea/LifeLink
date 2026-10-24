import { cn } from "@lifelink/ui/lib/utils";
import Image from "next/image";
import type { ReactNode } from "react";

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

const MessageThread = () => (
  <div
    className="bg-raised text-foreground flex flex-col gap-[0.778rem] rounded-[0.667rem] p-[1.333rem]"
    data-ui="thread"
  >
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-semibold">Sam Rivera</span>
      <span className="text-muted-foreground text-[0.889rem]">iMessage</span>
    </div>
    <p className="bg-neutral-wash self-end rounded-[1rem] px-[0.889rem] py-[0.667rem] text-[0.944rem] leading-[1.5]">
      Hi Sam, could you drive me to Dr. Patel on Tuesday, October 27?
    </p>
    <span className="text-muted-foreground self-end text-[0.889rem]">
      Sent 9:05 AM · version 2
    </span>
    <p className="bg-parchment self-start rounded-[1rem] px-[0.889rem] py-[0.667rem] text-[0.944rem] leading-[1.5]">
      Of course! 9:45 at yours? Might bring Max along.
    </p>
    <span className="text-accent-foreground text-[0.889rem] font-medium underline">
      Help me understand
    </span>
  </div>
);

const ReminderDraft = () => (
  <div
    className="bg-raised text-foreground flex flex-col gap-[0.778rem] rounded-[0.667rem] p-[1.333rem]"
    data-ui="reminder"
  >
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-semibold">New reminder</span>
      <span className="text-muted-foreground text-[0.889rem]">Version 1</span>
    </div>
    <span className="text-muted-foreground text-[0.889rem]">
      You said: “Remind me to call Ana on Sunday.”
    </span>
    <div className="bg-parchment flex flex-col px-[1rem] py-[0.889rem]">
      <span className="text-[1.111rem] font-semibold">Call Ana</span>
      <span>Sunday, November 1 · 11:00 AM</span>
    </div>
    <div className="flex items-center gap-[1.111rem]">
      <span className="bg-primary text-primary-foreground flex min-h-[2.667rem] items-center rounded-[0.444rem] px-[1.111rem] text-[0.889rem] font-semibold">
        Approve reminder
      </span>
      <span className="text-[0.889rem] font-medium underline">Change time</span>
    </div>
  </div>
);

const TODAY_ROWS = [
  { detail: "Reminder · today", time: "8:00 PM", title: "Evening tablets" },
  { detail: "Not confirmed yet", time: "9:45 AM", title: "Sam picks you up" },
  { detail: "Tuesday, Oct 27", time: "10:30 AM", title: "Dr. Patel" },
] as const;

const TodayScreen = () => (
  <div
    className="bg-raised text-foreground flex h-full flex-col gap-[1.333rem] p-[1.333rem] md:p-[2.667rem] lg:pr-[max(2.222rem,calc((100vw-65.222rem)/2))]"
    data-ui="today"
  >
    <span className="text-[1.556rem] font-semibold md:text-[1.778rem]">
      Good afternoon, Ruth
    </span>
    <div className="bg-accent flex items-center justify-between gap-4 rounded-[0.667rem] px-[1.333rem] py-[1.111rem]">
      <span className="flex flex-col">
        <span className="text-muted-foreground text-[0.889rem]">
          Waiting for you
        </span>
        <span className="text-[1.111rem] font-semibold">
          Confirm Sam’s 9:45 pickup
        </span>
      </span>
      <span className="bg-primary text-primary-foreground flex min-h-[2.667rem] items-center rounded-[0.444rem] px-[1.111rem] text-[0.889rem] font-semibold">
        Review
      </span>
    </div>
    <span className="pt-[0.444rem] text-[1.333rem] font-semibold">
      Coming up
    </span>
    <ul className="flex flex-col gap-[0.444rem]">
      {TODAY_ROWS.map((row) => (
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

const DISPLAY_SETTINGS = [
  { label: "Text size", value: "Larger" },
  { label: "Read replies aloud", value: "On · slower" },
  { label: "Less movement", value: "On" },
  { label: "Contrast", value: "Stronger" },
  { label: "Captions on calls", value: "On" },
] as const;

const DisplaySettings = () => (
  <ul
    className="text-foreground flex flex-col gap-[0.444rem]"
    data-ui="settings"
  >
    {DISPLAY_SETTINGS.map((setting) => (
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

const EverydayHelp = () => (
  <section aria-labelledby="everyday-help-title" id="everyday-help">
    <div className="bg-primary text-primary-foreground relative pt-[4.889rem] pb-[2.222rem] lg:pt-[10rem] lg:pb-[2.667rem]">
      <FolderTab
        className="left-1/2 -translate-x-1/2 lg:left-[calc(50%-6.611rem)] lg:translate-x-0"
        tone="bg-primary text-primary-foreground"
      >
        Everyday help
      </FolderTab>
      <div
        className={`${PAGE} flex flex-col gap-[1.333rem] lg:flex-row lg:items-end lg:justify-between`}
      >
        <Reveal>
          <h2 className={HEADING} id="everyday-help-title">
            What LifeLink helps with
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="max-w-[22.222rem] text-[1rem] leading-[1.556] md:text-[1.111rem]">
            Messages to family, appointments and reminders, with large text and
            read-aloud throughout. Anything that would be sent still waits for
            you.
          </p>
        </Reveal>
      </div>
    </div>

    <Sheet
      description="Write to family by iMessage, email, Discord or Telegram. Help me understand explains a message you’ve received and suggests replies for you to choose."
      figure={
        <Painting
          caption="Mary Cassatt, The Letter, 1890–91."
          alt="Mary Cassatt, The Letter: a woman in a blue patterned dress seals a letter at her writing desk."
          position="object-[center_30%]"
          src="/landing/cassatt-the-letter.jpg"
        />
      }
      title="Messages to family"
      tone="bg-parchment text-foreground"
    >
      <MessageThread />
    </Sheet>

    <Sheet
      description="Today opens with what needs you first, then appointments and reminders. Say what to remember and LifeLink writes it down for you to approve."
      figure={<TodayScreen />}
      title="Appointments and reminders"
      tone="landing-ink"
    >
      <ReminderDraft />
    </Sheet>

    <Sheet
      description="Larger text, stronger contrast, captions and a slower reading voice. Speak instead of typing whenever you like. Your settings follow you to every screen."
      figure={
        <Painting
          caption="Édouard Manet, Woman Reading, 1880–82."
          alt="Édouard Manet, Woman Reading: a woman in a dark coat and hat reads an illustrated journal outdoors."
          position="object-[center_30%]"
          src="/landing/manet-woman-reading.jpg"
        />
      }
      title="Read, listen or speak"
      tone="bg-neutral-wash text-foreground"
    >
      <DisplaySettings />
    </Sheet>
  </section>
);

export { EverydayHelp };

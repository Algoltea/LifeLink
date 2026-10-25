import Image from "next/image";
import Link from "next/link";

import { BrandMark } from "@/components/app/brand";

import { MessageSlip } from "./message-slip";
import { PAGE } from "./parts";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#scam-check", label: "Scam check" },
  { href: "#questions", label: "Questions" },
] as const;

const Hero = () => (
  <header className="landing-ink flex flex-col lg:min-h-svh">
    <nav
      aria-label="LifeLink"
      className={`${PAGE} flex min-h-[5rem] items-center justify-between gap-6 pt-[0.889rem]`}
    >
      <Link className="flex items-center gap-[0.667rem] no-underline" href="/">
        <BrandMark size={32} />
        <span className="text-[1.333rem] leading-none font-semibold tracking-[-0.02em]">
          LifeLink
        </span>
      </Link>
      <div className="flex items-center gap-[1.778rem]">
        {NAV_LINKS.map((link) => (
          <a
            className="hidden text-[0.944rem] no-underline hover:underline lg:inline"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </a>
        ))}
        <Link
          className="text-[0.944rem] font-semibold underline"
          href="/sign-in"
          prefetch={false}
        >
          Sign in
        </Link>
      </div>
    </nav>

    <div
      className={`${PAGE} grid gap-[1.333rem] pt-[2.222rem] pb-[2.222rem] lg:pt-[3.556rem] lg:pb-[1.778rem] xl:grid-cols-[minmax(0,40rem)_minmax(0,1fr)] xl:gap-[3rem]`}
    >
      <h1 className="text-[2.667rem] leading-[1.05] font-semibold tracking-[-0.04em] md:text-[4.667rem] md:leading-none">
        Nothing is sent
        <br />
        until you say so.
      </h1>
      <div className="flex flex-col gap-[1.333rem] xl:pt-[0.556rem]">
        <p className="max-w-[30rem] text-[1rem] leading-[1.556] md:text-[1.111rem]">
          LifeLink helps you write to family, keep track of appointments, and
          check texts or letters that seem suspicious. You read each message in
          full before you approve it.
        </p>
        <div className="flex flex-col gap-[0.889rem] sm:flex-row sm:items-center sm:gap-[1.333rem]">
          <Link
            className="bg-raised text-foreground hover:bg-warning-wash flex min-h-[3.333rem] items-center justify-center px-[1.667rem] text-[1.056rem] font-semibold no-underline transition-colors duration-150 active:scale-[0.98]"
            href="/sign-in?mode=sign-up"
            prefetch={false}
          >
            Get started
          </Link>
          <a className="text-[1rem] font-medium underline" href="#how-it-works">
            See how it works
          </a>
        </div>
      </div>
    </div>

    <div className="relative h-[40rem] overflow-hidden lg:h-auto lg:min-h-[17rem] lg:flex-1">
      <Image
        alt="Claude Monet, Cliff Walk at Pourville: two figures on a flowered clifftop above a bright sea with sailboats."
        className="landing-drift object-cover object-[78%_center] lg:object-[center_38%]"
        fill
        priority
        sizes="100vw"
        src="/landing/monet-cliff-walk-at-pourville.jpg"
      />
      <p className="bg-raised text-foreground absolute top-[1.111rem] left-[1.111rem] px-[0.667rem] py-[0.444rem] text-[0.889rem] leading-[1.5] lg:top-auto lg:right-[max(2.222rem,calc((100vw-65.222rem)/2))] lg:bottom-0 lg:left-auto lg:px-[0.889rem] lg:py-[0.556rem]">
        Claude Monet, Cliff Walk at Pourville, 1882.
      </p>
      <div
        className={`${PAGE} absolute inset-x-0 bottom-[1.778rem] lg:bottom-[2.333rem]`}
      >
        <div className="max-w-[23.333rem]">
          <MessageSlip />
        </div>
      </div>
    </div>
  </header>
);

export { Hero };

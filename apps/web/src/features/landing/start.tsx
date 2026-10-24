import Link from "next/link";

import { BrandMark } from "@/components/app/brand";

import { PAGE } from "./parts";
import { Reveal } from "./reveal";

const FOOTER_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#scam-check", label: "Scam check" },
  { href: "#everyday-help", label: "Everyday help" },
  { href: "#our-promise", label: "Our promise" },
  { href: "#questions", label: "Questions" },
] as const;

/**
 * The page ends with the first step already open: the request carries
 * into sign-up, where the person chooses sample or real family.
 */
const Start = () => (
  <section
    aria-labelledby="start-title"
    className="bg-primary text-primary-foreground py-[4.444rem] lg:py-[8.889rem]"
  >
    <div
      className={`${PAGE} grid gap-[2.222rem] lg:grid-cols-[minmax(0,1fr)_26.667rem] lg:items-end lg:gap-[3rem]`}
    >
      <div className="flex flex-col gap-[1.333rem] lg:pb-[2.222rem]">
        <Reveal>
          <h2
            className="text-[2.667rem] leading-[1.02] font-semibold tracking-[-0.04em] md:text-[5.778rem] md:leading-[0.98]"
            id="start-title"
          >
            Start with
            <br />
            one request
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="max-w-[25.556rem] text-[1rem] leading-[1.556] md:text-[1.111rem]">
            Tell LifeLink what you need, then read the full message before
            anything is sent. Want to look around first? You can try it with
            sample messages.
          </p>
        </Reveal>
      </div>

      <Reveal delay={160}>
        <form
          action="/sign-in"
          className="bg-raised text-foreground flex flex-col gap-[1.333rem] rounded-[0.667rem] p-[1.111rem] md:p-[1.778rem]"
          method="get"
        >
          <input name="mode" type="hidden" value="sign-up" />
          <h3 className="text-[1.333rem] leading-[1.3] font-semibold">
            What would you like help with?
          </h3>
          <label className="flex flex-col gap-[0.444rem]">
            <span className="text-[0.889rem] font-medium">Your request</span>
            <textarea
              className="border-control focus-visible:border-primary min-h-[5.333rem] resize-y rounded-[0.444rem] border-2 bg-transparent px-[0.889rem] py-[0.667rem] text-[1rem] leading-[1.556]"
              defaultValue="Can Sam drive me to my appointment on Tuesday?"
              name="request"
            />
          </label>
          <fieldset className="flex flex-col gap-[0.444rem]">
            <legend className="pb-[0.444rem] text-[0.889rem] font-medium">
              Try it with
            </legend>
            <div className="bg-parchment grid grid-cols-2 gap-[0.222rem] rounded-[0.444rem] p-[0.222rem]">
              <label className="has-checked:bg-neutral-wash flex min-h-[2.444rem] cursor-pointer items-center justify-center rounded-[0.333rem] text-[0.889rem] has-checked:font-semibold has-focus-visible:outline-3 has-focus-visible:outline-offset-2">
                <input
                  className="sr-only"
                  name="family"
                  type="radio"
                  value="sample"
                />
                Sample family
              </label>
              <label className="has-checked:bg-neutral-wash flex min-h-[2.444rem] cursor-pointer items-center justify-center rounded-[0.333rem] text-[0.889rem] has-checked:font-semibold has-focus-visible:outline-3 has-focus-visible:outline-offset-2">
                <input
                  className="sr-only"
                  defaultChecked
                  name="family"
                  type="radio"
                  value="own"
                />
                My own family
              </label>
            </div>
          </fieldset>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active min-h-[2.889rem] rounded-[0.444rem] text-[1rem] font-semibold transition-[background-color,scale] duration-150 active:scale-[0.98]"
            type="submit"
          >
            See the draft
          </button>
          <p className="text-muted-foreground text-[0.889rem] leading-[1.5]">
            You’ll create an account. Already have one?{" "}
            <Link
              className="text-accent-foreground underline"
              href="/sign-in"
              prefetch={false}
            >
              Sign in
            </Link>
          </p>
        </form>
      </Reveal>
    </div>
  </section>
);

const LandingFooter = () => (
  <footer className="bg-background flex flex-col gap-[0.444rem] p-[0.444rem] md:p-[0.667rem]">
    <div className="grid gap-[0.444rem] md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1.7fr)]">
      <div className="bg-parchment flex min-h-[12.222rem] flex-col justify-between gap-[1.333rem] p-[1.556rem]">
        <p className="max-w-[20rem] text-[1.333rem] leading-[1.35] font-semibold">
          Help with everyday messages. Nothing is sent until you say so.
        </p>
        <p className="text-[0.889rem]">© 2026 LifeLink</p>
      </div>
      <nav
        aria-label="Footer"
        className="bg-neutral-wash flex flex-col gap-[0.333rem] p-[1.556rem]"
      >
        {FOOTER_LINKS.map((link) => (
          <a
            className="w-fit text-[0.889rem] leading-[1.6] no-underline hover:underline"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </a>
        ))}
        <Link
          className="w-fit text-[0.889rem] leading-[1.6] no-underline hover:underline"
          href="/solitaire"
          prefetch={false}
        >
          Solitaire
        </Link>
        <Link
          className="w-fit text-[0.889rem] leading-[1.6] font-semibold no-underline hover:underline"
          href="/sign-in"
          prefetch={false}
        >
          Sign in
        </Link>
      </nav>
      <div className="bg-warning-wash flex flex-col gap-[0.556rem] p-[1.556rem]">
        <h2 className="text-[0.889rem] font-semibold">Pictures</h2>
        <p className="text-[0.889rem] leading-[1.6]">
          Mary Cassatt, The Letter; Édouard Manet, Woman Reading; Claude Monet,
          Cliff Walk at Pourville and Water Lily Pond; Jean-Jacques de Boissieu,
          Old Man with a Boy Reading: public domain (CC0),{" "}
          <a
            href="https://www.artic.edu/collection"
            rel="noreferrer"
            target="_blank"
          >
            Art Institute of Chicago
          </a>
          . Morse key and register, 1876: public domain, Wikimedia Commons.{" "}
          <a
            href="https://commons.wikimedia.org/w/index.php?curid=27046809"
            rel="noreferrer"
            target="_blank"
          >
            1959 Western Union Telegram
          </a>{" "}
          by RedKnight7,{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            rel="noreferrer"
            target="_blank"
          >
            CC BY-SA 3.0
          </a>
          , Wikimedia Commons. Interface examples use sample data.
        </p>
      </div>
    </div>
    <div className="grid gap-[0.444rem] md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
      <div className="landing-ink flex min-h-[8.889rem] items-center justify-center gap-[1.333rem] md:min-h-[17.778rem]">
        <span className="hidden lg:block">
          <BrandMark size={72} />
        </span>
        <span className="lg:hidden">
          <BrandMark size={44} />
        </span>
        <span className="text-[3.111rem] leading-none font-semibold tracking-[-0.04em] md:text-[4.444rem] lg:text-[7.778rem]">
          LifeLink
        </span>
      </div>
      <Link
        className="bg-primary text-primary-foreground hover:bg-primary-hover flex min-h-[6.667rem] flex-col justify-between p-[1.556rem] no-underline transition-colors duration-150"
        href="/sign-in?mode=sign-up"
        prefetch={false}
      >
        <span className="text-[1.333rem] leading-[1.3] font-semibold md:text-[1.778rem]">
          Get started
        </span>
        <svg
          aria-hidden="true"
          className="size-[2.667rem] self-end md:size-[4rem]"
          fill="none"
          viewBox="0 0 72 72"
        >
          <path
            d="M12 36h46M38 16l20 20-20 20"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
      </Link>
    </div>
  </footer>
);

export { LandingFooter, Start };

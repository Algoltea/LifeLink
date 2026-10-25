"use client";

import { interfaceLocales } from "@lifelink/contracts/locale";
import { cn } from "@lifelink/ui/lib/utils";
import { Check, Languages } from "lucide-react";
import type { MouseEvent } from "react";

import { setLocale, useLocale, useMessages } from "@/i18n/locale";

import { PAGE } from "./parts";

/** The navbar's Language link points here. */
const LANGUAGE_SECTION_ID = "language";
const SCROLL_DURATION_MS = 350;
let scrollFrame = 0;

const scrollLandingPage = (top: number) => {
  window.cancelAnimationFrame(scrollFrame);

  if (
    document.documentElement.dataset.motion === "reduced" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    window.scrollTo({ behavior: "instant", top });

    return;
  }

  const startTop = window.scrollY;
  const startTime = performance.now();

  const animate = (now: number) => {
    const progress = Math.min((now - startTime) / SCROLL_DURATION_MS, 1);
    const easedProgress = 1 - (1 - progress) ** 3;
    window.scrollTo({
      behavior: "instant",
      top: startTop + (top - startTop) * easedProgress,
    });

    if (progress < 1) {
      scrollFrame = window.requestAnimationFrame(animate);
    }
  };

  scrollFrame = window.requestAnimationFrame(animate);
};

const handleLanguageLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const section = document.querySelector(`#${LANGUAGE_SECTION_ID}`);

  if (!section) {
    return;
  }

  event.preventDefault();
  scrollLandingPage(section.getBoundingClientRect().top + window.scrollY);
};

/**
 * Every supported language, each written in its own words so anyone can
 * find theirs. The choice is saved on this device, so sign-up carries it
 * into the new account; signing in to an existing account uses that
 * account's language instead.
 */
const LanguagePicker = () => {
  const locale = useLocale();
  const t = useMessages().landing.language;

  return (
    <section
      aria-labelledby="language-title"
      className="bg-background scroll-mt-0 py-[3.556rem] lg:py-[5.333rem]"
      id={LANGUAGE_SECTION_ID}
    >
      <div
        className={`${PAGE} grid gap-[1.778rem] lg:grid-cols-[18.889rem_minmax(0,1fr)] lg:gap-[4.444rem]`}
      >
        <div className="flex flex-col gap-[0.889rem]">
          <h2
            className="flex items-center gap-[0.667rem] text-[1.556rem] leading-[1.2] font-semibold tracking-[-0.02em] md:text-[2.222rem]"
            id="language-title"
          >
            <Languages
              aria-hidden="true"
              className="size-[1.778rem] shrink-0"
            />
            {t.title}
          </h2>
          <p className="text-[1rem] leading-[1.556]">{t.intro}</p>
        </div>
        <ul className="grid grid-cols-1 gap-[0.444rem] sm:grid-cols-2 lg:grid-cols-3">
          {interfaceLocales.map(({ id, label }) => {
            const selected = id === locale;

            return (
              <li key={id}>
                <button
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-[3.333rem] w-full items-center justify-between gap-4 rounded-[0.444rem] px-[1.111rem] text-left text-[1.056rem] transition-colors duration-150",
                    selected
                      ? "bg-foreground text-background font-semibold"
                      : "bg-parchment text-foreground hover:bg-neutral-wash"
                  )}
                  lang={id}
                  onClick={() => {
                    setLocale(id);
                    scrollLandingPage(0);
                  }}
                  type="button"
                >
                  {label}
                  {selected ? (
                    <Check
                      aria-hidden="true"
                      className="size-[1.222rem] shrink-0"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export { handleLanguageLinkClick, LANGUAGE_SECTION_ID, LanguagePicker };

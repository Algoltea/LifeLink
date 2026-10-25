"use client";

import type { CSSProperties, ReactNode, RefCallback } from "react";
import { useEffect, useRef, useState } from "react";

type RevealState = "idle" | "waiting" | "shown";

/** Content arrives once its top passes this share of the viewport height. */
const ARRIVAL_LINE = 0.88;

const prefersStillPage = () =>
  document.documentElement.dataset.motion === "reduced" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Lifts its content into place the first time it scrolls into view.
 * Server HTML and reduced-motion visitors always see the content at rest:
 * only content that starts below the fold is hidden, and only after the
 * script has run, so nothing can stay invisible if it fails.
 */
const Reveal = ({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  ref: forwardedRef,
}: {
  as?: "div" | "li" | "section";
  children: ReactNode;
  className?: string;
  /** Milliseconds to wait after the parent group starts to arrive. */
  delay?: number;
  /** Also receives the element, for callers that measure it. */
  ref?: RefCallback<HTMLElement>;
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const element = ref.current;

    if (!element || prefersStillPage()) {
      return;
    }

    const { top } = element.getBoundingClientRect();

    if (top < window.innerHeight) {
      return;
    }

    setState("waiting");

    // A scroll check rather than an observer, so content the page jumps past
    // (a fast fling, a link to a lower section) is revealed too, never stranded.
    const listening = new AbortController();
    let frame = 0;

    const check = () => {
      frame = 0;

      if (
        element.getBoundingClientRect().top <
        window.innerHeight * ARRIVAL_LINE
      ) {
        setState("shown");
        listening.abort();
      }
    };

    const scheduleCheck = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(check);
      }
    };

    // Resizing counts too: a taller window or a turned phone can bring content into view.
    for (const type of ["scroll", "resize"]) {
      window.addEventListener(type, scheduleCheck, {
        passive: true,
        signal: listening.signal,
      });
    }

    return () => {
      listening.abort();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // SAFETY: CSSProperties has no index for custom properties; --reveal-delay is a plain millisecond string read only by landing.css.
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return (
    <Tag
      className={className}
      data-reveal={state}
      ref={(node: HTMLElement | null) => {
        ref.current = node;
        forwardedRef?.(node);
      }}
      style={style}
    >
      {children}
    </Tag>
  );
};

export { Reveal };

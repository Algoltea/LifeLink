"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const cssPixels = (value: string): number =>
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- Computed CSS lengths include px units.
  Number.parseFloat(value) || 0;

/** Use the same viewport fit while loading and after the conversation opens.
 * An edge-to-edge workspace supplies its own bottom padding inside the dock.
 */
const useChatViewport = (
  threadId?: string | null,
  edgeToEdge = false
): RefObject<HTMLDivElement | null> => {
  const workspace = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = workspace.current;
    const parent = element?.parentElement;

    if (!element || !parent) {
      return;
    }

    const transcript = element.querySelector<HTMLElement>(
      threadId === undefined
        ? "[data-chat-transcript]"
        : 'section[aria-label="Conversation with LifeLink"]'
    );

    const composer = element.querySelector(
      "[data-chat-dock], fieldset, [data-chat-composer]"
    );

    const header = element.querySelector("header");

    const fitViewport = (): void => {
      const top = element.getBoundingClientRect().top + globalThis.scrollY;

      const bottomPadding = edgeToEdge
        ? 0
        : cssPixels(getComputedStyle(parent).paddingBottom);

      const viewportHeight =
        globalThis.visualViewport?.height ?? globalThis.innerHeight;

      element.style.height = `${Math.max(0, viewportHeight - top - bottomPadding)}px`;

      if (transcript && composer && header) {
        const transcriptMinimum = cssPixels(
          getComputedStyle(transcript).minHeight
        );

        const outerGap = cssPixels(getComputedStyle(element).rowGap);

        const innerGap = cssPixels(
          getComputedStyle(transcript.parentElement ?? element).rowGap
        );

        element.style.minHeight = `${header.getBoundingClientRect().height + composer.getBoundingClientRect().height + transcriptMinimum + outerGap + innerGap}px`;
      }
    };

    fitViewport();
    const observer = new ResizeObserver(fitViewport);
    observer.observe(parent);

    if (composer) {
      observer.observe(composer);
    }

    if (header) {
      observer.observe(header);
    }

    if (parent.parentElement) {
      observer.observe(parent.parentElement);
    }

    globalThis.addEventListener("resize", fitViewport);
    globalThis.visualViewport?.addEventListener("resize", fitViewport);

    return () => {
      observer.disconnect();
      globalThis.removeEventListener("resize", fitViewport);
      globalThis.visualViewport?.removeEventListener("resize", fitViewport);
    };
  }, [edgeToEdge, threadId]);

  return workspace;
};

export { useChatViewport };

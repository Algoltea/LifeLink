"use client";

import { Button } from "@lifelink/ui/components/button";
import { CheckIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useSyncExternalStore } from "react";

const HIDDEN_KEY = "lifelink:getting-started-hidden";
const HIDDEN_EVENT = "lifelink:getting-started-hidden";

const subscribe = (onChange: () => void) => {
  globalThis.addEventListener("storage", onChange);
  globalThis.addEventListener(HIDDEN_EVENT, onChange);

  return () => {
    globalThis.removeEventListener("storage", onChange);
    globalThis.removeEventListener(HIDDEN_EVENT, onChange);
  };
};

const readHidden = () => globalThis.localStorage.getItem(HIDDEN_KEY) === "1";

// Hidden until the browser can read the saved choice, so the panel never flashes in and out.
const hiddenOnServer = () => true;

/** Whether the person chose to hide the first-run steps on this device. */
const useStepsHidden = () =>
  useSyncExternalStore(subscribe, readHidden, hiddenOnServer);

const hideSteps = () => {
  globalThis.localStorage.setItem(HIDDEN_KEY, "1");
  globalThis.dispatchEvent(new Event(HIDDEN_EVENT));
};

interface Progress {
  asked: boolean;
  connected: boolean;
  location: boolean;
  trusted: boolean;
}

interface Step {
  action: string;
  description: string;
  done: boolean;
  href: Route;
  title: string;
}

const stepsFor = (progress: Progress): Step[] => [
  {
    action: "Connect email",
    description:
      "LifeLink reads it with you and points out anything that looks like a scam.",
    done: progress.connected,
    href: "/connections",
    title: "Connect your email",
  },
  {
    action: "Add a person",
    description:
      "Choose who can help with rides and what they can see. You stay in charge.",
    done: progress.trusted,
    href: "/circle",
    title: "Add someone you trust",
  },
  {
    action: "Ask LifeLink",
    description:
      "Try “Remind me to water the plants at five.” You’ll review anything before it happens.",
    done: progress.asked,
    href: "/ask",
    title: "Ask for a hand",
  },
  {
    action: "Add postal code",
    description:
      "LifeLink shows the weather on Today and next to each appointment.",
    done: progress.location,
    href: "/settings#profile",
    title: "Add your postal code",
  },
];

/** True when a new owner should see the first-run steps. */
const showsGettingStarted = (progress: Progress, hidden: boolean): boolean =>
  !hidden &&
  !(
    progress.asked &&
    progress.connected &&
    progress.location &&
    progress.trusted
  );

const GettingStarted = ({ progress }: { progress: Progress }) => (
  <section aria-labelledby="getting-started-heading" className="flex flex-col">
    <h2
      className="pb-4 text-2xl leading-8 font-semibold"
      id="getting-started-heading"
    >
      Getting started
    </h2>
    <div className="border-border bg-parchment flex flex-col rounded-xl border px-5 pt-2 pb-4 sm:px-6">
      <ol className="flex flex-col">
        {stepsFor(progress).map((step, index) => (
          <li
            className="border-border flex items-start gap-4 border-b py-5"
            key={step.href}
          >
            {step.done ? (
              <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="border-control num flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] font-semibold"
              >
                {index + 1}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="text-xl leading-7 font-medium">{step.title}</h3>
                <p className="text-muted-foreground text-label">
                  {step.description}
                </p>
              </div>
              <div className="flex shrink-0 sm:w-40 sm:justify-end">
                {step.done ? (
                  <span className="text-muted-foreground text-label inline-flex min-h-11 items-center font-medium sm:-mt-2">
                    Done
                  </span>
                ) : (
                  <Link
                    className="text-accent-foreground text-label inline-flex min-h-11 items-center font-medium underline sm:-mt-2"
                    href={step.href}
                  >
                    {step.action}
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-2">
        <p className="text-muted-foreground text-label">
          Each step is marked done when you finish it.
        </p>
        <Button onClick={hideSteps} variant="link">
          Hide these steps
        </Button>
      </div>
    </div>
  </section>
);

export { GettingStarted, showsGettingStarted, useStepsHidden };

import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { cn } from "@lifelink/ui/lib/utils";
import {
  AlertTriangleIcon,
  BellIcon,
  CalendarPlusIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  FilePlusIcon,
  MailIcon,
  MessageCircleIcon,
  MinusIcon,
  SendIcon,
  ShoppingBasketIcon,
  UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { useLocale, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

type Step = Pick<
  Doc<"taskSteps">,
  "_id" | "detail" | "kind" | "label" | "status"
>;

/** Every kind of step has its own engraved mark, so sending never looks like a reply or a reminder. */
const markFor = (kind: Step["kind"], className: string): ReactNode => {
  switch (kind) {
    case "send_message": {
      return <SendIcon aria-hidden="true" className={className} />;
    }

    case "await_reply": {
      return <MessageCircleIcon aria-hidden="true" className={className} />;
    }

    case "confirm_arrangement": {
      return <CircleCheckIcon aria-hidden="true" className={className} />;
    }

    case "create_reminder": {
      return <BellIcon aria-hidden="true" className={className} />;
    }

    case "family_update": {
      return <UsersIcon aria-hidden="true" className={className} />;
    }

    case "grocery_handoff": {
      return <ShoppingBasketIcon aria-hidden="true" className={className} />;
    }

    case "email_draft": {
      return <MailIcon aria-hidden="true" className={className} />;
    }

    case "calendar_event": {
      return <CalendarPlusIcon aria-hidden="true" className={className} />;
    }

    case "drive_note": {
      return <FilePlusIcon aria-hidden="true" className={className} />;
    }

    default: {
      return kind satisfies never;
    }
  }
};

const isCurrent = (status: Step["status"]): boolean =>
  status === "awaiting_approval" ||
  status === "running" ||
  status === "waiting";

const Station = ({ compact, step }: { compact: boolean; step: Step }) => {
  const done = step.status === "succeeded";
  const current = isCurrent(step.status);
  const iconClass = compact ? "size-[18px]" : "size-6";
  let mark: ReactNode = markFor(step.kind, iconClass);

  if (step.status === "failed") {
    mark = <AlertTriangleIcon aria-hidden="true" className={iconClass} />;
  } else if (step.status === "unknown") {
    mark = <CircleHelpIcon aria-hidden="true" className={iconClass} />;
  } else if (step.status === "skipped") {
    mark = <MinusIcon aria-hidden="true" className={iconClass} />;
  }

  return (
    <div
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center rounded-full",
        compact ? "size-10" : "size-14",
        done && "border-brass bg-accent-foreground text-raised border-2",
        current && "border-foreground bg-raised text-foreground border-4",
        step.status === "pending" &&
          "border-brass bg-background text-brass-ink border-2",
        step.status === "skipped" &&
          "border-control bg-background text-muted-foreground border-2 border-dashed",
        step.status === "failed" &&
          "border-negative bg-negative-wash text-negative border-2",
        step.status === "unknown" &&
          "border-warning-edge bg-warning-wash text-warning border-2"
      )}
    >
      {mark}
    </div>
  );
};

/**
 * Progress uses readable stacked steps on phones and a connected row on wider
 * screens. The current step has an ink outline and an explicit status.
 */
const JourneyGauge = ({
  compact = false,
  orientation = "horizontal",
  steps,
}: {
  compact?: boolean;
  orientation?: "horizontal" | "vertical";
  steps: Step[];
}) => {
  const t = useMessages().tasks;
  const locale = useLocale();
  const STATUS_WORDS = t.steps;

  const label = (step: Step): string =>
    translateServerMessage(step.label, locale);

  const detail = (step: Step): string | null =>
    step.detail === null || step.detail === undefined
      ? null
      : translateServerMessage(step.detail, locale);

  const doneCount = steps.findIndex(
    (step) => step.status !== "succeeded" && step.status !== "skipped"
  );

  const finished = doneCount === -1 ? steps.length : doneCount;
  const spacing = steps.length > 1 ? 100 / steps.length : 100;

  const doneWidth =
    steps.length > 1
      ? Math.max(0, Math.min(finished, steps.length - 1)) * spacing
      : 0;

  if (orientation === "vertical") {
    return (
      <ol aria-label={t.progress} className="relative flex flex-col">
        <span
          aria-hidden="true"
          className="bg-brass/50 absolute top-7 bottom-7 left-[1.375rem] w-0.5"
        />
        {steps.map((step) => (
          <li
            className="relative flex min-h-[4.5rem] items-center gap-4"
            key={step._id}
          >
            <Station compact step={step} />
            <span className="flex flex-col">
              <span className="text-lg">{label(step)}</span>
              <span className="text-muted-foreground text-base">
                {detail(step) ?? STATUS_WORDS[step.status]}
              </span>
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      aria-label={t.progress}
      className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-3"
    >
      <span
        aria-hidden="true"
        className={cn(
          "bg-brass/55 absolute hidden h-0.5 sm:block",
          compact ? "top-5" : "top-7"
        )}
        style={{ left: `${spacing / 2}%`, right: `${spacing / 2}%` }}
      />
      <span
        aria-hidden="true"
        className={cn(
          "bg-accent-foreground absolute hidden h-1 rounded-full sm:block",
          compact ? "top-[1.125rem]" : "top-[1.625rem]"
        )}
        style={{ left: `${spacing / 2}%`, width: `${doneWidth}%` }}
      />
      {steps.map((step) => {
        const current = isCurrent(step.status);

        return (
          <li
            className="flex min-w-0 items-start gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
            key={step._id}
          >
            <Station compact={compact} step={step} />
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:items-center">
              <span
                className={cn(
                  "leading-snug",
                  compact ? "text-sm font-semibold" : "text-base font-bold"
                )}
              >
                {label(step)}
              </span>
              {compact ? null : (
                <span
                  className={cn(
                    "text-base leading-snug sm:line-clamp-2",
                    current
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {step.status === "succeeded" || step.status === "skipped"
                    ? (detail(step) ?? STATUS_WORDS[step.status])
                    : STATUS_WORDS[step.status]}
                </span>
              )}
              <span className="sr-only">{`${label(step)}: ${STATUS_WORDS[step.status]}.`}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export { JourneyGauge };

export type { Step };

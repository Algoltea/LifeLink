"use client";

import { Button } from "@lifelink/ui/components/button";
import { useState } from "react";
import type { ReactNode } from "react";

interface Step {
  content: ReactNode;
  key: string;
}

/**
 * Shows a list one item at a time, for people who chose "One step at a time"
 * in Settings. Everything stays one press away with "Show everything".
 */
const OneAtATime = ({ noun, steps }: { noun: string; steps: Step[] }) => {
  const [index, setIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (steps.length === 0) {
    return null;
  }

  if (showAll || steps.length === 1) {
    return (
      <div className="flex flex-col gap-5">
        {steps.map((step) => (
          <div key={step.key}>{step.content}</div>
        ))}
      </div>
    );
  }

  const position = Math.min(index, steps.length - 1);
  const current = steps[position];
  const last = position === steps.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <p aria-live="polite" className="text-muted-foreground text-base">
        {noun} {position + 1} of {steps.length}
      </p>
      {current?.content}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={position === 0}
          onClick={() => setIndex(position - 1)}
          variant="outline"
        >
          Back
        </Button>
        <Button disabled={last} onClick={() => setIndex(position + 1)}>
          Next
        </Button>
        <Button onClick={() => setShowAll(true)} variant="ghost">
          Show everything
        </Button>
      </div>
    </div>
  );
};

export { OneAtATime };

export type { Step };

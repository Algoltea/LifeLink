"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { cn } from "@lifelink/ui/lib/utils";

interface SegmentedOption<Value extends string> {
  label: string;
  value: Value;
}

interface SegmentedProps<Value extends string> {
  className?: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: Value) => void;
  options: readonly SegmentedOption<Value>[];
  value: Value;
}

// A radio group drawn as a segmented control: as wide as its options.
const Segmented = <Value extends string>({
  className,
  disabled = false,
  label,
  onValueChange,
  options,
  value,
}: SegmentedProps<Value>) => (
  <RadioGroup
    aria-label={label}
    disabled={disabled}
    className={cn(
      "border-border bg-parchment inline-flex w-full max-w-full flex-wrap gap-1 rounded-lg border p-1 sm:w-fit",
      className
    )}
    onValueChange={(next) => {
      const match = options.find((option) => option.value === next);

      if (match) {
        onValueChange(match.value);
      }
    }}
    value={value}
  >
    {options.map((option) => (
      <Radio.Root
        className="text-foreground data-unchecked:hover:bg-neutral-wash data-checked:bg-primary data-checked:text-primary-foreground data-checked:hover:bg-primary-hover text-label min-h-control inline-flex min-w-12 flex-1 items-center justify-center rounded-md px-4 py-2 font-medium transition-colors sm:flex-none"
        key={option.value}
        value={option.value}
      >
        {option.label}
      </Radio.Root>
    ))}
  </RadioGroup>
);

export { Segmented };

export type { SegmentedOption };

"use client";

import { Combobox } from "@base-ui/react/combobox";
import {
  groceryUnit,
  groceryUnitMatches,
  groceryUnits,
} from "@lifelink/contracts/groceries";
import type { GroceryUnitChoice } from "@lifelink/contracts/groceries";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

const unitLabel = (choice: GroceryUnitChoice) => choice.label;

const sameUnit = (a: GroceryUnitChoice, b: GroceryUnitChoice) =>
  a.value === b.value;

// Typing filters the list live; Enter picks the first match.
const UnitSelect = ({
  id,
  value,
  onValueChange,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <Combobox.Root
    autoHighlight
    filter={groceryUnitMatches}
    isItemEqualToValue={sameUnit}
    items={groceryUnits}
    itemToStringLabel={unitLabel}
    onValueChange={(next) => {
      if (next !== null) {
        onValueChange(next.value);
      }
    }}
    value={groceryUnit(value) ?? null}
  >
    <div className="relative">
      <Combobox.Input
        className="border-control bg-raised text-foreground hover:border-foreground min-h-control w-full min-w-0 rounded-md border py-2 pr-12 pl-4 text-base transition-colors"
        id={id}
        onFocus={(event) => event.currentTarget.select()}
        placeholder="Type to search"
      />
      <Combobox.Trigger
        aria-label="Show all units"
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-12 items-center justify-center"
      >
        <ChevronDownIcon aria-hidden="true" className="size-5" />
      </Combobox.Trigger>
    </div>
    <Combobox.Portal>
      <Combobox.Positioner
        align="start"
        className="z-50"
        collisionPadding={12}
        sideOffset={6}
      >
        <Combobox.Popup className="border-control bg-raised text-foreground w-[var(--anchor-width)] max-w-[var(--available-width)] overflow-hidden rounded-md border shadow-lg">
          <Combobox.Empty className="text-muted-foreground px-4 py-3 text-base empty:hidden">
            No matching unit.
          </Combobox.Empty>
          <Combobox.List className="max-h-[min(calc(var(--spacing-control)*6),calc(var(--available-height)-2px))] overflow-y-auto overscroll-contain empty:hidden">
            {(choice: GroceryUnitChoice) => (
              <Combobox.Item
                className="min-h-control data-highlighted:bg-neutral-wash relative flex cursor-pointer items-center py-2 pr-10 pl-4 text-base outline-none"
                key={choice.value}
                value={choice}
              >
                {choice.label}
                <Combobox.ItemIndicator className="absolute right-3">
                  <CheckIcon aria-hidden="true" className="size-5" />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
);

export { UnitSelect };

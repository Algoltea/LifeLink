"use client";

import { Combobox } from "@base-ui/react/combobox";
import { groceryUnit, groceryUnits } from "@lifelink/contracts/groceries";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { useMessages } from "@/i18n/locale";

/** A unit as offered here: its label in the person's language, still found by its English words. */
interface UnitChoice {
  aliases: readonly string[];
  label: string;
  value: string;
}

const unitLabel = (choice: UnitChoice) => choice.label;

const sameUnit = (a: UnitChoice, b: UnitChoice) => a.value === b.value;

/** Case-insensitive match on a unit's label, stored value, or aliases. */
const unitMatches = (choice: UnitChoice, query: string) => {
  const needle = query.trim().toLocaleLowerCase();

  return (
    needle.length === 0 ||
    [choice.label, choice.value, ...choice.aliases].some((term) =>
      term.toLocaleLowerCase().includes(needle)
    )
  );
};

// Typing filters the list live; Enter picks the first match.
const UnitSelect = ({
  id,
  value,
  onValueChange,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const t = useMessages().groceries;

  // Labels in the person's language; the English words stay searchable as aliases.
  const units: UnitChoice[] = groceryUnits.map((choice) => ({
    aliases: [...choice.aliases, choice.label],
    label: t.units[choice.value]?.label ?? choice.label,
    value: choice.value,
  }));

  const selected = groceryUnit(value);

  return (
    <Combobox.Root
      autoHighlight
      filter={unitMatches}
      isItemEqualToValue={sameUnit}
      items={units}
      itemToStringLabel={unitLabel}
      onValueChange={(next) => {
        if (next !== null) {
          onValueChange(next.value);
        }
      }}
      value={
        selected === undefined
          ? null
          : (units.find((choice) => choice.value === selected.value) ?? null)
      }
    >
      <div className="relative">
        <Combobox.Input
          className="border-control bg-raised text-foreground hover:border-foreground min-h-control w-full min-w-0 rounded-md border py-2 pr-12 pl-4 text-base transition-colors"
          id={id}
          onFocus={(event) => event.currentTarget.select()}
          placeholder={t.typeToSearch}
        />
        <Combobox.Trigger
          aria-label={t.showAllUnits}
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
              {t.noMatchingUnit}
            </Combobox.Empty>
            <Combobox.List className="max-h-[min(calc(var(--spacing-control)*6),calc(var(--available-height)-2px))] overflow-y-auto overscroll-contain empty:hidden">
              {(choice: UnitChoice) => (
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
};

export { UnitSelect };

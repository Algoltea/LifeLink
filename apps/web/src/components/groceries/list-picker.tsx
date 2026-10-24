"use client";

import { Select } from "@base-ui/react/select";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  StarIcon,
} from "lucide-react";

import { formatShortDay, money } from "@/lib/format";

/** Rows follow the app's text size, unlike a phone's built-in picker. */
const ITEM =
  "min-h-control data-[highlighted]:bg-neutral-wash grid cursor-default grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-md px-3 py-2 outline-none select-none";

const GROUP_LABEL =
  "text-muted-foreground text-label px-3 pt-2 pb-1 font-semibold";

const totalOf = (list: Doc<"groceryLists">): number =>
  list.items.reduce((total, item) => total + (item.estimatedCents ?? 0), 0);

const countOf = (list: Doc<"groceryLists">): string =>
  `${list.items.length} ${list.items.length === 1 ? "item" : "items"}`;

/** The menu stays about one screen tall; older trips live on the past lists page. */
const PAST_IN_MENU = 3;

/** Not a list id, so choosing it can never select a list. */
const SEE_ALL_PAST = "see-all-past";

const ListOption = ({
  details,
  list,
}: {
  details: string;
  list: Doc<"groceryLists">;
}) => (
  <Select.Item className={ITEM} value={list._id}>
    <Select.ItemIndicator className="col-start-1">
      <CheckIcon aria-hidden="true" className="size-5" />
    </Select.ItemIndicator>
    <span className="col-start-2 flex min-w-0 flex-col">
      <Select.ItemText className="text-lg font-medium break-words">
        {list.name}
      </Select.ItemText>
      <span className="text-muted-foreground text-base">{details}</span>
    </span>
    {/* The star shows here, in the open list, but not on the closed button. */}
    {list.usual ? (
      <span className="col-start-3">
        <StarIcon aria-hidden="true" className="size-5 fill-current" />
        <span className="sr-only">, your usual list</span>
      </span>
    ) : null}
  </Select.Item>
);

/**
 * One dropdown for every list: current lists first, finished trips below.
 * The same control on every screen size, so there is one thing to learn.
 */
const ListPicker = ({
  current,
  onChoose,
  onSeeAllPast,
  past,
  selectedId,
  timeZone,
}: {
  current: Doc<"groceryLists">[];
  onChoose: (listId: Id<"groceryLists">) => void;
  onSeeAllPast: () => void;
  past: Doc<"groceryLists">[];
  selectedId: Id<"groceryLists"> | null;
  timeZone: string;
}) => {
  const all = [...current, ...past];

  if (all.length === 0) {
    return null;
  }

  const selected = all.find((item) => item._id === selectedId) ?? null;

  return (
    <Select.Root
      onValueChange={(value) => {
        if (value === SEE_ALL_PAST) {
          onSeeAllPast();

          return;
        }

        const next = all.find((item) => item._id === value);

        if (next) {
          onChoose(next._id);
        }
      }}
      value={selectedId}
    >
      <div className="flex max-w-xl flex-col gap-1.5">
        <Select.Label className="text-muted-foreground text-label font-medium">
          Switch lists, or open a past trip
        </Select.Label>
        <Select.Trigger className="border-control bg-raised hover:border-foreground data-[popup-open]:border-foreground min-h-control flex w-full items-center justify-between gap-3 rounded-md border px-4 py-2 text-left text-lg transition-colors">
          <Select.Value className="min-w-0 break-words">
            {() =>
              selected === null ? (
                "Choose a list"
              ) : (
                <>
                  {selected.name}
                  {selected.archivedAt === undefined ? null : (
                    <span className="text-muted-foreground">
                      {" "}
                      · finished {formatShortDay(selected.archivedAt, timeZone)}
                    </span>
                  )}
                </>
              )
            }
          </Select.Value>
          <Select.Icon className="text-muted-foreground shrink-0">
            <ChevronsUpDownIcon aria-hidden="true" className="size-5" />
          </Select.Icon>
        </Select.Trigger>
      </div>
      <Select.Portal>
        <Select.Positioner
          align="start"
          alignItemWithTrigger={false}
          className="z-50"
          sideOffset={8}
        >
          <Select.Popup className="border-border bg-raised flex max-h-[min(32rem,var(--available-height))] w-[var(--anchor-width)] min-w-[min(20rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-xl border p-1.5 shadow-[0_1px_2px_rgb(45_33_24/0.05),0_12px_32px_rgb(45_33_24/0.12)] outline-none">
            {current.length > 0 ? (
              <Select.Group>
                <Select.GroupLabel className={GROUP_LABEL}>
                  Current lists
                </Select.GroupLabel>
                {current.map((item) => {
                  const inCart = item.items.filter((row) => row.checked).length;

                  return (
                    <ListOption
                      details={
                        inCart > 0
                          ? `${countOf(item)} · ${inCart} in your cart`
                          : countOf(item)
                      }
                      key={item._id}
                      list={item}
                    />
                  );
                })}
              </Select.Group>
            ) : null}
            {current.length > 0 && past.length > 0 ? (
              <Select.Separator className="bg-border my-1.5 h-px" />
            ) : null}
            {past.length > 0 ? (
              <Select.Group>
                <Select.GroupLabel className={GROUP_LABEL}>
                  Past lists
                </Select.GroupLabel>
                {past.slice(0, PAST_IN_MENU).map((item) => (
                  <ListOption
                    details={`Finished ${formatShortDay(item.archivedAt ?? item.updatedAt, timeZone)} · ${countOf(item)} · ${money(totalOf(item))}`}
                    key={item._id}
                    list={item}
                  />
                ))}
                <Select.Item className={ITEM} value={SEE_ALL_PAST}>
                  <span className="col-start-2 flex min-w-0 flex-col">
                    <Select.ItemText className="text-lg font-medium">
                      See all past lists ({past.length})
                    </Select.ItemText>
                    <span className="text-muted-foreground text-base">
                      Search, reuse, or delete finished trips
                    </span>
                  </span>
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="col-start-3 size-5"
                  />
                </Select.Item>
              </Select.Group>
            ) : null}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};

export { ListPicker };

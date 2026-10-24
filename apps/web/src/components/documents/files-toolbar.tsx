"use client";

import { Input } from "@lifelink/ui/components/input";
import { cn } from "@lifelink/ui/lib/utils";
import { ArrowDownUpIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useId } from "react";

const SORTS = [
  { label: "Recently changed", value: "recent" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name, A to Z", value: "name_asc" },
  { label: "Name, Z to A", value: "name_desc" },
  { label: "Folders first", value: "folders_first" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

const isSort = (value: string): value is Sort =>
  SORTS.some((sort) => sort.value === value);

/**
 * A file browser's toolbar: find by name and change the order, on one line.
 * "Searching…" sits inside the field, so it never pushes the files down.
 */
const FilesToolbar = ({
  className,
  input,
  onInput,
  onSort,
  onSubmit,
  pending,
  sort,
}: {
  className?: string;
  input: string;
  onInput: (value: string) => void;
  onSort: (sort: Sort) => void;
  onSubmit: () => void;
  pending: boolean;
  sort: Sort;
}) => {
  const searchId = useId();
  const sortId = useId();

  return (
    <search className={cn("flex flex-wrap items-center gap-3", className)}>
      <form
        className="relative flex min-w-0 flex-1 basis-64 items-center"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="sr-only" htmlFor={searchId}>
          Find a file by name
        </label>
        <SearchIcon
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-4 size-5"
        />
        <Input
          className="pr-32 pl-12"
          id={searchId}
          onChange={(event) => onInput(event.target.value)}
          placeholder="Find a file by name"
          type="search"
          value={input}
        />
        <p
          aria-live="polite"
          className="text-muted-foreground text-label pointer-events-none absolute right-4"
        >
          {pending ? "Searching…" : ""}
        </p>
      </form>
      <div className="relative flex shrink-0 items-center">
        <span className="text-muted-foreground pointer-events-none absolute left-3.5 flex items-center gap-2">
          <ArrowDownUpIcon aria-hidden="true" className="size-5" />
          <label className="text-label" htmlFor={sortId}>
            Sort
          </label>
        </span>
        <select
          className="border-control bg-raised text-foreground text-label hover:border-foreground min-h-control cursor-pointer appearance-none rounded-md border py-2 pr-11 pl-[5.25rem] font-semibold transition-colors"
          id={sortId}
          onChange={(event) => {
            if (isSort(event.target.value)) {
              onSort(event.target.value);
            }
          }}
          value={sort}
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="text-foreground pointer-events-none absolute right-3.5 size-5"
        />
      </div>
    </search>
  );
};

export { FilesToolbar };

export type { Sort };

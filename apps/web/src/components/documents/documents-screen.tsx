"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { cn } from "@lifelink/ui/lib/utils";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useAction, useQuery } from "convex/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, ErrorNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { FilePreview } from "./file-preview";
import type { DriveFile, Listing } from "./file-preview";

/** How long typing must pause before the list filters. */
const SEARCH_DELAY_MS = 350;

/** Start loading the next files when this few unseen rows remain. */
const LOAD_AHEAD_ROWS = 6;

/** A first guess at a row's height; each row is measured once drawn. */
const ESTIMATED_ROW_HEIGHT = 110;

/** Rows drawn beyond the screen, so scrolling and Tab never land on a gap. */
const OVERSCAN_ROWS = 8;

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

type Browse =
  | { kind: "error"; message: string }
  | { kind: "loading" }
  | {
      files: DriveFile[];
      kind: "ready";
      mode: Listing["mode"];
      more: "error" | "idle" | "loading";
      nextCursor: string | null;
    };

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const searchTermOf = (input: string): string | null => {
  const trimmed = input.trim();

  return trimmed.length === 0 ? null : trimmed;
};

/** Hover and selection match the sidebar menu. */
const FileRow = ({
  file,
  isSelected,
  onSelect,
  timeZone,
}: {
  file: DriveFile;
  isSelected: boolean;
  onSelect: () => void;
  timeZone: string;
}) => (
  <button
    aria-current={isSelected ? "true" : undefined}
    className={cn(
      "bg-background text-foreground hover:bg-neutral-wash hover:text-foreground focus-visible:outline-ring flex w-full min-w-0 items-center justify-between gap-3 rounded-md px-3 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
      isSelected && "bg-neutral-wash"
    )}
    onClick={onSelect}
    type="button"
  >
    <span className="flex min-w-0 flex-col gap-1">
      <span
        className={cn(
          "text-lg wrap-anywhere",
          isSelected && "text-accent-foreground font-semibold"
        )}
      >
        {file.name}
      </span>
      <span className="text-muted-foreground text-base">
        {file.kind}
        {file.modifiedAt === null ? "" : ` · ${ago(file.modifiedAt, timeZone)}`}
      </span>
    </span>
    <ChevronRightIcon
      aria-hidden="true"
      className={cn(
        "size-5 shrink-0",
        isSelected ? "text-accent-foreground" : "text-muted-foreground"
      )}
    />
  </button>
);

/** The end of the list: loading, a retry after a failure, or the final count. */
const ListEnd = ({
  browse,
  onLoadMore,
}: {
  browse: Extract<Browse, { kind: "ready" }>;
  onLoadMore: () => void;
}) => {
  if (browse.more === "error") {
    return (
      <ErrorNote onRetry={onLoadMore}>
        The next files could not be loaded.
      </ErrorNote>
    );
  }

  if (browse.more === "loading") {
    return <LoadingRows label="Loading more files" rows={2} />;
  }

  if (browse.nextCursor === null) {
    return (
      <p className="text-muted-foreground border-rule border-t pt-4 text-base">
        {browse.files.length === 1
          ? "That is the only file."
          : `That is all ${browse.files.length} files.`}
      </p>
    );
  }

  return null;
};

/**
 * Draws only the rows near the screen, so a Drive with thousands of files
 * stays quick. Rows are measured as they render because long names wrap.
 */
const VirtualFileList = ({
  browse,
  onLoadMore,
  onSelect,
  selectedId,
  timeZone,
}: {
  browse: Extract<Browse, { kind: "ready" }>;
  onLoadMore: () => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
  timeZone: string;
}) => {
  // The virtualizer mutates its own state; React Compiler memoization would hide those updates.
  "use no memo";

  const list = useRef<HTMLUListElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const { files } = browse;

  // The list scrolls with the page, so the virtualizer needs to know how far
  // down the page it starts. Content above it can change height at any time.
  useEffect(() => {
    const measure = () => {
      const top = list.current?.getBoundingClientRect().top;

      if (top !== undefined) {
        setScrollMargin(top + window.scrollY);
      }
    };

    const observer = new ResizeObserver(measure);

    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  // oxlint-disable-next-line react/incompatible-library -- This component opts out of compiler memoization ("use no memo") and passes nothing from the virtualizer to memoized children.
  const virtualizer = useWindowVirtualizer({
    count: files.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    getItemKey: (index) => files[index]?.id ?? index,
    overscan: OVERSCAN_ROWS,
    scrollMargin,
  });

  const rows = virtualizer.getVirtualItems();
  const lastDrawn = rows.at(-1)?.index ?? -1;
  const canLoadMore = browse.nextCursor !== null && browse.more === "idle";

  useEffect(() => {
    if (canLoadMore && lastDrawn >= files.length - LOAD_AHEAD_ROWS) {
      onLoadMore();
    }
  }, [canLoadMore, files.length, lastDrawn, onLoadMore]);

  return (
    <ul
      aria-label="Your Drive files"
      className="relative"
      ref={list}
      style={{ height: virtualizer.getTotalSize() }}
    >
      {rows.map((row) => {
        const file = files[row.index];

        return file === undefined ? null : (
          <li
            aria-posinset={row.index + 1}
            aria-setsize={browse.nextCursor === null ? files.length : -1}
            className="border-rule absolute top-0 left-0 w-full border-t"
            data-index={row.index}
            key={row.key}
            ref={virtualizer.measureElement}
            style={{
              transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            <FileRow
              file={file}
              isSelected={file.id === selectedId}
              onSelect={() => onSelect(file.id)}
              timeZone={timeZone}
            />
          </li>
        );
      })}
    </ul>
  );
};

/** One search-and-sort view of the Drive, growing as the person scrolls. */
const FileBrowser = ({
  search,
  sort,
  timeZone,
}: {
  search: string | null;
  sort: Sort;
  timeZone: string;
}) => {
  const listFiles = useAction(api.drive.files);
  const [browse, setBrowse] = useState<Browse>({ kind: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const loadingMore = useRef(false);

  useEffect(() => {
    let current = true;

    const loadFirstFiles = async () => {
      try {
        const listing = await listFiles({ cursor: null, search, sort });

        if (current) {
          setBrowse({
            files: listing.files,
            kind: "ready",
            mode: listing.mode,
            more: "idle",
            nextCursor: listing.nextCursor,
          });
        }
      } catch (error) {
        if (current) {
          setBrowse({ kind: "error", message: errorText(error) });
        }
      }
    };

    void loadFirstFiles();

    return () => {
      current = false;
    };
  }, [listFiles, search, sort]);

  const cursor = browse.kind === "ready" ? browse.nextCursor : null;

  const loadMore = useCallback(async () => {
    if (cursor === null || loadingMore.current) {
      return;
    }

    loadingMore.current = true;
    setBrowse((previous) =>
      previous.kind === "ready" ? { ...previous, more: "loading" } : previous
    );

    try {
      const listing = await listFiles({ cursor, search, sort });

      setBrowse((previous) => {
        if (previous.kind !== "ready") {
          return previous;
        }

        const seen = new Set(previous.files.map((file) => file.id));

        return {
          ...previous,
          files: [
            ...previous.files,
            ...listing.files.filter((file) => !seen.has(file.id)),
          ],
          more: "idle",
          nextCursor: listing.nextCursor,
        };
      });
      loadingMore.current = false;
    } catch {
      loadingMore.current = false;
      setBrowse((previous) =>
        previous.kind === "ready" ? { ...previous, more: "error" } : previous
      );
    }
  }, [cursor, listFiles, search, sort]);

  if (browse.kind === "loading") {
    return <LoadingRows label="Loading your Drive files" rows={6} />;
  }

  if (browse.kind === "error") {
    return <ErrorNote>{browse.message}</ErrorNote>;
  }

  const selected = browse.files.find((file) => file.id === selectedId) ?? null;

  const isPractice = browse.mode === "simulated";

  return (
    <div className="flex flex-col gap-4">
      {isPractice ? (
        <p className="text-muted-foreground max-w-prose text-base">
          This is a practice Drive with sample files. Notes you save to Drive in
          Practice mode appear here too. Nothing comes from a real Google
          account.
        </p>
      ) : null}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section
          aria-labelledby="files-heading"
          className={cn(
            "min-w-0 flex-col gap-3",
            selected === null ? "flex" : "hidden lg:flex"
          )}
        >
          <h2 className="text-2xl font-semibold" id="files-heading">
            {search === null ? "Your files" : "Files found"}
          </h2>
          {browse.files.length === 0 ? (
            <EmptyNote>
              {search === null
                ? "Your Google Drive has no files yet."
                : `No file names contain “${search}”.`}
            </EmptyNote>
          ) : (
            <>
              <VirtualFileList
                browse={browse}
                onLoadMore={loadMore}
                onSelect={setSelectedId}
                selectedId={selectedId}
                timeZone={timeZone}
              />
              <ListEnd browse={browse} onLoadMore={loadMore} />
            </>
          )}
        </section>
        {selected === null ? (
          <EmptyNote className="hidden lg:mt-12 lg:flex">
            Choose a file to see a preview of it here.
          </EmptyNote>
        ) : (
          <div className="flex min-w-0 flex-col gap-4">
            <Button
              className="hover:bg-surface hover:text-foreground self-start rounded-md lg:hidden"
              onClick={() => setSelectedId(null)}
              variant="outline"
            >
              <ChevronLeftIcon />
              Back to your files
            </Button>
            <FilePreview
              file={selected}
              isPractice={isPractice}
              key={selected.id}
              timeZone={timeZone}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DriveFiles = ({ timeZone }: { timeZone: string }) => {
  const searchId = useId();
  const sortId = useId();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("recent");
  const pending = searchTermOf(input) !== search;

  // Filter once typing pauses, so each keystroke does not start a new search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTermOf(input));
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [input]);

  return (
    <div className="flex flex-col gap-4">
      <search>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchTermOf(input));
          }}
        >
          <div className="flex min-w-64 flex-[2] flex-col gap-2">
            <Label htmlFor={searchId}>Find a file by name</Label>
            <Input
              id={searchId}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Start typing, for example: medication"
              type="search"
              value={input}
            />
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-2">
            <Label htmlFor={sortId}>Sort by</Label>
            <select
              className="border-control bg-raised text-foreground hover:border-foreground min-h-control w-full min-w-0 rounded-md border px-4 py-2 text-base transition-colors"
              id={sortId}
              onChange={(event) => {
                if (isSort(event.target.value)) {
                  setSort(event.target.value);
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
          </div>
        </form>
      </search>
      <p aria-live="polite" className="text-muted-foreground min-h-7 text-base">
        {pending ? "Searching…" : ""}
      </p>
      <FileBrowser
        key={`${sort}:${search ?? ""}`}
        search={search}
        sort={sort}
        timeZone={timeZone}
      />
    </div>
  );
};

const DocumentsScreen = () => {
  const connections = useQuery(api.connections.list);
  const { me } = usePreferences();
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  const drive = connections?.providers.find(
    (provider) => provider.definition.id === "google_drive"
  );

  return (
    <>
      <PageHeader
        subline="Find the files you keep in Google Drive and preview them here. Open any file in Google Drive to read, change, or share it."
        title="Documents"
      />
      {connections === undefined ? (
        <LoadingRows label="Checking your Google Drive connection" rows={2} />
      ) : null}
      {connections !== undefined && drive?.status !== "active" ? (
        <EmptyNote
          action={
            <Link
              className="text-foreground inline-flex min-h-12 items-center font-semibold underline underline-offset-4"
              href="/connections"
            >
              {drive?.status === "error" || drive?.status === "expired"
                ? "Reconnect Google Drive"
                : "Connect Google Drive"}
            </Link>
          }
        >
          {connections.demoMode
            ? "Connect the practice Google Drive to try this with sample files."
            : "Connect Google Drive to see your files here."}
        </EmptyNote>
      ) : null}
      {drive?.status === "active" ? <DriveFiles timeZone={timeZone} /> : null}
    </>
  );
};

export { DocumentsScreen };

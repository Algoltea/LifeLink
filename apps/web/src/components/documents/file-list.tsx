"use client";

import { cn } from "@lifelink/ui/lib/utils";
import { measureElement, useWindowVirtualizer } from "@tanstack/react-virtual";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";

import { IsoIcon, fileIconFor } from "@/components/app/iso-icon";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { listTime } from "@/components/email/email-bits";
import { useLocale, useMessages } from "@/i18n/locale";
import { formatWhen } from "@/lib/format";

import type { DriveFile, Listing } from "./file-preview";

/** Start loading the next files when this few unseen rows remain. */
const LOAD_AHEAD_ROWS = 6;

/**
 * A row is one line of name and one of type, so this is close to exact at
 * the default text size; each row is still measured once drawn, so larger
 * text sizes stay correct.
 */
const ESTIMATED_ROW_HEIGHT = 84;

/** Rows drawn beyond the screen, so scrolling and Tab never land on a gap. */
const OVERSCAN_ROWS = 8;

const FILE_ICON_SIZE = 40;

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

type ReadyBrowse = Extract<Browse, { kind: "ready" }>;

/**
 * On a phone the list is hidden while a file is open, and a hidden row
 * measures 0 tall. Keep its last real size, so returning to the list doesn't
 * collapse the rows and throw the scroll position.
 */
const measureShownRow = (
  element: HTMLLIElement,
  entry: ResizeObserverEntry | undefined,
  instance: Virtualizer<Window, HTMLLIElement>
): number => {
  if (element.offsetParent === null) {
    const key = instance.options.getItemKey(instance.indexFromElement(element));

    return instance.itemSizeCache.get(key) ?? ESTIMATED_ROW_HEIGHT;
  }

  return measureElement(element, entry, instance);
};

/** Compact like the inbox: what kind, what it's called, and when it changed. */
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
}) => {
  const locale = useLocale();
  const t = useMessages().documents;

  return (
    <button
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "text-foreground hover:bg-parchment flex w-full min-w-0 items-center gap-3.5 rounded-lg px-3 py-3 text-left transition-colors",
        isSelected && "bg-neutral-wash hover:bg-neutral-wash"
      )}
      data-file-id={file.id}
      onClick={onSelect}
      type="button"
    >
      <IsoIcon
        className="shrink-0"
        kind={fileIconFor(file.kind)}
        size={FILE_ICON_SIZE}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-body truncate font-semibold">{file.name}</span>
          {file.modifiedAt === null ? null : (
            <time
              className="text-muted-foreground shrink-0 text-sm whitespace-nowrap"
              dateTime={new Date(file.modifiedAt).toISOString()}
              title={t.changedAt(formatWhen(file.modifiedAt, timeZone, locale))}
            >
              <span className="sr-only">{t.changedSr}</span>
              {listTime(file.modifiedAt, timeZone, undefined, locale)}
            </time>
          )}
        </span>
        <span className="text-muted-foreground text-label truncate">
          <span className="sr-only">, </span>
          {t.kinds[file.kind] ?? file.kind}
        </span>
      </span>
    </button>
  );
};

/** The end of the list: loading, a retry after a failure, or the final count. */
const ListEnd = ({
  browse,
  onLoadMore,
}: {
  browse: ReadyBrowse;
  onLoadMore: () => void;
}) => {
  const t = useMessages().documents;

  if (browse.more === "error") {
    return <ErrorNote onRetry={onLoadMore}>{t.moreFailed}</ErrorNote>;
  }

  if (browse.more === "loading") {
    return <LoadingRows layout="files" label={t.loadingMore} rows={2} />;
  }

  if (browse.nextCursor === null) {
    return (
      <p className="text-muted-foreground text-label px-3 pt-3">
        {t.fileCountAll(browse.files.length)}
      </p>
    );
  }

  return null;
};

/**
 * Draws only the rows near the screen, so a Drive with thousands of files
 * stays quick.
 */
const VirtualFileList = ({
  browse,
  onLoadMore,
  onSelect,
  selectedId,
  timeZone,
}: {
  browse: ReadyBrowse;
  onLoadMore: () => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
  timeZone: string;
}) => {
  // The virtualizer mutates its own state; React Compiler memoization would hide those updates.
  "use no memo";

  const list = useRef<HTMLUListElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const t = useMessages().documents;
  const { files } = browse;

  // The list scrolls with the page, so the virtualizer needs to know how far
  // down the page it starts. Content above it can change height at any time.
  useEffect(() => {
    const measure = () => {
      const node = list.current;

      // A hidden list has no position; keep the last one until it shows again.
      if (node && node.offsetParent !== null) {
        setScrollMargin(node.getBoundingClientRect().top + window.scrollY);
      }
    };

    const observer = new ResizeObserver(measure);

    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  // oxlint-disable-next-line react/incompatible-library -- This component opts out of compiler memoization ("use no memo") and passes nothing from the virtualizer to memoized children.
  const virtualizer = useWindowVirtualizer<HTMLLIElement>({
    count: files.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    getItemKey: (index) => files[index]?.id ?? index,
    measureElement: measureShownRow,
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
      aria-label={t.yourDriveFiles}
      className="relative"
      ref={list}
      style={{ height: virtualizer.getTotalSize() }}
    >
      {rows.map((row) => {
        const file = files[row.index];

        // pb-1 is the gap between rows; it sits inside the measured height.
        return file === undefined ? null : (
          <li
            aria-posinset={row.index + 1}
            aria-setsize={browse.nextCursor === null ? files.length : -1}
            className="absolute top-0 left-0 w-full pb-1"
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

export { ListEnd, VirtualFileList };

export type { Browse, ReadyBrowse };

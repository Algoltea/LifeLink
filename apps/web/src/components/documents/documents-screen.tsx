"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useQuery } from "convex/react";
import { ChevronLeftIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { IsoIcon } from "@/components/app/iso-icon";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, ErrorNote, LoadingRows } from "@/components/app/states";
import { currentMessages, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { isRowStillShown } from "@/lib/list-beside-reader";

import { DriveNotice } from "./drive-notice";
import { ListEnd, VirtualFileList } from "./file-list";
import type { Browse } from "./file-list";
import { FilePreview } from "./file-preview";
import { FilesToolbar } from "./files-toolbar";
import type { Sort } from "./files-toolbar";

/** How long typing must pause before the list filters. */
const SEARCH_DELAY_MS = 350;

const FILES_HEADING_ID = "files-heading";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const searchTermOf = (input: string): string | null => {
  const trimmed = input.trim();

  return trimmed.length === 0 ? null : trimmed;
};

/** Nothing chosen yet: a quiet hint where the preview will appear. */
const NoPreview = () => {
  const t = useMessages().documents;

  return (
    <div className="text-muted-foreground hidden flex-col items-center gap-4 pt-16 pl-10 text-center @3xl/content:flex">
      <IsoIcon kind="file" size={72} />
      <p className="max-w-xs">{t.chooseFile}</p>
    </div>
  );
};

/** One search-and-sort view of the Drive, growing as the person scrolls. */
const FileBrowser = ({
  onBack,
  onSelect,
  search,
  selectedId,
  sort,
  timeZone,
}: {
  onBack: () => void;
  onSelect: (id: string) => void;
  search: string | null;
  selectedId: string | null;
  sort: Sort;
  timeZone: string;
}) => {
  const listFiles = useAction(api.drive.files);
  const [browse, setBrowse] = useState<Browse>({ kind: "loading" });
  const loadingMore = useRef(false);
  const openedNote = useRef<HTMLOutputElement>(null);
  const t = useMessages().documents;

  const listStaysBeside = (): boolean =>
    selectedId !== null &&
    isRowStillShown(
      document.querySelector(`[data-file-id="${CSS.escape(selectedId)}"]`)
    );

  // Focus stays on the row beside the preview, so say what opened instead.
  const announceOpened = useEffectEvent((id: string | null) => {
    const opened =
      browse.kind === "ready"
        ? browse.files.find((file) => file.id === id)
        : undefined;

    if (openedNote.current !== null) {
      openedNote.current.textContent =
        opened !== undefined && listStaysBeside()
          ? currentMessages().documents.opened(opened.name)
          : "";
    }
  });

  useEffect(() => {
    announceOpened(selectedId);
  }, [selectedId]);

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
    return <LoadingRows layout="documents" label={t.loadingFiles} rows={6} />;
  }

  if (browse.kind === "error") {
    return <ErrorNote>{browse.message}</ErrorNote>;
  }

  const selected = browse.files.find((file) => file.id === selectedId) ?? null;

  const isPractice = browse.mode === "simulated";

  return (
    <div className="grid items-start gap-6 @3xl/content:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/content:gap-0">
      <section
        aria-labelledby={FILES_HEADING_ID}
        className={cn(
          "min-w-0 flex-col @3xl/content:flex @3xl/content:self-stretch @3xl/content:border-r @3xl/content:pr-4",
          selected === null ? "flex" : "hidden"
        )}
      >
        <h2
          className="text-section px-3 pb-3 font-semibold outline-none"
          id={FILES_HEADING_ID}
          tabIndex={-1}
        >
          {search === null ? t.yourFiles : t.filesFound}
        </h2>
        {browse.files.length === 0 ? (
          <EmptyNote>{search === null ? t.empty : t.noMatch(search)}</EmptyNote>
        ) : (
          <>
            <VirtualFileList
              browse={browse}
              onLoadMore={loadMore}
              onSelect={onSelect}
              selectedId={selectedId}
              timeZone={timeZone}
            />
            <ListEnd browse={browse} onLoadMore={loadMore} />
          </>
        )}
      </section>
      {selected === null ? (
        <NoPreview />
      ) : (
        <div className="flex min-w-0 flex-col gap-2 @3xl/content:sticky @3xl/content:top-6 @3xl/content:pl-10">
          <Button
            className="-ml-2 self-start pl-2 @3xl/content:hidden"
            onClick={onBack}
            size="sm"
            variant="ghost"
          >
            <ChevronLeftIcon aria-hidden="true" />
            {t.backToFiles}
          </Button>
          <FilePreview
            file={selected}
            isPractice={isPractice}
            key={selected.id}
            listStaysBeside={listStaysBeside}
            timeZone={timeZone}
          />
        </div>
      )}
      <output aria-live="polite" className="sr-only" ref={openedNote} />
    </div>
  );
};

const DriveFiles = ({ timeZone }: { timeZone: string }) => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("recent");
  const browseKey = `${sort}:${search ?? ""}`;
  // A choice belongs to one search and sort; a new list starts with none.
  const [selection, setSelection] = useState<{ id: string; key: string }>();
  const selectedId = selection?.key === browseKey ? selection.id : null;
  const listPosition = useRef({ x: 0, y: 0 });
  const returningTo = useRef<string | null>(null);
  const pending = searchTermOf(input) !== search;

  // Filter once typing pauses, so each keystroke does not start a new search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTermOf(input));
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [input]);

  // On a phone, "Back" returns to the same place in the list and the same row.
  useLayoutEffect(() => {
    const id = returningTo.current;

    if (selectedId !== null || id === null) {
      return;
    }

    returningTo.current = null;
    globalThis.scrollTo({
      behavior: "instant",
      left: listPosition.current.x,
      top: listPosition.current.y,
    });

    // The list only draws rows near the screen, so wait for it to catch up.
    const frame = requestAnimationFrame(() => {
      const row = document.querySelector<HTMLElement>(
        `[data-file-id="${CSS.escape(id)}"]`
      );

      (row ?? document.querySelector(`#${FILES_HEADING_ID}`))?.focus({
        preventScroll: true,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  return (
    <div className="flex flex-col gap-5">
      <FilesToolbar
        className={selectedId === null ? undefined : "hidden @3xl/content:flex"}
        input={input}
        onInput={setInput}
        onSort={setSort}
        onSubmit={() => setSearch(searchTermOf(input))}
        pending={pending}
        sort={sort}
      />
      <FileBrowser
        key={browseKey}
        onBack={() => {
          returningTo.current = selectedId;
          setSelection(undefined);
        }}
        onSelect={(id) => {
          listPosition.current = {
            x: globalThis.scrollX,
            y: globalThis.scrollY,
          };
          setSelection({ id, key: browseKey });
        }}
        search={search}
        selectedId={selectedId}
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
  const t = useMessages().documents;

  const drive = connections?.providers.find(
    (provider) => provider.definition.id === "google_drive"
  );

  const needsReconnect =
    drive?.status === "error" || drive?.status === "expired";

  const isActive = drive?.status === "active";

  return (
    <>
      <PageHeader title={t.title} />
      {connections === undefined ? (
        <LoadingRows
          layout="documents-notice"
          label={t.checkingConnection}
          rows={2}
        />
      ) : null}
      {connections !== undefined && !isActive ? (
        <DriveNotice action={needsReconnect ? t.reconnect : t.connect}>
          {connections.demoMode ? t.connectPracticeHint : t.connectHint}
        </DriveNotice>
      ) : null}
      {connections !== undefined && isActive ? (
        <>
          <DriveNotice>
            {connections.demoMode
              ? t.practiceConnected
              : t.connected(drive.accountLabel ?? null)}
          </DriveNotice>
          <DriveFiles timeZone={timeZone} />
        </>
      ) : null}
    </>
  );
};

export { DocumentsScreen };

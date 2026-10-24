"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon, CopyPlusIcon, StarIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Ref } from "react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { useLocale, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { formatShortDay, money } from "@/lib/format";

import { DeleteListDialog } from "./delete-list-dialog";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const totalOf = (list: Doc<"groceryLists">): number =>
  list.items.reduce((total, item) => total + (item.estimatedCents ?? 0), 0);

const finishedAt = (list: Doc<"groceryLists">): number =>
  list.archivedAt ?? list.updatedAt;

/** Matches the list name or anything on it, so "milk" finds every trip with milk. */
const matches = (list: Doc<"groceryLists">, query: string): boolean => {
  const needle = query.trim().toLocaleLowerCase();

  return (
    needle.length === 0 ||
    list.name.toLocaleLowerCase().includes(needle) ||
    list.items.some((item) => item.name.toLocaleLowerCase().includes(needle))
  );
};

/** Newest month first; lists keep their newest-first order within a month. */
const byMonth = (
  lists: Doc<"groceryLists">[],
  timeZone: string,
  locale: InterfaceLocale
): { label: string; lists: Doc<"groceryLists">[] }[] => {
  const format = new Intl.DateTimeFormat(intlLocaleOf(locale), {
    month: "long",
    timeZone,
    year: "numeric",
  });

  const groups = new Map<string, Doc<"groceryLists">[]>();

  for (const list of lists) {
    const label = format.format(finishedAt(list));
    groups.set(label, [...(groups.get(label) ?? []), list]);
  }

  return [...groups].map(([label, grouped]) => ({ label, lists: grouped }));
};

const BackLink = ({ ref }: { ref?: Ref<HTMLAnchorElement> }) => {
  const t = useMessages().groceries;

  return (
    <Link
      // Minimal left padding keeps the arrow and text close to the content edge below.
      className={cn(
        buttonVariants({ variant: "outline" }),
        "justify-start self-start pr-6 pl-2"
      )}
      href="/groceries"
      ref={ref}
    >
      <ArrowLeftIcon aria-hidden="true" />
      {t.backToLists}
    </Link>
  );
};

const PastRow = ({
  list,
  onDelete,
  onReuse,
  reusing,
  reusePending,
  timeZone,
}: {
  list: Doc<"groceryLists">;
  onDelete: () => void;
  onReuse: () => void;
  reusing: boolean;
  reusePending: boolean;
  timeZone: string;
}) => {
  const locale = useLocale();
  const t = useMessages().groceries;

  return (
    <li className="border-rule flex flex-wrap items-center gap-x-3 gap-y-2 border-t py-3">
      <div className="flex min-w-[min(100%,14rem)] flex-1 flex-col">
        <Link
          className="text-lg font-medium break-words underline-offset-4 hover:underline"
          href={`/groceries?list=${list._id}`}
        >
          {list.usual ? (
            <>
              <StarIcon
                aria-hidden="true"
                className="mr-1.5 inline size-5 fill-current align-[-0.2em]"
              />
              <span className="sr-only">{t.past.usualPrefix}</span>
            </>
          ) : null}
          {list.name}
        </Link>
        <span className="text-muted-foreground text-base">
          {t.finished(formatShortDay(finishedAt(list), timeZone, locale))} ·{" "}
          {t.itemCount(list.items.length)} · {money(totalOf(list), locale)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          aria-busy={reusing}
          aria-label={t.past.reuseNamed(list.name)}
          className="whitespace-normal"
          disabled={list.items.length === 0 || reusePending}
          onClick={onReuse}
          variant="outline"
        >
          <CopyPlusIcon />
          {reusing ? t.past.reusing : t.past.reuse}
        </Button>
        <Button
          aria-label={t.deleteNamed(list.name)}
          className="text-muted-foreground hover:text-foreground"
          onClick={onDelete}
          size="icon"
          title={t.deleteNamed(list.name)}
          variant="ghost"
        >
          <XIcon />
        </Button>
      </div>
    </li>
  );
};

/**
 * Every finished trip, grouped by month and searchable. The list screen's
 * menu only shows the newest few, so this page is where older trips live.
 */
const PastListsScreen = () => {
  const locale = useLocale();
  const data = useQuery(api.groceries.lists);
  const copyList = useMutation(api.groceries.copyList);
  const { me } = usePreferences();
  const router = useRouter();
  const searchId = useId();
  const searchInput = useRef<HTMLInputElement>(null);
  const backLink = useRef<HTMLAnchorElement>(null);
  const [query, setQuery] = useState("");
  const reuseInFlight = useRef(false);
  const [reusingId, setReusingId] = useState<string | null>(null);
  const t = useMessages().groceries;

  const [deleteTarget, setDeleteTarget] = useState<Doc<"groceryLists"> | null>(
    null
  );

  const timeZone =
    me?.profile?.timeZone ??
    new Intl.DateTimeFormat().resolvedOptions().timeZone;

  const past = (data?.lists ?? [])
    .filter((list) => list.archivedAt !== undefined)
    .toSorted((a, b) => finishedAt(b) - finishedAt(a));

  const shown = past.filter((list) => matches(list, query));
  const months = byMonth(shown, timeZone, locale);

  const reuse = async (source: Doc<"groceryLists">): Promise<void> => {
    if (reuseInFlight.current) {
      return;
    }

    reuseInFlight.current = true;
    setReusingId(source._id);

    try {
      const listId = await copyList({ listId: source._id });
      toast.success(t.past.started(source.name));
      router.push(`/groceries?list=${listId}`);
    } catch (error) {
      toast.error(errorText(error));
    }

    reuseInFlight.current = false;
    setReusingId(null);
  };

  return (
    <>
      <BackLink ref={backLink} />
      <PageHeader subline={t.past.subline} title={t.past.title} />
      <DeleteListDialog
        // Deleting the last past list removes the search box, so fall back to Back.
        finalFocus={() => searchInput.current ?? backLink.current}
        onClose={() => setDeleteTarget(null)}
        target={deleteTarget}
      />
      {data === undefined ? (
        <LoadingRows layout="groceries" label={t.loadingPast} rows={4} />
      ) : null}
      {data !== undefined && past.length === 0 ? (
        <EmptyNote>{t.past.empty}</EmptyNote>
      ) : null}
      {past.length > 0 ? (
        <div className="flex max-w-3xl flex-col gap-6">
          <div className="flex max-w-xl flex-col gap-2">
            <Label className="text-lg" htmlFor={searchId}>
              {t.past.search}
            </Label>
            <Input
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.past.searchPlaceholder}
              ref={searchInput}
              type="search"
              value={query}
            />
            <p aria-live="polite" className="text-muted-foreground text-base">
              {query.trim().length === 0
                ? t.past.count(past.length)
                : t.past.matchCount(shown.length, past.length)}
            </p>
          </div>
          {shown.length === 0 ? (
            <EmptyNote>{t.past.noMatch(query.trim())}</EmptyNote>
          ) : null}
          {months.map((month) => (
            <section aria-label={month.label} key={month.label}>
              <h2 className="pb-1 text-xl leading-7 font-semibold">
                {month.label}
              </h2>
              <ul>
                {month.lists.map((list) => (
                  <PastRow
                    key={list._id}
                    list={list}
                    onDelete={() => setDeleteTarget(list)}
                    onReuse={() => reuse(list)}
                    reusing={reusingId === list._id}
                    reusePending={reusingId !== null}
                    timeZone={timeZone}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </>
  );
};

export { PastListsScreen };

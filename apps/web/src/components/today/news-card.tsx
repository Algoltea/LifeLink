"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { NEWS_REFRESH_MS, NEWS_SOURCES } from "@lifelink/contracts/news";
import type { NewsKind } from "@lifelink/contracts/news";
import { Segmented } from "@lifelink/ui/components/segmented";
import { useAction, useMutation, useQuery } from "convex/react";
import { ExternalLinkIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { usePreferences } from "@/components/app/preferences";
import { useMessages } from "@/i18n/locale";
import { useRefreshWhenStale } from "@/lib/refresh";

const SHOWN = 3;

/** Missing or old headlines are fetched again; the server decides if a fetch is due. */
const useHeadlines = (kind: NewsKind, enabled: boolean) => {
  const news = useQuery(api.news.headlines, enabled ? { kind } : "skip");
  const refreshAction = useAction(api.news.refresh);

  const [failed, setFailed] = useState<Record<NewsKind, boolean>>({
    good: false,
    top: false,
  });

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const { available } = await refreshAction({ kind });

      setFailed((previous) => ({ ...previous, [kind]: !available }));
    } catch {
      setFailed((previous) => ({ ...previous, [kind]: true }));
    }
  }, [kind, refreshAction]);

  useRefreshWhenStale({
    enabled,
    fetchedAt: news?.fetchedAt,
    maxAgeMs: NEWS_REFRESH_MS,
    refresh,
  });

  return { failed: failed[kind], news };
};

/** Three headlines; the person picks gentle or ordinary news, saved to their profile. */
const NewsCard = () => {
  const { preferences } = usePreferences();
  const t = useMessages();
  const savePreferences = useMutation(api.profiles.updatePreferences);
  const [chosen, setChosen] = useState<NewsKind | null>(null);
  const kind = chosen ?? preferences.newsKind;
  const { failed, news } = useHeadlines(kind, preferences.showNews);
  const headlines = news?.headlines.slice(0, SHOWN) ?? [];
  const [single] = NEWS_SOURCES[kind].length === 1 ? NEWS_SOURCES[kind] : [];

  if (!preferences.showNews) {
    return null;
  }

  return (
    <section aria-labelledby="news-heading" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="text-section font-semibold" id="news-heading">
          {t.today.news}
        </h2>
        <Segmented
          className="w-auto flex-nowrap [&>*]:px-3 [&>*]:whitespace-nowrap sm:[&>*]:px-4"
          label={t.today.newsType}
          onValueChange={async (next) => {
            setChosen(next);

            try {
              await savePreferences({ newsKind: next });
            } catch {
              // Not saved: show the saved choice again.
              setChosen(null);
            }
          }}
          options={[
            { label: t.today.newsGood, value: "good" },
            { label: t.today.newsTop, value: "top" },
          ]}
          value={kind}
        />
      </div>
      {/* Three rows tall, so switching kinds does not shrink the page and scroll it. */}
      <div className="min-h-48">
        {headlines.length > 0 ? (
          <ul className="motion-enter flex flex-col" key={kind}>
            {headlines.map((headline) => (
              <li
                className="border-rule border-t py-1 first:border-t-0"
                key={headline.url}
              >
                <a
                  className="text-foreground hover:bg-parchment -mx-3 flex min-h-14 min-w-0 items-center gap-3.5 rounded-lg px-3 py-3 transition-colors"
                  href={headline.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={headline.title}
                >
                  <span className="text-body min-w-0 flex-1 truncate">
                    {headline.title}
                  </span>
                  <span className="text-muted-foreground text-label flex shrink-0 items-center gap-1.5">
                    <span className="sr-only">{t.today.newsSourceFrom}</span>
                    {headline.source}
                    <ExternalLinkIcon aria-hidden="true" className="size-4" />
                    <span className="sr-only">{t.today.newsOpensNewTab}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {headlines.length === 0 && failed ? (
          <output className="text-muted-foreground text-body block py-1">
            {t.today.newsUnavailable}
          </output>
        ) : null}
      </div>
      {single && headlines.length > 0 ? (
        <a
          className="text-accent-foreground text-label min-h-control -mr-3 inline-flex items-center gap-1.5 self-end px-3 font-medium"
          href={single.homeUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t.today.newsMoreFrom(single.label)}
          <ExternalLinkIcon aria-hidden="true" className="size-4" />
          <span className="sr-only">{t.today.newsOpensNewTab}</span>
        </a>
      ) : null}
    </section>
  );
};

export { NewsCard };

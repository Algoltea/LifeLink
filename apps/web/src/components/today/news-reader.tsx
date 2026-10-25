"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Headline } from "@lifelink/contracts/news";
import { Dialog } from "@lifelink/ui/components/dialog";
import { useAction, useQuery } from "convex/react";
import { ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { useLocale, useMessages } from "@/i18n/locale";

/** Another reader is preparing this summary; past this wait, show the teaser instead. */
const BUSY_WAIT_MS = 20_000;

/** Asks for a summary once it is known to be missing; the saved one then arrives through the query. */
const useSummary = (url: string) => {
  const summary = useQuery(api.news.summary, { url });
  const summarize = useAction(api.news.summarize);
  // Failure belongs to one article in one language, so a language change asks again.
  const locale = useLocale();
  const attempt = `${locale}:${url}`;
  const [failedAttempt, setFailedAttempt] = useState<string | null>(null);
  const missing = summary === null;

  useEffect(() => {
    if (!missing) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const ask = async (): Promise<void> => {
      try {
        const { status } = await summarize({ url });

        if (cancelled) {
          return;
        }

        if (status === "unavailable") {
          setFailedAttempt(attempt);
        }

        if (status === "busy") {
          timer = setTimeout(() => setFailedAttempt(attempt), BUSY_WAIT_MS);
        }
      } catch {
        if (!cancelled) {
          setFailedAttempt(attempt);
        }
      }
    };

    void ask();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [attempt, missing, summarize, url]);

  return { failed: failedAttempt === attempt, summary };
};

const SummaryBody = ({ headline }: { headline: Headline }) => {
  const t = useMessages().today;
  const { failed, summary } = useSummary(headline.url);

  const kindLabels = {
    news: null,
    opinion: t.newsOpinion,
    sponsored: t.newsSponsored,
  } as const;

  const kindLabel = summary ? kindLabels[summary.kind] : null;

  return (
    <div className="flex flex-col gap-4">
      {summary ? (
        <div className="motion-enter flex flex-col gap-3">
          {kindLabel ? (
            <p className="text-label text-warning font-semibold">{kindLabel}</p>
          ) : null}
          <p className="text-body font-medium">{summary.gist}</p>
          {summary.points.length > 0 ? (
            <ul className="text-body flex list-disc flex-col gap-2 pl-6">
              {summary.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          <ReadAloudButton
            className="self-start"
            text={[kindLabel, summary.gist, ...summary.points]
              .filter((line) => line !== null)
              .join(" ")}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {headline.teaser ? (
            <p className="text-body">{headline.teaser}</p>
          ) : null}
          <output className="text-muted-foreground text-body block">
            {failed ? t.newsSummaryUnavailable : t.newsSummarizing}
          </output>
        </div>
      )}
      <a
        className="text-accent-foreground text-label min-h-control -ml-3 inline-flex items-center gap-1.5 self-start px-3 font-medium"
        href={headline.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {t.newsFullStory(headline.source)}
        <ExternalLinkIcon aria-hidden="true" className="size-4" />
        <span className="sr-only">{t.newsOpensNewTab}</span>
      </a>
    </div>
  );
};

/** A headline opened inside LifeLink: a short summary first, the publisher's page one tap away. */
const NewsReader = ({
  headline,
  onClose,
}: {
  headline: Headline | null;
  onClose: () => void;
}) => (
  <Dialog
    description={headline?.source}
    onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}
    open={headline !== null}
    title={headline?.title ?? ""}
  >
    {headline ? <SummaryBody headline={headline} key={headline.url} /> : null}
  </Dialog>
);

export { NewsReader };

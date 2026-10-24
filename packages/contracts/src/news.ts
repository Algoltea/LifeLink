/**
 * News on Today: "good" mixes calm, uplifting sources by default; "top" is
 * ordinary headlines for people who choose them.
 */

type NewsKind = "good" | "top";

interface Headline {
  readonly publishedAt: number | null;
  readonly source: string;
  readonly title: string;
  readonly url: string;
}

interface NewsSource {
  readonly categoriesToSkip?: readonly string[];
  readonly feedUrl: string;
  readonly homeUrl: string;
  readonly label: string;
}

const NEWS_SOURCES: Readonly<Record<NewsKind, readonly NewsSource[]>> = {
  good: [
    {
      categoriesToSkip: ["astrology", "horoscopes"],
      feedUrl: "https://www.goodnewsnetwork.org/feed/",
      homeUrl: "https://www.goodnewsnetwork.org/",
      label: "Good News Network",
    },
    {
      feedUrl: "https://www.smithsonianmag.com/rss/smart-news/",
      homeUrl: "https://www.smithsonianmag.com/smart-news/",
      label: "Smithsonian",
    },
  ],
  top: [
    {
      feedUrl: "https://feeds.npr.org/1001/rss.xml",
      homeUrl: "https://www.npr.org/sections/news/",
      label: "NPR",
    },
  ],
};

const NEWS_KINDS: readonly NewsKind[] = ["good", "top"];

/** Headlines older than this are fetched again when someone opens Today. */
const NEWS_REFRESH_MS = 30 * 60_000;

export { NEWS_KINDS, NEWS_REFRESH_MS, NEWS_SOURCES };

export type { Headline, NewsKind, NewsSource };

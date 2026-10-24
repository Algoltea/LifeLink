/**
 * A small RSS 2.0 reader for headline feeds. The Convex runtime has no DOM
 * parser, and these feeds are flat, so items are read with bounded patterns
 * and only titles, links, dates, and categories are kept.
 */
import type { Headline, NewsSource } from "@lifelink/contracts/news";

const ITEM = /<item\b[^>]*>(?<body>[\s\S]*?)<\/item>/gu;
const CDATA = /^<!\[CDATA\[(?<text>[\s\S]*?)\]\]>$/u;
const TAGS = /<[^>]+>/gu;
const ENTITY = /&(?<name>#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/giu;
const SPACE = /\s+/gu;
const HTTP_URL = /^https?:\/\//u;

const NAMED = new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["nbsp", " "],
  ["quot", '"'],
]);

const decodeEntities = (text: string): string =>
  text.replaceAll(ENTITY, (match, name: string) => {
    const lower = name.toLowerCase();

    if (lower.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    }

    if (lower.startsWith("#")) {
      return String.fromCodePoint(Number(lower.slice(1)));
    }

    return NAMED.get(lower) ?? match;
  });

const cleanText = (raw: string): string => {
  const inner = CDATA.exec(raw.trim())?.groups?.text ?? raw;

  return decodeEntities(inner.replaceAll(TAGS, " "))
    .replaceAll(SPACE, " ")
    .trim();
};

const tagValues = (item: string, tag: string): string[] =>
  [
    ...item.matchAll(
      new RegExp(`<${tag}\\b[^>]*>(?<value>[\\s\\S]*?)</${tag}>`, "gu")
    ),
  ].map((match) => cleanText(match.groups?.value ?? ""));

/** Headlines from one feed, newest first, without items the source asks to skip. */
const parseFeed = (xml: string, source: NewsSource): Headline[] => {
  const skip = new Set(
    (source.categoriesToSkip ?? []).map((category) => category.toLowerCase())
  );

  const headlines = [...xml.matchAll(ITEM)].flatMap((match): Headline[] => {
    const item = match.groups?.body ?? "";
    const [title] = tagValues(item, "title");
    const [url] = tagValues(item, "link");
    const [published] = tagValues(item, "pubDate");

    const skipped = tagValues(item, "category").some((category) =>
      skip.has(category.toLowerCase())
    );

    if (!title || !url || !HTTP_URL.test(url) || skipped) {
      return [];
    }

    const publishedAt = published ? Date.parse(published) : Number.NaN;

    return [
      {
        publishedAt: Number.isNaN(publishedAt) ? null : publishedAt,
        source: source.label,
        title,
        url,
      },
    ];
  });

  return headlines.toSorted(
    (left, right) => (right.publishedAt ?? 0) - (left.publishedAt ?? 0)
  );
};

/** Take from each source in turn so one busy feed cannot fill the card. */
const interleave = (
  lists: readonly (readonly Headline[])[],
  limit: number
): Headline[] => {
  const longest = Math.max(0, ...lists.map((list) => list.length));
  const mixed: Headline[] = [];

  for (let index = 0; index < longest && mixed.length < limit; index += 1) {
    for (const list of lists) {
      const headline = list[index];

      if (headline && mixed.length < limit) {
        mixed.push(headline);
      }
    }
  }

  return mixed;
};

export { interleave, parseFeed };

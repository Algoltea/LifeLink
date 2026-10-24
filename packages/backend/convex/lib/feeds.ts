/**
 * A small RSS 2.0 reader for headline feeds. The Convex runtime has no DOM
 * parser, and these feeds are flat, so items are split in one pass, each item
 * is size-capped, and only titles, links, dates, and categories are kept.
 */
import type { Headline, NewsSource } from "@lifelink/contracts/news";

const ITEM_OPEN = /<item\b/u;
const ITEM_CLOSE = "</item>";
const CDATA = /^<!\[CDATA\[(?<text>[\s\S]*?)\]\]>$/u;
const TAGS = /<[^>]+>/gu;
const ENTITY = /&(?<name>#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/giu;
const SPACE = /\s+/gu;
const HTTP_URL = /^https?:\/\//u;

const MAX_ITEMS = 100;
const MAX_ITEM_CHARS = 50_000;
const MAX_TITLE_CHARS = 300;
const MAX_URL_CHARS = 2000;
const MAX_CODE_POINT = 0x10_ff_ff;
const SURROGATES = { first: 0xd8_00, last: 0xdf_ff } as const;

const NAMED = new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["nbsp", " "],
  ["quot", '"'],
]);

/** A character reference that names no real character stays as written. */
const fromCode = (code: number, fallback: string): string => {
  const valid =
    Number.isInteger(code) &&
    code > 0 &&
    code <= MAX_CODE_POINT &&
    (code < SURROGATES.first || code > SURROGATES.last);

  return valid ? String.fromCodePoint(code) : fallback;
};

const decodeEntities = (text: string): string =>
  text.replaceAll(ENTITY, (match, name: string) => {
    const lower = name.toLowerCase();

    if (lower.startsWith("#x")) {
      return fromCode(Number.parseInt(lower.slice(2), 16), match);
    }

    if (lower.startsWith("#")) {
      return fromCode(Number(lower.slice(1)), match);
    }

    return NAMED.get(lower) ?? match;
  });

const clip = (text: string, limit: number): string =>
  text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;

/** Item bodies in one linear pass; unclosed and oversized items are dropped. */
const itemsOf = (xml: string): string[] =>
  xml
    .split(ITEM_OPEN)
    .slice(1, MAX_ITEMS + 1)
    .flatMap((chunk) => {
      const end = chunk.indexOf(ITEM_CLOSE);
      const start = chunk.indexOf(">") + 1;

      return end === -1 || start === 0 || end - start > MAX_ITEM_CHARS
        ? []
        : [chunk.slice(start, end)];
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

  const headlines = itemsOf(xml).flatMap((item): Headline[] => {
    const [title] = tagValues(item, "title");
    const [url] = tagValues(item, "link");
    const [published] = tagValues(item, "pubDate");

    const skipped = tagValues(item, "category").some((category) =>
      skip.has(category.toLowerCase())
    );

    if (
      !title ||
      !url ||
      !HTTP_URL.test(url) ||
      url.length > MAX_URL_CHARS ||
      skipped
    ) {
      return [];
    }

    const publishedAt = published ? Date.parse(published) : Number.NaN;

    return [
      {
        publishedAt: Number.isNaN(publishedAt) ? null : publishedAt,
        source: source.label,
        title: clip(title, MAX_TITLE_CHARS),
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

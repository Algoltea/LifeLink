import { NEWS_SOURCES } from "@lifelink/contracts/news";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import { articleText, interleave, parseFeed } from "../convex/lib/feeds";
import { locationKey, searchesFor } from "../convex/lib/weather";
import { newBackend, signUp } from "./harness";
import type { Person } from "./harness";

const TODAY = "2026-10-24";
const HOUR = 3_600_000;
const [GOOD_NEWS, SMITHSONIAN] = NEWS_SOURCES.good;

const rss = (items: string[]): string =>
  `<?xml version="1.0"?><rss><channel><title>Feed</title>${items.join("")}</channel></rss>`;

const item = (
  title: string,
  link: string,
  date: string,
  categories: string[] = []
): string =>
  `<item><title><![CDATA[${title}]]></title><link>${link}</link><pubDate>${date}</pubDate>${categories
    .map((category) => `<category><![CDATA[${category}]]></category>`)
    .join("")}</item>`;

const GEOCODE = JSON.stringify({
  results: [
    {
      admin1: "Missouri",
      latitude: 37.2,
      longitude: -93.3,
      name: "Springfield",
      timezone: "America/Chicago",
    },
    {
      admin1: "Massachusetts",
      latitude: 42.1,
      longitude: -72.6,
      name: "Springfield",
      timezone: "America/New_York",
    },
  ],
});

const FORECAST = JSON.stringify({
  current: { is_day: 1, temperature_2m: 11.1, weather_code: 3 },
  daily: {
    precipitation_probability_max: [0, 80],
    temperature_2m_max: [16.4, 12],
    temperature_2m_min: [4.7, 6],
    time: ["2026-10-23", TODAY],
    weather_code: [3, 63],
  },
});

const respond = (body: string, status = 200): Response =>
  new Response(body, { status });

const fetchMock = vi.fn<typeof fetch>();

const useFetch = (handler: (url: string) => Response): void => {
  fetchMock.mockImplementation(async (input) => {
    const { url } = new Request(input);

    return await Promise.resolve(handler(url));
  });
  vi.stubGlobal("fetch", fetchMock);
};

const weatherServer = (url: string): Response =>
  url.includes("geocoding") ? respond(GEOCODE) : respond(FORECAST);

const ownerIn = async (
  city: string | null,
  demo = false
): Promise<{ backend: ReturnType<typeof newBackend>; person: Person }> => {
  const backend = newBackend();

  const { person } = await signUp(backend, {
    demo,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

  if (city !== null) {
    await person.mutation(api.profiles.updateProfile, {
      city,
      displayName: "Ruth Alvarez",
      postalCode: null,
      preferredName: "Ruth",
      signOffName: null,
      timeZone: "America/New_York",
    });
  }

  return { backend, person };
};

const resetFetch = (): void => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
};

const headlinesFrom = (source: string, count: number) =>
  Array.from({ length: count }, (_unused, index) => ({
    publishedAt: null,
    source,
    title: `${source} ${index}`,
    url: `https://example.org/${source}/${index}`,
  }));

describe("reading headline feeds", () => {
  it("keeps clean titles and links, newest first, and skips unwanted categories", () => {
    if (!GOOD_NEWS) {
      throw new Error("Expected a good news source.");
    }

    const headlines = parseFeed(
      rss([
        item(
          "Older &amp; kinder",
          "https://example.org/a",
          "Fri, 23 Oct 2026 10:00:00 GMT"
        ),
        item(
          "Your weekly horoscope",
          "https://example.org/h",
          "Sat, 24 Oct 2026 11:00:00 GMT",
          ["Horoscopes"]
        ),
        item("No link", "not-a-url", "Sat, 24 Oct 2026 09:00:00 GMT"),
        item(
          "Newest <b>story</b>",
          "https://example.org/b",
          "Sat, 24 Oct 2026 08:00:00 GMT"
        ),
      ]),
      GOOD_NEWS
    );

    expect(headlines.map((headline) => headline.title)).toStrictEqual([
      "Newest story",
      "Older & kinder",
    ]);
    expect(headlines[0]?.source).toBe("Good News Network");
  });

  it("takes from each source in turn", () => {
    expect(
      interleave([headlinesFrom("A", 3), headlinesFrom("B", 1)], 3).map(
        (entry) => entry.title
      )
    ).toStrictEqual(["A 0", "B 0", "A 1"]);
  });
});

describe("finding a saved place", () => {
  it("tries the whole postal code, then its first part, then the city", () => {
    expect(
      searchesFor({
        city: "Leeds",
        postalCode: "LS1 4AP",
        timeZone: "Europe/London",
      })
    ).toStrictEqual(["LS1 4AP", "LS1", "Leeds"]);
    expect(
      locationKey({ city: null, postalCode: null, timeZone: "Europe/London" })
    ).toBeNull();
  });
});

describe("weather on Today", () => {
  afterEach(resetFetch);

  it("asks for a place when a real account has none", async () => {
    const { person } = await ownerIn(null);

    await expect(
      person.query(api.weather.forecast, { today: TODAY })
    ).resolves.toStrictEqual({ status: "no_location" });
  });

  it("marks the postal code step done once a place is saved", async () => {
    const { person } = await ownerIn(null);
    const before = await person.query(api.today.summary, {});

    expect(before.gettingStarted.location).toBeFalsy();

    await person.mutation(api.profiles.updateProfile, {
      city: null,
      displayName: "Ruth Alvarez",
      postalCode: "10001",
      preferredName: "Ruth",
      signOffName: null,
      timeZone: "America/New_York",
    });

    const after = await person.query(api.today.summary, {});

    expect(after.gettingStarted.location).toBeTruthy();
  });

  it("shows a sample week in practice mode without a place", async () => {
    const { person } = await ownerIn(null, true);
    const result = await person.query(api.weather.forecast, { today: TODAY });

    expect(result.status).toBe("practice");
    expect(result.status === "practice" && result.forecast.days[0]?.date).toBe(
      TODAY
    );
  });

  it("uses the place in the saved time zone and drops past days", async () => {
    useFetch(weatherServer);
    const { person } = await ownerIn("Springfield");

    const before = await person.query(api.weather.forecast, { today: TODAY });

    expect(before.status).toBe("loading");

    await person.action(api.weather.refresh, {});

    const result = await person.query(api.weather.forecast, { today: TODAY });

    expect(result.status).toBe("ready");
    expect(result.status === "ready" && result.forecast.place).toBe(
      "Springfield, Massachusetts"
    );
    expect(
      result.status === "ready" && result.forecast.days.map((day) => day.date)
    ).toStrictEqual([TODAY]);
  });

  it("does not ask again within 30 minutes and keeps the last forecast when the service fails", async () => {
    vi.useFakeTimers({
      now: Date.parse(`${TODAY}T12:00:00Z`),
      toFake: ["Date"],
    });
    useFetch(weatherServer);
    const { person } = await ownerIn("Springfield");

    await person.action(api.weather.refresh, {});
    const calls = fetchMock.mock.calls.length;

    await person.action(api.weather.refresh, {});
    expect(fetchMock).toHaveBeenCalledTimes(calls);

    vi.setSystemTime(Date.parse(`${TODAY}T12:00:00Z`) + HOUR);
    useFetch(() => respond("down", 503));
    await person.action(api.weather.refresh, {});

    const result = await person.query(api.weather.forecast, { today: TODAY });

    expect(fetchMock.mock.calls.length).toBeGreaterThan(calls);
    expect(result.status).toBe("ready");
  });

  it("records a place that cannot be found", async () => {
    useFetch((url) =>
      url.includes("geocoding") ? respond("{}") : respond(FORECAST)
    );
    const { person } = await ownerIn("Nowhere at all");

    await person.action(api.weather.refresh, {});

    const result = await person.query(api.weather.forecast, { today: TODAY });

    expect(result.status).toBe("not_found");
  });
});

describe("news on Today", () => {
  afterEach(resetFetch);

  it("mixes the good news sources and keeps them when the feeds fail", async () => {
    vi.useFakeTimers({
      now: Date.parse(`${TODAY}T12:00:00Z`),
      toFake: ["Date"],
    });
    useFetch((url) =>
      respond(
        url === SMITHSONIAN?.feedUrl
          ? rss([
              item(
                "Van Gogh's sky",
                "https://example.org/s",
                "Fri, 23 Oct 2026 20:00:00 GMT"
              ),
            ])
          : rss([
              item(
                "Walrus rescued",
                "https://example.org/g1",
                "Sat, 24 Oct 2026 10:00:00 GMT"
              ),
              item(
                "Horoscope",
                "https://example.org/g2",
                "Sat, 24 Oct 2026 11:00:00 GMT",
                ["Astrology"]
              ),
              item(
                "New park",
                "https://example.org/g3",
                "Sat, 24 Oct 2026 09:00:00 GMT"
              ),
            ])
      )
    );
    const { person } = await ownerIn(null);

    await person.action(api.news.refresh, { kind: "good" });

    const first = await person.query(api.news.headlines, { kind: "good" });

    expect(first.headlines.map((headline) => headline.title)).toStrictEqual([
      "Walrus rescued",
      "Van Gogh's sky",
      "New park",
    ]);

    vi.setSystemTime(Date.parse(`${TODAY}T12:00:00Z`) + HOUR);
    useFetch(() => respond("down", 503));
    await person.action(api.news.refresh, { kind: "good" });

    const kept = await person.query(api.news.headlines, { kind: "good" });

    expect(kept.headlines).toHaveLength(3);
  });

  it("starts empty for a kind nobody has loaded", async () => {
    const { person } = await ownerIn(null);

    await expect(
      person.query(api.news.headlines, { kind: "top" })
    ).resolves.toStrictEqual({ fetchedAt: null, headlines: [] });
  });

  it("saves the chosen kind and whether news shows", async () => {
    const { person } = await ownerIn(null);

    await person.mutation(api.profiles.updatePreferences, {
      newsKind: "top",
      showNews: false,
    });

    const me = await person.query(api.profiles.me, {});

    expect(me?.preferences).toMatchObject({ newsKind: "top", showNews: false });
  });
});

describe("review fixes for outside fetches", () => {
  afterEach(resetFetch);

  it("does not throw on a character code that names no character", () => {
    if (!SMITHSONIAN) {
      throw new Error("Expected a Smithsonian source.");
    }

    const headlines = parseFeed(
      rss([
        item(
          "Bad &#x110000; code",
          "https://example.org/x",
          "Sat, 24 Oct 2026 08:00:00 GMT"
        ),
        item(
          "Kept &#8217; quote",
          "https://example.org/y",
          "Sat, 24 Oct 2026 07:00:00 GMT"
        ),
      ]),
      SMITHSONIAN
    );

    expect(headlines.map((headline) => headline.title)).toStrictEqual([
      "Bad &#x110000; code",
      "Kept ’ quote",
    ]);
  });

  it("drops an unclosed item and clips a very long title", () => {
    if (!SMITHSONIAN) {
      throw new Error("Expected a Smithsonian source.");
    }

    const long = "A".repeat(1000);

    const headlines = parseFeed(
      `${rss([item(long, "https://example.org/l", "Sat, 24 Oct 2026 08:00:00 GMT")])}<item><title>Never closed`,
      SMITHSONIAN
    );

    expect(headlines).toHaveLength(1);
    expect(headlines[0]?.title.length).toBeLessThanOrEqual(300);
  });

  it("prefers a city in the saved time zone over a postal match abroad", async () => {
    const abroad = JSON.stringify({
      results: [
        {
          latitude: 51,
          longitude: 0,
          name: "Abroad",
          timezone: "Europe/London",
        },
      ],
    });

    useFetch((url) => {
      if (!url.includes("geocoding")) {
        return respond(FORECAST);
      }

      return url.includes("name=Springfield")
        ? respond(GEOCODE)
        : respond(abroad);
    });

    const backend = newBackend();

    const { person } = await signUp(backend, {
      demo: false,
      name: "Ruth Alvarez",
      role: "owner",
      subject: "owner-1",
    });

    await person.mutation(api.profiles.updateProfile, {
      city: "Springfield",
      displayName: "Ruth Alvarez",
      postalCode: "01101",
      preferredName: "Ruth",
      signOffName: null,
      timeZone: "America/New_York",
    });

    await person.action(api.weather.refresh, {});

    const result = await person.query(api.weather.forecast, { today: TODAY });

    expect(result.status === "ready" && result.forecast.place).toBe(
      "Springfield, Massachusetts"
    );
  });

  it("keeps a good forecast when the place search answers with nonsense", async () => {
    vi.useFakeTimers({
      now: Date.parse(`${TODAY}T12:00:00Z`),
      toFake: ["Date"],
    });
    useFetch(weatherServer);
    const { person } = await ownerIn("Springfield");

    await person.action(api.weather.refresh, {});

    vi.setSystemTime(Date.parse(`${TODAY}T12:00:00Z`) + HOUR);
    useFetch(() => respond("<html>busy</html>"));
    await person.action(api.weather.refresh, {});

    const result = await person.query(api.weather.forecast, { today: TODAY });

    expect(result.status).toBe("ready");
  });

  it("tries a failing feed once, then waits before trying again", async () => {
    vi.useFakeTimers({
      now: Date.parse(`${TODAY}T12:00:00Z`),
      toFake: ["Date"],
    });
    useFetch(() => respond("down", 503));
    const { person } = await ownerIn(null);

    const first = await person.action(api.news.refresh, { kind: "top" });
    const calls = fetchMock.mock.calls.length;
    const second = await person.action(api.news.refresh, { kind: "top" });

    expect(first).toStrictEqual({ available: false });
    expect(second).toStrictEqual({ available: false });
    expect(fetchMock).toHaveBeenCalledTimes(calls);

    vi.setSystemTime(Date.parse(`${TODAY}T12:00:00Z`) + 6 * 60_000);
    await person.action(api.news.refresh, { kind: "top" });

    expect(fetchMock.mock.calls.length).toBeGreaterThan(calls);
  });
});

describe("weather and news for the assistant", () => {
  it("reads the saved place by profile, without a signed-in session", async () => {
    const { backend, person } = await ownerIn("Springfield");
    const me = await person.query(api.profiles.me, {});
    const profileId = me?.profile?._id;

    if (!profileId) {
      throw new Error("Expected a profile.");
    }

    const whose = await backend.query(internal.weather.locationOf, {
      profileId,
    });

    expect(whose).toMatchObject({
      demoMode: false,
      location: { city: "Springfield", postalCode: null },
      profileId,
    });
  });

  it("reserves a fetch for a profile passed in, once per retry window", async () => {
    const { backend, person } = await ownerIn(null);
    const me = await person.query(api.profiles.me, {});
    const profileId = me?.profile?._id;

    if (!profileId) {
      throw new Error("Expected a profile.");
    }

    const first = await backend.mutation(internal.news.claim, {
      kind: "good",
      profileId,
    });

    const second = await backend.mutation(internal.news.claim, {
      kind: "good",
      profileId,
    });

    expect([first, second]).toStrictEqual([true, false]);
  });
});

describe("confirming a postal code during setup", () => {
  afterEach(resetFetch);

  it("names the town before a profile exists, and nothing for a blank code", async () => {
    useFetch(weatherServer);
    const person = newBackend().withIdentity({ subject: "new-person" });

    const found = await person.action(api.weather.lookupPlace, {
      postalCode: " 01101 ",
      timeZone: "America/New_York",
    });

    const blank = await person.action(api.weather.lookupPlace, {
      postalCode: "  ",
      timeZone: "America/New_York",
    });

    expect(found).toStrictEqual({
      city: "Springfield",
      place: "Springfield, Massachusetts",
    });
    expect(blank).toBeNull();
  });
});

describe("very long titles in CDATA", () => {
  it("unwraps CDATA before clipping, so no marker shows", () => {
    if (!SMITHSONIAN) {
      throw new Error("Expected a Smithsonian source.");
    }

    const [headline] = parseFeed(
      rss([
        item(
          "B".repeat(5000),
          "https://example.org/c",
          "Sat, 24 Oct 2026 08:00:00 GMT"
        ),
      ]),
      SMITHSONIAN
    );

    expect(headline?.title).toMatch(/^B{10}/u);
    expect(headline?.title).not.toContain("CDATA");
  });
});

const STORY_URL = "https://www.goodnewsnetwork.org/walrus-rescued/";
const OFF_SITE_URL = "https://example.org/walrus";

const STORY_PAGE = `<html><body><nav><p>Home</p></nav>
<p>A walrus that wandered onto a beach in Maine was guided back to the sea by volunteers on Saturday morning.</p>
<p class="caption">Photo: credit</p>
<script>const banner = "<p>Accept all cookies to keep reading this website today, thank you for visiting us.</p>";</script >
<p>Wildlife officers said the walrus was healthy and had likely followed fish farther south than usual &amp; got tired.</p>
<p>Volunteers kept people at a safe distance for six hours until the tide came in and the walrus swam away.</p>
<p>Officials asked anyone who sees a marine animal on a beach to call the local rescue line and keep their distance.</p>
</body></html>`;

const summaryReply = (): Response =>
  Response.json({
    choices: [
      {
        message: {
          content: JSON.stringify({
            gist: "  Volunteers helped a tired walrus get back to the sea in Maine.  ",
            kind: "news",
            points: [
              "The walrus came ashore on Saturday.",
              "",
              "Volunteers kept people away for six hours.",
              "It swam away when the tide came in.",
              "A fourth point that is not kept.",
            ],
          }),
        },
      },
    ],
    model: "test-news-model",
  });

const newsServer = (url: string): Response => {
  if (url === GOOD_NEWS?.feedUrl) {
    return respond(
      rss([
        `<item><title>Walrus rescued</title><link>${STORY_URL}</link><description><![CDATA[<p>A walrus is back at sea.</p>]]></description><pubDate>Sat, 24 Oct 2026 10:00:00 GMT</pubDate></item>`,
      ])
    );
  }

  if (url === STORY_URL) {
    return respond(STORY_PAGE);
  }

  if (url.includes("openrouter.ai")) {
    return summaryReply();
  }

  return respond(rss([]));
};

describe("reading an article page", () => {
  it("keeps the story paragraphs and drops menus and captions", () => {
    const text = articleText(STORY_PAGE);

    expect(text).toContain("A walrus that wandered onto a beach");
    expect(text).toContain("farther south than usual & got tired");
    expect(text).not.toContain("Photo: credit");
    expect(text).not.toContain("cookies");
    expect(text.split("\n\n")).toHaveLength(4);
  });

  it("keeps the feed's description as a teaser", () => {
    if (!GOOD_NEWS) {
      throw new Error("Expected a good news source.");
    }

    const [headline] = parseFeed(
      rss([
        `<item><title>Walrus rescued</title><link>${STORY_URL}</link><description><![CDATA[<p>A walrus is back at sea.</p>]]></description></item>`,
      ]),
      GOOD_NEWS
    );

    expect(headline?.teaser).toBe("A walrus is back at sea.");
  });
});

describe("news summaries", () => {
  afterEach(() => {
    resetFetch();
    vi.unstubAllEnvs();
  });

  it("summarizes a listed headline once and shares it with every reader", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    useFetch(newsServer);
    const { backend, person } = await ownerIn(null);

    await person.action(api.news.refresh, { kind: "good" });

    await expect(
      person.action(api.news.summarize, { url: STORY_URL })
    ).resolves.toStrictEqual({ status: "ready" });

    const summary = await person.query(api.news.summary, { url: STORY_URL });

    expect(summary).toStrictEqual({
      gist: "Volunteers helped a tired walrus get back to the sea in Maine.",
      kind: "news",
      points: [
        "The walrus came ashore on Saturday.",
        "Volunteers kept people away for six hours.",
        "It swam away when the tide came in.",
      ],
    });

    const { person: neighbour } = await signUp(backend, {
      demo: false,
      name: "Walt Brooks",
      role: "owner",
      subject: "owner-2",
    });

    const calls = fetchMock.mock.calls.length;

    await expect(
      neighbour.action(api.news.summarize, { url: STORY_URL })
    ).resolves.toStrictEqual({ status: "ready" });
    await expect(
      neighbour.query(api.news.summary, { url: STORY_URL })
    ).resolves.toStrictEqual(summary);
    expect(fetchMock).toHaveBeenCalledTimes(calls);
  });

  it("never fetches an address that is not on a headline list", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    useFetch(newsServer);
    const { person } = await ownerIn(null);

    await expect(
      person.action(api.news.summarize, { url: "http://169.254.169.254/" })
    ).resolves.toStrictEqual({ status: "unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads articles only from the publisher's own site", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    useFetch((url) =>
      url === GOOD_NEWS?.feedUrl
        ? respond(
            rss([
              item(
                "Walrus rescued",
                OFF_SITE_URL,
                "Sat, 24 Oct 2026 10:00:00 GMT"
              ),
            ])
          )
        : newsServer(url)
    );
    const { person } = await ownerIn(null);

    await person.action(api.news.refresh, { kind: "good" });

    await expect(
      person.action(api.news.summarize, { url: OFF_SITE_URL })
    ).resolves.toStrictEqual({ status: "unavailable" });
    expect(
      fetchMock.mock.calls.some(
        ([input]) => new Request(input).url === OFF_SITE_URL
      )
    ).toBeFalsy();
  });

  it("gives up quietly when the article can't be read, and waits before trying again", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only-key");
    useFetch((url) =>
      url === STORY_URL ? respond("gone", 404) : newsServer(url)
    );
    const { person } = await ownerIn(null);

    await person.action(api.news.refresh, { kind: "good" });

    await expect(
      person.action(api.news.summarize, { url: STORY_URL })
    ).resolves.toStrictEqual({ status: "unavailable" });
    await expect(
      person.action(api.news.summarize, { url: STORY_URL })
    ).resolves.toStrictEqual({ status: "busy" });
    await expect(
      person.query(api.news.summary, { url: STORY_URL })
    ).resolves.toBeNull();
    expect(
      fetchMock.mock.calls.some(([input]) =>
        new Request(input).url.includes("openrouter.ai")
      )
    ).toBeFalsy();
  });
});

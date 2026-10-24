// LifeLink service worker.
//
// What is cached, and why it is safe:
// - /offline.html and /solitaire: public pages with no personal data.
// - /_next/static/*: content-hashed code, fonts, and styles; identical for everyone.
// - /icons/*: app icons.
// Nothing else is ever cached: signed-in pages, React Server Component
// payloads, Convex traffic, files, and API routes always go to the network.
//
// Bump VERSION when changing this file or offline.html so installed apps refresh.
const VERSION = "v4";
const SHELL_CACHE = `lifelink-shell-${VERSION}`;
const STATIC_CACHE = `lifelink-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PUBLIC_PAGES = ["/solitaire"];
const STATIC_ASSET = /\/_next\/static\/[^"'\s)]+/gu;

// Caching is best effort: a failure only means less is available offline.
const settle = async (work) => {
  try {
    await work;
  } catch {
    // Nothing to do; the page still works online.
  }
};

const cacheStaticAssetsOf = async (html) => {
  const cache = await caches.open(STATIC_CACHE);
  const assets = [...new Set(html.match(STATIC_ASSET))];

  await Promise.all(assets.map((asset) => settle(cache.add(asset))));
};

const cachePublicPage = async (path) => {
  const response = await fetch(
    new Request(path, { cache: "reload", credentials: "omit" })
  );

  if (!response.ok) {
    return;
  }

  const shell = await caches.open(SHELL_CACHE);

  await shell.put(path, response.clone());
  await cacheStaticAssetsOf(await response.text());
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);

      await shell.add(new Request(OFFLINE_URL, { cache: "reload" }));
      await Promise.all(
        PUBLIC_PAGES.map((path) => settle(cachePublicPage(path)))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, STATIC_CACHE]);
      const keys = await caches.keys();

      await Promise.all(
        keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

const isPublicPage = (url) => PUBLIC_PAGES.includes(url.pathname);

const handleNavigation = async (request, url) => {
  if (isPublicPage(url)) {
    try {
      const response = await fetch(request);

      if (response.ok) {
        const shell = await caches.open(SHELL_CACHE);

        await shell.put(url.pathname, response.clone());
        void settle(cacheStaticAssetsOf(await response.clone().text()));
      }

      return response;
    } catch {
      return (
        (await caches.match(url.pathname)) ??
        (await caches.match(OFFLINE_URL)) ??
        Response.error()
      );
    }
  }

  // Private pages are never stored; offline, they get the explanation page.
  try {
    return await fetch(request);
  } catch {
    return (await caches.match(OFFLINE_URL)) ?? Response.error();
  }
};

const handleStatic = async (request) => {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);

    await cache.put(request, response.clone());
  }

  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request, url));

    return;
  }

  // RSC payloads for client-side navigation carry page data; never cache them.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") {
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(handleStatic(request));
  }
});

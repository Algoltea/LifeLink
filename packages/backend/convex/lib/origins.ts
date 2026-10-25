const IPV4_HOST = /^\d{1,3}(?:\.\d{1,3}){3}$/u;
const WWW_PREFIX = "www.";

/**
 * Origins Better Auth accepts for the web app at `siteUrl`. A domain is
 * trusted with and without `www.`, because hosts often redirect one to the
 * other and the browser then sends the origin SITE_URL does not name.
 */
const trustedOriginsFor = (siteUrl: string): string[] => {
  if (!URL.canParse(siteUrl)) {
    return [siteUrl];
  }

  const url = new URL(siteUrl);
  const { hostname } = url;

  if (!hostname.includes(".") || IPV4_HOST.test(hostname)) {
    return [url.origin];
  }

  const counterpart = new URL(url.origin);

  counterpart.hostname = hostname.startsWith(WWW_PREFIX)
    ? hostname.slice(WWW_PREFIX.length)
    : `${WWW_PREFIX}${hostname}`;

  return [url.origin, counterpart.origin];
};

export { trustedOriginsFor };

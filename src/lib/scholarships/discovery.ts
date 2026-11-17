export type DiscoveryFeedType = "sitemap" | "rss" | "atom";

export interface ScholarshipDiscoveryLink {
  url: string;
  lastModified: string | null;
}

export interface ScholarshipDiscoveryOptions {
  feedUrl: string;
  xml: string;
  allowedDomains: readonly string[];
  maxLinks?: number;
}

const DEFAULT_MAX_LINKS = 100;
const TRACKING_PARAMETERS = /^(utm_[^=]+|fbclid|gclid|mc_cid|mc_eid|_ga)$/i;

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function tagValues(xml: string, tagName: string) {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`, "gi");
  return [...xml.matchAll(expression)].map((match) => decodeXml(match[1].trim()));
}

function firstTagValue(xml: string, tagNames: readonly string[]) {
  for (const tagName of tagNames) {
    const value = tagValues(xml, tagName)[0];
    if (value) return value;
  }
  return null;
}

function attributeValue(attributes: string, name: string) {
  const expression = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  return attributes.match(expression)?.[2] ?? null;
}

function normalizedDomain(domain: string) {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/^www\./, "");
}

function isAllowedDomain(url: URL, allowedDomains: readonly string[]) {
  const hostname = normalizedDomain(url.hostname);
  return allowedDomains.some((domain) => {
    const allowed = normalizedDomain(domain);
    return hostname === allowed || hostname.endsWith(`.${allowed}`);
  });
}

/** Canonicalizes a discovered URL while retaining meaningful query parameters. */
export function canonicalizeDiscoveryUrl(value: string, baseUrl?: string) {
  try {
    const url = new URL(value.trim(), baseUrl);
    url.hash = "";
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.toLowerCase();
    if (url.protocol === "https:" && url.port === "443") url.port = "";
    if (url.protocol === "http:" && url.port === "80") url.port = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");

    const sortedParameters = [...url.searchParams.entries()]
      .filter(([key]) => !TRACKING_PARAMETERS.test(key))
      .sort(([left], [right]) => left.localeCompare(right));
    const normalizedParameters = new URLSearchParams();
    for (const [key, parameter] of sortedParameters) normalizedParameters.append(key, parameter);
    url.search = normalizedParameters.toString();
    return url.toString();
  } catch {
    return null;
  }
}

function detectFeedType(xml: string): DiscoveryFeedType {
  if (/<(?:urlset|sitemapindex)(?:\s|>)/i.test(xml)) return "sitemap";
  if (/<feed(?:\s|>)/i.test(xml)) return "atom";
  return "rss";
}

function sitemapLinks(xml: string) {
  return tagValues(xml, "loc").map((url, index) => ({
    url,
    lastModified: tagValues(xml, "lastmod")[index] ?? null,
  }));
}

function rssLinks(xml: string) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => ({
    url: firstTagValue(match[1], ["link", "guid"]),
    lastModified: firstTagValue(match[1], ["pubDate", "lastBuildDate"]),
  })).filter((item): item is { url: string; lastModified: string | null } => Boolean(item.url));
}

function atomLinks(xml: string) {
  return [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map((match) => {
    const links = [...match[1].matchAll(/<link\b([^>]*)\/?>/gi)]
      .map((link) => ({ rel: attributeValue(link[1], "rel"), href: attributeValue(link[1], "href") }))
      .filter((link) => link.href && (!link.rel || link.rel === "alternate"));
    return {
      url: links[0]?.href ?? null,
      lastModified: firstTagValue(match[1], ["updated", "published"]),
    };
  }).filter((item): item is { url: string; lastModified: string | null } => Boolean(item.url));
}

/** Parses an official sitemap, RSS feed, or Atom feed into bounded, canonical links. */
export function discoverScholarshipLinks(options: ScholarshipDiscoveryOptions) {
  const maxLinks = Math.max(0, Math.floor(options.maxLinks ?? DEFAULT_MAX_LINKS));
  if (maxLinks === 0) return [];

  const type = detectFeedType(options.xml);
  const candidates = type === "sitemap"
    ? sitemapLinks(options.xml)
    : type === "atom"
      ? atomLinks(options.xml)
      : rssLinks(options.xml);
  const discovered: ScholarshipDiscoveryLink[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const url = canonicalizeDiscoveryUrl(candidate.url, options.feedUrl);
    if (!url || seen.has(url)) continue;
    try {
      if (!isAllowedDomain(new URL(url), options.allowedDomains)) continue;
    } catch {
      continue;
    }
    seen.add(url);
    discovered.push({ url, lastModified: candidate.lastModified });
    if (discovered.length >= maxLinks) break;
  }

  return discovered;
}

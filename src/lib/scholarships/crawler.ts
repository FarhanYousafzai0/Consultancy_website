import { createHash } from "node:crypto";
import { PDFParse } from "pdf-parse";
import { canonicalizeDiscoveryUrl, discoverScholarshipLinks } from "./discovery";
import { htmlToText } from "./research";
import { retrieveWithUrlContext } from "./grounded-source";

export function allowedSourceUrl(value: string, domains: readonly string[]) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      (!url.port || url.port === "443") &&
      domains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch { return false; }
}

/** Links on a page. Pass `null` domains to keep every public HTTPS link (for citing, never for fetching). */
function publicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && (!url.port || url.port === "443");
  } catch { return false; }
}

export function pageLinks(html: string, base: string, domains: readonly string[] | null) {
  const links: { url: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = canonicalizeDiscoveryUrl(match[1].replace(/&amp;/g, "&"), base);
    if (!url || seen.has(url) || !(domains ? allowedSourceUrl(url, domains) : publicHttpsUrl(url))) continue;
    seen.add(url);
    links.push({ url, label: htmlToText(match[2]) });
  }
  return links;
}

export async function fetchOfficialPage(url: string, domains: readonly string[], fetcher = fetch, allowGroundedFallback = false, keepAllLinks = false) {
  let target = url;
  for (let redirects = 0; redirects <= 5; redirects++) {
    if (!allowedSourceUrl(target, domains)) throw new Error("Source URL is outside the official allowlist");
    const response = await fetcher(target, {
      redirect: "manual",
      signal: AbortSignal.timeout(25000),
      headers: { "user-agent": "ParwaazScholarshipResearch/1.0" },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Redirect without location");
      target = new URL(location, target).href;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      if (allowGroundedFallback && [403, 429].includes(response.status)) {
        const text = await retrieveWithUrlContext(target);
        const links = [...text.matchAll(/https:\/\/[^\s<>"'`)\]]+/g)]
          .map((match) => ({ url: match[0].replace(/[.,;]+$/, ""), label: "" }))
          .filter((link) => allowedSourceUrl(link.url, domains));
        return { url: target, text, links, hash: createHash("sha256").update(text).digest("hex") };
      }
      throw new Error(`Source returned HTTP ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Empty response");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 8_000_000) { await reader.cancel(); throw new Error("Source exceeds 8 MB limit"); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const buffer = Buffer.concat(chunks);
    const contentType = response.headers.get("content-type") ?? "";
    const raw = buffer.toString("utf8");
    let text: string;
    let links: { url: string; label: string }[] = [];
    if (contentType.includes("pdf") || target.split("?")[0].endsWith(".pdf")) {
      const parser = new PDFParse({ data: buffer });
      try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
    } else {
      text = htmlToText(raw);
      links = /xml|rss|atom/.test(contentType)
        ? discoverScholarshipLinks({ xml: raw, feedUrl: target, allowedDomains: domains, maxLinks: 30 }).map((item) => ({ ...item, label: "" }))
        : pageLinks(raw, target, keepAllLinks ? null : domains);
    }
    return { url: target, text, links, hash: createHash("sha256").update(buffer).digest("hex") };
  }
  throw new Error("Too many redirects");
}

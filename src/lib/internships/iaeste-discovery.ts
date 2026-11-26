import { createHash } from "node:crypto";
import { pageLinks } from "./crawler";

const ORIGIN = "https://iaeste.org";
const AGENT = "ParwaazInternshipResearch";
const START = `${ORIGIN}/internships`;

type Options = { fetcher?: typeof fetch; maxListingPages?: number; maxDetails?: number; delayMs?: number };
export type IaesteDiscoveryResult = {
  detailUrls: string[];
  pages: { url: string; html: string; hash: string }[];
  listingPagesFetched: number;
  complete: boolean;
  failures: string[];
};

function safeUrl(value: string, base = START) {
  try {
    const u = new URL(value.replace(/&amp;/gi, "&"), base);
    if (u.origin !== ORIGIN || u.username || u.password) return null;
    u.hash = "";
    return u.href;
  } catch { return null; }
}

// Robots groups with the most specific matching agent take precedence; matching
// rules use longest path, with Allow winning ties (including * and $ patterns).
function robotsAllows(robots: string, url: string) {
  const groups: { agents: string[]; rules: { allow: boolean; pattern: string }[] }[] = [];
  let group: typeof groups[number] | undefined;
  let hadRules = false;
  for (const line of robots.split(/\r?\n/)) {
    const match = line.replace(/#.*$/, "").match(/^\s*([^:]+):\s*(.*?)\s*$/);
    if (!match) continue;
    const key = match[1].toLowerCase();
    if (key === "user-agent") {
      if (!group || hadRules) { group = { agents: [], rules: [] }; groups.push(group); hadRules = false; }
      group.agents.push(match[2].toLowerCase());
    } else if ((key === "allow" || key === "disallow") && group) {
      hadRules = true;
      if (match[2]) group.rules.push({ allow: key === "allow", pattern: match[2] });
    }
  }
  const score = (g: typeof groups[number]) => Math.max(-1, ...g.agents.map(a => a === "*" ? 0 : AGENT.toLowerCase().includes(a) ? a.length : -1));
  const best = Math.max(-1, ...groups.map(score));
  const target = new URL(url).pathname + new URL(url).search;
  let length = -1, allowed = true;
  for (const g of groups.filter(g => score(g) === best)) for (const rule of g.rules) {
    const end = rule.pattern.endsWith("$");
    const pattern = (end ? rule.pattern.slice(0, -1) : rule.pattern).split("*").map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    if (new RegExp(`^${pattern}${end ? "$" : ""}`).test(target)) {
      const n = rule.pattern.replace(/[*$]/g, "").length;
      if (n > length || (n === length && rule.allow)) { length = n; allowed = rule.allow; }
    }
  }
  return allowed;
}

async function readResponse(response: Response, limit: number) {
  if (!response.body) throw new Error("empty response");
  const reader = response.body.getReader();
  const parts: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new Error("response exceeds size limit"); }
      parts.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(parts).toString("utf8");
}

/** Discover IAESTE listings without writing to the database. Completeness covers both listing traversal and detail fetching. */
export async function discoverIaesteInternships(options: Options = {}): Promise<IaesteDiscoveryResult> {
  const fetcher = options.fetcher ?? fetch;
  const maxListings = Math.max(1, Math.min(100, Math.floor(options.maxListingPages ?? 20)));
  const maxDetails = Math.max(0, Math.min(500, Math.floor(options.maxDetails ?? 100)));
  const delay = Math.max(0, options.delayMs ?? 1000);
  const result: IaesteDiscoveryResult = { detailUrls: [], pages: [], listingPagesFetched: 0, complete: false, failures: [] };
  let lastRequest = 0;
  async function request(url: string, robots?: string) {
    let target = url;
    for (let i = 0; i <= 5; i++) {
      const safe = safeUrl(target);
      if (!safe) throw new Error("redirect or URL outside IAESTE origin");
      if (robots !== undefined && !robotsAllows(robots, safe)) throw new Error("blocked by robots.txt");
      const wait = delay - (Date.now() - lastRequest);
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      lastRequest = Date.now();
      const response = await fetcher(safe, { redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "user-agent": `${AGENT}/1.0` } });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location"); await response.body?.cancel();
        if (!location) throw new Error("redirect without location");
        target = new URL(location, safe).href; continue;
      }
      if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
      const type = response.headers.get("content-type") ?? "";
      if (robots === undefined ? !/text\/plain/i.test(type) : !/text\/html/i.test(type)) {
        await response.body?.cancel(); throw new Error(`unexpected content type: ${type}`);
      }
      return { url: safe, body: await readResponse(response, robots === undefined ? 512_000 : 2_000_000) };
    }
    throw new Error("too many redirects");
  }
  let robots: string;
  try { robots = (await request(`${ORIGIN}/robots.txt`)).body; }
  catch (error) { result.failures.push(`robots.txt: ${String(error)}`); return result; }
  const seenListings = new Set<string>(); const details = new Set<string>();
  let next: string | null = START;
  while (next) {
    if (seenListings.has(next)) { result.failures.push(`pagination cycle: ${next}`); break; }
    if (seenListings.size >= maxListings) { result.failures.push("listing page limit reached"); break; }
    seenListings.add(next);
    try {
      const page = await request(next, robots); result.listingPagesFetched++;
      const links = pageLinks(page.body, page.url, ["iaeste.org"]);
      let listingDetails = 0;
      for (const link of links) {
        const safe = safeUrl(link.url);
        if (safe && /^\/internships\/[^/]+\/?$/.test(new URL(safe).pathname)) { const u = new URL(safe); u.search = ""; details.add(u.href); listingDetails++; }
      }
      const nextLinks = [...page.body.matchAll(/<a\b([^>]*)>/gi)].filter(m => /\brel\s*=\s*["'][^"']*\bnext\b/i.test(m[1]));
      const targets = new Set(nextLinks.map(m => m[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]).filter((v): v is string => !!v).map(v => safeUrl(v, page.url)));
      if (targets.has(null) || [...targets].some(v => v && new URL(v).pathname !== "/internships")) throw new Error("unsafe pagination link");
      if (targets.size > 1) throw new Error("ambiguous pagination links");
      if (!listingDetails && !/no internships|no results|no opportunities/i.test(page.body)) throw new Error("unrecognized listing page");
      next = [...targets][0] ?? null;
    } catch (error) { result.failures.push(`${next}: ${String(error)}`); break; }
  }
  result.detailUrls = [...details];
  if (details.size > maxDetails) result.failures.push("detail page limit reached");
  for (const url of result.detailUrls.slice(0, maxDetails)) {
    try {
      const page = await request(url, robots);
      if (!/^\/internships\/[^/]+\/?$/.test(new URL(page.url).pathname)) throw new Error("detail redirected to non-detail page");
      result.pages.push({ url: page.url, html: page.body, hash: createHash("sha256").update(page.body).digest("hex") });
    } catch (error) { result.failures.push(`${url}: ${String(error)}`); }
  }
  result.complete = result.failures.length === 0;
  return result;
}

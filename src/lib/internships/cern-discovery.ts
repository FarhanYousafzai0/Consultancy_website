import { createHash } from "node:crypto";

const origin = "https://careers.cern";
const agent = "ParwaazInternshipResearch";
export type CernPage = { url: string; html: string; hash: string; retrievedAt: string };
export type CernDiscovery = { detailUrls: string[]; pages: CernPage[]; listingPagesFetched: number; complete: boolean; failures: string[] };
type Options = { fetcher?: typeof fetch; maxListingPages?: number; maxDetails?: number; delayMs?: number };

function safe(value: string, base = origin): string | null {
  try { const u = new URL(value.replace(/&amp;/gi, "&"), base); if (u.origin !== origin || u.username || u.password) return null; u.hash = ""; return u.href; } catch { return null; }
}
function allows(robots: string, url: string) {
  const groups: { agents: string[]; rules: { allow: boolean; pattern: string }[] }[] = [];
  let group: typeof groups[number] | undefined; let hasRules = false;
  for (const line of robots.split(/\r?\n/)) {
    const m = line.replace(/#.*$/, "").match(/^\s*([^:]+):\s*(.*?)\s*$/); if (!m) continue;
    const key = m[1].toLowerCase();
    if (key === "user-agent") { if (!group || hasRules) { group = { agents: [], rules: [] }; groups.push(group); hasRules = false; } group.agents.push(m[2].toLowerCase()); }
    else if ((key === "allow" || key === "disallow") && group) { hasRules = true; if (m[2]) group.rules.push({ allow: key === "allow", pattern: m[2] }); }
  }
  const score = (g: typeof groups[number]) => Math.max(-1, ...g.agents.map(a => a === "*" ? 0 : agent.toLowerCase().includes(a) ? a.length : -1));
  const best = Math.max(-1, ...groups.map(score)); const u = new URL(url); const target = u.pathname + u.search;
  let length = -1, allowed = true;
  for (const g of groups.filter(g => score(g) === best && best >= 0)) for (const rule of g.rules) {
    const end = rule.pattern.endsWith("$"); const raw = end ? rule.pattern.slice(0, -1) : rule.pattern;
    const pattern = raw.split("*").map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    if (new RegExp(`^${pattern}${end ? "$" : ""}`).test(target)) { const n = raw.replace(/\*/g, "").length; if (n > length || (n === length && rule.allow)) { length = n; allowed = rule.allow; } }
  }
  return allowed;
}
async function read(response: Response, limit: number) {
  if (!response.body) throw new Error("empty response");
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > limit) { await reader.cancel(); throw new Error("response exceeds size limit"); } chunks.push(value); } } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}
const bound = (value: number | undefined, fallback: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value!))) : fallback;
/** Read-only discovery; complete refers only to traversal of recognised CERN listing pages. */
export async function discoverCernInternships(options: Options = {}): Promise<CernDiscovery> {
  const fetcher = options.fetcher ?? fetch; const delay = bound(options.delayMs, 1000, 0, 60000);
  const maxListings = bound(options.maxListingPages, 20, 1, 100), maxDetails = bound(options.maxDetails, 100, 0, 500);
  const result: CernDiscovery = { detailUrls: [], pages: [], listingPagesFetched: 0, complete: false, failures: [] }; let lastRequest = 0;
  async function request(initial: string, robots?: string) {
    let target = initial;
    for (let i = 0; i <= 5; i++) {
      const url = safe(target); if (!url) throw new Error("URL outside CERN origin");
      if (robots !== undefined && !allows(robots, url)) throw new Error("blocked by robots.txt");
      const wait = delay - (Date.now() - lastRequest); if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait)); lastRequest = Date.now();
      const response = await fetcher(url, { redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "user-agent": `${agent}/1.0` } });
      if (response.status >= 300 && response.status < 400) { const location = response.headers.get("location"); await response.body?.cancel(); if (!location) throw new Error("redirect without location"); target = new URL(location, url).href; continue; }
      if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
      const type = response.headers.get("content-type") ?? ""; if (!(robots === undefined ? /^text\/plain\b/i : /^text\/html\b/i).test(type)) { await response.body?.cancel(); throw new Error(`unexpected content type: ${type}`); }
      return { url, body: await read(response, robots === undefined ? 512000 : 2000000) };
    }
    throw new Error("too many redirects");
  }
  let robots: string; try { robots = (await request(`${origin}/robots.txt`)).body; } catch (e) { result.failures.push(`robots.txt: ${String(e)}`); return result; }
  const seen = new Set<string>(), details = new Set<string>(); let next: string | null = `${origin}/jobs/`;
  while (next) {
    if (seen.has(next)) { result.failures.push(`pagination cycle: ${next}`); break; }
    if (seen.size >= maxListings) { result.failures.push("listing page limit reached"); break; }
    seen.add(next);
    try {
      const page = await request(next, robots); const parsed = new URL(page.url); if (!/^\/jobs\/?$/.test(parsed.pathname)) throw new Error("listing redirected to non-listing page"); result.listingPagesFetched++;
      let recognized = 0; const nextTargets = new Set<string>();
      for (const m of page.body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
        const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(m[1])?.[1]; if (!href) continue;
        const url = safe(href, page.url);
        if (/\brel\s*=\s*["'][^"']*\bnext\b/i.test(m[1]) || /\bclass\s*=\s*["'][^"']*\bnext\b/i.test(m[1])) { if (!url || !/^\/jobs\/?$/.test(new URL(url).pathname)) throw new Error("unsafe pagination link"); nextTargets.add(url); }
        if (url && /^\/jobs\/[^/]+\/?$/.test(new URL(url).pathname)) { recognized++; if (/intern(?:ship)?|student|studentship/i.test(m[2].replace(/<[^>]*>/g, " "))) { const u = new URL(url); u.search = ""; u.pathname = u.pathname.replace(/\/$/, "") + "/"; details.add(u.href); } }
      }
      if (!recognized && !/no (?:job openings|results|vacancies)/i.test(page.body)) throw new Error("unrecognized listing page");
      if (nextTargets.size > 1) throw new Error("ambiguous pagination links"); next = [...nextTargets][0] ?? null;
    } catch (e) { result.failures.push(`${next}: ${String(e)}`); break; }
  }
  result.detailUrls = [...details]; if (details.size > maxDetails) result.failures.push("detail page limit reached");
  for (const url of result.detailUrls.slice(0, maxDetails)) try { const page = await request(url, robots); if (!/^\/jobs\/[^/]+\/?$/.test(new URL(page.url).pathname)) throw new Error("detail redirected to non-detail page"); result.pages.push({ url: page.url, html: page.body, hash: createHash("sha256").update(page.body).digest("hex"), retrievedAt: new Date().toISOString() }); } catch (e) { result.failures.push(`${url}: ${String(e)}`); }
  result.complete = result.failures.length === 0; return result;
}

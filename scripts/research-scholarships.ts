import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { scholarshipSources, type ScholarshipSource } from "../src/data/scholarship-sources";
import { extractScholarshipsFromSource } from "../src/lib/scholarships/research";
import { allowedSourceUrl, fetchOfficialPage } from "../src/lib/scholarships/crawler";
import { catalogueIds, discoverCatalogueSources, distinctScholarshipName, type CatalogueId } from "../src/lib/scholarships/catalogues";
import { normalizeOfficialUrl } from "../src/lib/scholarships/normalize";
import { scholarshipAvailability } from "../src/lib/scholarships/status";
import { upsertScholarshipFromResearch, listScholarships, retireStaleResearchScholarships } from "../src/lib/db/scholarships";
import { finishResearchRun, startResearchRun } from "../src/lib/db/research-runs";
import { getResearchSourceState, updateResearchSourceState } from "../src/lib/db/research-sources";

const arg = (name: string) => process.argv.find((value) => value.startsWith(`--${name}=`))?.split("=")[1];
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const selection = arg("sources")?.split(",");
// --catalogues=none skips the catalogue sweep; --catalogues=daad picks one.
const catalogueArg = arg("catalogues");
const catalogues = (catalogueArg === "none" ? [] : catalogueArg?.split(",") ?? [...catalogueIds]) as CatalogueId[];
const concurrency = Math.max(1, Math.min(12, Number(arg("concurrency")) || 6));

type Metrics = { succeeded: number; failed: number; google: number; openai: number; records: number; active: number };

async function researchSource(source: ScholarshipSource, metrics: Metrics) {
  const domains = [source.domain, ...(source.allowedDomains ?? [])];
  const queue = [...new Set([source.url, ...(source.urls ?? []), ...[source.sitemapUrl, source.rssUrl].filter((url): url is string => Boolean(url))])];
  const seen = new Set<string>();
  const pages: Awaited<ReturnType<typeof fetchOfficialPage>>[] = [];
  const failures: string[] = [];
  while (queue.length && seen.size < Math.min(source.maxPages ?? 6, 8)) {
    const url = queue.shift()!;
    if (seen.has(url) || !allowedSourceUrl(url, domains)) continue;
    seen.add(url);
    try {
      const page = await fetchOfficialPage(url, domains, fetch, true, source.trustPageLinks);
      pages.push(page);
      // A catalogue entry names the provider's own site ("Weblink"); deadlines usually live there.
      if (source.trustPageLinks && pages.length === 1) {
        for (const link of page.links.filter((item) => /weblink|website|homepage/i.test(item.label)).slice(0, 2)) {
          const host = new URL(link.url).hostname.replace(/^www\./, "");
          if (!allowedSourceUrl(link.url, domains)) domains.push(host);
          if (!queue.includes(link.url)) queue.unshift(link.url);
        }
      }
      // Explicit companion pages are first; follow relevant detail pages and PDFs after them.
      for (const link of page.links) {
        if (/scholarship|funding|financial.?aid|admission|deadline|application|\.pdf/i.test(link.url + " " + link.label) &&
          !/login|logout|privacy|cookie|facebook|twitter/i.test(link.url) && !seen.has(link.url) && !queue.includes(link.url) &&
          allowedSourceUrl(link.url, domains)) {
          queue.push(link.url);
        }
      }
    } catch (error) { failures.push(`${url}: ${error instanceof Error ? error.message : "fetch failed"}`); }
  }
  if (!pages.length) throw new Error(failures.join("; "));
  const hash = createHash("sha256").update("evidence-v2").update(pages.map((page) => page.url + page.hash).sort().join("|")).digest("hex");
  const previous = dryRun ? null : await getResearchSourceState(source.id);
  if (!force && previous?.contentHash === hash && !previous.lastError) {
    metrics.succeeded++;
    console.info(`[scholarships] ${source.id}: processed content unchanged`);
    return;
  }
  const text = pages.map((page) => `PAGE URL: ${page.url}\n${page.text.slice(0, 20000)}\nOfficial links:\n${page.links.slice(0, 60).map((link) => `${link.label}: ${link.url}`).join("\n")}`).join("\n\n");
  const extracted = await extractScholarshipsFromSource({ sourceUrl: source.url, sourceName: source.name, text });
  metrics[extracted.provider]++;
  const fetched = new Set(pages.map((page) => normalizeOfficialUrl(page.url)));
  const known = new Set([...fetched, ...pages.flatMap((page) => page.links.map((link) => normalizeOfficialUrl(link.url)))]);
  let published = 0;
  for (const item of extracted.scholarships) {
    // Catalogue entries and single-page sources are cited by their entry page.
    if (!fetched.has(normalizeOfficialUrl(item.sourceUrl)) && (pages.length === 1 || source.trustPageLinks)) item.sourceUrl = pages[0].url;
    if (!fetched.has(normalizeOfficialUrl(item.sourceUrl))) {
      console.warn(`[scholarships] ${source.id}: rejected unsupported source URL for ${item.name}`);
      continue;
    }
    const applicationGrounded = known.has(normalizeOfficialUrl(item.applicationUrl)) &&
      (source.trustPageLinks || allowedSourceUrl(item.applicationUrl, domains));
    if (!applicationGrounded) {
      // Portals often sit off-site or behind scripts; send students to the official page we read instead.
      console.warn(`[scholarships] ${source.id}: application URL not on the page, using source page for ${item.name}`);
      item.applicationUrl = item.sourceUrl;
    }
    if (!item.studyCountries?.length || (!item.amountSummary && !item.coverage)) continue;
    item.name = distinctScholarshipName(source, item.name);
    // A shared admissions URL can serve many separate scholarships. Never merge by portal URL.
    const identity = source.id + "|" + item.name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim() + "|" + [...item.levels].sort().join(",");
    item.slug = `${source.id}-${createHash("sha256").update(identity).digest("hex").slice(0, 16)}`;
    item.sourceContentHash = hash;
    item.sourceDomain = new URL(item.sourceUrl).hostname;
    const status = scholarshipAvailability({ cycles: item.cycles });
    if (!dryRun) await upsertScholarshipFromResearch(item);
    published++;
    metrics.records++;
    if (status === "open" || status === "closing_soon") metrics.active++;
    console.info(`[scholarships] ${source.id}: ${status} | ${item.name} | ${item.studyCountries.join(",")} | ${item.cycles.map((cycle) => cycle.closeAt ?? "undated").join(",")}`);
  }
  if (!dryRun && published > 0) {
    const retired = await retireStaleResearchScholarships(source.id, hash);
    if (retired) console.info(`[scholarships] ${source.id}: unpublished ${retired} records from an older read`);
  }
  // Commit crawl state only after extraction/publication succeeds, so failed runs retry.
  if (!dryRun) await updateResearchSourceState(source.id, {
    contentHash: published > 0 ? hash : null,
    lastCheckedAt: new Date(), lastSuccessfulFetchAt: new Date(),
    lastError: failures.length ? failures.join("; ").slice(0, 2000) : null,
  });
  metrics.succeeded++;
  console.info(`[scholarships] ${source.id}: ${pages.length} pages, ${published} ${dryRun ? "validated" : "published"} records via ${extracted.provider}; ${failures.length} fetch failures`);
  for (const failure of failures) console.warn("[scholarships] " + failure);
}

async function main() {
  if (!process.env.CRON_SECRET?.trim()) throw new Error("CRON_SECRET is required");
  if (catalogues.some((id) => !catalogueIds.includes(id))) throw new Error("Unknown catalogue ID");
  const discovered = await discoverCatalogueSources(catalogues);
  for (const error of discovered.errors) console.error(`[scholarships] ${error}`);
  const staticIds = new Set(scholarshipSources.map((source) => source.id));
  const allSources = [...scholarshipSources, ...discovered.sources.filter((source) => !staticIds.has(source.id))];
  if (selection?.some((id) => !allSources.some((source) => source.id === id))) throw new Error("Unknown source ID");
  const sources = allSources.filter((source) => !selection || selection.includes(source.id));
  console.info(`[scholarships] ${sources.length} sources (${scholarshipSources.length} curated, ${discovered.sources.length} from catalogues), concurrency ${concurrency}`);

  const run = dryRun ? null : await startResearchRun(sources.length);
  const metrics: Metrics = { succeeded: 0, failed: 0, google: 0, openai: 0, records: 0, active: 0 };
  const pending = [...sources];
  await Promise.all(Array.from({ length: concurrency }, async () => {
    for (let source = pending.shift(); source; source = pending.shift()) {
      try {
        await researchSource(source, metrics);
      } catch (error) {
        metrics.failed++;
        const message = error instanceof Error ? error.message : "Unknown research failure";
        if (!dryRun) await updateResearchSourceState(source.id, { lastCheckedAt: new Date(), lastError: message.slice(0, 2000) });
        console.error(`[scholarships] ${source.id}: ${message}`);
      }
    }
  }));
  if (discovered.errors.length) metrics.failed += discovered.errors.length;

  if (run) await finishResearchRun(run._id.toString(), {
    status: metrics.failed ? "failed" : "completed", ...metrics,
  });
  console.info("[scholarships] " + JSON.stringify({ dryRun, ...metrics }));
  if (!dryRun) {
    const records = await listScholarships();
    console.info("[scholarships] live directory " + JSON.stringify({
      total: records.length,
      active: records.filter((item) => ["open", "closing_soon"].includes(scholarshipAvailability(item))).length,
      countries: [...new Set(records.flatMap((item) => item.studyCountries))].sort(),
    }));
  }
  // Individual sites fail every week (timeouts, bot walls); only a broken catalogue fails the job.
  if (discovered.errors.length || metrics.succeeded === 0) process.exitCode = 1;
}

void main().catch((error) => { console.error(error instanceof Error ? error.message : "Research failed"); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());

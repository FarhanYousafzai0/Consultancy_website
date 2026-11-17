import type { ScholarshipSource } from "@/data/scholarship-sources";

/**
 * Official catalogues that list many scholarships at once. Each entry becomes
 * its own research source, so the weekly run covers the whole catalogue rather
 * than one hand-picked page per provider.
 */

/** DAAD database codes, from www2.daad.de/bundles/daadstipendiendatenbanklsh/data/a/js/*.js */
export const DAAD_ORIGIN_PAKISTAN = 194;
const DAAD_STATUS_GRADUATES = 3;
const DAAD_INTENTION_STUDY = 1;

export const DAAD_DATA_URL =
  "https://www2.daad.de/bundles/daadstipendiendatenbanklsh/data/a/js/scholarships.js";
export const ERASMUS_MUNDUS_CATALOGUE_URL =
  "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en";

type DaadProgramme = {
  sapProgid: number;
  nameEn: string;
  status: number[];
  origin: number[];
  intentions: number[];
};

/** The DAAD data files are `var x = TAFFY([...]);` wrappers around plain JSON. */
export function parseTaffyData<T>(script: string): T[] {
  const start = script.indexOf("TAFFY(");
  const end = script.lastIndexOf(")");
  if (start < 0 || end <= start) throw new Error("Unexpected DAAD data format");
  const data = JSON.parse(script.slice(start + "TAFFY(".length, end));
  if (!Array.isArray(data)) throw new Error("Unexpected DAAD data format");
  return data as T[];
}

export function daadDetailUrl(sapProgid: number, origin = DAAD_ORIGIN_PAKISTAN) {
  // Origin and status make the server render the deadline for that applicant group.
  return `https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?daad=&detail=${sapProgid}&intention=&origin=${origin}&page=1&q=&status=${DAAD_STATUS_GRADUATES}&subjectGrps=`;
}

/** Master's-level study funding in the DAAD database that is open to applicants from `origin`. */
export function daadSources(script: string, origin = DAAD_ORIGIN_PAKISTAN): ScholarshipSource[] {
  return parseTaffyData<DaadProgramme>(script)
    .filter((item) =>
      item.origin?.includes(origin) &&
      item.status?.includes(DAAD_STATUS_GRADUATES) &&
      item.intentions?.includes(DAAD_INTENTION_STUDY) &&
      Number.isInteger(item.sapProgid)
    )
    .map((item) => ({
      id: `daad-${item.sapProgid}`,
      name: item.nameEn.trim(),
      domain: "daad.de",
      url: daadDetailUrl(item.sapProgid, origin),
      country: "DE",
      levels: ["master"],
      // The detail page plus the provider site it links to; the DAAD menu only adds noise.
      maxPages: 3,
      // External foundations are linked from the DAAD page; cite those links as found.
      trustPageLinks: true,
    }));
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/** Programme cards from one page of the EACEA Erasmus Mundus catalogue. */
export function parseErasmusMundusCatalogue(html: string) {
  const programmes: { name: string; url: string }[] = [];
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*data-ecl-title-link[^>]*>([\s\S]*?)<\/a>/gi)) {
    const name = decodeEntities(match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    let url: URL;
    try { url = new URL(decodeEntities(match[1])); } catch { continue; }
    if (url.protocol !== "https:" && url.protocol !== "http:") continue;
    url.protocol = "https:";
    if (name) programmes.push({ name, url: url.href });
  }
  return programmes;
}

export function erasmusMundusLastPage(html: string) {
  const pages = [...html.matchAll(/[?&]page=(\d+)/g)].map((match) => Number(match[1]));
  return pages.length ? Math.max(...pages) : 0;
}

function sourceIdFromHost(prefix: string, url: string) {
  const { hostname, pathname } = new URL(url);
  const host = hostname.replace(/^www\./, "");
  const path = pathname.replace(/\/+$/, "");
  return `${prefix}-${(host + path).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`.slice(0, 80);
}

export function erasmusMundusSources(programmes: { name: string; url: string }[]): ScholarshipSource[] {
  const seen = new Set<string>();
  const sources: ScholarshipSource[] = [];
  for (const programme of programmes) {
    const id = sourceIdFromHost("em", programme.url);
    if (seen.has(id)) continue;
    seen.add(id);
    sources.push({
      id,
      name: `${programme.name} (Erasmus Mundus Joint Master)`,
      domain: new URL(programme.url).hostname.replace(/^www\./, ""),
      url: programme.url,
      country: "EU",
      levels: ["master"],
      maxPages: 4,
    });
  }
  return sources;
}

const EM_SUFFIX = " (Erasmus Mundus Joint Master)";

/**
 * Programme sites often call their award just "Erasmus Mundus Scholarship",
 * which makes dozens of different programmes look identical. Name it after
 * the programme from the catalogue instead.
 */
export function distinctScholarshipName(source: Pick<ScholarshipSource, "id" | "name">, extractedName: string) {
  if (!source.id.startsWith("em-") || !source.name.endsWith(EM_SUFFIX)) return extractedName;
  const generic = /^(the\s+)?(em|emjm|erasmus\s*mundus)(\s+joint)?(\s+master('?s)?)?(\s+(degree|programme|program))?\s+scholarships?$/i;
  if (!generic.test(extractedName.trim())) return extractedName;
  return `${source.name.slice(0, -EM_SUFFIX.length)}: Erasmus Mundus Scholarship`;
}

const userAgent = "ParwaazScholarshipResearch/1.0";

async function fetchText(url: string, fetcher: typeof fetch) {
  const response = await fetcher(url, {
    signal: AbortSignal.timeout(30000),
    headers: { "user-agent": userAgent },
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

export const catalogueIds = ["daad", "erasmus-mundus"] as const;
export type CatalogueId = (typeof catalogueIds)[number];

export async function discoverCatalogueSources(
  which: readonly CatalogueId[] = catalogueIds,
  fetcher: typeof fetch = fetch
) {
  const sources: ScholarshipSource[] = [];
  const errors: string[] = [];

  if (which.includes("daad")) {
    try {
      sources.push(...daadSources(await fetchText(DAAD_DATA_URL, fetcher)));
    } catch (error) {
      errors.push(`daad catalogue: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  if (which.includes("erasmus-mundus")) {
    try {
      const first = await fetchText(ERASMUS_MUNDUS_CATALOGUE_URL, fetcher);
      const programmes = parseErasmusMundusCatalogue(first);
      const lastPage = Math.min(erasmusMundusLastPage(first), 30);
      for (let page = 1; page <= lastPage; page++) {
        programmes.push(...parseErasmusMundusCatalogue(await fetchText(`${ERASMUS_MUNDUS_CATALOGUE_URL}?page=${page}`, fetcher)));
      }
      sources.push(...erasmusMundusSources(programmes));
    } catch (error) {
      errors.push(`erasmus-mundus catalogue: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  return { sources, errors };
}

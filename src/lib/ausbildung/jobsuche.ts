/**
 * Bundesagentur für Arbeit Jobsuche API (public, via bund.dev conventions).
 * Docs: https://jobsuche.api.bund.dev/
 * Search: GET .../pc/v6/jobs
 * Auth header: X-API-Key: jobboerse-jobsuche (public key used by the official apps)
 * angebotsart=4 → Ausbildung / duales Studium
 */

import type { AusbildungField } from "@/lib/eligibility/types";

export const JOBSUCHE_BASE =
  "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs";

export const JOBSUCHE_API_KEY = "jobboerse-jobsuche";

/** angebotsart=4 filters to Ausbildung / dual study offers */
export const ANGEBOTSART_AUSBILDUNG = 4;

const FIELD_KEYWORDS: Record<AusbildungField, string> = {
  it: "Fachinformatiker",
  nursing: "Pflegefachmann",
  mechatronics: "Mechatroniker",
  hospitality: "Hotelfachmann",
  trades: "Elektroniker",
  other: "Ausbildung",
};

export function keywordForField(field: string | null | undefined): string {
  if (!field) return "Ausbildung";
  if (field in FIELD_KEYWORDS) {
    return FIELD_KEYWORDS[field as AusbildungField];
  }
  return "Ausbildung";
}

export type AusbildungListing = {
  id: string;
  title: string;
  employer: string;
  city: string;
  url: string;
  publishedAt: string | null;
};

export type JobsucheSearchParams = {
  q?: string;
  field?: string;
  where?: string;
  page?: number;
  size?: number;
};

export type JobsucheSearchResult = {
  listings: AusbildungListing[];
  page: number;
  size: number;
  total: number;
};

type RawJob = {
  refnr?: string;
  referenznummer?: string;
  titel?: string;
  beruf?: string;
  arbeitgeber?: string;
  arbeitsort?: { ort?: string; region?: string; plz?: string };
  externeUrl?: string;
  aktuelleVeroeffentlichungsdatum?: string;
  eintrittsdatum?: string;
};

type RawSearchResponse = {
  stellenangebote?: RawJob[];
  maxErgebnisse?: number | string;
  page?: number;
  size?: number;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; value: JobsucheSearchResult }>();

export function cacheKey(params: JobsucheSearchParams): string {
  return JSON.stringify({
    q: params.q ?? "",
    field: params.field ?? "",
    where: params.where ?? "",
    page: params.page ?? 1,
    size: params.size ?? 20,
  });
}

export function normalizeListing(raw: RawJob): AusbildungListing | null {
  const id = String(raw.refnr || raw.referenznummer || "").trim();
  const title = String(raw.titel || raw.beruf || "").trim();
  if (!id || !title) return null;

  const city =
    raw.arbeitsort?.ort?.trim() ||
    raw.arbeitsort?.region?.trim() ||
    "Germany";

  // Public Jobsuche detail page — works without encoding the ref for basic UX
  const url =
    raw.externeUrl?.trim() ||
    `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(id)}`;

  return {
    id,
    title,
    employer: String(raw.arbeitgeber || "Employer").trim() || "Employer",
    city,
    url,
    publishedAt: raw.aktuelleVeroeffentlichungsdatum?.trim() || null,
  };
}

export function normalizeSearchResponse(
  data: RawSearchResponse,
  page: number,
  size: number
): JobsucheSearchResult {
  const listings = (data.stellenangebote ?? [])
    .map(normalizeListing)
    .filter((x): x is AusbildungListing => Boolean(x));
  const totalRaw = data.maxErgebnisse;
  const total =
    typeof totalRaw === "number"
      ? totalRaw
      : typeof totalRaw === "string"
        ? Number(totalRaw) || listings.length
        : listings.length;
  return { listings, page, size, total };
}

export function buildJobsucheUrl(params: JobsucheSearchParams): string {
  const page = Math.max(1, params.page ?? 1);
  const size = Math.min(50, Math.max(1, params.size ?? 20));
  const was =
    params.q?.trim() || keywordForField(params.field) || "Ausbildung";
  const url = new URL(JOBSUCHE_BASE);
  url.searchParams.set("angebotsart", String(ANGEBOTSART_AUSBILDUNG));
  url.searchParams.set("was", was);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("pav", "false");
  if (params.where?.trim()) {
    url.searchParams.set("wo", params.where.trim());
  }
  return url.toString();
}

export async function searchJobsuche(
  params: JobsucheSearchParams,
  fetchImpl: typeof fetch = fetch
): Promise<JobsucheSearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const size = Math.min(50, Math.max(1, params.size ?? 20));
  const key = cacheKey({ ...params, page, size });
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.value;
  }

  const res = await fetchImpl(buildJobsucheUrl({ ...params, page, size }), {
    headers: {
      "X-API-Key": JOBSUCHE_API_KEY,
      Accept: "application/json",
      "User-Agent":
        "ParwazConsultancy/1.0 (Ausbildung listings; +https://parwaz)",
    },
  });

  if (!res.ok) {
    throw new Error(`Jobsuche request failed (${res.status})`);
  }

  const data = (await res.json()) as RawSearchResponse;
  const value = normalizeSearchResponse(data, page, size);
  cache.set(key, { at: Date.now(), value });
  return value;
}

/** Test helper — clear in-memory cache between tests. */
export function clearJobsucheCache() {
  cache.clear();
}

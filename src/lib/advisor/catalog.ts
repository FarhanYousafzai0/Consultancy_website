import { listPrograms } from "@/lib/db/programs";
import { listScholarships } from "@/lib/db/scholarships";
import { listGuides } from "@/lib/db/guides";
import type {
  GuideRecord,
  ProgramRecord,
  ScholarshipRecord,
} from "@/lib/db/types";

export type AdvisorCatalog = {
  programs: ProgramRecord[];
  scholarships: ScholarshipRecord[];
  guides: GuideRecord[];
  loadedAt: number;
};

const TTL_MS = 5 * 60 * 1000;

let cache: AdvisorCatalog | null = null;
let inflight: Promise<AdvisorCatalog> | null = null;

export function invalidateCatalog() {
  cache = null;
}

export async function getCatalog(): Promise<AdvisorCatalog> {
  if (cache && Date.now() - cache.loadedAt < TTL_MS) {
    return cache;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    const [programs, scholarships, guides] = await Promise.all([
      listPrograms({ status: "published" }),
      listScholarships({ status: "published" }),
      listGuides({ status: "published" }),
    ]);
    cache = {
      programs,
      scholarships,
      guides,
      loadedAt: Date.now(),
    };
    return cache;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function searchGuidesInMemory(
  guides: GuideRecord[],
  query: string,
  limit = 4
): GuideRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return guides.slice(0, limit);
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = guides
    .map((g) => {
      const hay = `${g.title} ${g.topic} ${g.body}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (g.title.toLowerCase().includes(t)) score += 5;
        if (g.topic.toLowerCase().includes(t)) score += 3;
        if (hay.includes(t)) score += 1;
      }
      return { g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.g);
}

import type { MetadataRoute } from "next";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import { ensureGuidesSeeded, listGuides } from "@/lib/db/guides";
import { ensureScholarshipsSeeded, listScholarships } from "@/lib/db/scholarships";
import { STUDY_LANDING_SLUGS } from "@/lib/seo/study-landings";

function siteOrigin() {
  return (
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const staticRoutes = [
    "",
    "/check",
    "/programs",
    "/scholarships",
    "/guides",
    "/ausbildung",
    "/stories",
    "/community",
    "/webinars",
    "/tools/grade-converter",
    "/tools/cost-calculator",
    "/how-we-verify",
    "/privacy",
    "/terms",
    ...STUDY_LANDING_SLUGS.map((s) => `/study/${s}`),
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: path.startsWith("/study") ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    await Promise.all([
      ensureSeeded(),
      ensureGuidesSeeded(),
      ensureScholarshipsSeeded(),
    ]);
    const [programs, guides, scholarships] = await Promise.all([
      listPrograms({ status: "published" }),
      listGuides({ status: "published" }),
      listScholarships({ status: "published" }),
    ]);
    for (const p of programs) {
      entries.push({
        url: `${origin}/programs/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const g of guides) {
      entries.push({
        url: `${origin}/guides/${g.slug}`,
        lastModified: g.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
    for (const s of scholarships) {
      entries.push({
        url: `${origin}/scholarships/${s.id}`,
        lastModified: s.updatedAt,
        changeFrequency: "weekly",
        priority: 0.55,
      });
    }
  } catch (error) {
    console.error("[sitemap]", error);
  }

  return entries;
}

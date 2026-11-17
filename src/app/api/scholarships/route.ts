import { NextResponse } from "next/server";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import {
  ensureScholarshipsSeeded,
  listScholarships,
} from "@/lib/db/scholarships";
import { matchScholarships } from "@/lib/matching/scholarships";
import { scholarshipPurposeOf } from "@/lib/daad/catalog";
import type { ProgramField } from "@/lib/db/types";
import { scholarshipAvailability, scholarshipDeadline } from "@/lib/scholarships/status";
import { normalizeCountry, normalizeNationality } from "@/lib/scholarships/normalize";

const availabilityValues = new Set([
  "open",
  "closing_soon",
  "opening_soon",
  "closed",
  "unknown",
  "active",
  "all",
]);

const openFirstAvailabilityRank = {
  open: 0,
  closing_soon: 0,
  opening_soon: 1,
  unknown: 2,
  closed: 3,
} as const;

function normalizeCodes(values: string[], normalize: (value: string) => string | null) {
  return [...new Set(values.map(normalize).filter((value): value is string => Boolean(value)))];
}

function decorate(scholarship: Awaited<ReturnType<typeof listScholarships>>[number]) {
  const availability = scholarshipAvailability(scholarship);
  return {
    ...scholarship,
    studyCountries: normalizeCodes(scholarship.studyCountries, normalizeCountry),
    nationalities: normalizeCodes(scholarship.nationalities, normalizeNationality),
    availability,
    deadline: scholarshipDeadline(scholarship),
  };
}

function countryLabel(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export async function GET(request: Request) {
  await ensureScholarshipsSeeded();
  const { searchParams } = new URL(request.url);
  const field = searchParams.get("field") as ProgramField | null;
  const level = searchParams.get("level")?.trim().toLowerCase() || null;
  const country = normalizeCountry(searchParams.get("country"));
  const nationality = normalizeNationality(searchParams.get("nationality"));
  const funding = searchParams.get("funding")?.trim().toLowerCase() || null;
  const requestedStatus = searchParams.get("status")?.trim().toLowerCase() || "open";
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const sort = searchParams.get("sort")?.trim().toLowerCase() || "relevance";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const provider = searchParams.get("provider")?.trim().toLowerCase() || null;
  const purpose = searchParams.get("purpose")?.trim().toLowerCase() || null;
  const q = searchParams.get("q")?.trim().toLowerCase() || null;
  const qualify = searchParams.get("qualify") === "1";

  const publishedScholarships = (await listScholarships({ status: "published" })).map(decorate);
  const countryCounts = new Map<string, number>();
  for (const scholarship of publishedScholarships) {
    for (const code of scholarship.studyCountries) {
      countryCounts.set(code, (countryCounts.get(code) ?? 0) + 1);
    }
  }
  const facets = {
    countries: [...countryCounts.entries()]
      .sort(([a], [b]) => countryLabel(a).localeCompare(countryLabel(b)))
      .map(([value, count]) => ({ value, label: countryLabel(value), count })),
  };
  let scholarships = publishedScholarships;

  if (!availabilityValues.has(requestedStatus)) {
    return NextResponse.json({ error: "Invalid scholarship status" }, { status: 400 });
  }
  if (requestedStatus === "open") {
    scholarships = scholarships.filter((s) => s.availability === "open" || s.availability === "closing_soon");
  } else if (requestedStatus === "active") {
    // Everything a student could still act on: open, upcoming, or dates not yet published.
    scholarships = scholarships.filter((s) => s.availability !== "closed");
  } else if (requestedStatus !== "all") {
    scholarships = scholarships.filter((s) => s.availability === requestedStatus);
  }

  if (field) {
    scholarships = scholarships.filter((s) => s.fields.includes(field));
  }
  if (level === "bachelor" || level === "master" || level === "phd") {
    scholarships = scholarships.filter((s) => s.levels.includes(level));
  }
  if (country) {
    scholarships = scholarships.filter((s) => s.studyCountries.includes(country));
  }
  if (nationality) {
    scholarships = scholarships.filter((s) =>
      s.nationalities.includes("any") || s.nationalities.includes(nationality)
    );
  }
  if (funding) {
    scholarships = scholarships.filter((s) => s.fundingType === funding);
  }
  if (provider) {
    scholarships = scholarships.filter((s) =>
      s.provider.toLowerCase().includes(provider)
    );
  }
  if (purpose === "study" || purpose === "research" || purpose === "language") {
    scholarships = scholarships.filter(
      (s) => scholarshipPurposeOf(s) === purpose
    );
  }
  if (q) {
    scholarships = scholarships.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.amountSummary.toLowerCase().includes(q) ||
        s.fields.some((value) => value.toLowerCase().includes(q)) ||
        s.studyCountries.some(
          (value) =>
            value.toLowerCase().includes(q) ||
            countryLabel(value).toLowerCase().includes(q)
        )
    );
  }

  if (Number.isInteger(year) && year > 2000) {
    scholarships = scholarships.filter((s) =>
      s.cycles.some((cycle) =>
        [cycle.openAt, cycle.closeAt].some((date) => date?.startsWith(`${year}-`))
      )
    );
  }
  if (Number.isInteger(month) && month >= 1 && month <= 12) {
    const monthValue = String(month).padStart(2, "0");
    scholarships = scholarships.filter((s) =>
      s.cycles.some((cycle) =>
        [cycle.openAt, cycle.closeAt].some((date) => date?.slice(5, 7) === monthValue)
      )
    );
  }

  scholarships.sort((a, b) => {
    if (sort === "open_first") {
      const availabilityDelta =
        openFirstAvailabilityRank[a.availability] - openFirstAvailabilityRank[b.availability];
      if (availabilityDelta !== 0) return availabilityDelta;

      // Within a group, the most urgent deadline first; undated last.
      const deadlineDelta = (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31");
      if (deadlineDelta !== 0) return deadlineDelta;
      return a.name.localeCompare(b.name);
    }
    if (sort === "deadline") {
      return (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31");
    }
    if (sort === "verified") {
      return (b.lastVerifiedAt ?? "").localeCompare(a.lastVerifiedAt ?? "");
    }
    if (sort === "newest") {
      return b.createdAt.localeCompare(a.createdAt);
    }
    return a.name.localeCompare(b.name);
  });

  const totalBeforePage = scholarships.length;
  const pageStart = (page - 1) * pageSize;
  const pagedScholarships = scholarships.slice(pageStart, pageStart + pageSize);

  if (qualify) {
    const answersRaw = searchParams.get("answers");
    if (!answersRaw) {
      return NextResponse.json(
        { error: "answers required when qualify=1" },
        { status: 400 }
      );
    }
    let answers: EligibilityAnswers;
    try {
      answers = JSON.parse(answersRaw) as EligibilityAnswers;
    } catch {
      return NextResponse.json({ error: "Invalid answers JSON" }, { status: 400 });
    }
    const { matches } = matchScholarships(
      answers,
      scholarships
    );
    const pagedMatches = matches.slice(pageStart, pageStart + pageSize);
    return NextResponse.json({
      total: matches.length,
      page,
      pageSize,
      hasMore: pageStart + pageSize < matches.length,
      meta: { total: matches.length, page, pageSize, hasMore: pageStart + pageSize < matches.length },
      facets,
      scholarships: pagedMatches.map((m) => ({
        ...m.scholarship,
        odds: m.odds,
        reasons: m.reasons,
      })),
    });
  }

  return NextResponse.json({
    total: totalBeforePage,
    page,
    pageSize,
    hasMore: pageStart + pageSize < totalBeforePage,
    meta: { total: totalBeforePage, page, pageSize, hasMore: pageStart + pageSize < totalBeforePage },
    facets,
    scholarships: pagedScholarships.map((s) => ({
      ...s,
      odds: null,
      reasons: [],
    })),
  });
}

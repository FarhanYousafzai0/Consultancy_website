import { z } from "zod";
import { tool } from "ai";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import { emptyAnswers } from "@/lib/eligibility/types";
import { isProfileComplete } from "@/lib/eligibility/evaluate";
import { applyProgramFilters } from "@/lib/programs/filters";
import { matchPrograms } from "@/lib/matching/match";
import { matchScholarships } from "@/lib/matching/scholarships";
import type { AdvisorSource } from "@/lib/db/advisor-threads";
import {
  getCatalog,
  searchGuidesInMemory,
} from "@/lib/advisor/catalog";

export type ToolContext = {
  answers: EligibilityAnswers;
};

export type StructuredToolResult = {
  kind:
    | "programs"
    | "eligibility"
    | "deadlines"
    | "scholarships"
    | "checklist"
    | "guides"
    | "message";
  text: string;
  items?: Array<Record<string, unknown>>;
  sources: AdvisorSource[];
};

function mergeAnswers(
  base: EligibilityAnswers,
  override?: Partial<EligibilityAnswers> | null
): EligibilityAnswers {
  if (!override) return base;
  return { ...emptyAnswers(), ...base, ...override };
}

export async function toolSearchPrograms(args: {
  q?: string;
  degree?: string;
  field?: string;
  limit?: number;
}): Promise<StructuredToolResult> {
  const { programs } = await getCatalog();
  const filtered = applyProgramFilters(programs, {
    q: args.q ?? "",
    degree: (args.degree as "bachelor" | "master" | "") || "",
    field: args.field ?? "",
  });
  const limit = Math.min(args.limit ?? 5, 8);
  const slice = filtered.slice(0, limit);
  const sources: AdvisorSource[] = slice.map((p) => ({
    type: "program",
    id: p.id,
    title: `${p.name} · ${p.university}`,
    href: `/programs/${p.id}`,
    lastVerifiedAt: p.lastVerifiedAt,
  }));
  if (slice.length === 0) {
    return {
      kind: "programs",
      text: "No published programs matched those filters in our database.",
      items: [],
      sources: [],
    };
  }
  const items = slice.map((p) => ({
    id: p.id,
    name: p.name,
    university: p.university,
    city: p.city,
    degreeLevel: p.degreeLevel,
    field: p.field,
    ieltsMin: p.ieltsMin,
    tuitionPerSemesterEur: p.tuitionPerSemesterEur,
    applicationRoute: p.applicationRoute,
    lastVerifiedAt: p.lastVerifiedAt,
    sourceUrl: p.sourceUrl,
    href: `/programs/${p.id}`,
  }));
  return {
    kind: "programs",
    text: `Found ${items.length} program(s).`,
    items,
    sources,
  };
}

export async function toolCheckEligibility(
  ctx: ToolContext,
  args: { programId?: string; answersOverride?: Partial<EligibilityAnswers> }
): Promise<StructuredToolResult> {
  const answers = mergeAnswers(ctx.answers, args.answersOverride);
  if (!isProfileComplete(answers)) {
    return {
      kind: "message",
      text: "Student profile is incomplete. Ask them to finish the eligibility check or provide goal, qualification, grade, field, and language.",
      items: [],
      sources: [],
    };
  }
  const { programs } = await getCatalog();
  if (args.programId) {
    const program = programs.find((p) => p.id === args.programId);
    if (!program || program.status !== "published") {
      return {
        kind: "eligibility",
        text: "Program not found in our verified database.",
        items: [],
        sources: [],
      };
    }
    const result = matchPrograms(answers, [program]);
    const m = result.matches[0];
    const source: AdvisorSource = {
      type: "program",
      id: program.id,
      title: program.name,
      href: `/programs/${program.id}`,
      lastVerifiedAt: program.lastVerifiedAt,
    };
    if (!m) {
      return {
        kind: "eligibility",
        text: `Student does not appear to qualify for ${program.name} under our hard filters.`,
        items: [
          {
            programId: program.id,
            name: program.name,
            university: program.university,
            qualified: false,
          },
        ],
        sources: [source],
      };
    }
    return {
      kind: "eligibility",
      text: `Tier: ${m.tier}. Score: ${m.score}.`,
      items: [
        {
          programId: program.id,
          name: program.name,
          university: program.university,
          tier: m.tier,
          score: m.score,
          reasons: m.reasons,
          href: `/programs/${program.id}`,
          lastVerifiedAt: program.lastVerifiedAt,
          sourceUrl: program.sourceUrl,
        },
      ],
      sources: [source],
    };
  }

  const result = matchPrograms(answers, programs);
  const top = result.matches.slice(0, 5);
  const sources: AdvisorSource[] = top.map((m) => ({
    type: "program",
    id: m.program.id,
    title: m.program.name,
    href: `/programs/${m.program.id}`,
    lastVerifiedAt: m.program.lastVerifiedAt,
  }));
  return {
    kind: "eligibility",
    text: `Total qualified: ${result.totalQualified}.`,
    items: top.map((m) => ({
      programId: m.program.id,
      name: m.program.name,
      university: m.program.university,
      tier: m.tier,
      score: m.score,
      reasons: m.reasons.slice(0, 3),
      href: `/programs/${m.program.id}`,
    })),
    sources,
  };
}

export async function toolGetDeadlines(args: {
  programId?: string;
  scholarshipId?: string;
}): Promise<StructuredToolResult> {
  const { programs, scholarships } = await getCatalog();
  const sources: AdvisorSource[] = [];
  const items: Array<Record<string, unknown>> = [];

  if (args.programId) {
    const program = programs.find((p) => p.id === args.programId);
    if (!program) {
      return {
        kind: "deadlines",
        text: "Program not found.",
        items: [],
        sources: [],
      };
    }
    sources.push({
      type: "program",
      id: program.id,
      title: program.name,
      href: `/programs/${program.id}`,
      lastVerifiedAt: program.lastVerifiedAt,
    });
    if (!program.intakes.length) {
      items.push({
        name: program.name,
        type: "program",
        note: "no intake deadlines recorded",
      });
    } else {
      for (const intake of program.intakes) {
        items.push({
          name: program.name,
          type: "program",
          semester: intake.semester,
          year: intake.year,
          deadlineNonEu: intake.deadlineNonEu,
          status: intake.status,
          href: `/programs/${program.id}`,
        });
      }
    }
  }

  if (args.scholarshipId) {
    const s = scholarships.find((x) => x.id === args.scholarshipId);
    if (!s) {
      items.push({ type: "scholarship", note: "Scholarship not found." });
    } else {
      sources.push({
        type: "scholarship",
        id: s.id,
        title: s.name,
        href: `/scholarships/${s.id}`,
        lastVerifiedAt: s.lastVerifiedAt,
      });
      for (const c of s.cycles) {
        items.push({
          name: s.name,
          type: "scholarship",
          openAt: c.openAt,
          closeAt: c.closeAt,
          status: c.status,
          href: `/scholarships/${s.id}`,
        });
      }
    }
  }

  if (!args.programId && !args.scholarshipId) {
    return {
      kind: "deadlines",
      text: "Provide programId and/or scholarshipId to fetch deadlines.",
      items: [],
      sources: [],
    };
  }

  return {
    kind: "deadlines",
    text: items.length ? `Found ${items.length} deadline row(s).` : "No deadlines found.",
    items,
    sources,
  };
}

export async function toolListScholarships(
  ctx: ToolContext,
  args: { q?: string; limit?: number }
): Promise<StructuredToolResult> {
  const { scholarships } = await getCatalog();
  const answers = ctx.answers;
  let list = scholarships;
  if (args.q) {
    const q = args.q.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q)
    );
  }
  const matched = isProfileComplete(answers)
    ? matchScholarships(answers, list).matches.slice(0, args.limit ?? 5)
    : list.slice(0, args.limit ?? 5).map((s) => ({
        scholarship: s,
        odds: "possible" as const,
        reasons: ["Profile incomplete — showing listings only."],
      }));

  const sources: AdvisorSource[] = matched.map((m) => ({
    type: "scholarship",
    id: m.scholarship.id,
    title: m.scholarship.name,
    href: `/scholarships/${m.scholarship.id}`,
    lastVerifiedAt: m.scholarship.lastVerifiedAt,
  }));

  if (matched.length === 0) {
    return {
      kind: "scholarships",
      text: "No scholarships matched.",
      items: [],
      sources: [],
    };
  }

  return {
    kind: "scholarships",
    text: `Found ${matched.length} scholarship(s).`,
    items: matched.map((m) => ({
      id: m.scholarship.id,
      name: m.scholarship.name,
      provider: m.scholarship.provider,
      odds: m.odds,
      reasons: m.reasons.slice(0, 2),
      amountSummary: m.scholarship.amountSummary,
      sourceUrl: m.scholarship.sourceUrl,
      lastVerifiedAt: m.scholarship.lastVerifiedAt,
      href: `/scholarships/${m.scholarship.id}`,
    })),
    sources,
  };
}

export async function toolGetDocumentChecklist(args: {
  programId: string;
}): Promise<StructuredToolResult> {
  const { programs } = await getCatalog();
  const program = programs.find((p) => p.id === args.programId);
  if (!program || program.status !== "published") {
    return {
      kind: "checklist",
      text: "Program not found.",
      items: [],
      sources: [],
    };
  }
  const docs = program.requiredDocuments.length
    ? program.requiredDocuments
    : ["No checklist recorded yet — confirm on the university site."];
  return {
    kind: "checklist",
    text: `${program.name} required documents.`,
    items: docs.map((d) => ({ document: d, programId: program.id })),
    sources: [
      {
        type: "program",
        id: program.id,
        title: program.name,
        href: `/programs/${program.id}`,
        lastVerifiedAt: program.lastVerifiedAt,
      },
    ],
  };
}

export async function toolSearchGuides(args: {
  query: string;
  limit?: number;
}): Promise<StructuredToolResult> {
  const { guides } = await getCatalog();
  const found = searchGuidesInMemory(guides, args.query, args.limit ?? 4);
  if (found.length === 0) {
    return {
      kind: "guides",
      text: "I don't have verified information on that in our guides. Offer a human consultant (except Ausbildung-only placement).",
      items: [],
      sources: [],
    };
  }
  const sources: AdvisorSource[] = found.map((g) => ({
    type: "guide",
    id: g.id,
    title: g.title,
    href: `/guides/${g.slug}`,
    lastVerifiedAt: g.lastVerifiedAt,
  }));
  return {
    kind: "guides",
    text: `Found ${found.length} guide(s).`,
    items: found.map((g) => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      topic: g.topic,
      excerpt: g.body.slice(0, 500),
      sourceUrl: g.sourceUrl,
      lastVerifiedAt: g.lastVerifiedAt,
      href: `/guides/${g.slug}`,
    })),
    sources,
  };
}

export const ADVISOR_TOOL_NAMES = [
  "search_programs",
  "check_eligibility",
  "get_deadlines",
  "list_scholarships",
  "get_document_checklist",
  "search_guides",
] as const;

/** Kept for fixture tests — names only. */
export const ADVISOR_TOOL_DECLARATIONS = ADVISOR_TOOL_NAMES.map((name) => ({
  name,
}));

export async function runAdvisorTool(
  name: string,
  rawArgs: Record<string, unknown>,
  ctx: ToolContext
): Promise<StructuredToolResult> {
  switch (name) {
    case "search_programs":
      return toolSearchPrograms({
        q: typeof rawArgs.q === "string" ? rawArgs.q : undefined,
        degree: typeof rawArgs.degree === "string" ? rawArgs.degree : undefined,
        field: typeof rawArgs.field === "string" ? rawArgs.field : undefined,
        limit: typeof rawArgs.limit === "number" ? rawArgs.limit : undefined,
      });
    case "check_eligibility":
      return toolCheckEligibility(ctx, {
        programId:
          typeof rawArgs.programId === "string" ? rawArgs.programId : undefined,
      });
    case "get_deadlines":
      return toolGetDeadlines({
        programId:
          typeof rawArgs.programId === "string" ? rawArgs.programId : undefined,
        scholarshipId:
          typeof rawArgs.scholarshipId === "string"
            ? rawArgs.scholarshipId
            : undefined,
      });
    case "list_scholarships":
      return toolListScholarships(ctx, {
        q: typeof rawArgs.q === "string" ? rawArgs.q : undefined,
        limit: typeof rawArgs.limit === "number" ? rawArgs.limit : undefined,
      });
    case "get_document_checklist":
      return toolGetDocumentChecklist({
        programId: String(rawArgs.programId ?? ""),
      });
    case "search_guides":
      return toolSearchGuides({
        query: String(rawArgs.query ?? ""),
        limit: typeof rawArgs.limit === "number" ? rawArgs.limit : undefined,
      });
    default:
      return {
        kind: "message",
        text: `Unknown tool: ${name}`,
        items: [],
        sources: [],
      };
  }
}

export function createAdvisorTools(ctx: ToolContext) {
  return {
    search_programs: tool({
      description:
        "Search verified German programs in our database by keyword, degree, or field.",
      inputSchema: z.object({
        q: z.string().optional(),
        degree: z.string().optional(),
        field: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: async (args) => toolSearchPrograms(args),
    }),
    check_eligibility: tool({
      description:
        "Check Reach/Match/Safety for the student profile, optionally for one programId.",
      inputSchema: z.object({
        programId: z.string().optional(),
      }),
      execute: async (args) => toolCheckEligibility(ctx, args),
    }),
    get_deadlines: tool({
      description: "Get intake or scholarship cycle deadlines by id.",
      inputSchema: z.object({
        programId: z.string().optional(),
        scholarshipId: z.string().optional(),
      }),
      execute: async (args) => toolGetDeadlines(args),
    }),
    list_scholarships: tool({
      description: "List scholarships with honest odds for the student profile.",
      inputSchema: z.object({
        q: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: async (args) => toolListScholarships(ctx, args),
    }),
    get_document_checklist: tool({
      description: "List required documents for a program.",
      inputSchema: z.object({
        programId: z.string(),
      }),
      execute: async (args) => toolGetDocumentChecklist(args),
    }),
    search_guides: tool({
      description:
        "Search curated guides (APS, visa, uni-assist, anabin, Studienkolleg, FAQs).",
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().optional(),
      }),
      execute: async (args) => toolSearchGuides(args),
    }),
  };
}

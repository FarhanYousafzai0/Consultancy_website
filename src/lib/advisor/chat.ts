import {
  streamText,
  generateObject,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
  type LanguageModelUsage,
} from "ai";
import { z } from "zod";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import { createAdvisorTools, type ToolContext } from "@/lib/advisor/tools";
import type { AdvisorSource } from "@/lib/db/advisor-threads";
import { assertWithinBudget, recordUsage } from "@/lib/advisor/budget";
import {
  chatModel,
  analysisModel,
  getChatModelChoice,
  getChatFallbackChoice,
  getAnalysisModelChoice,
  providerOptionsFor,
  estimateUsdFromUsage,
  resolveLanguageModel,
  type ModelChoice,
} from "@/lib/ai/models";
import { getCatalog } from "@/lib/advisor/catalog";
import { matchPrograms } from "@/lib/matching/match";
import { isProfileComplete } from "@/lib/eligibility/evaluate";

export const ADVISOR_SYSTEM = `You are Parwaaz Advisor — a study-in-Germany consultant for Pakistani students on the Parwaaz platform only.

Zone (hard):
- Only discuss studying in Germany via Parwaaz: programs, scholarships, APS, visa basics, Ausbildung, uni-assist, anabin, Studienkolleg, eligibility, deadlines, documents, and our curated guides.
- Never answer other countries, general knowledge, homework, coding, news, or chit-chat. If somehow asked, reply in one short line that you only help with Parwaaz study-in-Germany topics — do not answer the off-topic request.

Rules:
- For ANY factual claim (programs, scholarships, deadlines, fees, visa/APS rules, checklists), you MUST use tools. Never invent names, dates, or fees from memory.
- Answer ONLY using tool results and curated guides returned by tools.
- Cite sources (URL and/or last verified date from tool output).
- If tools return nothing useful, say you don't have verified information and suggest a human consultant on WhatsApp — EXCEPT Ausbildung placement: stay self-serve, do not pitch a consultant for Ausbildung jobs.
- English only. Calm, clear, brief (short paragraphs or bullets).
- Do not write a full motivation letter. Tips only. Never promise admission or visas.
- Prefer Reach/Match/Safety language over fake percentages.
- The UI renders tool cards — keep your text short and complementary.`;

function isRetryableModelError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /503|high demand|unavailable|timeout|429|overloaded/i.test(msg);
}

async function withModelFallback<T>(
  primary: ModelChoice,
  run: (choice: ModelChoice) => Promise<T>
): Promise<{ result: T; choice: ModelChoice }> {
  try {
    return { result: await run(primary), choice: primary };
  } catch (error) {
    const fallback = getChatFallbackChoice();
    if (!fallback || !isRetryableModelError(error)) throw error;
    return { result: await run(fallback), choice: fallback };
  }
}

export function collectSourcesFromMessages(
  messages: UIMessage[]
): AdvisorSource[] {
  const seen = new Set<string>();
  const out: AdvisorSource[] = [];
  for (const m of messages) {
    for (const part of m.parts ?? []) {
      if (!part.type.startsWith("tool-")) continue;
      const output = (part as { output?: unknown }).output as
        | { sources?: AdvisorSource[] }
        | undefined;
      if (!output?.sources) continue;
      for (const s of output.sources) {
        const key = `${s.type}:${s.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(s);
      }
    }
  }
  return out;
}

export function suggestHandoffFromText(
  reply: string,
  message: string,
  sources: AdvisorSource[]
): boolean {
  return (
    /don't have verified|ask a consultant|human consultant|whatsapp/i.test(
      reply
    ) ||
    (sources.length === 0 &&
      /aps|visa|deadline|scholarship|program/i.test(message))
  );
}

export async function streamAdvisorChat(options: {
  messages: UIMessage[];
  answers: EligibilityAnswers;
  onUsage?: (usage: LanguageModelUsage, choice: ModelChoice, usd: number) => void;
}) {
  await assertWithinBudget(0.01);
  const ctx: ToolContext = { answers: options.answers };
  const tools = createAdvisorTools(ctx);
  const primary = getChatModelChoice();

  // Trim history to last 8 user/assistant turns worth of UI messages
  const trimmed = options.messages.slice(-16);

  const { result, choice } = await withModelFallback(primary, async (c) => {
    const model = resolveLanguageModel(c);
    const stream = streamText({
      model,
      system: ADVISOR_SYSTEM,
      messages: await convertToModelMessages(trimmed),
      tools,
      stopWhen: stepCountIs(2),
      providerOptions: providerOptionsFor(c),
      maxRetries: 1,
      onFinish: async ({ totalUsage }) => {
        const usd = estimateUsdFromUsage({
          provider: c.provider,
          modelId: c.modelId,
          inputTokens: totalUsage.inputTokens ?? 0,
          outputTokens: totalUsage.outputTokens ?? 0,
        });
        const charge = Math.max(usd, 0.002);
        await recordUsage(charge);
        options.onUsage?.(totalUsage, c, charge);
      },
    });
    return stream;
  });

  void choice;
  return result;
}

/** Non-streaming helper kept for tests / scripts. */
export async function runAdvisorChat(options: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  answers: EligibilityAnswers;
}): Promise<{
  reply: string;
  sources: AdvisorSource[];
  suggestHandoff: boolean;
}> {
  await assertWithinBudget(0.015);
  const ctx: ToolContext = { answers: options.answers };
  const tools = createAdvisorTools(ctx);
  const choice = getChatModelChoice();
  const model = chatModel(choice);

  const historyMsgs: UIMessage[] = options.history.slice(-8).map((m, i) => ({
    id: `h-${i}`,
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  }));
  historyMsgs.push({
    id: "u-last",
    role: "user",
    parts: [{ type: "text", text: options.message }],
  });

  const { generateText } = await import("ai");
  const result = await generateText({
    model,
    system: ADVISOR_SYSTEM,
    messages: await convertToModelMessages(historyMsgs),
    tools,
    stopWhen: stepCountIs(2),
    providerOptions: providerOptionsFor(choice),
  });

  const usd = estimateUsdFromUsage({
    provider: choice.provider,
    modelId: choice.modelId,
    inputTokens: result.totalUsage.inputTokens ?? 0,
    outputTokens: result.totalUsage.outputTokens ?? 0,
  });
  await recordUsage(Math.max(usd, 0.005));

  const reply = result.text?.trim() || "I don't have verified information on that.";
  const sources: AdvisorSource[] = [];
  for (const step of result.steps ?? []) {
    for (const tr of step.toolResults ?? []) {
      const out = tr.output as { sources?: AdvisorSource[] } | undefined;
      if (out?.sources) sources.push(...out.sources);
    }
  }
  const unique = collectSourcesFromMessages([]);
  // merge from tool results directly
  const seen = new Set<string>();
  const merged: AdvisorSource[] = [];
  for (const s of [...unique, ...sources]) {
    const key = `${s.type}:${s.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(s);
  }

  return {
    reply,
    sources: merged,
    suggestHandoff: suggestHandoffFromText(reply, options.message, merged),
  };
}

export const sopReviewSchema = z.object({
  clarity: z.string(),
  germanyFit: z.string(),
  missingFacts: z.array(z.string()),
  rewriteSuggestions: z.array(z.string()),
  summary: z.string(),
});

export const profileAnalysisSchema = z.object({
  strengthSummary: z.string(),
  gaps: z.array(z.string()),
  nextSteps: z.array(z.string()),
  reachMatchSafety: z.object({
    reach: z.string(),
    match: z.string(),
    safety: z.string(),
  }),
  summary: z.string(),
});

export const shortlistAnalysisSchema = z.object({
  summary: z.string(),
  ranked: z.array(
    z.object({
      programId: z.string().optional(),
      name: z.string(),
      university: z.string(),
      tier: z.string(),
      reasons: z.array(z.string()),
      deadlineNote: z.string().optional(),
    })
  ),
  nextSteps: z.array(z.string()),
});

export async function runSopReview(letter: string) {
  await assertWithinBudget(0.08);
  const choice = getAnalysisModelChoice();
  const model = analysisModel(choice);
  const { object, usage } = await generateObject({
    model,
    schema: sopReviewSchema,
    providerOptions: providerOptionsFor(choice),
    system: `You review motivation letters for Pakistani students applying to German universities.
Do NOT write a complete letter the student could submit as their own work. Give critique and short rewrite snippets only.
Be honest and specific.`,
    prompt: `Review this motivation letter:\n\n${letter.slice(0, 12000)}`,
  });
  const usd = estimateUsdFromUsage({
    provider: choice.provider,
    modelId: choice.modelId,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
  });
  await recordUsage(Math.max(usd, 0.05));
  return object;
}

export async function runProfileAnalysis(answers: EligibilityAnswers) {
  await assertWithinBudget(0.06);
  const catalog = await getCatalog();
  const complete = isProfileComplete(answers);
  const match = complete
    ? matchPrograms(answers, catalog.programs)
    : { matches: [], totalQualified: 0 };
  const top = match.matches.slice(0, 6).map((m) => ({
    name: m.program.name,
    university: m.program.university,
    tier: m.tier,
    score: m.score,
    reasons: m.reasons.slice(0, 3),
  }));

  const choice = getAnalysisModelChoice();
  const model = analysisModel(choice);
  const { object, usage } = await generateObject({
    model,
    schema: profileAnalysisSchema,
    providerOptions: providerOptionsFor(choice),
    system: `You are Parwaaz analysis engine for Pakistani students. Use ONLY the provided profile and match data. Be honest. English only.`,
    prompt: JSON.stringify({
      profile: answers,
      profileComplete: complete,
      totalQualified: match.totalQualified,
      topMatches: top,
    }),
  });
  const usd = estimateUsdFromUsage({
    provider: choice.provider,
    modelId: choice.modelId,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
  });
  await recordUsage(Math.max(usd, 0.04));
  return object;
}

export async function runShortlistAnalysis(answers: EligibilityAnswers) {
  await assertWithinBudget(0.06);
  const catalog = await getCatalog();
  const complete = isProfileComplete(answers);
  const match = complete
    ? matchPrograms(answers, catalog.programs)
    : { matches: [], totalQualified: 0 };
  const top = match.matches.slice(0, 8).map((m) => ({
    programId: m.program.id,
    name: m.program.name,
    university: m.program.university,
    tier: m.tier,
    reasons: m.reasons.slice(0, 3),
    intakes: m.program.intakes,
    sourceUrl: m.program.sourceUrl,
    lastVerifiedAt: m.program.lastVerifiedAt,
  }));

  const choice = getAnalysisModelChoice();
  const model = analysisModel(choice);
  const { object, usage } = await generateObject({
    model,
    schema: shortlistAnalysisSchema,
    providerOptions: providerOptionsFor(choice),
    system: `Rank a shortlist for a Pakistani student using ONLY provided matches. Include deadline notes from intakes when present. English only.`,
    prompt: JSON.stringify({ profile: answers, matches: top }),
  });
  const usd = estimateUsdFromUsage({
    provider: choice.provider,
    modelId: choice.modelId,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
  });
  await recordUsage(Math.max(usd, 0.04));
  return object;
}

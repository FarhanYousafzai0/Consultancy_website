/**
 * Side-by-side AI provider/model benchmark for Parwaz advisor chat.
 *
 * Usage:
 *   npm run ai:bench
 *
 * Requires GEMINI_API_KEY and/or OPENAI_API_KEY in .env.local.
 */
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import {
  getChatModelChoice,
  getAnalysisModelChoice,
  resolveLanguageModel,
  providerOptionsFor,
  estimateUsdFromUsage,
  type ModelChoice,
} from "../src/lib/ai/models";

const QUESTIONS = [
  "Do Pakistani students need APS for German universities?",
  "Find English-taught master's in computer science",
  "What is a blocked account?",
  "uni-assist vs direct application",
  "DAAD scholarship odds for Master's CS",
  "Studienkolleg after FSc",
  "Winter semester deadlines for non-EU",
  "What documents for Master's application?",
  "Can you guarantee admission?",
  "How does anabin work?",
];

const fakeTools = {
  search_guides: tool({
    description: "Search curated guides",
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }) => ({
      kind: "guides",
      text: `Guide hit for ${query}`,
      items: [{ title: "APS for Pakistan", excerpt: "Most Pakistani students need APS." }],
      sources: [],
    }),
  }),
  search_programs: tool({
    description: "Search programs",
    inputSchema: z.object({ q: z.string().optional() }),
    execute: async ({ q }) => ({
      kind: "programs",
      text: `Programs for ${q ?? ""}`,
      items: [
        {
          id: "demo",
          name: "MSc Informatics",
          university: "TU Munich",
          href: "/programs/demo",
        },
      ],
      sources: [],
    }),
  }),
};

async function benchOne(choice: ModelChoice, question: string) {
  const model = resolveLanguageModel(choice);
  const t0 = performance.now();
  let firstTokenMs: number | null = null;
  try {
    const result = await generateText({
      model,
      system:
        "You are a fast study advisor. Use tools for facts. Keep answers under 80 words.",
      prompt: question,
      tools: fakeTools,
      stopWhen: stepCountIs(2),
      providerOptions: providerOptionsFor(choice),
      maxRetries: 0,
    });
    const totalMs = Math.round(performance.now() - t0);
    // generateText is non-streaming; approximate first-token as total for now
    firstTokenMs = totalMs;
    const toolCalls = result.steps?.flatMap((s) => s.toolCalls ?? []) ?? [];
    const usd = estimateUsdFromUsage({
      provider: choice.provider,
      modelId: choice.modelId,
      inputTokens: result.totalUsage.inputTokens ?? 0,
      outputTokens: result.totalUsage.outputTokens ?? 0,
    });
    return {
      ok: true as const,
      totalMs,
      firstTokenMs,
      toolCalls: toolCalls.length,
      toolNames: toolCalls.map((c) => c.toolName),
      inputTokens: result.totalUsage.inputTokens ?? 0,
      outputTokens: result.totalUsage.outputTokens ?? 0,
      usd,
      preview: (result.text ?? "").slice(0, 100),
    };
  } catch (error) {
    return {
      ok: false as const,
      totalMs: Math.round(performance.now() - t0),
      firstTokenMs,
      error: error instanceof Error ? error.message.slice(0, 160) : String(error),
    };
  }
}

function candidates(): ModelChoice[] {
  const list: ModelChoice[] = [];
  const chat = getChatModelChoice();
  list.push(chat);
  if (process.env.GEMINI_API_KEY) {
    for (const modelId of ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]) {
      if (!list.some((c) => c.provider === "google" && c.modelId === modelId)) {
        list.push({ provider: "google", modelId });
      }
    }
  }
  if (process.env.OPENAI_API_KEY) {
    for (const modelId of ["gpt-4o-mini", "gpt-4.1-mini"]) {
      list.push({ provider: "openai", modelId });
    }
  }
  // Optional heavy analysis model — one smoke question only via --analysis flag
  if (process.argv.includes("--analysis")) {
    list.push(getAnalysisModelChoice());
  }
  return list;
}

async function main() {
  const sample = QUESTIONS.slice(0, 5);
  console.log("Parwaz AI benchmark");
  console.log("Questions:", sample.length);
  console.log("");

  for (const choice of candidates()) {
    console.log(`=== ${choice.provider}/${choice.modelId} ===`);
    const rows = [];
    for (const q of sample) {
      const row = await benchOne(choice, q);
      rows.push(row);
      if (row.ok) {
        console.log(
          `  ${row.totalMs}ms tools=${row.toolCalls} ($${row.usd.toFixed(4)}) :: ${q.slice(0, 48)}`
        );
      } else {
        console.log(`  FAIL ${row.totalMs}ms :: ${row.error}`);
      }
    }
    const ok = rows.filter((r) => r.ok);
    if (ok.length) {
      const avg =
        ok.reduce((a, r) => a + (r as { totalMs: number }).totalMs, 0) / ok.length;
      const avgUsd =
        ok.reduce((a, r) => a + (("usd" in r && r.usd) || 0), 0) / ok.length;
      console.log(
        `  avg ${Math.round(avg)}ms · avg $${avgUsd.toFixed(4)} · success ${ok.length}/${rows.length}`
      );
    }
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type AiProvider = "google" | "openai";

export type ModelChoice = {
  provider: AiProvider;
  modelId: string;
};

function readProvider(
  value: string | undefined,
  fallback: AiProvider
): AiProvider {
  const v = value?.trim().toLowerCase();
  if (v === "openai" || v === "google") return v;
  return fallback;
}

function googleApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    ""
  );
}

function openaiApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

export function getChatModelChoice(): ModelChoice {
  const hasOpenAI = Boolean(openaiApiKey());
  const defaultProvider: AiProvider = hasOpenAI ? "openai" : "google";
  const provider = readProvider(process.env.AI_CHAT_PROVIDER, defaultProvider);
  const modelId =
    process.env.AI_CHAT_MODEL?.trim() ||
    (provider === "openai"
      ? "gpt-4o-mini"
      : process.env.GEMINI_FLASH_MODEL?.trim() || "gemini-3.5-flash-lite");
  return { provider, modelId };
}

export function getChatFallbackChoice(): ModelChoice | null {
  const primary = getChatModelChoice();
  const fallbackProvider = readProvider(
    process.env.AI_CHAT_FALLBACK_PROVIDER,
    primary.provider === "openai" ? "google" : "openai"
  );
  const fallbackModel =
    process.env.AI_CHAT_FALLBACK_MODEL?.trim() ||
    (fallbackProvider === "google" ? "gemini-3.5-flash-lite" : "gpt-4o-mini");
  if (fallbackProvider === "openai" && !openaiApiKey()) return null;
  if (fallbackProvider === "google" && !googleApiKey()) return null;
  if (fallbackProvider === primary.provider && fallbackModel === primary.modelId) {
    return null;
  }
  return { provider: fallbackProvider, modelId: fallbackModel };
}

export function getAnalysisModelChoice(): ModelChoice {
  const hasOpenAI = Boolean(openaiApiKey());
  const defaultProvider: AiProvider = hasOpenAI ? "openai" : "google";
  const provider = readProvider(
    process.env.AI_ANALYSIS_PROVIDER,
    defaultProvider
  );
  const modelId =
    process.env.AI_ANALYSIS_MODEL?.trim() ||
    (provider === "openai"
      ? "gpt-4o-mini"
      : process.env.GEMINI_SOP_MODEL?.trim() || "gemini-3.8-flash");
  return { provider, modelId };
}

export function googleProviderOptions() {
  return {
    google: {
      thinkingConfig: {
        thinkingLevel: "low" as const,
      },
    },
  };
}

export function resolveLanguageModel(choice: ModelChoice): LanguageModel {
  if (choice.provider === "openai") {
    const key = openaiApiKey();
    if (!key) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it in .env.local / Vercel to use OpenAI."
      );
    }
    return createOpenAI({ apiKey: key })(choice.modelId);
  }

  const key = googleApiKey();
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it in .env.local / Vercel to enable the advisor."
    );
  }
  return createGoogleGenerativeAI({ apiKey: key })(choice.modelId);
}

export function chatModel(override?: Partial<ModelChoice>): LanguageModel {
  const base = getChatModelChoice();
  return resolveLanguageModel({
    provider: override?.provider ?? base.provider,
    modelId: override?.modelId ?? base.modelId,
  });
}

export function analysisModel(override?: Partial<ModelChoice>): LanguageModel {
  const base = getAnalysisModelChoice();
  return resolveLanguageModel({
    provider: override?.provider ?? base.provider,
    modelId: override?.modelId ?? base.modelId,
  });
}

export function providerOptionsFor(choice: ModelChoice) {
  if (choice.provider === "google") return googleProviderOptions();
  return undefined;
}

/** Rough USD cost from token usage for budget tracking. */
export function estimateUsdFromUsage(options: {
  provider: AiProvider;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
}): number {
  const { provider, modelId, inputTokens, outputTokens } = options;
  const id = modelId.toLowerCase();
  // Prices are approximate per 1M tokens — keep conservative for the hard monthly cap.
  let inPerM = 0.1;
  let outPerM = 0.4;
  if (provider === "openai") {
    if (id.includes("mini")) {
      inPerM = 0.15;
      outPerM = 0.6;
    } else {
      inPerM = 2.5;
      outPerM = 10;
    }
  } else if (id.includes("lite")) {
    inPerM = 0.1;
    outPerM = 0.4;
  } else if (id.includes("flash")) {
    inPerM = 0.3;
    outPerM = 2.5;
  } else if (id.includes("pro")) {
    inPerM = 1.25;
    outPerM = 10;
  }
  return (inputTokens / 1_000_000) * inPerM + (outputTokens / 1_000_000) * outPerM;
}

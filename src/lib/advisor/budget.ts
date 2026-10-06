import { connectMongo } from "@/lib/db/connect";
import mongoose from "mongoose";

const SpendSchema = new mongoose.Schema(
  {
    monthKey: { type: String, required: true, unique: true },
    estimatedUsd: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SpendModel =
  mongoose.models.AiSpend ?? mongoose.model("AiSpend", SpendSchema);

/** Legacy collection name kept readable for migration; alias for old GeminiUsage docs. */
const LegacySpendModel =
  mongoose.models.GeminiUsage ??
  mongoose.model(
    "GeminiUsage",
    new mongoose.Schema(
      {
        monthKey: { type: String, required: true, unique: true },
        estimatedUsd: { type: Number, default: 0 },
        requestCount: { type: Number, default: 0 },
      },
      { timestamps: true }
    )
  );

const DailySchema = new mongoose.Schema(
  {
    subjectKey: { type: String, required: true },
    day: { type: String, required: true },
    chatCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
DailySchema.index({ subjectKey: 1, day: 1 }, { unique: true });

const DailyModel =
  mongoose.models.AiUsage ?? mongoose.model("AiUsage", DailySchema);

function monthKey(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function getMonthlyBudgetUsd() {
  const raw =
    process.env.AI_MONTHLY_BUDGET_USD?.trim() ||
    process.env.GEMINI_MONTHLY_BUDGET_USD?.trim();
  const n = raw ? Number(raw) : 50;
  return Number.isFinite(n) && n > 0 ? n : 50;
}

export function getDailyChatLimit(options: {
  isLoggedIn: boolean;
  hasCredits: boolean;
}): number {
  const paid = Number(process.env.AI_PAID_DAILY ?? 200);
  const student = Number(process.env.AI_FREE_STUDENT_DAILY ?? 20);
  const visitor = Number(process.env.AI_FREE_VISITOR_DAILY ?? 5);
  if (options.hasCredits) {
    return Number.isFinite(paid) && paid > 0 ? paid : 200;
  }
  if (options.isLoggedIn) {
    return Number.isFinite(student) && student > 0 ? student : 20;
  }
  return Number.isFinite(visitor) && visitor > 0 ? visitor : 5;
}

export type QuotaSnapshot = {
  limit: number;
  used: number;
  remaining: number;
  day: string;
};

export class BudgetExceededError extends Error {
  constructor(public budget: number) {
    super(
      `AI advisor monthly budget of $${budget} reached. Try again next month or ask a consultant on WhatsApp.`
    );
    this.name = "BudgetExceededError";
  }
}

export class QuotaExceededError extends Error {
  constructor(public snapshot: QuotaSnapshot) {
    super(
      snapshot.limit <= 5
        ? "Free visitor chat limit reached for today. Sign up for more messages, or message us on WhatsApp."
        : "Daily chat limit reached. Buy AI credits via WhatsApp or try again tomorrow."
    );
    this.name = "QuotaExceededError";
  }
}

async function readMonthlySpend(key: string): Promise<number> {
  const [modern, legacy] = await Promise.all([
    SpendModel.findOne({ monthKey: key }).lean(),
    LegacySpendModel.findOne({ monthKey: key }).lean(),
  ]);
  const a = (modern as { estimatedUsd?: number } | null)?.estimatedUsd ?? 0;
  const b = (legacy as { estimatedUsd?: number } | null)?.estimatedUsd ?? 0;
  return Math.max(a, b);
}

export async function assertWithinBudget(estimatedAdd = 0.01): Promise<void> {
  await connectMongo();
  const key = monthKey();
  const budget = getMonthlyBudgetUsd();
  const current = await readMonthlySpend(key);
  if (current + estimatedAdd > budget) {
    throw new BudgetExceededError(budget);
  }
}

export async function recordUsage(estimatedUsd: number) {
  await connectMongo();
  const key = monthKey();
  await SpendModel.findOneAndUpdate(
    { monthKey: key },
    {
      $inc: { estimatedUsd, requestCount: 1 },
      $setOnInsert: { monthKey: key },
    },
    { upsert: true }
  );
}

export async function getQuotaSnapshot(options: {
  subjectKey: string;
  isLoggedIn: boolean;
  hasCredits: boolean;
}): Promise<QuotaSnapshot> {
  await connectMongo();
  const day = dayKey();
  const limit = getDailyChatLimit({
    isLoggedIn: options.isLoggedIn,
    hasCredits: options.hasCredits,
  });
  const doc = await DailyModel.findOne({
    subjectKey: options.subjectKey,
    day,
  }).lean();
  const used = (doc as { chatCount?: number } | null)?.chatCount ?? 0;
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    day,
  };
}

/** Atomically consume one chat turn. Throws QuotaExceededError if over limit. */
export async function consumeChatQuota(options: {
  subjectKey: string;
  isLoggedIn: boolean;
  hasCredits: boolean;
}): Promise<QuotaSnapshot> {
  await connectMongo();
  const day = dayKey();
  const limit = getDailyChatLimit({
    isLoggedIn: options.isLoggedIn,
    hasCredits: options.hasCredits,
  });

  const existing = await DailyModel.findOne({
    subjectKey: options.subjectKey,
    day,
  }).lean();
  const used = (existing as { chatCount?: number } | null)?.chatCount ?? 0;
  if (used >= limit) {
    throw new QuotaExceededError({
      limit,
      used,
      remaining: 0,
      day,
    });
  }

  const doc = await DailyModel.findOneAndUpdate(
    { subjectKey: options.subjectKey, day },
    { $inc: { chatCount: 1 }, $setOnInsert: { subjectKey: options.subjectKey, day } },
    { upsert: true, new: true }
  ).lean();

  const nextUsed = (doc as { chatCount?: number }).chatCount ?? used + 1;
  if (nextUsed > limit) {
    // Race: roll back and refuse
    await DailyModel.updateOne(
      { subjectKey: options.subjectKey, day },
      { $inc: { chatCount: -1 } }
    );
    throw new QuotaExceededError({
      limit,
      used: limit,
      remaining: 0,
      day,
    });
  }

  return {
    limit,
    used: nextUsed,
    remaining: Math.max(0, limit - nextUsed),
    day,
  };
}

/** @deprecated Prefer consumeChatQuota — kept for any leftover callers. */
export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60 * 60 * 1000
): boolean {
  void key;
  void limit;
  void windowMs;
  return true;
}

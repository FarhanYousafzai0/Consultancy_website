import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  profileToAnswers,
  consumeAiCredit,
  markFreeAnalysisUsed,
} from "@/lib/db/student-profile";
import {
  runProfileAnalysis,
  runShortlistAnalysis,
  runSopReview,
} from "@/lib/advisor/chat";
import {
  BudgetExceededError,
} from "@/lib/advisor/budget";
import {
  createAdvisorReport,
  listAdvisorReports,
} from "@/lib/db/advisor-reports";
import type { AnalysisType } from "@/lib/db/types";

export const maxDuration = 60;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reports = await listAdvisorReports(session.userId);
  const profile = await getStudentProfile(session.userId);
  return NextResponse.json({
    reports,
    credits: profile?.aiCredits ?? 0,
    freeAnalysisUsed: profile?.freeAnalysisUsed ?? false,
    sopReviewUnlocked: profile?.sopReviewUnlocked ?? false,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    type?: AnalysisType;
    letter?: string;
  };
  const type = body.type;
  if (!type || !["profile", "sop", "shortlist"].includes(type)) {
    return NextResponse.json(
      { error: "type must be profile, sop, or shortlist" },
      { status: 400 }
    );
  }

  const profile = await getStudentProfile(session.userId);
  if (!profile) {
    return NextResponse.json(
      { error: "Complete your profile first." },
      { status: 400 }
    );
  }

  const answers = profileToAnswers(profile);
  const freeProfile =
    type === "profile" && !profile.freeAnalysisUsed;
  const legacySopUnlock = type === "sop" && profile.sopReviewUnlocked;

  if (!freeProfile && !legacySopUnlock) {
    if ((profile.aiCredits ?? 0) < 1) {
      return NextResponse.json(
        {
          error:
            "No AI credits left. Buy a credit pack via WhatsApp, or use your one free profile analysis.",
          locked: true,
        },
        { status: 402 }
      );
    }
  }

  if (type === "sop") {
    const letter = body.letter?.trim() ?? "";
    if (letter.length < 80) {
      return NextResponse.json(
        { error: "Paste at least ~80 characters of your letter." },
        { status: 400 }
      );
    }
    if (letter.length > 12000) {
      return NextResponse.json(
        { error: "Letter too long (max 12,000 characters)." },
        { status: 400 }
      );
    }
  }

  try {
    let result: Record<string, unknown>;
    let inputSummary = "";

    if (type === "profile") {
      result = (await runProfileAnalysis(answers)) as unknown as Record<
        string,
        unknown
      >;
      inputSummary = `Profile analysis · ${answers.goal ?? "goal?"} · ${answers.field ?? "field?"}`;
    } else if (type === "shortlist") {
      result = (await runShortlistAnalysis(answers)) as unknown as Record<
        string,
        unknown
      >;
      inputSummary = `Shortlist · ${answers.goal ?? "goal?"} · ${answers.field ?? "field?"}`;
    } else {
      const letter = body.letter!.trim();
      result = (await runSopReview(letter)) as unknown as Record<
        string,
        unknown
      >;
      inputSummary = `SOP review · ${letter.length} chars`;
    }

    if (freeProfile) {
      await markFreeAnalysisUsed(session.userId);
    } else if (!legacySopUnlock) {
      const updated = await consumeAiCredit(session.userId);
      if (!updated) {
        return NextResponse.json(
          { error: "Could not consume credit.", locked: true },
          { status: 402 }
        );
      }
    }

    const report = await createAdvisorReport({
      userId: session.userId,
      type,
      inputSummary,
      result,
    });

    const refreshed = await getStudentProfile(session.userId);
    return NextResponse.json({
      report,
      result,
      credits: refreshed?.aiCredits ?? 0,
      freeAnalysisUsed: refreshed?.freeAnalysisUsed ?? true,
    });
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("[advisor/analysis]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Analysis failed. Try again.",
      },
      { status: 500 }
    );
  }
}

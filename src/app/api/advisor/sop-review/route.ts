import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getStudentProfile } from "@/lib/db/student-profile";
import { createLead } from "@/lib/db/leads";
import { runSopReview } from "@/lib/advisor/chat";
import { BudgetExceededError } from "@/lib/advisor/budget";
import { whatsappLink } from "@/lib/site";
import { createAdvisorReport } from "@/lib/db/advisor-reports";
import {
  consumeAiCredit,
} from "@/lib/db/student-profile";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    letter?: string;
    action?: "request" | "review";
  };
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

  const action = body.action ?? "request";
  const profile = await getStudentProfile(session.userId);

  if (action === "request") {
    const message = [
      "Hi! I want a paid SOP / motivation letter review.",
      `• Name: ${session.name}`,
      `• Email: ${session.email}`,
      `• Letter length: ${letter.length} characters`,
      `Profile: ${(process.env.BETTER_AUTH_URL || "http://localhost:3000")}/dashboard/profile`,
    ].join("\n");

    const lead = await createLead({
      kind: "sop_review",
      status: "new",
      userId: session.userId,
      email: session.email,
      name: session.name,
      goal: profile?.goal ?? null,
      lastQuestion: "SOP review request",
      transcriptSnippet: letter.slice(0, 400),
      shortlistCount: 0,
      profileUrl: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard/documents`,
      whatsappOpenedAt: new Date().toISOString(),
      notes: "",
      creditAmount: 0,
    });

    return NextResponse.json({
      leadId: lead.id,
      whatsappUrl: whatsappLink(message),
      unlocked: Boolean(
        profile?.sopReviewUnlocked || (profile?.aiCredits ?? 0) > 0
      ),
    });
  }

  const unlocked =
    Boolean(profile?.sopReviewUnlocked) || (profile?.aiCredits ?? 0) > 0;
  if (!unlocked) {
    return NextResponse.json(
      {
        error:
          "SOP review is locked until payment is confirmed. Tap Request review to open WhatsApp, or buy AI credits.",
        locked: true,
      },
      { status: 402 }
    );
  }

  try {
    const review = await runSopReview(letter);
    if (!profile?.sopReviewUnlocked) {
      await consumeAiCredit(session.userId);
    }
    await createAdvisorReport({
      userId: session.userId,
      type: "sop",
      inputSummary: `SOP review · ${letter.length} chars`,
      result: review as unknown as Record<string, unknown>,
    });
    return NextResponse.json({ review });
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("[sop-review]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Review failed. Try again.",
      },
      { status: 500 }
    );
  }
}

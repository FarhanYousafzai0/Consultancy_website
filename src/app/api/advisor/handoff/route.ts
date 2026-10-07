import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createLead } from "@/lib/db/leads";
import { listShortlist } from "@/lib/db/shortlist";
import {
  getStudentProfile,
  profileToAnswers,
} from "@/lib/db/student-profile";
import { whatsappLink } from "@/lib/site";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    lastQuestion?: string;
    transcriptSnippet?: string;
    goal?: string | null;
  };

  const session = await getSession();
  const goal = body.goal ?? null;

  if (goal === "ausbildung") {
    return NextResponse.json(
      { error: "ausbildung_self_serve" },
      { status: 400 }
    );
  }

  let shortlistCount = 0;
  let profileUrl: string | null = null;
  let gradeLine = "";
  let ieltsLine = "";

  if (session) {
    const shortlist = await listShortlist(session.userId);
    shortlistCount = shortlist.length;
    profileUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard/profile`;
    const profile = await getStudentProfile(session.userId);
    const answers = profileToAnswers(profile);
    if (answers.gradeValue != null && answers.gradeSystem) {
      gradeLine = `• Grade: ${answers.gradeValue} (${answers.gradeSystem})`;
    }
    if (answers.englishTest && answers.englishTest !== "none") {
      ieltsLine = `• ${answers.englishTest.toUpperCase()}: ${answers.englishScore ?? "n/a"}`;
    }
  }

  const lines = [
    "Hi! I'd like help applying to Germany after chatting with the Parwaaz advisor.",
    goal ? `• Target: ${goal}` : null,
    gradeLine || null,
    ieltsLine || null,
    body.lastQuestion ? `• Last question: ${body.lastQuestion.slice(0, 200)}` : null,
    `• Shortlist: ${shortlistCount} programs`,
    profileUrl ? `Profile: ${profileUrl}` : null,
  ].filter(Boolean);

  const message = lines.join("\n");
  const url = whatsappLink(message);

  const lead = await createLead({
    kind: "chat_handoff",
    status: "new",
    userId: session?.userId ?? null,
    email: session?.email ?? null,
    name: session?.name ?? null,
    goal: goal ?? null,
    lastQuestion: body.lastQuestion?.slice(0, 500) ?? null,
    transcriptSnippet: (body.transcriptSnippet ?? "").slice(0, 2000),
    shortlistCount,
    profileUrl,
    whatsappOpenedAt: new Date().toISOString(),
    notes: "",
    creditAmount: 0,
  });

  return NextResponse.json({ leadId: lead.id, whatsappUrl: url });
}

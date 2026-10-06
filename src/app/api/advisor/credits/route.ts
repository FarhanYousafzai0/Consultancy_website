import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getStudentProfile } from "@/lib/db/student-profile";
import { createLead } from "@/lib/db/leads";
import { whatsappLink } from "@/lib/site";

const PACKS: Record<string, { credits: number; label: string }> = {
  standard: { credits: 5, label: "5 AI analyses" },
  plus: { credits: 15, label: "15 AI analyses" },
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to buy credits." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { pack?: string };
  const packKey = body.pack && PACKS[body.pack] ? body.pack : "standard";
  const pack = PACKS[packKey]!;
  const envCredits = Number(process.env.AI_CREDIT_PACK_SIZE ?? pack.credits);
  const credits =
    Number.isFinite(envCredits) && envCredits > 0 ? envCredits : pack.credits;

  const profile = await getStudentProfile(session.userId);
  const message = [
    "Hi! I want to buy an AI credit pack on Parwaz.",
    `• Pack: ${pack.label} (${credits} credits)`,
    `• Name: ${session.name}`,
    `• Email: ${session.email}`,
    `• Current credits: ${profile?.aiCredits ?? 0}`,
  ].join("\n");

  const lead = await createLead({
    kind: "ai_credits",
    status: "new",
    userId: session.userId,
    email: session.email,
    name: session.name,
    goal: profile?.goal ?? null,
    lastQuestion: `Buy ${credits} AI credits`,
    transcriptSnippet: message,
    shortlistCount: 0,
    profileUrl: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard/advisor`,
    whatsappOpenedAt: new Date().toISOString(),
    notes: `credit pack ${credits}`,
    creditAmount: credits,
  });

  return NextResponse.json({
    leadId: lead.id,
    credits,
    whatsappUrl: whatsappLink(message),
  });
}

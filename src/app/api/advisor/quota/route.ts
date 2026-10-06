import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getStudentProfile } from "@/lib/db/student-profile";
import { getQuotaSnapshot } from "@/lib/advisor/budget";

const VISITOR_COOKIE = "parwaz_visitor";

export async function GET() {
  const session = await getSession();
  const jar = await cookies();
  const visitorId = jar.get(VISITOR_COOKIE)?.value ?? "anon";
  const subjectKey = session?.userId ?? visitorId;
  const profile = session ? await getStudentProfile(session.userId) : null;
  const hasCredits = Boolean(profile && profile.aiCredits > 0);
  const quota = await getQuotaSnapshot({
    subjectKey,
    isLoggedIn: Boolean(session),
    hasCredits,
  });
  return NextResponse.json({
    quota,
    credits: profile?.aiCredits ?? 0,
    freeAnalysisUsed: profile?.freeAnalysisUsed ?? false,
    loggedIn: Boolean(session),
  });
}

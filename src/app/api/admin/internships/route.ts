import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listInternshipAdminRecords } from "@/lib/db/internships";
import { isAdminSession } from "@/lib/internships/admin";

export async function GET() {
  const session = await getSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ internships: await listInternshipAdminRecords() });
}

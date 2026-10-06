import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listLeads } from "@/lib/db/leads";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

import { NextResponse } from "next/server";
import { sendDeadlineAlerts } from "@/lib/alerts/deadline-alerts";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  if (request.headers.get("x-cron-secret") === secret) return true;
  return false;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "1";
  const result = await sendDeadlineAlerts({ dryRun });
  return NextResponse.json({ ok: true, dryRun, ...result });
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}

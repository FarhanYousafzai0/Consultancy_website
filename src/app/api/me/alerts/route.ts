import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getAlertPreference,
  setAlertPreference,
} from "@/lib/db/alert-preferences";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const preference = await getAlertPreference(session.userId);
  return NextResponse.json({ preference });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { emailEnabled?: boolean };
  if (typeof body.emailEnabled !== "boolean") {
    return NextResponse.json(
      { error: "emailEnabled boolean required" },
      { status: 400 }
    );
  }
  const preference = await setAlertPreference(
    session.userId,
    body.emailEnabled
  );
  return NextResponse.json({ preference });
}

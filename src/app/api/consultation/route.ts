import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { consultationSchema } from "@/lib/consultation/schema";
import { notifyNewConsultation } from "@/lib/consultation/notify";
import { createConsultation, findRecentByEmail } from "@/lib/db/consultations";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never see or fill this field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ reference: "PZ-RECEIVED" });
  }

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error:
          issue &&
          (issue.code === "invalid_type" || issue.code === "invalid_value") &&
          issue.message.startsWith("Invalid")
            ? `Please answer: ${issue.path.join(".")}`
            : (issue?.message ?? "Some answers need checking."),
        field: issue?.path.join(".") ?? null,
      },
      { status: 400 }
    );
  }

  try {
    const existing = await findRecentByEmail(parsed.data.email);
    if (existing) {
      return NextResponse.json({ reference: existing.reference, duplicate: true });
    }

    const session = await getSession().catch(() => null);
    const record = await createConsultation({
      answers: parsed.data,
      userId: session?.userId ?? null,
      userAgent: request.headers.get("user-agent") ?? "",
    });

    await notifyNewConsultation(record).catch((error) =>
      console.error("[consultation] notify failed", error)
    );

    return NextResponse.json({ reference: record.reference });
  } catch (error) {
    console.error("[consultation] save failed", error);
    return NextResponse.json(
      { error: "We could not save your request. Please try again or message us on WhatsApp." },
      { status: 500 }
    );
  }
}

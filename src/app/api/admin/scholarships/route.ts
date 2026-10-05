import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { scholarshipInputSchema } from "@/lib/db/scholarship-schema";
import {
  createScholarship,
  ensureScholarshipsSeeded,
  listScholarships,
} from "@/lib/db/scholarships";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureScholarshipsSeeded();
  const scholarships = await listScholarships({ status: "all" });
  return NextResponse.json({ scholarships });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json();
  const parsed = scholarshipInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid scholarship" },
      { status: 400 }
    );
  }
  const scholarship = await createScholarship(parsed.data);
  return NextResponse.json({ scholarship }, { status: 201 });
}

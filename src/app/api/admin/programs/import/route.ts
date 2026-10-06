import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { importProgramInputs } from "@/lib/db/programs";
import {
  parseProgramImportCsv,
  parseProgramImportJson,
} from "@/lib/admin/program-import";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    format?: "json" | "csv";
    payload?: string;
  };
  const format = body.format === "csv" ? "csv" : "json";
  const payload = body.payload?.trim() ?? "";
  if (!payload) {
    return NextResponse.json({ error: "payload required" }, { status: 400 });
  }

  const parsed =
    format === "csv"
      ? parseProgramImportCsv(payload)
      : parseProgramImportJson(payload);

  if (parsed.programs.length === 0) {
    return NextResponse.json(
      {
        error: "No valid programs to import.",
        details: parsed.errors,
      },
      { status: 400 }
    );
  }

  const inserted = await importProgramInputs(parsed.programs);
  return NextResponse.json({
    inserted,
    skipped: parsed.programs.length - inserted,
    parseErrors: parsed.errors,
  });
}

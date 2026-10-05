import { NextResponse } from "next/server";

/** @deprecated Use authClient.signOut() */
export async function POST() {
  return NextResponse.json(
    { error: "Use Better Auth signOut via the client." },
    { status: 410 }
  );
}

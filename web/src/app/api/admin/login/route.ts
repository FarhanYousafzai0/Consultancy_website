import { NextResponse } from "next/server";

/** @deprecated Use Better Auth client: authClient.emailOtp / signIn.emailOtp */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Use /api/auth email OTP endpoints via the Better Auth client. See /admin/login.",
    },
    { status: 410 }
  );
}

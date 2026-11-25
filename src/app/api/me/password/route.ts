import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getAuth, MIN_PASSWORD_LENGTH } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";

/** Whether the signed-in user already has a password. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const auth = await getAuth();
  const accounts = (await auth.api.listUserAccounts({
    headers: await headers(),
  })) as { providerId: string }[];
  return NextResponse.json({
    hasPassword: accounts.some((a) => a.providerId === "credential"),
  });
}

const bodySchema = z.object({
  newPassword: z.string().min(MIN_PASSWORD_LENGTH).max(128),
});

/** First password for an account made by email code or Google. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }
  try {
    const auth = await getAuth();
    await auth.api.setPassword({
      headers: await headers(),
      body: { newPassword: parsed.data.newPassword },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && /already/i.test(error.message)
        ? "You already have a password. Change it from your profile instead."
        : error instanceof Error && /fresh|session/i.test(error.message)
          ? "Please sign in again, then set your password."
          : "Could not set the password. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

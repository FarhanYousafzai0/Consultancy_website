import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/finish-login-path";
import { ContinueLogin } from "./continue-client";

export const metadata = { title: "Signing you in" };
export const dynamic = "force-dynamic";

/** Google sends people here after sign-in so we can finish the same steps as email login. */
export default async function ContinueLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
  }
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center">Signing you in…</div>}>
      <ContinueLogin email={session.email} />
    </Suspense>
  );
}

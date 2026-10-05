import { Suspense } from "react";
import { redirect } from "next/navigation";
import { StudentAuthForm } from "@/components/auth/student-auth-form";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Log in" };

function googleEnabled() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin/programs");
  if (session) redirect("/dashboard");

  return (
    <Suspense fallback={<div className="px-4 py-16 text-center">Loading…</div>}>
      <StudentAuthForm mode="login" googleEnabled={googleEnabled()} />
    </Suspense>
  );
}

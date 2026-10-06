import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SignOut } from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/layout/logo";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { AdvisorChat } from "@/components/advisor/advisor-chat";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getAuth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";

/** Auth + MongoDB — must not prerender during Vercel build. */
export const dynamic = "force-dynamic";

async function signOutAction() {
  "use server";
  const auth = await getAuth();
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo />
          <span className="truncate text-sm text-muted-foreground">
            {session.name}
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6 md:px-6 md:py-10">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-8 space-y-6">
            <Logo />
            <DashboardNav />
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <p className="truncate text-sm font-semibold">{session.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {session.email}
              </p>
              <form action={signOutAction} className="mt-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  <SignOut className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
            <Link
              href="/programs"
              className="block text-sm font-medium text-forest hover:underline"
            >
              Browse programs →
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      </div>

      <MobileTabBar />
      <AdvisorChat />
    </div>
  );
}

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Logo } from "@/components/layout/logo";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { AdvisorChat } from "@/components/advisor/advisor-chat";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getAuth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { getStudentProfile } from "@/lib/db/student-profile";

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

  const profile = await getStudentProfile(session.userId);
  const account = {
    name: session.name,
    email: session.email,
    userId: session.userId,
    aiCredits: profile?.aiCredits ?? 0,
    sopReviewUnlocked: profile?.sopReviewUnlocked ?? false,
    freeAnalysisUsed: profile?.freeAnalysisUsed ?? false,
    signOutAction,
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-full flex-col px-4 py-6">
          <Logo />
          <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
            <DashboardNav />
          </div>
          <div className="mt-4 shrink-0">
            <AccountMenu {...account} />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo />
            <AccountMenu {...account} compact />
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10">
          {children}
        </main>
      </div>

      <MobileTabBar />
      <AdvisorChat />
    </div>
  );
}

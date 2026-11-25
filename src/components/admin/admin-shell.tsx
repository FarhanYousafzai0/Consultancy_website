import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Logo } from "@/components/layout/logo";
import { AdminAccountMenu } from "@/components/admin/admin-account-menu";
import { AdminMobileTabBar } from "@/components/admin/admin-mobile-tab-bar";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopHeader } from "@/components/admin/admin-top-header";
import { connectMongo } from "@/lib/db/connect";
import { ConsultationModel } from "@/lib/db/consultation-model";

export async function AdminShell({
  children,
  title,
  headerActions,
}: {
  children: React.ReactNode;
  title: string;
  headerActions?: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }
  await connectMongo();
  const [consultationCount, newConsultationCount] = await Promise.all([
    ConsultationModel.countDocuments(),
    ConsultationModel.countDocuments({ status: "new" }),
  ]);

  return (
    <div className="min-h-screen bg-[#edf1ee] p-0 md:p-4">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-border bg-background md:inset-y-4 md:left-4 md:flex md:rounded-[1.5rem] md:shadow-card">
        <div className="flex h-full flex-col px-4 py-6">
          <Logo />
          <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto"><AdminNav consultationCount={consultationCount} newConsultationCount={newConsultationCount} /></div>
          <div className="mt-4 shrink-0"><AdminAccountMenu email={session.email} name={session.name} /></div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-[19rem]">
        <header className="sticky top-0 z-30 border-b border-border bg-background md:hidden">
          <div className="flex h-14 items-center justify-between px-4"><Logo /><AdminAccountMenu email={session.email} name={session.name} compact /></div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-24 md:px-5 md:py-5 md:pb-5">
          <AdminTopHeader title={title} actions={headerActions} showTools={title === "Dashboard"} />
          {children}
        </main>
      </div>
      <AdminMobileTabBar />
    </div>
  );
}

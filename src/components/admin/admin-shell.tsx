import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/admin-header";

export async function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title={title} email={session.email} />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}

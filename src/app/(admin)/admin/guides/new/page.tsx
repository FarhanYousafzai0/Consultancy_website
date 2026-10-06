import { AdminShell } from "@/components/admin/admin-shell";
import { GuideForm } from "@/components/admin/guide-form";

export const metadata = { title: "Admin · New guide" };

export default function AdminNewGuidePage() {
  return (
    <AdminShell title="New guide">
      <GuideForm />
    </AdminShell>
  );
}

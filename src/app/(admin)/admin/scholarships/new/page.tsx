import { AdminShell } from "@/components/admin/admin-shell";
import { ScholarshipForm } from "@/components/admin/scholarship-form";

export const metadata = { title: "Admin · Add scholarship" };

export default function NewScholarshipPage() {
  return (
    <AdminShell title="Add scholarship">
      <ScholarshipForm />
    </AdminShell>
  );
}

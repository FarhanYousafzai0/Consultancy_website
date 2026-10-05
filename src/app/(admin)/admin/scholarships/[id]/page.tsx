import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ScholarshipForm } from "@/components/admin/scholarship-form";
import { getScholarship } from "@/lib/db/scholarships";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Admin · Edit scholarship" };

export default async function EditScholarshipPage({ params }: Props) {
  const { id } = await params;
  const scholarship = await getScholarship(id);
  if (!scholarship) notFound();

  return (
    <AdminShell title="Edit scholarship">
      <ScholarshipForm initial={scholarship} />
    </AdminShell>
  );
}

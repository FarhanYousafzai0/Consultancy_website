import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { GuideForm } from "@/components/admin/guide-form";
import { getGuide } from "@/lib/db/guides";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Admin · Edit guide" };

export default async function AdminEditGuidePage({ params }: Props) {
  const { id } = await params;
  const guide = await getGuide(id);
  if (!guide) notFound();

  return (
    <AdminShell title="Edit guide">
      <GuideForm initial={guide} />
    </AdminShell>
  );
}

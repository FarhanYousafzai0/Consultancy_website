import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProgramForm } from "@/components/admin/program-form";
import { getProgram } from "@/lib/db/programs";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Admin · Edit program",
};

export default async function EditProgramPage({ params }: Props) {
  const { id } = await params;
  const program = await getProgram(id);
  if (!program) notFound();

  return (
    <AdminShell title={`Edit · ${program.name}`}>
      <ProgramForm initial={program} />
    </AdminShell>
  );
}

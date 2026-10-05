import { AdminShell } from "@/components/admin/admin-shell";
import { ProgramForm } from "@/components/admin/program-form";

export const metadata = {
  title: "Admin · Add program",
};

export default function NewProgramPage() {
  return (
    <AdminShell title="Add program">
      <ProgramForm />
    </AdminShell>
  );
}

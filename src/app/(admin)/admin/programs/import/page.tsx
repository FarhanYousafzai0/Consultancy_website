import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProgramImportForm } from "@/components/admin/program-import-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin · Import programs" };

export default function AdminProgramImportPage() {
  return (
    <AdminShell title="Import programs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Bulk-add programs as <strong>drafts</strong> with a source URL. Open
          each draft, verify the official page, set last-verified, then publish.
          Target: 150–200 English-taught Master&apos;s — quality over invented
          rows.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/programs">Back to programs</Link>
        </Button>
      </div>
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <ProgramImportForm />
      </section>
    </AdminShell>
  );
}

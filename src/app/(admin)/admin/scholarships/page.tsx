import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteScholarshipButton } from "@/components/admin/delete-scholarship-button";
import {
  ensureScholarshipsSeeded,
  listScholarships,
} from "@/lib/db/scholarships";

export const metadata = { title: "Admin · Scholarships" };

export default async function AdminScholarshipsPage() {
  await ensureScholarshipsSeeded();
  const scholarships = await listScholarships({ status: "all" });

  return (
    <AdminShell title="Scholarships">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {scholarships.length} scholarships · seed rows are illustrative until
          verified.
        </p>
        <Button asChild>
          <Link href="/admin/scholarships/new">Add scholarship</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Scholarship</th>
              <th className="px-4 py-3 font-semibold">Levels</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Verified</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scholarships.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-muted-foreground">{s.provider}</p>
                </td>
                <td className="px-4 py-3 capitalize">
                  {s.levels.join(", ")}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      s.status === "published" ? "verified" : "predicted"
                    }
                  >
                    {s.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.lastVerifiedAt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/scholarships/${s.id}`}>Edit</Link>
                    </Button>
                    <DeleteScholarshipButton id={s.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

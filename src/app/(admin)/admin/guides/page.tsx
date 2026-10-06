import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteGuideButton } from "@/components/admin/delete-guide-button";
import { ensureGuidesSeeded, listGuides } from "@/lib/db/guides";

export const metadata = { title: "Admin · Guides" };

export default async function AdminGuidesPage() {
  await ensureGuidesSeeded();
  const guides = await listGuides({ status: "all" });

  return (
    <AdminShell title="Guides">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {guides.length} guides · knowledge base for the AI advisor
        </p>
        <Button asChild>
          <Link href="/admin/guides/new">Add guide</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Guide</th>
              <th className="px-4 py-3 font-semibold">Topic</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Verified</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((g) => (
              <tr key={g.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{g.title}</p>
                  <p className="text-muted-foreground">/{g.slug}</p>
                </td>
                <td className="px-4 py-3 capitalize">
                  {g.topic.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      g.status === "published" ? "verified" : "predicted"
                    }
                  >
                    {g.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {g.lastVerifiedAt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/guides/${g.id}`}>Edit</Link>
                    </Button>
                    <DeleteGuideButton id={g.id} />
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

import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { LeadStatusButtons } from "@/components/admin/lead-status-buttons";
import { listLeads } from "@/lib/db/leads";

export const metadata = { title: "Admin · Leads" };

export default async function AdminLeadsPage() {
  const leads = await listLeads();

  return (
    <AdminShell title="Leads">
      <p className="mb-6 text-sm text-muted-foreground">
        Consultant handoffs, SOP review requests, and AI credit packs. Mark{" "}
        <strong>sop_review</strong> or <strong>ai_credits</strong> as paid to
        unlock review / grant credits.
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Kind</th>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Question</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-muted-foreground">
                  No leads yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{lead.kind}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{lead.name ?? "Visitor"}</p>
                    <p className="text-muted-foreground">{lead.email ?? "—"}</p>
                    {lead.profileUrl ? (
                      <Link
                        href={lead.profileUrl.replace(/^https?:\/\/[^/]+/, "") || "/dashboard/profile"}
                        className="text-xs text-forest hover:underline"
                      >
                        Profile
                      </Link>
                    ) : null}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    {lead.lastQuestion ?? lead.transcriptSnippet.slice(0, 120) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        lead.status === "paid" ? "verified" : "predicted"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusButtons
                      id={lead.id}
                      status={lead.status}
                      kind={lead.kind}
                      userId={lead.userId}
                      creditAmount={lead.creditAmount}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

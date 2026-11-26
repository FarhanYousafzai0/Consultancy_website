import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { InternshipReviewForm } from "@/components/admin/internship-review-form";
import { Badge } from "@/components/ui/badge";
import { getInternship } from "@/lib/db/internships";
import { getResearchSourceState } from "@/lib/db/research-sources";
import { internshipSources } from "@/data/internship-sources";

type Props = { params: Promise<{ id: string }> };
export const metadata = { title: "Admin · Review internship" };

function date(value: string | null) { return value ? new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not recorded"; }

export default async function ReviewInternshipPage({ params }: Props) {
  const item = await getInternship((await params).id);
  if (!item) notFound();
  const source = internshipSources.find((candidate) => item.sourceUrl.startsWith(candidate.url) || item.sourceDomain === candidate.domain || (candidate.allowedDomains ?? []).includes(item.sourceDomain));
  const sourceState = source ? await getResearchSourceState(source.id) : null;
  return <AdminShell title="Review internship" headerActions={<div className="flex flex-wrap gap-2"><Badge variant={item.verificationStatus === "verified" ? "verified" : item.verificationStatus === "rejected" ? "error" : "predicted"}>Verification: {item.verificationStatus}</Badge><Badge variant={item.publicationStatus === "published" ? "verified" : "predicted"}>Publication: {item.publicationStatus}</Badge></div>}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><InternshipReviewForm initial={item} /><aside className="space-y-5"><Panel title="Provenance"><dl className="space-y-3 text-sm"><Info label="Official source" value={item.sourceUrl} link /><Info label="Application URL" value={item.applicationUrl ?? "Not available"} link /><Info label="Source domain" value={item.sourceDomain} /><Info label="Canonical identity" value={item.canonicalIdentity} mono /><Info label="Last verified" value={date(item.lastVerifiedAt)} /><Info label="Last checked" value={date(item.lastCheckedAt)} /><Info label="Last successful fetch" value={date(item.lastSuccessfulFetchAt)} /><Info label="Content hash" value={item.sourceContentHash ?? "Not recorded"} mono /></dl></Panel>
      <Panel title="Fetch history and changes"><dl className="space-y-3 text-sm"><Info label="Source registry" value={source?.name ?? "No matching curated source"} /><Info label="Registry checked" value={date(sourceState?.lastCheckedAt?.toISOString() ?? null)} /><Info label="Registry success" value={date(sourceState?.lastSuccessfulFetchAt?.toISOString() ?? null)} /><Info label="Registry hash" value={sourceState?.contentHash ?? "Not recorded"} mono /></dl>{item.researchError && <p className="mt-4 rounded-xl bg-error-soft p-3 text-sm text-destructive"><strong>Research error:</strong> {item.researchError}</p>}</Panel>
      <Panel title={`Evidence (${item.evidence.length})`}>{item.evidence.length ? <div className="space-y-4">{item.evidence.map((evidence, index) => <div key={`${evidence.field}-${index}`} className="rounded-xl border border-border p-3 text-sm"><p className="font-semibold capitalize">{evidence.field.replaceAll("_", " ")}</p><blockquote className="mt-1 border-l-2 border-primary pl-3 text-muted-foreground">{evidence.quote}</blockquote><a className="mt-2 block break-all text-xs text-forest underline" href={evidence.sourceUrl} target="_blank" rel="noreferrer">{evidence.sourceUrl}</a><p className="mt-1 text-xs text-muted-foreground">Captured {date(evidence.capturedAt)}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No evidence captured. This record cannot be approved until evidence is added by the research pipeline.</p>}</Panel></aside></div>
  </AdminShell>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl bg-white p-5 shadow-card"><h2 className="mb-4 text-lg font-bold">{title}</h2>{children}</section>; }
function Info({ label, value, link = false, mono = false }: { label: string; value: string; link?: boolean; mono?: boolean }) { return <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>{link && value.startsWith("http") ? <dd className="mt-1 break-all text-sm"><a href={value} target="_blank" rel="noreferrer" className="text-forest underline">{value}</a></dd> : <dd className={`mt-1 break-words text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>}</div>; }

import Link from "next/link";
import { ArrowSquareOut, Briefcase, CalendarBlank, CheckCircle, Clock, GlobeHemisphereWest, MapPin } from "@phosphor-icons/react/ssr";
import type { PublicInternship } from "@/lib/internships/public";
import { fieldLabel } from "@/lib/internships/public";

const statusStyles = {
  open: ["Open", "bg-secondary text-forest"],
  closing_soon: ["Closing soon", "bg-amber-soft text-amber-ink"],
  closed: ["Closed", "bg-muted text-muted-foreground"],
  unknown: ["Status unconfirmed", "bg-muted text-muted-foreground"],
} as const;

function deadlineLabel(item: PublicInternship) {
  if (item.csvInfo) return item.csvInfo.deadline ? `Reported deadline: ${item.csvInfo.deadline}${item.csvInfo.deadlineNote ? ` (${item.csvInfo.deadlineNote})` : ""}` : "Deadline not confirmed";
  if (item.deadlineStatus === "rolling") return "Rolling applications";
  if (item.deadlineStatus === "not_published") return "Deadline not published";
  if (item.deadlineStatus === "ambiguous" || !item.deadline) return "Deadline unconfirmed";
  return `Deadline: ${item.deadline.slice(0, 10)}`;
}

function fundingLabel(value: PublicInternship["fundingStatus"]) {
  return value === "fully_funded" ? "Fully funded" : value === "partially_funded" ? "Partially funded" : value === "unknown" ? "Funding not specified" : value.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function InternshipCard({ item }: { item: PublicInternship }) {
  const [statusLabel, statusClass] = statusStyles[item.availability];
  const applicationUrl = item.applicationUrl || item.sourceUrl;
  const isActionable = item.availability === "open" || item.availability === "closing_soon";
  const applicationLabel = item.csvInfo ? "View supplied source" : isActionable ? "Apply on official site" : "Visit official site";
  const applicationAriaLabel = `${applicationLabel}: ${item.title} (opens in a new tab)`;
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-white">
        <div className="grid size-11 place-items-center rounded-2xl bg-primary text-ink">
          {item.organizationLogoUrl ? (
            // Organization logos are user/source-provided URLs; next/image would require an open-ended remote host allowlist.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.organizationLogoUrl} alt={`${item.organizationName} logo`} className="size-9 rounded-xl object-contain" />
          ) : <Briefcase aria-hidden className="size-6" />}
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClass}`}>{item.csvInfo ? "Status unverified" : statusLabel}</span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{item.organizationName}</p>
        <h2 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-foreground">{item.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.summary || item.description || "Explore this opportunity on the official website."}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">{fundingLabel(item.fundingStatus)}</span>
          {item.studyFields.slice(0, 2).map((field) => <span key={field} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">{fieldLabel(field)}</span>)}
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-start gap-2"><GlobeHemisphereWest aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" /><dd>{item.locationLabel || [item.city, item.countryLabel].filter(Boolean).join(", ") || "Location not specified"} · {item.workMode === "on_site" ? "On-site" : item.workMode.replace(/\b\w/g, (letter) => letter.toUpperCase())}</dd></div>
          <div className="flex items-start gap-2"><Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" /><dd>{item.durationText || (item.durationValue ? `${item.durationValue} ${item.durationUnit}` : "Duration not specified")}</dd></div>
          <div className="flex items-start gap-2"><CalendarBlank aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" /><dd>{deadlineLabel(item)}</dd></div>
        </dl>
        <details className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm">
          <summary className="cursor-pointer font-bold">View eligibility and benefits</summary>
          <div className="mt-3 space-y-3 text-muted-foreground">
            <p><strong className="text-foreground">Eligibility:</strong> {item.eligibilityCriteria.length ? item.eligibilityCriteria.join(" ") : "Eligibility details are on the official website."}</p>
            <p><strong className="text-foreground">Benefits:</strong> {item.benefits.length ? item.benefits.join(" ") : item.stipendSummary || "Benefits are not specified."}</p>
            {item.csvInfo && <p><strong className="text-foreground">Imported snapshot:</strong> Reported status: {item.csvInfo.status}. Source type: {item.csvInfo.sourceType}. {item.csvInfo.note} Check details and eligibility on the provider’s website.</p>}
          </div>
        </details>
        <div className="mt-auto pt-6">
          <p className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle aria-hidden className="size-4 text-forest" />{item.csvInfo ? `Imported CSV · not independently verified${item.csvInfo.checked ? ` · snapshot ${item.csvInfo.checked}` : ""}` : `Last verified: ${item.lastVerifiedAt ? item.lastVerifiedAt.slice(0, 10) : "Not yet verified"}`}</p>
          <a href={applicationUrl} target="_blank" rel="noopener noreferrer" aria-label={applicationAriaLabel} className="flex items-center justify-between rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">{applicationLabel}<ArrowSquareOut aria-hidden className="size-4" /></a>
          {!item.csvInfo && <Link href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">View source <MapPin aria-hidden className="size-3.5" /></Link>}
        </div>
      </div>
    </article>
  );
}

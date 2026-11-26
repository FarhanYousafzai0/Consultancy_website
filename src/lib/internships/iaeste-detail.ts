/** A single fetched IAESTE detail page, in the crawler's text/link format. */
export type IaesteDetailPage = {
  url: string;
  text: string;
  links: readonly { url: string; label: string }[];
};

export type IaesteDetail = {
  canonicalIdentity: string;
  referenceNumber: string;
  sourceUrl: string;
  title: string | null;
  country: string | null;
  workMode: string | null;
  duration: string | null;
  availabilityWindow: { from: string; to: string } | null;
  deadline: string | null;
  deadlineStatus: "confirmed" | "ambiguous" | "not_published";
  eligibilityCriteria: string[];
  stipendSummary: string | null;
  applicationUrl: string | null;
  evidence: { field: string; quote: string; sourceUrl: string }[];
};

const labels = ["Location", "Internship type", "Reference Number", "Student Requirements", "General Discipline", "Completed Years of Study", "Field of Study", "Languages", "Required Knowledge and Experience", "Other Requirements", "Work Details", "Duration", "Within", "Company closed during holidays", "Work Environment", "Gross Pay", "Working Hours", "Living Lodging", "Type Of Accommodation", "Estimated cost of lodging", "Estimated cost of living", "Interested In Applying For This Internship?", "Application Deadline", "Application deadline", "Deadline"];
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const boundary = labels.map(escapeRegex).join("|");

function date(value: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!m) return null;
  const [, day, month, year] = m;
  const iso = `${year}-${month}-${day}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === iso ? iso : null;
}

/** Parse only the supplied detail page. No fetching, database writes, or inferred eligibility. */
export function parseIaesteDetail(page: IaesteDetailPage): IaesteDetail | null {
  let source: URL;
  try { source = new URL(page.url); } catch { return null; }
  if (source.protocol !== "https:" || source.hostname !== "iaeste.org" || source.username || source.password || source.port || !/^\/internships\/[a-z0-9-]+\/?$/i.test(source.pathname)) return null;
  const text = page.text.replace(/\s+/g, " ").trim();
  const refMatch = /\bReference Number\s+([A-Z]{2}-\d{4}-[A-Z0-9-]+)(?=\s|$)/i.exec(text);
  if (!refMatch) return null;
  const referenceNumber = refMatch[1].toUpperCase();
  if (source.pathname.split("/").filter(Boolean).pop()?.toLowerCase() !== referenceNumber.toLowerCase()) return null;
  source.search = ""; source.hash = ""; source.pathname = source.pathname.replace(/\/$/, "");
  const sourceUrl = source.href;
  const evidence: IaesteDetail["evidence"] = [];
  function field(label: string, evidenceField: string): string | null {
    const regex = new RegExp(`\\b${escapeRegex(label)}\\s+(.+?)(?=\\s+(?:${boundary})(?:\\s|$)|$)`, "i");
    const match = regex.exec(text);
    const value = match?.[1]?.trim();
    if (!match || !value || value === "-") return null;
    evidence.push({ field: evidenceField, quote: match[0].trim(), sourceUrl });
    return value;
  }
  evidence.push({ field: "referenceNumber", quote: refMatch[0], sourceUrl });
  const header = new RegExp(`\\b${escapeRegex(referenceNumber)}\\s+(.+?)\\s+(\\d{2}\\.\\d{2}\\.\\d{4})\\s+Apply Now\\b`, "i").exec(text);
  const title = header?.[1]?.trim() || null;
  if (title && header) evidence.push({ field: "title", quote: `${referenceNumber} ${title}`, sourceUrl });
  const country = field("Location", "country");
  const workMode = field("Internship type", "workMode");
  const duration = field("Duration", "duration");
  const windowText = field("Within", "availabilityWindow");
  const windowMatch = windowText && /^(\d{2}\.\d{2}\.\d{4})\s*[-–]\s*(\d{2}\.\d{2}\.\d{4})$/.exec(windowText);
  const from = windowMatch && date(windowMatch[1]);
  const to = windowMatch && date(windowMatch[2]);
  const availabilityWindow = from && to && from <= to ? { from, to } : null;
  const deadlineText = field("Application Deadline", "deadline") ?? field("Deadline", "deadline");
  const deadline = deadlineText ? date(deadlineText) : null;
  const deadlineStatus = deadline ? "confirmed" : deadlineText || header ? "ambiguous" : "not_published";
  const eligibilityCriteria = ["General Discipline", "Completed Years of Study", "Field of Study", "Languages", "Required Knowledge and Experience", "Other Requirements"].flatMap((label) => {
    const value = field(label, "eligibility");
    return value ? [`${label}: ${value}`] : [];
  });
  const stipendSummary = field("Gross Pay", "stipend");
  const applicationUrl = page.links.find((link) => {
    if (!/^(apply now|register)$/i.test(link.label.trim())) return false;
    try { const url = new URL(link.url); return url.protocol === "https:" && url.hostname === "iaeste.smartsimple.ie" && !url.username && !url.password && !url.port; } catch { return false; }
  })?.url ?? null;
  return { canonicalIdentity: `iaeste-exchange-internships:${referenceNumber}`, referenceNumber, sourceUrl, title, country, workMode, duration, availabilityWindow, deadline, deadlineStatus, eligibilityCriteria, stipendSummary, applicationUrl, evidence };
}

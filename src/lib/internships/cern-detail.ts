import type { CernPage } from "./cern-discovery";

export type CernDetail = {
  canonicalIdentity: string; referenceNumber: string; sourceUrl: string; retrievedAt: string; contentHash: string;
  title: string; location: string | null; duration: string | null; startDateText: string | null;
  deadline: { date: string; time: string; timezone: "Europe/Zurich"; wording: string } | null;
  deadlineStatus: "confirmed" | "ambiguous" | "not_published";
  eligibilityCriteria: string[]; nationalityEligibility: string[]; benefits: string[]; applicationUrl: string | null;
  evidence: { field: string; quote: string; sourceUrl: string }[];
};
// Evidence is verbatim in this normalized, decoded page text, not reconstructed prose.
export function cernText(html: string) {
  return html.replace(/<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>/gi, " ").replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => { const x = Number(n); return x <= 0x10ffff ? String.fromCodePoint(x) : "�"; }).replace(/\s+/g, " ").trim();
}
function block(html: string, tag: string, cls: string) {
  return new RegExp(`<${tag}\\b[^>]*class=["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(html)?.[1] ?? "";
}
/** Parse a single fetched CERN vacancy; no model, network or storage access. */
export function parseCernDetail(page: CernPage): CernDetail | null {
  let url: URL; try { url = new URL(page.url); } catch { return null; }
  if (url.origin !== "https://careers.cern" || url.username || url.password || !/^\/jobs\/[^/]+\/?$/.test(url.pathname)) return null;
  url.search = ""; url.hash = ""; const sourceUrl = url.href;
  const title = cernText(block(page.html, "h1", "job-offer__title"));
  const ref = cernText(block(page.html, "span", "ref"));
  if (!title || !ref || !/intern(?:ship)?|student|studentship/i.test(title)) return null;
  const text = cernText(page.html); const evidence: CernDetail["evidence"] = [];
  function add(field: string, quote: string) { if (quote && text.includes(quote)) evidence.push({ field, quote, sourceUrl }); }
  add("title", title); add("referenceNumber", ref);
  const location = cernText(block(page.html, "span", "location")) || null; if (location) add("location", location);
  const start = /<strong>\s*Ideal start date:\s*<\/strong>\s*<span>([\s\S]*?)<\/span>/i.exec(page.html);
  const startDateText = start ? cernText(start[1]) : null; if (start && startDateText) add("startDate", cernText(start[0]));
  const dur = /<strong>\s*Contract duration \(in months\):\s*<\/strong>\s*<span>([\s\S]*?)<\/span>/i.exec(page.html);
  const duration = dur ? cernText(dur[0]) : null; if (duration) add("duration", duration);
  const deadlineText = cernText(block(page.html, "div", "before"));
  let deadline: CernDetail["deadline"] = null;
  const dm = /^Before (\d{2})\/(\d{2})\/(\d{4}) at (\d{2}):(\d{2}) \(Geneva Time\)$/i.exec(deadlineText);
  if (dm && Number(dm[1]) > 12) { const [, d, m, y, h, min] = dm; const date = `${y}-${m}-${d}`; const check = new Date(`${date}T00:00:00Z`); if (!Number.isNaN(check.valueOf()) && check.toISOString().slice(0, 10) === date && Number(h) < 24 && Number(min) < 60) deadline = { date, time: `${h}:${min}`, timezone: "Europe/Zurich", wording: deadlineText }; }
  if (deadlineText) add("deadline", deadlineText);
  const eligibilityBlock = block(page.html, "div", "eligibility");
  const eligibilityCriteria = [...eligibilityBlock.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(m => cernText(m[1])).filter(Boolean);
  for (const item of eligibilityCriteria) add("eligibility", item);
  const nationalityEligibility = eligibilityCriteria.filter(item => /nationals?|nationality|citizens?|member state/i.test(item));
  const benefitsBlock = /<section\b[^>]*class=["'][^"']*job-offer__global-benefits\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i.exec(page.html)?.[1] ?? "";
  const benefits = [...benefitsBlock.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(m => cernText(m[1])).filter(Boolean); for (const item of benefits) add(/allowance|salary|stipend/i.test(item) ? "stipend" : "benefits", item);
  const apps = new Set<string>();
  for (const m of page.html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    if (!/^apply(?: now)?$/i.test(cernText(m[2]))) continue;
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(m[1])?.[1]; if (!href) continue;
    try { const link = new URL(href.replace(/&amp;/g, "&"), sourceUrl); if (link.protocol === "https:" && link.hostname === "jobs.smartrecruiters.com" && !link.port && !link.username && !link.password && /\/CERN\//i.test(link.pathname)) apps.add(link.href); } catch { /* ignore malformed links */ }
  }
  return { canonicalIdentity: `cern-internships:${ref.toUpperCase()}`, referenceNumber: ref, sourceUrl, retrievedAt: page.retrievedAt, contentHash: page.hash, title, location, duration, startDateText, deadline, deadlineStatus: deadline ? "confirmed" : deadlineText ? "ambiguous" : "not_published", eligibilityCriteria, nationalityEligibility, benefits, applicationUrl: apps.size === 1 ? [...apps][0] : null, evidence };
}

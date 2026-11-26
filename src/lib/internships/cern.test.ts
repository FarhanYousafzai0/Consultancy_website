import { strict as assert } from "node:assert";
import { test } from "node:test";
import { discoverCernInternships } from "./cern-discovery";
import { parseCernDetail, cernText } from "./cern-detail";
const base = "https://careers.cern";
const html = `<h1 class="job-offer__title">Short-Term Internship 2027 - IT</h1><span class="ref">STAG 2027 IT</span><span class="location">Geneva, Switzerland</span><div class="before">Before 25/11/2027 at 23:59 (Geneva Time)</div><strong>Contract duration (in months):</strong><span>1 to 6</span><div class="block eligibility"><ul><li>You are a national of a <a href="https://home.cern/">CERN Member State or Associate Member State</a>. Currently, we cannot consider applications from Pakistani nationals.</li><li>You remain enrolled.</li></ul></div><section class="job-offer__global-benefits wrap"><li>A monthly net allowance of 1,593 Swiss Francs.</li></section><a href="https://jobs.smartrecruiters.com/oneclick-ui/company/CERN/publication/abc">Apply now</a>`;
const page = { url: `${base}/jobs/internship/`, html, hash: "hash", retrievedAt: "2026-11-27T00:00:00Z" };
function mock(robots: string, pages: Record<string, string | Response>) {
  const requests: string[] = [];
  const fetcher: typeof fetch = async input => { const url = String(input); requests.push(url); if (url === `${base}/robots.txt`) return new Response(robots, { headers: { "content-type": "text/plain" } }); const v = pages[url]; return v instanceof Response ? v : v === undefined ? new Response("missing", { status: 404 }) : new Response(v, { headers: { "content-type": "text/html" } }); };
  return { fetcher, requests };
}
test("discovers paginated CERN listings, deduplicates and fetches only details", async () => {
  const f = mock("User-agent: *\nAllow: /", { [`${base}/jobs/`]: '<a href="/jobs/internship/">Internship</a><a rel="next" href="?page=2">Next</a>', [`${base}/jobs/?page=2`]: '<a href="/jobs/internship/?tracking=1">Internship</a>', [page.url]: html });
  const r = await discoverCernInternships({ fetcher: f.fetcher, delayMs: 0 }); assert.equal(r.complete, true); assert.equal(r.listingPagesFetched, 2); assert.equal(r.pages.length, 1); assert.match(r.pages[0].hash, /^[a-f\d]{64}$/); assert.ok(r.pages[0].retrievedAt);
});
test("fails closed on robots, redirects, pagination limits and unsafe content", async () => {
  const f = mock("User-agent: *\nDisallow: /jobs/internship/", { [`${base}/jobs/`]: '<a href="/jobs/internship/">Internship</a>' }); const r = await discoverCernInternships({ fetcher: f.fetcher, delayMs: 0 }); assert.equal(r.complete, false); assert.match(r.failures.join(), /robots/); assert.equal(f.requests.length, 2);
  const g = mock("User-agent: *\nAllow: /", { [`${base}/jobs/`]: new Response(null, { status: 302, headers: { location: "https://evil.example/" } }) }); assert.match((await discoverCernInternships({ fetcher: g.fetcher, delayMs: 0 })).failures.join(), /outside CERN/); assert.equal(g.requests.length, 2);
  const h = mock("User-agent: *\nAllow: /", { [`${base}/jobs/`]: '<a href="/jobs/internship/">Internship</a><a rel="next" href="?page=2">Next</a>', [page.url]: html }); assert.match((await discoverCernInternships({ fetcher: h.fetcher, delayMs: 0, maxListingPages: 1 })).failures.join(), /limit/);
  assert.equal((await discoverCernInternships({ fetcher: async () => new Response("no", { status: 503 }), delayMs: 0 })).complete, false);
});
test("extracts per-page evidence, nationality restrictions, dates and official application", () => {
  const r = parseCernDetail(page)!; assert.equal(r.canonicalIdentity, "cern-internships:STAG 2027 IT"); assert.equal(r.deadline?.date, "2027-11-25"); assert.equal(r.deadline?.timezone, "Europe/Zurich"); assert.match(r.nationalityEligibility[0], /cannot consider applications from Pakistani/); assert.match(r.applicationUrl!, /^https:\/\/jobs.smartrecruiters.com\//); for (const e of r.evidence) assert.ok(cernText(html).includes(e.quote));
});
test("does not infer ambiguous dates or trust unrelated and conflicting links", () => {
  const r = parseCernDetail({ ...page, html: html.replace("25/11/2027", "01/11/2027").replace("jobs.smartrecruiters.com/oneclick-ui/company/CERN/", "jobs.smartrecruiters.com.evil.example/oneclick-ui/company/CERN/") })!; assert.equal(r.deadline, null); assert.equal(r.deadlineStatus, "ambiguous"); assert.equal(r.applicationUrl, null);
  assert.equal(parseCernDetail({ ...page, url: "https://evil.example/jobs/internship/" }), null);
  const invalid = parseCernDetail({ ...page, html: html.replace("25/11/2027", "31/11/2027") })!; assert.equal(invalid.deadlineStatus, "ambiguous");
});
